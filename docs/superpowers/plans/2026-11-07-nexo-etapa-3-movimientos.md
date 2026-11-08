# NEXO etapa 3 "Movimientos": plan de construcción

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Meta:** el corredor de la Tierra baldía rueda, cae rápido, trepa contenedores, se balancea en cables sobre fosos y dispara a drones en una zona de armas, con una animación propia para cada movimiento, el "¡Justo!" y un tramo 1 rehecho que enseña todo.

**Arquitectura:** sigue la de la etapa 2.
- **Reglas:** viven en `src/juego/simulacion.ts`, TypeScript puro y probado. Las constantes y las funciones puras de los movimientos nuevos van en `src/juego/movimientos.ts`.
- **Nivel:** sigue siendo datos validados en `src/datos/niveles/`.
- **Carrera:** `src/juego/carrera.ts` traduce los eventos de la simulación a HUD, avisos, cámara y vibración.
- **Corredor:** el mismo maniquí CC0, ahora con clips de UAL1, UAL2 y un clip propio de colgarse, más una capa de pistola para el torso.
- **Modelos propios:** la pistola y el dron salen de un script de Blender (`public/modelos/utileria.glb`).

**Herramientas:** las de la etapa 2, más Blender 5.2.3 LTS (ya instalado) para los scripts de `scripts/blender/`. No hay dependencias npm nuevas.

**Documento de diseño:** `docs/superpowers/specs/2026-11-07-nexo-etapa-3-movimientos-design.md` (manda). El general sigue valiendo: `docs/superpowers/specs/2026-11-06-nexo-design.md`. **Referencia de la zona de armas:** `prototipo/juego.js` (`disparar()`, casos `dron`, `arma` y `emp`).

**Fuera de esta etapa:** tramos al azar, ruta de arriba y chatarra (4), personaje final (5), criaturas, combate, punto de control y jefe (6), sonido, pausa y resultados (9).

## Restricciones globales

- Todo lo de las etapas 1 y 2 sigue vigente:
  - español, y textos solo en `src/textos/es.ts`;
  - sistema de diseño de `tokens.css` y movimiento reducido;
  - puertos 5331/5332/5330 (nunca 5173, 5180, 8000, 8001, 3000, 5432, 5190, 8090);
  - repositorio público sin secretos ni rutas personales;
  - licencias CC0 o CC-BY con crédito (nada de CC-BY-SA, NC, ND ni Mixamo).
- Rama `etapa-3-movimientos` desde `main` (674c953). Commit local por tarea; **no se sube nada** sin el visto bueno de David.
- Cada mensaje de commit termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Antes de cada commit que toque una pantalla o la escena: abrirla en el navegador del panel (5331) y revisar la consola.
- Los archivos descargados quedan en `Descargas/recursos-nexo/` (UAL1 en `ual1/extraido`, UAL2 en `ual2/extraido`). Los scripts reciben las rutas por argumento.
- Números de la etapa 2 (no cambian): gravedad 24; salto 8,5; doble salto 8; carriles a 1,6 m; velocidad 9 → 12 (+0,006/m), turbo 15; 3 vidas; 1,4 s sin daño tras un golpe.
- Números de partida de la etapa 3 (diseño, sección 5; se ajustan al probar y cada ajuste va al ledger):
  - de pie 1,75 m; rodando 0,9 m durante 0,7 s;
  - contenedor de 2 m; foso que se salta hasta 4 m; foso con cable desde 9 m;
  - vaivén de alrededor de 1 s;
  - "¡Justo!": ventana de 0,18 s y +50;
  - bala a 40 m/s con cadencia de 0,15 s.
- Controles (diseño, sección 7):
  - Tocar: salta, dispara con arma y suelta el cable.
  - Deslizar arriba: salta. Deslizar abajo: rueda, y en el aire hace la caída rápida. Deslizar a los lados: cambia de carril.
  - Teclado: espacio, flecha arriba o W saltan (y sueltan el cable); flecha abajo o S ruedan; X dispara; flechas o A/D cambian de carril.
  - Un deslizamiento cuenta desde 40 px.
- Decisiones de Claude ya aprobadas (diseño, sección 12):
  - el foso quita una vida y el corredor reaparece al otro lado;
  - en el cable, sin tocar se suelta solo y pasa;
  - llegar por el suelo a un contenedor golpea y sube igual;
  - rodar no protege de golpes;
  - cables solo en 2D y zona de armas solo en 3D;
  - sin doble salto después de la caída rápida;
  - el turbo rompe vigas y drones, trepa sin golpe y no ayuda en fosos;
  - una pista a la vez, y cada una se queda hasta hacer su movimiento;
  - el récord se conserva.
- Rendimiento: como máximo 150 llamadas de dibujo por cuadro en la carrera (calidad alta). `corredor.glb` pesa como máximo 800 KB y `utileria.glb` como máximo 150 KB.

## Puntos a vigilar en la revisión

1. **Cambiar de carril contra el costado de un contenedor, o bajarse de uno en 3D a mitad de un giro o de un trepar.** El corredor nunca se traba ni queda dentro del contenedor, y no recibe dos golpes por el mismo contenedor. Prueba en la Tarea 4.
2. **Deslizar hacia abajo o a los lados mientras trepa, cuelga del cable o cae al foso.** Se ignora sin dañar el estado. Al terminar ese movimiento, el corredor sigue normal. Pruebas en las Tareas 4 y 5.
3. **Perder la última vida cayendo a un foso.** Es derrota, el corredor no reaparece arriba y el panel sale como en la etapa 2. Pruebas en las Tareas 4 y 11.
4. **Empezar con `?desde` dentro de un foso, encima de un contenedor o dentro de la zona de armas.** Empieza en un estado posible:
   - dentro de un foso → en el borde lejano;
   - en un contenedor → encima;
   - en la zona de armas → con el arma.
   Prueba en la Tarea 6.
