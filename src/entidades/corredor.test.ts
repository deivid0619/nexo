import { expect, test } from 'vitest';
import { elegirAnimacion, type Recientes } from './corredor';

const nada: Recientes = { golpe: false, aterrizaje: false, escudoRoto: false, dobleSalto: false, disparo: false };
const base = {
  estado: 'corriendo' as const,
  postura: 'corriendo' as const,
  y: 0,
  vy: 0,
  suelo: 0 as number | null,
  caidaRapida: false,
  recientes: nada,
};
const con = (r: Partial<Recientes>) => ({ ...nada, ...r });

test('en el suelo corre', () => {
  expect(elegirAnimacion(base)).toBe('correr');
});

test('al despegar y en el aire', () => {
  expect(elegirAnimacion({ ...base, y: 0.2, vy: 7 })).toBe('despegar');
  expect(elegirAnimacion({ ...base, y: 1.2, vy: 1 })).toBe('aire');
  expect(elegirAnimacion({ ...base, y: 0.6, vy: -5 })).toBe('aire');
});

test('en el aire: caída rápida y doble salto', () => {
  expect(elegirAnimacion({ ...base, y: 1, vy: -20, caidaRapida: true })).toBe('caer-rapido');
  expect(elegirAnimacion({ ...base, y: 1.6, vy: 7, recientes: con({ dobleSalto: true }) })).toBe('doble-salto');
});

test('el aire se mide desde el suelo que hay debajo', () => {
  // Encima de un contenedor corre; al caerse de él, está en el aire.
  expect(elegirAnimacion({ ...base, y: 2, suelo: 2 })).toBe('correr');
  expect(elegirAnimacion({ ...base, y: 1.5, vy: -3, suelo: 0 })).toBe('aire');
  // Saltando sobre un foso también.
  expect(elegirAnimacion({ ...base, y: 0.8, vy: 2, suelo: null })).toBe('aire');
});

test('al aterrizar', () => {
  expect(elegirAnimacion({ ...base, recientes: con({ aterrizaje: true }) })).toBe('aterrizar');
});

test('un golpe reciente gana sobre correr y saltar; después va el escudo roto', () => {
  expect(elegirAnimacion({ ...base, recientes: con({ golpe: true }) })).toBe('golpe');
  expect(elegirAnimacion({ ...base, y: 1, vy: 2, recientes: con({ golpe: true }) })).toBe('golpe');
  expect(elegirAnimacion({ ...base, recientes: con({ escudoRoto: true }) })).toBe('escudo-roto');
  expect(elegirAnimacion({ ...base, recientes: con({ golpe: true, escudoRoto: true }) })).toBe('golpe');
});

test('las posturas ganan sobre los golpes: foso, trepar, colgado y rodar', () => {
  const golpe = con({ golpe: true, aterrizaje: true });
  expect(elegirAnimacion({ ...base, postura: 'foso', y: -1, vy: -5, suelo: null, recientes: golpe })).toBe('foso');
  expect(elegirAnimacion({ ...base, postura: 'trepando', y: 1, recientes: golpe })).toBe('trepar');
  expect(elegirAnimacion({ ...base, postura: 'colgado', y: 1.5, suelo: null, recientes: golpe })).toBe('colgado');
  expect(elegirAnimacion({ ...base, postura: 'rodando', recientes: golpe })).toBe('rodar');
});

test('derrota es morir y fin es celebrar, antes que todo', () => {
  expect(elegirAnimacion({ ...base, estado: 'derrota', postura: 'foso', recientes: con({ golpe: true }) })).toBe('morir');
  expect(elegirAnimacion({ ...base, estado: 'fin' })).toBe('celebrar');
});
