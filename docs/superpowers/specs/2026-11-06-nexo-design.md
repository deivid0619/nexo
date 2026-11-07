# NEXO: documento de diseño

Fecha: 2026-11-06 · Autor del juego: David · Estado: aprobado por David (2026-11-06)

Este documento describe la versión profesional de NEXO. Reemplaza al prototipo actual
(`index.html`, `juego.js`, `estilos.css`), que queda en el historial de git como referencia de
mecánicas. Lo marcado **(decisión de Claude)** no lo decidió David y lo puede cambiar al revisar.

---

## 1. Intención y porqué

NEXO es un juego para celular de correr, esquivar y pelear, con una historia que le da sentido a
todo lo que pasa en pantalla. David lo quiere como un **proyecto profesional**: que se vea y se
sienta como un juego terminado, con animaciones de primer nivel, menús cuidados, un diseño
consistente y **mucha variedad**.

La mecánica distintiva viene del prototipo: el juego **pasa de 2D a 3D al cruzar un portal**. La
historia explica por qué: cada portal lleva a otra dimensión.

## 2. Historia

**El mundo.** La Tierra está desolada, en un futuro post-apocalíptico. La habitan criaturas que
llegaron de otros mundos y que detectan a cualquiera que salga al exterior. Los pocos humanos que
quedan viven escondidos.

**El protagonista.** Un sobreviviente común que vivía oculto en un búnker. No es soldado ni héroe.
No se puede salir al exterior sin que una criatura lo detecte.

**El inicio.** Un día se llena de valentía y sale, sin saber qué hay a su alrededor. El jugador
descubre el mundo junto con él. La historia se cuenta poco a poco mientras se juega, no con un video
largo al principio.

**La torre (Proyecto NEXO).** En el horizonte hay una torre futurista. La construyeron los humanos:
era el Proyecto NEXO, una torre para sacar energía de otras dimensiones. Algo salió mal, se abrieron
portales que no se pudieron cerrar y las criaturas entraron por ahí. El protagonista debe subir la
torre hasta el final para acabar con los habitantes de ese mundo. La torre se ve desde la salida
del búnker y es la meta visible durante todo el juego.

**La voz de la radio.** El búnker tiene una radio vieja. Al salir, alguien le habla por ahí y lo
guía. Al final se revela que es la inteligencia artificial de la torre. **(Decisión de Claude, para
el guion)**: la IA necesita que alguien llegue a la cima para apagarla, porque ella sola no puede
cerrar los portales. Es aliada, pero oculta lo que es hasta el núcleo.

**Registros.** Grabaciones de los científicos del proyecto, escondidas en el camino como
coleccionables opcionales. Quien las junta entiende qué pasó de verdad. La científica principal se
llama **Dra. Alba Ríos (decisión de Claude)**.

**El final.** Arriba de todo está la criatura que gobierna los portales. Al derrotarla, los portales
se cierran. En la última escena el protagonista mira hacia abajo y ve otras puertas de búnker
abriéndose: no era el único sobreviviente.

## 3. Metas, no-metas y anti-metas

**Metas**
- Se juega en el celular, en horizontal, con un dedo.
- Se ve profesional en todas las pantallas: carga, inicio, menús, juego, pausa y resultados.
- Animaciones de primer nivel en el personaje, las criaturas, los jefes, la cámara y la interfaz.
- Mucha variedad: cada dimensión trae ambiente, criaturas, mecánica y jefe propios.
- Una historia completa y unificada que explica el porqué de cada elemento del juego.
- Un diseño bien establecido: un solo sistema de colores, letras y componentes en todo el juego.

**No-metas** (no van en la primera versión)
- Multijugador o fantasmas de otros jugadores (David lo descartó).
- Tienda, anuncios o pagos dentro del juego **(decisión de Claude)**.
- Publicación en Play Store o App Store. El juego debe poder empaquetarse después sin rehacerlo,
  pero la primera versión se publica en el enlace web.
- Otros idiomas aparte del español **(decisión de Claude)**. Los textos se guardan aparte del código
  para poder traducirlos después.
- Cuentas de usuario o guardado en la nube.

**Anti-metas.** Para David el proyecto falla, aunque funcione, si:
- Las pantallas de carga o de inicio no se ven profesionales.
- Las animaciones no se ven profesionales.
- Los menús no se ven profesionales.
- No hay un diseño bien establecido (letras, colores o estilos que cambian de una pantalla a otra).

