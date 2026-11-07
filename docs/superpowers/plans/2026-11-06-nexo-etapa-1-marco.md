# NEXO etapa 1 "Marco": plan de construcción

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Meta:** proyecto nuevo de NEXO en Vite + TypeScript + Three.js con sistema de diseño, escena aprobada de la Tierra baldía, pantallas de carga, inicio y mapa de la torre, pruebas automáticas y publicación automática en `/nexo/avance/`, sin tocar el prototipo de `/nexo/`.

**Arquitectura:** un lienzo WebGL a pantalla completa con la escena 3D del exterior, y encima una capa HTML/CSS con las pantallas. Un gestor de pantallas cambia la capa y le pide a la cámara del menú la toma de cada pantalla. Todo color, letra, espacio y duración sale de `src/interfaz/tokens.css`, y todo texto sale de `src/textos/es.ts`. El progreso se guarda en el celular con versión y respaldo.

**Herramientas:** three 0.187, vite 8.3, typescript 7.0, vitest 5.1 con happy-dom, @playwright/test 1.65 (Chromium y WebKit), fuentes @fontsource (Syncopate, Barlow, Barlow Condensed), GitHub Actions y GitHub Pages.

**Documento de diseño:** `docs/superpowers/specs/2026-11-06-nexo-design.md`. Referencia visual: `docs/maquetas/2026-11-06-escena-inicio.html`.

**Fuera de esta etapa** (cada una tendrá su propio plan): el juego en sí (etapa 2), el personaje final (3), combate y jefes (4), registros y radio (5), Cristal (6), y en la etapa 7 la detección automática de calidad, Ajustes, sonido y créditos en pantalla. Aquí la calidad se elige por parámetro (`?calidad=`) y queda en "alto" por defecto.

## Restricciones globales

- Todo en español: textos de la interfaz solo en `src/textos/es.ts`; nombres de código en español, como en el prototipo.
- Celular en horizontal; en vertical aparece el aviso para girar. Se juega con un dedo y también con teclado.
- Recursos: solo CC0 y CC-BY (3.0 o 4.0) con crédito. Nada de CC-BY-SA, NC, ND ni Mixamo. Las fuentes que eligió el documento (Barlow OFL-1.1, Syncopate Apache-2.0) y los íconos Tabler (MIT) se pueden redistribuir; van en `CREDITOS.md`.
- Repositorio público: nada de secretos, rutas personales (`C:/Users/...`), datos de clientes ni recursos sin licencia clara.
- Sistema de diseño: Syncopate 700 con mucho espacio entre letras para el logo y los títulos; Barlow 500 y 600 para los textos; Barlow Condensed 600 en mayúsculas espaciadas para las etiquetas. Paneles `rgba(26,22,18,.64)` con borde fino claro, esquinas de 10 px y sombra suave. Opción seleccionada `#F4EFE7` con texto oscuro y marca vertical `#7FD6DC`. Texto claro `#F3EEE6`.
- Calidad Alto = la maqueta aprobada, a 60 cuadros por segundo en un iPhone 16 Pro (Safari), revisando la isla dinámica y los bordes seguros.
- Movimiento reducido del sistema: sin vaivén de cámara, sin desplazamientos y sin destellos.
- Puertos: el servidor de desarrollo usa 5331 y la vista previa 5332; el prototipo usa 5330. Nunca usar los puertos de Turify (5173, 5180, 8000, 8001, 3000, 5432) ni los de Bodega (5190, 8090).
- Trabajo en la rama `etapa-1-marco`. Se hace commit local por tarea y **no se sube nada** sin el visto bueno de David (ver "Cierre de la etapa").
- Cada mensaje de commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Antes de cada commit que toque una pantalla: abrirla en el navegador del panel y revisar la consola. El build y vitest no detectan variables sin definir en la interfaz.

## Puntos a vigilar en la revisión

1. **Guardado dañado, de otra versión, o almacenamiento bloqueado** (Safari en modo privado). El juego arranca con progreso nuevo, guarda una copia del texto viejo en `nexo.progreso.respaldo` y nunca se cae. Pruebas en la Tarea 8 (unitarias) y la Tarea 10 (navegador).
2. **Doble toque o toque durante una transición.** Hay una sola navegación y una sola entrada en el historial. Pruebas en la Tarea 9 (unitarias) y la Tarea 11 (navegador).
3. **Proporciones de pantalla distintas a la maqueta** (4:3, 16:9, 21:9). La torre y el personaje siguen en cuadro y los paneles no se montan. Pruebas en la Tarea 5 (`fovParaAspecto`) y la Tarea 11 (cajas de los paneles).
4. **Gesto atrás de Android o botón atrás del navegador estando en el mapa.** Vuelve al inicio y no cierra el juego. Pruebas en la Tarea 9 (`popstate`) y la Tarea 11 (`goBack`).
5. **Contexto WebGL perdido** (iOS al cambiar de app) **o navegador sin WebGL.** Sale un mensaje legible y el juego se recupera cuando vuelve el contexto. Pruebas en la Tarea 4.

---

## Mapa de archivos

```
prototipo/index.html, juego.js, estilos.css   prototipo movido con git mv, sin cambios
index.html                                     entrada de Vite: #lienzo y #capa
package.json, tsconfig.json, vite.config.ts, playwright.config.ts
scripts/armar-sitio.mjs                        arma _site/ (prototipo en la raíz, app en avance/)
.github/workflows/publicar.yml                 pruebas, construcción y publicación en Pages
CREDITOS.md, LEEME.md
src/main.ts                                    arranque: conecta todas las piezas
src/nucleo/        azar.ts, bucle.ts, preferencias.ts, modo-prueba.ts
src/render/        calidad.ts, renderizador.ts, medidor.ts
src/camara/        tomas.ts, camara-menu.ts
src/mundo/         paletas.ts
src/mundo/tierra-baldia/  index.ts, cielo.ts, terreno.ts, torre.ts, ruinas.ts,
                          utileria.ts, sobreviviente.ts, polvo.ts, sombra-contacto.ts
src/carga/         cargador.ts
src/guardado/      almacen.ts, progreso.ts
src/datos/         pisos.ts
src/textos/        es.ts, formato.ts
src/interfaz/      tokens.css, base.css, componentes.css, iconos.ts,
                   gestor-pantallas.ts, lista-menu.ts, aviso.ts, confirmacion.ts, girar.ts
src/interfaz/pantallas/   carga.ts, inicio.ts, torre.ts
tests/navegador/   ayudas.ts y un *.spec.ts por tema
```

Las pruebas unitarias van junto al archivo que prueban (`x.test.ts`). Las que necesitan DOM empiezan con `// @vitest-environment happy-dom`.

---

### Tarea 1: proyecto nuevo, herramientas y prototipo aparte

**Archivos:**
- Mover: `index.html`, `juego.js`, `estilos.css` → `prototipo/` (con `git mv`)
- Crear: `package.json`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `index.html`, `src/main.ts`, `src/vite-env.d.ts`, `tests/navegador/ayudas.ts`, `tests/navegador/arranque.spec.ts`
- Crear (no se sube): `.claude/launch.json`
- Modificar: `.gitignore`, `LEEME.md` (comandos del prototipo)

**Interfaces:**
- Produce: `npm run dev` en `http://127.0.0.1:5331`. En `tests/navegador/ayudas.ts`:
  - `recogerErrores(page: Page): string[]`, que junta los `console.error` y los `pageerror`.
  - `abrir(page: Page, consulta?: string): Promise<string[]>`, que se completa en la Tarea 10.

- [ ] **Paso 1: crear la rama.** `git switch -c etapa-1-marco`
- [ ] **Paso 2: escribir la prueba que falla.** En `tests/navegador/arranque.spec.ts`:

```ts
test('la app abre sin errores', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/');
  await expect(page).toHaveTitle('NEXO');
  await expect(page.locator('#lienzo')).toBeAttached();
  expect(errores).toEqual([]);
});
```

- [ ] **Paso 3: mover el prototipo.** `git mv index.html juego.js estilos.css prototipo/`
- [ ] **Paso 4: crear `package.json`.**
  - Scripts:
    - `"dev": "vite"`
    - `"dev:celular": "vite --host 0.0.0.0"`
    - `"build": "tsc --noEmit && vite build"`
    - `"test": "vitest run"`
    - `"test:navegador": "playwright test"`
    - `"verificar": "npm test && npm run test:navegador"`
  - Instalar:

```bash
npm install three@^0.187.0 @fontsource/syncopate @fontsource/barlow @fontsource/barlow-condensed
npm install -D vite@^8.3.6 vitest@^5.1.0 happy-dom typescript@^7.0.2 @types/three@^0.187.0 @types/node @playwright/test@^1.65.0 pngjs @types/pngjs
npx playwright install chromium webkit
```

- [ ] **Paso 5: configurar Vite, TypeScript y Playwright.**
  - `vite.config.ts`:
    - `base: './'`, para que el mismo build sirva en `/nexo/avance/`, después en `/nexo/` y en una app.
    - `server: {host:'127.0.0.1', port:5331, strictPort:true}` y `preview: {host:'127.0.0.1', port:5332, strictPort:true}`.
    - `optimizeDeps: {entries:['index.html']}`, para que no recorra el prototipo ni la maqueta.
    - `test: {include:['src/**/*.test.ts'], environment:'node'}`.
  - `tsconfig.json`: igual al del andamio de la skill `threejs-gameplay-systems`, con `strict` y `moduleResolution: "Bundler"`. Incluye `src`, `tests`, `vite.config.ts` y `playwright.config.ts`.
  - `playwright.config.ts`:
    - Base: `testDir: 'tests/navegador'`, `timeout: 60_000`, `grepInvert: /@paridad/` y `baseURL: 'http://127.0.0.1:5331'`.
    - `webServer: [{command:'npm run dev', url:'http://127.0.0.1:5331', reuseExistingServer:true}]`.
    - Proyectos:
      - `escritorio`: chromium, 1280×720.
      - `celular`: chromium, 874×402, `hasTouch`, `isMobile`, `deviceScaleFactor: 3`.
      - `iphone`: webkit con la misma pantalla que `celular`.
    - Los proyectos chromium llevan `launchOptions.args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']`, para que el WebGL por software sea el mismo en local y en la nube.
- [ ] **Paso 6: crear la entrada y el arranque mínimo.**
  - `index.html`:
    - `lang="es"`, `<title>NEXO</title>`.
    - Viewport con `viewport-fit=cover`.
    - `<canvas id="lienzo">`, `<div id="capa">` y `<script type="module" src="/src/main.ts">`.
    - Un `<style>` en línea con `html,body{margin:0;background:#1B1814}`, para que no haya destello blanco antes de que cargue el CSS. Es la única excepción al sistema de valores.
  - `src/main.ts` queda vacío por ahora, solo con un comentario.
