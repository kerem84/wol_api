const dgram = require('dgram');

describe('wol', () => {
  describe('buildMagicPacket', () => {
    test('returns 102-byte buffer for valid MAC', () => {
      const { buildMagicPacket } = require('../src/wol');
      const packet = buildMagicPacket('AA:BB:CC:DD:EE:FF');
      expect(packet).toBeInstanceOf(Buffer);
      expect(packet.length).toBe(102);
    });

    test('starts with 6 bytes of 0xFF', () => {
      const { buildMagicPacket } = require('../src/wol');
      const packet = buildMagicPacket('AA:BB:CC:DD:EE:FF');
      for (let i = 0; i < 6; i++) {
        expect(packet[i]).toBe(0xff);
      }
    });

    test('contains MAC repeated 16 times after header', () => {
      const { buildMagicPacket } = require('../src/wol');
      const packet = buildMagicPacket('AA:BB:CC:DD:EE:FF');
      const macBytes = [0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff];
      for (let rep = 0; rep < 16; rep++) {
        for (let b = 0; b < 6; b++) {
          expect(packet[6 + rep * 6 + b]).toBe(macBytes[b]);
        }
      }
    });

    test('handles MAC with dashes', () => {
      const { buildMagicPacket } = require('../src/wol');
      const packet = buildMagicPacket('AA-BB-CC-DD-EE-FF');
      expect(packet.length).toBe(102);
    });

    test('throws on invalid MAC', () => {
      const { buildMagicPacket } = require('../src/wol');
      expect(() => buildMagicPacket('invalid')).toThrow();
    });
  });

  describe('sendMagicPacket', () => {
    test('sends UDP packet to target host and port', (done) => {
      const server = dgram.createSocket('udp4');
      server.bind(0, '127.0.0.1', () => {
        const port = server.address().port;
        const { sendMagicPacket } = require('../src/wol');

        server.on('message', (msg) => {
          expect(msg.length).toBe(102);
          server.close();
          done();
        });

        sendMagicPacket('AA:BB:CC:DD:EE:FF', '127.0.0.1', port);
      });
    });
  });
});
