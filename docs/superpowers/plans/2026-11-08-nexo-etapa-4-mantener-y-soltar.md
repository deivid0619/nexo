# NEXO etapa 4 "Mantener y soltar": plan de construcción

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Meta:** el corredor se cuelga, se balancea de ida y vuelta, se desliza, planea con una lona, baja en tirolesa y carga el disparo manteniendo el dedo. El 2D suma una zona industrial con obstáculos animados y una ruta de arriba. Trepar es más rápido, la física va por pasos fijos y el tramo 1 crece para enseñarlo todo.

**Arquitectura:** sigue la de las etapas 2 y 3.
- **Reglas:** `src/juego/simulacion.ts`, en TypeScript puro y con pruebas. Las constantes y las funciones puras van en dos archivos:
  - `src/juego/movimientos.ts`: los movimientos del corredor;
  - `src/juego/obstaculos.ts` (nuevo): la posición de los obstáculos que se mueven, calculada a partir de la distancia.
- **Gestos:** `src/entrada/controles.ts` los reconoce. `src/juego/carrera.ts` decide qué hace cada uno según el momento.
- **Modelos propios:** dos scripts de Blender.
  - `scripts/blender/clips-propios.py`: las animaciones propias del corredor.
  - `scripts/blender/obstaculos.py`: los obstáculos y el fondo industrial (`public/modelos/obstaculos.glb`).
- **Escena:** `src/mundo/tierra-baldia/obstaculos.ts` dibuja los obstáculos nuevos. `pista.ts` lo llama.
- **Vista previa:** el tramo de muestra (`?muestra=1`) lo juega un piloto automático. David lo revisa en su iPhone.

**Herramientas:** las de la etapa 3, con Blender 5.2.3 LTS. No hay dependencias npm nuevas.

**Documento de diseño:** `docs/superpowers/specs/2026-11-07-nexo-etapa-4-mantener-y-soltar-design.md`, que manda. Siguen valiendo:
- el general: `docs/superpowers/specs/2026-11-06-nexo-design.md`;
- el de la etapa 3: `docs/superpowers/specs/2026-11-07-nexo-etapa-3-movimientos-design.md`.

**Fuera de esta etapa:**
- etapa 5: tramos al azar y chatarra;
- etapa 6: personaje final;
- etapa 7: criaturas, combate, punto de control y jefe;
- etapa 10: sonido, pausa y resultados;
- versiones en 3D de los obstáculos del 2D.

**Dos paradas obligatorias con David** (diseño, secciones 9 y 13). Quien ejecuta se detiene, avisa y espera su respuesta:
- **Parada 1,** al final de la Tarea 6: los gestos en el iPhone.
- **Parada 2,** al final de la Tarea 15: la vista previa de los obstáculos y las poses.

## Restricciones globales

- Sigue vigente todo lo de las etapas 1 a 3:
  - español; los textos solo en `src/textos/es.ts`;
  - `tokens.css` y el movimiento reducido;
  - puertos 5331, 5332 y 5330. Nunca 5173, 5180, 8000, 8001, 3000, 5432, 5190 ni 8090;
  - repositorio público, sin secretos ni rutas personales;
  - licencias CC0 o CC-BY con crédito. Nada de CC-BY-SA, NC, ND ni Mixamo.
- **Git:**
  - rama `etapa-4-mantener-y-soltar`, desde `main` con este plan;
  - commit local por tarea; **no se sube nada** sin el visto bueno de David;
  - cada mensaje de commit termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - `package.json` aparece modificado solo por los saltos de línea (CRLF); no se agrega a ningún commit.
- Antes de cada commit que toque una pantalla o la escena: abrirla en el panel (5331) y revisar la consola. Con el panel oculto la carrera se pausa, así que las capturas se sacan con Playwright.
- Los descargados están en `Descargas/recursos-nexo/`: UAL1 en `ual1/extraido` y UAL2 en `ual2/extraido`. Los intermedios propios van en `recursos-nexo/propios/`. Los scripts reciben las rutas por argumento.
- **El celular manda:**
  - proyectos `celular` e `iphone` de Playwright primero; `escritorio` queda como comprobación;
  - David prueba en su iPhone 16 Pro en horizontal (`npm run dev:celular`, en la dirección «Network» que muestra Vite).
- **Números que no cambian:**
  - gravedad 24, salto 8,5, doble salto 8;
  - carriles a 1,6 m;
  - velocidad de 9 a 12 m/s (+0,006 por metro), turbo 15;
  - 3 vidas y 1,4 s sin daño;
  - de pie 1,75 m, rodando 0,9 m durante 0,7 s;
  - "¡Justo!": ventana de 0,18 s y +50; vaivén hacia adelante de 1 s;
  - contenedor de 2 m; un foso se salta hasta 4 m; bala a 40 m/s con cadencia de 0,15 s.
- **Números de partida de la etapa 4** (diseño, secciones 5 a 8). Se ajustan al probar y cada ajuste va al ledger:
  - gestos: mantener a 0,18 s; deslizarse a 0,2 s después de deslizar abajo; gracia de agarre de 0,15 s; tres vaivenes hasta cansarse;
  - deslizarse: a 0,9 m de alto y 0,7 s como mínimo;
  - lona: planeo a 1,5 m/s; fosos de viento de 15 a 30 m;
  - tirolesa: de 15 a 30 m;
  - disparo cargado: lleno a 0,6 s; el dron blindado da 100;
  - trepar: 0,28 s saltando y 0,5 s por el suelo;
  - ruta de arriba: plataformas a 3,5 m; derrumbe 0,5 s después de pisar; aterrizaje fuerte desde 3 m;
  - obstáculos que se mueven: se ven venir 1,5 s antes a 12 m/s;
  - tramo 1: de 900 a 1000 m.
- **El iPhone no vibra desde una página web:** cada aviso y cada golpe nuevo se ve en pantalla. `vibrar` queda solo como extra.
- **Rendimiento y tamaño:**
  - como máximo 150 llamadas de dibujo por cuadro en calidad alta;
  - `corredor.glb` hasta 800 KB; `obstaculos.glb` hasta 400 KB;
  - 60 cuadros por segundo en el iPhone de David (se revisa con él en las paradas).

## Puntos a vigilar en la revisión

1. **El dedo se va sin un `pointerup`:** sale de la pantalla (`pointercancel`), la ventana pierde el foco, la pestaña se oculta o se gira el celular mientras se mantiene. Cuenta como soltar. Nada se queda apoyado para siempre: el corredor no se queda colgado, planeando ni cargando. Pruebas en las Tareas 3 y 17.
2. **Salir de la carrera o reintentar** mientras mantiene, cuelga, planea, va en la tirolesa o carga. La carrera siguiente empieza corriendo, sin lona, sin carga, sin anillo y sin dedo apoyado. Prueba en la Tarea 17.
3. **Gestos fuera de lugar:** mantener, deslizarse o soltar mientras trepa, cae al foso, va en la tirolesa o ya terminó la carrera. Se ignoran sin dañar el estado. Pruebas en las Tareas 4 y 9.
4. **Empezar con `?desde`** en la zona de viento, sobre una plataforma, en el tramo de una tirolesa o dentro de un foso ancho. Empieza en un estado posible:
   - en la zona de viento, con la lona;
   - sobre una plataforma o en una tirolesa, en el suelo;
   - dentro de un foso, pasado el borde.
   Pruebas en las Tareas 9 y 10.
5. **Un cuadro largo** (dt 0,05) justo al llegar a un obstáculo que se mueve, al resorte o al borde de una plataforma da el mismo resultado que a 60 cuadros por segundo. Pruebas en las Tareas 8 y 9.

---

## Mapa de archivos

```
scripts/blender/clips-propios.py     UAL1 → propios.glb: Colgar_Loop, Planear_Loop y Tirolesa_Loop (era colgar.py)
scripts/blender/obstaculos.py        → public/modelos/obstaculos.glb (obstáculos, lona, dron blindado y fondo industrial)
src/juego/obstaculos.ts              funciones puras de los obstáculos que se mueven (a partir de la distancia)
src/juego/piloto.ts                  piloto automático: juega un tramo con intenciones, como una persona
src/entidades/obstaculos.ts          cargarObstaculos(): las piezas de obstaculos.glb por nombre
src/mundo/tierra-baldia/obstaculos.ts   dibuja y anima los obstáculos nuevos
src/mundo/tierra-baldia/zona-industrial.ts   fondo de la zona industrial (grúas, andamios, tanques, nave)
src/mundo/tierra-baldia/particulas.ts   polvo, vapor y chispas baratas
src/datos/niveles/muestra-etapa-4.ts    tramo de muestra para la vista previa
```

Se modifican:
- **Reglas y nivel:** `src/juego/movimientos.ts`, `simulacion.ts`, `carrera.ts`, `src/datos/niveles/tipos.ts`, `validar.ts` y `tierra-baldia-1.ts`.
- **Entrada, corredor y escena:**
  - `src/entrada/controles.ts`;
  - `src/entidades/corredor.ts`;
  - `src/mundo/tierra-baldia/pista.ts`;
  - `src/camara/camara-juego.ts`.
