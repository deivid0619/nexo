import { test, expect } from '@playwright/test';
import { recogerErrores } from './ayudas';

// El sitio armado como queda en GitHub Pages: el prototipo en la raíz y la etapa en /avance/.

test('el prototipo sigue en la raíz', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/NEXO/);
  await expect(page.locator('#jugar')).toBeVisible();
});

test('la app funciona en /avance/ sin recursos rotos', async ({ page }) => {
  const rotos: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) rotos.push(r.url());
  });
  const errores = recogerErrores(page);
  await page.goto('/avance/?prueba=1&calidad=bajo');
  await expect.poll(() => page.evaluate(() => window.nexo?.pantalla()), { timeout: 30_000 }).toBe('inicio');
  expect(rotos).toEqual([]);
  expect(errores).toEqual([]);
});
