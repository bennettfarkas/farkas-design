# Security Policy

## Infrastructure

- **Hosting**: GitHub Pages (static files only, no server-side execution)
- **TLS**: HTTPS enforced, certificate issued by GitHub via Let's Encrypt
- **DNS**: Cloudflare (DNS-only mode, not proxied)
- **Backend**: Cloudflare Workers (serverless, isolated V8 runtime)

## Secrets Management

- All secrets stored as Cloudflare Worker secrets (encrypted at rest, not readable via API)
- Local credentials in `.env` (gitignored, never committed)
- No secrets in source code or CI/CD logs

## Application Security

- **CORS**: Workers restrict requests to `https://farkas.design` via `ALLOWED_ORIGIN`
- **Input validation**: Email format validated server-side before Notion API calls
- **Method restriction**: Workers reject non-POST requests
- **No cookies**: Site uses no cookies; analytics is cookie-free (Cloudflare Web Analytics)
- **No user data stored locally**: All form submissions go directly to Notion via Workers

## Reporting a Vulnerability

If you discover a security issue, please email **bennettfarkas@gmail.com** with details. Do not open a public issue.
