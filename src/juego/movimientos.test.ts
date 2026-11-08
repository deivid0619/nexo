import { expect, test } from 'vitest';
import { alturaCuerpo, alturaVaiven, suelta } from './movimientos';

test('el cuerpo mide 0,9 m rodando y 1,75 m de pie', () => {
  expect(alturaCuerpo('rodando')).toBe(0.9);
  expect(alturaCuerpo('corriendo')).toBe(1.75);
});

test('la suelta del cable: el centro de la franja da el mayor impulso y "¡Justo!"', () => {
  expect(suelta(0.8).justo).toBe(true);
  for (let u = 0; u <= 1.0001; u += 0.01) expect(suelta(u).vy).toBeLessThanOrEqual(suelta(0.8).vy);
  expect(suelta(0.65).justo).toBe(false);
  expect(suelta(0.3).vy).toBeLessThan(suelta(0.6).vy);
});

test('el vaivén sube de u = 0 a u = 1', () => {
  for (let i = 1; i <= 10; i++) expect(alturaVaiven(i / 10)).toBeGreaterThan(alturaVaiven((i - 1) / 10));
});
