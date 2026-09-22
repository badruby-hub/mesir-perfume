// api/admin/session.js
//
// The session cookie is httpOnly (can't be read by page JS on purpose —
// that's what stops it being stolen via XSS), so the admin page asks the
// server whether it's currently logged in via this endpoint instead of
// checking document.cookie itself.
const { isAuthenticated } = require('../../lib/auth');

module.exports = async (req, res) => {
  res.status(200).json({ authenticated: isAuthenticated(req) });
};