- **Pantalla y textos:** `src/interfaz/pantallas/juego.ts`, `componentes.css`, `tokens.css`, `base.css` y `src/textos/es.ts`.
- **Arranque y prueba:** `src/nucleo/modo-prueba.ts` y `src/main.ts`.
- **Modelos:** `scripts/preparar-corredor.mjs` y `public/modelos/corredor.glb`.
- **Documentación y sitio:** `CREDITOS.md`, `LEEME.md` y `scripts/armar-sitio.mjs`.
- **Pruebas:** las de cada archivo, más `tests/navegador/juego.spec.ts` y `sitio.spec.ts`.

---

### Tarea 1: física por pasos fijos, trepar más rápido y arreglos de la etapa 3

**Archivos:** modificar `src/juego/simulacion.ts`, `src/juego/movimientos.ts` y `src/juego/simulacion.test.ts`.

**Interfaces:**
- Produce en `simulacion.ts`: `export const PASO_FISICA = 1 / 120;`.
- `paso(dt)` suma `dt` a lo que sobró del cuadro anterior. Avanza en pasos de `PASO_FISICA` mientras alcance (con tolerancia de 1e-9) y guarda el resto para el cuadro siguiente. Devuelve los eventos de todos esos pasos, en orden.
- Las acciones (`saltar()`, etc.) actúan en el momento de la simulación en que llegan, como hoy.
- Produce en `movimientos.ts`: `DURACION_TREPAR = 0.28` y `DURACION_TREPAR_GOLPE = 0.5`.

- [ ] **Paso 1: pruebas que fallan.**
  - **Igual a cualquier ritmo de cuadros.** Un nivel de prueba con valla, valla alta, viga, contenedor, foso de 12 m con cable y una zona de armas con dron. Las mismas acciones en los mismos tiempos, todos múltiplos de 1/30 s, se juegan con dt de 1/30, 1/60, 1/120 y 0,05. Las cuatro carreras dan la misma lista de eventos y la misma `distancia` e `y` al final (±1e-9).
  - **"¡Justo!" en la valla de 1,1 m.** Se prueban saltos cada 0,01 s antes de llegar. Al menos uno pasa sin golpe y da `justo`, a 9 y a 12 m/s.
  - **Turbo contra una viga** a 15 m/s con dt 0,05: emite `roto` y suma 30. No la atraviesa sin romperla.
  - **Trepar:** saltando dura 0,28 s y por el suelo 0,5 s (±1 paso). Las pruebas "trepar a 12 m/s … queda encima" de la etapa 3 siguen pasando.
  - **`desde` en el metro exacto:**
    - de un foso: empieza pasado el borde lejano y no cae;
    - de un contenedor: empieza encima (`y = 2`) y sin golpe.
- [ ] **Paso 2:** `npx vitest run src/juego`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **El acumulador:** `paso(dt)` reparte el cuadro en pasos de `PASO_FISICA`. El cuerpo de hoy pasa a una función `subpaso(h)`.
  - **`desde`:** usa `<=` para el foso y el contenedor que empiezan justo ahí.
  - **Pruebas viejas que se rompen:** si una se apoyaba en un paso menor que 1/120, se ajusta y se anota un `Ruling` en el ledger.
- [ ] **Paso 4:** `npx vitest run` completo. Esperado: PASA. `npx tsc --noEmit` sin errores. Commit.

### Tarea 2: las animaciones nuevas del corredor

**Archivos:**
- Mover: `scripts/blender/colgar.py` → `scripts/blender/clips-propios.py` (`git mv`).
- Modificar: `scripts/preparar-corredor.mjs`, `public/modelos/corredor.glb`, `src/entidades/modelo.test.ts`, `CREDITOS.md`.

**Interfaces:**
- Produce `public/modelos/corredor.glb` con 22 clips:
  - los 16 de la etapa 3;
  - de UAL2: `Slide_Start`, `Slide_Loop`, `Slide_Exit` y `NinjaJump_Land`;
  - propios: `Planear_Loop` y `Tirolesa_Loop`.
- **Trepar ágil:** si quien construye hace un clip propio en vez de recortar `ClimbUp_1m`, lo agrega aquí como `Trepar_Rapido` (serían 23) y anota un `Ruling`.
- Produce los comandos:
  - `blender --background --python scripts/blender/clips-propios.py -- <UAL1_Standard.glb> <salida propios.glb>`;
  - `npm run modelos:corredor -- <UAL1_Standard.glb> <UAL2_Standard.glb> <propios.glb>`.

- [ ] **Paso 1: prueba que falla.** `modelo.test.ts` pide:
  - exactamente esos 22 nombres;
  - 800 KB o menos;
  - una sola `skin` de 65 huesos;
  - `EXT_meshopt_compression`.
- [ ] **Paso 2:** `npx vitest run src/entidades/modelo.test.ts`. Esperado: FALLA.
- [ ] **Paso 3: `clips-propios.py`.** Mantiene `Colgar_Loop` igual y suma dos acciones de 1 s en bucle, con la misma técnica de orientar cada hueso hacia una dirección del mundo:
  - **`Planear_Loop`:**
    - los dos brazos arriba agarrando una barra horizontal unos 0,45 m sobre la cabeza, con las manos a unos 0,5 m entre sí;
    - el cuerpo apenas inclinado hacia adelante;
    - las piernas sueltas, un poco hacia atrás, con un vaivén suave de unos ±8°.
  - **`Tirolesa_Loop`:**
    - las dos manos juntas sobre la cabeza, en una polea;
    - las piernas juntas y algo dobladas hacia adelante;
    - un vaivén leve de unos ±5°.
  - Exporta las tres acciones en un solo GLB, solo con el esqueleto.
- [ ] **Paso 4: `preparar-corredor.mjs`.**
  - `CLIPS_UAL2` suma los cuatro clips nuevos.
  - `CLIPS_PROPIOS = ['Colgar_Loop', 'Planear_Loop', 'Tirolesa_Loop']`.
  - El tercer argumento pasa a ser `<propios.glb>`, y el mensaje de uso cambia.
- [ ] **Paso 5:** generar `recursos-nexo/propios/propios.glb` y el corredor. Correr la prueba. Esperado: PASA. Anotar el peso en el ledger.
- [ ] **Paso 6:** en `CREDITOS.md`, la línea de piezas propias nombra `Colgar_Loop`, `Planear_Loop` y `Tirolesa_Loop`. Commit.

### Tarea 3: los controles de mantener y soltar

**Archivos:** modificar `src/entrada/controles.ts`, `src/entrada/controles.test.ts`, `src/juego/carrera.ts`, `src/juego/carrera.test.ts`, `src/interfaz/base.css`, `src/interfaz/componentes.css` y `tests/navegador/juego.spec.ts`.

**Interfaces:**
```ts
export type Intencion = 'tocar' | 'saltar' | 'rodar' | 'disparar' | 'izquierda' | 'derecha'
  | 'apoyar' | 'mantener' | 'deslizarse' | 'soltar';
export const UMBRAL_DESLIZAR_PX = 40;
export const MANTENER_MS = 180;
export const DESLIZARSE_MS = 200;
/** `en`: posición del dedo en píxeles CSS (en 'apoyar' y 'mantener'). */
export function crearControles(
  superficie: HTMLElement, ventana: Window,
  alIntentar: (i: Intencion, en?: { x: number; y: number }) => void,
): Controles;
```

**Un dedo:**

| Momento | Intenciones |
|---|---|
| Se apoya | `apoyar` (con `en`) |
| Pasa los 40 px por primera vez (en el `pointermove`) | según el eje mayor: `saltar`, `rodar`, `izquierda` o `derecha`, una sola vez |
| Sigue apoyado 200 ms después de un `rodar` | `deslizarse` |
| Lleva 180 ms sin pasar los 40 px | `mantener` (con `en`) |
| Se levanta antes de 180 ms sin pasar los 40 px | `tocar` y después `soltar` |
| Se levanta en cualquier otro caso | `soltar` |
| `pointercancel`, la ventana pierde el foco, la pestaña se oculta o `desactivar()` con el dedo apoyado | `soltar` |

- Un segundo dedo se ignora mientras el primero está apoyado.

**Teclado:** `e.repeat` se ignora, y mientras una tecla de mantener está apretada se ignoran las otras.

| Tecla | Al apretar | Mientras sigue apretada | Al soltar |
|---|---|---|---|
| Espacio, flecha arriba o W | `apoyar` y `saltar` | — | `soltar` |
| Flecha abajo o S | `apoyar` y `rodar` | a los 200 ms, `deslizarse` | `soltar` |
| X | `apoyar` | a los 180 ms, `mantener` | antes de 180 ms: `disparar` y `soltar`; después: `soltar` |
| Flechas a los lados o A/D | `izquierda` o `derecha` | — | — |

