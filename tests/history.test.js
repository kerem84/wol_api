const fs = require('fs');
const path = require('path');

describe('history', () => {
  const testFile = path.join(__dirname, '../data/test-history.json');

  beforeEach(() => {
    jest.resetModules();
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  });

  afterAll(() => {
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  });

  function getHistory() {
    const { createHistory } = require('../src/history');
    return createHistory(testFile);
  }

  test('add() stores an entry', async () => {
    const h = getHistory();
    await h.add('sent');
    const list = h.getAll();
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe('sent');
    expect(list[0].timestamp).toBeDefined();
  });

  test('add() stores error with message', async () => {
    const h = getHistory();
    await h.add('error', 'UDP failed');
    const list = h.getAll();
    expect(list[0].status).toBe('error');
    expect(list[0].message).toBe('UDP failed');
  });

  test('keeps max 20 entries', async () => {
    const h = getHistory();
    for (let i = 0; i < 25; i++) {
      await h.add('sent');
    }
    expect(h.getAll()).toHaveLength(20);
  });

  test('persists to disk', async () => {
    const h = getHistory();
    await h.add('sent');
    const data = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
    expect(data).toHaveLength(1);
  });

  test('loads from disk on init', async () => {
    const h1 = getHistory();
    await h1.add('sent');
    jest.resetModules();
    const h2 = getHistory();
    expect(h2.getAll()).toHaveLength(1);
  });
});
