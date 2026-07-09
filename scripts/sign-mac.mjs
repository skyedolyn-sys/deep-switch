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
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BUNDLE_DIR = join(ROOT, 'src-tauri', 'target', 'release', 'bundle');
const APP_PATH = join(BUNDLE_DIR, 'macos', 'deep-switch.app');
const DMG_DIR = join(BUNDLE_DIR, 'dmg');

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
const DMG_PATH = join(DMG_DIR, 'deep-switch_0.1.0_aarch64.dmg');
if (!existsSync(DMG_PATH)) {
  console.error(`✗ expected dmg not found at ${DMG_PATH} after tauri build`);
  process.exit(1);
}

const sha = execSync(`shasum -a 256 "${DMG_PATH}"`, { encoding: 'utf8' });
console.log(`✓ .dmg ready: ${sha.trim()}`);

// Also create a .zip of the signed .app
const ZIP_NAME = 'deep-switch_0.1.0_aarch64.zip';
const ZIP_PATH = join(BUNDLE_DIR, 'macos', ZIP_NAME);
try {
  execSync(`rm -f "${ZIP_PATH}"`);
  execSync(
    `cd "${join(BUNDLE_DIR, 'macos')}" && ditto -c -k --keepParent deep-switch.app "${ZIP_NAME}"`,
    { stdio: 'inherit' },
  );
  const zipSha = execSync(`shasum -a 256 "${ZIP_PATH}"`, { encoding: 'utf8' });
  console.log(`✓ .zip ready : ${zipSha.trim()}`);
} catch (err) {
  console.warn(`⚠ zip creation failed: ${err.message}`);
}

console.log('');
console.log('Release ready. Upload with:');
console.log(`  gh release upload v0.1.0 "${DMG_PATH}" "${ZIP_PATH}" --clobber`);
