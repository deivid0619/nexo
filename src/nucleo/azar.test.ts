import { test, expect } from 'vitest';
import { crearAzar } from './azar';

test('misma semilla, misma secuencia', () => {
  const a = crearAzar(7);
  const b = crearAzar(7);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});

test('semillas distintas dan secuencias distintas', () => {
  expect(crearAzar(1)()).not.toBe(crearAzar(2)());
});

test('valores en [0, 1)', () => {
  const r = crearAzar(3);
  for (let i = 0; i < 1000; i++) {
    const v = r();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  }
});
