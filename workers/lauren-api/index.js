export default {
  async fetch(request, env) {
    if (!env.BUCKET) {
      console.error('Missing BUCKET binding');
      return Response.json({ error: 'Server misconfiguration: no bucket' }, { status: 500 });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // --- GET /api/composition ---
    if (path === '/api/composition' && request.method === 'GET') {
      const obj = await env.BUCKET.get('composition.json');
      if (!obj) {
        return Response.json(null, {
          headers: { 'Cache-Control': 'no-store' },
        });
      }
      return new Response(obj.body, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    // --- POST /api/publish ---
    if (path === '/api/publish' && request.method === 'POST') {
      if (!authorize(request, env)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.text();
      // Validate it's valid JSON
      try {
        JSON.parse(body);
      } catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
      }

      await env.BUCKET.put('composition.json', body, {
        httpMetadata: { contentType: 'application/json' },
      });

      return Response.json({ ok: true });
    }

    // --- POST /api/upload ---
    if (path === '/api/upload' && request.method === 'POST') {
      if (!authorize(request, env)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || !(file instanceof File)) {
        return Response.json({ error: 'No file provided' }, { status: 400 });
      }

      // Sanitize filename: keep alphanumeric, dashes, underscores, dots
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = 'uploads/' + Date.now() + '-' + safeName;

      await env.BUCKET.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || 'image/jpeg' },
      });

      return Response.json({ ok: true, key: key });
    }

    // --- GET /uploads/* ---
    if (path.startsWith('/uploads/') && request.method === 'GET') {
      const key = path.slice(1); // remove leading slash → "uploads/..."
      const obj = await env.BUCKET.get(key);
      if (!obj) {
        return new Response('Not found', { status: 404 });
      }
      return new Response(obj.body, {
        headers: {
          'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // --- Method not allowed for known paths ---
    if (path.startsWith('/api/')) {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    return new Response('Not found', { status: 404 });
  },
};

function authorize(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  return token === env.PUBLISH_TOKEN;
}
