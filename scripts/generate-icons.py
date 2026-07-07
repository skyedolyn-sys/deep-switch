#!/usr/bin/env python3
"""Generate Deep Switch macOS-style app icons (circular-arc version).

This is the previous version that matched Chrome's dock size:
- Canvas: 1024x1024
- Frame: 80.5% of canvas (824px), centered, white fill
- Corner radius: 160px circular arc
- Whale: 78% of canvas (640px), centered, using the user-provided silhouette
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_ICONS = ROOT / "public" / "icons"
BUILD = ROOT / "build"
ICONSET = BUILD / "iconset"

PNG_SRC = ROOT / "public" / "icons" / "deepseek-user.png"

FRAME_RATIO = 0.805
WHALE_RATIO = 0.64  # ~82% of the previous 0.78, whale shrunk slightly
CORNER_RATIO = 160 / 1024  # ~0.15625


def render_dock_icon(size: int, whale_src: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    frame_size = int(round(size * FRAME_RATIO))
    radius = int(round(frame_size * (160 / 824)))
    frame_x = (size - frame_size) // 2
    frame_y = (size - frame_size) // 2

    bg = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        (frame_x, frame_y, frame_x + frame_size, frame_y + frame_size),
        radius=radius,
        fill=255,
    )
    out.paste(bg, (0, 0), mask)

    whale_size = int(round(size * WHALE_RATIO))
    whale = whale_src.resize((whale_size, whale_size), Image.LANCZOS)
    whale_x = (size - whale_size) // 2
    whale_y = (size - whale_size) // 2
    out.paste(whale, (whale_x, whale_y), whale)
    return out


def render_tray_icon(size: int, whale_src: Image.Image, template: bool = False) -> Image.Image:
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    whale = whale_src.resize((size, size), Image.LANCZOS)
    if template:
        gray = whale.convert("L")
        black = Image.new("RGBA", (size, size), (0, 0, 0, 255))
        out.paste(black, (0, 0), gray)
    else:
        # Make silhouette blue for non-template tray icon.
        colored = Image.new("RGBA", (size, size), (77, 107, 254, 255))
        alpha = whale.convert("L")
        out.paste(colored, (0, 0), alpha)
    return out


def render_sidebar_icon(size: int, whale_src: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    corner = int(round(size * (160 / 1024)))
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size, size), radius=corner, fill=255)
    bg = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    out.paste(bg, (0, 0), mask)

    whale_size = int(round(size * 0.72))
    whale = whale_src.resize((whale_size, whale_size), Image.LANCZOS)
    whale_x = (size - whale_size) // 2
    whale_y = (size - whale_size) // 2

    # Blue silhouette
    colored = Image.new("RGBA", (whale_size, whale_size), (77, 107, 254, 255))
    alpha = whale.convert("L")
    out.paste(colored, (whale_x, whale_y), alpha)
    return out


def create_iconset(master1024: Image.Image, iconset_dir: Path) -> None:
    if iconset_dir.exists():
        shutil.rmtree(iconset_dir)
    iconset_dir.mkdir(parents=True)
    for s in (16, 32, 128, 256, 512):
        master1024.resize((s, s), Image.LANCZOS).save(iconset_dir / f"icon_{s}x{s}.png")
        master1024.resize((s * 2, s * 2), Image.LANCZOS).save(
            iconset_dir / f"icon_{s}x{s}@2x.png"
        )


def build_icns(iconset_dir: Path, output: Path) -> None:
    if output.exists():
        output.unlink()
    required = iconset_dir.with_suffix(".iconset")
    if iconset_dir != required:
        if required.exists():
            shutil.rmtree(required)
        shutil.move(str(iconset_dir), str(required))
        iconset_dir = required
    subprocess.run(["iconutil", "-c", "icns", str(iconset_dir)], check=True)
    generated = iconset_dir.with_suffix(".icns")
    if generated.exists():
        shutil.move(str(generated), str(output))
    final = iconset_dir.with_suffix("")
    if final.exists():
        shutil.rmtree(final)
    shutil.move(str(iconset_dir), str(final))


def main() -> int:
    PUBLIC_ICONS.mkdir(parents=True, exist_ok=True)
    BUILD.mkdir(parents=True, exist_ok=True)

    if not PNG_SRC.exists():
        print(f"[generate-icons] Missing whale PNG: {PNG_SRC}", file=sys.stderr)
        return 1

    whale_src = Image.open(PNG_SRC).convert("RGBA")

    for size in (256, 512, 1024):
        img = render_dock_icon(size, whale_src)
        if size == 256:
            path = PUBLIC_ICONS / "deepseek-dock.png"
            img.save(path)
            print(f"[generate-icons] wrote {path}")
            path = PUBLIC_ICONS / "deepseek-dock-256.png"
        else:
            path = PUBLIC_ICONS / f"deepseek-dock-{size}.png"
        img.save(path)
        print(f"[generate-icons] wrote {path}")

    sidebar = render_sidebar_icon(64, whale_src)
    sidebar.save(PUBLIC_ICONS / "deepseek-sidebar.png")
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek-sidebar.png'}")

    for size in (22, 44, 32):
        if size == 32:
            path = PUBLIC_ICONS / "deepseek-tray.png"
        else:
            path = PUBLIC_ICONS / f"deepseek-tray-{size}.png"
        render_tray_icon(size, whale_src, template=False).save(path)
        print(f"[generate-icons] wrote {path}")

    render_tray_icon(32, whale_src, template=True).save(
        PUBLIC_ICONS / "deepseek-tray-template.png"
    )
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek-tray-template.png'}")

    master1024 = render_dock_icon(1024, whale_src)
    create_iconset(master1024, ICONSET)
    build_icns(ICONSET, BUILD / "icon.icns")
    print(f"[generate-icons] wrote {BUILD / 'icon.icns'}")
    shutil.copy(BUILD / "icon.icns", PUBLIC_ICONS / "deepseek.icns")
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek.icns'}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
