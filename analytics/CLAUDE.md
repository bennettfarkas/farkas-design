# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with analytics for farkas.design.

## Setup

Cloudflare Web Analytics is live. Snippet added to `../index.html` before `</body>`.

- **Provider**: Cloudflare Web Analytics (free, privacy-friendly, no cookies)
- **Dashboard**: Cloudflare Dashboard > Web Analytics > farkas.design
- **Token**: `92c4fc9c9fa64f779aff3ae780074f4d`
- **Metrics**: Page views, referrers, device/browser, geography (all automatic)
- No cookie banner needed

## API Access

Credentials stored in `../.env` (gitignored):
- `CF_API_KEY` — Cloudflare Global API Key
- `CF_EMAIL` — Cloudflare account email
- `CF_ACCOUNT_ID` — Cloudflare account ID

Query analytics via GraphQL:
```bash
curl -s "https://api.cloudflare.com/client/v4/graphql" \
  -H "X-Auth-Key: $CF_API_KEY" \
  -H "X-Auth-Email: $CF_EMAIL" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { accounts(filter: {accountTag: \"$CF_ACCOUNT_ID\"}) { rumPageloadEventsAdaptiveGroups(filter: {datetime_geq: \"...\", datetime_leq: \"...\"}, limit: 10, orderBy: [date_DESC]) { count dimensions { date } } } } }"}'
```

Max query range is ~93 days. Use `rumPageloadEventsAdaptiveGroups` for page views.
