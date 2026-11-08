// Arma _site/ como queda en GitHub Pages: el prototipo en la raíz y la etapa en /avance/.
// Uso: npm run sitio (primero construye dist/ con npm run build).
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

// El build quita los comentarios de licencia: los textos van aparte, junto a la app.
const licencia = (paquete) => readFileSync(join(raiz, 'node_modules', paquete, 'LICENSE'), 'utf8').trim();
const TABLER = `MIT License

Copyright (c) 2020-2024 Paweł Kuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
// El corredor (modelos/corredor.glb) es CC0: no exige aviso, pero se nombra al autor.
const QUATERNIUS = `Universal Animation Library y Universal Animation Library 2 (Standard), por Quaternius
https://quaternius.com/packs/universalanimationlibrary.html
https://quaternius.com/packs/universalanimationlibrary2.html

Licencia: CC0 1.0 Universal (dominio público). No exige atribución.
https://creativecommons.org/publicdomain/zero/1.0/

La pistola y el dron (modelos/utileria.glb) y la animación Colgar_Loop del corredor son propios
de NEXO.`;
const partes = [
  ['three.js (MIT)', licencia('three')],
  ['Syncopate, por @fontsource/syncopate (Apache-2.0)', licencia('@fontsource/syncopate')],
  ['Barlow, por @fontsource/barlow (OFL-1.1)', licencia('@fontsource/barlow')],
  ['Barlow Condensed, por @fontsource/barlow-condensed (OFL-1.1)', licencia('@fontsource/barlow-condensed')],
  ['Tabler Icons 3.19.0 (MIT)', TABLER],
  ['Maniquí y animaciones del corredor, modelos/corredor.glb (CC0 1.0)', QUATERNIUS],
];
const linea = '='.repeat(72);
writeFileSync(
  join(sitio, 'avance', 'LICENCIAS.txt'),
  'Licencias de lo que NEXO incluye. Autores y enlaces: CREDITOS.md del repositorio.\n\n' +
    partes.map(([nombre, texto]) => `${linea}\n${nombre}\n${linea}\n\n${texto}\n`).join('\n'),
);

console.log('Sitio listo en _site/: prototipo en la raíz y la etapa en /avance/.');
