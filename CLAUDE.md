# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for farkas.design — a static site deployed to GitHub Pages. No build step; `index.html` at the repo root is the live page.

## Architecture

- **Frontend**: Single `index.html` with inline styles/JS, EB Garamond font via Google Fonts, wolf emoji favicon
- **Forms**: Cloudflare Workers handle backend logic (HTML form → Worker → Notion DB). See `forms/CLAUDE.md`
- **Analytics**: Cloudflare Web Analytics (cookie-free). See `analytics/CLAUDE.md`
- **Hosting**: GitHub Pages via Actions workflow
- **DNS/CDN**: Cloudflare (DNS-only for root; wildcard `*.farkas.design` proxied for subdomain routing)
- **Clients**: `clients/` directory for client brand asset pages, served at `{name}.farkas.design` via subdomain router Worker
- **Subdomain routing**: Cloudflare Worker proxies `*.farkas.design` → `farkas.design/clients/{subdomain}/` on GitHub Pages
- **Figma integration**: MCP server (`thirdstrandstudio/mcp-figma`) configured in `.mcp.json` for extracting brand assets from Figma files

## Development

No build, lint, or test commands — edit `index.html` and push to `main` to deploy. Preview locally by opening `index.html` in a browser.

### Worker deployment

```bash
cd forms/signup && npx wrangler deploy                     # deploy signup worker
cd forms/signup && npx wrangler secret put NOTION_API_KEY   # set Notion secret
cd workers/subdomain-router && npx wrangler deploy          # deploy subdomain router
```

### Adding a client subdomain

1. Create a kebab-case directory under `clients/` (e.g., `clients/acme/`)
2. Scaffold the standard structure: `index.html`, `logo/`, `color/`, `typography/`, `guidelines/`
3. Push to `main` — the subdomain `acme.farkas.design` will automatically serve that folder

### Client folder structure

```
clients/{client-name}/
├── index.html          # branded asset delivery page
├── logo/               # logo files (SVG, PNG)
├── color/              # color palette assets
├── typography/         # font files
└── guidelines/         # brand guidelines PDFs
```

### Extracting assets from Figma

The Figma MCP server (configured in `.mcp.json`, token in `.env`) provides tools for pulling assets directly from Figma files:

- `figma_get_file` / `figma_get_file_styles` — inspect file structure and styles
- `figma_get_file_nodes` — get color/typography values from style nodes
- `figma_get_images` — export frames as SVG, PNG, JPG, or PDF

File key is the ID in the Figma URL: `figma.com/design/{FILE_KEY}/...`

## Deployment

Auto-deploys on push to `main` via `.github/workflows/deploy.yml`. The entire repo root is uploaded as the site artifact.

- **Live URL**: `https://farkas.design`
- **HTTPS**: Enforced, TLS cert issued by GitHub
- **Custom domain**: Configured in `CNAME`, DNS managed in Cloudflare

## Cloudflare

Credentials in `.env` (gitignored). Cloudflare auth uses Global API Key (`X-Auth-Key` + `X-Auth-Email` headers). Figma token also in `.env`.

- **Account ID**: `de736c1c1a607479c26a2abb409c7c4d`
- **Zone ID**: `c160d4aa24b5f1e08ba5958cc8e7cd3d`
- **Web Analytics token**: `92c4fc9c9fa64f779aff3ae780074f4d`
- **Workers subdomain**: `mrsandman.workers.dev`