5. **Salir de la carrera armado o colgado y volver a entrar.** La carrera nueva empieza sin arma, sin balas, sin pistola en la mano y corriendo. Prueba en la Tarea 11.

---

## Mapa de archivos

```
scripts/blender/colgar.py            UAL1_Standard.glb → colgar.glb (clip propio Colgar_Loop, fuera del repo)
scripts/blender/utileria.py          → public/modelos/utileria.glb (pistola y dron, piezas propias)
scripts/preparar-corredor.mjs        UAL1 + UAL2 + colgar.glb → public/modelos/corredor.glb (16 clips)
src/juego/movimientos.ts             constantes y funciones puras de rodar, trepar, cable, vigas y drones
src/entidades/utileria.ts            cargarUtileria(): pistola y dron
```

Se modifican:
- **Reglas y nivel:** `src/datos/niveles/tipos.ts`, `validar.ts`, `tierra-baldia-1.ts`, `src/juego/simulacion.ts`, `src/juego/carrera.ts`.
- **Entrada, corredor y escena:** `src/entrada/controles.ts`, `src/entidades/corredor.ts`, `src/mundo/tierra-baldia/pista.ts`, `src/camara/camara-juego.ts`.
- **Pantalla y textos:** `src/interfaz/pantallas/juego.ts`, `src/interfaz/iconos.ts`, `src/interfaz/componentes.css`, `src/textos/es.ts`.
- **Arranque y prueba:** `src/nucleo/modo-prueba.ts`, `src/main.ts`.
- **Documentación y sitio:** `CREDITOS.md`, `LEEME.md`, `scripts/armar-sitio.mjs`.
- **Pruebas:** las de cada archivo, más `tests/navegador/juego.spec.ts` y `sitio.spec.ts`.

---

### Tarea 1: los modelos (corredor con 16 clips, pistola y dron)

**Archivos:**
- Crear: `scripts/blender/colgar.py`, `scripts/blender/utileria.py`, `public/modelos/utileria.glb`, `src/entidades/utileria.ts`, `src/entidades/utileria.test.ts`.
- Modificar: `scripts/preparar-corredor.mjs`, `public/modelos/corredor.glb`, `src/entidades/modelo.test.ts`, `CREDITOS.md`.

**Interfaces:**
- Produce `public/modelos/corredor.glb` con estos 16 clips (nombres originales):
  - de UAL1: `Idle_Loop`, `Sprint_Loop`, `Jump_Start`, `Jump_Loop`, `Jump_Land`, `Hit_Chest`, `Death01`, `Roll`, `Pistol_Aim_Neutral`, `Pistol_Shoot`;
  - de UAL2: `ClimbUp_1m`, `Hit_Knockback`, `Idle_Shield_Break`, `NinjaJump_Start`, `Yes`;
  - propio: `Colgar_Loop`.
- Produce `public/modelos/utileria.glb` con dos nodos de malla llamados `pistola` (unos 0,25 m de largo) y `dron` (unos 0,8 m de ancho). Cada uno es una sola malla con un solo material, sin texturas.
- Produce los comandos:
  - `npm run modelos:corredor -- <UAL1_Standard.glb> <UAL2_Standard.glb> <colgar.glb>`;
  - `blender --background --python scripts/blender/utileria.py -- public/modelos/utileria.glb` (Blender se llama por su ruta; en el repo solo queda el comando genérico);
  - `blender --background --python scripts/blender/colgar.py -- <UAL1_Standard.glb> <salida colgar.glb>`.
- Produce, en `src/entidades/utileria.ts`:
  ```ts
  export interface Utileria { pistola: Object3D; dron: Object3D }
  export function cargarUtileria(url: string): Promise<Utileria>;
  ```

- [ ] **Paso 1: pruebas que fallan.**
  - `modelo.test.ts` cambia:
    - exactamente esos 16 nombres de animación;
    - 800 KB o menos;
    - una sola `skin` con 65 huesos;
    - `EXT_meshopt_compression`.
  - `utileria.test.ts` (entorno node) lee el GLB:
    - nodos `pistola` y `dron`;
    - 2 mallas;
    - 150 KB o menos;
    - ninguna imagen (`images` vacío o ausente).
- [ ] **Paso 2:** `npx vitest run src/entidades/modelo.test.ts src/entidades/utileria.test.ts`. Esperado: FALLA (faltan 9 clips y el GLB de utilería no existe).
- [ ] **Paso 3: `colgar.py`.**
  - Importa el GLB de UAL1 y toma su armadura de 65 huesos.
  - Crea la acción `Colgar_Loop` de 1 s en bucle:
    - brazos (`upperarm_l/r`, `lowerarm_l/r`, `hand_l/r`) arriba agarrando un punto sobre la cabeza;
    - torso levemente arqueado;
    - piernas que se balancean adelante y atrás (unos ±25° en `thigh_l/r`, con las rodillas algo dobladas).
  - Exporta solo la armadura con esa acción a la ruta de salida.
  - Generar `colgar.glb` en `recursos-nexo/propios/`. Es un intermedio y no entra al repo.
