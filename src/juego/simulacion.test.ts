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

// Etapa 3: suelo variable (contenedores y fosos).

const BORDE_CONTENEDOR = 0.3;
const cuantos = (eventos: EventoSim[], tipo: EventoSim['tipo']) => eventos.filter((e) => e.tipo === tipo).length;
/** Salta 0,1 s antes de tocar el frente del contenedor y espera a que termine de trepar. */
function treparContenedor(s: Simulacion, en: number): EventoSim[] {
  const eventos = correrHastaContacto(s, en, BORDE_CONTENEDOR, 0.1);
  s.saltar();
  eventos.push(...correr(s, 0.6));
  return eventos;
}

test('saltar contra un contenedor lo trepa en 0,45 s, sin golpe', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 10 }]));
  const eventos = correrHastaContacto(s, 20, BORDE_CONTENEDOR, 0.1);
  s.saltar();
  while (s.postura !== 'trepando' && s.distancia < 21) eventos.push(...s.paso(DT));
  expect(tipos(eventos)).toContain('trepar');
  expect(s.postura).toBe('trepando');
  eventos.push(...correr(s, 0.47));
  expect(s.y).toBe(2);
  expect(s.postura).toBe('corriendo');
  expect(s.suelo).toBe(2);
  expect(tipos(eventos)).not.toContain('golpe');
  expect(s.vidas).toBe(3);
});

test('llegar por el suelo a un contenedor golpea y sube en 0,8 s', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 12 }]));
  const eventos = correrHasta(s, 19.5);
  while (s.postura !== 'trepando' && s.distancia < 21) eventos.push(...s.paso(DT));
  expect(tipos(eventos)).toEqual(expect.arrayContaining(['golpe', 'trepar']));
  expect(s.vidas).toBe(2);
  correr(s, 0.7);
  expect(s.postura).toBe('trepando');
  correr(s, 0.15);
  expect(s.postura).toBe('corriendo');
  expect(s.y).toBe(2);
});

test('por el suelo con escudo rompe el escudo y sube; con turbo sube sin golpe', () => {
  const escudo = crearSimulacion(
    nivel([
      { en: 2, tipo: 'habilidad', clase: 'escudo' },
      { en: 20, tipo: 'contenedor', largo: 12 },
    ]),
  );
  const e1 = correrHasta(escudo, 29);
  expect(tipos(e1)).toEqual(expect.arrayContaining(['escudo-roto', 'trepar']));
  expect(escudo.vidas).toBe(3);
  expect(escudo.y).toBe(2);

  const turbo = crearSimulacion(
    nivel([
      { en: 2, tipo: 'habilidad', clase: 'turbo' },
      { en: 20, tipo: 'contenedor', largo: 12 },
    ]),
  );
  const e2 = correrHasta(turbo, 29);
  expect(tipos(e2)).toContain('trepar');
  expect(tipos(e2)).not.toContain('golpe');
  expect(turbo.vidas).toBe(3);
  expect(turbo.y).toBe(2);
});

test('encima del contenedor se salta (vuelve a 2) y se rueda', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 12 }]));
  treparContenedor(s, 20);
  expect(s.y).toBe(2);
  s.saltar();
  const eventos = s.paso(DT);
  while (s.y > 2) eventos.push(...s.paso(DT));
  expect(tipos(eventos)).toEqual(expect.arrayContaining(['salto', 'aterrizaje']));
  expect(s.y).toBe(2);
  s.rodar();
  s.paso(DT);
  expect(s.postura).toBe('rodando');
  expect(s.y).toBe(2);
});

test('al pasar el final del contenedor cae al suelo sin saltar', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 6 }]));
  treparContenedor(s, 20);
  const eventos = correrHasta(s, 31);
  expect(tipos(eventos)).toContain('aterrizaje');
  expect(tipos(eventos)).not.toContain('salto');
  expect(s.y).toBe(0);
  expect(s.suelo).toBe(0);
});

test('con doble salto se cae encima del contenedor, sin trepar ni golpe', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'habilidad', clase: 'doble' },
      { en: 30, tipo: 'contenedor', largo: 10 },
    ]),
  );
  correrHasta(s, 24);
  s.saltar();
  const eventos = correr(s, 0.35);
  s.saltar();
  eventos.push(...correrHasta(s, 34));
  expect(tipos(eventos)).not.toContain('trepar');
  expect(tipos(eventos)).not.toContain('golpe');
  expect(s.y).toBe(2);
});

