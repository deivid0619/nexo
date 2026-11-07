import type { Page } from '@playwright/test';

/** Junta los console.error y los errores de página mientras dura la prueba. */
export function recogerErrores(page: Page): string[] {
  const errores: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text());
  });
  page.on('pageerror', (e) => errores.push(String(e)));
  return errores;
}
