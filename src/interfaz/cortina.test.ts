// @vitest-environment happy-dom
import { expect, test } from 'vitest';
import { crearCortina } from './cortina';

test('la cortina tapa y destapa toda la pantalla, sin que la lea un lector de pantalla', () => {
  document.body.innerHTML = '';
  const cortina = crearCortina(document.body);
  const el = document.querySelector<HTMLElement>('.cortina')!;
  expect(el.getAttribute('aria-hidden')).toBe('true');
  expect(cortina.cubierta()).toBe(false);
  cortina.cubrir();
  expect(el.classList.contains('cubierta')).toBe(true);
  expect(cortina.cubierta()).toBe(true);
  cortina.descubrir();
  expect(el.classList.contains('cubierta')).toBe(false);
  expect(cortina.cubierta()).toBe(false);
});
