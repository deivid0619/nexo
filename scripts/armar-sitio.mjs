// Arma _site/ como queda en GitHub Pages: el prototipo en la raíz y la etapa en /avance/.
// Uso: npm run sitio (primero construye dist/ con npm run build).
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');
const prototipo = join(raiz, 'prototipo');
const sitio = join(raiz, '_site');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('Falta dist/index.html: corre primero "npm run build".');
  process.exit(1);
}

rmSync(sitio, { recursive: true, force: true });
// cpSync copia carpetas enteras igual en Windows y en Linux.
cpSync(prototipo, sitio, { recursive: true });
cpSync(dist, join(sitio, 'avance'), { recursive: true });
// Sin Jekyll: GitHub Pages publica los archivos tal cual.
writeFileSync(join(sitio, '.nojekyll'), '');

console.log('Sitio listo en _site/: prototipo en la raíz y la etapa en /avance/.');
