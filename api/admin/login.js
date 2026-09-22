// api/admin/login.js
const { checkPassword, createSessionCookie } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { password } = req.body || {};

    if (!checkPassword(password)) {
      // Same generic message whether the password field was missing or
      // simply wrong — don't help an attacker narrow things down.
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    res.setHeader('Set-Cookie', createSessionCookie());
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server not configured' });
  }
};
