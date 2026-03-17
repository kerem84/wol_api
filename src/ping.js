const net = require('net');

function tcpPing(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const latency = Date.now() - start;
      socket.destroy();
      resolve({ online: true, latency });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ online: false, latency: null });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve({ online: false, latency: null });
    });

    socket.connect(port, host);
  });
}

module.exports = { tcpPing };
