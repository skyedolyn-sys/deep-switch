#!/bin/bash
# Build + ad-hoc-sign + DMG packaging for macOS.
# Used by both local dev and CI release workflow.

set -euo pipefail

cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version")
APP="dist/mac-arm64/Deep Switch.app"

# 0. Force-clean caches and stale outputs
echo ">>> [0/6] Cleaning caches and stale outputs…"
rm -rf dist
rm -rf ~/Library/Application\ Support/deep-switch/Cache 2>/dev/null || true
rm -rf ~/Library/Application\ Support/deep-switch/GPUCache 2>/dev/null || true
rm -rf ~/Library/Application\ Support/deep-switch/Code\ Cache 2>/dev/null || true
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf ~/.deep-switch/last-applied.flag 2>/dev/null || true

# 1. Regenerate icons from the user-provided source
echo ">>> [1/6] Regenerating icons…"
python3 scripts/generate-icons.py 2>&1 | tail -3

# 2. Build renderer + main
echo ">>> [2/6] Building main + renderer…"
npm run build

# 3. electron-builder packages .app (no Developer ID — ad-hoc only)
echo ">>> [3/6] Packaging .app…"
rm -rf dist/mac-arm64
npx electron-builder --mac --dir --publish never

if [[ ! -d "$APP" ]]; then
  echo "Error: $APP missing after electron-builder" >&2
  exit 1
fi

# 4. Re-sign with hardened runtime + entitlements
echo ">>> [4/6] Re-signing (hardened runtime + entitlements)…"
bash scripts/sign-mac.sh "$APP"

# 5. Build the DMG and zip from the signed .app
echo ">>> [5/6] Packaging DMG + zip…"

STAGE=$(mktemp -d)
mkdir -p "$STAGE/Deep Switch"
cp -R "$APP" "$STAGE/Deep Switch/"
ln -s /Applications "$STAGE/Deep Switch/Applications"

DMG_PATH="dist/Deep Switch-${VERSION}-arm64-resigned.dmg"
ZIP_PATH="dist/Deep Switch-${VERSION}-arm64-resigned-mac.zip"

rm -f "$DMG_PATH" "$ZIP_PATH"
hdiutil create -volname "Deep Switch" \
  -srcfolder "$STAGE/Deep Switch" \
  -ov -format UDZO \
  "$DMG_PATH"
ditto -c -k --sequesterRsrc --keepParent "$APP" "$ZIP_PATH"

rm -rf "$STAGE"

echo ""
echo ">>> [6/6] Done. Artifacts:"
ls -lh "$DMG_PATH" "$ZIP_PATH"
echo ""
echo "To verify signature inside the DMG:"
echo "  hdiutil attach '$DMG_PATH'"
echo "  codesign -dvv '/Volumes/Deep Switch/Deep Switch.app'"
echo "  hdiutil detach '/Volumes/Deep Switch'"