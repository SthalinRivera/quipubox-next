const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function hook(fetchWithAuth) {
  const state = [];
  const source = fs.readFileSync(path.join(__dirname, '../src/hooks/useItemsReparto.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    console: { error() {} },
    require(name) {
      if (name === 'react') return {
        useCallback: (fn) => fn,
        useRef: (current) => ({ current }),
        useState: (initial) => { const i = state.push(initial) - 1; return [initial, (next) => { state[i] = next; }]; },
      };
      if (name === '@/lib/api-client') return { fetchWithAuth };
      if (name === '@/hooks/useToast') return { useToast: () => ({ success() {}, error() {} }) };
      throw new Error(name);
    },
  });
  return { api: exports.useItemsReparto(), state };
}

test('loads all clients including recipients outside the first page', async () => {
  const clients = Array.from({ length: 21 }, (_, i) => ({ id_cliente: i + 1, cliente_sede: [{ tipo_relacion: i < 10 ? 'emisor' : 'receptor' }] }));
  const calls = [];
  const { api, state } = hook(async (url) => {
    calls.push(url);
    if (url === 'clientes/all') return clients;
    if (url === 'clientes') return { data: clients.slice(0, 10) };
    return [];
  });
  await api.loadOptions();
  assert.ok(calls.includes('clientes/all'));
  assert.equal(state[4].length, 21);
  assert.ok(state[4].some((c) => c.cliente_sede[0].tipo_relacion === 'receptor'));
});

for (const endpoint of ['clientes/all', 'puestos']) {
  test(`failure in ${endpoint} remains retryable instead of caching empty options`, async () => {
    let fail = true;
    let requests = 0;
    const { api } = hook(async (url) => {
      requests++;
      if (url === endpoint && fail) throw new Error('connection failed');
      return [];
    });
    await assert.rejects(api.loadOptions(), /connection failed/);
    fail = false;
    await api.loadOptions();
    assert.equal(requests, 4);
    await api.loadOptions();
    assert.equal(requests, 4);
  });
}
