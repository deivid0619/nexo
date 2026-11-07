import { expect, test } from 'vitest';
import type { Evento, Nivel } from './tipos';
import { validarNivel } from './validar';

const nivel = (eventos: Evento[], largo = 200): Nivel => ({ id: 'prueba', largo, eventos });
const a3D: Evento = { en: 10, tipo: 'portal', a: 3 };

test('un nivel válido no tiene problemas', () => {
  expect(
    validarNivel(
      nivel([
        { en: 5, tipo: 'valla' },
        a3D,
        { en: 20, tipo: 'bloque', carril: 0 },
        { en: 25, tipo: 'habilidad', clase: 'escudo', carril: 1 },
        { en: 40, tipo: 'portal', a: 2 },
        { en: 50, tipo: 'habilidad', clase: 'doble' },
      ]),
    ),
  ).toEqual([]);
});

test('eventos fuera de orden o fuera del tramo', () => {
  const problemas = validarNivel(
    nivel([
      { en: 30, tipo: 'valla' },
      { en: 20, tipo: 'valla' },
      { en: 0, tipo: 'valla' },
      { en: 250, tipo: 'valla' },
    ]),
  );
  expect(problemas).toHaveLength(3);
  expect(problemas[0]).toMatch(/evento 1 \(valla\)/);
});

test('un bloque en un tramo 2D', () => {
  expect(validarNivel(nivel([{ en: 20, tipo: 'bloque', carril: 0 }]))[0]).toMatch(/evento 0 \(bloque\).*2D/);
});

test('habilidad sin carril en 3D o con carril en 2D', () => {
  expect(validarNivel(nivel([{ en: 5, tipo: 'habilidad', clase: 'turbo', carril: 1 }]))).toHaveLength(1);
  expect(validarNivel(nivel([a3D, { en: 20, tipo: 'habilidad', clase: 'turbo' }]))).toHaveLength(1);
});

test('tres bloques juntos dejan sin carril libre', () => {
  const problemas = validarNivel(
    nivel([
      a3D,
      { en: 30, tipo: 'bloque', carril: -1 },
      { en: 30.5, tipo: 'bloque', carril: 0 },
      { en: 31, tipo: 'bloque', carril: 1 },
    ]),
  );
  expect(problemas).toHaveLength(1);
  expect(problemas[0]).toMatch(/sin carril libre/);
});

test('tres bloques separados sí se pueden esquivar', () => {
  expect(
    validarNivel(
      nivel([
        a3D,
        { en: 30, tipo: 'bloque', carril: -1 },
        { en: 30, tipo: 'bloque', carril: 0 },
        { en: 40, tipo: 'bloque', carril: 1 },
      ]),
    ),
  ).toEqual([]);
});

test('un portal al mismo modo en que ya se está', () => {
  expect(validarNivel(nivel([{ en: 10, tipo: 'portal', a: 2 }]))[0]).toMatch(/evento 0 \(portal\)/);
});
