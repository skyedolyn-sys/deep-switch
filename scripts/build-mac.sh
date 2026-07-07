#!/bin/bash
# Build + ad-hoc-sign + DMG packaging for macOS.
# Used by both local dev and CI release workflow.

set -euo pipefail

cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version")
APP="dist/mac-arm64/Deep Switch.app"

# 1. Build renderer + main
echo ">>> [1/4] Building..."
npm run build

# 2. electron-builder packages .app
echo ">>> [2/4] Packaging .app..."
rm -rf dist/mac-arm64
npx electron-builder --mac --dir --publish never

if [[ ! -d "$APP" ]]; then
  echo "Error: $APP missing after electron-builder" >&2
  exit 1
fi

# 3. Re-sign everything inside the .app with hardened runtime + entitlements
echo ">>> [3/4] Re-signing (hardened runtime + entitlements)..."
bash scripts/sign-mac.sh "$APP"

# 4. Build the DMG and zip from the signed .app
echo ">>> [4/4] Packaging DMG + zip..."

# Make a clean staging folder so the DMG contents are tidy
STAGE=$(mktemp -d)
mkdir -p "$STAGE/Deep Switch"
cp -R "$APP" "$STAGE/Deep Switch/"
ln -s /Applications "$STAGE/Deep Switch/Applications"

DMG_PATH="dist/Deep Switch-${VERSION}-arm64.dmg"
ZIP_PATH="dist/Deep Switch-${VERSION}-arm64-mac.zip"

rm -f "$DMG_PATH" "$ZIP_PATH"
hdiutil create -volname "Deep Switch" \
  -srcfolder "$STAGE/Deep Switch" \
  -ov -format UDZO \
  "$DMG_PATH"
ditto -c -k --sequesterRsrc --keepParent "$APP" "$ZIP_PATH"

rm -rf "$STAGE"

echo ""
echo ">>> Built:"
ls -la "$DMG_PATH" "$ZIP_PATH"
echo ""
echo "To verify signature inside the DMG:"
echo "  hdiutil attach '$DMG_PATH'"
echo "  codesign -dvv '/Volumes/Deep Switch/Deep Switch.app'"
echo "  hdiutil detach '/Volumes/Deep Switch'"