test('"¡Justo!" al trepar: saltar 0,1 s antes de tocar el frente sí, 0,5 s antes no', () => {
  const justo = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 10 }]));
  expect(justos(treparContenedor(justo, 20))).toEqual([{ tipo: 'justo', puntos: 50 }]);

  const temprano = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 10 }]));
  const eventos = correrHastaContacto(temprano, 20, BORDE_CONTENEDOR, 0.5);
  temprano.saltar();
  eventos.push(...correr(temprano, 1));
  expect(tipos(eventos)).toContain('trepar');
  expect(justos(eventos)).toEqual([]);
});

test('3D: un contenedor en el carril 1 no afecta al carril 0', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'portal', a: 3 },
      { en: 20, tipo: 'contenedor', largo: 6, carril: 1 },
    ]),
  );
  const eventos = correrHasta(s, 30);
  expect(tipos(eventos)).not.toContain('trepar');
  expect(tipos(eventos)).not.toContain('golpe');
  expect(s.y).toBe(0);
});

test('3D: cambiar de carril encima de un contenedor hace caer al suelo', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'portal', a: 3 },
      { en: 20, tipo: 'contenedor', largo: 12, carril: 0 },
    ]),
  );
  treparContenedor(s, 20);
  expect(s.y).toBe(2);
  s.cambiarCarril(1);
  const eventos = correr(s, 0.6);
  expect(tipos(eventos)).toContain('aterrizaje');
  expect(tipos(eventos)).not.toContain('salto');
  expect(s.y).toBe(0);
});

test('3D: cambiar de carril contra el costado de un contenedor da un solo golpe y sube', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'portal', a: 3 },
      { en: 20, tipo: 'contenedor', largo: 12, carril: 1 },
    ]),
  );
  correrHasta(s, 21);
  s.cambiarCarril(1);
  const eventos = correr(s, 1);
  expect(cuantos(eventos, 'golpe')).toBe(1);
  expect(tipos(eventos)).toContain('trepar');
  expect(s.vidas).toBe(2);
  expect(s.y).toBe(2);
  expect(s.carril).toBe(1);
});

test('3D: rodar o cambiar de carril mientras trepa no cambia nada', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'portal', a: 3 },
      { en: 20, tipo: 'contenedor', largo: 12, carril: 0 },
    ]),
  );
  correrHastaContacto(s, 20, BORDE_CONTENEDOR, 0.1);
  s.saltar();
  while (s.postura !== 'trepando' && s.distancia < 21) s.paso(DT);
  s.rodar();
  s.cambiarCarril(1);
  const eventos = s.paso(DT);
  expect(tipos(eventos)).not.toContain('rodar');
  expect(tipos(eventos)).not.toContain('carril');
  expect(s.postura).toBe('trepando');
  expect(s.carril).toBe(0);
  correr(s, 0.5);
  expect(s.y).toBe(2);
  expect(s.postura).toBe('corriendo');
});

test('foso corto: saltándolo no pasa nada', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'foso', largo: 3 }]));
  correrHastaContacto(s, 20, 0, 0.25);
  s.saltar();
  const eventos = correrHasta(s, 26);
  expect(tipos(eventos)).not.toContain('foso');
  expect(tipos(eventos)).not.toContain('golpe');
  expect(s.vidas).toBe(3);
});

test('foso corto: sin saltar se cae, quita una vida y reaparece al otro lado', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'foso', largo: 3 }]));
  const eventos = correrHasta(s, 21);
  expect(s.suelo).toBeNull();
  expect(tipos(eventos)).toEqual(expect.arrayContaining(['foso', 'golpe']));
  expect(s.vidas).toBe(2);
  expect(s.postura).toBe('foso');
  expect(s.y).toBeLessThan(0);
  // En el foso no se salta ni se rueda.
  s.saltar();
  s.rodar();
  const dentro = s.paso(DT);
  expect(tipos(dentro)).not.toContain('salto');
  expect(tipos(dentro)).not.toContain('rodar');
  expect(s.postura).toBe('foso');
  correrHasta(s, 23.2);
  expect(s.y).toBe(0);
  expect(s.postura).toBe('corriendo');
  expect(s.invulnerable).toBeGreaterThan(1.3);
});

