import { test, expect } from '@playwright/test';
import { recogerErrores } from './ayudas';

test('la app abre sin errores', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/');
  await expect(page).toHaveTitle('NEXO');
  await expect(page.locator('#lienzo')).toBeAttached();
  expect(errores).toEqual([]);
});