- [ ] **Paso 4: `preparar-corredor.mjs`.**
  - Recibe las tres rutas y parte del documento de UAL1.
  - Copia los clips pedidos de UAL2 y de `colgar.glb`, apuntando sus canales a los nodos de UAL1 **por nombre de hueso** (los dos paquetes comparten los mismos 65 nombres).
  - Borra el resto, con `borrarAnimacion`, y aplica la misma limpieza y compresión que hoy.
  - Si falta un clip o un hueso, falla con un mensaje claro.
- [ ] **Paso 5: `utileria.py`.**
  - Modela en bajo detalle, con bordes biselados y sin texturas:
    - una pistola futurista: cuerpo, cañón y empuñadura, con material metal oscuro;
    - un dron: cuerpo central, cuatro brazos con rotores y un ojo, todo en un solo material con colores de vértice: metal oscuro y el ojo en el celeste de la torre `#7FD6DC`.
  - El cañón de la pistola apunta a +x y la empuñadura está en el origen, para colgarla de `hand_r`.
  - Exporta `public/modelos/utileria.glb`.
- [ ] **Paso 6: `cargarUtileria`.** Usa `GLTFLoader` y devuelve los dos nodos por nombre. Si falta uno, rechaza con un error que lo nombra.
- [ ] **Paso 7:** correr los scripts y luego las pruebas. Esperado: PASA. Anotar en el ledger los pesos reales.
- [ ] **Paso 8: `CREDITOS.md`.**
  - Agregar "Universal Animation Library 2 (Standard), Quaternius, CC0, https://quaternius.com/packs/universalanimationlibrary2.html".
  - Agregar "Pistola, dron y animación Colgar_Loop: piezas propias de NEXO, hechas con scripts/blender/".
  - Commit.

### Tarea 2: el nivel con los obstáculos nuevos

**Archivos:** modificar `src/datos/niveles/tipos.ts`, `src/datos/niveles/validar.ts`, `src/datos/niveles/validar.test.ts`.

**Interfaces:**
- Produce:
  ```ts
  export type PistaNivel = 'rodar' | 'caer' | 'trepar' | 'cable';
  type Base = { en: number; pista?: PistaNivel };   // la pista se muestra al acercarse este evento
  export type Evento = Base & (
    | { tipo: 'valla'; alto?: 0.7 | 1.1 }
    | { tipo: 'bloque'; carril: Carril }
    | { tipo: 'habilidad'; clase: Habilidad; carril?: Carril }
    | { tipo: 'portal'; a: Modo }
    | { tipo: 'viga' }                                  // cruza todos los carriles
    | { tipo: 'contenedor'; largo: number; carril?: Carril } // 2D sin carril, 3D con carril
    | { tipo: 'foso'; largo: number }                   // cruza todos los carriles
    | { tipo: 'cable' }                                 // al principio de un foso largo
    | { tipo: 'arma' }
    | { tipo: 'dron'; carril: Carril }
    | { tipo: 'emp' });
  ```
- Produce en `validar.ts`: `export const FOSO_SALTABLE_M = 4;` y `export const FOSO_CON_CABLE_M = 9;`.

- [ ] **Paso 1: pruebas que fallan.** `validarNivel` devuelve un problema que nombra el evento en cada caso:
  - contenedor: en 3D sin carril, en 2D con carril, o con `largo` fuera de 4..12;
  - foso: con `largo` entre 4 y 9 (ni se salta ni lleva cable); largo (≥ 9) sin un `cable` en el mismo `en`; largo en 3D;
  - cable: en 3D, o que no está al principio de un foso largo;
  - cualquier evento (salvo el cable de su borde) con `en` dentro de un foso;
  - arma: en 2D, o una segunda arma antes del EMP de la primera;
  - EMP: sin arma abierta antes;
  - arma sin EMP antes del siguiente portal o del final;
  - dron: en 2D;
  - `pista` repetida (la misma pista en dos eventos).
  Y un tramo correcto que usa todos los tipos nuevos devuelve `[]`. Las pruebas viejas siguen.
- [ ] **Paso 2:** `npx vitest run src/datos/niveles`. Esperado: FALLA.
- [ ] **Paso 3:** implementar los tipos y las reglas. `tierra-baldia-1.ts` no cambia todavía, y su prueba sigue pasando.
- [ ] **Paso 4:** correr. Esperado: PASA. `npx tsc --noEmit` sin errores. Commit.

### Tarea 3: rodar, caída rápida, vigas y "¡Justo!"

**Archivos:** crear `src/juego/movimientos.ts`, `src/juego/movimientos.test.ts`; modificar `src/juego/simulacion.ts`, `src/juego/simulacion.test.ts`.

**Interfaces:**
- Produce, en `movimientos.ts`:
  ```ts
  export const ALTURA_DE_PIE = 1.75, ALTURA_RODANDO = 0.9, DURACION_RODAR = 0.7, VY_CAIDA_RAPIDA = -22;
  export const VIGA_LIBRE = 1.1, VIGA_TOPE = 3.5;          // la viga ocupa de 1,1 a 3,5 m
  export const VENTANA_JUSTO_S = 0.18, BONO_JUSTO = 50;
  export type Postura = 'corriendo' | 'rodando' | 'trepando' | 'colgado' | 'foso';
  export function alturaCuerpo(p: Postura): number;       // 0,9 rodando; 1,75 en lo demás
  ```