- [ ] **Paso 7: correr la prueba.** `npx playwright test arranque --project=escritorio` → PASA. Correr también `--project=iphone`. Si WebKit en Windows no tiene WebGL más adelante (Tareas 4 a 12), se quita el proyecto `iphone` y se anota en `LEEME.md` que la prueba en iPhone es manual.
- [ ] **Paso 8: revisar que el prototipo sigue vivo.**
  - Correr `python -m http.server 5330 --bind 127.0.0.1 --directory prototipo` y abrir `http://127.0.0.1:5330`: el menú NEXO carga sin errores en la consola.
  - En `.claude/launch.json` van dos entradas: `nexo-dev` (`npm run dev`, puerto 5331) y `nexo-prototipo` (el comando de python de arriba, puerto 5330).
  - En la entrada `videojuego-nexo` del `launch.json` de bodega, cambiar `--directory` para que apunte a `.../Videojuego/prototipo`.
- [ ] **Paso 9: actualizar `.gitignore` y `LEEME.md`.**
  - `.gitignore`: agregar `dist/`, `_site/`, `test-results/`, `playwright-report/` y `.claude/launch.json`.
  - `LEEME.md`: los comandos del prototipo ahora usan `--directory prototipo`.
- [ ] **Paso 10: commit.** `git add -A && git commit` con el mensaje "Etapa 1: proyecto Vite + TypeScript + Three.js y prototipo en prototipo/".

---

### Tarea 2: núcleo (azar con semilla, bucle, parámetros, modo de prueba)

**Archivos:**
- Crear: `src/nucleo/azar.ts`, `src/nucleo/bucle.ts`, `src/nucleo/preferencias.ts`, `src/nucleo/modo-prueba.ts`
- Crear las pruebas: `src/nucleo/azar.test.ts`, `src/nucleo/bucle.test.ts`, `src/nucleo/preferencias.test.ts`

**Interfaces:**
- Produce:
  - `crearAzar(semilla: number): () => number`: mulberry32, devuelve valores en [0, 1).
  - `DT_MAX = 0.05`, el tope de dt.
  - `interface Bucle { iniciar(): void; detener(): void; avanzar(segundos: number): void; readonly corriendo: boolean }`
  - `crearBucle(paso: (dt: number, t: number) => void): Bucle`
    - Con `requestAnimationFrame`, el dt queda acotado a `DT_MAX`.
    - `avanzar` da `Math.round(segundos * 60)` pasos fijos de `1/60`.
  - `interface Parametros { prueba: boolean }`. Las Tareas 4 y 12 le agregan campos.
  - `leerParametros(busqueda: string): Parametros`
  - `movimientoReducido(): boolean`, con `matchMedia('(prefers-reduced-motion: reduce)')`.
  - `interface ApiPrueba { avanzar(segundos: number): void }`. Las tareas siguientes le agregan miembros.
  - `instalarModoPrueba(api: ApiPrueba): void`: asigna `window.nexo` y declara el tipo global.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
test('misma semilla, misma secuencia', () => {
  const a = crearAzar(7), b = crearAzar(7);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});
