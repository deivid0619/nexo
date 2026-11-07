import { test, expect } from 'vitest';
import { formatearPuntaje, tiempoRelativo } from './formato';

test('puntaje con punto de miles', () => {
  expect(formatearPuntaje(12480)).toBe('12.480');
  expect(formatearPuntaje(0)).toBe('0');
  expect(formatearPuntaje(1234)).toBe('1.234');
  expect(formatearPuntaje(1234567)).toBe('1.234.567');
  expect(formatearPuntaje(999)).toBe('999');
});

test('tiempo relativo', () => {
  const h = 3_600_000;
  const ahora = 100 * 24 * h;
  expect(tiempoRelativo(ahora - 30_000, ahora)).toBe('hace un momento');
  expect(tiempoRelativo(ahora - 5 * 60_000, ahora)).toBe('hace 5 min');
  expect(tiempoRelativo(ahora - 2 * h, ahora)).toBe('hace 2 h');
  expect(tiempoRelativo(ahora - 26 * h, ahora)).toBe('ayer');
  expect(tiempoRelativo(ahora - 72 * h, ahora)).toBe('hace 3 días');
  expect(tiempoRelativo(ahora + 60_000, ahora)).toBe('hace un momento'); // reloj cambiado
});
