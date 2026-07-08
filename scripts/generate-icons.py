#!/usr/bin/env python3
"""Generate Deep Switch icons from the user-provided source PNG.

Source: a 640x640 PNG with a colored (DeepSeek blue) background and a
black whale silhouette.

Outputs:
- App / Dock icon: the source PNG scaled with a small transparent margin.
  macOS applies its own squircle mask at render time.
- Tray icons: pure silhouette, recolored to brand blue (template variants
  are produced in black for macOS dark-mode handling).
- Sidebar icons: silhouette on transparent — white for dark backgrounds,
  black for light backgrounds (selected via prefers-color-scheme in JSX).
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

# Original whale silhouette source (640x640, blue background + black silhouette)
PNG_SRC = ROOT / "public" / "icons" / "deepseek-user.png"
PNG_SRC_USER = Path("/Users/sky/Downloads/deepseek.png")

# Use the source PNG verbatim as the app icon — no custom frame, no crop.
# macOS automatically applies its own squircle mask when rendering the icon
# in Finder / Dock / app switcher. Keep a small transparent margin so the
# whale isn't clipped at the rounded corners.
SOURCE_PADDING = 0.06  # 6% transparent margin on each side


def extract_silhouette(src: Image.Image) -> Image.Image:
    """Take the user-provided PNG and return a pure-black-on-transparent whale.

    The source PNG has a colored background (e.g. #4D6BFE blue) and a black
    whale silhouette. We invert-by-luminance so dark pixels (the whale)
    become the foreground alpha mask.
    """
    rgb = src.convert("RGBA")
    gray = rgb.convert("L")
    mask = Image.eval(gray, lambda v: 255 - v)
    out = Image.new("RGBA", rgb.size, (0, 0, 0, 0))
    out.paste(rgb, (0, 0), mask)
    return out


def render_dock_icon(size: int, source: Image.Image) -> Image.Image:
    """Render the dock/app icon by scaling the source PNG with a small margin.

    The source already contains the correct artwork (blue background + black
    whale silhouette). We do not recolor, frame, or silhouette-extract — the
    squircle mask is applied by macOS at render time.
    """
    inner = int(round(size * (1 - 2 * SOURCE_PADDING)))
    scaled = source.convert("RGBA").resize((inner, inner), Image.LANCZOS)

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = (size - inner) // 2
    out.paste(scaled, (offset, offset), scaled)
    return out


def render_tray_icon(size: int, whale_src: Image.Image, template: bool = False) -> Image.Image:
    """Tray icon: silhouette only, no frame."""
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    whale = whale_src.resize((size, size), Image.LANCZOS)
    if template:
        gray = whale.convert("L")
        black = Image.new("RGBA", (size, size), (0, 0, 0, 255))
        out.paste(black, (0, 0), gray)
    else:
        # Re-color silhouette to brand blue
        colored = Image.new("RGBA", (size, size), (77, 107, 254, 255))
        alpha = whale.convert("L")
        out.paste(colored, (0, 0), alpha)
    return out


def render_sidebar_icon(size: int, whale_src: Image.Image, white: bool = False) -> Image.Image:
    """Sidebar logo: silhouette on transparent (no frame).

    Default: black silhouette (for dark backgrounds).
    white=True: white silhouette (for light backgrounds).
    """
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    whale = whale_src.resize((size, size), Image.LANCZOS)
    if white:
        # Re-color the whale to pure white, keeping its alpha mask
        recolored = Image.new("RGBA", whale.size, (255, 255, 255, 255))
        recolored.putalpha(whale.split()[-1])
        out.paste(recolored, (0, 0), recolored)
    else:
        out.paste(whale, (0, 0), whale)
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

    src_path = PNG_SRC_USER if PNG_SRC_USER.exists() else PNG_SRC
    if not src_path.exists():
        print(f"[generate-icons] Missing whale PNG: {src_path}", file=sys.stderr)
        return 1
    print(f"[generate-icons] source: {src_path}")

    raw = Image.open(src_path).convert("RGBA")

    # Extract just the silhouette (black whale on transparent) for tray + sidebar.
    whale_src = extract_silhouette(raw)
    whale_src.save(PUBLIC_ICONS / "deepseek-user.png")
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek-user.png'}")

    # App icon (used for .icns and the large `deepseek-dock.png`) uses the
    # source PNG verbatim — macOS applies its own squircle mask at render time.
    for size in (256, 512, 1024):
        img = render_dock_icon(size, raw)
        if size == 256:
            path = PUBLIC_ICONS / "deepseek-dock.png"
            img.save(path)
            print(f"[generate-icons] wrote {path}")
            path = PUBLIC_ICONS / "deepseek-dock-256.png"
        else:
            path = PUBLIC_ICONS / f"deepseek-dock-{size}.png"
        img.save(path)
        print(f"[generate-icons] wrote {path}")

    # White silhouette for dark sidebar background (default)
    sidebar_white = render_sidebar_icon(64, whale_src, white=True)
    sidebar_white.save(PUBLIC_ICONS / "deepseek-sidebar.png")
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek-sidebar.png'} (white, for dark bg)")

    # Black silhouette for light sidebar background (prefers-color-scheme: light)
    sidebar_black = render_sidebar_icon(64, whale_src, white=False)
    sidebar_black.save(PUBLIC_ICONS / "deepseek-sidebar-dark.png")
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek-sidebar-dark.png'} (black, for light bg)")

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

    render_tray_icon(44, whale_src, template=True).save(
        PUBLIC_ICONS / "deepseek-tray-template-44.png"
    )
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek-tray-template-44.png'}")

    master1024 = render_dock_icon(1024, raw)
    create_iconset(master1024, ICONSET)
    build_icns(ICONSET, BUILD / "icon.icns")
    print(f"[generate-icons] wrote {BUILD / 'icon.icns'}")
    shutil.copy(BUILD / "icon.icns", PUBLIC_ICONS / "deepseek.icns")
    print(f"[generate-icons] wrote {PUBLIC_ICONS / 'deepseek.icns'}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
