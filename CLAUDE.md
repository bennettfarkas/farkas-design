# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for farkas.design — a static site deployed to GitHub Pages.

## Deployment

The site auto-deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`. The entire repo root is uploaded as the site artifact (no build step), so `index.html` at the root is the live page.

Custom domain: `farkas.design` (configured in `CNAME`, DNS managed in Cloudflare).
