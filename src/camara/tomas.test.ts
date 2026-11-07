import { test, expect } from 'vitest';
import { ASPECTO_REFERENCIA, TOMAS, factorSuavizado, fovParaAspecto } from './tomas';

test('tomas de la maqueta', () => {
  expect(TOMAS.inicio).toEqual({ posicion: [2.4, 1.8, 6.6], mira: [12, 8, -160], fov: 42 });
  expect(TOMAS.carga).toEqual({ posicion: [6.4, 1.4, 3.9], mira: [4.3, 1.4, 1.0], fov: 34 });
  expect(TOMAS.torre).toEqual({ posicion: [4, 3, 6], mira: [26, 100, -330], fov: 13 });
  expect(ASPECTO_REFERENCIA).toBeCloseTo(640 / 296, 9);
});

test('fov igual en la proporción de la maqueta o más ancha', () => {
  expect(fovParaAspecto(42, 640 / 296)).toBeCloseTo(42, 6);
  expect(fovParaAspecto(42, 21 / 9)).toBe(42);
});

test('fov más abierto en 4:3 para que la torre siga en cuadro', () => {
  expect(fovParaAspecto(42, 4 / 3)).toBeCloseTo(63.8, 1);
});

test('factorSuavizado', () => {
  expect(factorSuavizado(0)).toBe(0);
  expect(factorSuavizado(1 / 60)).toBeCloseTo(0.0263, 3);
});
