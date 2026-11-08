import { expect, test } from 'vitest';
import { MAX, posicionDecorado, puntaCable } from './pista';

const CICLO = 240;

test('el decorado queda siempre dentro del ciclo, desde 40 m detrás', () => {
  for (const base of [0, 17, 239]) {
    for (let d = 0; d < 2000; d += 13.7) {
      const x = posicionDecorado(base, d, CICLO);
      expect(x).toBeGreaterThanOrEqual(-40);
      expect(x).toBeLessThan(CICLO - 40);
    }
  }
});

test('avanza hacia −x lo mismo que corre el jugador', () => {
  const antes = posicionDecorado(100, 10, CICLO);
  const despues = posicionDecorado(100, 12.5, CICLO);
  expect(antes - despues).toBeCloseTo(2.5, 9);
});

test('solo salta al dar la vuelta al ciclo', () => {
  let anterior = posicionDecorado(0, 0, CICLO);
  let vueltas = 0;
  for (let d = 0.5; d <= 3 * CICLO; d += 0.5) {
    const x = posicionDecorado(0, d, CICLO);
    if (x > anterior) {
      vueltas++;
      expect(x - anterior).toBeCloseTo(CICLO - 0.5, 9);
    }
    anterior = x;
  }
  expect(vueltas).toBe(3);
});

test('puntaCable: colgado llega a la mano del corredor; si no, cuelga recto hacia abajo', () => {
  expect(puntaCable([10, 18], 14.8, [0, 3.5])).toEqual([0, 3.5]);
  const recto = puntaCable([10, 18], 14.8, null);
  expect(recto[0]).toBe(10);
  expect(recto[1]).toBeCloseTo(3.2, 9);
});

test('hay lugar para los obstáculos nuevos de la etapa 3', () => {
  expect(MAX.vigas).toBeGreaterThanOrEqual(8);
  expect(MAX.contenedores).toBeGreaterThanOrEqual(6);
  expect(MAX.fosos).toBeGreaterThanOrEqual(4);
  expect(MAX.cables).toBeGreaterThanOrEqual(3);
  expect(MAX.drones).toBeGreaterThanOrEqual(12);
  expect(MAX.balas).toBeGreaterThanOrEqual(16);
});
