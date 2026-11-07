import { test, expect } from '@playwright/test';
import { recogerErrores } from './ayudas';

test('arranque: carga real, mínimo 1,2 s y llega al inicio', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/?prueba=1&calidad=bajo');
  await expect(page.locator('.pantalla-carga')).toContainText('Preparando el exterior');
  await expect(page.locator('.pantalla-carga')).toContainText('Consejo');
  await expect
    .poll(() => page.evaluate(() => window.nexo!.pantalla()), { timeout: 30_000 })
    .toBe('inicio');
  const c = await page.evaluate(() => window.nexo!.carga());
  expect(c.estado).toBe('lista');
  expect(c.fracciones[0]).toBe(0);
  expect(c.fracciones.at(-1)).toBe(1);
  expect(c.fracciones.every((v, i, a) => i === 0 || v >= a[i - 1])).toBe(true);
  expect(c.duracionMs).toBeGreaterThanOrEqual(1200);
  // Revelado: el lienzo termina visible.
  await expect.poll(() => page.locator('#lienzo').evaluate((l) => getComputedStyle(l).opacity)).toBe('1');
  expect(errores).toEqual([]);
});

test('si falla la carga muestra Reintentar y el reintento funciona', async ({ page }) => {
  await page.goto('/?prueba=1&calidad=bajo&fallarCarga=1');
  await expect(page.locator('.pantalla-carga')).toContainText('No se pudo preparar el juego.');
  expect(await page.evaluate(() => window.nexo!.carga().estado)).toBe('error');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect
    .poll(() => page.evaluate(() => window.nexo?.pantalla()), { timeout: 30_000 })
    .toBe('inicio');
});

test('fallarCarga sin ?prueba=1 no hace nada', async ({ page }) => {
  await page.goto('/?fallarCarga=1&calidad=bajo');
  await expect(page.locator('.pantalla-inicio')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('No se pudo preparar el juego.')).toHaveCount(0);
});

test('sin ?prueba=1 no existe window.nexo', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => 'nexo' in window)).toBe(false);
});
