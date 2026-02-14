export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;

    // Extract subdomain from host (restrict to alphanumeric + hyphens to prevent path traversal)
    const match = host.match(/^([a-z0-9-]+)\.farkas\.design$/);
    if (!match || match[1] === 'www' || /^-|-$/.test(match[1])) {
      // Not a subdomain request (or www / invalid hyphen placement) — pass through to origin
      return fetch(request);
    }

    const subdomain = match[1];
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const query = url.search;

    // Shared assets resolve to site root, not the client folder
    const isShared = path.startsWith('/shared/');
    const originUrl = isShared
      ? `https://farkas.design${path}${query}`
      : `https://farkas.design/clients/${subdomain}${path}${query}`;
    const originResponse = await fetch(originUrl, {
      headers: {
        'User-Agent': 'farkas-design-subdomain-router',
      },
      redirect: 'follow',
    });

    if (originResponse.status === 404) {
      return new Response('Not found', { status: 404 });
    }

    // Clone response with original headers
    const response = new Response(originResponse.body, originResponse);

    // Set cache headers for static assets
    if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/i.test(path)) {
      response.headers.set('Cache-Control', 'public, max-age=86400');
    }

    return response;
  },
};
