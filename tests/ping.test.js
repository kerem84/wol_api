const net = require('net');

describe('ping', () => {
  test('returns online:true for an open port', (done) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', async () => {
      const port = server.address().port;
      const { tcpPing } = require('../src/ping');
      const result = await tcpPing('127.0.0.1', port, 2000);
      expect(result.online).toBe(true);
      expect(typeof result.latency).toBe('number');
      server.close();
      done();
    });
  });

  test('returns online:false for a closed port', async () => {
    const { tcpPing } = require('../src/ping');
    const result = await tcpPing('127.0.0.1', 1, 1000);
    expect(result.online).toBe(false);
    expect(result.latency).toBeNull();
  });
});