- Produce, en `Simulacion`:
  - `readonly postura: Postura;` y `readonly caidaRapida: boolean;`;
  - `rodar(): void`: en el suelo rueda; en el aire hace la caída rápida;
  - `EventoSim` suma `{ tipo: 'rodar' | 'caida-rapida' }` y `{ tipo: 'justo'; puntos: number }`.

- [ ] **Paso 1: pruebas que fallan.**
  - **Rodar en el suelo:**
    - `postura` pasa a `rodando`, emite `rodar` y vuelve a `corriendo` a los 0,7 s;
    - otro `rodar()` en medio vuelve a empezar los 0,7 s;
    - `saltar()` en medio corta el giro y salta;
    - `cambiarCarril` en medio funciona (3D).
  - **Viga:**
    - de pie, sin rodar, quita 1 vida (`golpe`);
    - rodando pasa sin golpe;
    - saltando también golpea, porque llega hasta 3,5 m;
    - con turbo se rompe (`roto`, +30).
  - **Caída rápida:**
    - `rodar()` en el aire pone `vy = -22`, emite `caida-rapida` y `caidaRapida` es true;
    - al tocar el suelo emite `aterrizaje`, luego `rodar`, y queda `rodando`;
    - un `saltar()` después de la caída rápida, todavía en el aire, no hace doble salto aunque tenga la habilidad.
  - **"¡Justo!":**
    - saltar una valla empezando el salto 0,1 s antes de que llegue emite `{ tipo: 'justo', puntos: 50 }` y suma 50 al puntaje;
    - empezando 0,5 s antes, no;
    - rodar bajo una viga empezando 0,1 s antes también da "¡Justo!";
    - un obstáculo que golpea nunca da "¡Justo!".
  - **`movimientos.test.ts`:** `alturaCuerpo('rodando') === 0.9` y `alturaCuerpo('corriendo') === 1.75`.
- [ ] **Paso 2:** `npx vitest run src/juego`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - La simulación lleva su propio reloj `tiempo` y guarda cuándo empezó el último salto y el último giro.
  - Un obstáculo cuenta como "pasado" la primera vez que su `x ≤ 0` sin golpe. En ese momento se revisa la ventana del "¡Justo!".
  - Choque con viga: `|x| < 0,35`, `y + alturaCuerpo > 1,1` y `y < 3,5`.
- [ ] **Paso 4:** correr. Esperado: PASA, y las pruebas viejas de la simulación siguen en verde. Commit.

### Tarea 4: suelo variable (contenedores y fosos)

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/simulacion.ts`, `src/juego/simulacion.test.ts`.

**Interfaces:**
- Produce en `movimientos.ts`: `ALTO_CONTENEDOR = 2`, `DURACION_TREPAR = 0.45`, `DURACION_TREPAR_GOLPE = 0.8` y `MEDIO_ANCHO_CONTENEDOR = 0.75` (en z).
- Produce en `Simulacion`: `readonly suelo: number | null;`. Vale 0 en el suelo, 2 encima de un contenedor y `null` sobre un foso.
- `EventoSim` suma `{ tipo: 'trepar' | 'foso' }`.

- [ ] **Paso 1: pruebas que fallan.**
  - **Trepar:**
    - saltar contra un contenedor de 2D (tocando su frente en el aire) emite `trepar`;
    - pasa por `trepando`;
    - a los 0,45 s está en `y = 2` y `corriendo`, sin golpe.
  - **Por el suelo:**
    - emite `golpe` y `trepar`, quita 1 vida y sube en 0,8 s;
    - con escudo, rompe el escudo y sube;
    - con turbo, sube sin golpe.
  - **Encima:**
    - `suelo === 2`, se puede saltar (vuelve a 2) y rodar;
    - al pasar el final cae con gravedad y emite `aterrizaje` en `y = 0` (sin evento `salto`).
  - **Desde arriba:** con doble salto, caer sobre el contenedor deja `y = 2` sin `trepar` ni golpe.
  - **"¡Justo!":** un salto empezado 0,1 s antes de tocar el frente da `justo` al trepar; empezado 0,5 s antes, no.
  - **3D:**
    - un contenedor en el carril 1 no afecta al carril 0;
    - estando encima, cambiar de carril hace caer al suelo;
    - cambiar de carril hacia el costado de un contenedor, en el suelo, da **un** golpe y sube (punto 1 de la revisión);
    - `rodar` o `cambiarCarril` durante `trepando` no cambian nada.
  - **Foso corto (3 m):**
    - saltándolo no pasa nada;
    - sin saltar, `suelo` es `null`, emite `foso` y `golpe`, quita 1 vida y la postura es `foso` (y baja de 0);
    - al pasar el borde lejano vuelve a `y = 0`, `corriendo` e invulnerable 1,4 s;
    - con escudo, rompe el escudo en vez de la vida;
    - el turbo no lo evita;
    - en `foso`, `saltar` y `rodar` no hacen nada.
  - **Última vida en un foso:** es `derrota`, y el corredor no vuelve a `y = 0` (punto 3 de la revisión).
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - Una función interna `sueloBajo(distancia, z)` mira los contenedores y fosos activos.
  - El aterrizaje compara `y` con el suelo, no con 0.
  - Un contenedor toca al corredor si su `x` va de `en` a `en + largo`, el cuerpo cae dentro de su ancho en z (o en 2D) y `y < 2 − 0,05`:
    - en el aire, sube;
    - en el suelo, golpe y sube;
    - cada contenedor golpea una sola vez.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 5: el cable

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/movimientos.test.ts`, `src/juego/simulacion.ts`, `src/juego/simulacion.test.ts`.

