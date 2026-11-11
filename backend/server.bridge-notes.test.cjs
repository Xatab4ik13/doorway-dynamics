const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(`${__dirname}/server.js`, 'utf8');

function sliceRoute(signature) {
  const start = source.indexOf(signature);
  assert.ok(start >= 0, `not found: ${signature}`);
  const end = source.indexOf('\n});\n', start) + 5;
  return source.slice(start, end);
}
function extractFunction(name) {
  const start = source.indexOf(`async function ${name}(`);
  assert.ok(start >= 0);
  return source.slice(start, source.indexOf('\n}\n', start) + 2);
}

// Minimal express-like harness: capture route handler, run it with fake req/res/pool
function loadRoute(signature, ctx) {
  const routes = {};
  const app = {};
  for (const m of ['get', 'post', 'put']) app[m] = (path, ...h) => { routes[m + ' ' + path] = h[h.length - 1]; };
  const context = vm.createContext({ app, auth: null, bridgeAuth: null, console: { log() {}, error() {}, info() {} },
    statusToDoorium: {}, statusFromDoorium: {}, normalizePhone: v => v, JSON, Object, Date, ...ctx });
  vm.runInContext(sliceRoute(signature), context);
  return Object.values(routes)[0];
}
function fakeRes() {
  const r = { code: 200, body: null };
  r.status = c => { r.code = c; return r; };
  r.json = b => { r.body = b; return r; };
  return r;
}

test('ответ синхронизации (bridge/status) содержит notes', async () => {
  const row = { id: 'a', status: 'new', notes: 'Заметка', amount: 1, agreed_date: null, status_comment: null };
  const h = loadRoute("app.get('/api/bridge/status/:externalId'", { pool: { query: async () => ({ rows: [row] }) } });
  const res = fakeRes();
  await h({ params: { externalId: 'a' } }, res);
  assert.equal(res.body.notes, 'Заметка');
});

test('входящий notes сохраняется в БД (bridge/receive, существующая заявка)', async () => {
  const cases = [['Новая', true], ['', true], [null, true], [undefined, false]];
  for (const [notes, shouldWrite] of cases) {
    const queries = [];
    const pool = { query: async (sql, params) => {
      queries.push({ sql, params });
      if (sql.includes('bridge_rejected')) return { rows: [] };
      if (sql.startsWith('SELECT id FROM requests')) return { rows: [{ id: 'x' }] };
      return { rows: [{ id: 'x', number: 'REQ-1' }] };
    } };
    const h = loadRoute("app.post('/api/bridge/receive'", { pool });
    const body = { source_system: 'doorium', source_id: 's1', client_name: 'И', client_phone: '+7', status: 'new' };
    if (notes !== undefined) body.notes = notes;
    await h({ body }, fakeRes());
    const upd = queries.find(q => q.sql.startsWith('UPDATE requests'));
    assert.ok(upd.sql.includes('notes = CASE WHEN $7::boolean THEN $5 ELSE notes END'));
    assert.equal(upd.params[6], shouldWrite);
    if (shouldWrite) assert.equal(upd.params[4], notes);
  }
});

test('bridge/update сохраняет notes и не трогает при отсутствии', () => {
  const route = sliceRoute("app.put('/api/bridge/update/:id'");
  assert.ok(route.includes('if (notes !== undefined) updates.notes = notes;'));
});

test('PUT /api/requests/:id: мост с notes запускается до уведомлений', () => {
  const route = sliceRoute("app.put('/api/requests/:id'");
  const bridgeAt = route.indexOf('await bridgeAutoSyncToDoorium(updated)');
  const notifyAt = route.indexOf('notifyUserById(');
  assert.ok(bridgeAt > 0 && notifyAt > 0 && bridgeAt < notifyAt);
});

async function runSync(fetchImpl) {
  const calls = [], errors = [];
  const context = vm.createContext({
    DOORIUM_API_URL: 'https://d.invalid', DOORIUM_API_KEY: 'k', statusToDoorium: {}, JSON,
    console: { log() {}, error: (...a) => errors.push(a.join(' ')) },
    fetch: async (url, opts) => { calls.push({ url, body: JSON.parse(opts.body) }); return fetchImpl(); },
  });
  vm.runInContext(extractFunction('bridgeAutoSyncToDoorium'), context);
  context.u = { id: '1', number: 'REQ-1', external_id: 'ext', external_system: 'doorium', status: 'new', notes: 'Заметка' };
  await vm.runInContext('bridgeAutoSyncToDoorium(u)', context);
  return { calls, errors };
}

test('автоотправка передаёт notes в Doorium', async () => {
  const { calls } = await runSync(async () => ({ ok: true, text: async () => '' }));
  assert.equal(calls[0].url, 'https://d.invalid/api/bridge/update/ext');
  assert.equal(calls[0].body.notes, 'Заметка');
});

test('ошибка моста не бросается наружу и логируется с префиксом bridge', async () => {
  const { errors } = await runSync(async () => { throw new Error('down'); });
  assert.ok(errors.some(e => e.startsWith('bridge')));
});

test('ошибка уведомлений не мешает отправке в мост (мост вызывается раньше)', () => {
  const route = sliceRoute("app.put('/api/requests/:id'");
  const bridgeAt = route.indexOf('await bridgeAutoSyncToDoorium(updated)');
  const firstNotify = Math.min(...['notifyUserById(', 'sendPushToUser(', 'notifyPartner('].map(s => route.indexOf(s)).filter(i => i > 0));
  assert.ok(bridgeAt < firstNotify);
});
