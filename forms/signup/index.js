export default {
  async fetch(request, env) {
    // Validate required env vars
    if (!env.NOTION_API_KEY || !env.NOTION_DATABASE_ID || !env.ALLOWED_ORIGIN) {
      console.error('Missing required environment variables');
      return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Validate CORS origin against request
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = origin === env.ALLOWED_ORIGIN
      ? {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      : {};

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
    }

    // Rate limit: 1 submission per 60s per IP via Cache API
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = new Request(`https://rate-limit.internal/${ip}`);
    const cache = caches.default;
    if (await cache.match(rateLimitKey)) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: corsHeaders });
    }
    await cache.put(rateLimitKey, new Response('1', {
      headers: { 'Cache-Control': 'public, max-age=60' },
    }));

    try {
      const contentType = request.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        return Response.json({ error: 'Invalid content type' }, { status: 400, headers: corsHeaders });
      }

      const { email, message } = await request.json();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return Response.json({ error: 'Invalid email' }, { status: 400, headers: corsHeaders });
      }

      const trimmedMessage = (message || '').slice(0, 5000);

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2025-09-03',
        },
        body: JSON.stringify({
          parent: { database_id: env.NOTION_DATABASE_ID },
          properties: {
            Email: { email: email },
            'Signed Up': { date: { start: new Date().toISOString().split('T')[0] } },
            Source: { select: { name: 'farkas.design' } },
            ...(trimmedMessage ? { Message: { rich_text: [{ text: { content: trimmedMessage } }] } } : {}),
          },
        }),
      });

      if (!res.ok) {
        console.error('Notion API error:', res.status);
        return Response.json({ error: 'Submission failed' }, { status: 502, headers: corsHeaders });
      }

      return Response.json({ ok: true }, { headers: corsHeaders });
    } catch (err) {
      console.error('Signup worker error:', err.message || err);
      return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders });
    }
  },
};
