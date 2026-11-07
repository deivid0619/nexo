import { test, expect, type Page } from '@playwright/test';
import { abrir } from './ayudas';

/** Partida en la Tierra baldía (piso 1), sin récord todavía. */
const TIERRA = {
  version: 1,
  pisoActual: 'tierra',
  completados: [],
  records: {},
  registros: [],
  guardadoEn: Date.now(),
};
const CRISTAL = { ...TIERRA, pisoActual: 'cristal', completados: ['tierra'] };

const pantalla = (page: Page) => page.evaluate(() => window.nexo!.pantalla());
const juego = (page: Page) => page.evaluate(() => window.nexo!.juego());
const avanzar = (page: Page, s: number) => page.evaluate((x) => window.nexo!.avanzar(x), s);

/** Espera a que la pantalla sea `id` y a que termine el cambio (con la cortina incluida). */
const llegar = (page: Page, id: string) =>
  expect.poll(() => page.evaluate(() => !window.nexo!.enTransicion() && window.nexo!.pantalla())).toBe(id);

/**
 * Abre el juego con una partida guardada y entra al mapa. El reloj real queda detenido:
 * la carrera solo avanza con avanzar(), así cada prueba ve siempre los mismos metros.
 */
async function abrirTorre(page: Page, consulta = '', progreso: object = TIERRA): Promise<string[]> {
  await page.addInitScript((v) => localStorage.setItem('nexo.progreso', v), JSON.stringify(progreso));
  const errores = await abrir(page, consulta);
  await page.evaluate(() => window.nexo!.reloj(false));
  await page.getByRole('button', { name: /Continuar/ }).click();
  await llegar(page, 'torre');
  return errores;
}

async function entrar(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Entrar al portal/ }).click();
  await llegar(page, 'juego');
}

async function centro(page: Page): Promise<{ x: number; y: number }> {
  const v = page.viewportSize()!;
  return { x: v.width / 2, y: v.height / 2 };
}

test('Entrar al portal abre la carrera: 3 vidas, distancia 0, en 2D y sin errores', async ({ page }) => {
  const errores = await abrirTorre(page);
  const antes = await page.evaluate(() => history.length);
  // Doble toque: una sola carrera y una sola entrada en el historial.
  await page.getByRole('button', { name: /Entrar al portal/ }).dblclick();
  await llegar(page, 'juego');
  expect(await page.evaluate(() => history.length)).toBe(antes + 1);
  const j = (await juego(page))!;
  expect(j).toMatchObject({ estado: 'corriendo', vidas: 3, distancia: 0, modo: 2, carril: 0 });
  await expect(page.locator('.vida.llena')).toHaveCount(3);
  await expect(page.locator('.pista-juego')).toHaveText('Toca para saltar');
  expect(errores).toEqual([]);
});

test('tocar la pantalla salta y la pista de saltar se va', async ({ page }) => {
  await abrirTorre(page);
  await entrar(page);
  const c = await centro(page);
  await page.mouse.click(c.x, c.y);
  await avanzar(page, 0.2);
  const j = (await juego(page))!;
  expect(j.y).toBeGreaterThan(0);
  expect(['despegar', 'aire']).toContain(j.animacion);
  await expect(page.locator('.pista-juego')).toBeHidden();
});

test('el portal gira la cámara a 3D y deslizar cambia de carril', async ({ page }) => {
  await abrirTorre(page, '&desde=80&dios=1');
  await entrar(page);
  await avanzar(page, 2);
  const j = (await juego(page))!;
  expect(j.modo).toBe(3);
  expect(j.mezcla).toBeGreaterThan(0.9);
  await expect(page.locator('.pista-juego')).toHaveText('Desliza a los lados para cambiar de carril');
  const c = await centro(page);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x + 120, c.y + 6, { steps: 4 });
  await page.mouse.up();
  expect((await juego(page))!.carril).toBe(1);
});

