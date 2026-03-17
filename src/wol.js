const dgram = require('dgram');

function buildMagicPacket(mac) {
  const cleanMac = mac.replace(/[:\-]/g, '');
  if (!/^[0-9A-Fa-f]{12}$/.test(cleanMac)) {
    throw new Error(`Invalid MAC address: ${mac}`);
  }

  const macBytes = Buffer.from(cleanMac, 'hex');
  const header = Buffer.alloc(6, 0xff);
  const body = Buffer.alloc(96);
  for (let i = 0; i < 16; i++) {
    macBytes.copy(body, i * 6);
  }

  return Buffer.concat([header, body]);
}

function sendMagicPacket(mac, host, port) {
  return new Promise((resolve, reject) => {
    const packet = buildMagicPacket(mac);
    const client = dgram.createSocket('udp4');

    client.send(packet, 0, packet.length, port, host, (err) => {
      client.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { buildMagicPacket, sendMagicPacket };