test('semillas distintas dan secuencias distintas', () => {
  expect(crearAzar(1)()).not.toBe(crearAzar(2)());
});
test('valores en [0, 1)', () => {
  const r = crearAzar(3);
  for (let i = 0; i < 1000; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
});
test('avanzar(1) da 60 pasos de 1/60 y el tiempo llega a 1', () => {
  const dts: number[] = []; let tf = 0;
  crearBucle((dt, t) => { dts.push(dt); tf = t; }).avanzar(1);
  expect(dts).toHaveLength(60); expect(dts.every(d => d === 1 / 60)).toBe(true); expect(tf).toBeCloseTo(1, 9);
});
test('avanzar(0.5) da 30 pasos', () => { /* mismo esquema, 30 */ });
test('leerParametros', () => {
  expect(leerParametros('?prueba=1').prueba).toBe(true);
  expect(leerParametros('').prueba).toBe(false);
  expect(leerParametros('?prueba=0').prueba).toBe(false);
});
```

- [ ] **Paso 2: correr las pruebas.** `npx vitest run src/nucleo` → FALLAN (los módulos no existen).
- [ ] **Paso 3: implementar los cuatro módulos** con las firmas de arriba. `prueba` es verdadero solo con el valor `1`.
- [ ] **Paso 4: correr las pruebas.** `npx vitest run src/nucleo` → PASAN.
- [ ] **Paso 5: commit.** Mensaje: "Núcleo: azar con semilla, bucle con tiempo simulado y modo de prueba".

---

### Tarea 3: sistema de diseño, textos y créditos

**Archivos:**
- Crear: `src/interfaz/tokens.css`, `src/interfaz/base.css`, `src/interfaz/componentes.css`, `src/interfaz/iconos.ts`, `src/textos/es.ts`, `src/textos/formato.ts`, `CREDITOS.md`
- Crear las pruebas: `src/interfaz/estilos.test.ts`, `src/textos/formato.test.ts`
- Modificar: `src/main.ts`, que importa los tres CSS en el orden tokens, base, componentes.

**Interfaces:**
- Produce:
  - Las variables CSS de abajo.
  - Las clases `.logo` (con `.pequeno`), `.etiqueta`, `.panel`, `.menu`, `.item`, `.activo`, `.pista`, `.marca`, `.fila`, `.sellada`, `.titulo`, `.detalle`, `.cta`, `.boton-volver`, `.barra`, `.barra-relleno`, `.aviso`, `.modal`, `.telon`, `.velo-inicio`, `.velo-carga`, `.velo-torre`, `.girar`, `.velo-sistema`, `.medidor` y `.pantalla` (con `.saliendo`, `.entrando` y `[hidden]`).
  - `TEXTOS` en `src/textos/es.ts`.
  - `formatearPuntaje(n: number): string`.
  - `tiempoRelativo(desdeMs: number, ahoraMs: number): string`.
  - `ICONOS: Record<'candado' | 'check' | 'flechaDerecha' | 'flechaIzquierda' | 'girar', string>`.

`tokens.css` es la fuente única. Los valores salen de la maqueta y del documento de diseño. El tamaño base del texto es 14 px a unos 430 px de alto, en `rem`:

```css
:root {
  --c-texto:#F3EEE6; --c-texto-menu:#ECE5D9; --c-texto-frase:#EDE6DA; --c-texto-detalle:#E2DACD;
  --c-texto-fila:#CFC6B8; --c-etiqueta:#D3C9BA; --c-pista:#BDB3A3; --c-pista-activa:#61584C; --c-apagado:#8E8579;
  --c-fondo:#1B1814; --c-claro:#F4EFE7; --c-claro-activo:rgba(244,239,231,.94); --c-oscuro:#1F1B16;
  --c-acento:#7FD6DC; --c-panel:rgba(26,22,18,.64); --c-borde:rgba(244,239,231,.12); --c-riel:rgba(244,239,231,.16);
  --c-telon:rgba(20,16,12,.6);
  --s-panel:0 12px 32px rgba(0,0,0,.34); --s-activo:0 8px 22px rgba(0,0,0,.32); --s-fila:0 6px 16px rgba(0,0,0,.28);
  --s-cta:0 8px 20px rgba(0,0,0,.3); --s-logo:0 2px 18px rgba(0,0,0,.4);
  --v-inicio:linear-gradient(90deg,rgba(20,16,12,.72) 0%,rgba(20,16,12,.32) 34%,rgba(20,16,12,0) 58%),linear-gradient(0deg,rgba(20,16,12,.5),rgba(20,16,12,0) 38%);
  --v-carga:rgba(20,16,12,.42);
  --v-torre:linear-gradient(90deg,rgba(20,16,12,.66),rgba(20,16,12,.05) 42%,rgba(20,16,12,.05) 60%,rgba(20,16,12,.6));
  --f-logo:'Syncopate',sans-serif; --f-texto:'Barlow',sans-serif; --f-etiqueta:'Barlow Condensed',sans-serif;
  --l-logo:.42em; --l-titulo:.3em; --l-etiqueta:.2em;
  --t-logo:clamp(1.7rem,5.4vw,2.7rem); --t-logo-pequeno:1.3rem; --t-titulo:1.2rem; --t-texto:1rem;
  --t-fila:.93rem; --t-detalle:.86rem; --t-etiqueta:.79rem;
  --m-x:4.5vw; --m-y:9vh; --e-1:.15rem; --e-2:.3rem; --e-3:.5rem; --e-4:.65rem; --e-5:.85rem; --e-6:1rem;
  --r-panel:10px; --r-item:6px; --ancho-menu:14.7rem; --ancho-panel:31vw;
  --d-pantalla:280ms; --d-revelar:600ms; --d-aviso:200ms; --d-aviso-sale:160ms; --d-toque:80ms; --d-barra:200ms;
  --curva:cubic-bezier(.2,.7,.2,1); --desplaza-aviso:-8px; --escala-toque:.98;
}
@media (prefers-reduced-motion: reduce) { :root { --desplaza-aviso:0px; --escala-toque:1; } }
```

**`base.css`:**
- Importa `@fontsource/syncopate/700.css`, `@fontsource/barlow/500.css`, `@fontsource/barlow/600.css` y `@fontsource/barlow-condensed/600.css`.
- `html { font-size: clamp(13px, 3.3vh, 20px) }`.
- `#lienzo` y `#capa` van en `position: fixed; inset: 0`.
- `#capa` define `--borde-izq: max(var(--m-x), env(safe-area-inset-left))`, y lo mismo para la derecha, arriba y abajo. Todas las pantallas se ubican con esos bordes, por la isla dinámica.
- `user-select: none`, `-webkit-tap-highlight-color: transparent` y `touch-action: manipulation`.

**`componentes.css`:**
- Pasa a variables las reglas `.logo .eti .it .pt .panel .fila .cta` de la maqueta (líneas 19-32).
- Las clases nuevas usan solo `var(--...)`.
- Los botones responden al toque con `:active { transform: scale(var(--escala-toque)) }` en `var(--d-toque)`.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
// estilos.test.ts: ninguna pantalla inventa sus valores
const css = import.meta.glob('./**/*.css', { query: '?raw', import: 'default', eager: true });
const ts = import.meta.glob('./**/*.ts', { query: '?raw', import: 'default', eager: true });
test.each(Object.entries(css).filter(([r]) => !r.endsWith('tokens.css')))('%s no trae colores sueltos', (_r, src) => {
  expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
});
test.each(Object.entries(ts).filter(([r]) => !r.endsWith('.test.ts') && !r.endsWith('iconos.ts')))('%s no trae colores sueltos', (_r, src) => {
  expect(src).not.toMatch(/#[0-9a-fA-F]{6}\b|rgba?\(/);
});
// formato.test.ts
test('puntaje con punto de miles', () => {
  expect(formatearPuntaje(12480)).toBe('12.480'); expect(formatearPuntaje(0)).toBe('0');
  expect(formatearPuntaje(1234)).toBe('1.234'); expect(formatearPuntaje(1234567)).toBe('1.234.567');
});
test('tiempo relativo', () => {
  const h = 3_600_000, ahora = 100 * 24 * h;
  expect(tiempoRelativo(ahora - 30_000, ahora)).toBe('hace un momento');
  expect(tiempoRelativo(ahora - 5 * 60_000, ahora)).toBe('hace 5 min');
  expect(tiempoRelativo(ahora - 2 * h, ahora)).toBe('hace 2 h');
  expect(tiempoRelativo(ahora - 26 * h, ahora)).toBe('ayer');
  expect(tiempoRelativo(ahora - 72 * h, ahora)).toBe('hace 3 días');
  expect(tiempoRelativo(ahora + 60_000, ahora)).toBe('hace un momento'); // reloj cambiado
});
```

- [ ] **Paso 2: correr las pruebas.** `npx vitest run src/interfaz src/textos` → FALLAN.
- [ ] **Paso 3: escribir `tokens.css`, `base.css` y `componentes.css`** como se describe arriba.
- [ ] **Paso 4: escribir `formato.ts`.**
  - El puntaje se formatea con la expresión `/\B(?=(\d{3})+(?!\d))/g` → `'.'`, no con `Intl`: en algunos idiomas `Intl` deja "1234" sin punto.
  - Para el tiempo, los límites son: menos de 1 min, menos de 60 min, menos de 24 h, menos de 48 h ("ayer") y de ahí en adelante, días.
- [ ] **Paso 5: escribir `es.ts`** con este texto exacto:

```ts
export const TEXTOS = {
  juego: { nombre: 'NEXO', capitulo: 'Capítulo 1 · La salida' },
  carga: {
    etiqueta: 'Preparando el exterior',
    fraseInicial: { texto: '“Si alguien escucha esto: la torre todavía responde. Sal cuando estés listo.”', autor: 'Radio del búnker · señal débil' },
    consejoTitulo: 'Consejo',
    consejos: ['Toca la pantalla para saltar.', 'En 3D, desliza a los lados para cambiar de carril.',
      'Si tienes arma, toca para disparar.', 'El escudo aguanta un golpe.', 'Antes de cada jefe hay un punto de control.'],
    error: 'No se pudo preparar el juego.', reintentar: 'Reintentar',
  },
  inicio: { continuar: 'Continuar', nuevaPartida: 'Nueva partida', registros: 'Registros', ajustes: 'Ajustes', ultimoGuardado: 'Último guardado' },
  confirmarNueva: { titulo: '¿Empezar de nuevo?', texto: 'Se borra el progreso guardado en este dispositivo.', aceptar: 'Empezar de nuevo', cancelar: 'Cancelar' },
  torre: {
    titulo: 'La torre · 5 pisos', piso: 'Piso', dimension: 'Dimensión',
    estados: { completado: 'Completado', actual: 'Actual', sellado: 'Sellado' },
    jefe: 'Jefe', jefeDesconocido: 'por descubrir', registros: 'Registros', de: 'de', record: 'Récord', sinRecord: '—',
    entrar: 'Entrar al portal', volver: 'Volver', portalPronto: 'El portal se abre en la próxima etapa.',
    sellado: 'Sellado. Derrota al jefe del piso de abajo para abrirlo.', proximoCapitulo: 'Este piso llega en un próximo capítulo.',
  },
  pronto: 'Disponible en una próxima etapa.',
  girar: { titulo: 'Gira el celular', texto: 'NEXO se juega en horizontal.' },
  sistema: { sinWebgl: 'Este navegador no puede mostrar gráficos 3D. Prueba con Safari o Chrome actualizados.', recuperando: 'Recuperando gráficos…' },
  tiempo: { momento: 'hace un momento', minutos: 'hace {n} min', horas: 'hace {n} h', ayer: 'ayer', dias: 'hace {n} días' },
} as const;
```

- [ ] **Paso 6: escribir `iconos.ts` y `CREDITOS.md`.**
  - `iconos.ts`: el SVG de Tabler Icons v3 (outline) de `lock`, `check`, `arrow-right`, `arrow-left` y `device-mobile-rotated`, con `stroke="currentColor"`, `width="1em"` y `height="1em"`.
  - `CREDITOS.md`: three.js (MIT), Syncopate (Apache-2.0), Barlow y Barlow Condensed (OFL-1.1) y Tabler Icons (MIT), cada uno con autor, enlace y licencia.
- [ ] **Paso 7: correr las pruebas.** `npx vitest run src/interfaz src/textos` → PASAN.
- [ ] **Paso 8: commit.** Mensaje: "Sistema de diseño: valores únicos, componentes, textos y créditos".

---

### Tarea 4: renderizador, calidad y contexto perdido

**Archivos:**
- Crear: `src/render/calidad.ts`, `src/render/renderizador.ts`, `src/render/medidor.ts`
- Crear las pruebas: `src/render/calidad.test.ts`, `tests/navegador/contexto.spec.ts`
- Modificar:
  - `src/nucleo/preferencias.ts` (y su prueba): `Parametros` gana `fps: boolean` y `calidad: NivelCalidad | null`.
  - `src/nucleo/modo-prueba.ts`
  - `src/main.ts`

**Interfaces:**
- Consume: `crearBucle`, `leerParametros`, `instalarModoPrueba` y `TEXTOS.sistema`.
- Produce:
  - `type NivelCalidad = 'alto' | 'medio' | 'bajo'`
  - `interface Calidad { pixelRatioMax: number; sombraTam: number; sombraSuave: boolean; polvo: number; antialias: boolean }`
  - `CALIDADES: Record<NivelCalidad, Calidad>`
  - `elegirCalidad(pedida: NivelCalidad | null): NivelCalidad`
  - `class ErrorSinWebGL extends Error`
  - `crearRenderizador(lienzo: HTMLCanvasElement, calidad: Calidad): WebGLRenderer`
  - `observarTamano(renderer: WebGLRenderer, alCambiar: (ancho: number, alto: number) => void): void`, con un ResizeObserver sobre el lienzo y `setSize(w, h, false)`.
  - `vigilarContexto(lienzo: HTMLCanvasElement, alPerder: () => void, alRecuperar: () => void): void`
  - `crearMedidor(renderer: WebGLRenderer, contenedor: HTMLElement): { actualizar(dt: number): void }`
  - `ApiPrueba.render(): { llamadas: number; triangulos: number }`

**Valores:**

| | pixelRatioMax | sombraTam | sombraSuave | polvo | antialias |
|---|---|---|---|---|---|
| alto | 2 | 4096 | true | 1600 | true |
| medio | 1.5 | 2048 | true | 900 | true |
| bajo | 1 | 1024 | false | 400 | false |

El renderizador va con:
- `powerPreference: 'high-performance'` y `outputColorSpace = SRGBColorSpace`.
- `toneMapping = ACESFilmicToneMapping` y `toneMappingExposure = 1.08`.
- Sombras activas: `PCFSoftShadowMap` si `sombraSuave`, `PCFShadowMap` si no. Si three 0.187 avisa que `PCFSoftShadowMap` está obsoleto, se usa el reemplazo que nombre el aviso.

Lo demás:
- **Escena provisional:** `main.ts` arma una escena vacía con fondo `#C9A47E`, un `PerspectiveCamera(42, aspecto, .1, 2200)` y el bucle que dibuja.
- **Contexto perdido:** se detiene el bucle y aparece `.velo-sistema` con `TEXTOS.sistema.recuperando`. Al recuperarse, se quita el velo y el bucle sigue.
- **Sin WebGL:** si falla el contexto, `crearRenderizador` lanza `ErrorSinWebGL` y `main` muestra `.velo-sistema` con `TEXTOS.sistema.sinWebgl`.
- **Medidor:** el texto es "60 fps · 54 llamadas" y se actualiza cada 0,5 s. Aparece solo con `?fps=1`.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
// calidad.test.ts
test('tabla de calidades', () => {
  expect(CALIDADES.alto).toEqual({ pixelRatioMax: 2, sombraTam: 4096, sombraSuave: true, polvo: 1600, antialias: true });
  expect(CALIDADES.bajo.sombraTam).toBe(1024); expect(CALIDADES.medio.polvo).toBe(900);
});
test('elegirCalidad', () => { expect(elegirCalidad(null)).toBe('alto'); expect(elegirCalidad('bajo')).toBe('bajo'); });
test('parámetros de calidad y fps', () => {
  expect(leerParametros('?calidad=medio').calidad).toBe('medio');
  expect(leerParametros('?calidad=ultra').calidad).toBeNull();
  expect(leerParametros('?fps=1').fps).toBe(true);
});
// contexto.spec.ts
test('pierde y recupera el contexto WebGL', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/?prueba=1&calidad=bajo'); await page.waitForFunction(() => window.nexo);
  await page.evaluate(() => (window as any).__ext = document.querySelector('canvas')!.getContext('webgl2')!.getExtension('WEBGL_lose_context'));
  await page.evaluate(() => (window as any).__ext.loseContext());
  await expect(page.locator('.velo-sistema')).toHaveText('Recuperando gráficos…');
  await page.evaluate(() => (window as any).__ext.restoreContext());
  await expect(page.locator('.velo-sistema')).toBeHidden({ timeout: 3000 });
  expect(errores).toEqual([]);
});
test.describe('sin WebGL', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'las banderas son de Chromium');
  test.use({ launchOptions: { args: ['--disable-webgl', '--disable-3d-apis'] } });
  test('muestra el mensaje', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.velo-sistema')).toContainText('no puede mostrar gráficos 3D');
  });
});
```

- [ ] **Paso 2: correr las pruebas.** `npx vitest run src/render src/nucleo` y `npx playwright test contexto --project=escritorio` → FALLAN.
- [ ] **Paso 3: implementar** `calidad.ts`, `renderizador.ts` y `medidor.ts`, ampliar `leerParametros` y conectar todo en `main.ts`.
- [ ] **Paso 4: correr las pruebas.** Los mismos comandos del paso 2 → PASAN. Correr también `contexto` en `celular` y en `iphone`.
- [ ] **Paso 5: commit.** Mensaje: "Renderizador con tres niveles de calidad, medidor y recuperación del contexto".

---

### Tarea 5: cámara del menú (tomas por pantalla)

**Archivos:**
- Crear: `src/camara/tomas.ts`, `src/camara/camara-menu.ts`
- Crear las pruebas: `src/camara/tomas.test.ts`, `src/camara/camara-menu.test.ts`
- Modificar: `src/main.ts` (la cámara arranca en la toma `inicio`), `src/nucleo/modo-prueba.ts`

**Interfaces:**
- Consume: `movimientoReducido()`.
- Produce:
  - `type IdToma = 'inicio' | 'carga' | 'torre'`
  - `interface Toma { posicion: [number, number, number]; mira: [number, number, number]; fov: number }`
  - `TOMAS: Record<IdToma, Toma>`
  - `ASPECTO_REFERENCIA = 640 / 296`
  - `fovParaAspecto(fov: number, aspecto: number): number`
  - `factorSuavizado(dt: number): number`, que es `1 - Math.exp(-dt * 1.6)`.
  - `interface CamaraMenu { irA(toma: IdToma, instantaneo?: boolean): void; actualizar(dt: number, t: number): void; estado(): Toma }`
  - `crearCamaraMenu(camara: PerspectiveCamera, opciones: { movimientoReducido: () => boolean }): CamaraMenu`
  - `ApiPrueba.camara(): Toma`

**Valores de la maqueta (línea 132):**
- `inicio`: posición [2.4, 1.8, 6.6], mira [12, 8, -160], fov 42.
- `carga`: posición [6.4, 1.4, 3.9], mira [4.3, 1.4, 1.0], fov 34.
- `torre`: posición [4, 3, 6], mira [26, 100, -330], fov 13.

**Cómo se mueve:**
- `actualizar` acerca la posición, la mira y el fov a la toma con `factorSuavizado(dt)`.
- Luego suma un vaivén `x += sin(t * .25) * .12` y `y += sin(t * .4) * .04`, salvo con movimiento reducido.
- Aplica `camara.fov = fovParaAspecto(fovActual, camara.aspect)` y `lookAt(mira)`.
- Con movimiento reducido, `irA` siempre es instantáneo.
- `fovParaAspecto` conserva el ancho horizontal de la maqueta en pantallas más angostas. Si `aspecto >= ASPECTO_REFERENCIA`, devuelve `fov`. Si no, devuelve `2·atan(tan(fov/2) · ASPECTO_REFERENCIA / aspecto)`, en grados.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
test('fov igual en la proporción de la maqueta o más ancha', () => {
  expect(fovParaAspecto(42, 640 / 296)).toBeCloseTo(42, 6); expect(fovParaAspecto(42, 21 / 9)).toBe(42);
});
test('fov más abierto en 4:3 para que la torre siga en cuadro', () => {
  expect(fovParaAspecto(42, 4 / 3)).toBeCloseTo(63.8, 1);
});
test('factorSuavizado', () => { expect(factorSuavizado(0)).toBe(0); expect(factorSuavizado(1 / 60)).toBeCloseTo(0.0263, 3); });
test('viaja a la toma de la torre', () => {
  const cam = new PerspectiveCamera(42, 640 / 296); const m = crearCamaraMenu(cam, { movimientoReducido: () => false });
  m.irA('inicio', true); m.irA('torre');
  for (let i = 0; i < 600; i++) m.actualizar(1 / 60, i / 60);
  const p = m.estado().posicion; TOMAS.torre.posicion.forEach((v, k) => expect(Math.abs(p[k] - v)).toBeLessThan(0.15));
});
test('con movimiento reducido llega en un cuadro y sin vaivén', () => {
  const cam = new PerspectiveCamera(42, 640 / 296); const m = crearCamaraMenu(cam, { movimientoReducido: () => true });
  m.irA('inicio'); m.irA('torre'); m.actualizar(1 / 60, 5);
  expect(m.estado().posicion).toEqual(TOMAS.torre.posicion); expect(cam.position.toArray()).toEqual(TOMAS.torre.posicion);
});
```

