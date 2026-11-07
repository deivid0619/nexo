import { test, expect } from 'vitest';
import { alturaTerreno } from './terreno';

test('la carretera es plana', () => {
  for (let z = 10; z > -300; z -= 7) for (const x of [-5, -2.5, 0, 3, 5]) expect(alturaTerreno(x, z)).toBe(0);
});

test('el terreno queda acotado', () => {
  for (let i = 0; i < 2000; i++) {
    const h = alturaTerreno((i % 80) - 40, -i * 0.3);
    expect(h).toBeGreaterThanOrEqual(-2.3);
    expect(h).toBeLessThanOrEqual(5.1);
  }
});

test('lejos de la carretera el terreno tiene relieve', () => {
  const alturas = new Set<number>();
  for (let z = 0; z > -200; z -= 10) alturas.add(Math.round(alturaTerreno(30, z) * 10));
  expect(alturas.size).toBeGreaterThan(5);
});
