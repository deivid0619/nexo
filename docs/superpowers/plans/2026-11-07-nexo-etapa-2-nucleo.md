# NEXO etapa 2 "Núcleo jugable": plan de construcción

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Meta:** desde el mapa de la torre, "Entrar al portal" del piso 1 abre una carrera jugable por la Tierra baldía: correr, saltar, cambiar de carril, cruzar un portal que gira la cámara de 2D a 3D, perder vidas con los obstáculos y terminar el tramo, con un personaje 3D animado (CC0) en lugar de cubos.

**Arquitectura:** la lógica del juego es TypeScript puro y probado (`src/juego/`): una simulación por pasos que no conoce Three.js. El nivel es un archivo de datos validado (`src/datos/niveles/`). La entrada convierte toques y teclas en intenciones (`src/entrada/`). La escena de la carrera es una `Scene` aparte (`src/mundo/tierra-baldia/pista.ts`) que comparte el renderizador; el personaje es un GLB con esqueleto y animaciones mezcladas (`src/entidades/corredor.ts`). `main.ts` decide qué escena y qué cámara se dibujan.

**Herramientas:** lo de la etapa 1 (three 0.187, vite 8, typescript 7, vitest 5, playwright 1.65) más, solo para desarrollo, `@gltf-transform/core`, `@gltf-transform/functions`, `@gltf-transform/extensions` y `meshoptimizer` para preparar el modelo.

**Documento de diseño:** `docs/superpowers/specs/2026-11-06-nexo-design.md` (secciones 4, 5, 7 y 10). **Mecánicas de referencia:** `prototipo/juego.js` (números de salto, carriles, choques y cámara).

**Fuera de esta etapa:** personaje final con ropa y sus 12 animaciones (3), criaturas, armas, EMP, punto de control y jefe (4), registros y radio (5), pausa, resultados, ajustes, sonido y créditos en pantalla (7).

## Restricciones globales

- Todo lo de la etapa 1 sigue vigente: español, textos solo en `src/textos/es.ts`, sistema de diseño de `tokens.css`, movimiento reducido, puertos 5331/5332/5330 (nunca 5173, 5180, 8000, 8001, 3000, 5432, 5190, 8090), repositorio público sin secretos ni rutas personales, licencias CC0 o CC-BY con crédito.
- Rama `etapa-2-nucleo` desde `main`. Commit local por tarea; **no se sube nada** sin el visto bueno de David.
- Cada mensaje de commit termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Antes de cada commit que toque una pantalla o la escena: abrirla en el navegador del panel y revisar la consola.
- Los archivos descargados quedan fuera del repo (`Descargas/recursos-nexo/`). Los scripts reciben la ruta por argumento; ninguna ruta personal entra al repo.
- El modelo del corredor sale de **Universal Animation Library (Standard) de Quaternius, CC0**. Va en `CREDITOS.md`.
- Números del juego (del prototipo, en metros y segundos): gravedad 24; salto 8,5; doble salto 8; carriles en z = −1,6 / 0 / 1,6 con suavizado 12/s; velocidad 9 m/s que sube 0,006 por metro hasta 12, turbo 15; 3 vidas; 1,4 s sin daño tras un golpe; escudo 10 s, turbo 3 s, doble salto 10 s.
- Controles (documento, sección 4): tocar salta; deslizar hacia arriba salta; deslizar a los lados cambia de carril (solo en 3D); teclado: espacio, flecha arriba o W saltan, flechas o A/D cambian de carril. Un deslizamiento cuenta desde 40 px.
- Rendimiento: la escena de la carrera dibuja como máximo 150 llamadas por cuadro en calidad alta; el corredor GLB pesa como máximo 1,5 MB.

## Puntos a vigilar en la revisión

