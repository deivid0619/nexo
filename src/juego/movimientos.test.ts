import { expect, test } from 'vitest';
import { alturaCuerpo } from './movimientos';

test('el cuerpo mide 0,9 m rodando y 1,75 m de pie', () => {
  expect(alturaCuerpo('rodando')).toBe(0.9);
  expect(alturaCuerpo('corriendo')).toBe(1.75);
});