Por extensión **(decisión de Claude)**: también falla si sale con personajes hechos de cubos, si
las transiciones son bruscas, si se traba en un celular normal o si usa recursos que no se pueden
compartir legalmente.

## 4. Restricciones

- **Plataforma:** navegador del celular. El objetivo es correr fluido (60 cuadros por segundo) en un
  Android de gama media y verse bien también en iPhone. Va en horizontal; en vertical se muestra un
  aviso para girar el celular. También se puede jugar en computador con teclado.
- **Controles de un dedo:** tocar salta, o dispara si hay arma. Deslizar hacia arriba salta, y
  deslizar a los lados cambia de carril en 3D. En teclado: espacio o flecha arriba, flechas a los
  lados y X para disparar.
- **Recursos gratuitos:** David no va a hacer ni comprar modelos; Claude consigue todo con recursos
  gratuitos y efectos hechos en código.
- **Repositorio público** (`github.com/deivid0619/nexo`): solo recursos que se puedan redistribuir
  como archivos sueltos en un repositorio público **(decisión de Claude)**:
  - **Permitidas:** CC0 y CC-BY (3.0 o 4.0), dando el crédito.
  - **No permitidas:** CC-BY-SA, licencias no comerciales (NC) o sin obras derivadas (ND),
    Mixamo (sus archivos no se pueden redistribuir sueltos) y cualquier recurso sin licencia clara.
  - **Generados con IA** (modelos, imágenes, voces): solo si los términos del servicio permiten
    redistribuirlos.

  Cada recurso queda listado con su autor, enlace y licencia en `CREDITOS.md` y en la pantalla de
  créditos. Nada de secretos ni rutas personales en el código.
- **Enlace público y revisión (decisión de Claude):** David revisa cada cambio en local antes de
  publicarlo, como en sus otros proyectos.
  - **Enlace principal** (`https://deivid0619.github.io/nexo/`): mantiene el prototipo jugable
    hasta que salga el Capítulo 1.
  - **Enlace de avance** (`https://deivid0619.github.io/nexo/avance/`): ahí se publica cada etapa
    terminada, después del visto bueno de David, para probarla en el celular.
- **Calidad gráfica por niveles (decisión de Claude):**
  - **Alto:** se ve como la maqueta aprobada, con todas las sombras y efectos, a 60 cuadros por
    segundo en el celular de David, un **iPhone 16 Pro** (Safari). Es el dispositivo principal de
    pruebas; también hay que revisar la pantalla con isla dinámica y los bordes seguros.
  - **Medio y Bajo:** quitan efectos en orden de costo (oclusión ambiental, sombras suaves, brillo,
    resolución) para sostener 60 cuadros por segundo en celulares más lentos. La jugabilidad y la
    legibilidad nunca cambian entre niveles.
  - El juego elige el nivel solo, midiendo el rendimiento al arrancar, y se puede cambiar en
    Ajustes.
- **Idioma:** todo en español.

## 5. Estructura del juego

### La torre y sus pisos

El juego es la subida a la torre. Cada piso es una dimensión distinta:

| Piso | Dimensión | Ambiente | Mecánica nueva | Jefe |
|---|---|---|---|---|
| 1 | Tierra baldía | Ruinas, arena y chatarra al atardecer | Base: saltar, carriles, disparar | Centinela |
| 2 | Cristal | Hielo y luz fría | Suelo resbaloso y láseres que rebotan | Hidra de cristal |
| 3 | Magma | Fuego y máquinas fundidas | Lava que sube y plataformas que se hunden | (por definir) |
| 4 | Vacío | Gravedad al revés, casi sin suelo | Invertir la gravedad | (por definir) |
| 5 | Núcleo | Interior de la torre | Mezcla de todo | La criatura que gobierna los portales |

Los nombres de los jefes de los pisos 3 a 5 se definen en su etapa.

### Un piso por dentro

Cada piso dura entre 3 y 5 minutos y sigue este orden:
1. **Tramo en 2D** (vista lateral), donde se presenta la mecánica nueva.
2. **Portal a 3D:** la cámara gira detrás del personaje y aparecen 3 carriles.
3. **Zona de combate:** el personaje recoge un arma y enfrenta criaturas.
4. **Pulso EMP:** el arma se pierde y se vuelve a esquivar.
5. **Punto de control.**
6. **Portal del jefe** y pelea final del piso.

Esta estructura base viene del prototipo. Cada piso puede variarla para no ser repetitivo, por
ejemplo con dos zonas de combate o un portal de vuelta a 2D a mitad de camino.

