export default function handler(req, res) {
  const { host } = req.headers;
  const protocol = 'https';
  const base = `${protocol}://${host}`;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${base}/api/callback`,
    scope: 'repo,user',
    state: Math.random().toString(36).substring(7)
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