test('foso corto: con escudo rompe el escudo; el turbo no lo evita', () => {
  const escudo = crearSimulacion(
    nivel([
      { en: 2, tipo: 'habilidad', clase: 'escudo' },
      { en: 20, tipo: 'foso', largo: 3 },
    ]),
  );
  expect(tipos(correrHasta(escudo, 24))).toEqual(expect.arrayContaining(['foso', 'escudo-roto']));
  expect(escudo.vidas).toBe(3);

  const turbo = crearSimulacion(
    nivel([
      { en: 2, tipo: 'habilidad', clase: 'turbo' },
      { en: 20, tipo: 'foso', largo: 3 },
    ]),
  );
  expect(tipos(correrHasta(turbo, 24))).toContain('foso');
  expect(turbo.vidas).toBe(2);
});

test('perder la última vida en un foso es derrota y el corredor no vuelve arriba', () => {
  const s = crearSimulacion(
    nivel([
      { en: 20, tipo: 'foso', largo: 3 },
      { en: 45, tipo: 'foso', largo: 3 },
      { en: 70, tipo: 'foso', largo: 3 },
    ]),
  );
  const eventos = correrHasta(s, 80);
  expect(tipos(eventos)).toContain('derrota');
  expect(s.estado).toBe('derrota');
  expect(s.vidas).toBe(0);
  correr(s, 1);
  expect(s.y).toBeLessThan(0);
  expect(s.postura).toBe('foso');
});

// Etapa 3: el cable sobre un foso largo.

/** Un foso de 12 m con su cable, a `en` metros; desde un poco antes para probar a 9 y a 12 m/s. */
const conCable = (en: number) =>
  crearSimulacion(
    nivel(
      [
        { en, tipo: 'foso', largo: 12 },
        { en, tipo: 'cable' },
      ],
      en + 100,
    ),
    { desde: en - 10 },
  );
/** Salta 0,3 s antes del borde y espera a agarrarse del cable. */
function colgarse(s: Simulacion, en: number): EventoSim[] {
  const eventos = correrHastaContacto(s, en, 0, 0.3);
  s.saltar();
  while (s.postura !== 'colgado' && s.distancia < en + 2) eventos.push(...s.paso(DT));
  return eventos;
}
/** Espera a que el vaivén llegue a `u`, suelta y sigue hasta pasar el foso. */
function soltarEn(s: Simulacion, en: number, u: number): EventoSim[] {
  const eventos: EventoSim[] = [];
  while ((s.vaiven ?? 1) < u) eventos.push(...s.paso(DT));
  s.soltar();
  eventos.push(...correrHasta(s, en + 26));
  return eventos;
}
const VELOCIDADES = [
  { nombre: '9 m/s', en: 20 },
  { nombre: '12 m/s', en: 620 },
];

test('saltar hacia el cable lo agarra y se balancea hacia arriba', () => {
  const s = conCable(20);
  const eventos = colgarse(s, 20);
  expect(tipos(eventos)).toContain('agarre');
  expect(s.postura).toBe('colgado');
  const u0 = s.vaiven!;
  const y0 = s.y;
  correr(s, 0.5);
  expect(s.vaiven!).toBeGreaterThan(u0);
  expect(s.y).toBeGreaterThan(y0);
  expect(s.velocidad).toBeGreaterThan(9);
});

test('llegar al cable por el suelo cae al foso', () => {
  const s = conCable(20);
  const eventos = correrHasta(s, 22);
  expect(tipos(eventos)).not.toContain('agarre');
  expect(tipos(eventos)).toEqual(expect.arrayContaining(['foso', 'golpe']));
});

