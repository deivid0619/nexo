import { expect, test } from 'vitest';
import { almacenMemoria } from './almacen';
import {
  CLAVE_PROGRESO,
  CLAVE_RESPALDO,
  cargarProgreso,
  completarPiso,
  estadoDePiso,
  guardarProgreso,
  progresoInicial,
  registrosDePiso,
  tieneAvance,
} from './progreso';

test('sin guardado: progreso inicial y existia=false', () => {
  const r = cargarProgreso(almacenMemoria(), 1000);
  expect(r.existia).toBe(false);
  expect(r.progreso.pisoActual).toBe('tierra');
  expect(r.progreso.completados).toEqual([]);
});

test('guarda y vuelve a cargar igual', () => {
  const a = almacenMemoria();
  const p = { ...progresoInicial(0), records: { tierra: 12480 } };
  expect(guardarProgreso(a, p, 5000)).toBe(true);
  expect(cargarProgreso(a, 6000)).toEqual({ progreso: { ...p, guardadoEn: 5000 }, existia: true });
});

test.each([
  '{oops',
  '{"version":2,"pisoActual":"tierra"}',
  '{"version":1,"pisoActual":"luna","completados":[],"records":{},"registros":[],"guardadoEn":0}',
  '{"version":1,"pisoActual":"tierra","completados":["sol"],"records":{},"registros":[],"guardadoEn":0}',
  '{"version":1,"pisoActual":"tierra","completados":[],"records":{"tierra":"mucho"},"registros":[],"guardadoEn":0}',
  '{"version":1,"pisoActual":"tierra","completados":[],"records":{},"registros":[3],"guardadoEn":0}',
  '[]',
  'null',
])('guardado inválido %s: arranca nuevo y guarda respaldo', (crudo) => {
  const a = almacenMemoria();
  a.escribir(CLAVE_PROGRESO, crudo);
  const r = cargarProgreso(a, 1);
  expect(r.existia).toBe(false);
  expect(r.progreso).toEqual(progresoInicial(1));
  expect(a.leer(CLAVE_RESPALDO)).toBe(crudo);
});

test('completar pisos', () => {
  const p1 = completarPiso(progresoInicial(0), 'tierra');
  expect(p1.pisoActual).toBe('cristal');
  expect(estadoDePiso(p1, 'tierra')).toBe('completado');
  expect(estadoDePiso(p1, 'cristal')).toBe('actual');
  const p2 = completarPiso(completarPiso(p1, 'cristal'), 'cristal');
  expect(p2.completados).toEqual(['tierra', 'cristal']);
  expect(p2.pisoActual).toBe('cristal');
  expect(estadoDePiso(p2, 'cristal')).toBe('completado');
  expect(estadoDePiso(p2, 'magma')).toBe('sellado');
});

test('completar no cambia el progreso original ni abre pisos sellados', () => {
  const p = progresoInicial(0);
  completarPiso(p, 'tierra');
  expect(p.completados).toEqual([]);
  expect(completarPiso(p, 'magma')).toEqual(p);
});

test('avance y registros por piso', () => {
  const p = progresoInicial(0);
  expect(tieneAvance(p)).toBe(false);
  const q = { ...p, registros: ['tierra-1', 'cristal-2'] };
  expect(tieneAvance(q)).toBe(true);
  expect(registrosDePiso(q, 'tierra')).toBe(1);
  expect(tieneAvance(completarPiso(p, 'tierra'))).toBe(true);
});