- [ ] **Paso 2: correr las pruebas.** `npx vitest run src/camara` → FALLAN.
- [ ] **Paso 3: implementar** `tomas.ts` y `camara-menu.ts`. `estado()` devuelve la toma suavizada sin el vaivén.
- [ ] **Paso 4: correr las pruebas.** `npx vitest run src/camara` → PASAN.
- [ ] **Paso 5: commit.** Mensaje: "Cámara del menú: tomas por pantalla, viaje suave y fov según proporción".

---

### Tarea 6: mundo, parte 1 (cielo, luz, terreno, carretera y torre)

**Archivos:**
- Crear: `src/mundo/paletas.ts`, `src/mundo/tierra-baldia/cielo.ts`, `terreno.ts`, `torre.ts`, `index.ts`
- Crear la prueba: `src/mundo/tierra-baldia/terreno.test.ts`
- Modificar: `src/main.ts`, que construye el mundo y lo actualiza en el bucle.

**Interfaces:**
- Consume: `Calidad`, `crearAzar`.
- Produce:
  - `interface PaletaExterior` y `TIERRA_BALDIA: PaletaExterior`.
  - `interface PasoConstruccion { nombre: string; peso: number; correr(): void }`
  - `interface MundoMenu { pasos: PasoConstruccion[]; actualizar(dt: number, t: number): void; resaltarPiso(indice: number | null): void }`
  - `crearTierraBaldia(escena: Scene, calidad: Calidad, azar: () => number): MundoMenu`. `main` le pasa `crearAzar(SEMILLA_MUNDO)` con `SEMILLA_MUNDO = 20261106`, para que el mundo salga igual en cada arranque. Hasta la Tarea 12, `main` corre los pasos en orden y sin esperar.
  - `alturaTerreno(x: number, z: number): number`
  - `crearTorre(escena: Scene, paleta: PaletaExterior): { actualizar(t: number): void; resaltarPiso(indice: number | null): void }`

**Valores de `TIERRA_BALDIA`** (salen de la maqueta, líneas 51-131):
- niebla `#C9A47E`, de 30 a 520
- cieloArriba `#617080`, sol `#FFE2B8`, dirSol (-.55, .16, -.8)
- hemisferio: cielo `#C3CAD2`, suelo `#6E5843`
- luzSol `#FFD2A0`
- arenaClara `#A68C69`, arenaOscura `#7A6650`, roca `#5C544B`
- asfalto `#4F4842`, marcas `#8E877C`
- torreMetal `#2D3134`, torreLuz `#A6E8EC`, haz `#C9F4F6`, brillo `#BFF2F4`
- escotilla `#FFB36B`, polvo `#EAD7BC`

**Cómo se pasa la maqueta a three 0.187.** three 0.187 maneja el color de otra forma que la r128 de la maqueta; estas son las decisiones fijas:
- **Cielo:** los uniformes del sombreador son `Vector3` con los valores sRGB en 0..1, no `Color`. El sombreador no incluye los trozos de tonemapping ni de espacio de color, y así el cielo queda idéntico a la maqueta.
- **Texturas de lienzo** (fachada y brillo): `colorSpace = SRGBColorSpace`.
- **Luces:** se parte de las intensidades de la maqueta multiplicadas por π: hemisferio .7π, sol 1.75π y escotilla 1.1π. Después se ajustan con la prueba de paridad de la Tarea 7.

**Sombras del sol (más detalle cerca de la cámara):**
- La cámara de sombra va en ±60 alrededor de (0, 0, -20), con near 1 y far 330.
- `mapSize` sale de `calidad.sombraTam`.
- bias -.0006 y normalBias .03.

**El resto de esta tarea:**
- **Terreno:** malla de 700×700 con 140×140 segmentos y colores por vértice. Se pasan las líneas 64-72 de la maqueta: terreno, carretera y marcas. Las marcas van en un `InstancedMesh` y usan `azar` en vez de `Math.random`.
- **Torre:** se pasan las líneas 102-110. Base, eje y aletas van fusionados en una sola malla con `mergeGeometries` (de `three/addons/utils/BufferGeometryUtils.js`). Los 4 anillos y el brillo quedan aparte.
- **Latido de los anillos:** opacidad `.45 + .4·sin(t·1.6 + i·.9)`.
- **`resaltarPiso(i)`:** con i de 0 a 3, el anillo i queda en opacidad fija de .95 y color `#DDFBFC`, y los demás bajan a ×0,6. Con i = 4, el brillo de la punta pasa de escala 70 a 84. Con `null`, todo vuelve a normal.

- [ ] **Paso 1: escribir la prueba que falla.**

```ts
test('la carretera es plana', () => {
  for (let z = 10; z > -300; z -= 7) for (const x of [-5, -2.5, 0, 3, 5]) expect(alturaTerreno(x, z)).toBe(0);
});
test('el terreno queda acotado', () => {
  for (let i = 0; i < 2000; i++) { const h = alturaTerreno((i % 80) - 40, -i * 0.3); expect(h).toBeGreaterThanOrEqual(-2.3); expect(h).toBeLessThanOrEqual(5.1); }
});
```

- [ ] **Paso 2: correr la prueba.** `npx vitest run src/mundo` → FALLA.
- [ ] **Paso 3: implementar** `alturaTerreno` con la fórmula de la maqueta (línea 63), copiada tal cual, y después `paletas.ts`, `cielo.ts`, `terreno.ts`, `torre.ts` e `index.ts`. Los pasos de esta parte son `cielo` (peso 1), `terreno` (2) y `torre` (1).
- [ ] **Paso 4: correr la prueba.** `npx vitest run src/mundo` → PASA.
- [ ] **Paso 5: revisar la escena en el navegador.**
  - Abrir `nexo-dev` en el panel con `?prueba=1`. Como el panel oculto anda lento, avanzar el tiempo con `nexo.avanzar(1)`.
  - Tomar captura: se ven el cielo, la bruma, el terreno, la carretera y la torre con sus anillos.
  - La consola no muestra errores.
- [ ] **Paso 6: commit.** Mensaje: "Tierra baldía 1/2: cielo, luz, sombras, terreno, carretera y torre".

---

### Tarea 7: mundo, parte 2 (ruinas, utilería, personaje, polvo y sombras de contacto)

**Archivos:**
- Crear: `src/mundo/tierra-baldia/ruinas.ts`, `utileria.ts`, `sobreviviente.ts`, `polvo.ts`, `sombra-contacto.ts`
- Crear las pruebas: `tests/navegador/escena.spec.ts`, `tests/navegador/paridad.spec.ts`
- Modificar: `src/mundo/tierra-baldia/index.ts`, `src/main.ts`

**Interfaces:**
- Consume: `PaletaExterior`, `alturaTerreno`, `PasoConstruccion` y `MundoMenu`.
- Produce:
  - `crearSombraContacto(ancho: number, largo: number, opacidad: number): Mesh`: una calcomanía con degradado radial, que no recibe niebla y va sobre el suelo.
  - `crearSobreviviente(escena: Scene, paleta: PaletaExterior): { grupo: Group; actualizar(t: number): void }`. En la etapa 3 se cambia por el modelo final con esta misma firma.
  - `crearPolvo(escena: Scene, paleta: PaletaExterior, cantidad: number, azar: () => number): { actualizar(dt: number, t: number): void }`
  - Los pasos nuevos de `pasos`: `ruinas` (peso 4), `utileria` (2), `personaje` (1) y `polvo` (1).

**Qué se pasa de la maqueta** (mismas posiciones y números; todo `Math.random` pasa a `azar`):
- **Ruinas** (líneas 73-91):
  - Todos los edificios quedan en **una sola malla fusionada**. Cada edificio lleva su tinte en colores por vértice, sacado de la lista TINT y convertido con `Color`.
  - Las UV de cada caja se escalan por `(max(1, w/8), max(1, h/14))` y la textura de fachada usa `RepeatWrapping`.
  - Los escombros van en un `InstancedMesh`.
- **Postes, carros y escotilla** (líneas 92-128):
  - Los postes van en una malla fusionada.
  - Los 3 carros van en una malla de carrocería y una de vidrios.
  - La escotilla abierta lleva una luz cálida que titila: `1 + sin(t·7)·.08 + sin(t·2.3)·.06`, ×π.
- **Sobreviviente** (líneas 111-121): se usa el muñeco de la maqueta, con respiración (`pecho` y `abrigo`) como en la línea 173.
- **Polvo** (líneas 129-131 y 175):
  - La cantidad sale de `calidad.polvo`.
  - El viento es `1.4 + (i % 7)·.15`.
  - Al llegar a x = 40, cada partícula vuelve a x = -40.

**Mejores sombras** (lo que pidió David):
- Sombras de contacto: personaje 0,9×0,9 con opacidad .5, cada carro 2,6×4,8 con .45, escotilla 1,9×1,9 con .4, y una en la base de cada edificio de (w+2)×(d+2) con .35.
- Todas van en un solo `InstancedMesh`.

