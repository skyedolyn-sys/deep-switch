#!/bin/bash
# Deep Switch — 解除 macOS 安全限制 / Remove macOS Gatekeeper quarantine
#
# 为什么需要这个 / Why this is needed:
# Deep Switch 目前没有 Apple 公证（notarization），macOS 15+ 会把从网上下载的
# 应用误报为「已损坏」。这个脚本会清除系统的隔离标记，之后即可正常打开。
# Deep Switch is ad-hoc signed but not Apple-notarized, so macOS 15+ reports the
# freshly downloaded app as "damaged". This script clears the quarantine flag;
# the app then opens normally.

set -e

echo ""
echo "  Deep Switch — 解除限制 / Remove Quarantine"
echo "  ────────────────────────────────────────────"

# 优先处理已拖入「应用程序」的副本；否则处理 dmg 里的副本
# Prefer the copy in /Applications; fall back to the one inside this dmg.
if [ -d "/Applications/deep-switch.app" ]; then
  TARGET="/Applications/deep-switch.app"
else
  TARGET="$(dirname "$0")/deep-switch.app"
fi

if [ ! -d "$TARGET" ]; then
  echo "  ✗ 未找到 deep-switch.app。请先把应用拖进「应用程序」文件夹再运行本脚本。"
  echo "  ✗ deep-switch.app not found. Drag it into Applications first, then run me again."
  exit 1
fi

xattr -cr "$TARGET"

echo "  ✓ 已解除限制：$TARGET"
echo "  ✓ Quarantine removed from: $TARGET"
echo ""
echo "  现在可以正常打开 Deep Switch 了。"
echo "  You can now open Deep Switch normally."
echo ""
