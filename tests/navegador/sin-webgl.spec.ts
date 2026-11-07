import { test, expect } from '@playwright/test';

// Las banderas desactivan WebGL en Chromium; en WebKit no aplican.
test.use({ launchOptions: { args: ['--disable-webgl', '--disable-3d-apis'] } });

test('sin WebGL muestra el mensaje', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'las banderas son de Chromium');
  await page.goto('/');
  await expect(page.locator('.velo-sistema')).toContainText('no puede mostrar gráficos 3D');
});