**Interfaces:**
- Produce en `movimientos.ts`:
  ```ts
  export const VAIVEN_S = 1.0;
  export const FRANJA_BUENA: readonly [number, number] = [0.6, 1.0];
  export const CENTRO_FRANJA: readonly [number, number] = [0.75, 0.85];
  /** Altura del corredor (pies) a lo largo del vaivén, u de 0 a 1. */
  export function alturaVaiven(u: number): number;
  /** Impulso vertical al soltarse en u, y si cuenta como "¡Justo!". */
  export function suelta(u: number): { vy: number; justo: boolean };
  ```
- Produce en `Simulacion`:
  - `readonly vaiven: number | null;`: el `u` mientras está colgado;
  - `soltar(): void`;
  - `EventoSim` suma `{ tipo: 'agarre' | 'soltar' }`.

- [ ] **Paso 1: pruebas que fallan.**
  - **`movimientos.test.ts`:**
    - `suelta(0.8).justo` es true y su `vy` es el mayor de todos;
    - `suelta(0.3).vy` es menor que `suelta(0.6).vy`;
    - `alturaVaiven` crece de `u = 0` a `u = 1`.
  - **`simulacion.test.ts`, con un foso de 12 m y su cable:**
    - estar en el aire al llegar al cable emite `agarre` y pone `colgado` con `vaiven` subiendo;
    - llegar al cable por el suelo cae al foso;
    - soltar en `u ≈ 0,8` pasa el foso sin daño y da `justo`;
    - soltar en `u ≈ 0,65` pasa sin `justo`;
    - soltar en `u ≈ 0,3` cae al foso (`foso`, `golpe`);
    - sin tocar, a `u = 1` se suelta solo (`soltar`) y pasa sin daño;
    - colgado, `saltar()` también suelta;
    - colgado, `rodar` y `cambiarCarril` no hacen nada (punto 2 de la revisión).
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - Mientras cuelga, la distancia sigue avanzando a la velocidad de siempre y `y = alturaVaiven(u)`.
  - Al soltarse, `vy = suelta(u).vy` y el corredor vuelve al aire normal (sin doble salto en ese vuelo).
  - Ajustar las fórmulas para que se cumplan las cuatro distancias de prueba a la velocidad de 9 y a la de 12 m/s. Anotar las fórmulas finales en el ledger.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 6: arma, disparos, drones y EMP

**Archivos:** modificar `src/juego/movimientos.ts`, `src/juego/simulacion.ts`, `src/juego/simulacion.test.ts`.

**Interfaces:**
- Produce en `movimientos.ts`: `DRON_ABAJO = 1.0`, `DRON_ARRIBA = 1.6`, `BALA_MS = 40`, `CADENCIA_S = 0.15`, `BALA_ALCANCE_M = 45` y `BONO_DRON = 50`.
- Produce en `Simulacion`:
  - `readonly armado: boolean;`
  - `balas(): readonly Bala[];`, con `interface Bala { id: number; x: number; carril: Carril }` (x relativa al corredor)
  - `disparar(): void;`
  - `EventoSim` suma `{ tipo: 'arma' | 'emp' | 'disparo' }` y `{ tipo: 'dron'; id: number }` (derribado).
- `desde` también aplica `arma` y `emp` anteriores. Si cae dentro de un foso, empieza en su borde lejano; si cae sobre un contenedor, empieza encima (punto 4 de la revisión).

- [ ] **Paso 1: pruebas que fallan.**
  - **Arma:**
    - pasar la estación emite `arma` y pone `armado`;
    - `disparar()` sin arma no hace nada;
    - con arma emite `disparo`, agrega una bala en el carril actual y respeta la cadencia (dos disparos en 0,1 s dan una sola bala);
    - la bala desaparece a los 45 m.
  - **Dron:**
    - una bala en su carril lo derriba: emite `{ tipo: 'dron', id }`, suma 50 y el objeto queda `roto`;
    - en otro carril, no;
    - chocar uno quita una vida;
    - rodando se pasa por debajo sin golpe;
    - con turbo se rompe al chocarlo (evento `roto`, como los bloques).
  - **EMP:** emite `emp`, quita el arma y borra las balas en vuelo.
  - **`desde`:**
    - `desde` dentro de la zona da `armado`;
    - después del EMP, no;
    - `desde` en medio de un foso empieza en `y = 0` pasado el borde;
    - `desde` en medio de un contenedor empieza con `y = 2`.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar como en el prototipo (`disparar()` y los casos `dron`, `arma` y `emp`), sin Three.js.
  - La bala avanza en el mundo a 40 m/s.
  - Derriba al dron si están en el mismo carril y a menos de 0,6 m en x.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 7: controles con los gestos nuevos

**Archivos:** modificar `src/entrada/controles.ts`, `src/entrada/controles.test.ts`.

**Interfaces:**
- Produce: `export type Intencion = 'tocar' | 'saltar' | 'rodar' | 'disparar' | 'izquierda' | 'derecha';`
- Un toque es `tocar`, deslizar arriba es `saltar` y deslizar abajo es `rodar`.
- Teclado:
  - espacio, flecha arriba y W → `saltar`;
  - flecha abajo y S → `rodar`;
  - X → `disparar`;
  - flechas y A/D → `izquierda` y `derecha`.

