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

// Etapa 3: rodar, caída rápida, vigas y "¡Justo!".

/**
 * Avanza hasta que falten entre `segundos` y `segundos + DT` para que el objeto en `en` toque el
 * borde del corredor (a `borde` metros). La acción siguiente empieza justo ahí.
 */
function correrHastaContacto(s: Simulacion, en: number, borde: number, segundos: number): EventoSim[] {
  const eventos: EventoSim[] = [];
  while ((en - (s.distancia + s.velocidad * DT) - borde) / s.velocidad >= segundos) eventos.push(...s.paso(DT));
  return eventos;
}
const BORDE_VALLA = 0.32;
const BORDE_VIGA = 0.35;
const justos = (eventos: EventoSim[]) => eventos.filter((e) => e.tipo === 'justo');

test('rodar en el suelo dura 0,7 s y luego vuelve a correr', () => {
  const s = crearSimulacion(nivel([]));
  correr(s, 0.5);
  s.rodar();
  expect(tipos(s.paso(DT))).toContain('rodar');
  expect(s.postura).toBe('rodando');
  correr(s, 0.6);
  expect(s.postura).toBe('rodando');
  correr(s, 0.15);
  expect(s.postura).toBe('corriendo');
});

test('rodar otra vez en medio vuelve a empezar los 0,7 s', () => {
  const s = crearSimulacion(nivel([]));
  s.rodar();
  correr(s, 0.5);
  s.rodar();
  correr(s, 0.5);
  expect(s.postura).toBe('rodando');
  correr(s, 0.25);
  expect(s.postura).toBe('corriendo');
});

test('saltar en medio del giro lo corta y salta', () => {
  const s = crearSimulacion(nivel([]));
  s.rodar();
  correr(s, 0.2);
  s.saltar();
  expect(tipos(s.paso(DT))).toContain('salto');
  expect(s.postura).toBe('corriendo');
  expect(s.y).toBeGreaterThan(0);
});

test('en 3D se cambia de carril rodando', () => {
  const s = crearSimulacion(nivel([{ en: 2, tipo: 'portal', a: 3 }]));
  correrHasta(s, 3);
  s.rodar();
  s.cambiarCarril(1);
  expect(s.carril).toBe(1);
  expect(s.postura).toBe('rodando');
});

test('una viga golpea de pie y saltando, y se pasa rodando', () => {
  const dePie = crearSimulacion(nivel([{ en: 10, tipo: 'viga' }]));
  expect(tipos(correrHasta(dePie, 12))).toContain('golpe');
  expect(dePie.vidas).toBe(2);

  const rodando = crearSimulacion(nivel([{ en: 10, tipo: 'viga' }]));
  correrHastaContacto(rodando, 10, BORDE_VIGA, 0.3);
  rodando.rodar();
  expect(tipos(correrHasta(rodando, 12))).not.toContain('golpe');
  expect(rodando.vidas).toBe(3);

  const saltando = crearSimulacion(nivel([{ en: 10, tipo: 'viga' }]));
  correrHastaContacto(saltando, 10, BORDE_VIGA, 0.3);
  saltando.saltar();
  expect(tipos(correrHasta(saltando, 12))).toContain('golpe');
});

test('con turbo la viga se rompe', () => {
  const s = crearSimulacion(nivel([{ en: 2, tipo: 'habilidad', clase: 'turbo' }, { en: 20, tipo: 'viga' }]));
  const eventos = correrHasta(s, 22);
  expect(tipos(eventos)).toContain('roto');
  expect(tipos(eventos)).not.toContain('golpe');
  expect(s.vidas).toBe(3);
});

test('rodar en el aire es la caída rápida, y al tocar el suelo rueda', () => {
  const s = crearSimulacion(nivel([]));
  s.saltar();
  correr(s, 0.2);
  s.rodar();
  expect(s.vy).toBe(-22);
  expect(s.caidaRapida).toBe(true);
  const eventos = s.paso(DT);
  expect(tipos(eventos)).toContain('caida-rapida');
  const resto = [...eventos];
  while (s.y > 0) resto.push(...s.paso(DT));
  resto.push(...s.paso(DT));
  const t = tipos(resto);
  expect(t.indexOf('aterrizaje')).toBeGreaterThan(-1);
  expect(t.indexOf('rodar')).toBeGreaterThan(t.indexOf('aterrizaje'));
  expect(s.postura).toBe('rodando');
  expect(s.caidaRapida).toBe(false);
});

test('después de la caída rápida no hay doble salto hasta tocar el suelo', () => {
  const s = crearSimulacion(nivel([{ en: 2, tipo: 'habilidad', clase: 'doble' }]));
  correrHasta(s, 3);
  s.saltar();
  correr(s, 0.2);
  s.rodar();
  s.paso(DT);
  s.saltar();
  expect(tipos(s.paso(DT))).not.toContain('doble-salto');
});

test('"¡Justo!": saltar una valla en el último momento da 50 puntos', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'valla' }]));
  correrHastaContacto(s, 20, BORDE_VALLA, 0.1);
  s.saltar();
  const eventos = correr(s, 1);
  expect(tipos(eventos)).not.toContain('golpe');
  expect(justos(eventos)).toEqual([{ tipo: 'justo', puntos: 50 }]);
  expect(s.puntaje).toBe(Math.floor(s.distancia) + 50);
});

test('"¡Justo!": saltar con tiempo de sobra no lo da', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'valla' }]));
  correrHastaContacto(s, 20, BORDE_VALLA, 0.5);
  s.saltar();
  const eventos = correr(s, 1);
  expect(tipos(eventos)).not.toContain('golpe');
  expect(justos(eventos)).toEqual([]);
  expect(s.puntaje).toBe(Math.floor(s.distancia));
});

test('"¡Justo!": rodar bajo una viga en el último momento', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'viga' }]));
  correrHastaContacto(s, 20, BORDE_VIGA, 0.1);
  s.rodar();
  const eventos = correr(s, 1);
  expect(tipos(eventos)).not.toContain('golpe');
  expect(justos(eventos)).toEqual([{ tipo: 'justo', puntos: 50 }]);
});

test('"¡Justo!": un obstáculo que golpea nunca lo da', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'valla' }]));
  correrHastaContacto(s, 20, BORDE_VALLA, 0.02);
  s.saltar();
  const eventos = correr(s, 1);
  expect(tipos(eventos)).toContain('golpe');
  expect(justos(eventos)).toEqual([]);
});
