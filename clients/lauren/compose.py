#!/usr/bin/env python3
"""
Lauren Compositor — generates composite artwork from composition.json.

Usage:
    python3 compose.py                     # Full res (28800x16200)
    python3 compose.py --preview           # 1/10 scale quick check
    python3 compose.py --scale 2           # 2x for deeper zoom (57600x32400)
    python3 compose.py --config other.json # Use a different config file
    python3 compose.py --no-tile           # Skip DZI tiling step

Requires: Pillow, numpy. Optional: pyvips (for tiling).
"""

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).parent
ORIGINALS = ROOT / "originals"
TRANSPARENT = ROOT / "transparent"
TILES_DIR = ROOT / "tiles"


def load_config(path):
    with open(path) as f:
        data = json.load(f)
    assert data.get("version") == 1, "Unsupported config version"
    return data


def remove_background_threshold(img_array, bg_color, threshold):
    """Remove background by color distance thresholding with smooth falloff."""
    rgb = img_array[:, :, :3].astype(np.float32)
    bg = np.array(bg_color, dtype=np.float32)
    dist = np.sqrt(np.sum((rgb - bg) ** 2, axis=2))

    inner = threshold * 0.6
    alpha = np.where(
        dist < inner,
        0.0,
        np.where(dist < threshold, (dist - inner) / (threshold - inner), 1.0),
    )
    alpha = (alpha * 255).astype(np.uint8)

    result = np.zeros((*img_array.shape[:2], 4), dtype=np.uint8)
    result[:, :, :3] = img_array[:, :, :3]
    result[:, :, 3] = alpha
    return result


def composite_layer(canvas, layer_img, x, y):
    """Alpha-composite layer_img onto canvas at (x, y)."""
    ch, cw = canvas.shape[:2]
    lh, lw = layer_img.shape[:2]

    # Compute overlap region
    sx = max(0, -x)
    sy = max(0, -y)
    dx = max(0, x)
    dy = max(0, y)
    ow = min(lw - sx, cw - dx)
    oh = min(lh - sy, ch - dy)

    if ow <= 0 or oh <= 0:
        return

    src = layer_img[sy : sy + oh, sx : sx + ow].astype(np.float32)
    dst = canvas[dy : dy + oh, dx : dx + ow].astype(np.float32)

    src_a = src[:, :, 3:4] / 255.0
    dst_a = dst[:, :, 3:4] / 255.0

    out_a = src_a + dst_a * (1 - src_a)
    safe = out_a > 0
    out_rgb = np.where(
        safe, (src[:, :, :3] * src_a + dst[:, :, :3] * dst_a * (1 - src_a)) / np.where(safe, out_a, 1), 0
    )

    canvas[dy : dy + oh, dx : dx + ow, :3] = out_rgb.astype(np.uint8)
    canvas[dy : dy + oh, dx : dx + ow, 3] = (out_a[:, :, 0] * 255).astype(np.uint8)


