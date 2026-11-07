import { test, expect, type Page } from '@playwright/test';
import { abrir, varianzaLienzo } from './ayudas';

const guardar = (page: Page, progreso: object) =>
  page.addInitScript((p) => localStorage.setItem('nexo.progreso', JSON.stringify(p)), progreso);

const partida = (cambios: object = {}) => ({
  version: 1,
  pisoActual: 'tierra',
  completados: [],
  records: {},
  registros: [],
  guardadoEn: Date.now() - 2 * 3_600_000,
  ...cambios,
});

test('sin partida', async ({ page }) => {
  const errores = await abrir(page);
  await expect(page.locator('.item')).toHaveText([/^Nueva partida$/, /^Registros\s*0 \/ 4$/, /^Ajustes$/]);
  await expect(page.getByText('Último guardado')).toHaveCount(0);
  await expect(page.locator('.pantalla-inicio .logo')).toHaveText('NEXO');
  await expect(page.locator('.pantalla-inicio .etiqueta').first()).toHaveText('Capítulo 1 · La salida');
  expect(await varianzaLienzo(page)).toBeGreaterThan(8);
  expect(errores).toEqual([]);
});

test('con partida: continuar y último guardado', async ({ page }) => {
  await guardar(page, partida());
  await abrir(page);
  await expect(page.locator('.item').first()).toHaveText(/^Continuar\s*Tierra baldía$/);
  await expect(page.locator('.item').first()).toHaveClass(/activo/);
  await expect(page.getByText('Último guardado · hace 2 h')).toBeVisible();
});

test('guardado dañado: arranca sin partida y sin errores', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nexo.progreso', '{oops'));
  const errores = await abrir(page);
  await expect(page.locator('.item').first()).toHaveText('Nueva partida');
  expect(errores).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('nexo.progreso.respaldo'))).toBe('{oops');
});

test('nueva partida con avance pide confirmación y Cancelar no borra', async ({ page }) => {
  await guardar(page, partida({ completados: ['tierra'], pisoActual: 'cristal' }));
  await abrir(page);
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(page.locator('.modal')).toContainText('¿Empezar de nuevo?');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.locator('.modal')).toHaveCount(0);
  const guardado = JSON.parse((await page.evaluate(() => localStorage.getItem('nexo.progreso')))!);
  expect(guardado.completados).toEqual(['tierra']);
});

test('nueva partida confirmada borra el avance', async ({ page }) => {
  await guardar(page, partida({ completados: ['tierra'], pisoActual: 'cristal', registros: ['tierra-1'] }));
  await abrir(page);
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.getByRole('button', { name: 'Empezar de nuevo' }).click();
  const guardado = JSON.parse((await page.evaluate(() => localStorage.getItem('nexo.progreso')))!);
  expect(guardado).toMatchObject({ completados: [], pisoActual: 'tierra', registros: [] });
});

test('nueva partida sin avance no pregunta', async ({ page }) => {
  await abrir(page);
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(page.locator('.modal')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('nexo.progreso'))).not.toBeNull();
});

test('teclado: flecha abajo y Enter en Registros muestra el aviso', async ({ page }) => {
  await abrir(page);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('.aviso')).toHaveText('Disponible en una próxima etapa.');
});

test.describe('celular en vertical', () => {
  test.use({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true });
  test('pide girar el celular', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('.girar')).toBeVisible();
    await expect(page.locator('.girar')).toContainText('Gira el celular');
  });
});

test('en horizontal no aparece el aviso de girar', async ({ page }) => {
  await abrir(page);
  await expect(page.locator('.girar')).toBeHidden();
});

// Revisión final: el foco del teclado y la opción marcada son la misma.
test('Tab hasta Registros y Enter abren Registros, no Continuar', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'nexo.progreso',
      JSON.stringify({ version: 1, pisoActual: 'cristal', completados: ['tierra'], records: {}, registros: [], guardadoEn: Date.now() }),
    ),
  );
  await abrir(page);
  const registros = page.getByRole('button', { name: /Registros/ });
  await registros.focus();
  await expect(registros).toHaveClass(/activo/);
  await page.keyboard.press('Enter');
  await expect(page.locator('.aviso')).toContainText('Disponible en una próxima etapa.');
  expect(await page.evaluate(() => window.nexo!.pantalla())).toBe('inicio');
});