for (const { nombre, en } of VELOCIDADES) {
  test(`cable a ${nombre}: soltar en el centro de la franja pasa y da "¡Justo!"`, () => {
    const s = conCable(en);
    colgarse(s, en);
    const eventos = soltarEn(s, en, 0.8);
    expect(tipos(eventos)).toContain('soltar');
    expect(tipos(eventos)).not.toContain('foso');
    expect(justos(eventos)).toEqual([{ tipo: 'justo', puntos: 50 }]);
    expect(s.vidas).toBe(3);
    expect(s.y).toBe(0);
  });

  test(`cable a ${nombre}: soltar al principio de la franja pasa sin "¡Justo!"`, () => {
    const s = conCable(en);
    colgarse(s, en);
    const eventos = soltarEn(s, en, 0.65);
    expect(tipos(eventos)).not.toContain('foso');
    expect(justos(eventos)).toEqual([]);
    expect(s.vidas).toBe(3);
  });

  test(`cable a ${nombre}: soltar muy pronto cae al foso`, () => {
    const s = conCable(en);
    colgarse(s, en);
    const eventos = soltarEn(s, en, 0.3);
    expect(tipos(eventos)).toEqual(expect.arrayContaining(['foso', 'golpe']));
    expect(s.vidas).toBe(2);
  });

  test(`cable a ${nombre}: sin tocar se suelta solo al final y pasa`, () => {
    const s = conCable(en);
    colgarse(s, en);
    const eventos = correrHasta(s, en + 26);
    expect(tipos(eventos)).toContain('soltar');
    expect(tipos(eventos)).not.toContain('foso');
    expect(justos(eventos)).toEqual([]);
    expect(s.vidas).toBe(3);
  });
}

test('colgado, saltar también suelta', () => {
  const s = conCable(20);
  colgarse(s, 20);
  correr(s, 0.8);
  s.saltar();
  const eventos = s.paso(DT);
  expect(tipos(eventos)).toContain('soltar');
  expect(tipos(eventos)).not.toContain('salto');
  expect(s.postura).toBe('corriendo');
  expect(s.vaiven).toBeNull();
});

test('colgado, rodar y cambiar de carril no hacen nada', () => {
  const s = conCable(20);
  colgarse(s, 20);
  s.rodar();
  s.cambiarCarril(1);
  const eventos = s.paso(DT);
  expect(tipos(eventos)).not.toContain('rodar');
  expect(tipos(eventos)).not.toContain('caida-rapida');
  expect(tipos(eventos)).not.toContain('carril');
  expect(s.postura).toBe('colgado');
  expect(s.caidaRapida).toBe(false);
});

// Etapa 3: arma, disparos, drones y EMP.

/** Una zona de armas en 3D: arma a 10 m, drones a 40 m (carril 0) y 60 m (carril 1), EMP a 90 m. */
const ZONA: Evento[] = [
  { en: 2, tipo: 'portal', a: 3 },
  { en: 10, tipo: 'arma' },
  { en: 40, tipo: 'dron', carril: 0 },
  { en: 60, tipo: 'dron', carril: 1 },
  { en: 90, tipo: 'emp' },
];
const dronEn = (s: Simulacion, en: number) => s.objetos().find((o) => o.evento.tipo === 'dron' && o.evento.en === en)!;

test('pasar la estación da el arma', () => {
  const s = crearSimulacion(nivel(ZONA));
  expect(s.armado).toBe(false);
  expect(tipos(correrHasta(s, 11))).toContain('arma');
  expect(s.armado).toBe(true);
});

test('sin arma, disparar no hace nada', () => {
  const s = crearSimulacion(nivel(ZONA));
  correrHasta(s, 5);
  s.disparar();
  expect(tipos(s.paso(DT))).not.toContain('disparo');
  expect(s.balas()).toHaveLength(0);
});

test('con arma, cada disparo saca una bala por el carril, con cadencia de 0,15 s', () => {
  const s = crearSimulacion(nivel(ZONA));
  correrHasta(s, 11);
  s.cambiarCarril(1);
  s.disparar();
  const eventos = s.paso(DT);
  expect(tipos(eventos)).toContain('disparo');
  expect(s.balas()).toHaveLength(1);
  expect(s.balas()[0].carril).toBe(1);
  correr(s, 0.05);
  s.disparar();
  expect(tipos(s.paso(DT))).not.toContain('disparo');
  expect(s.balas()).toHaveLength(1);
  correr(s, 0.1);
  s.disparar();
  expect(tipos(s.paso(DT))).toContain('disparo');
  expect(s.balas()).toHaveLength(2);
});

test('la bala se va a los 45 m', () => {
  const s = crearSimulacion(nivel(ZONA));
  correrHasta(s, 11);
  s.cambiarCarril(-1);
  s.disparar();
  correr(s, 1.0);
  expect(s.balas()).toHaveLength(1);
  correr(s, 0.2);
  expect(s.balas()).toHaveLength(0);
});