def main():
    parser = argparse.ArgumentParser(description="Composite Lauren's artwork layers")
    parser.add_argument("--config", default="composition.json", help="Config file path")
    parser.add_argument("--preview", action="store_true", help="1/10 scale preview")
    parser.add_argument("--scale", type=float, default=1.0, help="Output scale multiplier")
    parser.add_argument("--no-tile", action="store_true", help="Skip DZI tiling")
    parser.add_argument("--output", default=None, help="Output filename (default: auto)")
    args = parser.parse_args()

    config_path = ROOT / args.config
    if not config_path.exists():
        print(f"Config not found: {config_path}")
        print("Run the editor and save composition.json first.")
        sys.exit(1)

    data = load_config(config_path)
    canvas_w = data["canvas"]["width"]
    canvas_h = data["canvas"]["height"]
    layer_configs = data["layers"]

    # Compute effective scale
    scale = args.scale
    if args.preview:
        scale = 0.1

    out_w = round(canvas_w * scale)
    out_h = round(canvas_h * scale)
    print(f"Output: {out_w} x {out_h} (scale={scale})")

    # Create canvas (RGBA)
    canvas = np.zeros((out_h, out_w, 4), dtype=np.uint8)
    # White background
    canvas[:, :, :3] = 255
    canvas[:, :, 3] = 255

    # Sort by zIndex
    sorted_layers = sorted(layer_configs, key=lambda l: l["zIndex"])

    for i, lc in enumerate(sorted_layers):
        if not lc["visible"]:
            continue

        layer_id = lc["id"]
        filename = lc["filename"]
        bg_mode = lc.get("bgMode", "threshold")
        opacity = lc.get("opacity", 1.0)

        print(f"  [{i+1}/{len(sorted_layers)}] Layer {layer_id} ({bg_mode})...", end=" ", flush=True)

        # Load image
        if bg_mode == "ai":
            png_name = filename.replace(".jpg", ".png")
            img_path = TRANSPARENT / png_name
            if not img_path.exists():
                print("transparent PNG not found, falling back to threshold")
                img_path = ORIGINALS / filename
                bg_mode = "threshold"
        else:
            img_path = ORIGINALS / filename

        if not img_path.exists():
            print(f"MISSING: {img_path}")
            continue

        img = Image.open(img_path)
        if img.mode == "RGB":
            img = img.convert("RGBA")
        elif img.mode != "RGBA":
            img = img.convert("RGBA")

        # Scale the layer
        layer_scale = lc.get("scale", 1.0) * scale
        new_w = round(img.width * layer_scale)
        new_h = round(img.height * layer_scale)

        if new_w <= 0 or new_h <= 0:
            print("too small, skipping")
            continue

        img_resized = img.resize((new_w, new_h), Image.LANCZOS)
        img_array = np.array(img_resized)

        # Apply background removal
        if bg_mode == "threshold":
            bg_color = lc.get("bgColor", [255, 255, 255])
            threshold = lc.get("threshold", 200)
            img_array = remove_background_threshold(img_array, bg_color, threshold)

        # Apply opacity
        if opacity < 1.0:
            img_array[:, :, 3] = (img_array[:, :, 3].astype(np.float32) * opacity).astype(np.uint8)

        # Position on canvas
        cx = round(lc["x"] * scale)
        cy = round(lc["y"] * scale)

        composite_layer(canvas, img_array, cx, cy)
        print(f"{new_w}x{new_h} at ({cx},{cy})")

    # Convert to RGB for output (flatten alpha onto white)
    alpha = canvas[:, :, 3:4].astype(np.float32) / 255.0
    rgb = canvas[:, :, :3].astype(np.float32)
    white = np.full_like(rgb, 255.0)
    final = (rgb * alpha + white * (1 - alpha)).astype(np.uint8)

    # Save
    if args.output:
        out_path = ROOT / args.output
    elif args.preview:
        out_path = ROOT / "preview.jpg"
    else:
        out_path = ROOT / "artwork.jpg"

    Image.fromarray(final).save(str(out_path), quality=95)
    print(f"\nSaved: {out_path} ({out_path.stat().st_size / 1024 / 1024:.1f} MB)")

    # Tile with pyvips
    if not args.no_tile and not args.preview:
        try:
            import pyvips

            print("\nTiling with vips...")
            TILES_DIR.mkdir(exist_ok=True)
            vimg = pyvips.Image.new_from_file(str(out_path))
            vimg.dzsave(str(TILES_DIR / "artwork"), tile_size=256, overlap=1, suffix=".jpg[Q=85]")
            print(f"Tiles saved to: {TILES_DIR}/")
        except ImportError:
            print("\npyvips not installed — skipping tiling.")
            print("Install with: pip install pyvips")
            print("Or tile manually: vips dzsave artwork.jpg tiles/artwork --tile-size 256 --overlap 1")


if __name__ == "__main__":
    main()
