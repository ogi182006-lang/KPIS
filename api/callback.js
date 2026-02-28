export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const data = await tokenRes.json();

    if (data.error) {
      return res.status(400).send(`GitHub OAuth error: ${data.error_description}`);
    }

    const token = data.access_token;

    // Send token back to the CMS via postMessage
    const script = `
<!DOCTYPE html>
<html>
<body>
<script>
  (function() {
    function receiveMessage(e) {
      console.log("Sending token to CMS...");
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token, provider: 'github' }).replace(/'/g, "\\'")}',
        e.origin
      );
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
<\/script>
<p style="font-family:sans-serif;text-align:center;margin-top:50px;color:#1e3a8a;">
  ✅ Login successful! Returning to admin panel...
</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(script);

  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).send('Authentication failed. Please try again.');
  }
}
