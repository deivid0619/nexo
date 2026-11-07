import { expect, test } from 'vitest';
import { TIERRA_BALDIA_1 } from './tierra-baldia-1';
import { validarNivel } from './validar';

test('el primer tramo de la Tierra baldía es válido', () => {
  expect(validarNivel(TIERRA_BALDIA_1)).toEqual([]);
});

test('dura entre 300 y 450 metros y cruza a 3D y vuelve a 2D', () => {
  expect(TIERRA_BALDIA_1.largo).toBeGreaterThanOrEqual(300);
  expect(TIERRA_BALDIA_1.largo).toBeLessThanOrEqual(450);
  const portales = TIERRA_BALDIA_1.eventos.filter((e) => e.tipo === 'portal').map((e) => e.a);
  expect(portales).toContain(3);
  expect(portales).toContain(2);
});
