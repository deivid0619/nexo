import { test, expect } from '@playwright/test';
import { recogerErrores, varianzaLienzo } from './ayudas';

test('escena completa dentro del tope de llamadas', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/?prueba=1&calidad=alto');
  await page.waitForFunction(() => window.nexo);
  await page.evaluate(() => window.nexo!.avanzar(0.5));
  const r = await page.evaluate(() => window.nexo!.render());
  console.log(`llamadas de dibujo: ${r.llamadas}, triángulos: ${r.triangulos}`);
  // Al menos 25: ruinas, utilería, personaje, polvo y sombras de contacto ya están en escena.
  expect(r.llamadas).toBeGreaterThanOrEqual(25);
  expect(r.llamadas).toBeLessThanOrEqual(70);
  expect(r.triangulos).toBeGreaterThan(50_000);
  expect(await varianzaLienzo(page)).toBeGreaterThan(8);
  expect(errores).toEqual([]);
});
