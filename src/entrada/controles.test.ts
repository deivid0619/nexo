// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test } from 'vitest';
import { crearControles, type Intencion } from './controles';

let superficie: HTMLElement;
let recibidas: Intencion[];
let controles: ReturnType<typeof crearControles>;

beforeEach(() => {
  superficie = document.createElement('canvas');
  document.body.append(superficie);
  recibidas = [];
  controles = crearControles(superficie, window, (i) => recibidas.push(i));
  controles.activar();
});
afterEach(() => {
  controles.destruir();
  superficie.remove();
});

function gesto(dx: number, dy: number, fin: 'pointerup' | 'pointercancel' = 'pointerup') {
  superficie.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 200, pointerId: 1, bubbles: true }));
  superficie.dispatchEvent(new PointerEvent(fin, { clientX: 100 + dx, clientY: 200 + dy, pointerId: 1, bubbles: true }));
}
function tecla(key: string, repeat = false) {
  const e = new KeyboardEvent('keydown', { key, repeat, bubbles: true, cancelable: true });
  window.dispatchEvent(e);
  return e;
}

test('un toque corto salta', () => {
  gesto(0, 0);
  expect(recibidas).toEqual(['saltar']);
});

test('deslizar a los lados cambia de carril', () => {
  gesto(60, 5);
  gesto(-60, -5);
  expect(recibidas).toEqual(['derecha', 'izquierda']);
});

test('deslizar hacia arriba salta, también en diagonal', () => {
  gesto(0, -60);
  gesto(30, -70);
  expect(recibidas).toEqual(['saltar', 'saltar']);
});

test('menos de 40 px no es deslizar: salta', () => {
  gesto(30, 0);
  expect(recibidas).toEqual(['saltar']);
});

test('deslizar hacia abajo no hace nada', () => {
  gesto(0, 80);
  expect(recibidas).toEqual([]);
});

test('teclas: espacio, flecha arriba y W saltan; flechas y A/D cambian de carril', () => {
  const espacio = tecla(' ');
  tecla('ArrowUp');
  tecla('w');
  tecla('ArrowLeft');
  tecla('a');
  tecla('ArrowRight');
  tecla('D');
  expect(recibidas).toEqual(['saltar', 'saltar', 'saltar', 'izquierda', 'izquierda', 'derecha', 'derecha']);
  expect(espacio.defaultPrevented).toBe(true);
});

test('una tecla sostenida no repite', () => {
  tecla(' ', true);
  expect(recibidas).toEqual([]);
});

test('desactivados no emiten nada', () => {
  controles.desactivar();
  gesto(0, 0);
  tecla(' ');
  expect(recibidas).toEqual([]);
});

test('un gesto cancelado no emite', () => {
  gesto(0, 0, 'pointercancel');
  expect(recibidas).toEqual([]);
});
