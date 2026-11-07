import { test, expect } from '@playwright/test';
import { colorPromedio } from './ayudas';

// Se corre a mano: npx playwright test --grep @paridad --project=escritorio
// Necesita internet (la maqueta carga three r128 de cdnjs).
test('@paridad la escena se ve como la maqueta aprobada', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto('/docs/maquetas/2026-11-06-escena-inicio.html');
  await page.waitForTimeout(3000);
  await page.evaluate(() => (document.getElementById('capa')!.style.display = 'none'));
  const scr = page.locator('#scr');
  const caja = (await scr.boundingBox())!;
  const maqueta = await scr.screenshot({ path: test.info().outputPath('maqueta.png') });

  await page.setViewportSize({ width: Math.round(caja.width), height: Math.round(caja.height) });
  await page.goto('/?prueba=1&calidad=alto');
  await page.waitForFunction(() => window.nexo);
  await page.evaluate(() => window.nexo!.avanzar(1));
  const app = await page.locator('#lienzo').screenshot({ path: test.info().outputPath('app.png') });

  test.info().attach('maqueta', { body: maqueta, contentType: 'image/png' });
  test.info().attach('app', { body: app, contentType: 'image/png' });
  for (const [nombre, desde, hasta] of [['todo', 0, 1], ['cielo', 0, 1 / 3], ['suelo', 2 / 3, 1]] as const) {
    const a = await colorPromedio(maqueta, desde, hasta);
    const b = await colorPromedio(app, desde, hasta);
    console.log(nombre, 'maqueta', a.map(Math.round), 'app', b.map(Math.round));
    for (let k = 0; k < 3; k++) expect.soft(Math.abs(a[k] - b[k]), `${nombre} canal ${k}`).toBeLessThanOrEqual(12);
  }
});
