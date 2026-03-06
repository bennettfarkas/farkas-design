# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for farkas.design — a static site deployed to GitHub Pages. No build step; `index.html` at the repo root is the live page.

## Architecture

- **Frontend**: Single `index.html` with inline styles/JS, Inter for body text, wolf emoji favicon, progressive disclosure contact form, staggered fade-in on load, client corner input (bottom-left) for navigating to client subdomains with per-client emoji and random error messages. The emoji map is hardcoded in `index.html` as `knownClients` (`{ cospark: '✨', strongposition: '💪🏻', margin: '📐', ratio: '💜' }`) — update it when adding a new client.
- **Shared animation + theme**: `shared/farkas-animation.js` + `shared/farkas-animation.css` — font-cycling headline animation with click-to-advance on hover. Also provides `window.toggleTheme()` used by all pages via `onclick`. Used on the homepage and as a hover signature on client pages (via `data-signature` attribute on the script tag). Signature mode shows emoji-only (not the full headline row), auto-injects body flex layout, and pins to viewport bottom. The emoji is a native `<a>` linking back to farkas.design.
- **Forms**: Cloudflare Workers handle backend logic (HTML form → Worker → Notion DB). See `forms/CLAUDE.md`
- **Analytics**: Cloudflare Web Analytics (cookie-free). See `analytics/CLAUDE.md`
- **Hosting**: GitHub Pages via Actions workflow
- **DNS**: Cloudflare DNS. Root domain (`farkas.design`) uses 4 A records pointing to GitHub Pages IPs (DNS-only, not proxied). Wildcard (`*.farkas.design`) is proxied through Cloudflare to the subdomain router Worker.
- **Clients**: `clients/` directory for client brand asset pages, served at `{name}.farkas.design` via subdomain router Worker
- **Subdomain routing**: Cloudflare Worker proxies `*.farkas.design` → `farkas.design/clients/{subdomain}/` on GitHub Pages. Paths starting with `/shared/` resolve to the site root (not the client folder), so client pages can reference `../../shared/` or `/shared/` for shared assets. Subdomain aliases are defined in the Worker's `aliases` object (e.g., `marchmap` → `lauren`).
- **Figma integration**: MCP server (`thirdstrandstudio/mcp-figma`) configured in `.mcp.json` for extracting brand assets from Figma files

## Development

No build, lint, or test commands — edit HTML/CSS and push to `main` to deploy. Preview locally by opening `index.html` in a browser.

### Worker deployment

The shell may have a `CLOUDFLARE_API_TOKEN` env var that lacks permissions. Override it when deploying:

```bash
source .env && CLOUDFLARE_API_TOKEN="" CLOUDFLARE_API_KEY="$CF_API_KEY" CLOUDFLARE_EMAIL="$CF_EMAIL" npx wrangler deploy
```

Run from the worker directory (`forms/signup/` or `workers/subdomain-router/`). To set Notion secret: `cd forms/signup && npx wrangler secret put NOTION_API_KEY`.

### Adding a client subdomain

1. Create a lowercase directory under `clients/` (e.g., `clients/acme/`)
2. Add `brand.css` with CSS custom properties (color tokens, typography tokens, weights)
3. Add `index.html` linking to `brand.css` — use the CoSpark index as a template
4. Add subpage folders as needed: `logo/`, `color/`, `typography/`, `guidelines/`
5. (Optional) Add `<script data-signature src="../../shared/farkas-animation.js"></script>` for the Farkas signature
6. Update the `knownClients` map in root `index.html` with the client name and emoji
7. Push to `main` — the subdomain `acme.farkas.design` will automatically serve that folder

### Client folder structure

```
clients/{client-name}/
├── brand.css           # CSS custom properties (colors, typography tokens)
├── index.html          # branded asset delivery page
├── layout.css          # shared subpage layout (optional — see CoSpark)
├── wordmark.svg        # client wordmark for subpage headers (optional)
├── favicon.svg         # client favicon (optional)
├── logo/
│   └── index.html      # logo variants + downloads
├── color/
│   └── index.html      # palette, scales, and usage guidelines
├── typography/
│   └── index.html      # typeface specimens, type scale, text color
└── guidelines/         # brand guidelines (coming soon for most clients)
```

