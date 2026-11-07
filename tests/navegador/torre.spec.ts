import { test, expect, type Page } from '@playwright/test';
import { abrir } from './ayudas';

const P = {
  version: 1,
  pisoActual: 'cristal',
  completados: ['tierra'],
  records: { cristal: 12480 },
  registros: ['tierra-1'],
  guardadoEn: Date.now(),
};

const pantalla = (page: Page) => page.evaluate(() => window.nexo!.pantalla());

/** Abre el juego con una partida en Cristal y entra al mapa por "Continuar". */
async function abrirTorre(page: Page): Promise<string[]> {
  await page.addInitScript((v) => localStorage.setItem('nexo.progreso', v), JSON.stringify(P));
  const errores = await abrir(page);
  await page.getByRole('button', { name: /Continuar/ }).click();
  await expect.poll(() => pantalla(page)).toBe('torre');
  return errores;
}

test('estados de los pisos y tarjeta del actual', async ({ page }) => {
  const errores = await abrirTorre(page);
  await expect(page.locator('.fila')).toHaveText([
    /Núcleo.*Sellado/,
    /Vacío.*Sellado/,
    /Magma.*Sellado/,
    /Cristal.*Actual/,
    /Tierra baldía.*Completado/,
  ]);
  await expect(page.locator('.fila.sellada')).toHaveCount(3);
  await expect(page.locator('.fila.activo')).toContainText('Cristal');
  const t = page.locator('.tarjeta-piso');
  await expect(t).toContainText('Piso 2 · Dimensión');
  await expect(t).toContainText('Jefe: Hidra de cristal');
  await expect(t).toContainText('Registros: 0 de 2');
  await expect(t).toContainText('Récord: 12.480');
  expect(await page.evaluate(() => window.nexo!.resaltado())).toBe(1);
  expect(errores).toEqual([]);
});

test('piso sellado avisa y no cambia la selección', async ({ page }) => {
  await abrirTorre(page);
  // force: Playwright no toca elementos con aria-disabled, pero una persona sí puede tocar la fila.
  await page.locator('.fila', { hasText: 'Magma' }).click({ force: true });
  await expect(page.locator('.aviso')).toHaveText('Este piso llega en un próximo capítulo.');
  await expect(page.locator('.tarjeta-piso')).toContainText('Cristal');
  expect(await page.evaluate(() => window.nexo!.resaltado())).toBe(1);
});

test('elegir otro piso cambia la tarjeta y la torre', async ({ page }) => {
  await abrirTorre(page);
  await page.locator('.fila', { hasText: 'Tierra baldía' }).click();
  await expect(page.locator('.tarjeta-piso')).toContainText('Jefe: Centinela');
  await expect(page.locator('.tarjeta-piso')).toContainText('Récord: —');
  expect(await page.evaluate(() => window.nexo!.resaltado())).toBe(0);
});

test('las flechas cambian de piso y Enter entra al portal', async ({ page }) => {
  await abrirTorre(page);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.tarjeta-piso')).toContainText('Tierra baldía');
  await page.keyboard.press('ArrowDown');
  // Da la vuelta saltando los sellados: vuelve a Cristal.
  await expect(page.locator('.tarjeta-piso')).toContainText('Cristal');
  await page.keyboard.press('Enter');
  await expect(page.locator('.aviso')).toHaveText('El portal se abre en la próxima etapa.');
});

test('Entrar al portal muestra que llega en la próxima etapa', async ({ page }) => {
  await abrirTorre(page);
  await page.getByRole('button', { name: /Entrar al portal/ }).click();
  await expect(page.locator('.aviso')).toHaveText('El portal se abre en la próxima etapa.');
});

test('Volver, atrás del navegador y Escape regresan al inicio', async ({ page }) => {
  await abrirTorre(page);
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect.poll(() => pantalla(page)).toBe('inicio');
  expect(await page.evaluate(() => window.nexo!.resaltado())).toBeNull();

  await page.getByRole('button', { name: /Continuar/ }).click();
  await expect.poll(() => pantalla(page)).toBe('torre');
  await page.goBack();
  await expect.poll(() => pantalla(page)).toBe('inicio');

  await page.getByRole('button', { name: /Continuar/ }).click();
  await expect.poll(() => pantalla(page)).toBe('torre');
  await expect.poll(() => page.evaluate(() => window.nexo!.enTransicion())).toBe(false);
  await page.keyboard.press('Escape');
  await expect.poll(() => pantalla(page)).toBe('inicio');
});

test('doble toque en Continuar navega una sola vez', async ({ page }) => {
  await page.addInitScript((v) => localStorage.setItem('nexo.progreso', v), JSON.stringify(P));
  await abrir(page);
  const antes = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: /Continuar/ }).dblclick();
  await expect.poll(() => pantalla(page)).toBe('torre');
  expect(await page.evaluate(() => history.length)).toBe(antes + 1);
});

for (const v of [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 874, height: 402 },
  { width: 1280, height: 548 },
]) {
  test(`paneles sin montarse en ${v.width}×${v.height}`, async ({ page }) => {
    await page.setViewportSize(v);
    await abrirTorre(page);
    const a = (await page.locator('.lista-pisos').boundingBox())!;
    const b = (await page.locator('.tarjeta-piso').boundingBox())!;
    const volver = (await page.locator('.pantalla-torre .boton-volver').boundingBox())!;
    expect(a.x + a.width <= b.x || b.y >= a.y + a.height).toBe(true);
    // El botón Volver tampoco queda encima de la tarjeta.
    expect(volver.y + volver.height <= b.y || volver.x >= b.x + b.width).toBe(true);
    for (const r of [a, b, volver]) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(v.width);
      expect(r.y + r.height).toBeLessThanOrEqual(v.height);
    }
    // Las cinco filas caben dentro de la lista.
    const ultima = (await page.locator('.fila').last().boundingBox())!;
    expect(ultima.y + ultima.height).toBeLessThanOrEqual(a.y + a.height);
  });
}

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('la cámara llega a la toma en un cuadro', async ({ page }) => {
    await abrir(page);
    await page.evaluate(() => {
      window.nexo!.ir('torre');
      window.nexo!.avanzar(1 / 60);
    });
    expect((await page.evaluate(() => window.nexo!.camara())).posicion).toEqual([4, 3, 6]);
  });
});