1. **Toques mientras la cortina o una pantalla está en transición, y doble toque en "Entrar al portal".** Se abre una sola carrera y una sola entrada de historial. Prueba en la Tarea 8.
2. **Salir de la carrera con atrás del navegador, Escape o el botón Salir a mitad de un salto o de un giro de cámara.** Vuelve al mapa, la escena del menú se ve entera y una carrera nueva empieza limpia (vidas 3, distancia 0, modo 2D). Prueba en la Tarea 8.
3. **Pestaña oculta o celular girado a vertical durante la carrera.** Al volver no hay un salto de tiempo que mate al jugador: la simulación no avanza mientras la pestaña está oculta o el aviso de girar está visible. Prueba en la Tarea 8.
4. **Nivel mal escrito** (desordenado, tres carriles bloqueados a la vez, bloque en tramo 2D, portal al mismo modo). La validación lo rechaza con un mensaje que dice qué evento falla. Prueba en la Tarea 2.
5. **Contexto WebGL perdido durante la carrera** (iOS al cambiar de app). La carrera se detiene con el velo de "recuperando" y sigue al volver, sin errores. Prueba en la Tarea 8.

---

## Mapa de archivos

```
scripts/preparar-corredor.mjs        UAL1_Standard.glb → public/modelos/corredor.glb (clips elegidos, comprimido)
public/modelos/corredor.glb          maniquí CC0 con 7 animaciones
src/datos/niveles/tipos.ts           tipos del nivel
src/datos/niveles/validar.ts         validarNivel()
src/datos/niveles/tierra-baldia-1.ts el primer tramo de la Tierra baldía
src/juego/simulacion.ts              crearSimulacion(): estado y reglas de la carrera
src/entrada/controles.ts             toques y teclas → intenciones
src/camara/camara-juego.ts           cámara lateral (2D) ↔ detrás (3D)
src/entidades/corredor.ts            carga del GLB, mezcla de animaciones
src/mundo/tierra-baldia/pista.ts     escena de la carrera: carretera, ruinas, obstáculos, portal
src/interfaz/cortina.ts              fundido a negro entre la escena del menú y la de la carrera
src/interfaz/pantallas/juego.ts      HUD y avisos de fin (derrota, tramo superado)
tests/navegador/juego.spec.ts        la carrera en el navegador
```

Se modifican: `src/main.ts`, `src/nucleo/modo-prueba.ts`, `src/nucleo/preferencias.ts`, `src/interfaz/gestor-pantallas.ts`, `src/interfaz/iconos.ts`, `src/interfaz/componentes.css`, `src/interfaz/tokens.css`, `src/textos/es.ts`, `src/carga/` (tareas nuevas), `package.json`, `CREDITOS.md`, `LEEME.md`, `scripts/armar-sitio.mjs`.

---

### Tarea 1: el corredor GLB (CC0) listo para el celular

**Archivos:** crear `scripts/preparar-corredor.mjs`, `public/modelos/corredor.glb`, `src/entidades/modelo.test.ts`; modificar `package.json` (devDependencies y script `modelos:corredor`), `CREDITOS.md`.

**Interfaces:**
- Produce: `public/modelos/corredor.glb` con una malla con esqueleto y los clips `Idle_Loop`, `Sprint_Loop`, `Jump_Start`, `Jump_Loop`, `Jump_Land`, `Hit_Chest`, `Death01` (nombres originales). Comprimido con `EXT_meshopt_compression`, así que el cargador necesita `MeshoptDecoder`.
- Produce: `npm run modelos:corredor -- <ruta a UAL1_Standard.glb>`.

- [ ] **Paso 1: prueba que falla.** `modelo.test.ts` (entorno node) lee el GLB con `node:fs`, parte el encabezado binario y revisa:
  - pesa 1,5 MB o menos;
  - tiene exactamente esos 7 nombres de animación;
  - tiene una sola `skin`;
  - declara `EXT_meshopt_compression` en `extensionsUsed`.
- [ ] **Paso 2:** `npx vitest run src/entidades/modelo.test.ts`. Esperado: FALLA porque el archivo no existe.
- [ ] **Paso 3:** instalar las devDependencies e implementar el script con `NodeIO`. El script:
  - borra las otras animaciones;
  - aplica `prune`, `dedup`, `resample`, `quantize` y la compresión `meshopt` (`EXT_meshopt_compression`, con `MeshoptEncoder`);
  - escribe `public/modelos/corredor.glb`.
  Se corre con la ruta del archivo descargado, sin dejarla en el código.