- [ ] **Paso 1: pruebas que fallan.**
  - **`controles.test.ts`** (happy-dom con `vi.useFakeTimers()`). Cada fila de las dos tablas tiene su prueba, con la lista exacta de intenciones en orden. Además:
    - deslizar 60 px hacia arriba emite `saltar` en el `pointermove`, antes de levantar el dedo;
    - deslizar hacia arriba y quedarse 500 ms no emite `mantener`;
    - moverse 30 px y quedarse 180 ms sí emite `mantener`;
    - `blur` de la ventana y `visibilitychange` oculta con el dedo apoyado emiten `soltar` una vez (punto 1 de la revisión).
  - **`carrera.test.ts`:** `accion('apoyar')`, `accion('mantener')`, `accion('deslizarse')` y `accion('soltar')` no cambian de carril. Hoy caen en el `else` de `cambiarCarril`.
  - **`juego.spec.ts`** (proyectos `iphone` y `celular`): mantener el dedo 700 ms sobre la carrera no selecciona nada (`getSelection().toString() === ''`). El `contextmenu` llega con `defaultPrevented` y `visualViewport.scale` sigue en 1.
- [ ] **Paso 2:** `npx vitest run src/entrada src/juego/carrera.test.ts`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **`controles.ts`:**
    - escucha `pointermove` en la superficie y usa `setPointerCapture`;
    - los tiempos van con `setTimeout`, y se cancelan al levantar el dedo o al pasar el umbral.
  - **`carrera.ts`:** por ahora, `accion` atiende las intenciones de la etapa 3 por nombre y no hace nada con las nuevas. La Tarea 6 las conecta.
  - **Gestos del sistema:**
    - `body` y `.superficie-juego` llevan `-webkit-touch-callout: none`;
    - la superficie cancela `selectstart` y `contextmenu`, como hoy.
  - **Pruebas viejas de deslizar abajo:** si alguna dura más de 200 ms en el navegador por software y pasa a `deslizando`, se acelera el gesto de la prueba y se anota un `Ruling`.
- [ ] **Paso 4:** correr las pruebas de arriba y `juego.spec.ts` en los tres proyectos. Esperado: PASA. Revisar en el panel (5331) que tocar sigue saltando. Commit.

### Tarea 4: mantener y soltar en las reglas, y el cable de ida y vuelta

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/movimientos.test.ts`, `src/juego/simulacion.ts`, `src/juego/simulacion.test.ts` y `src/mundo/tierra-baldia/pista.ts` (solo importa las constantes que se mudan).

**Interfaces:**
- Produce en `movimientos.ts`:
  ```ts
  export const MANTENER_S = 0.18;
  export const GRACIA_AGARRE_S = 0.15;
  export const VAIVENES_HASTA_CANSARSE = 3;
  // Se mudan desde pista.ts (pista.ts las importa de aquí):
  export const ALTO_PIVOTE: number;
  export const LARGO_CABLE: number;
  export const MANOS_SOBRE_PIES = 2.05;
  /** Dónde va el pivote del cable, en metros después del evento `cable`. */
  export const PIVOTE_CABLE_M: number;
  /**
   * El cable con el dedo apoyado, a `s` segundos de agarrarse. u = 0 es el extremo de atrás y
   * u = 1 el de adelante; cada medio vaivén dura VAIVEN_S.
   */
  export function pendulo(s: number): { u: number; adelante: boolean; vaivenes: number };
  /** Ángulo del cable (rad, 0 = vertical, + = adelante del pivote) en el punto u del arco. */
  export function anguloEn(u: number): number;
  ```
- Produce en `Simulacion`:
  ```ts
  /** La distancia más lejana a la que llegó: el contador y el puntaje usan esta. */
  readonly recorrido: number;
  readonly vaivenAdelante: boolean | null;
  readonly anguloCable: number | null;
  /** El dedo (o la tecla) está apoyado. */
  readonly apoyado: boolean;
  apoyar(abajo: boolean): void;
  mantener(): void;
  ```
- `vaiven` sigue siendo el `u` mientras está colgado.
- `progreso`, colgado, es la fase del vaivén: de 0 a 1 en cada ida y vuelta, con 0 en el extremo de atrás.

**Reglas** (diseño, secciones 5, 6.1 y 6.2):
- **`mantener()`:**
  - en el suelo: salta;
  - en el aire: hace el doble salto si lo tiene, y si no, nada;
  - armado: no salta (la Tarea 11 le pone la carga);
  - colgado, trepando o en el foso: nada.
- **Agarrar el cable:**
  - con `apoyado`: modo **mantenido**, de ida y vuelta;
  - sin el dedo: modo **suelto**, un solo vaivén hacia adelante, como en la etapa 3.
- **El arco** es fijo respecto del cable: no depende de la velocidad.
  - Todo el arco queda sobre el foso: empieza al menos 0,3 m dentro.
  - La mano queda siempre a `LARGO_CABLE` del pivote, así que el cable no se estira.
  - Al agarrarse sigue hacia adelante sin frenar de golpe: el extremo de atrás queda un poco detrás del punto de agarre.
- **Soltar:** `apoyar(false)` o `soltar()`.
  - Durante los primeros `GRACIA_AGARRE_S` no suelta. Si el dedo se levanta en ese tiempo, el modo pasa a **suelto**.
  - **Yendo adelante:** `suelta(u)`, como en la etapa 3 (franja buena y "¡Justo!").
  - **Yendo atrás:** cae recto, sin avanzar, hasta entrar al foso. Después sigue la regla de fosos de la etapa 3.
- **Cansarse:** en modo mantenido, después de `VAIVENES_HASTA_CANSARSE` vaivenes completos se suelta solo en el extremo de adelante (u = 1). Emite `soltar`, pasa y no da "¡Justo!".
- **El contador:** `recorrido = max(recorrido, distancia)`, y `puntaje = floor(recorrido) + bono`.

- [ ] **Paso 1: pruebas que fallan.**
  - **`movimientos.test.ts`:**
    - `pendulo`: u sube de 0 a 1 en `VAIVEN_S`, baja en el siguiente `VAIVEN_S` y `vaivenes` cuenta las idas y vueltas;
    - `anguloEn(0) < 0 < anguloEn(1)`.
  - **`simulacion.test.ts`, con fosos de 9 y de 12 m, cada uno a 9 y a 12 m/s:**
    - **mantenido:** agarrarse con `apoyar(true)` y mantener 1,5 s. Pasado el extremo de adelante, `vaivenAdelante` es false y la distancia baja. El puntaje no baja nunca;
    - **arco fijo:** la mano queda a `LARGO_CABLE` ±0,05 m del pivote en todo el vaivén, y el extremo de adelante cae en el mismo metro a 9 y a 12 m/s;
    - soltar yendo adelante en el centro de la franja: `justo` y pasa sin daño;
    - soltar yendo adelante con u ≈ 0,3: cae al foso;
    - soltar yendo atrás con u ≈ 0,5: `foso` y `golpe`, y la distancia al entrar al foso es la del momento de soltar (±0,1);
    - **cansarse:** mantener sin soltar emite `soltar` en el extremo de adelante después de 3 vaivenes, a unos 7·`VAIVEN_S` del agarre; pasa sin "¡Justo!";
    - **gracia:** `apoyar(false)` a 0,1 s del agarre no suelta, y al final se suelta solo y pasa. Dos `soltar()` a 0,05 y 0,12 s del agarre no lo tiran al foso;
    - **suelto:** las pruebas del cable de la etapa 3 siguen pasando;
    - **`mantener()`:** en el suelo emite `salto`; en el aire con doble salto, `doble-salto`; en el aire sin doble salto, nada; armado, nada;
    - **punto 3 de la revisión:** `mantener()`, `apoyar(false)` y `soltar()` mientras trepa o cae al foso no cambian la postura ni la `y`.
- [ ] **Paso 2:** `npx vitest run src/juego`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - Mientras cuelga, la distancia y la `y` salen del ángulo: pivote en `cable.en + PIVOTE_CABLE_M` y `ALTO_PIVOTE`.
  - Ajustar `ALTO_PIVOTE`, `LARGO_CABLE`, `PIVOTE_CABLE_M`, `suelta` y la forma del arco hasta que pasen las pruebas y el vaivén se vea vivo, con el corredor subiendo al menos 0,8 m entre abajo y los extremos. Anotar los números finales en el ledger.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 5: deslizarse

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/simulacion.ts` y `src/juego/simulacion.test.ts`.

**Interfaces:**
- `Postura` suma `'deslizando'`, y `alturaCuerpo('deslizando') === ALTURA_RODANDO`.
- `export const DESLIZARSE_MIN_S = DURACION_RODAR;`
- `Simulacion.deslizarse(): void`.
- `EventoSim` suma `'deslizarse' | 'levantarse'`.

**Reglas** (diseño, sección 6.3; los tubos llegan en la Tarea 8):
- `deslizarse()` en el suelo, rodando y con `apoyado`: pasa a `deslizando`.
- En el aire con caída rápida y `apoyado`: al tocar el suelo se desliza en vez de rodar.
- Sigue mientras esté `apoyado`. Con `apoyar(false)` se levanta al cumplir `DESLIZARSE_MIN_S` desde que empezó el giro, o enseguida si ya pasó ese tiempo.
- `saltar()` corta el deslizamiento.
- Deslizando se pasa bajo vigas, y en 3D se puede cambiar de carril, igual que rodando.