### Reglas comunes

- **Vidas:** 3 por intento de piso. El escudo absorbe un golpe. Tras un golpe hay un momento corto
  de invulnerabilidad.
- **Punto de control** antes del jefe: si pierdes contra el jefe, vuelves al punto de control con
  las vidas completas, no al principio del piso.
- **Habilidades** que se recogen: escudo, turbo (rompe obstáculos) y doble salto, como en el
  prototipo. Cada dimensión puede añadir una propia.
- **Armas:** solo en las zonas de combate y en las ventanas en que el jefe abre su punto débil.
- **Jefes:** 3 fases cada uno. Cada fase cambia sus ataques y su animación a medida que pierde vida.
  Los ataques se anuncian antes de golpear: un carril que se marca, un sonido o un gesto. El jugador
  abre su punto débil esquivando bien, y entonces tiene el arma unos segundos.
- **Puntaje y récord** por piso, guardados en el celular.
- **Progreso:** se desbloquea el piso siguiente al derrotar al jefe. El mapa de la torre muestra qué
  piso está completado, cuál es el actual y cuáles siguen sellados.

### Cómo se cuenta la historia

- **Prólogo:** la salida del búnker (escotilla, luz cálida que sale de adentro, primer vistazo a la
  torre) y las primeras palabras de la radio.
- **Radio:** mensajes cortos durante el juego en una caja de texto con la imagen de una radio, sin
  detener la partida. **(Decisión de Claude)**: con voz en español si se consigue una voz que se
  pueda usar legalmente; si no, texto con sonido de estática.
- **Registros:** objetos escondidos en cada piso. Al tocarlos se guardan y se pueden leer o escuchar
  después desde el menú. La pantalla de carga muestra frases de los registros ya encontrados.
- **Escenas cortas** al inicio y al final, hechas con la misma escena 3D y cámara animada, no con
  video.

## 6. Primera versión publicable ("Capítulo 1: La salida")

Lo propuso Claude y David no lo objetó. Incluye:
- **Prólogo** del búnker con la voz por la radio.
- **Piso 1, Tierra baldía,** completo, con su jefe Centinela de 3 fases.
- **Piso 2, Cristal,** completo, con su jefe Hidra de cristal de 3 fases.
- **Personaje y criaturas** con modelos 3D reales animados: correr, saltar, disparar, recibir golpes
  y morir, entre otras animaciones.
- **4 registros escondidos** (2 por piso) **(decisión de Claude)**.
- **Pantallas completas:** carga, inicio, mapa de la torre, pausa, resultados del piso, registros,
  ajustes y créditos.

Los pisos 3, 4 y 5 y el final de la historia llegan en etapas siguientes. Mientras tanto, en el mapa
aparecen como "Sellado".

## 7. Dirección visual (aprobada)