- [ ] **Paso 4:** correr el script y luego la prueba. Esperado: PASA. Anotar en el ledger el peso real.
- [ ] **Paso 5:** `CREDITOS.md`, sección "Modelos": "Maniquí y animaciones: Universal Animation Library (Standard), Quaternius, CC0, https://quaternius.com/packs/universalanimationlibrary.html, recortado y comprimido con scripts/preparar-corredor.mjs". Commit.

### Tarea 2: el nivel como datos, con validación

**Archivos:** crear `src/datos/niveles/tipos.ts`, `validar.ts`, `validar.test.ts`, `tierra-baldia-1.ts`, `tierra-baldia-1.test.ts`.

**Interfaces:**
- Produce `tipos.ts`:
  ```ts
  export type Modo = 2 | 3;
  export type Carril = -1 | 0 | 1;
  export type Habilidad = 'escudo' | 'turbo' | 'doble';
  export type Evento =
    | { en: number; tipo: 'valla'; alto?: 0.7 | 1.1 }
    | { en: number; tipo: 'bloque'; carril: Carril }
    | { en: number; tipo: 'habilidad'; clase: Habilidad; carril?: Carril }
    | { en: number; tipo: 'portal'; a: Modo };
  export interface Nivel { id: string; largo: number; eventos: Evento[] }
  ```
- Produce `validarNivel(n: Nivel): string[]`, que devuelve los problemas (vacío = válido). Cada mensaje nombra el índice y el tipo del evento.
- Produce `TIERRA_BALDIA_1: Nivel` (todo nivel empieza en 2D).

- [ ] **Paso 1: pruebas que fallan** en `validar.test.ts`, una por regla:
  1. Eventos fuera de orden o con `en` fuera de (0, largo) → problema.
  2. `bloque` en un tramo 2D → problema.
  3. `habilidad` en 3D sin carril, o en 2D con carril → problema.
  4. Tres `bloque` cuyos `en` caen a 1 m o menos entre sí, en carriles distintos → problema ("sin carril libre").
  5. `portal` al mismo modo en que ya se está → problema.
  6. Un nivel válido mínimo → `[]`.
  En `tierra-baldia-1.test.ts`: `validarNivel(TIERRA_BALDIA_1)` da `[]`, el largo está entre 300 y 450, y hay al menos un portal a 3D y uno de vuelta a 2D.
- [ ] **Paso 2:** correr. Esperado: FALLA (no existe el módulo).
- [ ] **Paso 3:** implementar.
  - `validarNivel` recorre los eventos en orden llevando el modo actual.
  - `TIERRA_BALDIA_1` adapta los tramos 1 a 3 de `armarNivel()` del prototipo **sin** arma, drones ni EMP (llegan en la etapa 4): 2D hasta el portal de ~85 m, 3D con bloques y habilidades, portal de vuelta a 2D, vallas finales, largo ~380 m.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 3: la simulación de la carrera

**Archivos:** crear `src/juego/simulacion.ts`, `src/juego/simulacion.test.ts`.

