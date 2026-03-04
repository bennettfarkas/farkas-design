# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Interactive artwork compositor for Lauren, a client of farkas.design. Served at `lauren.farkas.design` via the Cloudflare subdomain router. Unlike other clients in the `clients/` directory (which are brand asset delivery sites), this is a custom canvas-based image composition viewer and editor.

The public URL is `marchmap.farkas.design` (aliased to the `lauren` folder via the subdomain router Worker — see `workers/subdomain-router/index.js` line 18). `lauren.farkas.design` also works but `marchmap` is the canonical public-facing URL.

Part of the larger farkas.design static site — see the root `CLAUDE.md` for overall architecture, deployment, Cloudflare config, and subdomain routing.

## Architecture

Two main pages, plus a Python compositor for offline rendering:

### Viewer (`index.html`)
- Full-screen `<canvas>` renderer displaying a layered artwork composition
- Fetches layer data from `/api/composition` (served by the subdomain router Worker)
- **Dive mode**: Scroll/swipe to fly through layers in perspective (parallax depth effect). Layers are sorted by zIndex descending; each sits at integer depth. Scrolling moves the camera through them with perspective scaling (`layerZ / relZ`). Layers fade out as they pass behind the camera (`relZ < 0.4`).
- **Pan & zoom**: Mouse drag to pan, pinch/ctrl+wheel to zoom, double-click or Reset button to fit view
- Images loaded from `originals/` (original JPEGs) or `/` root for uploaded images, in batches of 6
- Image processing at render time: background removal via color-distance thresholding, edge feathering, opacity — all done on offscreen canvases with pixel manipulation. Processed images are downscaled to MAX_PREVIEW_DIM (4000px longest side) for performance.
- Canvas size: 28800×16200 virtual pixels. Mobile (portrait) uses "core bounds" (10th/90th percentile of layer edges) for tighter framing; desktop uses full content bounds.
- Loading overlay with compass needle animation
- **Artist statement overlay**: "Artist Statement" link (top-left) opens a full-screen text overlay with project description. Source RTF in `artist statement/` directory.
- Edit link (bottom-right) only visible when `location.hostname === 'lauren.farkas.design'`
- Animation uses lerp interpolation (VIEW_LERP=0.1 for pan/zoom, SCROLL_LERP=0.08 for dive scroll)

**Interaction model**:
- Desktop: scroll = dive depth, ctrl+wheel = zoom, drag = pan, double-click = reset
- Mobile: single-finger swipe = dive depth, two-finger pinch = zoom, two-finger drag = pan
- Keyboard: ArrowDown/Space = dive deeper, ArrowUp = shallower, Home = reset, End = max depth, Escape = close artist statement

### Editor (`editor.html`)
- Full composition editor: add/remove/reorder layers, adjust position/scale/rotation/opacity
- Layer sidebar with drag-to-reorder, per-layer controls (background removal mode, threshold, feather, opacity, rotation)
- Two background removal modes: `threshold` (color-distance based) and `ai` (uses pre-processed transparent PNGs from `transparent/` directory)
- Canvas preview with the same rendering pipeline as the viewer
- **Publish** button saves `composition.json` via `/api/composition` (PUT)
- **Add Layer** supports file upload via `/api/upload` endpoint — images re-encoded to JPEG quality 80, large images auto-resized (layer scale set to 25%)

### Compositor (`compose.py`)
- Offline Python script that renders the composition to a static JPEG
- Reads `composition.json`, composites layers with NumPy/Pillow using the same threshold/feather/rotation logic as the JS renderer
- Applies soft-focus Gaussian blur on upscaled layers (`scale > 1.5`) to hide pixel grid
- Optional DZI tiling via pyvips for deep-zoom viewing
- Requires: Pillow, numpy. Optional: pyvips (for tiling)

```bash
python3 compose.py                     # Full res (28800×16200) → artwork.jpg
python3 compose.py --preview           # 1/10 scale → preview.jpg
python3 compose.py --scale 2           # 2× for deeper zoom
python3 compose.py --no-tile           # Skip DZI tiling step
python3 compose.py --config other.json # Use a different config file
python3 compose.py --output name.jpg   # Custom output filename
```

## Key APIs

The viewer and editor rely on Worker API endpoints (served by the subdomain router at `*.farkas.design`):

- `GET /api/composition` — Returns `composition.json` (layer definitions)
- `PUT /api/composition` — Saves composition data (used by editor's Publish button)
- `POST /api/upload` — Uploads an image file (used by editor's Add Layer)

## Development

No build step. Edit HTML/CSS/JS directly, push to `main` to deploy. Preview by opening files in a browser (the viewer needs `/api/composition` to return data, so full functionality requires the live subdomain or a local mock).

## Layer Data Model

`composition.json` has `"version": 1` and a `layers` array. Each layer has:
- `id`, `filename`, `visible`, `zIndex` — identity and ordering
- `x`, `y`, `scale`, `rotation` — positioning on the 28800×16200 canvas
- `opacity` — layer transparency (0–1)
- `bgMode` — `"threshold"` (color-distance removal) or `"ai"` (pre-processed PNG)
- `threshold` — color distance for background removal (when bgMode is threshold)
- `bgColor` — background color to remove, default `[255, 255, 255]`
- `feather` — edge feathering in pixels
- `uploaded` — boolean, determines image path (`/` vs `originals/`)

## File Structure

```
├── index.html          # Public viewer (canvas renderer + dive mode + artist statement)
├── editor.html         # Composition editor (layer management + publish)
├── compose.py          # Offline Python compositor
├── originals/          # Source JPEGs (numbered, UUID-named)
├── transparent/        # AI-processed transparent PNGs (matching filenames, .jpg→.png)
├── uploads/            # User-uploaded images via editor
├── artist statement/   # Source RTF for the artist statement text
├── tiles/              # DZI tile output from compose.py
│   ├── artwork.dzi
│   └── artwork_files/
├── pdf/                # Reference materials
└── composition.json    # Layer data — not in git, served via Worker API
```
