import { expect, test } from 'vitest';
import { elegirAnimacion } from './corredor';

const base = { estado: 'corriendo' as const, y: 0, vy: 0, golpeReciente: false, aterrizajeReciente: false };

test('en el suelo corre', () => {
  expect(elegirAnimacion(base)).toBe('correr');
});

test('al despegar y en el aire', () => {
  expect(elegirAnimacion({ ...base, y: 0.2, vy: 7 })).toBe('despegar');
  expect(elegirAnimacion({ ...base, y: 1.2, vy: 1 })).toBe('aire');
  expect(elegirAnimacion({ ...base, y: 0.6, vy: -5 })).toBe('aire');
});

test('al aterrizar', () => {
  expect(elegirAnimacion({ ...base, aterrizajeReciente: true })).toBe('aterrizar');
});

test('un golpe reciente gana sobre correr y saltar', () => {
  expect(elegirAnimacion({ ...base, golpeReciente: true })).toBe('golpe');
  expect(elegirAnimacion({ ...base, y: 1, vy: 2, golpeReciente: true })).toBe('golpe');
});

test('derrota es morir y fin es quieto', () => {
  expect(elegirAnimacion({ ...base, estado: 'derrota', golpeReciente: true })).toBe('morir');
  expect(elegirAnimacion({ ...base, estado: 'fin' })).toBe('quieto');
});