**Interfaces:**
- Consume `Nivel`, `Modo`, `Carril` y `Habilidad` (Tarea 2).
- Produce:
  ```ts
  export type EstadoCarrera = 'corriendo' | 'derrota' | 'fin';
  export interface Simulacion {
    readonly estado: EstadoCarrera;
    readonly distancia: number;   // metros recorridos
    readonly velocidad: number;
    readonly modo: Modo;
    readonly carril: Carril;
    readonly z: number;           // posición lateral suavizada
    readonly y: number;           // altura del salto
    readonly vy: number;
    readonly vidas: number;
    readonly invulnerable: number; // segundos que quedan
    readonly habilidades: Record<Habilidad, number>; // segundos que quedan
    readonly puntaje: number;
    /** Objetos vivos con su x relativa al jugador (x = en − distancia). */
    objetos(): readonly ObjetoPista[];
    paso(dt: number): EventoSim[];
    saltar(): void;
    cambiarCarril(d: -1 | 1): void;
  }
  export interface ObjetoPista { id: number; evento: Evento; x: number; roto: boolean }
  export type EventoSim =
    | { tipo: 'salto' | 'doble-salto' | 'aterrizaje' | 'carril' | 'derrota' | 'fin' }
    | { tipo: 'golpe' | 'escudo-roto' }
    | { tipo: 'portal'; a: Modo }
    | { tipo: 'habilidad'; clase: Habilidad }
    | { tipo: 'roto'; id: number };
  export function crearSimulacion(nivel: Nivel, opciones?: { desde?: number; sinDanio?: boolean }): Simulacion;
  ```
  `desde` aplica los portales anteriores, como el prototipo. Los objetos aparecen 75 m antes y se van 14 m después.

- [ ] **Paso 1: pruebas que fallan** (con niveles chicos hechos en la prueba, `paso(1/60)` en bucle):
  - corre: la distancia sube a la velocidad; la velocidad sube 0,006/m hasta 12;
  - salto: `y` sube y vuelve a 0 en ~0,71 s; un segundo `saltar()` en el aire no hace nada sin doble salto y sí con él;
  - carril: en 2D `cambiarCarril` no hace nada; en 3D cambia y se queda en −1..1; `z` llega a `carril*1,6`;
  - una valla sin saltar quita 1 vida, emite `golpe` y da 1,4 s de invulnerabilidad; saltándola no pasa nada; una valla de 1,1 necesita salto;
  - un bloque en otro carril no golpea, en el mismo sí;
  - escudo: absorbe un golpe (`escudo-roto`) sin quitar vida; turbo: rompe obstáculos (`roto`, +30 puntos) y sube la velocidad a 15;
  - portal: al pasar `x ≤ 0` cambia `modo` y emite `portal`; al volver a 2D el carril vuelve a 0;
  - 3 golpes → `derrota` y la simulación deja de avanzar; llegar a `largo` → `fin`;
  - `desde: 120` empieza en 3D si hay un portal antes; `sinDanio` nunca quita vidas;
  - puntaje = metros enteros + bonos (habilidad +25, roto +30).
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar con los números de "Restricciones globales". Las cajas de choque son las del prototipo (`actualizar()`):
  - valla: |x| < 0,32 y y < alto − 0,05;
  - bloque: |x| < 0,75, |z − carril·1,6| < 0,95 y y < 1,45;
  - habilidad: |x| < 0,8 y (2D o el mismo carril).
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 4: controles

**Archivos:** crear `src/entrada/controles.ts`, `src/entrada/controles.test.ts` (happy-dom).

**Interfaces:**
- Produce:
  ```ts
  export type Intencion = 'saltar' | 'izquierda' | 'derecha';
  export function crearControles(superficie: HTMLElement, ventana: Window, alIntentar: (i: Intencion) => void): { activar(): void; desactivar(): void; destruir(): void };
  ```
  Los gestos se leen con eventos `pointer` en la superficie y las teclas con `keydown` en la ventana (sin `e.repeat`).
- [ ] **Paso 1: pruebas que fallan.**
  - Toque corto → `saltar`.
  - Deslizar 60 px a la derecha → `derecha`.
  - Deslizar 60 px hacia arriba → `saltar`.
  - 30 px no es deslizamiento, así que también es `saltar`.
  - Diagonal con más vertical que horizontal hacia arriba → `saltar`.
  - Teclas: espacio, ArrowUp y W → `saltar`; ArrowLeft y A → `izquierda`; ArrowRight y D → `derecha`. Espacio llama `preventDefault`.
  - Desactivado no emite nada.
  - `pointercancel` no emite.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 5: la cámara de la carrera

**Archivos:** crear `src/camara/camara-juego.ts`, `src/camara/camara-juego.test.ts`.

