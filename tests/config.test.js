describe('config', () => {
  const REQUIRED = ['API_KEY', 'TARGET_HOST', 'TARGET_MAC', 'TARGET_PORT', 'PING_PORT', 'PORT'];
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      API_KEY: 'test-key',
      TARGET_HOST: 'test.duckdns.org',
      TARGET_MAC: 'AA:BB:CC:DD:EE:FF',
      TARGET_PORT: '9',
      PING_PORT: '3389',
      PORT: '3000',
      DOTENV_CONFIG_PATH: '/nonexistent/.env',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns all config values', () => {
    const config = require('../src/config');
    expect(config.API_KEY).toBe('test-key');
    expect(config.TARGET_HOST).toBe('test.duckdns.org');
    expect(config.TARGET_MAC).toBe('AA:BB:CC:DD:EE:FF');
    expect(config.TARGET_PORT).toBe(9);
    expect(config.PING_PORT).toBe(3389);
    expect(config.PORT).toBe(3000);
  });

  test.each(REQUIRED)('throws if %s is missing', (key) => {
    delete process.env[key];
    expect(() => require('../src/config')).toThrow(key);
  });
});