- [ ] **Paso 1: pruebas que fallan.**
  - Rodar, `deslizarse()` y mantener 2 s: sigue `deslizando`, con la altura del cuerpo de 0,9 m.
  - Levantar el dedo a 0,3 s del giro: emite `levantarse` a los 0,7 s, no antes.
  - Deslizarse bajo dos vigas seguidas a 6 m: ningún golpe.
  - Caída rápida con el dedo apoyado y `deslizarse()`: al aterrizar queda `deslizando`.
  - `deslizarse()` sin estar rodando, o con el dedo ya levantado: nada.
  - Saltar deslizando: emite `salto` y la postura vuelve a `corriendo`.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 6: la carrera, el anillo, el corredor y el cable en pantalla (Parada 1)

**Archivos:**
- Lógica: `src/juego/carrera.ts` y `src/juego/carrera.test.ts`.
- Pantalla: `src/interfaz/pantallas/juego.ts`, `componentes.css`, `tokens.css` y `src/textos/es.ts`.
- Corredor y escena: `src/entidades/corredor.ts`, `src/entidades/corredor.test.ts` y `src/mundo/tierra-baldia/pista.ts`.
- Arranque y pruebas: `src/nucleo/modo-prueba.ts`, `src/main.ts` y `tests/navegador/juego.spec.ts`.

**Interfaces:**
```ts
// carrera.ts
/** Lo que hace cada intención según el momento (la tabla de abajo). */
export function aplicarIntencion(sim: Simulacion, i: Intencion): void;
Carrera.accion(i: Intencion, en?: { x: number; y: number }): void;
HudCarrera.anillo(en: { x: number; y: number } | null, carga: number): void;
// EstadoJuego suma:
recorrido: number; apoyado: boolean; vaivenAdelante: boolean | null; anillo: boolean;
// corredor.ts
Animacion suma 'deslizarse' | 'levantarse';  Recientes suma levantarse: boolean;
// modo-prueba.ts
accion(a: Intencion, en?: { x: number; y: number }): void;
```

| Intención | Qué hace |
|---|---|
| `apoyar` | `sim.apoyar(true)` |
| `mantener` | `sim.mantener()`. El anillo aparece en `en`, o sobre la cabeza del corredor (`proyectarCorredor()`) si no hay `en` |
| `soltar` | `sim.apoyar(false)` y el anillo se va |
| `tocar` | colgado: `soltar()`; armado: `disparar()`; si no: `saltar()` |
| `saltar` | colgado: `soltar()`; si no: `saltar()` |
| `rodar`, `deslizarse`, `disparar` | el método del mismo nombre |
| `izquierda` y `derecha` | `cambiarCarril(∓1)` |

**Textos:**
- `pistaCable` pasa a 'Mantén para balancearte · suelta yendo adelante'.
- `carga.consejos` suma 'Mantén el dedo para colgarte y deslizarte.'
- La pista de deslizarse llega con los tubos, en la Tarea 17.

- [ ] **Paso 1: pruebas que fallan.**
  - **`carrera.test.ts`:**
    - la tabla, intención por intención;
    - `mantener` llama a `hud.anillo(en, 0)` y `soltar` a `hud.anillo(null, 0)`;
    - el HUD recibe el puntaje y el avance con `recorrido`, así que no bajan mientras el cable va hacia atrás;
    - `Recientes.levantarse` vale true unos 0,35 s después de `levantarse`.
  - **`corredor.test.ts`:** `elegirAnimacion` pone `'deslizarse'` justo después de `'colgado'` y antes de `'rodar'`, y `'levantarse'` después de `'escudo-roto'`, antes de mirar el aire.
  - **`juego.spec.ts`** (`celular`, `iphone` y `escritorio`, con `?prueba=1&calidad=bajo`):
    1. Mantener el puntero 300 ms en el suelo salta. Se ve `.anillo` bajo el dedo y se va al levantar.
    2. Con `desde` antes del primer cable: `accion('apoyar')`, `accion('saltar')`, avanzar hasta `colgado` y luego 1,5 s más. La `distancia` baja y `recorrido` no. `accion('soltar')` en la franja buena yendo adelante pasa el foso con 3 vidas.
    3. Con `desde` antes de la primera viga: deslizar hacia abajo con el puntero y dejarlo apoyado. El corredor queda `deslizando`, pasa con 3 vidas y se levanta al soltar.
    4. Sin errores en la consola.
- [ ] **Paso 2:** `npx vitest run src/juego src/entidades` y `npx playwright test tests/navegador/juego.spec.ts --project=celular`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **Anillo:**
    - un círculo celeste fino (`--c-acento`) de unos 56 px, centrado en `en`, que no recibe toques;
    - se llena con `--carga` (de 0 a 1) usando `conic-gradient`;
    - su tamaño va en `tokens.css`;
    - aparece con una escala breve de 0,9 a 1, sin animación con movimiento reducido.
  - **Corredor:**
    - `'deslizarse'`: `Slide_Start` una vez, acelerado para que dure unos 0,5 s, y luego `Slide_Loop` en bucle;
    - `'levantarse'`: `Slide_Exit` una vez;
    - **colgado:** el cuadro de `Colgar_Loop` sale de `progreso`, así las piernas se adelantan al ir hacia adelante. El grupo se inclina con `anguloCable`;
    - **trepar rápido:** `ClimbUp_1m`, o la parte de él que sirva, ajustado a 0,28 y 0,5 s. El cuerpo nunca se ve más alto que la `y` de la simulación más 2 m, y no hay salto de pose al terminar.
  - **`pista.ts`:** dibuja el pivote del cable en la posición de la Tarea 4. El cable mide siempre `LARGO_CABLE`.
  - **`main.ts`:** pasa `en` de los controles a `carrera.accion`.
- [ ] **Paso 4:**
  - Correr `juego.spec.ts` en los tres proyectos y `npx vitest run`. Esperado: todo en verde.
  - Abrir la carrera en el panel (5331) y revisar la consola.
  - Capturas en celular horizontal: el anillo, deslizándose bajo una viga, el cable yendo hacia atrás y trepando.
  - Commit.
- [ ] **Paso 5: PARADA 1, los gestos en el iPhone.**
  - Avisar a David y pedirle que pruebe en su iPhone, con `npm run dev:celular`, en la dirección «Network» que muestra Vite:
    - tocar para saltar;
    - deslizar arriba, abajo y a los lados;
    - mantener para saltar;
    - deslizarse bajo las vigas;
    - el cable de ida y vuelta.
  - Preguntarle si algo se siente lento, se confunde, abre la lupa o un menú, o se traba.
  - Esperar su respuesta. Ajustar aquí lo que pida, con cada ajuste en el ledger, antes de la Tarea 7.

### Tarea 7: el nivel con todo lo nuevo

**Archivos:** modificar `src/datos/niveles/tipos.ts`, `src/datos/niveles/validar.ts` y `src/datos/niveles/validar.test.ts`.

**Interfaces:**
```ts
export type PistaNivel = 'rodar' | 'caer' | 'trepar' | 'cable' | 'deslizarse' | 'tirolesa' | 'planear' | 'cargar';
// Evento suma:
| { tipo: 'industrial'; largo: number }                // zona industrial (fondo y cámara alejada)
| { tipo: 'tubo'; largo: number }                      // tubería baja: de 1,1 a 1,6 m
| { tipo: 'bola'; cadena: 'corta' | 'larga' }
| { tipo: 'prensa' }
| { tipo: 'escombro' }
| { tipo: 'barril' }
| { tipo: 'llanta'; forma: 'alta' | 'baja' }
| { tipo: 'plataforma'; largo: number; derrumbe?: boolean }
| { tipo: 'resorte' }
| { tipo: 'tirolesa'; largo: number }
| { tipo: 'lona' }                                     // estación: abre la zona de viento
| { tipo: 'viento-fin' }                               // cierra la zona de viento y rompe la lona
| { tipo: 'rejilla' }                                  // dentro de un foso de viento
// y cambian:
| { tipo: 'dron'; carril: Carril; blindado?: boolean }
| { tipo: 'habilidad'; clase: Habilidad; carril?: Carril; alto?: number }  // alto 3,5: en la ruta de arriba
```
- Produce en `validar.ts`:
  ```ts
  FOSO_CABLE_MAX_M = 12; FOSO_VIENTO_MIN_M = 15; FOSO_VIENTO_MAX_M = 30;
  HUECO_PLANEO_M = 10; TUBO_MIN_M = 3; TUBO_MAX_M = 20;
  TIROLESA_MIN_M = 15; TIROLESA_MAX_M = 30; PLATAFORMA_MIN_M = 3; PLATAFORMA_MAX_M = 30
  ```

- [ ] **Paso 1: pruebas que fallan.** `validarNivel` devuelve un problema que nombra el evento en cada caso:
  - **Fuera de lugar:** cualquier evento nuevo del 2D (de `tubo` a `rejilla`) en 3D, o fuera de una zona `industrial`.
  - **Zona industrial:** en 3D, encimada con otra, o con un portal dentro.
  - **Fosos:**
    - con cable de más de 12 m (pendiente de la etapa 3);
    - de 13 o 14 m, que no se cruzan de ninguna forma;
    - de 15 a 30 m fuera de una zona de viento, o con cable;
    - de viento con un hueco de más de `HUECO_PLANEO_M` entre su borde, sus rejillas y el otro borde.
  - **Viga** dentro del largo de un contenedor (pendiente de la etapa 3).
  - **Zona de viento:**
    - `lona` con otra zona de viento abierta;
    - `viento-fin` sin `lona` antes;
    - zona sin cerrar antes de un portal o del final.
  - **Rejilla** fuera de un foso de viento.
  - **Tirolesa** que no empieza sobre una plataforma, o con largo fuera de 15 a 30.
  - **Largos:** tubo fuera de 3 a 20 y plataforma fuera de 3 a 30.
  - **Habilidad con `alto`** que no queda sobre una plataforma de ese alto.
  - **Dentro de un foso** no va nada, salvo el cable en su borde y las rejillas de un foso de viento.
  - Y un tramo correcto que usa todos los tipos nuevos devuelve `[]`. Las pruebas viejas siguen.
