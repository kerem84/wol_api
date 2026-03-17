const config = require('./config');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || header !== `Bearer ${config.API_KEY}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

module.exports = auth;
