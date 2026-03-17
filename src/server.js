const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const auth = require('./auth');
const { sendMagicPacket } = require('./wol');
const { tcpPing } = require('./ping');
const { createHistory } = require('./history');

const app = express();

const history = createHistory(path.join(__dirname, '../data/history.json'));

const wakeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'rate_limit_exceeded' },
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/wake', auth, wakeLimiter, async (_req, res) => {
  try {
    await sendMagicPacket(config.TARGET_MAC, config.TARGET_HOST, config.TARGET_PORT);
    const timestamp = new Date().toISOString();
    await history.add('sent');
    res.json({ status: 'sent', target: config.TARGET_HOST, timestamp });
  } catch (err) {
    await history.add('error', err.message);
    res.status(500).json({ error: 'udp_send_failed', message: err.message });
  }
});

app.get('/status', auth, async (_req, res) => {
  const result = await tcpPing(config.TARGET_HOST, config.PING_PORT);
  res.json({
    online: result.online,
    latency: result.latency,
    checkedAt: new Date().toISOString(),
  });
});

app.get('/history', auth, (_req, res) => {
  res.json({ history: history.getAll() });
});

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`WOL API running on port ${config.PORT}`);
  });
}

module.exports = { app };
