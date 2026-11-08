import { test, expect, type Page } from '@playwright/test';
import { TIERRA_BALDIA_1 } from '../../src/datos/niveles/tierra-baldia-1';
import { abrir } from './ayudas';

// Las posiciones salen del tramo: si cambia, las pruebas lo siguen.
const EVENTOS = TIERRA_BALDIA_1.eventos;
const primero = (tipo: string) => EVENTOS.find((e) => e.tipo === tipo)!.en;
const PORTAL_3D = EVENTOS.find((e) => e.tipo === 'portal' && e.a === 3)!.en;
const VIGA = primero('viga');
const CONTENEDOR = primero('contenedor');
const CONTENEDOR_2 = EVENTOS.filter((e) => e.tipo === 'contenedor')[1].en;
const FOSO = primero('foso');
const CABLE = primero('cable');
const ARMA = primero('arma');
const EMP = primero('emp');
/** El primer dron del carril del centro (donde empieza el corredor al pasar a 3D). */
const DRON_CENTRO = EVENTOS.find((e) => e.tipo === 'dron' && e.carril === 0)!.en;

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

/** Avanza hasta que el corredor llega a `d` metros, sin pasarse más de un paso de 1/60 s. */
async function avanzarHasta(page: Page, d: number): Promise<void> {
  for (;;) {
    const j = (await juego(page))!;
    if (j.estado !== 'corriendo' || j.distancia >= d) return;
    const falta = d - j.distancia;
    // Nunca va a más de 12 m/s (sin turbo): con 0,95 no se pasa.
    await avanzar(page, falta > 1 ? (falta / 12) * 0.95 : 1 / 60);
  }
}

/** Desliza un dedo (o el ratón) sobre el lienzo. */
async function deslizar(page: Page, dx: number, dy: number): Promise<void> {
  const c = await centro(page);
  await page.mouse.move(c.x - dx / 2, c.y - dy / 2);
  await page.mouse.down();
  await page.mouse.move(c.x + dx / 2, c.y + dy / 2, { steps: 4 });
  await page.mouse.up();
}

/** El bono de la carrera: el puntaje menos los metros. */
const bono = (j: { puntaje: number; distancia: number }) => j.puntaje - Math.floor(j.distancia);

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
  await abrirTorre(page, `&desde=${PORTAL_3D - 5}&dios=1`);
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
  await abrirTorre(page, `&desde=${TIERRA_BALDIA_1.largo - 25}&dios=1`);
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
  await abrirTorre(page, `&desde=${PORTAL_3D - 20}&dios=1`);
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

// Etapa 3: los movimientos nuevos en la carrera de verdad.
test('deslizar hacia abajo rueda: la pista sale antes de la primera viga, se va al rodar y se pasa sin golpe', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${VIGA - 19}`);
  await entrar(page);
  await avanzar(page, 1 / 60);
  await expect(page.locator('.pista-juego')).toHaveText('Desliza hacia abajo para rodar');
  await avanzarHasta(page, VIGA - 4);
  await deslizar(page, 0, 120);
  await avanzar(page, 1 / 60);
  expect((await juego(page))!.postura).toBe('rodando');
  await expect(page.locator('.pista-juego')).toBeHidden();
  await avanzarHasta(page, VIGA + 2);
  expect((await juego(page))!.vidas).toBe(3);
  expect(errores).toEqual([]);
});

test('rodar otra vez en medio del giro vuelve a empezar la animación', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${VIGA + 2}`);
  await entrar(page);
  await deslizar(page, 0, 120);
  await avanzar(page, 0.45);
  let j = (await juego(page))!;
  expect(j.animacion).toBe('rodar');
  expect(j.avanceAnimacion).toBeGreaterThan(0.5);
  await deslizar(page, 0, 120);
  await avanzar(page, 1 / 60);
  j = (await juego(page))!;
  expect(j.animacion).toBe('rodar');
  expect(j.avanceAnimacion).toBeLessThan(0.15);
  expect(errores).toEqual([]);
});

test('saltar contra el primer contenedor lo trepa y queda encima con 3 vidas', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${CONTENEDOR - 10}`);
  await entrar(page);
  await avanzar(page, 1 / 60);
  await expect(page.locator('.pista-juego')).toHaveText('Salta contra el muro para trepar');
  await avanzarHasta(page, CONTENEDOR - 1.2);
  await page.evaluate(() => window.nexo!.accion('saltar'));
  await avanzar(page, 0.6);
  const j = (await juego(page))!;
  expect(j.y).toBeCloseTo(2, 1);
  expect(j.vidas).toBe(3);
  expect(errores).toEqual([]);
});

test('saltar al cable lo agarra y un toque lo suelta: pasa el foso con 3 vidas', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${CABLE - 10}`);
  await entrar(page);
  await avanzar(page, 1 / 60);
  await expect(page.locator('.pista-juego')).toHaveText('Salta al cable y toca para soltarte');
  await avanzarHasta(page, CABLE - 1.5);
  await page.evaluate(() => window.nexo!.accion('saltar'));
  await avanzar(page, 0.2);
  expect((await juego(page))!.postura).toBe('colgado');
  await avanzar(page, 0.6);
  const c = await centro(page);
  await page.mouse.click(c.x, c.y);
  await avanzar(page, 1 / 60);
  expect((await juego(page))!.postura).toBe('corriendo');
  await expect(page.locator('.pista-juego')).toBeHidden();
  await avanzar(page, 1.5);
  const j = (await juego(page))!;
  expect(j.distancia).toBeGreaterThan(CABLE + 12);
  expect(j).toMatchObject({ vidas: 3, y: 0 });
  expect(errores).toEqual([]);
});

