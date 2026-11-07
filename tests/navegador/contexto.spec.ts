import { test, expect } from '@playwright/test';
import { esperarInicio, recogerErrores, varianzaLienzo } from './ayudas';

test('pierde y recupera el contexto WebGL', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/?prueba=1&calidad=bajo');
  await esperarInicio(page);
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
  await esperarInicio(page);
  await expect(page.locator('.medidor')).toHaveCount(0);
  await page.goto('/?prueba=1&calidad=bajo&fps=1');
  await esperarInicio(page);
  await expect(page.locator('.medidor')).toContainText(/fps · \d+ llamadas/, { timeout: 5000 });
});

// Revisión final: si iOS quita el contexto WebGL en plena carga (cambiar de app), la carga
// espera a que vuelva y sigue; no termina en "No se pudo preparar el juego".
test('si se pierde el contexto durante la carga, se recupera y llega al inicio', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.addInitScript(() => {
    // La API de prueba se instala justo antes de empezar las tareas: ahí se corta el contexto.
    let api: unknown;
    Object.defineProperty(window, 'nexo', {
      configurable: true,
      get: () => api,
      set(valor) {
        api = valor;
        const gl = (document.getElementById('lienzo') as HTMLCanvasElement).getContext('webgl2')!;
        const ext = gl.getExtension('WEBGL_lose_context')!;
        ext.loseContext();
        (window as any).__perdidoEn = (valor as { carga(): { estado: string } }).carga().estado;
        // Más largo que la carga entera: sin esperar al contexto, los sombreadores fallarían.
        setTimeout(() => ext.restoreContext(), 2500);
      },
    });
  });
  await page.goto('/?prueba=1&calidad=bajo');
  await esperarInicio(page);
  expect(await page.evaluate(() => (window as any).__perdidoEn)).toBe('cargando');
  await expect(page.locator('.velo-sistema')).toBeHidden();
  await expect(page.getByText('No se pudo preparar el juego.')).toHaveCount(0);
  // La escena se ve de verdad después de recuperarse (no un lienzo plano).
  await page.evaluate(() => window.nexo!.avanzar(0.2));
  expect(await varianzaLienzo(page)).toBeGreaterThan(8);
  expect(errores.filter((e) => !/CONTEXT_LOST_WEBGL|context lost/i.test(e))).toEqual([]);
});
