// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { crearGestorPantallas, type GestorPantallas, type IdPantalla } from './gestor-pantallas';

let g: GestorPantallas;
let capa: HTMLElement;
let ventana: Window;
const camara = { irA: vi.fn() };
const historial = { pushState: vi.fn(), replaceState: vi.fn(), back: vi.fn() };
const alEntrar = vi.fn();
const alSalir = vi.fn();

function seccion(id: IdPantalla): HTMLElement {
  const s = document.createElement('section');
  s.className = `pantalla pantalla-${id}`;
  return s;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  document.body.innerHTML = '<div id="capa"></div>';
  capa = document.getElementById('capa')!;
  // Una ventana propia por prueba: los oyentes de una prueba no escuchan en la siguiente.
  ventana = Object.assign(new EventTarget(), {
    requestAnimationFrame: (f: FrameRequestCallback) => setTimeout(() => f(0), 16),
  }) as unknown as Window;
  g = crearGestorPantallas(capa, { camara, historial, ventana, duracionMs: 280 });
  g.registrar({ id: 'inicio', toma: 'inicio', elemento: seccion('inicio') });
  g.registrar({ id: 'torre', toma: 'torre', elemento: seccion('torre'), alEntrar, alSalir });
});

afterEach(() => vi.useRealTimers());

test('las pantallas viven dentro de la capa y empiezan ocultas', () => {
  expect(capa.querySelectorAll('section.pantalla')).toHaveLength(2);
  expect(capa.querySelector<HTMLElement>('.pantalla-torre')!.hidden).toBe(true);
  expect(g.actual()).toBeNull();
});

test('navega una sola vez aunque se pida dos veces seguidas', () => {
  g.ir('inicio', { instantaneo: true });
  expect(g.ir('torre', { apilar: true })).toBe(true);
  expect(g.ir('torre', { apilar: true })).toBe(false);
  expect(g.ir('inicio')).toBe(false);
  vi.advanceTimersByTime(560);
  expect(g.actual()).toBe('torre');
  expect(historial.pushState).toHaveBeenCalledTimes(1);
  expect(historial.pushState).toHaveBeenCalledWith({ pantalla: 'torre' }, '');
  expect(camara.irA).toHaveBeenLastCalledWith('torre', false);
});

test('ir a la pantalla que ya está no hace nada', () => {
  g.ir('inicio', { instantaneo: true });
  expect(g.ir('inicio')).toBe(false);
  expect(camara.irA).toHaveBeenCalledTimes(1);
});

test('instantáneo cambia en el acto y la cámara llega en el acto', () => {
  expect(g.ir('inicio', { instantaneo: true })).toBe(true);
  expect(g.actual()).toBe('inicio');
  expect(g.enTransicion()).toBe(false);
  expect(capa.querySelector<HTMLElement>('.pantalla-inicio')!.hidden).toBe(false);
  expect(camara.irA).toHaveBeenLastCalledWith('inicio', true);
});

test('la transición: sale la vieja, entra la nueva y termina a 2·duración', () => {
  g.ir('inicio', { instantaneo: true });
  const inicio = capa.querySelector<HTMLElement>('.pantalla-inicio')!;
  const torre = capa.querySelector<HTMLElement>('.pantalla-torre')!;
  g.ir('torre');
  expect(inicio.classList.contains('saliendo')).toBe(true);
  expect(g.enTransicion()).toBe(true);
  vi.advanceTimersByTime(280);
  expect(inicio.hidden).toBe(true);
  expect(torre.hidden).toBe(false);
  expect(torre.classList.contains('entrando')).toBe(true);
  vi.advanceTimersByTime(20);
  expect(torre.classList.contains('entrando')).toBe(false);
  expect(alEntrar).toHaveBeenCalledTimes(1);
  expect(g.enTransicion()).toBe(true);
  vi.advanceTimersByTime(260);
  expect(g.enTransicion()).toBe(false);
  g.ir('inicio', { instantaneo: true });
  expect(alSalir).toHaveBeenCalledTimes(1);
});

test('la pantalla nueva ya está lista cuando pasa a ser la actual', () => {
  g.ir('inicio', { instantaneo: true });
  g.ir('torre');
  vi.advanceTimersByTime(280);
  // Mismo instante del cambio, antes del cuadro siguiente: un toque rápido ya la encuentra preparada.
  expect(g.actual()).toBe('torre');
  expect(alEntrar).toHaveBeenCalledTimes(1);
});

test('atrás del navegador vuelve al inicio sin apilar', () => {
  g.ir('inicio', { instantaneo: true });
  g.ir('torre', { apilar: true });
  vi.advanceTimersByTime(560);
  ventana.dispatchEvent(new PopStateEvent('popstate', { state: { pantalla: 'inicio' } }));
  vi.advanceTimersByTime(560);
  expect(g.actual()).toBe('inicio');
  expect(historial.pushState).toHaveBeenCalledTimes(1);
});

test('popstate sin estado también vuelve al inicio', () => {
  g.ir('torre', { instantaneo: true });
  ventana.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  vi.advanceTimersByTime(560);
  expect(g.actual()).toBe('inicio');
});

test('popstate durante una transición se aplica al terminar', () => {
  g.ir('inicio', { instantaneo: true });
  g.ir('torre', { apilar: true });
  ventana.dispatchEvent(new PopStateEvent('popstate', { state: { pantalla: 'inicio' } }));
  vi.advanceTimersByTime(560 + 560);
  expect(g.actual()).toBe('inicio');
});

