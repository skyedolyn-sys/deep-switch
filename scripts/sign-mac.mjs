#!/usr/bin/env node
/**
 * sign-mac.mjs — apply hardened-runtime ad-hoc signature to the Tauri
 * .app bundle and re-package the dmg with the signed app, so macOS
 * Sequoia 15+ doesn't kill the WKWebView subprocess on launch.
 *
 * Background: an unsigned Tauri build (`tauri build`) produces a bundle
 * signed with `codesign --sign -` (ad-hoc) but WITHOUT the hardened
 * runtime flag. macOS Sequoia treats unsigned WKWebView subprocesses as
 * untrusted and kills the "web content process" within ~50ms of window
 * creation — the symptom is a black window with a normal-looking log
 * (`viewDidMoveToWindow` etc.) but the renderer never loads.
 *
 * This script:
 *  1. Re-signs the .app with `--options runtime` (forces hardened
 *     runtime on the WKWebView helper too via --deep).
 *  2. Re-creates the dmg from the signed .app so the release asset
 *     matches what users will actually run.
 *
 * No Developer ID is required — ad-hoc signing is enough.
 *
 * Reference: https://developer.apple.com/forums/thread/114456
 */
import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BUNDLE_DIR = join(ROOT, 'src-tauri', 'target', 'release', 'bundle');
const APP_PATH = join(BUNDLE_DIR, 'macos', 'deep-switch.app');
const DMG_PATH = join(BUNDLE_DIR, 'dmg', 'deep-switch_0.1.0_aarch64.dmg');

if (!existsSync(APP_PATH) || !statSync(APP_PATH).isDirectory()) {
  console.error(`✗ app bundle not found at ${APP_PATH}`);
  console.error('  run `npm run build:renderer && npm run tauri build` first');
  process.exit(1);
}

console.log(`▸ Re-signing ${APP_PATH} with hardened runtime`);

// `--force` replaces any prior signature. `--deep` propagates to all
// nested binaries (WKWebView helper, frameworks). `--sign -` is ad-hoc.
// `--options runtime` enables the hardened runtime (required for the
// WKWebView subprocess to be trusted on Sequoia 15+). `--timestamp=none`
// skips the secure timestamp service — safe for ad-hoc.
const signCmd = [
  'codesign',
  '--force',
  '--deep',
  '--sign',
  '-',
  '--options',
  'runtime',
  '--timestamp=none',
  `"${APP_PATH}"`,
].join(' ');

try {
  execSync(signCmd, { stdio: 'inherit' });
} catch (err) {
  console.error(`✗ codesign failed: ${err.message}`);
  process.exit(1);
}

console.log('✓ Signed successfully');

// Verify
const verifyCmd = `codesign -dv "${APP_PATH}" 2>&1`;
try {
  const out = execSync(verifyCmd, { encoding: 'utf8' });
  if (!out.includes('runtime')) {
    console.error('✗ verification failed — hardened runtime flag not present');
    console.error('  codesign output:');
    console.error(out);
    process.exit(1);
  }
} catch (err) {
  console.error(`✗ codesign verify failed: ${err.message}`);
  process.exit(1);
}

console.log('▸ Re-packing signed .app into a fresh .dmg via hdiutil');

const TMP_MOUNT = '/tmp/deep-switch-dmg-mount';
execSync(`rm -rf "${TMP_MOUNT}" && mkdir -p "${TMP_MOUNT}"`);

const READ_ONLY_DMG = DMG_PATH + '.readonly';
execSync(`hdiutil convert -format UDRO -o "${READ_ONLY_DMG}" "${DMG_PATH}"`, { stdio: 'inherit' });

let mounted = false;
try {
  execSync(`hdiutil attach -nobrowse -mountpoint "${TMP_MOUNT}" "${READ_ONLY_DMG}"`, { stdio: 'inherit' });
  mounted = true;

  // The mounted volume contains a deep-switch.app — re-sign it in place
  // (covers edge cases where Tauri signs the inner app differently than
  // the outer .app on disk).
  const innerApp = join(TMP_MOUNT, 'deep-switch.app');
  if (!existsSync(innerApp)) {
    throw new Error(`inner .app not found at ${innerApp}`);
  }
  execSync(
    `codesign --force --deep --sign - --options runtime --timestamp=none "${innerApp}"`,
    { stdio: 'inherit' },
  );

  // Build a fresh dmg with the signed app at the same path
  const OUT_DMG = join(BUNDLE_DIR, 'dmg', 'deep-switch_0.1.0_aarch64.dmg.new');
  execSync(`rm -f "${OUT_DMG}"`);
  execSync(
    `hdiutil create -volname "deep-switch" -srcfolder "${TMP_MOUNT}" -ov -format UDZO "${OUT_DMG}"`,
    { stdio: 'inherit' },
  );
  execSync(`mv "${OUT_DMG}" "${DMG_PATH}"`);
  console.log('✓ Re-packaged dmg');
} finally {
  if (mounted) {
    try { execSync(`hdiutil detach "${TMP_MOUNT}"`, { stdio: 'ignore' }); } catch {}
  }
  try { execSync(`rm -rf "${TMP_MOUNT}" "${READ_ONLY_DMG}"`); } catch {}
}

if (!existsSync(DMG_PATH)) {
  console.error(`✗ expected dmg not found at ${DMG_PATH} after repack`);
  process.exit(1);
}

const sha = execSync(`shasum -a 256 "${DMG_PATH}"`, { encoding: 'utf8' });
console.log(`✓ Re-packaged: ${sha.trim()}`);

console.log('');
console.log('Release ready. To publish:');
console.log('  gh release upload v0.1.0 \\');
console.log(`    "${DMG_PATH}" --clobber`);
console.log('');
console.log('Or just re-run `npm run build:mac` from a clean clone.');
