describe('auth middleware', () => {
  let auth;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      API_KEY: 'test-key',
      TARGET_HOST: 'x', TARGET_MAC: 'x', TARGET_PORT: '9', PING_PORT: '3389', PORT: '3000',
      DOTENV_CONFIG_PATH: '/nonexistent/.env',
    };
    auth = require('../src/auth');
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function mockReqRes(header) {
    const req = { headers: { authorization: header } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    return { req, res, next };
  }

  test('calls next with valid Bearer token', () => {
    const { req, res, next } = mockReqRes('Bearer test-key');
    auth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 with missing header', () => {
    const { req, res, next } = mockReqRes(undefined);
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 with wrong token', () => {
    const { req, res, next } = mockReqRes('Bearer wrong-key');
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
