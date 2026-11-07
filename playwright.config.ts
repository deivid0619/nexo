import { defineConfig } from '@playwright/test';

// WebGL por software (SwiftShader) en Chromium: el mismo resultado en local y en la nube.
const webglSoftware = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
const celular = { viewport: { width: 874, height: 402 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 };

export default defineConfig({
  testDir: 'tests/navegador',
  timeout: 60_000,
  // WebGL por software usa todos los núcleos: en paralelo, WebKit se queda sin CPU y se cuelga.
  workers: 1,
  // La paridad con la maqueta se corre a mano (--grep @paridad) porque necesita internet.
  grepInvert: process.argv.some((a) => a.includes('@paridad')) ? undefined : /@paridad/,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:5331' },
  webServer: [{ command: 'npm run dev', url: 'http://127.0.0.1:5331', reuseExistingServer: true }],
  projects: [
    {
      name: 'escritorio',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 }, launchOptions: webglSoftware },
    },
    { name: 'celular', use: { browserName: 'chromium', ...celular, launchOptions: webglSoftware } },
    // WebKit de Playwright en Windows a veces no logra crear el contexto WebGL (uno de unas 30 cargas):
    // un reintento, y Playwright la marca como inestable. El iPhone real se revisa a mano en el cierre.
    { name: 'iphone', retries: 1, use: { browserName: 'webkit', ...celular } },
  ],
});