test('Escape en el inicio no sale del juego', () => {
  g.ir('inicio', { instantaneo: true });
  ventana.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(historial.back).not.toHaveBeenCalled();
});

test('Escape en la torre vuelve atrás', () => {
  g.ir('torre', { instantaneo: true });
  ventana.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(historial.back).toHaveBeenCalledTimes(1);
});

test('el teclado va primero a la pantalla actual', () => {
  const alTecla = vi.fn(() => true);
  const otraVentana = Object.assign(new EventTarget(), {
    requestAnimationFrame: (f: FrameRequestCallback) => setTimeout(() => f(0), 16),
  }) as unknown as Window;
  const g2 = crearGestorPantallas(capa, { camara, historial, ventana: otraVentana, duracionMs: 280 });
  g2.registrar({ id: 'torre', toma: 'torre', elemento: seccion('torre'), alTecla });
  g2.ir('torre', { instantaneo: true });
  otraVentana.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(alTecla).toHaveBeenCalledTimes(1);
  expect(historial.back).not.toHaveBeenCalled();
});

// Revisión final: un doble toque en Volver, Escape sostenido o el gesto atrás más Volver
// no pueden llamar dos veces a history.back(): la segunda saldría del juego.
function enTorre() {
  g.ir('inicio', { instantaneo: true });
  g.ir('torre', { apilar: true });
  vi.advanceTimersByTime(560);
}

test('dos "atrás" seguidos antes del popstate salen una sola vez', () => {
  enTorre();
  g.atras();
  g.atras();
  expect(historial.back).toHaveBeenCalledTimes(1);
});

test('"atrás" mientras se vuelve por un popstate no sale del juego', () => {
  enTorre();
  // El gesto atrás del sistema: llega el popstate sin pasar por atras().
  ventana.dispatchEvent(new PopStateEvent('popstate', { state: { pantalla: 'inicio' } }));
  g.atras();
  vi.advanceTimersByTime(560);
  expect(g.actual()).toBe('inicio');
  expect(historial.back).not.toHaveBeenCalled();
});

test('después de volver, "atrás" funciona de nuevo desde la torre', () => {
  enTorre();
  g.atras();
  ventana.dispatchEvent(new PopStateEvent('popstate', { state: { pantalla: 'inicio' } }));
  vi.advanceTimersByTime(560);
  g.ir('torre', { apilar: true });
  vi.advanceTimersByTime(560);
  g.atras();
  expect(historial.back).toHaveBeenCalledTimes(2);
});

test('Escape sostenido (tecla repetida) no vuelve atrás', () => {
  g.ir('torre', { instantaneo: true });
  ventana.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', repeat: true }));
  expect(historial.back).not.toHaveBeenCalled();
});

test('una pantalla sin toma no mueve la cámara del menú', () => {
  g.registrar({ id: 'juego', elemento: seccion('juego') });
  g.ir('inicio', { instantaneo: true });
  camara.irA.mockClear();
  g.ir('juego');
  vi.advanceTimersByTime(560);
  expect(g.actual()).toBe('juego');
  expect(camara.irA).not.toHaveBeenCalled();
});

test('con cortina: tapa al empezar, cambia de pantalla tapado y destapa después', () => {
  const cortina = { cubrir: vi.fn(), descubrir: vi.fn() };
  const g2 = crearGestorPantallas(capa, { camara, historial, ventana, duracionMs: 280, cortina });
  const alEntrarJuego = vi.fn(() => expect(cortina.descubrir).not.toHaveBeenCalled());
  const alSalirJuego = vi.fn(() => expect(cortina.descubrir).toHaveBeenCalledTimes(1));
  g2.registrar({ id: 'torre', toma: 'torre', elemento: seccion('torre') });
  g2.registrar({ id: 'juego', elemento: seccion('juego'), cortina: true, alEntrar: alEntrarJuego, alSalir: alSalirJuego });
  g2.ir('torre', { instantaneo: true });
  expect(cortina.cubrir).not.toHaveBeenCalled();

  g2.ir('juego', { apilar: true });
  expect(cortina.cubrir).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(280);
  expect(alEntrarJuego).toHaveBeenCalledTimes(1);
  expect(cortina.descubrir).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(280);
  expect(g2.enTransicion()).toBe(false);

  // Salir de una pantalla con cortina también va tapado.
  g2.ir('torre');
  expect(cortina.cubrir).toHaveBeenCalledTimes(2);
  vi.advanceTimersByTime(280);
  expect(alSalirJuego).toHaveBeenCalledTimes(1);
  expect(cortina.descubrir).toHaveBeenCalledTimes(2);
});

test('entre pantallas sin cortina no se tapa nada', () => {
  const cortina = { cubrir: vi.fn(), descubrir: vi.fn() };
  const g2 = crearGestorPantallas(capa, { camara, historial, ventana, duracionMs: 280, cortina });
  g2.registrar({ id: 'inicio', toma: 'inicio', elemento: seccion('inicio') });
  g2.registrar({ id: 'torre', toma: 'torre', elemento: seccion('torre') });
  g2.ir('inicio', { instantaneo: true });
  g2.ir('torre');
  vi.advanceTimersByTime(560);
  expect(cortina.cubrir).not.toHaveBeenCalled();
  expect(cortina.descubrir).not.toHaveBeenCalled();
});
