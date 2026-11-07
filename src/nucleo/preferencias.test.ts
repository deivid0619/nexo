import { test, expect } from 'vitest';
import { leerParametros } from './preferencias';

test('leerParametros: modo de prueba', () => {
  expect(leerParametros('?prueba=1').prueba).toBe(true);
  expect(leerParametros('').prueba).toBe(false);
  expect(leerParametros('?prueba=0').prueba).toBe(false);
});

test('leerParametros: calidad y fps', () => {
  expect(leerParametros('?calidad=medio').calidad).toBe('medio');
  expect(leerParametros('?calidad=ultra').calidad).toBeNull();
  expect(leerParametros('').calidad).toBeNull();
  expect(leerParametros('?fps=1').fps).toBe(true);
  expect(leerParametros('').fps).toBe(false);
});
