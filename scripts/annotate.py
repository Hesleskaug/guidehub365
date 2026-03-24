#!/usr/bin/env python3
"""
annotate.py — GuideHub365 screenshot annotation tool
=====================================================
Reads verified click-coordinates from .coords.json files (produced by
take-screenshots.js) and draws a clean red arrow on each screenshot.

Because coordinates come from Playwright's real DOM bounding-boxes, the
arrow always points at exactly the right element — never guessed.

Usage:
    pip install pillow

    python scripts/annotate.py                    # annotate all guides
    python scripts/annotate.py --guide out-of-office  # one guide only
    python scripts/annotate.py --dry-run          # print what would happen

Input:  public/screenshots/<guide>/<step>.png
        public/screenshots/<guide>/<step>.coords.json
Output: public/screenshots/<guide>/<step>.png  (overwrites with annotated version)

The original unannotated screenshot is preserved as <step>.raw.png so you
can re-annotate at any time without re-running Playwright.
"""

import os, sys, json, math, argparse, shutil
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: pip install pillow")
    sys.exit(1)

SCRIPT_DIR    = Path(__file__).parent
REPO_ROOT     = SCRIPT_DIR.parent
SCREENSHOT_DIR = REPO_ROOT / "public" / "screenshots"

ARROW_COLOR = (220, 38, 38)     # red
ARROW_WIDTH = 5
HEAD_LEN    = 24
HEAD_ANGLE  = 0.40
TAIL_DIST   = 140               # pixels from tip to tail
GLOW_COLOR  = (254, 202, 202)


# ─── Font ─────────────────────────────────────────────────────────────────────

def load_font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for p in ([p for p in paths if ("Bold" in p) == bold] + paths):
        try: return ImageFont.truetype(p, size)
        except OSError: pass
    return ImageFont.load_default()


# ─── Arrow drawing ─────────────────────────────────────────────────────────────

def draw_arrow(img: Image.Image, cx: int, cy: int) -> Image.Image:
    """
    Draw a clean red arrow pointing at (cx, cy).
    Returns a new image with the annotation.
    """
    out = img.copy()
    draw = ImageDraw.Draw(out)
    W, H = img.size

    cx = max(20, min(W - 20, cx))
    cy = max(20, min(H - 60, cy))

    # Arrow tail direction: prefer upper-right, fall back to upper-left near right edge
    if cx + TAIL_DIST + 60 < W:
        dx, dy = 1.0, -1.0
    else:
        dx, dy = -1.0, -1.0
    mag = math.sqrt(dx*dx + dy*dy)
    dx /= mag; dy /= mag

    tx = int(cx + dx * TAIL_DIST)
    ty = int(cy + dy * TAIL_DIST)
    tx = max(40, min(W - 40, tx))
    ty = max(40, min(H - 60, ty))

    # Glow rings at click point
    for r, col in [(22, (255, 200, 200)), (14, (255, 150, 150))]:
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)

    # Solid red dot
    dot_r = 9
    draw.ellipse([cx-dot_r, cy-dot_r, cx+dot_r, cy+dot_r],
                 fill=ARROW_COLOR, outline=(255,255,255), width=2)

    # Shaft (starts at dot edge, ends at tail)
    shaft_angle = math.atan2(ty - cy, tx - cx)
    sx = int(cx + dot_r * math.cos(shaft_angle))
    sy = int(cy + dot_r * math.sin(shaft_angle))
    draw.line([(sx, sy), (tx, ty)], fill=ARROW_COLOR, width=ARROW_WIDTH)

    # V-shaped arrowhead at tail end
    back = math.atan2(cy - ty, cx - tx)
    for side in [HEAD_ANGLE, -HEAD_ANGLE]:
        hx = int(tx + HEAD_LEN * math.cos(back + side))
        hy = int(ty + HEAD_LEN * math.sin(back + side))
        draw.line([(tx, ty), (hx, hy)], fill=ARROW_COLOR, width=ARROW_WIDTH)

    return out


# ─── Core ──────────────────────────────────────────────────────────────────────

def annotate_step(png_path: Path, coords_path: Path, dry_run: bool) -> str:
    """
    Annotate one screenshot. Returns status string.
    """
    if not png_path.exists():
        return "SKIP (no png)"
    if not coords_path.exists():
        return "SKIP (no coords — run take-screenshots.js first)"

    with open(coords_path) as f:
        coords = json.load(f)

    cx, cy = coords.get("x"), coords.get("y")
    if cx is None or cy is None:
        return "SKIP (coords missing x/y)"

    if dry_run:
        return f"would annotate  click=({cx},{cy})"

    img = Image.open(png_path)

    # Keep unannotated original (only if not already saved)
    raw_path = png_path.with_suffix('.raw.png')
    if not raw_path.exists():
        shutil.copy2(png_path, raw_path)

    annotated = draw_arrow(img, cx, cy)
    annotated.save(png_path, "PNG", optimize=True)
    return f"OK  click=({cx},{cy})"


def run(guide_filter: str | None, dry_run: bool):
    guides = sorted([d for d in SCREENSHOT_DIR.iterdir() if d.is_dir()])
    if guide_filter:
        guides = [g for g in guides if g.name == guide_filter]
        if not guides:
            print(f"No guide directory found: {guide_filter}")
            print("Available: " + ", ".join(d.name for d in sorted(SCREENSHOT_DIR.iterdir()) if d.is_dir()))
            sys.exit(1)

    total_ok = total_skip = 0

    for guide_dir in guides:
        print(f"\n[{guide_dir.name}]")
        for png in sorted(guide_dir.glob("*.png")):
            if png.stem.endswith(".raw"):
                continue  # skip backup files
            coords = png.with_suffix(".coords.json")
            status = annotate_step(png, coords, dry_run)
            icon = "✓" if status.startswith("OK") else "·"
            print(f"  {icon} {png.stem}  {status}")
            if status.startswith("OK") or "would" in status:
                total_ok += 1
            else:
                total_skip += 1

    print(f"\n{'[dry-run] ' if dry_run else ''}Done: {total_ok} annotated, {total_skip} skipped")
    if total_skip > 0:
        print("Tip: Run 'node scripts/take-screenshots.js' to generate missing .coords.json files")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Annotate GuideHub365 screenshots with click arrows")
    p.add_argument("--guide", help="Only annotate this guide (e.g. out-of-office)")
    p.add_argument("--dry-run", action="store_true", help="Show what would happen without writing files")
    args = p.parse_args()
    run(args.guide, args.dry_run)