**Interfaces:**
- Produce:
  ```ts
  export function crearCamaraJuego(camara: PerspectiveCamera, opciones: { movimientoReducido: boolean }): {
    actualizar(dt: number, s: { modo: Modo; z: number; y: number }, aspecto: number): void;
    sacudir(fuerza: number): void;
    mezcla(): number; // 0 = lateral (2D), 1 = detrás (3D)
    reiniciar(modo: Modo): void;
  };
  ```
- [ ] **Paso 1: pruebas que fallan.**
  - `mezcla()` va de 0 a 1 tras un portal a 3D, con el suavizado del prototipo (`k += (meta − k)·min(1, dt·2,4)`). Pasa 0,9 en menos de 1,5 s.
  - En 2D la cámara queda del lado (+z) mirando el carril.
  - En 3D queda detrás (x < 0), más alta que el jugador y mirando hacia +x.
  - `sacudir` mueve la cámara y se apaga sola. Con `movimientoReducido` no la mueve.
  - `reiniciar(2)` deja la mezcla en 0 al instante.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar con las posiciones de `camara()` del prototipo, usando `smoothstep` sobre la mezcla:
  - 2D: posición (3,5, 2,2, 22) y mira (3,5, 1,6, 0); el fov sale del ancho visible de 15 m.
  - 3D: posición (−5,5, 3,4, 0,6·z) y mira (7, 1,2, 0,4·z); fov 62.
  Además, la cámara sigue la altura del salto a la mitad, como en el prototipo.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit.

### Tarea 6: el corredor animado

**Archivos:** crear `src/entidades/corredor.ts`, `src/entidades/corredor.test.ts`.

**Interfaces:**
- Consume `public/modelos/corredor.glb` (Tarea 1) y el estado de la `Simulacion` (Tarea 3).
- Produce:
  ```ts
  export type Animacion = 'quieto' | 'correr' | 'despegar' | 'aire' | 'aterrizar' | 'golpe' | 'morir';
  export function elegirAnimacion(s: { estado: EstadoCarrera; y: number; vy: number; golpeReciente: boolean; aterrizajeReciente: boolean }): Animacion;
  export interface Corredor { grupo: Group; animacion(): Animacion; actualizar(dt: number, s: Simulacion, golpeReciente: boolean, aterrizajeReciente: boolean): void }
  export function cargarCorredor(url: string, paleta: PaletaExterior, renderer: WebGLRenderer): Promise<Corredor>;
  ```
- [ ] **Paso 1: pruebas que fallan** de `elegirAnimacion` (función pura):
  - derrota → `morir`;
  - golpe reciente → `golpe`;
  - en el aire subiendo rápido (vy > 4) → `despegar`;
  - en el aire → `aire`;
  - aterrizaje reciente → `aterrizar`;
  - en el suelo corriendo → `correr`;
  - `fin` → `quieto`.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar.
  - `GLTFLoader` con `setMeshoptDecoder(MeshoptDecoder)`.
  - Un `AnimationMixer` con mezcla de 0,12 s entre clips. `morir` y `aterrizar` se reproducen una vez y se quedan en el último cuadro.
  - Mapa de clips: quieto = `Idle_Loop`, correr = `Sprint_Loop` (su velocidad acompaña la de la carrera), despegar = `Jump_Start`, aire = `Jump_Loop`, aterrizar = `Jump_Land`, golpe = `Hit_Chest`, morir = `Death01`.
  - Al cambiar de carril, el cuerpo se inclina (rotación z ≤ 0,25 rad, solo visual).
  - Los materiales del maniquí toman los colores de la paleta (`abrigo` y `pantalon`).
  - Proyecta sombra, mide 1,75 m de alto y mira hacia +x.
  - Durante la invulnerabilidad parpadea, como en el prototipo.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit (se ve en el navegador en la Tarea 8).

### Tarea 7: la escena de la carrera en la Tierra baldía

**Archivos:** crear `src/mundo/tierra-baldia/pista.ts`, `src/mundo/tierra-baldia/pista.test.ts`; modificar `src/mundo/tierra-baldia/torre.ts` solo si hace falta poder moverla.

