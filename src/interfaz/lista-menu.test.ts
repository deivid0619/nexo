// @vitest-environment happy-dom
import { beforeEach, expect, test, vi } from 'vitest';
import { crearListaMenu, type ListaMenu } from './lista-menu';

let l: ListaMenu;
let menu: HTMLElement;
let items: NodeListOf<HTMLElement>;
const alActivar = vi.fn();
const alCambiar = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = `<div id="menu">
    <button class="item">A</button><button class="item">B</button>
    <button class="item" aria-disabled="true">C</button><button class="item">D</button></div>`;
  menu = document.getElementById('menu')!;
  items = menu.querySelectorAll<HTMLElement>('.item');
  l = crearListaMenu(menu, { selector: '.item', alActivar, alCambiar });
});

const marcados = () => [...items].map((i) => i.classList.contains('activo'));

test('salta deshabilitados y da la vuelta', () => {
  expect(l.activo()).toBe(0);
  l.mover(1);
  expect(l.activo()).toBe(1);
  l.mover(1);
  expect(l.activo()).toBe(3);
  l.mover(1);
  expect(l.activo()).toBe(0);
  expect(l.teclado(new KeyboardEvent('keydown', { key: 'ArrowUp' }))).toBe(true);
  expect(l.activo()).toBe(3);
  expect(alCambiar).toHaveBeenLastCalledWith(3);
});

test('Enter activa por tecla y clic por toque, también en deshabilitados', () => {
  l.teclado(new KeyboardEvent('keydown', { key: 'Enter' }));
  expect(alActivar).toHaveBeenLastCalledWith(0, 'tecla');
  l.teclado(new KeyboardEvent('keydown', { key: ' ' }));
  expect(alActivar).toHaveBeenCalledTimes(2);
  items[2].click();
  expect(alActivar).toHaveBeenLastCalledWith(2, 'toque');
});

test('puntero encima marca solo ese elemento', () => {
  expect(marcados()).toEqual([true, false, false, false]);
  items[1].dispatchEvent(new Event('pointerenter'));
  expect(marcados()).toEqual([false, true, false, false]);
});

test('un elemento deshabilitado avisa pero no se queda con la selección', () => {
  items[2].dispatchEvent(new Event('pointerenter'));
  items[2].click();
  expect(alActivar).toHaveBeenLastCalledWith(2, 'toque');
  expect(l.activo()).toBe(0);
  expect(marcados()).toEqual([true, false, false, false]);
});

test('una tecla que no es del menú no se usa', () => {
  expect(l.teclado(new KeyboardEvent('keydown', { key: 'x' }))).toBe(false);
});

test('empieza en el inicial pedido y al destruirla deja de escuchar', () => {
  l.destruir();
  const otra = crearListaMenu(menu, { selector: '.item', alActivar, inicial: 3 });
  expect(otra.activo()).toBe(3);
  items[0].click();
  expect(alActivar).toHaveBeenCalledTimes(1);
});
