import { test, expect } from 'vitest';
import { leerParametros } from './preferencias';

test('leerParametros: modo de prueba', () => {
  expect(leerParametros('?prueba=1').prueba).toBe(true);
  expect(leerParametros('').prueba).toBe(false);
  expect(leerParametros('?prueba=0').prueba).toBe(false);
});
