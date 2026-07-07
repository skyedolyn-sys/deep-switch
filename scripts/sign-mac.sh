#!/bin/bash
# Deep Switch — post-build ad-hoc code signing
#
# Ad-hoc signs the entire .app bundle for users running unsigned
# downloads. Uses --deep to walk into nested .app bundles and frameworks
# so sealed resources match what Gatekeeper expects.
#
# This is **not** a replacement for a real Developer ID — ad-hoc signed
# apps still trigger the "Deep Switch is damaged" prompt on first launch
# unless the user runs:
#   sudo xattr -dr com.apple.quarantine "/Applications/Deep Switch.app"
# But once cleared, the binary runs cleanly (no crash from missing
# hardened runtime entitlements).
#
# Run after `electron-builder` and before packaging the DMG.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-.app>" >&2
  exit 1
fi

APP="$1"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
ENTITLEMENTS="$HERE/build/entitlements.mac.plist"

if [[ ! -d "$APP" ]]; then
  echo "Error: $APP is not a directory" >&2
  exit 1
fi

if [[ ! -f "$ENTITLEMENTS" ]]; then
  echo "Error: $ENTITLEMENTS missing" >&2
  exit 1
fi

# ─── Strip empty .lproj dirs that ship with Electron ───────────────
EMPTY_LPROJ=$(find "$APP/Contents/Resources/" -mindepth 1 -maxdepth 1 -type d -empty 2>/dev/null | wc -l | tr -d ' ')
if [[ "$EMPTY_LPROJ" -gt 0 ]]; then
  find "$APP/Contents/Resources/" -mindepth 1 -maxdepth 1 -type d -empty -delete
  echo "  removed $EMPTY_LPROJ empty .lproj dirs"
fi

# ─── Strip any prior signatures ─────────────────────────────────────
find "$APP" -name "_CodeSignature" -type d -exec rm -rf {} + 2>/dev/null || true
codesign --remove-signature --deep "$APP" 2>/dev/null || true

# ─── Sign with --deep (walks into nested bundles) ───────────────────
echo "Signing $APP (ad-hoc + hardened runtime + entitlements)…"
codesign --force --deep --sign - \
  --options runtime \
  --entitlements "$ENTITLEMENTS" \
  --timestamp=none \
  "$APP"

# ─── Verify ─────────────────────────────────────────────────────────
echo ""
echo "Signature verification:"
codesign -dvv "$APP" 2>&1 | sed 's/^/  /'

echo ""
echo "spctl assessment (expected: 'rejected' for ad-hoc, since no Developer ID):"
spctl -a -vv -t install "$APP" 2>&1 | sed 's/^/  /' || true