**CSS architecture for client subpages**: Subpages (logo, color, typography) share layout via `layout.css` which provides reset, body, header, back link, content container, section headers, guidelines grid, don'ts grid/cards, `.sr-only`, and responsive breakpoints (standard: 640px). Each subpage's `<style>` tag contains only page-specific styles (e.g. column counts for `.donts-grid`). `brand.css` provides the design tokens. Google Fonts are loaded via `<link>` tags in each page's `<head>` (not via CSS `@import`).

### Active clients

- **CoSpark** (`clients/cospark/`): Fully built — logo, color, typography, web-styles, style-tile, tile-system (with wizard). DM Sans + Source Serif 4, copper/slate palette
- **Margin** (`clients/margin/`): Hub page + logo, color, typography, ui-styles pages. EB Garamond serif, system sans
- **Strong Position** (`clients/strongposition/`): Placeholder — all sections "coming soon", uses EB Garamond
- **Ratio** (`clients/ratio/`): Hub page + logo, color, typography pages. Outfit display + Inter body, purple/teal palette with magenta/blue/green/yellow secondaries
- **Lauren** (`clients/lauren/`): Custom canvas-based artwork compositor — not a brand asset site. Viewer with dive mode (parallax layer fly-through), editor for layer management, offline Python compositor. Served at `marchmap.farkas.design` (aliased via subdomain router). Has its own `CLAUDE.md` with full architecture details.

### Adding a project

Projects are standalone pages served at `farkas.design/{project-name}`. Source files live in `projects/` with a datecode prefix.

1. Create a folder under `projects/` named `MMDDYY-project-name` (e.g., `projects/030526-Who-da-mom-a/`)
2. Add an `index.html` and any assets inside that folder
3. Push to `main` — the deploy workflow strips the datecode prefix and serves the folder at `farkas.design/project-name`

The project name (after the datecode) is the URL path, so use the exact casing/hyphens you want in the URL.

### Extracting assets from Figma

The Figma MCP server (configured in `.mcp.json`, token in `.env`) provides tools for pulling assets directly from Figma files:

- `figma_get_file` / `figma_get_file_styles` — inspect file structure and styles
- `figma_get_file_nodes` — get color/typography values from style nodes
- `figma_get_images` — export frames as SVG, PNG, JPG, or PDF

File key is the ID in the Figma URL: `figma.com/design/{FILE_KEY}/...`

## Deployment

Auto-deploys on push to `main` via `.github/workflows/deploy.yml`. The workflow copies site files (`index.html`, `CNAME`, `shared/`, `clients/`) into a `_site/` directory, then copies each `projects/MMDDYY-name/` folder into `_site/name/` (stripping the datecode prefix). `forms/` and `workers/` are excluded because they deploy separately via `wrangler deploy`, not GitHub Pages.

- **Live URL**: `https://farkas.design`
- **HTTPS**: Enforced, TLS cert issued by GitHub
- **Custom domain**: Configured in `CNAME`, DNS managed in Cloudflare

## Cloudflare

Credentials in `.env` (gitignored). Cloudflare auth uses Global API Key (`X-Auth-Key` + `X-Auth-Email` headers). Figma token also in `.env`.

- **Account ID**: `de736c1c1a607479c26a2abb409c7c4d`
- **Zone ID**: `c160d4aa24b5f1e08ba5958cc8e7cd3d`
- **Web Analytics token**: `92c4fc9c9fa64f779aff3ae780074f4d`
- **Workers subdomain**: `mrsandman.workers.dev`

## Non-live directories

- `exploration/` — Experimental prototypes (dissolve animation, emoji lab). Not part of the live site; do not reference from production pages.
- `forms/` and `workers/` — Cloudflare Workers, deployed separately via `wrangler deploy` (not included in GitHub Pages build).
