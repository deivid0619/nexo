// @vitest-environment happy-dom
import { beforeEach, expect, test, vi } from 'vitest';
import { pedirConfirmacion } from './confirmacion';

const T = { titulo: '¿Seguro?', texto: 'Se borra todo.', aceptar: 'Sí', cancelar: 'No' };
let c: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<div id="c"></div>';
  c = document.getElementById('c')!;
});

test('aceptar resuelve true y se quita', async () => {
  const r = pedirConfirmacion(c, T);
  expect(c.querySelector('.telon .modal.panel')).not.toBeNull();
  c.querySelector<HTMLElement>('[data-accion="aceptar"]')!.click();
  expect(await r).toBe(true);
  expect(c.querySelector('.modal')).toBeNull();
});

test('Escape resuelve false y el foco empieza en Cancelar', async () => {
  const r = pedirConfirmacion(c, T);
  expect(document.activeElement?.getAttribute('data-accion')).toBe('cancelar');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(await r).toBe(false);
  expect(c.querySelector('.telon')).toBeNull();
});

test('un clic en el telón cancela', async () => {
  const r = pedirConfirmacion(c, T);
  c.querySelector<HTMLElement>('.telon')!.click();
  expect(await r).toBe(false);
});

test('la pantalla de abajo no recibe el teclado mientras está abierta', async () => {
  const abajo = vi.fn();
  window.addEventListener('keydown', abajo);
  const r = pedirConfirmacion(c, T);
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  expect(abajo).not.toHaveBeenCalled();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await r;
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  expect(abajo).toHaveBeenCalledTimes(1);
  window.removeEventListener('keydown', abajo);
});

test('es un diálogo con sus textos', () => {
  void pedirConfirmacion(c, T);
  const modal = c.querySelector('.modal')!;
  expect(modal.getAttribute('role')).toBe('dialog');
  expect(modal.getAttribute('aria-modal')).toBe('true');
  expect(modal.textContent).toContain('¿Seguro?');
  expect(modal.textContent).toContain('Se borra todo.');
});
