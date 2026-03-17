const fs = require('fs');
const path = require('path');

const MAX_ENTRIES = 20;

function createHistory(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let entries = [];
  let writing = false;
  let pending = false;

  // Load from disk
  if (fs.existsSync(filePath)) {
    try {
      entries = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      entries = [];
    }
  }

  async function flush() {
    if (writing) {
      pending = true;
      return;
    }
    writing = true;
    try {
      fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
    } finally {
      writing = false;
      if (pending) {
        pending = false;
        await flush();
      }
    }
  }

  return {
    async add(status, message = null) {
      const entry = { timestamp: new Date().toISOString(), status };
      if (message) entry.message = message;
      entries.push(entry);
      if (entries.length > MAX_ENTRIES) {
        entries = entries.slice(-MAX_ENTRIES);
      }
      await flush();
    },

    getAll() {
      return [...entries];
    },
  };
}

module.exports = { createHistory };
