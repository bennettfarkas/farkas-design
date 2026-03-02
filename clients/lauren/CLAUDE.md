# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Brand asset delivery site for Lauren, a client of farkas.design. Served at `lauren.farkas.design` via the Cloudflare subdomain router. Part of the larger farkas.design static site — see the root `CLAUDE.md` for overall architecture, deployment, Cloudflare config, and Figma integration.

## Status

New client — directory not yet built out. Use sibling clients as templates:
- **Ratio** (`../ratio/`): Closest recent example — hub + logo, color, typography subpages. Outfit + Inter, dark theme default.
- **Margin** (`../margin/`): Hub + logo, color, typography, ui-styles. Plus Jakarta Sans + JetBrains Mono, dark theme default.
- **CoSpark** (`../cospark/`): Most complete — includes extra sections (web-styles, style-tile, tile-system wizard). DM Sans + Source Serif 4.

## Development

No build step. Edit HTML/CSS directly, push to `main` to deploy. Preview by opening `index.html` in a browser.

## How to build out this client

### Required files

1. **`brand.css`** — CSS custom properties on `:root` following the standard token structure:
   - Typography: `--font-sans`, `--font-display` (optional), `--font-mono`; `--weight-*`; `--text-*` sizes; `--leading-*` line heights; `--tracking-*` letter spacing; `--measure-body`
   - Color: named primary/secondary scales (e.g. `--purple-50` through `--purple-950`), semantic surface tokens (`--surface-page`, `--surface-raised`, `--surface-overlay`), text tokens (`--color-heading`, `--color-body`, `--color-muted`, `--color-subtle`), border tokens (`--border`, `--border-strong`)
   - Dark theme: `:root[data-theme="dark"]` override block remapping semantic tokens to darker scale values
2. **`layout.css`** — Copy from `../cospark/layout.css` or `../ratio/layout.css`. Provides shared subpage chrome: reset, body, header, back link, theme toggle, content container, section headers, guidelines grid, don'ts grid, `.sr-only`, responsive breakpoints at 640px.
3. **`index.html`** — Hub page with nav list linking to subpages. Use Ratio or Margin hub as template. Key elements:
   - `data-theme="dark"` on `<html>` (default for all clients)
   - Google Fonts via `<link>` tags (not CSS `@import`)
   - Links `layout.css` then `brand.css`
   - Inline `<style>` for page-specific styles only (nav rows, ending mark, entrance animation)
   - Theme flash prevention script: `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light')})()`
   - `<script data-signature src="../../shared/farkas-animation.js"></script>` before `</body>`
4. **`favicon.svg`** — Client favicon

### Subpages

Each subpage folder (`logo/`, `color/`, `typography/`) contains a single `index.html` that:
- Links `../layout.css` then `../brand.css` for shared chrome and tokens
- Uses inline `<style>` only for page-specific rules
- Has a back link (`<a class="back" href="../">`) and theme toggle in the header
- Loads the Farkas signature script: `<script data-signature src="../../../shared/farkas-animation.js"></script>`

### After building

- Update `knownClients` emoji map in root `../../index.html` (add `lauren: '🔮'` or appropriate emoji)
- Push to `main` — `lauren.farkas.design` will automatically route to this directory

## Conventions

- All styling uses CSS custom properties from `brand.css` — never hardcode colors or font values in page styles
- Dark theme border colors use `rgba()` with the brand's accent color at low opacity (see Ratio's `rgba(202, 103, 255, 0.08)` or Margin's `rgba(196, 253, 164, 0.08)`)
- Nav row hover states use mid-range brand color (e.g. `--purple-600` light / `--purple-300` dark)
- Entrance animations use staggered `fadeIn` with 0.06s increments per nav row
- Header contains an inline SVG logo (wordmark or logomark), not an `<img>` tag
- Subpage `<style>` blocks are minimal — only what `layout.css` doesn't cover
