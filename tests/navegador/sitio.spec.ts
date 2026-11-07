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

// Revisión final: el build quita los comentarios de licencia, así que el sitio lleva sus textos aparte.
test('el sitio lleva las licencias de lo que incluye', async ({ request }) => {
  const respuesta = await request.get('/avance/LICENCIAS.txt');
  expect(respuesta.ok()).toBe(true);
  const texto = await respuesta.text();
  for (const aviso of ['three.js authors', 'Apache License', 'SIL OPEN FONT LICENSE', 'Paweł Kuna', 'Quaternius']) {
    expect(texto).toContain(aviso);
  }
});

test('el sitio sirve el corredor 3D de la carrera', async ({ request }) => {
  const respuesta = await request.get('/avance/modelos/corredor.glb');
  expect(respuesta.ok()).toBe(true);
  // Un GLB empieza con la palabra "glTF".
  expect((await respuesta.body()).subarray(0, 4).toString('ascii')).toBe('glTF');
});
