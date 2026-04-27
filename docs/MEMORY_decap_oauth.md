---
name: Decap CMS GitHub OAuth — Cloudflare Pages setup
description: How to wire up Decap CMS GitHub login on a static site hosted on Cloudflare Pages, including the two-phase handshake fix
type: reference
---

## Decap CMS + GitHub OAuth on Cloudflare Pages

### What it does
Lets a non-technical user log into Decap CMS using their GitHub account, on a static site with no Netlify involved.

### The pieces needed
1. **GitHub OAuth App** — registered at GitHub → Settings → Developer Settings → OAuth Apps
   - Homepage URL: your site URL (e.g. `https://artofgarrett.pages.dev`)
   - Authorization callback URL: `https://yoursite.pages.dev/api/callback`
2. **Two Cloudflare Pages Functions** in `/functions/api/`:
   - `auth.js` — redirects to GitHub OAuth
   - `callback.js` — exchanges code for token, sends it back to Decap
3. **Environment variables** in Cloudflare Pages settings:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
4. **admin/config.yml** with:
   ```yaml
   backend:
     name: github
     repo: owner/repo
     branch: main
     base_url: https://yoursite.pages.dev
     auth_endpoint: api/auth
   ```
5. **admin/index.html** — must NOT include the Netlify Identity widget script. Only the Decap CMS script.

---

### Critical: The Two-Phase Handshake

Decap CMS uses a two-step handshake before accepting the token. Most examples skip this and it silently fails.

**Phase 1:** Popup sends `"authorizing:github"` to opener
**Phase 2:** Decap echoes `"authorizing:github"` back to popup
**Phase 3:** Popup sends `"authorization:github:success:{\"token\":\"...\",\"provider\":\"github\"}"`

If you skip phases 1 and 2 and send the token directly, Decap ignores it — its auth listener isn't installed yet. This was a Safari-specific failure mode (Chrome happened to work for unrelated reasons).

### Working callback.js
```js
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  const content = tokenData.error
    ? `authorization:github:error:${JSON.stringify(tokenData)}`
    : `authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: 'github' })}`;

  const encoded = encodeURIComponent(content);

  const html = `<!DOCTYPE html>
<html><body><script>
  (function() {
    var content = decodeURIComponent("${encoded}");
    var origin = window.location.origin;
    function sendAuth() {
      if (window.opener) { window.opener.postMessage(content, origin); }
      setTimeout(function() { window.close(); }, 500);
    }
    if (window.opener) { window.opener.postMessage('authorizing:github', origin); }
    window.addEventListener('message', function(e) {
      if (e.data === 'authorizing:github') { sendAuth(); }
    });
    setTimeout(sendAuth, 5000);
  })();
</script></body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
```

### Working auth.js
```js
export async function onRequestGet(context) {
  const { GITHUB_CLIENT_ID } = context.env;
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;
  return Response.redirect(url, 302);
}
```

**Why:** `scope=repo` gives full repo access so Decap can read/write products.json and images.