**Tope:** 70 llamadas de dibujo en la toma `inicio` con calidad alto, contando la pasada de sombras.

- [ ] **Paso 1: escribir las pruebas que fallan.**

`tests/navegador/escena.spec.ts`:

```ts
test('escena completa dentro del tope de llamadas', async ({ page }) => {
  const errores = recogerErrores(page);
  await page.goto('/?prueba=1&calidad=alto'); await page.waitForFunction(() => window.nexo);
  await page.evaluate(() => window.nexo!.avanzar(0.5));
  const r = await page.evaluate(() => window.nexo!.render());
  expect(r.llamadas).toBeLessThanOrEqual(70);
  expect(r.triangulos).toBeGreaterThan(40_000);
  expect(await varianzaLienzo(page)).toBeGreaterThan(8);
  expect(errores).toEqual([]);
});
```

`tests/navegador/paridad.spec.ts`, con `@paridad` en el título de la prueba (se corre a mano y necesita internet para la r128 de la maqueta):
- Captura `#scr` de la maqueta, con `#capa` oculto.
- Captura la app con el viewport del mismo tamaño que `#scr`, en la toma `inicio`.
- Compara el color promedio de la imagen completa, del tercio de arriba (cielo) y del tercio de abajo (suelo). Cada canal debe quedar a 12/255 o menos de la maqueta.

- [ ] **Paso 2: escribir la ayuda de varianza.** En `ayudas.ts`, `varianzaLienzo(page: Page): Promise<number>` hace una captura de `#lienzo`, la lee con pngjs y devuelve la desviación estándar de la luminancia.
- [ ] **Paso 3: correr la prueba.** `npx playwright test escena --project=escritorio` → FALLA.
- [ ] **Paso 4: implementar los cinco módulos** y agregar sus pasos en `index.ts`.
- [ ] **Paso 5: correr la prueba.** `npx playwright test escena` en los tres proyectos → PASA. Anotar en el commit las llamadas medidas.
- [ ] **Paso 6: revisar la paridad.**
  - Correr `npx playwright test --grep @paridad --project=escritorio` y ajustar las intensidades de luz y la exposición hasta que pase.
  - Mirar las dos capturas lado a lado: la escena debe verse como la maqueta, con sombras más nítidas.
- [ ] **Paso 7: commit.** Mensaje: "Tierra baldía 2/2: ruinas, utilería, personaje, polvo y sombras de contacto".

---

### Tarea 8: progreso guardado y datos de los pisos

**Archivos:**
- Crear: `src/datos/pisos.ts`, `src/guardado/almacen.ts`, `src/guardado/progreso.ts`
- Crear las pruebas: `src/datos/pisos.test.ts`, `src/guardado/almacen.test.ts`, `src/guardado/progreso.test.ts`

**Interfaces:**
- Produce, en `pisos.ts`:
  - `type IdPiso = 'tierra' | 'cristal' | 'magma' | 'vacio' | 'nucleo'`
  - `interface Piso { id: IdPiso; numero: number; nombre: string; jefe: string | null; registros: number; disponible: boolean }`
  - `PISOS: readonly Piso[]`, de abajo hacia arriba.
  - `pisoPorId(id: IdPiso): Piso`
  - `siguientePisoDisponible(id: IdPiso): IdPiso | null`
  - `TOTAL_REGISTROS`: la suma de los pisos disponibles, que da 4.
- Produce, en `almacen.ts`:
  - `interface Almacen { leer(clave: string): string | null; escribir(clave: string, valor: string): boolean; borrar(clave: string): void }`
  - `almacenLocal(): Almacen`: envuelve `localStorage` en try/catch, incluido el acceso al objeto mismo, que en Safari puede lanzar error.
  - `almacenMemoria(): Almacen`
- Produce, en `progreso.ts`:
  - `type EstadoPiso = 'completado' | 'actual' | 'sellado'`
  - `interface Progreso { version: 1; pisoActual: IdPiso; completados: IdPiso[]; records: Partial<Record<IdPiso, number>>; registros: string[]; guardadoEn: number }`. Los registros tienen ids con la forma `<idPiso>-<n>`.
  - `CLAVE_PROGRESO = 'nexo.progreso'` y `CLAVE_RESPALDO = 'nexo.progreso.respaldo'`.
  - `progresoInicial(ahora: number): Progreso`
  - `cargarProgreso(almacen: Almacen, ahora: number): { progreso: Progreso; existia: boolean }`
  - `guardarProgreso(almacen: Almacen, p: Progreso, ahora: number): boolean`
  - `estadoDePiso(p: Progreso, id: IdPiso): EstadoPiso`. "Completado" gana sobre "actual".
  - `completarPiso(p: Progreso, id: IdPiso): Progreso`. Es pura: no repite el piso en `completados` y nunca abre un piso que no está disponible.
  - `tieneAvance(p: Progreso): boolean`
  - `registrosDePiso(p: Progreso, id: IdPiso): number`

**Valores de `PISOS`:**
- tierra: 1, "Tierra baldía", jefe "Centinela", 2 registros, disponible.
- cristal: 2, "Cristal", jefe "Hidra de cristal", 2 registros, disponible.
- magma: 3, "Magma", sin jefe, 0 registros, no disponible.
- vacio: 4, "Vacío", sin jefe, 0 registros, no disponible.
- nucleo: 5, "Núcleo", sin jefe, 0 registros, no disponible.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
test('datos de pisos', () => {
  expect(TOTAL_REGISTROS).toBe(4); expect(siguientePisoDisponible('tierra')).toBe('cristal');
  expect(siguientePisoDisponible('cristal')).toBeNull();
});
test('sin guardado: progreso inicial y existia=false', () => {
  const r = cargarProgreso(almacenMemoria(), 1000);
  expect(r.existia).toBe(false); expect(r.progreso.pisoActual).toBe('tierra'); expect(r.progreso.completados).toEqual([]);
});
test('guarda y vuelve a cargar igual', () => {
  const a = almacenMemoria(); const p = { ...progresoInicial(0), records: { tierra: 12480 } };
  expect(guardarProgreso(a, p, 5000)).toBe(true);
  expect(cargarProgreso(a, 6000)).toEqual({ progreso: { ...p, guardadoEn: 5000 }, existia: true });
});
test.each(['{oops', '{"version":2,"pisoActual":"tierra"}', '{"version":1,"pisoActual":"luna","completados":[],"records":{},"registros":[],"guardadoEn":0}', '[]', 'null'])(
  'guardado inválido %s: arranca nuevo y guarda respaldo', (crudo) => {
  const a = almacenMemoria(); a.escribir(CLAVE_PROGRESO, crudo);
  const r = cargarProgreso(a, 1);
  expect(r.existia).toBe(false); expect(r.progreso).toEqual(progresoInicial(1)); expect(a.leer(CLAVE_RESPALDO)).toBe(crudo);
});
test('almacenamiento bloqueado no rompe nada', () => {
  vi.stubGlobal('localStorage', { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); }, removeItem() { throw new Error('bloqueado'); } });
  const a = almacenLocal(); expect(a.leer('x')).toBeNull(); expect(a.escribir('x', '1')).toBe(false); expect(() => a.borrar('x')).not.toThrow();
  vi.unstubAllGlobals();
});
test('completar pisos', () => {
  const p1 = completarPiso(progresoInicial(0), 'tierra');
  expect(p1.pisoActual).toBe('cristal'); expect(estadoDePiso(p1, 'tierra')).toBe('completado'); expect(estadoDePiso(p1, 'cristal')).toBe('actual');
  const p2 = completarPiso(completarPiso(p1, 'cristal'), 'cristal');
  expect(p2.completados).toEqual(['tierra', 'cristal']); expect(p2.pisoActual).toBe('cristal'); expect(estadoDePiso(p2, 'magma')).toBe('sellado');
});
test('avance y registros por piso', () => {
  const p = progresoInicial(0); expect(tieneAvance(p)).toBe(false);
  const q = { ...p, registros: ['tierra-1', 'cristal-2'] };
  expect(tieneAvance(q)).toBe(true); expect(registrosDePiso(q, 'tierra')).toBe(1);
});
```

- [ ] **Paso 2: correr las pruebas.** `npx vitest run src/datos src/guardado` → FALLAN.
- [ ] **Paso 3: implementar.** `cargarProgreso` valida cada campo: versión exactamente 1, `pisoActual` conocido, `completados` con ids conocidos, `records` con números finitos y `registros` con textos. Si algo no cuadra, guarda el texto crudo en `CLAVE_RESPALDO` y devuelve el progreso inicial.
- [ ] **Paso 4: correr las pruebas.** `npx vitest run src/datos src/guardado` → PASAN.
- [ ] **Paso 5: commit.** Mensaje: "Progreso guardado con versión y respaldo, y datos de los 5 pisos".

---

### Tarea 9: piezas de interfaz (gestor de pantallas, lista de menú, avisos, confirmación y aviso de girar)

**Archivos:**
- Crear: `src/interfaz/gestor-pantallas.ts`, `lista-menu.ts`, `aviso.ts`, `confirmacion.ts`, `girar.ts`
- Crear las pruebas: `src/interfaz/gestor-pantallas.test.ts`, `lista-menu.test.ts`, `aviso.test.ts`, `confirmacion.test.ts`. Todas usan happy-dom y temporizadores falsos.

**Interfaces:**
- Consume: `CamaraMenu.irA`, `IdToma`, `TEXTOS` e `ICONOS`.
- Produce, en `gestor-pantallas.ts`:
  - `type IdPantalla = 'carga' | 'inicio' | 'torre'`
  - `interface Pantalla { id: IdPantalla; toma: IdToma; elemento: HTMLElement; alEntrar?(): void; alSalir?(): void; alTecla?(e: KeyboardEvent): boolean }`
  - `interface GestorPantallas { registrar(p: Pantalla): void; ir(id: IdPantalla, opciones?: { apilar?: boolean; instantaneo?: boolean }): boolean; atras(): void; actual(): IdPantalla | null; enTransicion(): boolean }`
  - `crearGestorPantallas(capa: HTMLElement, deps: { camara: { irA(t: IdToma, instantaneo?: boolean): void }; historial: Pick<History, 'pushState' | 'replaceState' | 'back'>; ventana: Window; duracionMs: number }): GestorPantallas`
- Produce, en `lista-menu.ts`:
  - `interface ListaMenu { activo(): number; mover(delta: 1 | -1): void; enfocar(indice: number): void; teclado(e: KeyboardEvent): boolean; destruir(): void }`
  - `crearListaMenu(contenedor: HTMLElement, opciones: { selector: string; alActivar(indice: number, origen: 'toque' | 'tecla'): void; alCambiar?(indice: number): void; inicial?: number }): ListaMenu`
- Produce, en `aviso.ts`: `crearAvisos(contenedor: HTMLElement, duracionMs?: number): { mostrar(texto: string): void }`. La duración por defecto es 2600 ms.
- Produce, en `confirmacion.ts`: `pedirConfirmacion(contenedor: HTMLElement, textos: { titulo: string; texto: string; aceptar: string; cancelar: string }): Promise<boolean>`
- Produce, en `girar.ts`: `crearAvisoGirar(contenedor: HTMLElement): void`. El CSS lo muestra solo con `@media (orientation: portrait) and (pointer: coarse)`.

**Reglas del gestor:**
- **Elementos:** cada pantalla es un `section.pantalla.pantalla-<id>` dentro de `#capa`, por ejemplo `.pantalla-carga`.
- **Cuándo no navega:** `ir` devuelve `false` y no hace nada si hay una transición en curso o si `id` ya es la pantalla actual.
- **Cómo cambia de pantalla:**
  1. Si no, llama a `camara.irA(toma, instantaneo ?? false)` y pone `.saliendo` en la pantalla vieja.
  2. A los `duracionMs` la oculta (`hidden`), llama a `alSalir`, muestra la nueva con `.entrando`, quita esa clase en el siguiente cuadro y llama a `alEntrar`.
  3. La transición termina a los `2·duracionMs`.