test('una bala en su carril derriba al dron: +50 y queda roto', () => {
  const s = crearSimulacion(nivel(ZONA));
  correrHasta(s, 12);
  const dron = dronEn(s, 40);
  s.disparar();
  const eventos = correr(s, 1.2);
  expect(eventos).toContainEqual({ tipo: 'dron', id: dron.id });
  expect(dron.roto).toBe(true);
  expect(s.puntaje).toBe(Math.floor(s.distancia) + 50);
  expect(tipos(correrHasta(s, 42))).not.toContain('golpe');
});

test('una bala en otro carril no lo toca', () => {
  const s = crearSimulacion(nivel(ZONA));
  correrHasta(s, 41);
  const dron = dronEn(s, 60);
  s.disparar();
  const eventos = correrHasta(s, 70);
  expect(eventos.filter((e) => e.tipo === 'dron')).toEqual([]);
  expect(dron.roto).toBe(false);
});

test('chocar un dron quita una vida; rodando se pasa por debajo', () => {
  const choca = crearSimulacion(nivel(ZONA));
  expect(tipos(correrHasta(choca, 42))).toContain('golpe');
  expect(choca.vidas).toBe(2);

  const rueda = crearSimulacion(nivel(ZONA));
  correrHastaContacto(rueda, 40, 0.6, 0.2);
  rueda.rodar();
  expect(tipos(correrHasta(rueda, 42))).not.toContain('golpe');
  expect(rueda.vidas).toBe(3);
});

test('con turbo el dron se rompe al chocarlo', () => {
  const s = crearSimulacion(nivel([...ZONA.slice(0, 2), { en: 30, tipo: 'habilidad', clase: 'turbo', carril: 0 }, ...ZONA.slice(2)]));
  const eventos = correrHasta(s, 42);
  expect(tipos(eventos)).toContain('roto');
  expect(tipos(eventos)).not.toContain('golpe');
});

test('el EMP quita el arma y borra las balas en vuelo', () => {
  const s = crearSimulacion(nivel(ZONA));
  correrHasta(s, 89);
  s.disparar();
  s.paso(DT);
  expect(s.balas()).toHaveLength(1);
  expect(tipos(correrHasta(s, 91))).toContain('emp');
  expect(s.armado).toBe(false);
  expect(s.balas()).toHaveLength(0);
});

test('desde dentro de la zona empieza armado; después del EMP, no', () => {
  expect(crearSimulacion(nivel(ZONA), { desde: 20 }).armado).toBe(true);
  expect(crearSimulacion(nivel(ZONA), { desde: 95 }).armado).toBe(false);
});

test('desde en medio de un foso empieza pasado el borde, de pie', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'foso', largo: 3 }]), { desde: 21 });
  expect(s.distancia).toBeGreaterThanOrEqual(23);
  const eventos = correr(s, 0.3);
  expect(tipos(eventos)).not.toContain('foso');
  expect(s.y).toBe(0);
  expect(s.postura).toBe('corriendo');
});

test('desde en medio de un contenedor empieza encima', () => {
  const s = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 10 }]), { desde: 24 });
  expect(s.y).toBe(2);
  const eventos = correr(s, 0.3);
  expect(tipos(eventos)).not.toContain('trepar');
  expect(tipos(eventos)).not.toContain('golpe');
  expect(s.y).toBe(2);
});

// Revisión final: trepar termina encima sin atravesar el contenedor, reaparecer tras el foso limpia
// el estado del aire y el avance de rodar y trepar se puede leer (para la animación).

/** Trepa un contenedor de 6 m a 12 m/s y devuelve cuánto se metió el centro del corredor pasado el frente. */
function treparA12(porElAire: boolean): { s: Simulacion; adentro: number } {
  const en = 620;
  const s = crearSimulacion(nivel([{ en, tipo: 'contenedor', largo: 6 }]));
  if (porElAire) {
    correrHastaContacto(s, en, BORDE_CONTENEDOR, 0.1);
    s.saltar();
  } else {
    correrHasta(s, en - 0.5);
  }
  expect(s.velocidad).toBe(12);
  while (s.postura !== 'trepando' && s.distancia < en + 1) s.paso(DT);
  expect(s.postura).toBe('trepando');
  let adentro = 0;
  while (s.postura === 'trepando') {
    s.paso(DT);
    if (s.y < 2) adentro = Math.max(adentro, s.distancia - en);
  }
  return { s, adentro };
}

