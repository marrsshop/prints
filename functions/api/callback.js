export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
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
<html>
<body>
<script>
  (function() {
    var content = decodeURIComponent("${encoded}");
    var origin = window.location.origin;

    function sendAuth() {
      if (window.opener) {
        window.opener.postMessage(content, origin);
      }
      setTimeout(function() { window.close(); }, 500);
    }

    // Step 1: send handshake
    if (window.opener) {
      window.opener.postMessage('authorizing:github', origin);
    }

    // Step 2: wait for echo, then send auth result
    window.addEventListener('message', function(e) {
      if (e.data === 'authorizing:github') {
        sendAuth();
      }
    });

    // Fallback in case echo never arrives
    setTimeout(sendAuth, 5000);
  })();
</script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
