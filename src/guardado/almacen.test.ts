import { expect, test, vi } from 'vitest';
import { almacenLocal, almacenMemoria } from './almacen';

test('almacenamiento bloqueado no rompe nada', () => {
  vi.stubGlobal('localStorage', {
    getItem() {
      throw new Error('bloqueado');
    },
    setItem() {
      throw new Error('bloqueado');
    },
    removeItem() {
      throw new Error('bloqueado');
    },
  });
  const a = almacenLocal();
  expect(a.leer('x')).toBeNull();
  expect(a.escribir('x', '1')).toBe(false);
  expect(() => a.borrar('x')).not.toThrow();
  vi.unstubAllGlobals();
});

test('si leer el objeto localStorage lanza error (Safari), tampoco se rompe', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError');
    },
  });
  const a = almacenLocal();
  expect(a.leer('x')).toBeNull();
  expect(a.escribir('x', '1')).toBe(false);
  expect(() => a.borrar('x')).not.toThrow();
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

test('el almacén en memoria guarda, lee y borra', () => {
  const a = almacenMemoria();
  expect(a.leer('k')).toBeNull();
  expect(a.escribir('k', 'v')).toBe(true);
  expect(a.leer('k')).toBe('v');
  a.borrar('k');
  expect(a.leer('k')).toBeNull();
});
