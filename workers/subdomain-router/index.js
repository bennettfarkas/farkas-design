export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;

    // Extract subdomain from host
    const match = host.match(/^([^.]+)\.farkas\.design$/);
    if (!match || match[1] === 'www') {
      // Not a subdomain request (or www) — pass through to origin
      return fetch(request);
    }

    const subdomain = match[1];
    const path = url.pathname === '/' ? '/index.html' : url.pathname;

    // Fetch from GitHub Pages origin
    const originUrl = `https://farkas.design/clients/${subdomain}${path}`;
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