**Interfaces:**
- Produce:
  ```ts
  export interface Pista {
    escena: Scene;
    pasos: PasoConstruccion[];                 // para la pantalla de carga
    actualizar(dt: number, t: number, s: Simulacion): void;
    reiniciar(): void;
    llamadasMaximas: number;                   // 150
  }
  export function crearPista(calidad: Calidad, azar: () => number): Pista;
  export function posicionDecorado(baseX: number, distancia: number, largoCiclo: number): number; // reciclado, función pura
  ```
- [ ] **Paso 1: pruebas que fallan** de `posicionDecorado`:
  - el decorado se recicla dentro de [−40, largoCiclo − 40);
  - avanza hacia −x a la velocidad de la carrera;
  - nunca hay saltos al dar la vuelta, salvo por el borde del ciclo.
- [ ] **Paso 2:** correr. Esperado: FALLA.
- [ ] **Paso 3:** implementar.
  - **Escena:** con `TIERRA_BALDIA` (paleta del menú). El cielo y la bruma salen de `crearCielo`, y la sombra del sol sigue al jugador. El suelo es arena.
  - **Carretera:** rota, de 5,4 m de ancho, en tramos de 20 m reciclados, con marcas de carril que solo se ven en 3D (opacidad = `mezcla()`).
  - **Ruinas a los lados:** con `InstancedMesh`, recicladas con `posicionDecorado`.
  - **La torre:** lejos hacia +x (por ejemplo x = 900, z = −200), visible en 2D y en 3D; es la meta visible.
  - **Obstáculos** (con un grupo reservado por tipo, sin crear mallas nuevas por cuadro):
    - valla = barrera de concreto baja (0,7) o alta (1,1);
    - bloque = carro oxidado, reutilizando la forma de `utileria.ts`;
    - habilidad = cápsula flotante del color de cada una: escudo celeste `#7FD6DC`, turbo ámbar, doble salto blanco cálido;
    - portal = anillo vertical con el celeste de la torre (`#A6E8EC`) que late.
  - **Sombras y rendimiento:** todo con sombras de contacto. Las llamadas de dibujo quedan en 150 o menos.
- [ ] **Paso 4:** correr. Esperado: PASA. Commit (se mira en la Tarea 8).

### Tarea 8: la pantalla de la carrera conectada al juego

**Archivos:**
- Crear: `src/interfaz/cortina.ts`, `src/interfaz/pantallas/juego.ts`, `tests/navegador/juego.spec.ts`.
- Modificar: `src/main.ts`, `src/interfaz/gestor-pantallas.ts` (`IdPantalla` suma `'juego'`; la `toma` pasa a ser opcional y, sin toma, no mueve la cámara del menú), `src/nucleo/modo-prueba.ts`, `src/nucleo/preferencias.ts` (`desde`, `dios`), `src/interfaz/componentes.css`, `src/interfaz/tokens.css`, `src/interfaz/iconos.ts`, `src/textos/es.ts`, `src/carga/` (las tareas `corredor` y `pista` en la carga del arranque).

**Interfaces:**
- Consume todo lo anterior.
- `ApiPrueba` suma:
  ```ts
  juego(): { estado: EstadoCarrera; distancia: number; modo: Modo; carril: Carril; y: number; vidas: number; puntaje: number; animacion: Animacion; mezcla: number } | null;
  accion(a: Intencion): void;
  ```
- `?desde=<metros>` y `?dios=1` solo valen con `?prueba=1`.