test('el arma: aviso, indicador y un toque dispara; el dron del carril cae', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${ARMA - 5}`);
  await entrar(page);
  await expect(page.locator('.chip-arma')).toBeHidden();
  await avanzarHasta(page, ARMA + 0.5);
  await avanzar(page, 1 / 60);
  await expect(page.locator('.aviso')).toHaveText('Arma lista: toca para disparar');
  await expect(page.locator('.chip-arma')).toBeVisible();
  await expect(page.locator('.pista-juego')).toHaveText('Toca para disparar · desliza arriba para saltar');
  expect(await juego(page)).toMatchObject({ armado: true, pistola: true, y: 0 });
  const c = await centro(page);
  await page.mouse.click(c.x, c.y);
  await avanzar(page, 1 / 60);
  // Tocar con el arma dispara: no salta y la pista se va.
  expect((await juego(page))!.y).toBe(0);
  await expect(page.locator('.pista-juego')).toBeHidden();
  // Esa sola bala alcanza al primer dron del carril (y se gasta en él).
  await avanzarHasta(page, DRON_CENTRO + 2);
  const j = (await juego(page))!;
  expect(j.vidas).toBe(3);
  expect(bono(j)).toBe(50);
  expect(errores).toEqual([]);
});

test('el pulso EMP se lleva el arma: avisa y el indicador se va', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${EMP - 6}&dios=1`);
  await entrar(page);
  await expect(page.locator('.chip-arma')).toBeVisible();
  await avanzarHasta(page, EMP + 0.5);
  await avanzar(page, 1 / 60);
  await expect(page.locator('.aviso')).toHaveText('Pulso EMP: perdiste el arma');
  await expect(page.locator('.chip-arma')).toBeHidden();
  expect(await juego(page)).toMatchObject({ armado: false, pistola: false });
  expect(errores).toEqual([]);
});

test('un "¡Justo!" muestra el letrero y suma 50', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${CONTENEDOR - 10}`);
  await entrar(page);
  await avanzarHasta(page, CONTENEDOR - 0.9);
  await page.evaluate(() => window.nexo!.accion('saltar'));
  await avanzar(page, 0.1);
  await expect(page.locator('.justo')).toHaveText('¡Justo! +50');
  expect(bono((await juego(page))!)).toBe(50);
  expect(errores).toEqual([]);
});

for (const caso of ['armado', 'colgado'] as const) {
  test(`salir ${caso} y volver a entrar empieza sin arma, corriendo y sin el indicador`, async ({ page }) => {
    const errores = await abrirTorre(page, `&desde=${caso === 'armado' ? ARMA - 5 : CABLE - 10}`);
    await entrar(page);
    if (caso === 'armado') {
      await avanzarHasta(page, ARMA + 1);
      expect((await juego(page))!.armado).toBe(true);
    } else {
      await avanzarHasta(page, CABLE - 1.5);
      await page.evaluate(() => window.nexo!.accion('saltar'));
      await avanzar(page, 0.2);
      expect((await juego(page))!.postura).toBe('colgado');
    }
    await page.keyboard.press('Escape');
    await llegar(page, 'torre');
    await entrar(page);
    await avanzar(page, 1 / 60);
    expect(await juego(page)).toMatchObject({ postura: 'corriendo', armado: false, pistola: false });
    await expect(page.locator('.chip-arma')).toBeHidden();
    expect(errores).toEqual([]);
  });
}

test('perder la última vida en un foso es derrota: no reaparece arriba y sale el panel', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${CONTENEDOR - 32}`);
  await entrar(page);
  // Sin saltar: la valla alta y el primer contenedor quitan dos vidas.
  await avanzarHasta(page, CONTENEDOR + 1);
  expect((await juego(page))!.vidas).toBe(1);
  // El segundo contenedor se trepa bien; el foso de después, no.
  await avanzarHasta(page, CONTENEDOR_2 - 1.2);
  await page.evaluate(() => window.nexo!.accion('saltar'));
  await avanzarHasta(page, FOSO + 2);
  await avanzar(page, 1);
  const j = (await juego(page))!;
  expect(j).toMatchObject({ estado: 'derrota', vidas: 0, postura: 'foso' });
  expect(j.y).toBeLessThan(0);
  await expect(page.locator('.fin-carrera')).toBeVisible();
  await expect(page.locator('.fin-carrera .titulo')).toHaveText('Sin vidas');
  expect(errores).toEqual([]);
});

test('en la zona de drones la carrera dibuja como mucho 150 llamadas por cuadro', async ({ page }) => {
  const errores = await abrirTorre(page, `&desde=${ARMA + 5}&dios=1`);
  await entrar(page);
  await avanzar(page, 1);
  const n = await page.evaluate(() => window.nexo!.render().llamadas);
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThanOrEqual(150);
  expect(errores).toEqual([]);
});
