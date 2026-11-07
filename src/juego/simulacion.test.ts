import { expect, test } from 'vitest';
import type { Evento, Nivel } from '../datos/niveles/tipos';
import { crearSimulacion, type EventoSim, type Simulacion } from './simulacion';

const DT = 1 / 60;
const nivel = (eventos: Evento[], largo = 1000): Nivel => ({ id: 'prueba', largo, eventos });

/** Avanza `segundos` y junta los eventos. */
function correr(s: Simulacion, segundos: number): EventoSim[] {
  const eventos: EventoSim[] = [];
  for (let i = 0; i < Math.round(segundos / DT); i++) eventos.push(...s.paso(DT));
  return eventos;
}
/** Avanza hasta que la distancia llegue a `metros`. */
function correrHasta(s: Simulacion, metros: number): EventoSim[] {
  const eventos: EventoSim[] = [];
  while (s.distancia < metros && s.estado === 'corriendo') eventos.push(...s.paso(DT));
  return eventos;
}
const tipos = (eventos: EventoSim[]) => eventos.map((e) => e.tipo);

test('corre a 9 m/s al empezar y la velocidad sube hasta 12', () => {
  const s = crearSimulacion(nivel([]));
  correr(s, 1);
  expect(s.distancia).toBeGreaterThan(8.9);
  expect(s.distancia).toBeLessThan(9.2);
  correrHasta(s, 600);
  expect(s.velocidad).toBe(12);
});

test('el salto sube y vuelve al suelo en unos 0,71 s', () => {
  const s = crearSimulacion(nivel([]));
  s.saltar();
  const eventos = s.paso(DT);
  expect(tipos(eventos)).toContain('salto');
  expect(s.y).toBeGreaterThan(0);
  let t = DT;
  const todos: EventoSim[] = [];
  while (s.y > 0) {
    todos.push(...s.paso(DT));
    t += DT;
  }
  expect(t).toBeGreaterThan(0.66);
  expect(t).toBeLessThan(0.76);
  expect(tipos(todos)).toContain('aterrizaje');
});

test('en el aire no se vuelve a saltar sin doble salto', () => {
  const s = crearSimulacion(nivel([]));
  s.saltar();
  correr(s, 0.2);
  const vy = s.vy;
  s.saltar();
  expect(tipos(s.paso(DT))).not.toContain('doble-salto');
  expect(s.vy).toBeLessThan(vy);
});

test('con doble salto se salta otra vez en el aire, una sola vez', () => {
  const s = crearSimulacion(nivel([{ en: 2, tipo: 'habilidad', clase: 'doble' }]));
  expect(tipos(correrHasta(s, 3))).toContain('habilidad');
  expect(s.habilidades.doble).toBeGreaterThan(9);
  s.saltar();
  correr(s, 0.2);
  s.saltar();
  expect(tipos(s.paso(DT))).toContain('doble-salto');
  expect(s.vy).toBeGreaterThan(7);
  correr(s, 0.1);
  s.saltar();
  expect(tipos(s.paso(DT))).not.toContain('doble-salto');
});

test('en 2D no se cambia de carril; en 3D sí, entre −1 y 1', () => {
  const s = crearSimulacion(nivel([{ en: 5, tipo: 'portal', a: 3 }]));
  s.cambiarCarril(1);
  expect(s.carril).toBe(0);
  expect(tipos(correrHasta(s, 6))).toContain('portal');
  expect(s.modo).toBe(3);
  s.cambiarCarril(1);
  s.cambiarCarril(1);
  expect(s.carril).toBe(1);
  correr(s, 1);
  expect(s.z).toBeCloseTo(1.6, 2);
  s.cambiarCarril(-1);
  s.cambiarCarril(-1);
  s.cambiarCarril(-1);
  expect(s.carril).toBe(-1);
});

test('al volver a 2D el carril vuelve al centro', () => {
  const s = crearSimulacion(
    nivel([
      { en: 5, tipo: 'portal', a: 3 },
      { en: 20, tipo: 'portal', a: 2 },
    ]),
  );
  correrHasta(s, 6);
  s.cambiarCarril(1);
  correrHasta(s, 21);
  expect(s.modo).toBe(2);
  expect(s.carril).toBe(0);
});

test('una valla sin saltar quita una vida y da 1,4 s sin daño', () => {
  const s = crearSimulacion(nivel([{ en: 5, tipo: 'valla' }]));
  const eventos = correrHasta(s, 6);
  expect(tipos(eventos)).toContain('golpe');
  expect(s.vidas).toBe(2);
  expect(s.invulnerable).toBeGreaterThan(1.2);
});

test('una valla saltada a tiempo no hace nada', () => {
  const s = crearSimulacion(nivel([{ en: 5, tipo: 'valla' }]));
  correrHasta(s, 3);
  s.saltar();
  expect(tipos(correrHasta(s, 7))).not.toContain('golpe');
  expect(s.vidas).toBe(3);
});

test('una valla alta golpea si no se salta', () => {
  const s = crearSimulacion(nivel([{ en: 5, tipo: 'valla', alto: 1.1 }]));
  correrHasta(s, 6);
  expect(s.vidas).toBe(2);
});

