/**
 * Sveltia/Decap CMS GitHub OAuth proxy
 * Deployed to Cloudflare Workers (free tier)
 * Env vars required: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 */

const ALLOWED_ORIGINS = ['https://kaulraghav.github.io'];
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    // Step 1 — redirect to GitHub
    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo,user',
        state: crypto.randomUUID(),
      });
      return Response.redirect(`${GITHUB_AUTH_URL}?${params}`, 302);
    }

    // Step 2 — GitHub redirects back with ?code=
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const { access_token, error } = await tokenRes.json();
      if (error || !access_token) {
        return new Response(`OAuth error: ${error}`, { status: 400 });
      }

      // Post token back to the CMS window via postMessage
      const html = `<!doctype html><html><body><script>
        (function() {
          const token = ${JSON.stringify(access_token)};
          const msg = JSON.stringify({ token, provider: 'github' });
          // Sveltia/Decap CMS listens for this postMessage
          if (window.opener) {
            window.opener.postMessage('authorization:github:success:' + msg, '*');
          }
          window.close();
        })();
      </script></body></html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders(origin) },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