test('chocar quita vidas; sin vidas aparece la derrota y Reintentar empieza de nuevo', async ({ page }) => {
  const errores = await abrirTorre(page);
  await entrar(page);
  // La primera valla está a 20 m: sin saltar, golpea.
  await avanzar(page, 2.6);
  expect((await juego(page))!.vidas).toBe(2);
  await expect(page.locator('.vida.llena')).toHaveCount(2);
  await avanzar(page, 8);
  expect((await juego(page))!.estado).toBe('derrota');
  const fin = page.locator('.fin-carrera');
  await expect(fin).toBeVisible();
  await expect(fin.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  await expect(fin.getByRole('button', { name: 'Volver al mapa' })).toBeVisible();
  await fin.getByRole('button', { name: 'Reintentar' }).click();
  await expect(fin).toBeHidden();
  expect(await juego(page)).toMatchObject({ estado: 'corriendo', vidas: 3, distancia: 0, modo: 2 });
  expect(errores).toEqual([]);
});

test('llegar al final muestra Tramo superado y guarda el récord del piso', async ({ page }) => {
  await abrirTorre(page, '&desde=370&dios=1');
  await entrar(page);
  await avanzar(page, 3);
  expect((await juego(page))!.estado).toBe('fin');
  const fin = page.locator('.fin-carrera');
  await expect(fin).toContainText('Tramo superado');
  await expect(fin.getByRole('button', { name: 'Repetir' })).toBeVisible();
  const puntaje = (await juego(page))!.puntaje;
  const record = await page.evaluate(() => window.nexo!.progreso().records.tierra);
  expect(record).toBe(puntaje);
  await expect(fin).toContainText(String(puntaje));
  // Volver al mapa: la tarjeta ya muestra el récord.
  await fin.getByRole('button', { name: 'Volver al mapa' }).click();
  await llegar(page, 'torre');
  await expect(page.locator('.tarjeta-piso')).toContainText(`Récord: ${puntaje}`);
});

for (const forma of ['Escape', 'atrás del navegador', 'botón Salir'] as const) {
  test(`salir con ${forma} en medio de un salto vuelve al mapa y la carrera siguiente empieza limpia`, async ({ page }) => {
    const errores = await abrirTorre(page);
    await entrar(page);
    await avanzar(page, 1);
    await page.evaluate(() => window.nexo!.accion('saltar'));
    await avanzar(page, 0.15);
    expect((await juego(page))!.y).toBeGreaterThan(0);
    if (forma === 'Escape') await page.keyboard.press('Escape');
    else if (forma === 'atrás del navegador') await page.goBack();
    else await page.getByRole('button', { name: 'Salir' }).click();
    await llegar(page, 'torre');
    expect(await juego(page)).toBeNull();
    await entrar(page);
    expect(await juego(page)).toMatchObject({ estado: 'corriendo', vidas: 3, distancia: 0, modo: 2, y: 0 });
    expect(errores).toEqual([]);
  });
}

test('con la pestaña oculta o el aviso de girar a la vista, la carrera no avanza', async ({ page }) => {
  await abrirTorre(page);
  await entrar(page);
  await avanzar(page, 0.5);
  const d0 = (await juego(page))!.distancia;

  await page.evaluate(() => Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }));
  await avanzar(page, 2);
  expect((await juego(page))!.distancia).toBe(d0);
  await page.evaluate(() => delete (document as { visibilityState?: unknown }).visibilityState);

  const estilo = await page.addStyleTag({ content: '.girar { display: flex !important; }' });
  await avanzar(page, 2);
  expect((await juego(page))!.distancia).toBe(d0);
  await estilo.evaluate((e) => (e as HTMLElement).remove());

  await avanzar(page, 0.5);
  expect((await juego(page))!.distancia).toBeGreaterThan(d0);
});

test('si se pierde el contexto WebGL en la carrera, aparece el velo y luego sigue', async ({ page }) => {
  const errores = await abrirTorre(page);
  await entrar(page);
  await avanzar(page, 0.5);
  await page.evaluate(() => {
    const gl = document.querySelector('canvas')!.getContext('webgl2')!;
    (window as unknown as { __ext: WEBGL_lose_context }).__ext = gl.getExtension('WEBGL_lose_context')!;
  });
  await page.evaluate(() => (window as unknown as { __ext: WEBGL_lose_context }).__ext.loseContext());
  await expect(page.locator('.velo-sistema')).toHaveText('Recuperando gráficos…');
  await page.evaluate(() => (window as unknown as { __ext: WEBGL_lose_context }).__ext.restoreContext());
  await expect(page.locator('.velo-sistema')).toBeHidden({ timeout: 3000 });
  const d0 = (await juego(page))!.distancia;
  await avanzar(page, 0.5);
  expect((await juego(page))!.distancia).toBeGreaterThan(d0);
  expect(await pantalla(page)).toBe('juego');
  expect(errores.filter((e) => !/CONTEXT_LOST_WEBGL|context lost/i.test(e))).toEqual([]);
});

test('la carrera dibuja como mucho 150 llamadas por cuadro, en 2D y en 3D', async ({ page }) => {
  await abrirTorre(page, '&desde=60&dios=1');
  await entrar(page);
  await avanzar(page, 0.5);
  const en2d = await page.evaluate(() => window.nexo!.render().llamadas);
  await avanzar(page, 4);
  expect((await juego(page))!.modo).toBe(3);
  const en3d = await page.evaluate(() => window.nexo!.render().llamadas);
  for (const n of [en2d, en3d]) {
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(150);
  }
});

test('en Cristal, Entrar al portal sigue avisando que llega en la próxima etapa', async ({ page }) => {
  await abrirTorre(page, '', CRISTAL);
  await page.getByRole('button', { name: /Entrar al portal/ }).click();
  await expect(page.locator('.aviso')).toHaveText('El portal se abre en la próxima etapa.');
  expect(await pantalla(page)).toBe('torre');
});

test('el HUD cabe en la pantalla y el botón Salir se puede tocar', async ({ page }) => {
  await abrirTorre(page);
  await entrar(page);
  const v = page.viewportSize()!;
  const salir = (await page.getByRole('button', { name: 'Salir' }).boundingBox())!;
  expect(salir.width).toBeGreaterThanOrEqual(44);
  expect(salir.height).toBeGreaterThanOrEqual(44);
  for (const sel of ['.hud-estado', '.hud-puntaje', '.pista-juego']) {
    const r = (await page.locator(sel).boundingBox())!;
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.x + r.width).toBeLessThanOrEqual(v.width);
    expect(r.y + r.height).toBeLessThanOrEqual(v.height);
  }
  const izq = (await page.locator('.hud-estado').boundingBox())!;
  const der = (await page.locator('.hud-puntaje').boundingBox())!;
  expect(izq.x + izq.width).toBeLessThan(der.x);
});
