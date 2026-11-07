// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { crearAvisos } from './aviso';

let c: HTMLElement;
beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="c"></div>';
  c = document.getElementById('c')!;
});
afterEach(() => vi.useRealTimers());

test('un aviso a la vez y se va solo', () => {
  const a = crearAvisos(c);
  a.mostrar('uno');
  a.mostrar('dos');
  expect(c.querySelectorAll('.aviso')).toHaveLength(1);
  expect(c.querySelector('.aviso')!.textContent).toBe('dos');
  vi.advanceTimersByTime(2600 + 160);
  expect(c.querySelector('.aviso')).toBeNull();
});

test('lo leen los lectores de pantalla y entra con .visible', () => {
  crearAvisos(c).mostrar('hola');
  const aviso = c.querySelector('.aviso')!;
  expect(aviso.getAttribute('role')).toBe('status');
  expect(aviso.getAttribute('aria-live')).toBe('polite');
  vi.advanceTimersByTime(50);
  expect(aviso.classList.contains('visible')).toBe(true);
  vi.advanceTimersByTime(2600);
  expect(aviso.classList.contains('visible')).toBe(false);
});