- [ ] **Paso 1: pruebas que fallan** (happy-dom):
  - un toque sin moverse → solo `tocar`;
  - deslizar 60 px hacia abajo → solo `rodar`;
  - deslizar 60 px hacia arriba → solo `saltar`;
  - deslizar 30 px hacia abajo (menos del umbral) → `tocar`;
  - cada gesto produce **una sola** intención;
  - las teclas nuevas dan su intención y `e.repeat` se ignora.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar. El sentido gana por el eje mayor, como hoy.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 8: el corredor animado con los movimientos y la pistola

**Archivos:** modificar `src/entidades/corredor.ts`, `src/entidades/corredor.test.ts`.

**Interfaces:**
- Consume los clips de la Tarea 1 y `postura`, `caidaRapida` y `armado` de las Tareas 3 a 6.
- Produce:
  ```ts
  export type Animacion = 'quieto' | 'correr' | 'despegar' | 'aire' | 'aterrizar' | 'golpe' | 'morir'
    | 'rodar' | 'caer-rapido' | 'trepar' | 'colgado' | 'foso' | 'escudo-roto' | 'doble-salto' | 'celebrar';
  export interface Recientes { golpe: boolean; aterrizaje: boolean; escudoRoto: boolean; dobleSalto: boolean; disparo: boolean }
  export function elegirAnimacion(s: { estado: EstadoCarrera; postura: Postura; y: number; vy: number; suelo: number | null; caidaRapida: boolean; recientes: Recientes }): Animacion;
  export interface Corredor {
    grupo: Group;
    animacion(): Animacion;
    actualizar(dt: number, s: Simulacion, recientes: Recientes): void;
    ponerArma(pistola: Object3D): void;
    reiniciar(): void;
  }
  ```

- [ ] **Paso 1: pruebas que fallan** de `elegirAnimacion`. El orden de prioridad es:
  1. `derrota` → `morir`;
  2. `fin` → `celebrar`;
  3. postura `foso` → `foso`;
  4. `trepando` → `trepar`;
  5. `colgado` → `colgado`;
  6. `rodando` → `rodar`;
  7. golpe reciente → `golpe`;
  8. escudo roto reciente → `escudo-roto`;
  9. en el aire (`y` sobre el suelo): caída rápida → `caer-rapido`; doble salto reciente → `doble-salto`; `vy > 4` → `despegar`; si no, `aire`;
  10. aterrizaje reciente → `aterrizar`;
  11. si no, `correr`.

  Las pruebas viejas se adaptan a la firma nueva.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **Mapa de clips:**
    - rodar = `Roll`, acelerado para que dure 0,7 s;
    - trepar = `ClimbUp_1m`, ajustado a 0,45 s, o a 0,8 s tras un golpe;
    - colgado = `Colgar_Loop`;
    - foso = `Hit_Knockback`;
    - escudo-roto = `Idle_Shield_Break`, solo en el torso y unos 0,5 s, con las piernas corriendo (misma técnica que la capa de pistola), porque el diseño pide que no deje de correr;
    - doble-salto = `NinjaJump_Start`;
    - celebrar = `Yes`;
    - caer-rapido = `Jump_Loop` con el cuerpo inclinado hacia adelante (unos 0,35 rad).
  - **Una vez:** `rodar`, `trepar`, `foso`, `doble-salto` y `celebrar` se reproducen una vez y se quedan en el último cuadro, igual que `morir`.
  - **Capa de pistola:** con `armado`, las piernas siguen `Sprint_Loop` filtrado a los huesos que no cuelgan de `spine_01`. Torso y brazos (`spine_01` y sus hijos) toman `Pistol_Aim_Neutral` en bucle, y `Pistol_Shoot` una vez con cada disparo reciente. Al perder el arma vuelve a `Sprint_Loop` completo, con mezcla de 0,12 s.
  - **La pistola:** `ponerArma` la cuelga de `hand_r`, y solo se ve con `armado`.
  - **Altura:** `grupo.position.y = s.y`, que también puede ser negativo en un foso.
- [ ] **Paso 4:** correr. Esperado: PASA. Si al verlo en la Tarea 11 `Yes` no se lee como celebración, cambiar a `Dance_Loop` (sumarlo en la Tarea 1) y anotar la decisión en el ledger. Commit.

### Tarea 9: la escena con los obstáculos nuevos

**Archivos:** modificar `src/mundo/tierra-baldia/pista.ts`, `src/mundo/tierra-baldia/pista.test.ts`, `src/camara/camara-juego.ts`, `src/camara/camara-juego.test.ts`.

**Interfaces:**
- `Pista` suma `usarDron(modelo: Object3D): void`. Toma la geometría y el material del dron de la utilería y arma un `InstancedMesh`.
- `CamaraJuego.actualizar` recibe el mismo `s`. Para seguir el salto en 3D usa `max(0, s.y)`, así que no baja al foso.

