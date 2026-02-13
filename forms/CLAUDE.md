# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with forms in this project.

## Architecture

All forms follow the same pattern: HTML form → Cloudflare Worker → Notion database.

- **Frontend**: Inline `<form>` in static HTML, JS `fetch()` POSTs JSON to the worker
- **Backend**: Cloudflare Worker validates input, writes to Notion via API, returns JSON
- **Storage**: Notion databases (shared with bennettfarkas.com)

The site is static (GitHub Pages), so there's no server. Cloudflare Workers handle all backend logic.

## Active Forms

### Mailing list signup (`farkas-design-signup`)
- **Form location**: `../index.html`
- **Worker**: `signup/index.js`
- **Worker URL**: `https://farkas-design-signup.mrsandman.workers.dev`
- **Worker config**: `signup/wrangler.toml`
- **Notion database ID**: `2df5c58f-feff-8025-b6f4-d37899d6aea0`
- **Notion properties**: `Email` (email), `Signed Up` (date), `Source` (select: "farkas.design signup")
- **CORS origin**: `https://farkas.design`
- **Secret**: `NOTION_API_KEY` (set via `cd signup && npx wrangler secret put NOTION_API_KEY`)

## Adding a New Form

1. Create a new directory under `forms/` (e.g., `contact/`)
2. Add `wrangler.toml` with a unique worker name, the target Notion database ID, and `ALLOWED_ORIGIN`
3. Add `index.js` — adapt from `signup/index.js`, changing the `properties` to match the Notion database schema
4. Deploy: `cd forms/<name> && npx wrangler deploy`
5. Set secret: `npx wrangler secret put NOTION_API_KEY`
6. Add the HTML form pointing to the new worker URL
7. Document the form in this file under "Active Forms"

## Notion API

- **API version**: `2022-06-28`
- **Endpoint**: `https://api.notion.com/v1/pages` (creates a row in a database)
- **Auth**: Bearer token stored as Cloudflare Worker secret (`NOTION_API_KEY`)
- The Notion integration must have access to the target database (share the database with the integration in Notion)
