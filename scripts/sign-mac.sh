#!/bin/bash
# Deep Switch — post-build ad-hoc code signing
#
# Re-signs every Mach-O binary inside the .app bundle with hardened
# runtime and our entitlements. This is required because ad-hoc builds
# without proper signing cause Gatekeeper rejection + occasional
# crashes on macOS Sonoma/Sequoia.
#
# Run after `electron-builder` and before packaging the DMG.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-.app>" >&2
  exit 1
fi

APP="$1"
ENTITLEMENTS="$(dirname "$0")/../build/entitlements.mac.plist"

if [[ ! -d "$APP" ]]; then
  echo "Error: $APP is not a directory" >&2
  exit 1
fi

if [[ ! -f "$ENTITLEMENTS" ]]; then
  echo "Error: $ENTITLEMENTS missing" >&2
  exit 1
fi

# Find every Mach-O and helper app that needs signing
BINARIES=()
while IFS= read -r -d '' f; do
  BINARIES+=("$f")
done < <(find "$APP" -type f \( -name "*.node" -o -name "*.dylib" \) -print0)

EXES=()
while IFS= read -r -d '' f; do
  EXES+=("$f")
done < <(find "$APP" -type f -perm +111 -print0)

HELPERS=()
while IFS= read -r -d '' f; do
  HELPERS+=("$f")
done < <(find "$APP" -name "*.app" -print0)

echo "Found:"
echo "  ${#BINARIES[@]} dylibs / .node"
echo "  ${#EXES[@]} executables"
echo "  ${#HELPERS[@]} helper apps"

# Sign in reverse order (deepest first): dylibs/nodes → helpers → main app
SIGN_FLAGS=(--force --sign - --options runtime --entitlements "$ENTITLEMENTS" --timestamp=none)

for f in "${BINARIES[@]}"; do
  codesign "${SIGN_FLAGS[@]}" "$f"
done
for f in "${HELPERS[@]}"; do
  codesign "${SIGN_FLAGS[@]}" "$f"
done
codesign "${SIGN_FLAGS[@]}" "$APP"

echo "Signed: $APP"
codesign -dvv "$APP" | head -8
