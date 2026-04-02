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

  const status = tokenData.error ? 'ERROR: ' + JSON.stringify(tokenData) : 'Success — token received. Window closing in 5 seconds...';
  const html = `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:40px">
<p id="msg">${status}</p>
<p id="opener">Checking opener...</p>
<script>
  (function() {
    document.getElementById('opener').textContent = window.opener ? 'opener: OK' : 'opener: NULL (this is the problem)';
    var content = decodeURIComponent("${encoded}");
    if (window.opener) {
      window.opener.postMessage(content, "*");
    }
    setTimeout(function() { window.close(); }, 5000);
  })();
</script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
