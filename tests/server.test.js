const request = require('supertest');

beforeAll(() => {
  process.env.API_KEY = 'test-key';
  process.env.TARGET_HOST = '127.0.0.1';
  process.env.TARGET_MAC = 'AA:BB:CC:DD:EE:FF';
  process.env.TARGET_PORT = '9';
  process.env.PING_PORT = '3389';
  process.env.PORT = '0';
  process.env.DOTENV_CONFIG_PATH = '/nonexistent/.env';
});

let app;
beforeEach(() => {
  jest.resetModules();
  app = require('../src/server').app;
});

describe('GET /health', () => {
  test('returns 200 without auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('POST /wake', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).post('/wake');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'unauthorized' });
  });

  test('returns 200 with valid auth', async () => {
    const res = await request(app)
      .post('/wake')
      .set('Authorization', 'Bearer test-key');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('sent');
    expect(res.body.target).toBe('127.0.0.1');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /status', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(401);
  });

  test('returns online status with auth', async () => {
    const res = await request(app)
      .get('/status')
      .set('Authorization', 'Bearer test-key');
    expect(res.status).toBe(200);
    expect(typeof res.body.online).toBe('boolean');
    expect(res.body.checkedAt).toBeDefined();
  });
});

describe('GET /history', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).get('/history');
    expect(res.status).toBe(401);
  });

  test('returns history array with auth', async () => {
    const res = await request(app)
      .get('/history')
      .set('Authorization', 'Bearer test-key');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
  });
});

describe('POST /wake error path', () => {
  test('returns 500 when UDP send fails', async () => {
    jest.doMock('../src/wol', () => ({
      sendMagicPacket: () => Promise.reject(new Error('mock UDP fail')),
    }));
    jest.resetModules();
    const errorApp = require('../src/server').app;
    const res = await request(errorApp)
      .post('/wake')
      .set('Authorization', 'Bearer test-key');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('udp_send_failed');
    expect(res.body.message).toBe('mock UDP fail');
  });
});

describe('rate limiting', () => {
  test('returns 429 after exceeding limit', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/wake')
        .set('Authorization', 'Bearer test-key');
    }
    const res = await request(app)
      .post('/wake')
      .set('Authorization', 'Bearer test-key');
    expect(res.status).toBe(429);
  });
});
