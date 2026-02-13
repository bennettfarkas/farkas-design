# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for farkas.design — a static site deployed to GitHub Pages.

## Deployment

The site auto-deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`. The entire repo root is uploaded as the site artifact (no build step), so `index.html` at the root is the live page.

Custom domain: `farkas.design` (configured in `CNAME`, DNS managed in Cloudflare).

## Cloudflare

Credentials in `.env` (gitignored). Auth uses Global API Key (`X-Auth-Key` + `X-Auth-Email` headers).

- **Account ID**: `de736c1c1a607479c26a2abb409c7c4d`
- **Zone ID**: `c160d4aa24b5f1e08ba5958cc8e7cd3d`
- **Web Analytics token**: `92c4fc9c9fa64f779aff3ae780074f4d`

See `forms/CLAUDE.md` and `analytics/CLAUDE.md` for subsystem details.
