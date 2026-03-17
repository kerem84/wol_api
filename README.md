# WOL API

Remote Wake-on-LAN API. Sends magic packets to wake a PC over the internet through modem broadcast forwarding.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with your values:

```
API_KEY=your-strong-random-key
TARGET_HOST=your-hostname.duckdns.org
TARGET_MAC=xx:xx:xx:xx:xx:xx
TARGET_PORT=9
PING_PORT=3389
PORT=3000
```

## Run

```bash
npm start
```

## API

All endpoints except `/health` require `Authorization: Bearer <API_KEY>` header.

### POST /wake

Send magic packet to wake the PC.

```bash
curl -X POST http://localhost:3000/wake -H "Authorization: Bearer <KEY>"
```

```json
{ "status": "sent", "target": "your-hostname.duckdns.org", "timestamp": "..." }
```

### GET /status

Check if the PC is online (TCP ping).

```bash
curl http://localhost:3000/status -H "Authorization: Bearer <KEY>"
```

```json
{ "online": true, "latency": 42, "checkedAt": "..." }
```

### GET /history

Last 20 wake attempts.

```bash
curl http://localhost:3000/history -H "Authorization: Bearer <KEY>"
```

```json
{ "history": [{ "timestamp": "...", "status": "sent" }] }
```

### GET /health

Server health check. No auth required.

```bash
curl http://localhost:3000/health
```

```json
{ "ok": true }
```

## Network Prerequisites

1. Modem admin panel: UDP port forwarding → broadcast address (e.g. `192.168.1.255:9`)
2. BIOS Wake-on-LAN enabled on target PC
3. DuckDNS or similar DDNS for dynamic IP

## Test

```bash
npm test
```

## Docker

```bash
docker build -t wol-api .
docker run -p 3000:3000 --env-file .env wol-api
```