- [ ] **Paso 1: pruebas que fallan** en `juego.spec.ts` (todas con `?prueba=1&calidad=bajo`):
  1. **Entrar:** en el mapa con el piso 1 elegido, "Entrar al portal" abre `juego`, con 3 vidas, distancia 0, modo 2 y sin errores en la consola. Un doble toque abre una sola carrera.
  2. **Saltar:** tocar el lienzo hace saltar (`y > 0` después de `avanzar(0.2)`) y la animación pasa a `despegar` o `aire`.
  3. **Portal:** con `desde=80`, al avanzar 2 s el modo pasa a 3 y la mezcla de la cámara a más de 0,9. Deslizar a la derecha cambia el carril a 1.
  4. **Daño:** chocar una valla sin saltar baja a 2 vidas. Tres golpes muestran el aviso de derrota con "Reintentar" y "Volver al mapa". Reintentar deja 3 vidas y distancia 0.
  5. **Fin:** con `desde` cerca del final y `dios=1`, se ve "Tramo superado" con el puntaje y el récord del piso guardado en el progreso.
  6. **Salir:** Escape, atrás del navegador y el botón Salir vuelven al mapa (`torre`) en medio de un salto. La carrera siguiente empieza limpia.
  7. **Pausa forzada:** con la pestaña oculta (`document.visibilityState` simulado) o el aviso de girar visible, `avanzar(2)` no cambia la distancia.
  8. **Contexto perdido:** con `loseContext` durante la carrera aparece el velo; al restaurar, la carrera sigue sin errores.
  9. **Rendimiento:** `render().llamadas` ≤ 150 durante la carrera.
  10. **Piso 2:** "Entrar al portal" en Cristal sigue mostrando el aviso de próxima etapa.
- [ ] **Paso 2:** `npx playwright test tests/navegador/juego.spec.ts --project=escritorio`. Esperado: FALLA.
- [ ] **Paso 3: implementar.**
  - **Cortina:** fundido a negro de `--d-pantalla` (instantáneo con movimiento reducido). "Entrar al portal" cubre, cambia a la escena de la carrera y su cámara, abre `juego` apilado sobre `torre` y descubre. Salir hace lo mismo al revés.
  - **El bucle:** dibuja la escena activa y la simulación avanza solo en `juego`, con la pestaña visible y sin el aviso de girar.
  - **HUD:** paneles del sistema de diseño.
    - Arriba a la izquierda: botón Salir (ícono, 44 px o más) y 3 vidas con íconos.
    - Arriba a la derecha: el puntaje en Barlow Condensed y una barra fina celeste con el avance del tramo.
    - Abajo al centro: la pista "Toca para saltar", hasta el primer salto. Después del primer portal a 3D: "Desliza a los lados para cambiar de carril".
  - **Avisos** (con `crearAvisos`): portal, habilidad, escudo roto.
  - **Al terminar** (derrota o fin): un panel con el título, el puntaje y el récord. Botón principal "Reintentar" o "Repetir", y secundario "Volver al mapa". El récord del piso se guarda con `guardarProgreso` y se repinta el mapa.
  - **Golpes:** sacudida de la cámara y vibración (`navigator.vibrate(120)` si existe). Con movimiento reducido, sin sacudida.
  - **Textos:** todos en `TEXTOS.juego`. En el código no hay cadenas visibles.
- [ ] **Paso 4:** correr `juego.spec.ts` en escritorio, celular e iphone. Esperado: PASA. Después correr toda la suite (`npm run verificar`), que tiene que quedar en verde. Abrir la carrera en el panel (5331) y revisar la consola. Capturas en celular horizontal: 2D, giro del portal, 3D, derrota y tramo superado.
- [ ] **Paso 5:** commit.

### Tarea 9: documentación, sitio y cierre

**Archivos:** modificar `LEEME.md` (controles y opciones `?desde`, `?dios`), `CREDITOS.md`, `scripts/armar-sitio.mjs` (si el GLB necesita aviso de licencia: CC0 no lo exige, pero `LICENCIAS.txt` lo nombra), `tests/navegador/sitio.spec.ts` (que `/avance/modelos/corredor.glb` responda 200).

- [ ] **Paso 1: prueba que falla** en `sitio.spec.ts`: `/avance/modelos/corredor.glb` responde 200 y `LICENCIAS.txt` contiene "Quaternius".
- [ ] **Paso 2:** `npm run sitio` y luego `npx playwright test --project=sitio`. Esperado: FALLA.
- [ ] **Paso 3:** implementar y actualizar los documentos.
- [ ] **Paso 4:** `npm run verificar`. Esperado: todo en verde. Commit.