- [ ] **Paso 2:** `npx vitest run src/datos/niveles`. Esperado: FALLA.
- [ ] **Paso 3:** implementar. `tierra-baldia-1.ts` no cambia y su prueba sigue pasando.
- [ ] **Paso 4:** correr. Esperado: PASA. `npx tsc --noEmit` sin errores. Commit.

### Tarea 8: tubos y obstáculos que se mueven

**Archivos:**
- Crear: `src/juego/obstaculos.ts` y `src/juego/obstaculos.test.ts`.
- Modificar: `src/juego/simulacion.ts` y `src/juego/simulacion.test.ts`.

**Interfaces** (`obstaculos.ts`, funciones puras; `x` = metros desde el corredor hasta el pie del obstáculo):
```ts
/** Lo que la cámara 2D alejada muestra por delante del corredor (Tarea 14 la cumple). */
export const VISTA_ADELANTE_M = 21;
export const AVISO_S = 1.5;
export const VELOCIDAD_REF = 12;
export const TUBO_LIBRE = 1.1, TUBO_TOPE = 1.6;
export const RADIO_BOLA: number;
export const PRENSA_ABAJO: number;       // alto del martillo abajo: se salta como una valla
export const ALTO_ESCOMBRO: number;
/** Centro de la bola respecto del pie de la grúa y ángulo de la cadena. En x = 0 pasa por abajo. */
export function bola(x: number, cadena: 'corta' | 'larga'): { dx: number; y: number; angulo: number };
/** Alto del borde de abajo del martillo y si la luz de aviso está encendida. */
export function prensa(x: number): { alto: number; aviso: boolean };
/** Altura del bloque que cae, y la sombra del suelo de 0 a 1. */
export function escombro(x: number): { y: number; sombra: number; caido: boolean };
/** Cuánto rodó hacia el corredor (dx ≤ 0) y su giro. */
export function barril(x: number): { dx: number; giro: number };
export function llanta(x: number, forma: 'alta' | 'baja'): { dx: number; y: number; giro: number };
```

**Reglas** (diseño, sección 7):
- **Todo sale de `x`, no del tiempo:** a la misma `x`, la misma posición.
  - Barril y llanta ruedan hacia el corredor unos 0,125 m por cada metro que él avanza desde que empiezan, como un barril a 1,5 m/s cuando el corredor va a 12.
  - Cada movimiento o aviso empieza cuando el obstáculo está a `VISTA_ADELANTE_M` o menos, y a `AVISO_S × VELOCIDAD_REF` o más del contacto.
- **Tubo:**
  - deslizando o rodando se pasa;
  - entrar de pie golpea una vez y obliga a deslizarse hasta el final;
  - un giro que termina debajo hace lo mismo: un golpe y deslizarse hasta salir;
  - con el dedo levantado debajo, sigue deslizándose hasta salir y luego se levanta;
  - debajo, `saltar()` no hace nada;
  - con turbo, entrar de pie no golpea y se desliza hasta el final;
  - por encima de 1,6 m se pasa (un tubo corto se puede saltar).
- **Choques:** cada obstáculo golpea una vez (`golpeados`). Choca con la caja del cuerpo (`y` a `y + alturaCuerpo`) contra la forma de cada obstáculo:
  - bola: una esfera;
  - prensa, escombro caído, barril y llanta: cajas.
- **El turbo** rompe barril, llanta y escombro (`roto`, +30), pero la bola y la prensa golpean igual.

- [ ] **Paso 1: pruebas que fallan.**
  - **`obstaculos.test.ts`:**
    - **aviso a tiempo:** para cada tipo, el primer momento en que cambia su posición o su aviso cumple dos cosas: el obstáculo está a 21 m o menos del corredor, y el contacto llega a 1,5 s o más a 12 m/s;
    - **bola:** la corta en `x = 0` está centrada sobre la pista a la altura de la cabeza (entre 1,2 y 1,9 m); la larga, abajo (centro a 0,6 m o menos);
    - **prensa:** abajo (`PRENSA_ABAJO`) para `x ≤ 6`, avisando entre 6 y 21, y quieta arriba más lejos;
    - **escombro:** con sombra desde `x ≤ 21` y caído (`y = 0`) para `x ≤ 8`;
    - **llanta:** la `alta` en el contacto tiene su borde de abajo a 1 m o más; la `baja`, en el suelo;
    - la misma `x` da siempre lo mismo.
  - **`simulacion.test.ts`,** cada caso a dt 1/60 y a 0,05 con el mismo resultado (punto 5 de la revisión):
    - **tubo:** cada regla de arriba, incluido "nunca se traba";
    - **bola corta:** rodar o deslizarse pasa, de pie golpea;
    - **bola larga:** saltar a tiempo pasa, corriendo golpea;
    - **prensa, escombro y barril:** saltar pasa, corriendo golpea;
    - **llanta:** la alta se pasa rodando y la baja saltando;
    - **turbo:** rompe el barril, pero la bola lo golpea.
- [ ] **Paso 2:** `npx vitest run src/juego`. Esperado: FALLA.
- [ ] **Paso 3:** implementar. Quien construye decide las formas de las curvas dentro de las pruebas.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 9: la ruta de arriba y la tirolesa

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/simulacion.ts`, `src/juego/simulacion.test.ts`, `src/juego/carrera.ts` y `src/juego/carrera.test.ts`.

**Interfaces:**
- Produce en `movimientos.ts`:
  ```ts
  ALTO_PLATAFORMA = 3.5; DERRUMBE_S = 0.5; CAIDA_FUERTE_M = 3;
  SALTO_RESORTE: number;      // que llegue a plataformas a 3,5 m (unos 15,5 m/s)
  VELOCIDAD_TIROLESA: number; // más rápido que corriendo
  ```
- `Postura` suma `'tirolesa'`.
- `Simulacion` suma `readonly tirolesa: number | null` (de 0 a 1 a lo largo del cable). `suelo` puede valer 3,5.
- `EventoSim` suma:
  - `'resorte' | 'aterrizaje-fuerte' | 'tirolesa' | 'soltar-tirolesa'`;
  - `{ tipo: 'derrumbe'; id: number }`.

**Reglas** (diseño, secciones 6.5 y 8):
- **Plataformas:**
  - se atraviesan desde abajo y se pisan desde arriba, como en los juegos de plataformas (decisión de Claude);
  - al terminar una, se cae a la ruta de abajo.
- **Derrumbe:** `DERRUMBE_S` después de pisarla emite `derrumbe` y deja de ser suelo. El corredor cae a la ruta de abajo sin perder vida.
- **Resorte:** pisarlo en el suelo lanza con `SALTO_RESORTE` y emite `resorte`. Saltarlo no hace nada.
- **Aterrizaje fuerte:** emite `aterrizaje-fuerte`, además de `aterrizaje`, si cayó desde 3 m o más sobre su suelo.
- **Tirolesa:**
  - **agarrar:** al pasar por su manija, corriendo sobre la plataforma o en el aire sobre ella;
  - **modos:** con `apoyado`, levantar el dedo suelta; sin el dedo, un toque (`soltar()`) suelta. La gracia de 0,15 s es la del cable;
  - **bajada:** va a `VELOCIDAD_TIROLESA`, bajando en línea recta del alto de la plataforma (más la manija) al ancla en el suelo;
  - **soltarse:** cae desde donde va. Sobre una plataforma queda arriba, y si no, abajo;
  - **al final:** se suelta solo (`soltar-tirolesa`) y queda en la ruta de abajo.
  - **en la carrera:** `aplicarIntencion` trata la tirolesa como el cable: `tocar` y `saltar` llaman a `soltar()`.
- **Habilidades de la ruta de arriba:** una con `alto` se toma solo con los pies a `alto − 0,5` o más. Sin `alto`, como hoy.
- **`desde`** sobre una plataforma o en el tramo de una tirolesa: empieza en el suelo.

- [ ] **Paso 1: pruebas que fallan,** a 9 y a 12 m/s y a dt 1/60 y 0,05:
  - **Resorte:**
    - pisarlo deja al corredor sobre la plataforma siguiente (`y = 3,5`, `suelo = 3,5`);
    - saltarlo lo deja abajo;
    - un doble salto bajo una plataforma la atraviesa y puede caer encima.
  - **Caídas:** salir por el final de una plataforma cae al suelo con `aterrizaje-fuerte` y sin daño.
  - **Derrumbe:** emite `derrumbe` a 0,5 s de pisar, y el corredor cae sin perder vida. Saltar antes a la siguiente lo deja arriba.
  - **Tirolesa:**
    - agarrar con el dedo y soltar sobre una plataforma → arriba;
    - mantener hasta el final → abajo; los dos casos sin daño;
    - sin el dedo, un `soltar()` suelta;
    - la gracia sigue como en el cable;
    - en `carrera.test.ts`, `accion('tocar')` en la tirolesa la suelta y no salta.
  - **Habilidad con `alto: 3.5`:** pasar por debajo no la toma; sobre la plataforma, sí.
  - **Punto 3 de la revisión:** `mantener()`, `deslizarse()` y `rodar()` en la tirolesa no hacen nada. Al terminar la carrera, nada cambia.
  - **Punto 4:** `desde` sobre una plataforma y `desde` en una tirolesa empiezan en el suelo.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar. `sueloBajo()` suma las plataformas cuando los pies están a su altura o encima.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 10: la lona, la zona de viento y las rejillas

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/simulacion.ts` y `src/juego/simulacion.test.ts`.

