import { test, expect } from '@playwright/test';
import { colorPromedio } from './ayudas';

/** La maqueta pone los edificios al azar en cada carga: se promedian varias para comparar contra algo estable. */
const CARGAS_MAQUETA = 3;
const FRANJAS = [
  ['todo', 0, 1],
  ['cielo', 0, 1 / 3],
  ['suelo', 2 / 3, 1],
] as const;

// Se corre a mano: npx playwright test --grep @paridad --project=escritorio
// Necesita internet (la maqueta carga three r128 de cdnjs).
test('@paridad la escena se ve como la maqueta aprobada', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1000, height: 700 });
  const sumas = FRANJAS.map(() => [0, 0, 0]);
  let caja = { width: 0, height: 0 };
  for (let n = 0; n < CARGAS_MAQUETA; n++) {
    await page.goto('/docs/maquetas/2026-11-06-escena-inicio.html');
    await page.waitForTimeout(3000);
    await page.evaluate(() => (document.getElementById('capa')!.style.display = 'none'));
    const scr = page.locator('#scr');
    caja = (await scr.boundingBox())!;
    const maqueta = await scr.screenshot({ path: test.info().outputPath(`maqueta-${n + 1}.png`) });
    for (const [i, [, desde, hasta]] of FRANJAS.entries()) {
      const c = await colorPromedio(maqueta, desde, hasta);
      for (let k = 0; k < 3; k++) sumas[i][k] += c[k] / CARGAS_MAQUETA;
    }
  }

  await page.setViewportSize({ width: Math.round(caja.width), height: Math.round(caja.height) });
  await page.goto('/?prueba=1&calidad=alto');
  await page.waitForFunction(() => window.nexo);
  // Solo la escena: sin el menú ni su velo, igual que en la maqueta.
  await page.evaluate(() => (document.getElementById('capa')!.style.display = 'none'));
  await page.evaluate(() => window.nexo!.avanzar(1));
  const app = await page.locator('#lienzo').screenshot({ path: test.info().outputPath('app.png') });

  for (const [i, [nombre, desde, hasta]] of FRANJAS.entries()) {
    const a = sumas[i];
    const b = await colorPromedio(app, desde, hasta);
    console.log(nombre, 'maqueta', a.map(Math.round), 'app', b.map(Math.round));
    for (let k = 0; k < 3; k++) expect.soft(Math.abs(a[k] - b[k]), `${nombre} canal ${k}`).toBeLessThanOrEqual(12);
  }
});
