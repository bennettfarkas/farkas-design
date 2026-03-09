# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Brand asset delivery site for **Margin**, served at `margin.farkas.design`. Part of the farkas.design static site — no build step. See the root `CLAUDE.md` for deployment, DNS, subdomain routing, and worker details.

## Structure

- `index.html` — Hub page with nav to four sections (dark theme default)
- `brand.css` — Design tokens (colors, typography, semantic surface/text/border tokens, dark mode overrides)
- `layout.css` — Shared subpage layout (header, back link, theme toggle, content container, guidelines grid, don'ts cards, responsive breakpoints at 640px)
- `favicon.svg` / `wordmark.svg` — Brand marks (SVG)
- `logo/` — Logo variants page (4 variants)
- `color/` — Color palette page (Pine, Spring, Amber, Scarlet scales)
- `typography/` — Typeface specimens (Plus Jakarta Sans + JetBrains Mono)
- `ui-styles/` — Dashboard reference page

## Brand System

**Fonts**: Plus Jakarta Sans (200–800, `--font-sans`) + JetBrains Mono (300–500, `--font-mono`). Loaded via Google Fonts `<link>` tags (not CSS `@import`).

**Colors**: Pine (dark green, `#0B281A`) + Spring (light green, `#C4FDA4`) primaries. Amber and Scarlet utility colors. Each has an 11-step scale (50–950). Semantic tokens (`--surface-*`, `--color-*`, `--border-*`) swap between light and dark themes via `[data-theme="dark"]`.

**Theme**: Defaults to dark (`data-theme="dark"` on `<html>`). Toggle via `toggleTheme()` from `shared/farkas-animation.js`. Theme preference persisted in `localStorage('theme')`.

## CSS Architecture

Subpages load three stylesheets in order: `layout.css` → `brand.css` → page-specific `<style>`. `layout.css` provides all shared chrome (header, back link, content container, section headers, guidelines grid, don'ts grid). Page-specific styles go in the inline `<style>` tag only.

## Development

Preview locally by opening HTML files in a browser, or use `python3 -m http.server 8888` from the repo root and visit `http://localhost:8888/clients/margin/`. Push to `main` to deploy.

The Farkas signature script (`../../shared/farkas-animation.js` with `data-signature`) is loaded on all pages — it provides `toggleTheme()` and the bottom-pinned emoji link.
