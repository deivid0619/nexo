# NEXO

Corredor post-apocalíptico para celular: un sobreviviente sale del búnker y sube la torre del
Proyecto NEXO. Se corre en 2D, se cruza un portal y el juego pasa a 3D. Un jugador, jefes al
final de cada piso.

## Jugar

- **Prototipo** (el primer juego jugable): https://deivid0619.github.io/nexo/
- **Avance** (la etapa en construcción: carga, inicio, mapa de la torre y la primera carrera por la
  Tierra baldía, con rodar, trepar, el cable y la zona de armas): https://deivid0619.github.io/nexo/avance/

### Controles de la carrera

En el mapa de la torre, "Entrar al portal" en la Tierra baldía abre la carrera.

| Acción | Celular | Teclado |
|---|---|---|
| Saltar (y doble salto con la habilidad) | tocar o deslizar hacia arriba | espacio, flecha arriba o W |
| Rodar bajo una viga o un dron | deslizar hacia abajo | flecha abajo o S |
| Caída rápida (en el aire; termina rodando) | deslizar hacia abajo | flecha abajo o S |
| Trepar un contenedor | saltar contra él | como saltar |
| Soltarse del cable | tocar o deslizar hacia arriba | espacio, flecha arriba o W |
| Disparar (con el arma, en la zona de armas) | tocar (deslizar hacia arriba sigue saltando) | X |
| Cambiar de carril (solo en 3D) | deslizar a los lados | flechas izquierda y derecha, o A y D |
| Salir al mapa | botón Salir o atrás | Escape |

Un deslizamiento cuenta desde 40 px; menos que eso es un toque.

Cada cambio que llega a `main` se publica solo, y únicamente si las pruebas pasan
(`.github/workflows/publicar.yml`).

## Desarrollo

Se usa con Node 24 (el de la publicación automática) o más nuevo.

```bash
npm install
```

```bash
npm run dev
```

Abrir http://127.0.0.1:5331

**En el celular** (misma red Wi-Fi):

```bash
npm run dev:celular
```

En el celular abrir `http://IP-DEL-COMPUTADOR:5331` (la IP sale con `ipconfig`, "Dirección IPv4").
Si Windows pregunta por el firewall, permitir redes privadas.

**Pruebas:**

```bash
npm test
```

```bash
npm run test:navegador
```

`npm test` corre las pruebas de la lógica (Vitest). `npm run test:navegador` abre el juego en
Chromium de escritorio, Chromium de celular, WebKit (como el iPhone) y el sitio armado (Playwright).
`npm run verificar` corre las dos.

La comparación con la maqueta aprobada se corre a mano porque necesita internet:

```bash
npx playwright test --grep @paridad --project=escritorio
```

**Armar el sitio como queda publicado** (prototipo en la raíz y la etapa en `/avance/`):

```bash
npm run sitio
```

```bash
npm run sitio:servir
```

Abrir http://127.0.0.1:5332/avance/

### Rehacer el corredor y la utilería

`public/modelos/corredor.glb` junta *Universal Animation Library* 1 y 2 (Standard) de Quaternius,
CC0 (https://quaternius.com/packs/universalanimationlibrary.html y
https://quaternius.com/packs/universalanimationlibrary2.html), con una animación propia,
`Colgar_Loop`. Los paquetes se descargan aparte, fuera del repositorio. Hace falta Blender 5.2 o más
nuevo para crear la animación propia; después el script recibe las tres rutas:

```bash
blender --background --python scripts/blender/colgar.py -- ruta/a/UAL1_Standard.glb ruta/a/colgar.glb
npm run modelos:corredor -- ruta/a/UAL1_Standard.glb ruta/a/UAL2_Standard.glb ruta/a/colgar.glb
```

`public/modelos/utileria.glb` (la pistola y el dron) es propia y sale de Blender sin descargar nada:

```bash
blender --background --python scripts/blender/utileria.py -- public/modelos/utileria.glb
```

## Opciones de prueba

Se agregan a la dirección, por ejemplo `http://127.0.0.1:5331/?prueba=1&fps=1`.

- `?prueba=1` expone `window.nexo` para manejar el juego desde la consola y desde las pruebas.
- `?fps=1` muestra los cuadros por segundo y las llamadas de dibujo.
- `?calidad=alto|medio|bajo` fija la calidad de los gráficos en lugar de elegirla sola.
- `?fallarCarga=1` (junto con `?prueba=1`) hace fallar la carga una vez para ver "Reintentar".
- `?desde=355` (junto con `?prueba=1`) empieza la carrera en ese metro del tramo. Lo anterior ya
  cuenta: los portales (desde el metro 240 se corre en 3D), el arma y el pulso EMP. Si el metro cae
  dentro de un foso, empieza al otro lado; sobre un contenedor, encima.
- `?dios=1` (junto con `?prueba=1`) la carrera no quita vidas.

## Prototipo

El prototipo vive en `prototipo/` y no usa Node. Para abrirlo en el computador:

```bash
python -m http.server 5330 --bind 127.0.0.1 --directory prototipo
```

Abrir http://127.0.0.1:5330. Para el celular, quitar `--bind 127.0.0.1` y abrir
`http://IP-DEL-COMPUTADOR:5330`. Necesita internet: Three.js y la fuente se cargan de un CDN.

- **Controles:** tocar para saltar (o disparar si tienes arma), deslizar hacia arriba para
  saltar, deslizar a los lados para cambiar de carril en 3D. En el teclado: espacio o flecha
  arriba, flechas a los lados y X para disparar.
- **Opciones:** `?desde=440` empieza en esa distancia del nivel (440 es justo antes del portal
  del jefe), `?nivel=2` empieza en el nivel 2, `?dios=1` no recibe daño y `?prueba=1` expone
  `window.nexo`.

## Estructura de carpetas

```text
src/
  main.ts          arranque: carga, pantallas, cámara y bucle
  camara/          cámara de los menús (tomas) y de la carrera (lateral ↔ detrás)
  carga/           tareas de la carga con avance real
  datos/           los pisos de la torre y los niveles (tramos) con su validación
  entidades/       el corredor animado (GLB con esqueleto) y la utilería (pistola y dron)
  entrada/         toques y teclas → intenciones (tocar, saltar, rodar, disparar, carril)
  guardado/        progreso guardado en el dispositivo
  interfaz/        sistema de diseño (tokens.css), componentes y pantallas
  juego/           la simulación de la carrera (reglas y movimientos, sin Three.js) y la carrera en curso
  mundo/           escenas 3D (tierra-baldia: el exterior del búnker y la pista de la carrera)
  nucleo/          bucle, azar con semilla, preferencias y modo de prueba
  render/          renderizador, calidad y medidor
  textos/          todos los textos del juego
tests/navegador/   pruebas en el navegador (Playwright)
prototipo/         el primer juego jugable, sin compilar
public/modelos/    corredor.glb: el maniquí CC0 con sus 16 animaciones (una propia);
                   utileria.glb: la pistola y el dron (propios)
scripts/           armar-sitio.mjs: arma _site/ para GitHub Pages;
                   preparar-corredor.mjs: junta, recorta y comprime el GLB del corredor
scripts/blender/   colgar.py (la animación de colgarse) y utileria.py (pistola y dron), para Blender
docs/              documento de diseño, planes y maquetas aprobadas
```

## Recursos y licencias

Todo lo que no se hizo para el juego está en [CREDITOS.md](CREDITOS.md), con su autor, enlace
y licencia. El repositorio es público, así que solo entran recursos que se puedan redistribuir.