**Interfaces:**
- Produce en `movimientos.ts`: `VY_PLANEO = -1.5`, `EMPUJE_VAPOR`, `ALTO_VAPOR`, `EMPUJE_SIN_LONA` y `ANCHO_REJILLA`.
- `Postura` suma `'planeando'`.
- `Simulacion` suma `readonly lona: boolean`.
- `EventoSim` suma `'lona' | 'lona-rota' | 'planear' | 'cerrar-lona'`.

**Reglas** (diseño, sección 6.4):
- **La lona:** pasar la estación `lona` la da; `viento-fin` la rompe y emite `lona-rota`.
- **Abrirla:** con la lona, en el aire y con el dedo apoyado desde hace `MANTENER_S` o más, pasa a `planeando` y emite `planear`. Vale también después de deslizar arriba.
- **Planeando:**
  - la caída no baja de `VY_PLANEO`;
  - `apoyar(false)` la cierra (`cerrar-lona`), y aterrizar también.
- **Rejillas:**
  - sobre una, planeando y bajo `ALTO_VAPOR`, sube;
  - sin lona, solo un empujón pequeño y sin daño.
- **Toques:** con la lona, tocar en el aire sigue siendo el doble salto; `mantener()` en el aire con la lona no hace el doble salto.
- **`desde`** dentro de la zona empieza con la lona; dentro de un foso de viento, pasado el borde.

- [ ] **Paso 1: pruebas que fallan,** a 9 y a 12 m/s:
  - **Cruzar:**
    - fosos de viento de 15 y de 30 m se cruzan saltando y manteniendo, con las rejillas del validador;
    - sin mantener, cae;
    - soltando a mitad del foso, cae.
  - **El dedo:**
    - deslizar arriba (`apoyar(true)` y `saltar()`) y seguir apoyado abre la lona a los 0,18 s;
    - `mantener()` en el aire con la lona no emite `doble-salto`.
  - **Sin lona,** una rejilla empuja hacia arriba y no hace daño.
  - **`viento-fin`** quita la lona y emite `lona-rota`.
  - **Punto 4 de la revisión:** `desde` en la zona empieza con lona; dentro de un foso de viento, pasado el borde.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar. Ajustar los empujes hasta que pasen las pruebas y anotar los números en el ledger.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 11: el disparo cargado y el dron blindado

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/simulacion.ts` y `src/juego/simulacion.test.ts`.

**Interfaces:**
- Produce en `movimientos.ts`: `CARGA_S = 0.6` y `BONO_BLINDADO = 100`.
- `Bala` suma `cargada: boolean`.
- `Simulacion` suma `readonly carga: number | null`, de 0 a 1 mientras carga.
- `EventoSim` suma `'carga' | 'disparo-cargado'` y `{ tipo: 'rebote'; id: number }`.

**Reglas** (diseño, sección 6.6):
- **Cargar:** `mantener()` con el arma empieza la carga.
- **Disparar:** `apoyar(false)` dispara solo si estaba cargando (`carga` no es null).
  - Con la carga llena: un disparo cargado.
  - Sin llenar: un disparo normal, que respeta la cadencia.
- **La bala cargada** atraviesa todos los drones de su carril hasta el alcance y rompe los blindados (+100 cada uno).
- **La bala normal** contra un blindado rebota (`rebote`) y se gasta; el dron sigue.
- **El turbo** rompe el blindado. El EMP corta la carga sin disparar.

- [ ] **Paso 1: pruebas que fallan.**
  - **Cargado:** mantener 0,6 s y soltar emite `disparo-cargado`. La bala derriba dos drones seguidos de su carril y un blindado, y suma 50 + 50 + 100.
  - **Normal:**
    - soltar a los 0,3 s da un disparo normal;
    - tocar sigue disparando normal, y el `apoyar(false)` que viene después del toque no dispara otra vez;
    - una bala normal contra un blindado emite `rebote` y el dron sigue.
  - **Turbo y EMP:** el turbo rompe el blindado al chocarlo; un EMP mientras carga deja `carga` en null y no dispara.
  - **Saltar:** `saltar()` con el arma sigue saltando.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 12: los modelos de los obstáculos

**Archivos:**
- Crear: `scripts/blender/obstaculos.py`, `public/modelos/obstaculos.glb`, `src/entidades/obstaculos.ts` y `src/entidades/obstaculos.test.ts`.
- Modificar: `CREDITOS.md`.

**Interfaces:**
```ts
export const PIEZAS_OBSTACULOS = [
  'tubo', 'soporte-tubo', 'grua', 'cadena', 'bola', 'prensa-marco', 'prensa-martillo', 'luz-aviso',
  'escombro-a', 'escombro-b', 'barril', 'llanta', 'plataforma', 'andamio', 'resorte-placa',
  'resorte-espiral', 'rejilla', 'poste-tirolesa', 'ancla-tirolesa', 'polea', 'estacion-lona', 'lona',
  'dron-blindado', 'fondo-grua', 'fondo-tanque', 'fondo-andamio', 'fondo-nave',
] as const;
export type ModelosObstaculos = Record<(typeof PIEZAS_OBSTACULOS)[number], Object3D>;
export function separarObstaculos(escena: Object3D): ModelosObstaculos; // falla nombrando la que falte
export function cargarObstaculos(url: string): Promise<ModelosObstaculos>;
```
- **Comando:** `blender --background --python scripts/blender/obstaculos.py -- public/modelos/obstaculos.glb`.
- **Ejes**, como `utileria.py`: Y arriba y la pista hacia +x.
- **Piezas que se estiran:** `tubo`, `cadena` y `plataforma` miden 1 m a lo largo de su eje, para estirarlas al largo de cada evento.
- **Piezas con origen fijo:** `bola` tiene el origen en su centro y `lona` en su barra.

- [ ] **Paso 1: prueba que falla** (`obstaculos.test.ts`, entorno node, lee el GLB):
  - un nodo por pieza de `PIEZAS_OBSTACULOS`, cada uno una sola malla con un solo material;
  - 400 KB o menos;
  - ninguna imagen.
  - Además, `separarObstaculos` falla nombrando la pieza que falta.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: `obstaculos.py`,** con el estilo de `utileria.py`:
  - **Forma:** bajo detalle, bordes biselados, colores de vértice y sin texturas.
  - **Colores:** de la Tierra baldía (concreto, óxido, metal pintado y gastado, tela).
  - **Luces:** el celeste `#7FD6DC` solo en la estación de la lona y el ojo del dron blindado. La luz de aviso de la prensa es ámbar apagado, cerca de `#E8A84A` pero menos saturado.
  - **Cada pieza:**
    - **tubo:** oxidado, con bridas;
    - **grúa:** con su brazo;
    - **prensa:** con pistones;
    - **escombros:** bloques de concreto con varillas;
    - **barril:** abollado;
    - **llanta:** de camión;
    - **plataforma:** pasarela de chatarra con barandas;
    - **andamio:** sus patas de 3,5 m;
    - **resorte:** placa y espiral;
    - **rejilla:** con su marco;
    - **tirolesa:** poste y ancla;
    - **polea:** sola;
    - **estación de la lona:** con la lona;
    - **lona:** tela con barra;
    - **dron blindado:** el dron de la utilería con placas;
    - **fondo:** grúa, tanque, andamio y nave en ruinas, más simples.
- [ ] **Paso 4:** `cargarObstaculos` con `GLTFLoader`. Generar el GLB y correr la prueba. Esperado: PASA. Anotar el peso en el ledger.
- [ ] **Paso 5:** `CREDITOS.md` suma los obstáculos y el fondo industrial a las piezas propias. Commit.

### Tarea 13: el corredor con todas las animaciones nuevas

**Archivos:** modificar `src/entidades/corredor.ts`, `src/entidades/corredor.test.ts`, `src/juego/carrera.ts`, `src/juego/carrera.test.ts` y `tests/navegador/juego.spec.ts`.

**Interfaces:**
- `Animacion` suma `'planear' | 'tirolesa' | 'aterrizar-fuerte' | 'resorte'`.
- `Recientes` suma `aterrizajeFuerte: boolean`, `resorte: boolean` y `disparoCargado: boolean`.
- `Corredor` suma `ponerLona(lona: Object3D): void`. La lona se ve entre las manos solo mientras planea.
- `EstadoJuego` suma:
  - `inclinacionPistola: number`: el ángulo del cañón con la horizontal, en radianes;
  - `lona: boolean`;
  - `carga: number | null`.

