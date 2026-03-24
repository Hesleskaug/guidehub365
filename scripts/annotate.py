#!/usr/bin/env python3

import argparse
import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw

def draw_arrow(draw, x, y, size=60):
    """
    Draw a clean red arrow at coordinates (x, y).

    Elements:
    - Outer glow rings (light red, semi-transparent)
    - Red dot at tip
    - Shaft line
    - V-arrowhead at tail
    """
    # Color definitions
    glow_color = (255, 100, 100, 80)      # Light red, semi-transparent
    dot_color = (220, 0, 0, 255)          # Bright red for dot
    arrow_color = (200, 0, 0, 255)        # Red for shaft and head

    # Draw outer glow rings
    glow_radius = size // 2
    for i in range(3, 0, -1):
        alpha = int(80 * (1 - i / 4))
        glow = (255, 100, 100, alpha)
        draw.ellipse(
            [(x - i * 8, y - i * 8), (x + i * 8, y + i * 8)],
            outline=glow,
            width=2
        )

    # Draw dot at tip
    dot_radius = 6
    draw.ellipse(
        [(x - dot_radius, y - dot_radius), (x + dot_radius, y + dot_radius)],
        fill=dot_color,
        outline=(150, 0, 0, 255),
        width=2
    )

    # Draw shaft line downward
    shaft_length = size
    shaft_x2 = x
    shaft_y2 = y + shaft_length
    draw.line([(x, y), (shaft_x2, shaft_y2)], fill=arrow_color, width=3)

    # Draw V-arrowhead at tail
    arrow_width = 12
    arrow_height = 15
    points = [
        (shaft_x2 - arrow_width / 2, shaft_y2 - arrow_height),  # Left point
        (shaft_x2, shaft_y2),                                     # Bottom point
        (shaft_x2 + arrow_width / 2, shaft_y2 - arrow_height)   # Right point
    ]
    draw.polygon(points, fill=arrow_color, outline=(150, 0, 0, 255))


def annotate_screenshot(image_path, coords_path, dry_run=False):
    """
    Annotate a screenshot with a red arrow at coordinates.
    Saves original as .raw.png before overwriting.
    """
    try:
        # Read coordinates
        with open(coords_path, 'r') as f:
            coords = json.load(f)

        x = coords.get('x')
        y = coords.get('y')

        if x is None or y is None:
            print(f"  ⚠ Skipped: No valid coordinates in {coords_path}")
            return False

        # Load image
        img = Image.open(image_path)
        img_rgb = img.convert('RGBA')

        # Save original as .raw.png
        raw_path = image_path.replace('.png', '.raw.png')
        if not dry_run and not os.path.exists(raw_path):
            img.save(raw_path)
            print(f"  → Saved original: {raw_path}")

        # Draw arrow
        draw = ImageDraw.Draw(img_rgb)
        draw_arrow(draw, x, y, size=60)

        # Save annotated image
        if not dry_run:
            img_rgb.save(image_path)
            print(f"  ✓ Annotated: {image_path}")
        else:
            print(f"  [DRY-RUN] Would annotate: {image_path}")

        return True
    except Exception as e:
        print(f"  ✗ Error: {image_path}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Annotate M365 guide screenshots with red arrows at click coordinates'
    )
    parser.add_argument(
        '--guide',
        type=str,
        help='Process only a specific guide (e.g., "out-of-office")'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )

    args = parser.parse_args()

    # Find screenshots directory
    script_dir = Path(__file__).parent
    screenshots_dir = script_dir.parent / 'public' / 'screenshots'

    if not screenshots_dir.exists():
        print(f"Error: Screenshots directory not found: {screenshots_dir}")
        sys.exit(1)

    # Find all .coords.json files in per-guide subfolders
    # Structure: public/screenshots/<guide-id>/<step-name>.coords.json
    if args.guide:
        pattern = f"{args.guide}/*.coords.json"
    else:
        pattern = "*/*.coords.json"

    coords_files = sorted(screenshots_dir.glob(pattern))

    if not coords_files:
        print(f"No coordinates files found matching: {pattern}")
        sys.exit(1)

    print(f"Processing {len(coords_files)} screenshot(s)...\n")

    success_count = 0
    for coords_file in coords_files:
        image_file = coords_file.with_suffix('.png')

        if not image_file.exists():
            print(f"  ⚠ Skipped: No image file for {coords_file.name}")
            continue

        if annotate_screenshot(str(image_file), str(coords_file), dry_run=args.dry_run):
            success_count += 1

    print(f"\n✓ Complete: {success_count}/{len(coords_files)} screenshots processed")


if __name__ == '__main__':
    main()
