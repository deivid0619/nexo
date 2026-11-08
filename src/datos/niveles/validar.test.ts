import { expect, test } from 'vitest';
import type { Evento, Nivel } from './tipos';
import { FOSO_CON_CABLE_M, FOSO_SALTABLE_M, validarNivel } from './validar';

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

// Etapa 3: los obstáculos nuevos.

test('contenedor: con carril solo en 3D, y de 4 a 12 m de largo', () => {
  expect(validarNivel(nivel([a3D, { en: 20, tipo: 'contenedor', largo: 6 }]))).toEqual([
    expect.stringMatching(/evento 1 \(contenedor\).*carril/),
  ]);
  expect(validarNivel(nivel([{ en: 20, tipo: 'contenedor', largo: 6, carril: 0 }]))).toEqual([
    expect.stringMatching(/evento 0 \(contenedor\).*carril/),
  ]);
  expect(validarNivel(nivel([{ en: 20, tipo: 'contenedor', largo: 3 }]))).toEqual([
    expect.stringMatching(/evento 0 \(contenedor\).*largo/),
  ]);
  expect(validarNivel(nivel([{ en: 20, tipo: 'contenedor', largo: 13 }]))).toEqual([
    expect.stringMatching(/evento 0 \(contenedor\).*largo/),
  ]);
});

test('foso: se salta hasta 4 m y lleva cable desde 9 m; en medio no sirve', () => {
  expect(FOSO_SALTABLE_M).toBe(4);
  expect(FOSO_CON_CABLE_M).toBe(9);
  expect(validarNivel(nivel([{ en: 20, tipo: 'foso', largo: 4 }]))).toEqual([]);
  expect(validarNivel(nivel([{ en: 20, tipo: 'foso', largo: 6 }]))).toEqual([
    expect.stringMatching(/evento 0 \(foso\).*largo/),
  ]);
});

test('foso largo sin cable en su borde, o en 3D', () => {
  expect(validarNivel(nivel([{ en: 20, tipo: 'foso', largo: 10 }]))).toEqual([
    expect.stringMatching(/evento 0 \(foso\).*cable/),
  ]);
  const problemas = validarNivel(nivel([a3D, { en: 20, tipo: 'foso', largo: 10 }, { en: 20, tipo: 'cable' }]));
  expect(problemas).toContainEqual(expect.stringMatching(/evento 1 \(foso\).*3D/));
});

test('cable en 3D, o que no está al principio de un foso largo', () => {
  expect(validarNivel(nivel([{ en: 20, tipo: 'cable' }]))).toEqual([expect.stringMatching(/evento 0 \(cable\).*foso/)]);
  expect(validarNivel(nivel([{ en: 20, tipo: 'foso', largo: 3 }, { en: 20, tipo: 'cable' }]))).toEqual([
    expect.stringMatching(/evento 1 \(cable\).*foso/),
  ]);
  expect(validarNivel(nivel([a3D, { en: 20, tipo: 'cable' }]))).toContainEqual(
    expect.stringMatching(/evento 1 \(cable\).*3D/),
  );
});

test('nada cae dentro de un foso, salvo el cable de su borde', () => {
  expect(
    validarNivel(nivel([{ en: 20, tipo: 'foso', largo: 10 }, { en: 20, tipo: 'cable' }, { en: 25, tipo: 'valla' }])),
  ).toEqual([expect.stringMatching(/evento 2 \(valla\).*foso/)]);
  // En el borde lejano ya hay suelo.
  expect(validarNivel(nivel([{ en: 20, tipo: 'foso', largo: 4 }, { en: 24, tipo: 'valla' }]))).toEqual([]);
});

test('arma: solo en 3D, y una sola hasta su EMP', () => {
  expect(validarNivel(nivel([{ en: 20, tipo: 'arma' }, { en: 30, tipo: 'emp' }]))).toContainEqual(
    expect.stringMatching(/evento 0 \(arma\).*2D/),
  );
  expect(
    validarNivel(nivel([a3D, { en: 20, tipo: 'arma' }, { en: 30, tipo: 'arma' }, { en: 40, tipo: 'emp' }])),
  ).toEqual([expect.stringMatching(/evento 2 \(arma\)/)]);
});

test('un EMP sin arma antes', () => {
  expect(validarNivel(nivel([a3D, { en: 40, tipo: 'emp' }]))).toEqual([expect.stringMatching(/evento 1 \(emp\).*arma/)]);
});

test('un arma sin EMP antes del siguiente portal o del final', () => {
  expect(validarNivel(nivel([a3D, { en: 20, tipo: 'arma' }, { en: 50, tipo: 'portal', a: 2 }]))).toEqual([
    expect.stringMatching(/evento 1 \(arma\).*EMP/),
  ]);
  expect(validarNivel(nivel([a3D, { en: 20, tipo: 'arma' }]))).toEqual([expect.stringMatching(/evento 1 \(arma\).*EMP/)]);
});

test('un dron en 2D', () => {
  expect(validarNivel(nivel([{ en: 20, tipo: 'dron', carril: 0 }]))).toEqual([
    expect.stringMatching(/evento 0 \(dron\).*2D/),
  ]);
});

test('la misma pista en dos eventos', () => {
  expect(
    validarNivel(nivel([{ en: 20, tipo: 'viga', pista: 'rodar' }, { en: 30, tipo: 'viga', pista: 'rodar' }])),
  ).toEqual([expect.stringMatching(/evento 1 \(viga\).*pista/)]);
});

test('un tramo con todos los obstáculos nuevos es válido', () => {
  expect(
    validarNivel(
      nivel([
        { en: 10, tipo: 'viga', pista: 'rodar' },
        { en: 20, tipo: 'valla', pista: 'caer' },
        { en: 30, tipo: 'contenedor', largo: 6, pista: 'trepar' },
        { en: 50, tipo: 'foso', largo: 3 },
        { en: 70, tipo: 'foso', largo: 10, pista: 'cable' },
        { en: 70, tipo: 'cable' },
        { en: 100, tipo: 'portal', a: 3 },
        { en: 110, tipo: 'contenedor', largo: 8, carril: 1 },
        { en: 130, tipo: 'arma' },
        { en: 140, tipo: 'dron', carril: -1 },
        { en: 150, tipo: 'dron', carril: 0 },
        { en: 170, tipo: 'emp' },
        { en: 180, tipo: 'viga' },
      ]),
    ),
  ).toEqual([]);
});