- **Instantáneo:** con `instantaneo`, el cambio pasa en el acto y la cámara también llega en el acto.
- **Historial:** con `apilar`, se llama a `pushState({ pantalla: id }, '')`. El `popstate` hace `ir(estado?.pantalla ?? 'inicio')` sin apilar. Si llega durante una transición, se guarda y se aplica al terminar.
- **Teclado:** `keydown` va primero a `alTecla` de la pantalla actual. Si no lo usa, Escape llama a `atras()`, que hace `historial.back()` solo si la pantalla actual no es `inicio` ni `carga`.

**Reglas de la lista de menú:**
- Toma los elementos que coinciden con `selector`.
- `mover` salta los que tienen `aria-disabled="true"` y da la vuelta.
- Con el puntero encima (`pointerenter`), `enfocar` ese elemento.
- Clic → `alActivar(i, 'toque')`, también en los deshabilitados, para que la pantalla muestre su aviso.
- ArrowUp y ArrowDown mueven; Enter y Espacio → `alActivar(activo, 'tecla')`.
- Solo el elemento activo tiene la clase `.activo`.

**Avisos y confirmación:**
- **Avisos:** hay uno a la vez y uno nuevo reemplaza al anterior. Es `role="status"` con `aria-live="polite"`. Entra con opacidad y `translateY(var(--desplaza-aviso))` en `var(--d-aviso)` y sale en `var(--d-aviso-sale)`.
- **Confirmación:**
  - Un `.telon` con `.modal.panel` encima, y el foco en Cancelar.
  - Escape o un clic en el telón → `false`; Aceptar → `true`.
  - Escucha el teclado en fase de captura, para que la pantalla de abajo no lo reciba, y se quita sola al responder.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
// gestor-pantallas.test.ts (pantallas falsas 'inicio' y 'torre', duracionMs 280)
test('navega una sola vez aunque se pida dos veces seguidas', () => {
  g.ir('inicio', { instantaneo: true });
  expect(g.ir('torre', { apilar: true })).toBe(true); expect(g.ir('torre', { apilar: true })).toBe(false);
  expect(g.ir('inicio')).toBe(false); vi.advanceTimersByTime(560);
  expect(g.actual()).toBe('torre'); expect(historial.pushState).toHaveBeenCalledTimes(1);
  expect(camara.irA).toHaveBeenLastCalledWith('torre', false);
});
test('atrás del navegador vuelve al inicio sin apilar', () => {
  /* ir a torre, terminar transición */ ventana.dispatchEvent(new PopStateEvent('popstate', { state: { pantalla: 'inicio' } }));
  vi.advanceTimersByTime(560); expect(g.actual()).toBe('inicio'); expect(historial.pushState).toHaveBeenCalledTimes(1);
});
test('popstate durante una transición se aplica al terminar', () => {
  g.ir('torre', { apilar: true }); ventana.dispatchEvent(new PopStateEvent('popstate', { state: { pantalla: 'inicio' } }));
  vi.advanceTimersByTime(560 + 560); expect(g.actual()).toBe('inicio');
});
test('Escape en el inicio no sale del juego', () => { /* actual inicio */ ventana.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); expect(historial.back).not.toHaveBeenCalled(); });
// lista-menu.test.ts: 4 botones .item, el 3.º con aria-disabled
test('salta deshabilitados y da la vuelta', () => {
  expect(l.activo()).toBe(0); l.mover(1); expect(l.activo()).toBe(1); l.mover(1); expect(l.activo()).toBe(3); l.mover(1); expect(l.activo()).toBe(0);
  l.teclado(new KeyboardEvent('keydown', { key: 'ArrowUp' })); expect(l.activo()).toBe(3);
});
test('Enter activa por tecla y clic por toque, también en deshabilitados', () => {
  l.teclado(new KeyboardEvent('keydown', { key: 'Enter' })); expect(alActivar).toHaveBeenLastCalledWith(0, 'tecla');
  items[2].click(); expect(alActivar).toHaveBeenLastCalledWith(2, 'toque');
});
test('puntero encima marca solo ese elemento', () => {
  items[1].dispatchEvent(new Event('pointerenter'));
  expect([...items].map(i => i.classList.contains('activo'))).toEqual([false, true, false, false]);
});
// aviso.test.ts
test('un aviso a la vez y se va solo', () => {
  a.mostrar('uno'); a.mostrar('dos'); expect(c.querySelectorAll('.aviso')).toHaveLength(1); expect(c.querySelector('.aviso')!.textContent).toBe('dos');
  vi.advanceTimersByTime(2600 + 160); expect(c.querySelector('.aviso')).toBeNull();
});
// confirmacion.test.ts
test('aceptar resuelve true y se quita', async () => { const r = pedirConfirmacion(c, T); c.querySelector<HTMLElement>('[data-accion="aceptar"]')!.click(); expect(await r).toBe(true); expect(c.querySelector('.modal')).toBeNull(); });
test('Escape resuelve false y el foco empieza en Cancelar', async () => {
  const r = pedirConfirmacion(c, T); expect(document.activeElement?.getAttribute('data-accion')).toBe('cancelar');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); expect(await r).toBe(false);
});
```

- [ ] **Paso 2: correr las pruebas.** `npx vitest run src/interfaz` → FALLAN.
- [ ] **Paso 3: implementar los cinco módulos** con las reglas de arriba. Los botones de la confirmación llevan `data-accion="aceptar"` y `data-accion="cancelar"`.
- [ ] **Paso 4: correr las pruebas.** `npx vitest run src/interfaz` → PASAN, incluida la de colores sueltos de la Tarea 3.
- [ ] **Paso 5: commit.** Mensaje: "Interfaz: gestor de pantallas con historial, lista de menú, avisos, confirmación y aviso de girar".

---

### Tarea 10: pantalla de inicio

**Archivos:**
- Crear: `src/interfaz/pantallas/inicio.ts`, `tests/navegador/inicio.spec.ts`
- Modificar:
  - `src/interfaz/componentes.css`: la ubicación del inicio (`.menu` y el último guardado), solo con variables.
  - `src/main.ts`: el arranque construye el mundo, crea el gestor, los avisos y el aviso de girar, registra el inicio, hace `ir('inicio', {instantaneo:true})` y `replaceState({pantalla:'inicio'}, '')`.
  - `src/nucleo/modo-prueba.ts`
  - `tests/navegador/ayudas.ts`: `abrir(page, consulta = '')` va a `/?prueba=1&calidad=bajo${consulta}`, espera `window.nexo?.pantalla() === 'inicio'` (hasta 30 s) y devuelve los errores.

**Interfaces:**
- Consume: `GestorPantallas`, `crearListaMenu`, `crearAvisos`, `pedirConfirmacion`, `Progreso`, `cargarProgreso`, `guardarProgreso`, `tieneAvance`, `pisoPorId`, `TOTAL_REGISTROS`, `tiempoRelativo` y `TEXTOS`.
- Produce:
  - `crearPantallaInicio(deps: { estado: () => { progreso: Progreso; existia: boolean }; ahora: () => number; alContinuar(): void; alNuevaPartida(): void; avisos: { mostrar(t: string): void } }): Pantalla & { refrescar(): void }`
  - `ApiPrueba.pantalla(): IdPantalla | null`
  - `ApiPrueba.ir(id: IdPantalla): boolean`
  - `ApiPrueba.progreso(cambios?: Partial<Progreso>): Progreso`. Si recibe cambios, los mezcla, los guarda, marca `existia` y llama a `refrescar` en las pantallas.

**Composición** (de la maqueta, líneas 135-140):
- `.velo-inicio`.
- Arriba a la izquierda, el `.logo` "NEXO" y la `.etiqueta` con `TEXTOS.juego.capitulo`.
- Abajo a la izquierda, `.menu` con `button.item`, cada uno con su `.marca` cuando está activo:
  - "Continuar", con `.pista` del nombre del piso actual. Aparece solo si `existia`.
  - "Nueva partida".
  - "Registros", con `.pista` `${registros.length} / ${TOTAL_REGISTROS}`.
  - "Ajustes".
- Abajo a la derecha, `.etiqueta` "Último guardado · {tiempoRelativo}", solo si `existia`.
- Todo se ubica con `--borde-*`. `refrescar` vuelve a pintar todo y se llama en `alEntrar`.

**Acciones** (en `main`):
- Continuar → `deps.alContinuar()`.
- Nueva partida:
  - Si `existia && tieneAvance`, primero `pedirConfirmacion(TEXTOS.confirmarNueva)`. Con `false` no pasa nada.
  - Si se confirma, o si no había avance: `progresoInicial`, `guardarProgreso`, `existia = true` y `alContinuar()`.
- Registros y Ajustes → `avisos.mostrar(TEXTOS.pronto)`.
- En esta tarea `alContinuar` muestra `TEXTOS.pronto`. La Tarea 11 lo cambia por el mapa.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
test('sin partida', async ({ page }) => {
  const errores = await abrir(page);
  await expect(page.locator('.item')).toHaveText([/^Nueva partida$/, /^Registros\s*0 \/ 4$/, /^Ajustes$/]);
  await expect(page.getByText('Último guardado')).toHaveCount(0);
  expect(await varianzaLienzo(page)).toBeGreaterThan(8); expect(errores).toEqual([]);
});
test('con partida: continuar y último guardado', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nexo.progreso', JSON.stringify({ version: 1, pisoActual: 'tierra', completados: [], records: {}, registros: [], guardadoEn: Date.now() - 2 * 3_600_000 })));
  await abrir(page);
  await expect(page.locator('.item').first()).toHaveText(/^Continuar\s*Tierra baldía$/);
  await expect(page.getByText('Último guardado · hace 2 h')).toBeVisible();
});
test('guardado dañado: arranca sin partida y sin errores', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nexo.progreso', '{oops'));
  const errores = await abrir(page);
  await expect(page.locator('.item').first()).toHaveText('Nueva partida'); expect(errores).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('nexo.progreso.respaldo'))).toBe('{oops');
});
test('nueva partida con avance pide confirmación y Cancelar no borra', async ({ page }) => {
  /* guardado con completados ['tierra'] */ await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(page.locator('.modal')).toContainText('¿Empezar de nuevo?');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('nexo.progreso')))!).completados).toEqual(['tierra']);
});
test('teclado: flecha abajo y Enter en Registros muestra el aviso', async ({ page }) => {
  await abrir(page); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(page.locator('.aviso')).toHaveText('Disponible en una próxima etapa.');
});
test.describe('celular en vertical', () => {
  test.use({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true });
  test('pide girar el celular', async ({ page }) => { await abrir(page); await expect(page.locator('.girar')).toBeVisible(); await expect(page.locator('.girar')).toContainText('Gira el celular'); });
});
test('en horizontal no aparece el aviso de girar', async ({ page }) => { await abrir(page); await expect(page.locator('.girar')).toBeHidden(); });
```