- [ ] **Paso 1: pruebas que fallan.**
  - `pista.test.ts`:
    - una función pura nueva, `puntaCable(pivote: [number, number], largo: number, mano: [number, number] | null): [number, number]`, devuelve el extremo de abajo del cable: la mano del corredor mientras cuelga (`mano` no nulo) y `largo` metros recto hacia abajo si no;
    - `MAX` cubre al menos 8 vigas, 6 contenedores, 4 fosos, 3 cables, 12 drones y 16 balas.
  - `camara-juego.test.ts`: con `y = −2` la cámara de 3D queda a la misma altura que con `y = 0`.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: implementar,** todo con `InstancedMesh` y los colores de la paleta de la Tierra baldía:
  - **viga:** tubo de metal oxidado o cartel caído que cruza la carretera a 1,1 m, sostenido por dos postes;
  - **contenedor:** caja corrugada de 2 m de alto y `largo` de largo, en óxido o en los tintes de la paleta;
  - **foso:** un hueco de verdad en la carretera y la arena. Se marca el hueco en el *stencil* antes del suelo, el suelo no se dibuja ahí y el interior es una caja oscura vista por dentro, con bordes de asfalto roto;
  - **cable:** un poste de grúa con brazo, y un cable (línea o cilindro fino) desde el pivote hasta la mano del corredor mientras cuelga;
  - **estación de armas:** panel con la luz celeste de la torre (`torreLuz`) y la pistola de la utilería girando;
  - **dron:** flota con un leve vaivén y, al derribarlo, desaparece con un destello breve;
  - **EMP:** líneas celestes verticales que parpadean (sin destellos con movimiento reducido);
  - **balas:** trazos celestes cortos.
  La sombra de contacto del corredor sigue al suelo (2 encima de un contenedor) y se oculta sobre un foso.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit (se ve en el navegador en la Tarea 11).

### Tarea 10: el tramo 1 rehecho

**Archivos:** modificar `src/datos/niveles/tierra-baldia-1.ts`, `src/datos/niveles/tierra-baldia-1.test.ts`.

**Interfaces:**
- Produce `TIERRA_BALDIA_1` con `largo` entre 500 y 600 y el `id` `'tierra-1'`.
- Lleva una pista por cada movimiento: `pista: 'rodar'` en la primera viga, `'caer'` en la primera valla alta seguida de una viga, `'trepar'` en el primer contenedor y `'cable'` en el primer cable.

- [ ] **Paso 1: pruebas que fallan.**
  - `validarNivel(TIERRA_BALDIA_1)` es `[]`.
  - El tramo tiene al menos uno de cada tipo nuevo, dos fosos con cable y la zona de armas con 8 drones o más.
  - **El tramo se puede pasar.** Un piloto escrito en la misma prueba juega el tramo con la simulación real. En cada paso mira `objetos()` y hace el movimiento justo a tiempo:
    - salta vallas y fosos cortos;
    - rueda bajo vigas y drones que no puede derribar;
    - salta contra contenedores;
    - salta al cable y suelta en `u = 0,8`;
    - cambia de carril ante bloques;
    - dispara a los drones de su carril.
    Llega a `fin` con 3 vidas, sin eventos `golpe`, `foso` ni `escudo-roto`, a la velocidad real.
  - Cada movimiento aparece primero solo, con su pista: entre el evento con `pista` y el siguiente obstáculo de otro tipo hay al menos 15 m.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3: escribir el tramo con el orden del diseño (sección 6).** Los metros son de referencia; se ajustan para que pase el piloto y se sienta justo.
  1. **0–100 m, 2D:** las vallas de la etapa 2 y el doble salto.
  2. **100–190 m, 2D:** tres vigas (la primera con `pista: 'rodar'`); dos combinaciones de valla alta y viga (la primera con `'caer'`); dos contenedores de 6 m (el primero con `'trepar'`); un foso de 3 m.
  3. **Unos 200 m:** portal a 3D.
  4. **210–300 m, 3D:** bloques, vigas, contenedores en uno o dos carriles, un foso corto, escudo y turbo.
  5. **Unos 310 m:** arma. **320–390 m:** drones en carriles alternados, cada 7 a 8 m. **Unos 400 m:** EMP.
  6. **Unos 420 m:** portal a 2D.
  7. **430–560 m, 2D:** foso de 12 m con cable (`'cable'`), mezcla de vallas, vigas y un contenedor, un segundo foso con cable y cierre con vallas.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 11: la carrera conectada (HUD, pistas, avisos y "¡Justo!")

**Archivos:**
- Modificar: `src/juego/carrera.ts`, `src/juego/carrera.test.ts`, `src/interfaz/pantallas/juego.ts`, `src/interfaz/iconos.ts`, `src/interfaz/componentes.css`, `src/textos/es.ts`, `src/nucleo/modo-prueba.ts`, `src/main.ts`, `tests/navegador/juego.spec.ts`.

**Interfaces:**
- Consume todo lo anterior.
- Produce:
  ```ts
  export type PistaHud = 'saltar' | 'carril' | 'rodar' | 'caer' | 'trepar' | 'cable' | 'disparar' | null;
  export interface HudCarrera {
    reiniciar(): void;
    actualizar(d: { vidas: number; puntaje: number; avance: number }): void;
    pista(cual: PistaHud): void;
    terminar(r: ResultadoCarrera): void;
    justo(puntos: number, en: { x: number; y: number }): void; // en píxeles CSS
    arma(visible: boolean): void;
  }
  // DepsCarrera suma:
  proyectarCorredor(): { x: number; y: number }; // la cabeza del corredor en píxeles CSS
  // EstadoJuego suma:
  postura: Postura; armado: boolean;
  ```
- `Carrera.accion(i)`:
  - `tocar` → colgado: `soltar`; armado: `disparar`; si no, `saltar`;
  - `saltar` → colgado: `soltar`; si no, `saltar`;
  - `rodar` → `rodar`;
  - `disparar` → `disparar`;
  - `izquierda` y `derecha` → `cambiarCarril`.
