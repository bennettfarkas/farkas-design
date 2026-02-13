# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for farkas.design — a static site deployed to GitHub Pages. No build step; `index.html` at the repo root is the live page.

## Architecture

- **Frontend**: Static HTML/CSS/JS — single `index.html` with inline styles and vanilla JavaScript
- **Forms**: Cloudflare Workers handle backend logic (see `forms/CLAUDE.md`)
- **Analytics**: Cloudflare Web Analytics (see `analytics/CLAUDE.md`)
- **Hosting**: GitHub Pages via Actions workflow
- **DNS/CDN**: Cloudflare (DNS-only, not proxied)

## Deployment

Auto-deploys on push to `main` via `.github/workflows/deploy.yml`. The entire repo root is uploaded as the site artifact.

- **Live URL**: `https://farkas.design`
- **HTTPS**: Enforced, TLS cert issued by GitHub
- **Custom domain**: Configured in `CNAME`, DNS managed in Cloudflare

## Cloudflare

Credentials in `.env` (gitignored). Auth uses Global API Key (`X-Auth-Key` + `X-Auth-Email` headers).

- **Account ID**: `de736c1c1a607479c26a2abb409c7c4d`
- **Zone ID**: `c160d4aa24b5f1e08ba5958cc8e7cd3d`
- **Web Analytics token**: `92c4fc9c9fa64f779aff3ae780074f4d`
- **Workers subdomain**: `mrsandman.workers.dev`