- [ ] **Paso 2: correr las pruebas.** `npx playwright test inicio --project=escritorio` → FALLAN.
- [ ] **Paso 3: implementar** `inicio.ts`, las acciones en `main.ts` y los miembros nuevos de `ApiPrueba`.
- [ ] **Paso 4: correr las pruebas.** `npx playwright test inicio arranque contexto escena` en los tres proyectos → PASAN.
- [ ] **Paso 5: revisar en el navegador** el inicio con y sin partida, el teclado, la confirmación y el aviso. Tomar captura y revisar que la consola esté limpia.
- [ ] **Paso 6: commit.** Mensaje: "Pantalla de inicio con continuar, nueva partida confirmada y aviso de girar".

---

### Tarea 11: mapa de la torre

**Archivos:**
- Crear: `src/interfaz/pantallas/torre.ts`, `tests/navegador/torre.spec.ts`
- Modificar: `src/main.ts`, `src/nucleo/modo-prueba.ts` y `src/interfaz/componentes.css` (`.lista-pisos`, `.tarjeta-piso`, `.boton-volver`, solo con variables)

**Interfaces:**
- Consume: `PISOS`, `estadoDePiso`, `registrosDePiso`, `formatearPuntaje`, `crearListaMenu`, `MundoMenu.resaltarPiso`, `GestorPantallas`, `ICONOS` y `TEXTOS.torre`.
- Produce:
  - `crearPantallaTorre(deps: { estado: () => { progreso: Progreso }; avisos: { mostrar(t: string): void }; alEntrarPortal(id: IdPiso): void; alResaltar(indice: number | null): void; alVolver(): void }): Pantalla & { refrescar(): void }`
  - `ApiPrueba.resaltado(): number | null`

**Composición** (de la maqueta, líneas 149-161):
- `.velo-torre`.
- **Lista de pisos:** `.panel.lista-pisos` a la izquierda (de `--borde-arriba` a `--borde-abajo`, ancho `--ancho-panel`).
  - Arriba, la `.etiqueta` con `TEXTOS.torre.titulo`.
  - Luego 5 `button.fila`, de arriba hacia abajo: Núcleo, Vacío, Magma, Cristal y Tierra baldía. Cada una lleva su ícono (candado, check o `.marca`), el nombre y la `.pista` con el estado.
  - Las selladas llevan `aria-disabled="true"` y `.sellada`.
- **Tarjeta del piso:** `.panel.tarjeta-piso` abajo a la derecha, con:
  - la `.etiqueta` "Piso {n} · Dimensión";
  - el `.titulo` con el nombre en la letra del logo;
  - el `.detalle` con "Jefe: X" (o "por descubrir"), "Registros: a de b" y "Récord: 12.480" (o "—");
  - y la `.cta` "Entrar al portal" con su flecha.
- **Volver:** `.boton-volver` arriba a la derecha, con la flecha izquierda y "Volver".