- Textos nuevos en `TEXTOS.juego`:
  - pistas: `pistaRodar` 'Desliza hacia abajo para rodar', `pistaCaer` 'En el aire, desliza hacia abajo para caer rápido', `pistaTrepar` 'Salta contra el muro para trepar', `pistaCable` 'Salta al cable y toca para soltarte', `pistaDisparar` 'Toca para disparar · desliza arriba para saltar';
  - avisos: `armaLista` 'Arma lista: toca para disparar', `emp` 'Pulso EMP: perdiste el arma';
  - `justo` '¡Justo! +{n}' y `arma` 'Arma';
  - consejo de carga: 'Desliza hacia abajo para rodar.'

- [ ] **Paso 1: pruebas que fallan.**
  - **`carrera.test.ts`:**
    - cada pista de nivel (`rodar`, `caer`, `trepar`, `cable`) aparece cuando su evento está a 35 m o menos;
    - se va con su movimiento (`rodar`, `caida-rapida`, `trepar`, `soltar`);
    - la siguiente reemplaza a la anterior;
    - nunca hay dos pistas;
    - `arma` muestra el aviso, la pista `disparar` y `hud.arma(true)`;
    - el primer `disparo` quita esa pista;
    - `emp` muestra su aviso y llama a `hud.arma(false)`;
    - `justo` llama a `hud.justo(50, …)` con lo que da `proyectarCorredor`;
    - caer a un foso sacude la cámara y vibra como un golpe;
    - el mapeo de `accion` sigue la tabla de arriba;
    - el corredor recibe `Recientes` con el golpe, el escudo roto, el doble salto y el disparo de los últimos momentos.
  - **`juego.spec.ts`,** en escritorio y celular, con `?prueba=1&calidad=bajo` y las posiciones leídas de `TIERRA_BALDIA_1`:
    1. Deslizar hacia abajo sobre el lienzo pone `rodar`. La pista "Desliza hacia abajo para rodar" aparece antes de la primera viga y se va al rodar. Rodando se pasa la viga con 3 vidas.
    2. Con `desde` antes del primer contenedor, saltar a tiempo deja al corredor encima (`y ≈ 2`) con 3 vidas.
    3. Con `desde` antes del primer cable, saltar lo agarra (`postura` es `colgado`). Un toque lo suelta y pasa el foso con 3 vidas.
    4. Con `desde` antes del arma: sale el aviso "Arma lista", se ve el indicador de arma y un toque dispara (`disparo`). Un dron en el carril cae. Después del EMP el indicador se va.
    5. Un "¡Justo!" muestra el letrero y suma 50.
    6. Salir armado o colgado y volver a entrar empieza sin arma, `corriendo`, sin el indicador y sin pistola visible (punto 5 de la revisión).
    7. Perder la última vida en un foso muestra el panel de derrota (punto 3 de la revisión).
    8. En la zona de drones, `render().llamadas` ≤ 150, y no hay errores en la consola en ninguna prueba.
- [ ] **Paso 2:** `npx vitest run src/juego` y `npx playwright test tests/navegador/juego.spec.ts --project=escritorio`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **La pista de cada evento:** `carrera.ts` mira `objetos()` cada paso.
  - **HUD:**
    - el indicador de arma es un chip claro con el ícono `crosshair` de Tabler (agregarlo a `iconos.ts` y a la lista de Tabler en `CREDITOS.md`), junto a las vidas;
    - el letrero "¡Justo!" es texto en Barlow Condensed que sube y se desvanece en 0,6 s sobre la cabeza del corredor (sin moverse con movimiento reducido) y no recibe toques.
  - **`main.ts`:**
    - carga la utilería en una tarea nueva de la carga (`utileria`, peso 1);
    - llama a `corredor.ponerArma(pistola)` y a `pista.usarDron(dron)`;
    - pasa `proyectarCorredor` (la cabeza del corredor a 1,9 m, proyectada con la cámara de la carrera).
  - **`modo-prueba.ts`:** `accion(a: Intencion)` ya acepta las intenciones nuevas.
  - **`es.ts`:** los textos de arriba. `carga.consejos` suma el consejo nuevo.
- [ ] **Paso 4:**
  - Correr `juego.spec.ts` en escritorio, celular e iphone, y después `npm run verificar` completo. Esperado: todo en verde.
  - Abrir la carrera en el panel (5331) y revisar la consola.
  - Capturas en celular horizontal: rodando bajo una viga, encima de un contenedor, colgado del cable, disparando a un dron y el "¡Justo!".
- [ ] **Paso 5:** commit.

### Tarea 12: documentación, sitio y cierre

**Archivos:** modificar `LEEME.md`, `CREDITOS.md`, `scripts/armar-sitio.mjs`, `tests/navegador/sitio.spec.ts`.

- [ ] **Paso 1: prueba que falla** en `sitio.spec.ts`:
  - `/avance/modelos/utileria.glb` responde 200 y empieza con "glTF";
  - `LICENCIAS.txt` nombra "Universal Animation Library 2".
- [ ] **Paso 2:** `npm run sitio` y luego `npx playwright test --project=sitio`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - `armar-sitio.mjs`: la entrada de Quaternius en `LICENCIAS.txt` nombra UAL1 y UAL2, y una línea dice que la pistola, el dron y `Colgar_Loop` son propios.
  - `LEEME.md`:
    - la tabla de controles nueva;
    - cómo rehacer el corredor (con las tres rutas) y la utilería con Blender;
    - las carpetas nuevas.
- [ ] **Paso 4:** `npm run verificar`. Esperado: todo en verde. Commit.
