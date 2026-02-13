# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with analytics for farkas.design.

## Status

Cloudflare Web Analytics is live. Snippet added to `../index.html` before `</body>`.

## Setup

- **Provider**: Cloudflare Web Analytics (free, privacy-friendly, no cookies)
- **Dashboard**: Cloudflare Dashboard > Web Analytics > farkas.design
- **Snippet location**: `../index.html`, just before `</body>`
- **Token**: `92c4fc9c9fa64f779aff3ae780074f4d`
- **Metrics**: Page views, referrers, device/browser, geography (all automatic)

## API Access

Credentials stored in `../.env` (gitignored):
- `CF_API_KEY` — Cloudflare Global API Key
- `CF_EMAIL` — Cloudflare account email
- `CF_ACCOUNT_ID` — Cloudflare account ID

## Notes

- No cookie banner needed — Cloudflare Web Analytics doesn't use cookies