**Comportamiento:**
- Al entrar, queda seleccionado el piso actual.
- Con el puntero encima, con un toque o con las flechas, la fila seleccionada cambia la tarjeta y llama a `alResaltar` con el índice del piso en `PISOS`.
- Toque en una fila sellada: muestra `TEXTOS.torre.proximoCapitulo` si el piso no está disponible y `TEXTOS.torre.sellado` si sí lo está. La selección no cambia.
- Enter, o un toque en `.cta` → `alEntrarPortal(id)`. En `main`, eso muestra `TEXTOS.torre.portalPronto`.
- `alSalir` → `alResaltar(null)`. Volver → `gestor.atras()`.
- En `main`, el `alContinuar` del inicio pasa a ser `gestor.ir('torre', { apilar: true })`.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
const P = { version: 1, pisoActual: 'cristal', completados: ['tierra'], records: { cristal: 12480 }, registros: ['tierra-1'], guardadoEn: Date.now() };
test('estados de los pisos y tarjeta del actual', async ({ page }) => {
  await page.addInitScript(v => localStorage.setItem('nexo.progreso', v), JSON.stringify(P));
  const errores = await abrir(page); await page.getByRole('button', { name: /Continuar/ }).click();
  await expect(page.locator('.fila')).toHaveText([/Núcleo.*Sellado/, /Vacío.*Sellado/, /Magma.*Sellado/, /Cristal.*Actual/, /Tierra baldía.*Completado/]);
  const t = page.locator('.tarjeta-piso');
  await expect(t).toContainText('Piso 2 · Dimensión'); await expect(t).toContainText('Jefe: Hidra de cristal');
  await expect(t).toContainText('Registros: 0 de 2'); await expect(t).toContainText('Récord: 12.480');
  expect(await page.evaluate(() => window.nexo!.resaltado())).toBe(1); expect(errores).toEqual([]);
});
test('piso sellado avisa y no cambia la selección', async ({ page }) => {
  /* mismo inicio */ await page.locator('.fila', { hasText: 'Magma' }).click();
  await expect(page.locator('.aviso')).toHaveText('Este piso llega en un próximo capítulo.');
  await expect(page.locator('.tarjeta-piso')).toContainText('Cristal');
});
test('elegir otro piso cambia la tarjeta y la torre', async ({ page }) => {
  /* mismo inicio */ await page.locator('.fila', { hasText: 'Tierra baldía' }).click();
  await expect(page.locator('.tarjeta-piso')).toContainText('Jefe: Centinela');
  expect(await page.evaluate(() => window.nexo!.resaltado())).toBe(0);
});
test('Volver, atrás del navegador y Escape regresan al inicio', async ({ page }) => {
  /* mismo inicio */ await page.getByRole('button', { name: 'Volver' }).click();
  await expect.poll(() => page.evaluate(() => window.nexo!.pantalla())).toBe('inicio');
  await page.getByRole('button', { name: /Continuar/ }).click(); await page.goBack();
  await expect.poll(() => page.evaluate(() => window.nexo!.pantalla())).toBe('inicio');
  await page.getByRole('button', { name: /Continuar/ }).click(); await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.nexo!.pantalla())).toBe('inicio');
});
test('doble toque en Continuar navega una sola vez', async ({ page }) => {
  /* mismo inicio */ const antes = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: /Continuar/ }).dblclick();
  await expect.poll(() => page.evaluate(() => window.nexo!.pantalla())).toBe('torre');
  expect(await page.evaluate(() => history.length)).toBe(antes + 1);
});
for (const v of [{ width: 1024, height: 768 }, { width: 1280, height: 720 }, { width: 874, height: 402 }, { width: 1280, height: 548 }]) {
  test(`paneles sin montarse en ${v.width}×${v.height}`, async ({ page }) => {
    await page.setViewportSize(v); /* mismo inicio hasta la torre */
    const a = (await page.locator('.lista-pisos').boundingBox())!, b = (await page.locator('.tarjeta-piso').boundingBox())!;
    expect(a.x + a.width <= b.x || b.y >= a.y + a.height).toBe(true);
    for (const r of [a, b]) { expect(r.x).toBeGreaterThanOrEqual(0); expect(r.y + r.height).toBeLessThanOrEqual(v.height); }
  });
}
test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('la cámara llega a la toma en un cuadro', async ({ page }) => {
    await abrir(page); await page.evaluate(() => { window.nexo!.ir('torre'); window.nexo!.avanzar(1 / 60); });
    expect((await page.evaluate(() => window.nexo!.camara())).posicion).toEqual([4, 3, 6]);
  });
});
```

- [ ] **Paso 2: correr las pruebas.** `npx playwright test torre --project=escritorio` → FALLAN.
- [ ] **Paso 3: implementar** `torre.ts`, conectarlo en `main.ts` (registrar la pantalla, `alResaltar` → `mundo.resaltarPiso`, `alContinuar` → mapa) y agregar `ApiPrueba.resaltado`.
- [ ] **Paso 4: correr las pruebas.** `npx playwright test` en los tres proyectos → PASAN.
- [ ] **Paso 5: revisar en el navegador.**
  - Recorrer inicio → mapa → inicio en 874×402 y en 1024×768, con capturas y la consola limpia.
  - Revisar que la torre resalte el anillo del piso elegido.
- [ ] **Paso 6: commit.** Mensaje: "Mapa de la torre: estados de los pisos, tarjeta, anillo resaltado y volver".

---

### Tarea 12: carga real y arranque con revelado

**Archivos:**
- Crear: `src/carga/cargador.ts`, `src/interfaz/pantallas/carga.ts`
- Crear las pruebas: `src/carga/cargador.test.ts`, `tests/navegador/carga.spec.ts`
- Modificar:
  - `src/main.ts`, con la secuencia de arranque de abajo.
  - `src/interfaz/componentes.css`: la ubicación de la carga, solo con variables.
  - `src/nucleo/preferencias.ts` (y su prueba): `Parametros` gana `fallarCarga: boolean`, que solo vale junto con `prueba`.
  - `src/nucleo/modo-prueba.ts`

**Interfaces:**
- Consume: `MundoMenu.pasos`, `GestorPantallas`, `TEXTOS.carga` y `CamaraMenu`.
- Produce:
  - `interface Tarea { nombre: string; peso: number; correr(): void | Promise<void> }`. `PasoConstruccion` ya cumple esta forma.
  - `class ErrorDeCarga extends Error { tarea: string }`
  - `ejecutarTareas(tareas: Tarea[], alProgreso: (fraccion: number, tarea: string) => void, esperarCuadro: () => Promise<void>): Promise<void>`
  - `crearPantallaCarga(deps: { frase: { texto: string; autor: string }; consejo: string; alReintentar(): void }): Pantalla & { progreso(fraccion: number): void; error(mensaje: string): void }`
  - `CARGA_MINIMA_MS = 1200`
  - `ApiPrueba.carga(): { estado: 'cargando' | 'lista' | 'error'; fracciones: number[]; duracionMs: number }`

**Cómo avanza la carga:**
- `ejecutarTareas` avisa 0 antes de empezar.
- Después de cada tarea avisa la fracción acumulada de peso y espera un cuadro antes de la siguiente.
- Si todos los pesos son 0, cuenta las tareas por igual.
- Si una tarea falla, rechaza con `ErrorDeCarga` y el nombre de esa tarea.

**Pantalla de carga** (de la maqueta, líneas 141-148):
- `.logo.pequeno` arriba a la izquierda.
- Panel abajo a la izquierda con:
  - la `.etiqueta` del autor y la frase;
  - la `.barra > .barra-relleno`, cuyo ancho anima en `var(--d-barra)`;
  - una fila con `TEXTOS.carga.etiqueta` y "{Math.floor(f·100)} %".
- Abajo a la derecha, "Consejo" con un consejo al azar.
- **Error:** `error()` cambia la fila por el mensaje y una `.cta` "Reintentar".

**Diferencia con el documento de diseño.** El documento pide la carga con la escena oscurecida detrás. Al arrancar, la escena todavía se está construyendo, así que esta carga va sobre el fondo oscuro y al final la escena aparece mientras la cámara viaja al inicio. La versión con la escena oscurecida detrás (`.velo-carga`) es la de entrar a un piso, en la etapa 2.

**Arranque, en este orden:**
1. Esperar las fuentes: `Promise.race([document.fonts.ready, 2000 ms])`.
2. Crear el renderizador. Si no hay WebGL, mostrar el mensaje y parar.
3. Registrar las pantallas y hacer `ir('carga', {instantaneo:true})`. La cámara queda en la toma `carga` y el lienzo con `opacity: 0`.
4. Correr `ejecutarTareas` con:
   - los pasos del mundo;
   - `{nombre:'sombreadores', peso:4, correr: () => renderer.compileAsync(escena, camara)}`;
   - `{nombre:'primer-cuadro', peso:1, correr: () => renderer.render(escena, camara)}`.
5. Mantener la carga en pantalla al menos `CARGA_MINIMA_MS` desde el paso 3.
6. Revelar:
   - el lienzo pasa a `opacity: 1` en `var(--d-revelar)`;
   - `gestor.ir('inicio')`, con transición normal; la cámara viaja de la toma `carga` a la de `inicio`;
   - `replaceState({pantalla:'inicio'}, '')`.
7. Si algo falla, `carga.error(TEXTOS.carga.error)`. Reintentar → `location.reload()`.
   - Con `?prueba=1&fallarCarga=1`, el paso `ruinas` falla solo la primera vez.
   - Esa primera vez queda marcada en `sessionStorage['nexo.fallo-hecho']`, con try/catch.

- [ ] **Paso 1: escribir las pruebas que fallan.**

```ts
// cargador.test.ts
const cuadro = () => Promise.resolve();
test('avanza por pesos hasta 1 exacto', async () => {
  const f: number[] = []; await ejecutarTareas([{ nombre: 'a', peso: 1, correr() {} }, { nombre: 'b', peso: 3, correr: async () => {} }], x => f.push(x), cuadro);
  expect(f).toEqual([0, 0.25, 1]);
});
test('pesos en cero no dan NaN', async () => {
  const f: number[] = []; await ejecutarTareas([{ nombre: 'a', peso: 0, correr() {} }, { nombre: 'b', peso: 0, correr() {} }], x => f.push(x), cuadro);
  expect(f).toEqual([0, 0.5, 1]);
});
test('una tarea que falla detiene la carga y dice cuál fue', async () => {
  const f: number[] = [];
  const p = ejecutarTareas([{ nombre: 'a', peso: 1, correr() {} }, { nombre: 'b', peso: 1, correr() { throw new Error('x'); } }], x => f.push(x), cuadro);
  await expect(p).rejects.toMatchObject({ name: 'ErrorDeCarga', tarea: 'b' }); expect(f).toEqual([0, 0.5]);
});
// carga.spec.ts
test('arranque: carga real, mínimo 1,2 s y llega al inicio', async ({ page }) => {
  const errores = recogerErrores(page); await page.goto('/?prueba=1&calidad=bajo');
  await expect(page.locator('.pantalla-carga')).toContainText('Preparando el exterior');
  await expect.poll(() => page.evaluate(() => window.nexo!.pantalla()), { timeout: 30_000 }).toBe('inicio');
  const c = await page.evaluate(() => window.nexo!.carga());
  expect(c.estado).toBe('lista'); expect(c.fracciones[0]).toBe(0); expect(c.fracciones.at(-1)).toBe(1);
  expect(c.fracciones.every((v, i, a) => i === 0 || v >= a[i - 1])).toBe(true); expect(c.duracionMs).toBeGreaterThanOrEqual(1200);
  expect(errores).toEqual([]);
});
test('si falla la carga muestra Reintentar y el reintento funciona', async ({ page }) => {
  await page.goto('/?prueba=1&calidad=bajo&fallarCarga=1');
  await expect(page.locator('.pantalla-carga')).toContainText('No se pudo preparar el juego.');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect.poll(() => page.evaluate(() => window.nexo?.pantalla()), { timeout: 30_000 }).toBe('inicio');
});
test('sin ?prueba=1 no existe window.nexo', async ({ page }) => {
  await page.goto('/'); await page.waitForTimeout(500); expect(await page.evaluate(() => 'nexo' in window)).toBe(false);
});
```

- [ ] **Paso 2: correr las pruebas.** `npx vitest run src/carga` y `npx playwright test carga --project=escritorio` → FALLAN.
- [ ] **Paso 3: implementar** `cargador.ts`, `carga.ts` y la secuencia de arranque en `main.ts`. `abrir()` en `ayudas.ts` ya espera el inicio, así que no cambia.
- [ ] **Paso 4: correr todo.** `npm run verificar` en los tres proyectos → todo PASA.
- [ ] **Paso 5: revisar en el navegador** el arranque completo: la carga con su barra, el revelado y el viaje de la cámara al inicio. Mirarlo también con movimiento reducido. Tomar capturas y revisar que la consola esté limpia.
- [ ] **Paso 6: commit.** Mensaje: "Pantalla de carga con progreso real, error con reintento y revelado de la escena".

---

### Tarea 13: publicación automática en /nexo/avance/

**Archivos:**
- Crear: `scripts/armar-sitio.mjs`, `.github/workflows/publicar.yml`, `tests/navegador/sitio.spec.ts`
- Modificar:
  - `package.json`: scripts `"sitio": "npm run build && node scripts/armar-sitio.mjs"` y `"sitio:servir": "vite preview --outDir _site"`.
  - `playwright.config.ts`: un segundo `webServer` con `{command:'npm run sitio && npm run sitio:servir', url:'http://127.0.0.1:5332/avance/', reuseExistingServer:true, timeout:180_000}` y el proyecto `sitio` (chromium, `baseURL` en el puerto 5332, `testMatch: /sitio\.spec/`). Los demás proyectos llevan `testIgnore: /sitio\.spec/`.
  - `LEEME.md`, `CREDITOS.md`

**Interfaces:**
- Consume: el build de `dist/` y la carpeta `prototipo/`.
- Produce, en `_site/`:
  - `index.html`, `juego.js` y `estilos.css` (el prototipo, en la raíz);
  - `avance/` (la app);
  - `.nojekyll`.

**`armar-sitio.mjs`:**
- Borra `_site/` y copia `prototipo/*` a `_site/` y `dist/` a `_site/avance/`, con `fs.cpSync` para que funcione en Windows y en Linux.
- Escribe `.nojekyll`.
- Termina con código 1 si falta `dist/index.html`.

**`publicar.yml`:**
- Se dispara con `push` a `main` y con `workflow_dispatch`.
- Permisos `contents: read`, `pages: write` e `id-token: write`, y `concurrency: pages`.
- Trabajo `construir` (ubuntu-latest):
  1. `actions/checkout@v5`
  2. `actions/setup-node@v5` con Node 24 y caché de npm
  3. `npm ci` y `npm test`
  4. `npx playwright install --with-deps chromium`
  5. `npm run sitio`
  6. `npx playwright test --project=escritorio --project=celular --project=sitio`
  7. `actions/upload-pages-artifact@v4` con `path: _site`
- Trabajo `publicar`: depende de `construir`, usa el entorno `github-pages` y corre `actions/deploy-pages@v4`.

- [ ] **Paso 1: escribir la prueba que falla.**

```ts
test('el prototipo sigue en la raíz', async ({ page }) => {
  await page.goto('/'); await expect(page).toHaveTitle(/NEXO/); await expect(page.locator('#jugar')).toBeVisible();
});
test('la app funciona en /avance/ sin recursos rotos', async ({ page }) => {
  const rotos: string[] = []; page.on('response', r => { if (r.status() >= 400) rotos.push(r.url()); });
  const errores = recogerErrores(page); await page.goto('/avance/?prueba=1&calidad=bajo');
  await expect.poll(() => page.evaluate(() => window.nexo?.pantalla()), { timeout: 30_000 }).toBe('inicio');
  expect(rotos).toEqual([]); expect(errores).toEqual([]);
});
```

- [ ] **Paso 2: correr la prueba.** `npx playwright test --project=sitio` → FALLA.
- [ ] **Paso 3: implementar** `armar-sitio.mjs`, los scripts, la configuración y `publicar.yml`.
- [ ] **Paso 4: correr todo.** `npx playwright test --project=sitio` → PASA, y `npm run verificar` → todo PASA.
- [ ] **Paso 5: reescribir `LEEME.md`** con estas secciones:
  - **Jugar:** el enlace principal del prototipo y el enlace de avance.
  - **Desarrollo:**
    - `npm install`
    - `npm run dev` → `http://127.0.0.1:5331`
    - En el celular, `npm run dev:celular` y abrir `http://IP:5331`.
    - Pruebas: `npm test` y `npm run test:navegador`.
  - **Opciones de prueba:** `?prueba=1`, `?fps=1`, `?calidad=alto|medio|bajo` y `?fallarCarga=1`.
  - **Prototipo:** el comando de python con `--directory prototipo`.
  - **Estructura de carpetas.**
  - **Recursos y licencias:** remite a `CREDITOS.md`.
- [ ] **Paso 6: commit.** Mensaje: "Publicación automática: prototipo en /nexo/ y etapa en /nexo/avance/".

---

## Cierre de la etapa (con David)

- [ ] **1.** `npm run verificar` en verde (vitest y Playwright en los tres proyectos), más la paridad (`--grep @paridad`).
- [ ] **2.** Revisar en el navegador del panel cada pantalla: carga, inicio sin y con partida, confirmación, mapa y aviso de girar, con la consola limpia. Pasarle las capturas a David.
- [ ] **3.** David lo revisa en `http://127.0.0.1:5331` y en su iPhone 16 Pro (`npm run dev:celular`, misma Wi-Fi, `?fps=1`). Lista para el celular:
  - la isla dinámica no tapa el logo ni el menú, girando el celular a los dos lados;
  - 60 cuadros por segundo en calidad alto;
  - el aviso de girar aparece en vertical;
  - los textos se leen bien;
  - los toques responden.
- [ ] **4.** Con el visto bueno de David, en este orden:
  1. Pasar `etapa-1-marco` a `main` con avance rápido.
  2. Cambiar Pages a GitHub Actions: `gh api -X PUT repos/deivid0619/nexo/pages -f build_type=workflow`.
  3. Hacer `git push`.
  4. Seguir la ejecución con `gh run watch`.
  5. Revisar que `https://deivid0619.github.io/nexo/` siga mostrando el prototipo y que `https://deivid0619.github.io/nexo/avance/` muestre la etapa 1.
- [ ] **5.** Con el mismo visto bueno, crear en GitHub los 7 hitos de las etapas del documento de diseño (sección 10). La etapa 1 se cierra con este plan enlazado. Después se escribe el plan de la etapa 2.