David aprobó la maqueta 3D del 2026-11-06 ("me gusta demasiado el diseño, el concepto está
perfecto"), con dos pedidos: un personaje más pulido y mejores sombras en el entorno.

**Maqueta de referencia:** `docs/maquetas/2026-11-06-escena-inicio.html` (se abre en el navegador).
Es la referencia visual de la etapa 1: composición, colores, luz, tomas de cámara y menús. No es
código del juego y se rehace dentro de la arquitectura nueva.

**Estilo de arte (decisión de Claude, sacada de la maqueta):** estilizado con luz natural. Formas
simples y legibles, materiales con textura (concreto, óxido, tela, metal), luz, bruma y sombras
realistas. No es caricatura de colores planos ni fotorrealismo. Los recursos se eligen con ese
criterio y se ajustan a la paleta de cada dimensión.

**El mundo, en la Tierra baldía**
- **Colores naturales:** atardecer con polvo en el aire, cielo gris azulado arriba y ocre cerca del
  horizonte, arena, concreto y óxido. Nada saturado salvo la luz de la torre.
- **La torre** es la única luz artificial del mundo: anillos celestes (#A6E8EC) que laten, un haz de
  luz hacia el cielo y un brillo en la punta. A lo lejos se pierde en la bruma.
- **Luz y sombras:** sol bajo detrás de la torre que deja sombras largas. Bruma que esconde la
  distancia. Polvo flotando con el viento.
- **Escenario:** carretera rota que lleva a la torre, edificios en ruinas con ventanas y techos
  derrumbados, postes caídos, carros oxidados y escombros. La escotilla del búnker abierta, con luz
  cálida que sale de adentro.
- **El personaje:** un sobreviviente con abrigo largo, capucha y mochila. Se ve de espaldas en la
  pantalla de inicio.

**Paleta por dimensión (decisión de Claude):** cada dimensión mantiene colores naturales y una
sola luz de acento.
- Cristal: niebla blanca azulada, luz fría y reflejos.
- Magma: negro, rojo profundo y brasas.
- Vacío: noche violeta con estrellas.
- Núcleo: metal oscuro con el celeste de la torre.

**Metas de calidad visual**
- **Personaje pulido:** modelo 3D con esqueleto y ropa acorde a la historia. Las animaciones se
  mezclan entre sí sin cortes, por ejemplo de correr a saltar o de correr a disparar.
- **Mejores sombras:** sombras suaves y detalladas cerca de la cámara, oclusión ambiental (sombras
  en esquinas y bajo los objetos) y sombras de contacto bajo el personaje.
- **Postprocesado:** brillo en las luces, gradación de color por dimensión y viñeta.
- **Calidad automática:** el juego baja la calidad en celulares lentos y se puede subir o bajar en
  Ajustes.

**Interfaz (sistema de diseño)**
- **Letras:** Syncopate 700 con mucho espacio entre letras para el logo y los títulos grandes,
  Barlow 500 y 600 para los textos, y Barlow Condensed 600 en mayúsculas espaciadas para las
  etiquetas pequeñas.
- **Paneles:** oscuros semitransparentes (rgba(26,22,18,.64)) con borde fino claro, esquinas de
  10 px y sombra suave.
- **Opción seleccionada:** fondo claro (#F4EFE7) con texto oscuro y una marca vertical celeste
  (#7FD6DC).
- **Texto claro:** #F3EEE6.
- **Botón principal:** claro con sombra.
- **Pantalla de inicio:** logo arriba a la izquierda, menú abajo a la izquierda (Continuar, Nueva
  partida, Registros, Ajustes) y último guardado abajo a la derecha, con el mundo y la torre de
  fondo.
- **Pantalla de carga:** la escena de fondo oscurecida, un registro con su autor, una barra fina
  celeste con porcentaje real y un consejo de juego.
- **Mapa de la torre:** lista de los 5 pisos con su estado a la izquierda, la torre de fondo y una
  tarjeta del piso elegido (jefe, registros encontrados, récord) con el botón "Entrar al portal".
- **Cámara del menú:** viaja suavemente entre pantallas; cada pantalla tiene su toma propia.
- Todos los colores, letras y espacios salen de un único sistema de valores. Ninguna pantalla
  inventa los suyos.

**Animaciones requeridas**
- **Personaje:** quieto, correr, despegar, en el aire, caer, aterrizar, doble salto, cambio de
  carril (inclinarse), disparar corriendo, recibir golpe, morir y celebrar.
- **Criaturas:** moverse, anunciar el ataque, atacar y morir.
- **Jefes:** entrada, cada ataque con su aviso, cambio de fase y derrota.
- **Cámara:** giro de 2D a 3D en los portales, sacudidas medidas y tomas de presentación del jefe.
- **Interfaz:** transiciones entre pantallas, respuesta al tocar botones y entrada de los avisos.
- **Movimiento reducido:** respetar el ajuste del sistema y quitar sacudidas y destellos.

## 8. Sonido

- **Música por dimensión** y para los menús, de fuentes gratuitas con licencia compatible.
- **Efectos:** pasos, salto, disparo, golpe, recoger, portal, avisos de jefe y estática de radio.
- **Vibración** del celular al recibir golpes, con opción de apagarla.
- **Volumen separado** para música, efectos y voz en Ajustes.

## 9. Construcción técnica (decisiones de Claude)

- **Web:** Vite + TypeScript + Three.js. Se descartó Unity/Godot para mantener el enlace web,
  poder probar todo en el navegador y empaquetarlo después como app.
- **Organización del código por partes:**
  - núcleo: bucle, estados del juego, eventos
  - entrada: gestos y teclado
  - mundo: construye cada tramo a partir de datos
  - entidades: jugador, criaturas y jefes, cada uno con sus estados
  - render: materiales, luces, sombras, postprocesado y partículas
  - audio
  - interfaz: menús en HTML y CSS sobre el lienzo
  - guardado
  - textos: todo en un archivo aparte para traducir después
- **Niveles como datos:** cada piso se describe en un archivo de datos (tramos, obstáculos,
  criaturas, registros, jefe), no escrito a mano en el código.
- **Recursos 3D:** modelos glTF con animaciones, comprimidos para que carguen rápido en el
  celular. Carga real con porcentaje, que alimenta la pantalla de carga.
- **Pruebas automáticas** para la lógica (colisiones, reglas, guardado, lectura de niveles) y una
  prueba en navegador que abre cada pantalla y revisa que no haya errores.
- **Publicación automática:** cada cambio aprobado en `main` se construye y se publica solo en el
  enlace de GitHub Pages.
- **Modo de prueba:** como el del prototipo (`?prueba=1`, saltar a un tramo, sin daño), para probar
  sin jugar desde el principio.

## 10. Organización del trabajo

Las tareas se llevan en **GitHub** (`deivid0619/nexo`) con una etapa por hito, mientras no haya
Jira. David creó `projectonexo.atlassian.net`, pero el conector aún no tiene permiso. Si lo
autoriza, las tareas se pasan allá.

**Sin fecha límite** (David, 2026-11-06): se siguen las etapas en orden y se prioriza la calidad
sobre la velocidad.

**Etapas (decisión de Claude):** cada una se puede jugar en el enlace de avance al terminar.
1. **Marco:** proyecto nuevo, herramientas, publicación automática, sistema de diseño y las
   pantallas de carga, inicio y mapa con la escena aprobada.
2. **Núcleo jugable:** correr, controles, cámara 2D/3D con portal, niveles como datos y un tramo
   de la Tierra baldía.
3. **Personaje y animación:** modelo final, todas sus animaciones y la mezcla entre ellas.
4. **Tierra baldía completa:** criaturas, combate, EMP, punto de control y Centinela con 3 fases.
5. **Historia:** prólogo, radio, registros y sus pantallas.
6. **Cristal completo:** su mecánica, sus criaturas e Hidra de cristal con 3 fases.
7. **Pulido y lanzamiento del Capítulo 1:** postprocesado, rendimiento en celular, sonido, pausa,
   resultados, ajustes y créditos.

Después: Magma, Vacío, Núcleo y el final.

## 11. Lo que queda en manos de quien construye

- Qué modelos, animaciones y sonidos gratuitos usar, dentro de la dirección visual y las licencias.
- La forma y los ataques exactos de las criaturas y de los jefes, dentro de las reglas de la sección 5.
- El diseño de cada tramo: distancias, ritmo y dificultad. Debe sentirse justo y subir de a poco.
- Los textos de la radio y de los registros, dentro de la historia de la sección 2.
- Los detalles técnicos: librerías concretas, formatos y la estructura interna de carpetas.

## 12. Decisiones de Claude para revisar

- La IA de la torre es la voz de la radio y es aliada; la científica se llama Dra. Alba Ríos.
- Nada de tienda, anuncios ni pagos, y solo español, en la primera versión.
- 4 registros en la primera versión (2 por piso).
- Las paletas de Cristal, Magma, Vacío y Núcleo.
- Rehacer el juego como proyecto nuevo con Vite + TypeScript + Three.js, en lugar de seguir
  creciendo el prototipo.
- El orden de las 7 etapas.
- El punto de control antes del jefe con las vidas completas.
- Estilo de arte "estilizado con luz natural", sacado de la maqueta aprobada.
- Licencias permitidas: CC0 y CC-BY con crédito; sin CC-BY-SA, NC, ND ni Mixamo.
- El prototipo se queda en el enlace principal hasta el Capítulo 1; las etapas van a `/nexo/avance/`
  después del visto bueno de David en local.
- Calidad gráfica en tres niveles, con el nivel Alto igual a la maqueta.

## 13. Riesgo principal: el personaje

No existe un modelo gratuito CC0/CC-BY de un sobreviviente con abrigo largo, capucha y mochila,
con esqueleto y unas 12 animaciones que se mezclen bien. El camino gratuito es partir de un
personaje base con esqueleto y animaciones libres (CC0) y adaptarle la ropa con piezas propias
modeladas por código o en Blender por script. Es posible, pero es la etapa más larga y la que más
limita lo "pulido" del personaje. La alternativa es un generador de modelos 3D con IA que también
le pone esqueleto (por ejemplo Tripo). Da un personaje más fiel a la descripción, pero es de pago y
hay que revisar que sus términos permitan redistribuir los archivos.

**Decisión de David (2026-11-06):** hacerlo gratis y ver cómo queda. Si el resultado no convence,
se reconsidera el generador de pago en ese momento.
