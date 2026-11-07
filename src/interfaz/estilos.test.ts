import { test, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

// Ninguna pantalla inventa sus valores: los colores viven solo en tokens.css.
// Se lee del disco porque vitest vacía los .css que se importan.
const RAIZ = join(process.cwd(), 'src', 'interfaz');

function archivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivos(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const todos = archivos(RAIZ).map((ruta) => [relative(RAIZ, ruta), readFileSync(ruta, 'utf8')] as const);
const css = todos.filter(([r]) => r.endsWith('.css'));
const cssSinTokens = css.filter(([r]) => !r.endsWith('tokens.css'));
const tsDeInterfaz = todos.filter(([r]) => r.endsWith('.ts') && !r.endsWith('.test.ts') && !r.endsWith('iconos.ts'));

test('existen hojas de estilo además de tokens.css', () => {
  expect(cssSinTokens.length).toBeGreaterThan(0);
  expect(cssSinTokens.every(([, fuente]) => fuente.length > 0)).toBe(true);
});

test.each(cssSinTokens)('%s no trae colores sueltos', (_ruta, fuente) => {
  expect(fuente).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
});

test.each(tsDeInterfaz.length ? tsDeInterfaz : [['(sin archivos)', ''] as const])('%s no trae colores sueltos', (_ruta, fuente) => {
  expect(fuente).not.toMatch(/#[0-9a-fA-F]{6}\b|rgba?\(/);
});

test('tokens.css define los valores del documento de diseño', () => {
  const tokens = css.find(([r]) => r.endsWith('tokens.css'))?.[1] ?? '';
  for (const v of ['--c-texto:#F3EEE6', '--c-claro:#F4EFE7', '--c-acento:#7FD6DC', '--c-panel:rgba(26,22,18,.64)', '--r-panel:10px']) {
    expect(tokens.replace(/\s+/g, '')).toContain(v);
  }
});
