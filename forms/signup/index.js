export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
    }

    try {
      const { email, message } = await request.json();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json({ error: 'Invalid email' }, { status: 400, headers: corsHeaders });
      }

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: env.NOTION_DATABASE_ID },
          properties: {
            Email: { email: email },
            'Signed Up': { date: { start: new Date().toISOString().split('T')[0] } },
            Source: { select: { name: 'farkas.design' } },
            ...(message ? { Message: { rich_text: [{ text: { content: message } }] } } : {}),
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error('Notion API error:', res.status, body);
        return Response.json({ error: 'Submission failed' }, { status: 502, headers: corsHeaders });
      }

      return Response.json({ ok: true }, { headers: corsHeaders });
    } catch (err) {
      console.error('Signup worker error:', err.message || err);
      return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders });
    }
  },
};
