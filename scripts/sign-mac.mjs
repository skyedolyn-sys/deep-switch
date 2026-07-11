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
 *  3. Creates a .zip of the signed .app for users who prefer zip.
 *
 * No Developer ID is required — ad-hoc signing is enough.
 *
 * Reference: https://developer.apple.com/forums/thread/114456
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BUNDLE_DIR = join(ROOT, 'src-tauri', 'target', 'release', 'bundle');
const APP_PATH = join(BUNDLE_DIR, 'macos', 'deep-switch.app');
const DMG_DIR = join(BUNDLE_DIR, 'dmg');

// Version drives the artifact filenames — read it from tauri.conf.json so a
// release never ships 0.1.0-named files for a 0.1.1 build again.
const VERSION = JSON.parse(readFileSync(join(ROOT, 'src-tauri', 'tauri.conf.json'), 'utf8')).version;
const ARTIFACT_BASE = `deep-switch_${VERSION}_aarch64`;

if (!existsSync(APP_PATH) || !statSync(APP_PATH).isDirectory()) {
  console.error(`✗ app bundle not found at ${APP_PATH}`);
  console.error('  run `npm run build:renderer && npm run tauri build` first');
  process.exit(1);
}

console.log(`▸ Re-signing ${APP_PATH} with hardened runtime`);

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
try {
  const out = execSync(`codesign -dv "${APP_PATH}" 2>&1`, { encoding: 'utf8' });
  if (!out.includes('runtime')) {
    console.error('✗ verification failed — hardened runtime flag not present');
    process.exit(1);
  }
} catch (err) {
  console.error(`✗ codesign verify failed: ${err.message}`);
  process.exit(1);
}

// Remove existing broken DMGs (from previous failed script runs)
try { execSync(`rm -f "${DMG_DIR}"/*.readonly "${DMG_DIR}"/*.new.dmg`); } catch {}
console.log('▸ Re-bundling DMG via tauri build (skips Rust recompilation)');
try {
  execSync(`npx tauri build 2>&1 | tail -5`, { stdio: 'inherit', timeout: 120000 });
} catch {
  console.warn('⚠ tauri build returned non-zero; DMG may already exist from earlier run.');
}

// Look for the DMG (name depends on Tauri version)
const DMG_PATH = join(DMG_DIR, `${ARTIFACT_BASE}.dmg`);
if (!existsSync(DMG_PATH)) {
  console.error(`✗ expected dmg not found at ${DMG_PATH} after tauri build`);
  process.exit(1);
}

// Rebuild the DMG with first-run rescue tools inside: Gatekeeper on
// macOS 15+ mislabels this ad-hoc-signed, non-notarized app as "damaged",
// so ship a double-clickable `.command` script + bilingual guide next to
// the app. The user drags the app to Applications, and if blocked, runs
// the script — no Terminal typing required.
console.log('▸ Rebuilding DMG with Gatekeeper rescue tools inside');
const EXTRAS_DIR = join(ROOT, 'scripts', 'dmg-extras');
const STAGING = join(DMG_DIR, 'staging');
try {
  execSync(`rm -rf "${STAGING}" && mkdir -p "${STAGING}"`);
  execSync(`cp -R "${APP_PATH}" "${STAGING}/"`);
  execSync(`cp -R "${EXTRAS_DIR}/." "${STAGING}/"`);
  execSync(`ln -sfn /Applications "${STAGING}/Applications"`);
  execSync(`rm -f "${DMG_PATH}"`);
  execSync(
    `hdiutil create -volname "deep-switch" -srcfolder "${STAGING}" -ov -format UDZO "${DMG_PATH}"`,
    { stdio: 'inherit' },
  );
  execSync(`rm -rf "${STAGING}"`);
  console.log('✓ DMG rebuilt with rescue tools');
} catch (err) {
  console.warn(`⚠ DMG rebuild with extras failed (falling back to plain dmg): ${err.message}`);
}

const sha = execSync(`shasum -a 256 "${DMG_PATH}"`, { encoding: 'utf8' });
console.log(`✓ .dmg ready: ${sha.trim()}`);

// Also create a .zip of the signed .app (with the same rescue tools inside,
// since zip downloads hit the identical Gatekeeper path). Built with Python's
// zipfile so the Chinese filenames are stored as UTF-8 (the macOS `zip` CLI
// on this system can't set the UTF-8 flag and garbles them) and the
// executable bit on the .command script survives.
const ZIP_NAME = `${ARTIFACT_BASE}.zip`;
const ZIP_PATH = join(BUNDLE_DIR, 'macos', ZIP_NAME);
try {
  execSync(`rm -f "${ZIP_PATH}"`);
  const pyScript = join(DMG_DIR, 'make-zip.py');
  const py = [
    'import os, zipfile',
    `staging = ${JSON.stringify(join(BUNDLE_DIR, 'macos'))}`,
    "app = os.path.join(staging, 'deep-switch.app')",
    `extras = ${JSON.stringify(EXTRAS_DIR)}`,
    `out = ${JSON.stringify(ZIP_PATH)}`,
    "with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:",
    '    for root, dirs, files in os.walk(app):',
    '        for f in files:',
    '            p = os.path.join(root, f)',
    '            z.write(p, os.path.relpath(p, staging))',
    '    for f in os.listdir(extras):',
    '        p = os.path.join(extras, f)',
    '        if os.path.isfile(p):',
    '            z.write(p, f)',
    "print('zip written')",
    '',
  ].join('\n');
  execSync(`cat > "${pyScript}" << 'PYEOF'\n${py}PYEOF`);
  execSync(`python3 "${pyScript}"`, { stdio: 'inherit' });
  execSync(`rm -f "${pyScript}"`);
  const zipSha = execSync(`shasum -a 256 "${ZIP_PATH}"`, { encoding: 'utf8' });
  console.log(`✓ .zip ready : ${zipSha.trim()}`);
} catch (err) {
  console.warn(`⚠ zip creation failed: ${err.message}`);
}

console.log('');
console.log('Release ready. Upload with:');
console.log(`  gh release upload v${VERSION} "${DMG_PATH}" "${ZIP_PATH}" --clobber`);