test('un bloque golpea en su carril y no en otro', () => {
  const s = crearSimulacion(
    nivel([
      { en: 5, tipo: 'portal', a: 3 },
      { en: 15, tipo: 'bloque', carril: 1 },
      { en: 30, tipo: 'bloque', carril: 0 },
    ]),
  );
  expect(tipos(correrHasta(s, 20))).not.toContain('golpe');
  expect(tipos(correrHasta(s, 31))).toContain('golpe');
});

test('el escudo absorbe un golpe sin quitar vida', () => {
  const s = crearSimulacion(
    nivel([
      { en: 3, tipo: 'habilidad', clase: 'escudo' },
      { en: 10, tipo: 'valla' },
    ]),
  );
  const eventos = correrHasta(s, 11);
  expect(tipos(eventos)).toContain('escudo-roto');
  expect(s.vidas).toBe(3);
  expect(s.habilidades.escudo).toBe(0);
});

test('el turbo rompe los obstáculos, da 30 puntos y sube la velocidad a 15', () => {
  const s = crearSimulacion(
    nivel([
      { en: 3, tipo: 'habilidad', clase: 'turbo' },
      { en: 10, tipo: 'valla' },
    ]),
  );
  correrHasta(s, 4);
  s.paso(DT);
  expect(s.velocidad).toBe(15);
  const eventos = correrHasta(s, 11);
  expect(tipos(eventos)).toContain('roto');
  expect(s.vidas).toBe(3);
  expect(s.objetos().find((o) => o.evento.tipo === 'valla')?.roto).toBe(true);
  // 25 de la habilidad + 30 del obstáculo roto.
  expect(s.puntaje).toBe(Math.floor(s.distancia) + 55);
});

test('tres golpes son derrota y la simulación se detiene', () => {
  const s = crearSimulacion(
    nivel([
      { en: 5, tipo: 'valla' },
      { en: 25, tipo: 'valla' },
      { en: 45, tipo: 'valla' },
    ]),
  );
  const eventos = correrHasta(s, 60);
  expect(tipos(eventos)).toContain('derrota');
  expect(s.estado).toBe('derrota');
  expect(s.vidas).toBe(0);
  const distancia = s.distancia;
  correr(s, 1);
  expect(s.distancia).toBe(distancia);
});

test('llegar al final del tramo es "fin"', () => {
  const s = crearSimulacion(nivel([], 20));
  expect(tipos(correr(s, 3))).toContain('fin');
  expect(s.estado).toBe('fin');
});

test('"desde" aplica los portales anteriores y salta los demás eventos', () => {
  const s = crearSimulacion(
    nivel([
      { en: 5, tipo: 'valla' },
      { en: 50, tipo: 'portal', a: 3 },
      { en: 100, tipo: 'bloque', carril: 0 },
    ]),
    { desde: 80 },
  );
  expect(s.distancia).toBe(80);
  expect(s.modo).toBe(3);
  correr(s, 0.1);
  expect(s.objetos().map((o) => o.evento.tipo)).toEqual(['bloque']);
});

test('sin daño nunca quita vidas', () => {
  const s = crearSimulacion(nivel([{ en: 5, tipo: 'valla' }]), { sinDanio: true });
  correrHasta(s, 6);
  expect(s.vidas).toBe(3);
});

test('los objetos aparecen 75 m antes y se van 14 m después', () => {
  const s = crearSimulacion(nivel([{ en: 100, tipo: 'valla' }], 500), { sinDanio: true });
  correrHasta(s, 24);
  expect(s.objetos()).toHaveLength(0);
  correrHasta(s, 26);
  expect(s.objetos()).toHaveLength(1);
  expect(s.objetos()[0].x).toBeCloseTo(100 - s.distancia, 5);
  correrHasta(s, 115);
  expect(s.objetos()).toHaveLength(0);
});

test('el puntaje son los metros enteros más los bonos', () => {
  const s = crearSimulacion(nivel([{ en: 3, tipo: 'habilidad', clase: 'escudo' }]));
  correrHasta(s, 10);
  expect(s.puntaje).toBe(Math.floor(s.distancia) + 25);
});

// Revisión final: morir en medio de un salto dejaba al corredor flotando.
test('si pierde en el aire, cae hasta el suelo aunque la carrera ya terminó', () => {
  const s = crearSimulacion(
    nivel([
      { en: 1, tipo: 'portal', a: 3 },
      { en: 20, tipo: 'bloque', carril: 0 },
      { en: 40, tipo: 'bloque', carril: 0 },
      { en: 60, tipo: 'bloque', carril: 0 },
    ]),
  );
  correrHasta(s, 57);
  expect(s.vidas).toBe(1);
  s.saltar();
  correrHasta(s, 70);
  expect(s.estado).toBe('derrota');
  expect(s.y).toBeGreaterThan(0);
  const distancia = s.distancia;
  correr(s, 1);
  expect(s.y).toBe(0);
  expect(s.distancia).toBe(distancia);
});
