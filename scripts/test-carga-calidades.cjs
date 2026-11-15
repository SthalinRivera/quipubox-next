const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, { exports });
  return exports;
}
const { seleccionarDestino } = load('src/lib/destinos-carga.ts');
const { clasificacionCompleta } = load('src/types/flujoOperacion.ts');
const destino = (cliente = 1, puesto = 2, seccion = 'A') => ({ id_cliente: cliente, id_puesto: puesto, seccion, puestos: { id_puesto: puesto, codigo_puesto: 'P' + puesto } });
test('selecciona puesto y sección únicos con los datos disponibles', () => {
  const result = seleccionarDestino([destino()], 1);
  assert.equal(result.idPuesto, 2); assert.equal(result.idSeccion, 'A');
});
test('deduplica puestos con varias secciones y no elige una sección arbitraria', () => {
  const result = seleccionarDestino([destino(), destino(1, 2, 'B')], 1);
  assert.equal(result.puestos.length, 1); assert.equal(result.idPuesto, 2); assert.equal(result.idSeccion, null);
});
test('preserva una selección válida cuando hay varias opciones', () => {
  const result = seleccionarDestino([destino(), destino(1, 3, 'B')], 1, 3, 'B');
  assert.equal(result.idPuesto, 3); assert.equal(result.idSeccion, 'B');
});
test('cambiar receptor elimina el puesto anterior y autoselecciona su único destino', () => {
  const result = seleccionarDestino([destino(), destino(4, 5, 'C')], 4, 2, 'A');
  assert.equal(result.idPuesto, 5); assert.equal(result.idSeccion, 'C');
});
test('no asigna puesto sin receptor ni selecciona entre varios puestos', () => {
  assert.equal(seleccionarDestino([destino()], null).idPuesto, null);
  assert.equal(seleccionarDestino([destino(), destino(1, 3)], 1).idPuesto, null);
});
test('puesto sin sección mantiene sección vacía', () => {
  const result = seleccionarDestino([destino(1, 2, null)], 1);
  assert.equal(result.idPuesto, 2); assert.equal(result.idSeccion, null);
});
test('directa y reparto requieren clasificar todas las jabas', () => {
  for (const es_reparto of [false, true]) {
    for (const cantidades of [[], [40], [101]]) assert.equal(clasificacionCompleta({ detalle_carga: [{ cantidad_jabas: 100, es_reparto, detalle_carga_calidades: cantidades.map(cantidad => ({ cantidad })) }] }), false);
    assert.equal(clasificacionCompleta({ detalle_carga: [{ cantidad_jabas: 100, es_reparto, detalle_carga_calidades: [{ cantidad: 40 }, { cantidad: 60 }] }] }), true);
  }
});