- [ ] **Paso 1: pruebas que fallan.**
  - **`corredor.test.ts`:** el orden de `elegirAnimacion` queda así:
    1. `morir` y `celebrar`;
    2. `foso`, `trepar`, `colgado`, `tirolesa`, `planear`, `deslizarse` y `rodar`;
    3. `golpe`, `escudo-roto` y `levantarse`;
    4. en el aire: `caer-rapido`, `resorte` (reciente), `doble-salto`, `despegar` y `aire`;
    5. en el suelo: `aterrizar-fuerte` (reciente), `aterrizar` y `correr`.
  - **`carrera.test.ts`:** cada `Recientes` nuevo vale true un momento después de su evento:
    - `aterrizajeFuerte`: unos 0,4 s;
    - `resorte`: unos 0,4 s;
    - `disparoCargado`: unos 0,25 s.
  - **`juego.spec.ts`** (`celular`): armado, con `desde` en la zona de armas, `juego().inclinacionPistola` varía más de 0,5 rad durante un giro. Hoy queda fija.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **Clips:**
    - `planear` = `Planear_Loop`;
    - `tirolesa` = `Tirolesa_Loop`;
    - `aterrizar-fuerte` = `NinjaJump_Land` una vez;
    - `resorte` = `NinjaJump_Start` una vez.
  - **Disparo cargado:**
    - mientras carga, el torso apunta y la pistola se enciende en celeste según `carga` (emisivo);
    - al disparar cargado, `Pistol_Shoot` con un retroceso más fuerte: el torso va unos 0,15 rad hacia atrás durante 0,15 s.
  - **La pistola** sigue el giro de la mano también al rodar, trepar o deslizarse; ya no queda horizontal (diseño, sección 9).
  - **La lona ondea** mientras planea: un vaivén barato de la tela (escala o giro por tramos), sin simulación de tela.
  - Todo se mezcla en 0,12 s, como antes.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit; se ve en la Tarea 15.

### Tarea 14: la escena (obstáculos, cámara, zona industrial y partículas)

**Archivos:**
- Crear: `src/mundo/tierra-baldia/obstaculos.ts`, `zona-industrial.ts` y `particulas.ts`.
- Modificar:
  - escena: `src/mundo/tierra-baldia/pista.ts` y `pista.test.ts`;
  - cámara: `src/camara/camara-juego.ts` y `camara-juego.test.ts`;
  - simulación: `src/juego/simulacion.ts` y `simulacion.test.ts`;
  - carrera: `src/juego/carrera.ts` y `carrera.test.ts`;
  - arranque: `src/main.ts`.

**Interfaces:**
```ts
// pista.ts
Pista.usarObstaculos(modelos: ModelosObstaculos): void;
Pista.efecto(tipo: 'polvo' | 'chispa', x: number, y: number, z: number): void;
/** Si un elemento del decorado a x (relativa al corredor) quedaría sobre el hueco de un foso. */
export function sobreFoso(x: number, fosos: readonly { x: number; largo: number }[], margen: number): boolean;
// camara-juego.ts
actualizar(dt: number, s: { modo: Modo; z: number; y: number; alejar: boolean }, aspecto: number): void;
export function encuadreLateral(alejar: number, y: number, aspecto: number):
  { posicion: [number, number, number]; mira: [number, number, number]; fov: number };
// simulacion.ts
/** Dentro de una zona industrial, o a 25 m o menos de que empiece. */
readonly industrial: boolean;
```
- La carrera pasa `alejar = s.industrial || s.y > 2.5`, y la cámara va hacia ese valor en unos 0,6 s.
- La carrera llama a `pista.efecto`:
  - polvo: en `aterrizaje-fuerte` y en `derrumbe`;
  - chispa: en `rebote`.

- [ ] **Paso 1: pruebas que fallan.**
  - **`camara-juego.test.ts`:**
    - `encuadreLateral(0, 0, a)` da la toma de hoy: posición (3,5, 2,2, 22), mira (3,5, 1,6, 0) y el fov de hoy;
    - con `alejar = 1`, a los aspectos 874/402 y 16/9, la toma muestra al menos `VISTA_ADELANTE_M` por delante del corredor y 2,5 m por detrás;
    - con `y = 3,5`, muestra el suelo (0) y la cabeza (`y + 1,9`).
  - **`pista.test.ts`:**
    - `sobreFoso` dice que sí dentro del hueco más el margen, y que no fuera;
    - `MAX` cubre las piezas nuevas: al menos 4 tubos, 3 bolas, 3 prensas, 6 escombros, 6 barriles, 6 llantas, 10 plataformas, 3 resortes, 2 tirolesas, 8 rejillas y 6 drones blindados.
  - **`simulacion.test.ts`:** `industrial` vale true desde 25 m antes de la zona hasta su final.
  - **`carrera.test.ts`:** `alejar` y las llamadas a `efecto`.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: implementar** con `InstancedMesh`, una malla por pieza y los movimientos de `src/juego/obstaculos.ts` (diseño, sección 9):
  - **Bola:** se balancea con su cadena desde la grúa.
  - **Prensa:**
    - sube con sus pistones;
    - la luz parpadea mientras `aviso`;
    - golpea con polvo.
  - **Escombros:** la sombra crece, caen girando y se rompen en pedazos al tocar el suelo.
  - **Barriles y llantas:** giran al rodar y levantan polvo.
  - **Plataformas:**
    - se dibujan sobre andamios;
    - la que se derrumba tiembla al pisarla y se desarma al caer.
  - **Resorte:** se comprime y se estira al lanzar.
  - **Rejillas:** columnas de vapor que suben.
  - **Tirolesa:** poste, cable hasta el ancla y polea en la mano del corredor.
  - **Estación de la lona:** con luz celeste.
  - **Habilidades con `alto`:** se dibujan a esa altura, sobre su plataforma.
  - **Dron blindado:** usa su modelo; un rebote saca chispas.
  - **Cámara:** `encuadreLateral` mezcla la toma de hoy con la alejada, y sube con la `y`.
  - **Zona industrial:**
    - grúas, andamios, tanques y una nave detrás de la pista (z de −12 a −30), en las zonas `industrial` del nivel;
    - mismo estilo que las ruinas.
  - **Nada flota:** el decorado cercano se oculta sobre el hueco de los fosos (pendiente de la etapa 3).
  - **Partículas:**
    - una `InstancedMesh` de cuadros que miran a la cámara, con 64 a lo sumo;
    - polvo al deslizarse y al caer los escombros, chispas en los rebotes;
    - con movimiento reducido salen menos y sin sacudidas.
  - **`main.ts`:**
    - carga `obstaculos.glb` en una tarea nueva de la carga (`obstaculos`, peso 1);
    - llama a `pista.usarObstaculos` y a `corredor.ponerLona(modelos.lona)`.
- [ ] **Paso 4:** correr `npx vitest run`. Esperado: PASA. Commit; se ve en la Tarea 15.

### Tarea 15: la vista previa con piloto automático (Parada 2)

**Archivos:**
- Crear: `src/juego/piloto.ts`, `src/juego/piloto.test.ts`, `src/datos/niveles/muestra-etapa-4.ts` y `src/datos/niveles/muestra-etapa-4.test.ts`.
- Modificar: `src/juego/carrera.ts`, `src/main.ts` y `tests/navegador/juego.spec.ts`.

**Interfaces:**
```ts
// piloto.ts
export interface Piloto { paso(s: Simulacion): Intencion[] }
export function crearPiloto(): Piloto;
// muestra-etapa-4.ts
export const MUESTRA_ETAPA_4: Nivel;   // id 'muestra-4', 450 m o menos
// carrera.ts
Carrera.simulacion(): Simulacion | null;   // solo para el piloto de la vista previa
```

**El piloto** mira `objetos()` y juega como una persona, con `apoyar`, `mantener` y `soltar`. Las intenciones se aplican con `aplicarIntencion`, la misma tabla de la carrera. Cada obstáculo pide su gesto:

| Obstáculo | Gesto del piloto |
|---|---|
| Vallas, prensa, escombros, barriles, llanta baja y bola de cadena larga | salta |
| Vigas, llanta alta y bola de cadena corta | rueda |
| Tubos | se desliza manteniendo |
| Contenedores | salta contra ellos |
| Cable | se agarra manteniendo, va y vuelve una vez y suelta en la franja buena |
| Resorte | lo pisa para subir |
| Plataforma que se derrumba | salta a la siguiente |
| Tirolesa | se agarra manteniendo y suelta sobre la plataforma |
| Zona de viento | planea manteniendo sobre las rejillas |
| Bloques | cambia de carril |
| Drones | dispara a los de su carril; a los blindados, con el disparo cargado |

**La muestra:**
- una zona industrial en 2D con cada elemento nuevo una vez, a unos 25 m entre sí;
- un cable;
- una zona de armas corta en 3D con dos drones blindados.

**`?muestra=1`:** al terminar la carga va directo a la carrera con `MUESTRA_ETAPA_4`, sin daño y con el piloto. Al llegar al final vuelve a empezar. El resto de la app no cambia.

