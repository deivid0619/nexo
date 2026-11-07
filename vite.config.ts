/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  // Relativo: el mismo build sirve en /nexo/avance/, después en /nexo/ y dentro de una app.
  base: './',
  server: { host: '127.0.0.1', port: 5331, strictPort: true },
  preview: { host: '127.0.0.1', port: 5332, strictPort: true },
  // Solo la entrada nueva: que no recorra el prototipo ni la maqueta.
  optimizeDeps: { entries: ['index.html'] },
  build: { target: 'es2022', sourcemap: true },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
