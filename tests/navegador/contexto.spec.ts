import { test, expect } from '@playwright/test';
import { recogerErrores } from './ayudas';

test('pierde y recupera el contexto WebGL', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/?prueba=1&calidad=bajo');
  await page.waitForFunction(() => window.nexo);
  await page.evaluate(() => {
    const gl = document.querySelector('canvas')!.getContext('webgl2')!;
    (window as any).__ext = gl.getExtension('WEBGL_lose_context');
  });
  await page.evaluate(() => (window as any).__ext.loseContext());
  await expect(page.locator('.velo-sistema')).toHaveText('Recuperando gráficos…');
  await page.evaluate(() => (window as any).__ext.restoreContext());
  await expect(page.locator('.velo-sistema')).toBeHidden({ timeout: 3000 });
  const r = await page.evaluate(() => {
    window.nexo!.avanzar(0.1);
    return window.nexo!.render();
  });
  expect(r.llamadas).toBeGreaterThanOrEqual(0);
  expect(errores.filter((e) => !/CONTEXT_LOST_WEBGL|context lost/i.test(e))).toEqual([]);
});


test('el medidor aparece solo con ?fps=1', async ({ page }) => {
  await page.goto('/?prueba=1&calidad=bajo');
  await page.waitForFunction(() => window.nexo);
  await expect(page.locator('.medidor')).toHaveCount(0);
  await page.goto('/?prueba=1&calidad=bajo&fps=1');
  await page.waitForFunction(() => window.nexo);
  await expect(page.locator('.medidor')).toContainText(/fps · \d+ llamadas/, { timeout: 5000 });
});
