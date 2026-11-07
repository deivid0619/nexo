import type { Page } from '@playwright/test';

/** Junta los console.error y los errores de página mientras dura la prueba. */
export function recogerErrores(page: Page): string[] {
  const errores: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text());
  });
  page.on('pageerror', (e) => errores.push(String(e)));
  return errores;
}

/** Desviación estándar de la luminancia del lienzo: casi 0 = imagen plana (lienzo vacío). */
export async function varianzaLienzo(page: Page): Promise<number> {
  const { PNG } = await import('pngjs');
  const img = PNG.sync.read(await page.locator('#lienzo').screenshot());
  let suma = 0;
  let suma2 = 0;
  const n = img.width * img.height;
  for (let i = 0; i < n; i++) {
    const l = 0.2126 * img.data[i * 4] + 0.7152 * img.data[i * 4 + 1] + 0.0722 * img.data[i * 4 + 2];
    suma += l;
    suma2 += l * l;
  }
  const media = suma / n;
  return Math.sqrt(Math.max(0, suma2 / n - media * media));
}

/** Color promedio [r, g, b] de una franja de una imagen PNG (desde/hasta en fracción del alto). */
export async function colorPromedio(png: Buffer, desde = 0, hasta = 1): Promise<[number, number, number]> {
  const { PNG } = await import('pngjs');
  const img = PNG.sync.read(png);
  const y0 = Math.floor(img.height * desde);
  const y1 = Math.floor(img.height * hasta);
  const total = [0, 0, 0];
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      total[0] += img.data[i];
      total[1] += img.data[i + 1];
      total[2] += img.data[i + 2];
      n++;
    }
  }
  return [total[0] / n, total[1] / n, total[2] / n];
}

/** Abre el juego en modo prueba (calidad baja, más rápido) y espera a que el inicio esté en pantalla. */
export async function abrir(page: Page, consulta = ''): Promise<string[]> {
  const errores = recogerErrores(page);
  await page.goto(`/?prueba=1&calidad=bajo${consulta}`);
  await page.waitForFunction(() => window.nexo?.pantalla() === 'inicio', undefined, { timeout: 30_000 });
  return errores;
}