for (const porElAire of [true, false]) {
  test(`trepar a 12 m/s ${porElAire ? 'saltando' : 'por el suelo'}: sube casi en el frente y queda encima`, () => {
    const { s, adentro } = treparA12(porElAire);
    // Mientras sube, el centro del corredor no pasa de 0,7 m detrás del frente.
    expect(adentro).toBeLessThanOrEqual(0.7);
    expect(s.y).toBe(2);
    expect(s.suelo).toBe(2);
    expect(s.postura).toBe('corriendo');
  });
}

test('3D: cambiar de carril justo antes del frente no trepa al costado del contenedor', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'portal', a: 3 },
      { en: 40, tipo: 'contenedor', largo: 12, carril: 0 },
    ]),
  );
  correrHastaContacto(s, 40, BORDE_CONTENEDOR, 0.02);
  s.cambiarCarril(1);
  let yMax = 0;
  const eventos: EventoSim[] = [];
  for (let i = 0; i < 90; i++) {
    eventos.push(...s.paso(DT));
    yMax = Math.max(yMax, s.y);
  }
  expect(tipos(eventos)).toContain('golpe');
  // Al irse del carril deja de trepar: nunca queda a 2 m fuera del contenedor.
  expect(yMax).toBeLessThan(1.9);
  expect(s.carril).toBe(1);
  expect(s.y).toBe(0);
  expect(s.postura).toBe('corriendo');
});

test('caída rápida a un foso: al reaparecer ya no cae rápido y el doble salto vuelve', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'habilidad', clase: 'doble' },
      { en: 20, tipo: 'foso', largo: 3 },
    ]),
  );
  correrHastaContacto(s, 20, 0, 0.1);
  s.saltar();
  correr(s, 0.12);
  s.rodar();
  expect(s.caidaRapida).toBe(true);
  const eventos = correrHasta(s, 21);
  expect(tipos(eventos)).toContain('foso');
  correrHasta(s, 23.5);
  expect(s.postura).toBe('corriendo');
  expect(s.caidaRapida).toBe(false);
  s.saltar();
  correr(s, 0.15);
  s.saltar();
  expect(tipos(s.paso(DT))).toContain('doble-salto');
});

test('soltarse muy pronto del cable y caer al foso: después del foso hay doble salto', () => {
  const s = crearSimulacion(
    nivel([
      { en: 2, tipo: 'habilidad', clase: 'doble' },
      { en: 20, tipo: 'foso', largo: 12 },
      { en: 20, tipo: 'cable' },
    ]),
  );
  colgarse(s, 20);
  expect(s.postura).toBe('colgado');
  s.soltar();
  correrHasta(s, 33);
  expect(s.postura).toBe('corriendo');
  s.saltar();
  correr(s, 0.15);
  s.saltar();
  expect(tipos(s.paso(DT))).toContain('doble-salto');
});

test('el avance de rodar va de 0 a 1 y vuelve a 0 al rodar otra vez', () => {
  const s = crearSimulacion(nivel([]));
  expect(s.progreso).toBeNull();
  s.rodar();
  s.paso(DT);
  expect(s.progreso!).toBeLessThan(0.05);
  correr(s, 0.35);
  expect(s.progreso!).toBeCloseTo(0.52, 1);
  s.rodar();
  s.paso(DT);
  expect(s.progreso!).toBeLessThan(0.05);
  correr(s, 0.75);
  expect(s.progreso).toBeNull();
});

test('el avance de trepar usa lo que dura ese trepar: 0,45 s saltando y 0,8 s por el suelo', () => {
  const saltando = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 10 }]));
  correrHastaContacto(saltando, 20, BORDE_CONTENEDOR, 0.1);
  saltando.saltar();
  while (saltando.postura !== 'trepando') saltando.paso(DT);
  correr(saltando, 0.2);
  expect(saltando.progreso!).toBeGreaterThan(0.4);
  expect(saltando.progreso!).toBeLessThan(0.55);

  const suelo = crearSimulacion(nivel([{ en: 20, tipo: 'contenedor', largo: 10 }]));
  correrHasta(suelo, 19.5);
  while (suelo.postura !== 'trepando') suelo.paso(DT);
  correr(suelo, 0.2);
  expect(suelo.progreso!).toBeGreaterThan(0.22);
  expect(suelo.progreso!).toBeLessThan(0.3);
});
