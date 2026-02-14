# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Setup

Cloudflare Web Analytics is live. Snippet added to `../index.html` before `</body>`.

- **Provider**: Cloudflare Web Analytics (free, privacy-friendly, no cookies)
- **Dashboard**: Cloudflare Dashboard > Web Analytics > farkas.design
- **Token**: `92c4fc9c9fa64f779aff3ae780074f4d`
- **Metrics**: Page views, referrers, device/browser, geography (all automatic)
- No cookie banner needed
- This directory is documentation-only — no build, lint, or test commands

## API Access

Credentials stored in `../.env` (gitignored):
- `CF_API_KEY` — Cloudflare Global API Key
- `CF_EMAIL` — Cloudflare account email
- `CF_ACCOUNT_ID` — Cloudflare account ID

### Querying Analytics (GraphQL)

Max query range is ~93 days. Use `rumPageloadEventsAdaptiveGroups` for page views.

**Page views by date:**
```bash
curl -s "https://api.cloudflare.com/client/v4/graphql" \
  -H "X-Auth-Key: $CF_API_KEY" \
  -H "X-Auth-Email: $CF_EMAIL" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { accounts(filter: {accountTag: \"'$CF_ACCOUNT_ID'\"}) { rumPageloadEventsAdaptiveGroups(filter: {datetime_geq: \"2025-01-01T00:00:00Z\", datetime_leq: \"2025-03-31T23:59:59Z\"}, limit: 100, orderBy: [date_DESC]) { count dimensions { date } } } } }"}'
```

**Other useful dimensions** (swap `dimensions` block in query):
- Referrers: `dimensions { refererHost }`
- Browsers: `dimensions { userAgentBrowser }`
- Countries: `dimensions { countryName }`
- OS: `dimensions { userAgentOS }`
- Paths: `dimensions { path }`