- [ ] **Paso 1: pruebas que fallan.**
  - **`muestra-etapa-4.test.ts`:**
    - `validarNivel(MUESTRA_ETAPA_4)` es `[]`;
    - el piloto la pasa con la simulación real y llega a `fin` con 3 vidas, sin `golpe` ni `foso`;
    - emite al menos una vez cada uno de estos eventos: `deslizarse`, `soltar` (con el cable yendo hacia atrás antes), `resorte`, `aterrizaje-fuerte`, `tirolesa`, `soltar-tirolesa`, `lona`, `planear`, `disparo-cargado` y `dron` (de un blindado).
  - **`piloto.test.ts`:** ante un tubo pide `rodar` y `deslizarse`, y mantiene el dedo hasta pasarlo.
  - **`juego.spec.ts`:** con `?muestra=1&prueba=1&calidad=bajo`, `juego()` no es null. Después de `avanzar(10)` la distancia es mayor que 0 y no hay errores en la consola.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar.
- [ ] **Paso 4: revisar y fotografiar.**
  - Correr las pruebas. Esperado: PASA.
  - Abrir `?muestra=1` en el panel y revisar la consola.
  - Capturas en celular horizontal de cada obstáculo y cada pose:
    - deslizarse;
    - el cable yendo hacia atrás;
    - el resorte;
    - el aterrizaje fuerte;
    - la tirolesa;
    - planear;
    - la carga y el disparo cargado.
  - Commit.
- [ ] **Paso 5: PARADA 2, la vista previa en el iPhone.**
  - Avisar a David y pedirle que abra esa dirección con `?muestra=1` en su iPhone.
  - Debe ver si cada obstáculo y cada pose se ven bien, si se leen de lejos y si la carrera va fluida.
  - Esperar su visto bueno. Ajustar aquí lo que pida, con cada ajuste en el ledger, antes de la Tarea 16.

### Tarea 16: el tramo 1, más largo

**Archivos:** modificar `src/datos/niveles/tierra-baldia-1.ts` y `src/datos/niveles/tierra-baldia-1.test.ts`.

**Interfaces:**
- Produce `TIERRA_BALDIA_1`: `id` `'tierra-1'` y `largo` entre 900 y 1000.
- Las pistas nuevas van en el primer evento de cada una:
  - `'deslizarse'`: el primer tubo;
  - `'tirolesa'`: la primera tirolesa;
  - `'planear'`: el primer foso de viento;
  - `'cargar'`: el primer dron blindado.

- [ ] **Paso 1: pruebas que fallan.**
  - **Válido:** `validarNivel(TIERRA_BALDIA_1)` es `[]`.
  - **Contenido:**
    - al menos uno de cada tipo nuevo;
    - una zona de viento con dos fosos de 15 a 30 m o más;
    - una tirolesa con una plataforma debajo;
    - una plataforma que se derrumba;
    - al menos una habilidad con `alto` en la ruta de arriba;
    - dos drones blindados o más en la zona de armas.
  - **Se puede pasar:** el piloto de `piloto.ts` lo pasa a la velocidad real.
    - Llega a `fin` con 3 vidas, sin `golpe`, `foso` ni `escudo-roto`.
    - Emite cada evento de la lista de la Tarea 15.
  - **Cada gesto nuevo aparece primero solo:** entre el evento con `pista` y el siguiente obstáculo de otro tipo hay 15 m o más.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: escribir el tramo** con el orden del diseño (sección 11). Los metros son de referencia y se ajustan con el piloto.
  1. **0–180 m, 2D:** lo de la etapa 3, más corto: vallas, doble salto, vigas, caída rápida y contenedores.
  2. **180–300 m, 2D:** los dos fosos con cable de ida y vuelta.
  3. **300–640 m, 2D, zona industrial:**
     1. tubos de largo creciente;
     2. barriles, escombros, prensa, bola y llantas, uno por uno;
     3. resorte, ruta de arriba y plataformas que se derrumban;
     4. la tirolesa;
     5. la zona de viento con la lona y dos o tres fosos con rejillas.
  4. **Unos 660 m:** portal a 3D, con carriles, bloques y vigas.
  5. **Unos 720 m:** la zona de armas con drones, blindados con su pista y el EMP.
  6. **Unos 860 m:** portal a 2D y cierre que mezcla todo.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 17: la carrera conectada (pistas, avisos, HUD y medidas)

**Archivos:**
- Lógica: `src/juego/carrera.ts` y `src/juego/carrera.test.ts`.
- Pantalla y textos: `src/textos/es.ts` y `src/interfaz/pantallas/juego.ts`.
- Arranque y pruebas: `src/main.ts`, `src/nucleo/modo-prueba.ts` y `tests/navegador/juego.spec.ts`.

**Interfaces:**
- `PistaHud` suma `'deslizarse' | 'tirolesa' | 'planear' | 'cargar'`.
- `QUITA_PISTA` suma:
  - `deslizarse` → `'deslizarse'`;
  - `tirolesa` → `'soltar-tirolesa'`;
  - `planear` → `'planear'`;
  - `cargar` → `'disparo-cargado'`.
- `OBSTACULOS`, el conjunto que retiene las pistas, suma `tubo`, `bola`, `prensa`, `escombro`, `barril` y `llanta`.
- Textos nuevos en `TEXTOS.juego`:
  - `pistaDeslizarse` 'Desliza abajo y mantén para deslizarte';
  - `pistaTirolesa` 'Mantén en la tirolesa · suelta sobre una plataforma';
  - `pistaPlanear` 'Mantén en el aire para planear';
  - `pistaCargar` 'Mantén para cargar · suelta para disparar';
  - `lonaLista` 'Lona lista: mantén en el aire para planear';
  - `lonaRota` 'El viento rompió la lona'.
- Mientras `sim.carga` no es null, el anillo se llena con la carga en cada paso.

- [ ] **Paso 1: pruebas que fallan.**
  - **`carrera.test.ts`:**
    - cada pista nueva sale a 35 m o menos de su evento y se va con su movimiento;
    - `lona` muestra el aviso `lonaLista` y `lona-rota` el aviso `lonaRota`;
    - el anillo recibe la carga mientras carga;
    - `empezar()` deja el anillo oculto y nada apoyado.
  - **`juego.spec.ts`** (`celular`, `iphone` y `escritorio`, con las posiciones leídas de `TIERRA_BALDIA_1`):
    1. Deslizar hacia abajo con el puntero y mantener ante el primer tubo pasa con 3 vidas, y la pista se va.
    2. El resorte deja al corredor arriba (`y ≈ 3,5`).
    3. **Tirolesa:** agarrarla manteniendo y soltar sobre una plataforma lo deja arriba; mantener hasta el final lo deja abajo.
    4. **Zona de viento:** sale el aviso de la lona; manteniendo sobre el foso queda `planeando` y lo cruza; al final sale el aviso de la lona rota.
    5. **Zona de armas:** mantener el puntero 0,7 s llena el anillo; al soltar, el blindado cae.
    6. **Punto 2 de la revisión:** salir con Salir o con Escape mientras mantiene, cuelga, planea, va en la tirolesa o carga. La carrera siguiente empieza `corriendo`, sin lona, con `carga` null, sin anillo y con `apoyado` false.
    7. **Punto 1:** con el puntero apoyado y colgado, ocultar la pestaña lo suelta (`apoyado` false) y la carrera no queda trabada al volver.
    8. **Llamadas de dibujo:** `render().llamadas` ≤ 150 en la sección de cables, en la zona industrial y en la zona de viento (pendiente de la etapa 3).
    9. Sin errores en la consola en ninguna prueba.
- [ ] **Paso 2:** `npx vitest run src/juego` y `npx playwright test tests/navegador/juego.spec.ts --project=celular`. Esperado: FALLA.
- [ ] **Paso 3:** implementar.
- [ ] **Paso 4: verificar.**
  - `npm run verificar` completo. Esperado: todo en verde.
  - Abrir la carrera en el panel (5331) y revisar la consola.
  - Capturas en celular horizontal de cada gesto nuevo en el tramo 1.
  - Commit.

### Tarea 18: documentación, sitio y cierre

**Archivos:** modificar `LEEME.md`, `CREDITOS.md`, `scripts/armar-sitio.mjs` y `tests/navegador/sitio.spec.ts`.

- [ ] **Paso 1: prueba que falla** en `sitio.spec.ts`:
  - `/avance/modelos/obstaculos.glb` responde 200 y empieza con "glTF";
  - `LICENCIAS.txt` nombra los obstáculos, `Planear_Loop` y `Tirolesa_Loop` como piezas propias.
- [ ] **Paso 2:** `npm run sitio` y `npx playwright test --project=sitio`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **`armar-sitio.mjs`:** la línea de piezas propias suma los obstáculos, el fondo industrial y las dos animaciones nuevas.
  - **`LEEME.md`:**
    - la tabla de controles nueva: tocar, deslizar, mantener y soltar, más el teclado;
    - cómo rehacer el corredor con `clips-propios.py` y los obstáculos con `obstaculos.py`;
    - `?muestra=1`;
    - las carpetas nuevas.
- [ ] **Paso 4:** `npm run verificar` y `npm run sitio` con la prueba del sitio. Esperado: todo en verde. Commit.
