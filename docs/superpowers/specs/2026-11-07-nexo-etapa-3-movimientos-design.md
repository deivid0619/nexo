# NEXO, etapa 3 "Movimientos": documento de diseño

Fecha: 2026-11-07. Se apoya en el documento general
`docs/superpowers/specs/2026-11-06-nexo-design.md`: su historia, sus reglas, su dirección visual y
sus restricciones siguen valiendo. Este documento solo agrega lo de la etapa 3.

## 1. Intención y porqué

David jugó la etapa 2 y la carrera le quedó corta de acciones. El corredor solo salta y cambia de
carril, y el disparo del prototipo no aparece. Pidió con sus palabras **rodar siempre que se corra**,
**trepar**, **balancearse** y **disparar**, además de "demás animaciones y funcionalidades". Le
propusimos caída rápida, el "¡Justo!" y las reacciones del personaje, y respondió "perfecto".

La etapa 3 convierte la carrera en un juego de movimientos. El corredor rueda, cae rápido, trepa,
se balancea en cables y dispara, y cada movimiento tiene una animación propia que se mezcla sin
cortes con las demás. El tramo 1 de la Tierra baldía se rehace para enseñar cada movimiento y
después combinarlos.

**Éxito para David:** juega el tramo en su iPhone 16 Pro y usa todos los movimientos. Cada uno se
siente claro y justo, y el personaje nunca se desliza quieto ni salta de una pose a otra.

## 2. Cambio en el orden de las etapas (aprobado por David, 2026-11-07)

El documento general tenía 7 etapas. David aprobó este orden nuevo ("perfecto las etapas"):

1. Marco (publicada).
2. Núcleo jugable (publicada).
3. **Movimientos** (este documento).
4. **Tramos al azar:** la pista se arma distinta en cada partida con piezas diseñadas a mano. Siempre
   hay un camino posible, con una ruta de arriba y otra de abajo, y chatarra que suma puntos.
5. **Personaje final:** abrigo, capucha y mochila hechos en Blender sobre el mismo esqueleto.
6. Tierra baldía completa: criaturas, combate, punto de control y el Centinela con 3 fases.
7. Historia.
8. Cristal completo.
9. Pulido y lanzamiento del Capítulo 1.

El personaje final pasó de la etapa 3 a la 5. Es el trabajo más largo y más incierto, y así David ve
antes los movimientos. Como el esqueleto no cambia, todo lo que se anime en las etapas 3 y 4 le sirve
al personaje final sin rehacerlo. Los hitos de GitHub ya tienen este orden. La sección 10 del
documento general se actualiza en el mismo cambio que este documento.

## 3. Metas, no-metas y anti-metas

**Metas**
- Rodar, caída rápida, trepar, balancearse en cables y disparar, con un dedo y con teclado.
- Obstáculos nuevos que piden cada movimiento: vigas bajas, contenedores, fosos y cables.
- Una zona de disparo con drones, como la del prototipo: recoges el arma, disparas y la pierdes con
  el pulso EMP al final de la zona.
- El "¡Justo!": puntos extra por un movimiento hecho en el último momento.
- Reacciones del personaje: golpe, escudo roto, caída al foso, morir y celebrar al terminar.
- Un tramo 1 rehecho que enseña un movimiento a la vez, con su pista en pantalla, y luego los mezcla.

**No-metas** (van en otras etapas)
- El personaje final con ropa (etapa 5). Se sigue usando el maniquí actual.
- Tramos al azar, ruta de arriba y de abajo, y chatarra (etapa 4). En esta etapa los obstáculos se
  ponen a mano, como en la etapa 2.
- Criaturas de verdad, combate, punto de control y jefe (etapa 6). Los drones de esta etapa son
  blancos simples.
- Sonido (etapa 9). La vibración al recibir golpes ya existe y se mantiene.
- Pausa, ajustes y resultados completos (etapa 9).

**Anti-metas.** La etapa falla aunque funcione si:
- Un movimiento se ve sin animación, o una animación salta a otra sin mezcla.
- El celular confunde los gestos, por ejemplo un deslizar hacia abajo que salta o rueda dos veces.
- Se pierde una vida sin haber podido verlo venir, como un foso o una viga que aparecen sin aviso y
  sin tiempo para reaccionar.
- La carrera baja de 60 cuadros por segundo en el iPhone de David.
- Se usa un recurso con una licencia que no permite el repositorio público.

## 4. Restricciones

Las del documento general, en especial:
- Celular en horizontal, un dedo, iPhone 16 Pro como dispositivo principal; también teclado.
- Licencias: CC0 y CC-BY con crédito. Nada de CC-BY-SA, NC, ND ni Mixamo.
- Repositorio público: sin secretos ni rutas personales.
- Todos los textos en `src/textos/es.ts`, en español.
- Puertos de NEXO: 5331 (desarrollo), 5332 (sitio armado) y 5330 (prototipo).
- David revisa en local antes de publicar. Se sube a GitHub solo con su visto bueno.

## 5. Los movimientos

Números de partida (decisión de Claude, se pueden ajustar al probar): gravedad 24, salto 8,5, doble
salto 8 y velocidad de 9 a 12 m/s, igual que en la etapa 2. El corredor mide 1,75 m de pie.

### Rodar
- **Cómo:** deslizar hacia abajo en el suelo, cuando quieras mientras corres (pedido de David). En
  teclado, flecha abajo o S.
- **Qué hace:** el corredor rueda unos 0,7 s y mientras tanto mide unos 0,9 m de alto, así que pasa
  por debajo de las vigas bajas.
- **Detalles (decisión de Claude):**
  - Saltar durante el giro lo corta y salta.
  - Cambiar de carril mientras rueda se puede.
  - Deslizar hacia abajo otra vez durante el giro lo vuelve a empezar.
  - Rodar no protege de golpes: solo hace al corredor más bajo.
- **Animación:** `Roll` de UAL1. Dura 1,47 s y se acelera para que quepa en el giro.

### Caída rápida
- **Cómo:** deslizar hacia abajo en el aire.
- **Qué hace:** el corredor baja de golpe y al tocar el suelo rueda solo. Sirve para corregir un salto
  largo y para entrar justo bajo una viga después de una valla.
- **Detalle (decisión de Claude):** después de una caída rápida no queda doble salto hasta tocar el
  suelo.
- **Animación:** una pose de caída (por ejemplo `Jump_Loop` inclinado hacia abajo) y luego `Roll`.

### Trepar
- **Obstáculo:** un contenedor de 2 m de alto. Un salto normal no lo pasa, porque llega a unos 1,5 m.
- **Cómo:** saltar contra el contenedor. Si el corredor toca su frente estando en el aire, se agarra
  y sube solo. Luego corre encima hasta el borde y cae al suelo.
- **Si llega por el suelo** (decisión de Claude): se golpea, pierde una vida (o el escudo) y sube de
  todas formas, más lento. Nunca se queda trabado.
- **Encima del contenedor** el suelo está a 2 m:
  - se puede saltar y rodar como en el suelo;
  - en 3D, cambiar de carril desde encima lo hace caer;
  - con doble salto también se puede caer encima del contenedor desde arriba.
- **Animación:** `ClimbUp_1m` de UAL2 (0,67 s), ajustada a la altura del contenedor.

### Balancearse en cables
- **Obstáculo:** un foso largo (unos 9 m o más, demasiado para un salto) con un cable que cuelga de
  una grúa o un poste al principio.
- **Cómo:**
  - Saltar hacia el cable: si la mano pasa cerca, el corredor lo agarra solo.
  - Se balancea hacia adelante sobre el foso.
  - Tocar lo suelta. Si suelta en el momento justo, vuela más lejos (lo que David aprobó).
- **Reglas (decisión de Claude):**
  - Hay una franja buena al final del vaivén hacia adelante. Soltarse dentro de ella pasa el foso.
  - El centro de la franja da el vuelo más largo y un "¡Justo!".
  - Soltarse antes de la franja da un vuelo corto que puede caer al foso.
  - Si no toca, el corredor se suelta solo al final del vaivén y pasa el foso, con un vuelo normal.
    Quien no conoce el gesto no pierde por eso; solo deja de ganar el "¡Justo!".
  - El vaivén dura alrededor de 1 s.
- **Solo en 2D en esta etapa** (decisión de Claude). Es donde mejor se lee el arco.
- **Animación:** no existe un clip gratis de colgarse. Se hace en Blender sobre el mismo esqueleto:
  brazos arriba agarrando y piernas que siguen el vaivén. Es el riesgo de la etapa (sección 10).

### Fosos
- **Foso corto** (hasta unos 4 m): se pasa saltando. Puede estar en 2D o en 3D, y en 3D cruza los
  tres carriles.
- **Foso largo:** solo con cable (arriba).
- **Caer en un foso:** pierde una vida, o el escudo si lo tiene, y el corredor reaparece al otro lado
  con el momento corto de invulnerabilidad de siempre. Es la única forma de perder una vida que no es
  un choque. El turbo no ayuda en los fosos.
- **Animación:** `Hit_Knockback` de UAL2 al caer, y luego el corredor aparece de pie al otro lado.

### Disparar (la zona de disparo)
- **Como en el prototipo:**
  - Al pasar por una estación de armas, el corredor toma una pistola automáticamente.
  - Con el arma, tocar dispara y deslizar hacia arriba salta (documento general, sección 4). En
    teclado, X dispara.
  - Al final de la zona, un pulso EMP le quita el arma.
- **Disparo:** cada disparo sale hacia adelante por el carril del corredor, rápido, con una cadencia
  corta (el prototipo usa 40 m/s y 0,15 s).
- **Drones:** flotan a la altura del pecho en un carril.
  - Se pueden esquivar cambiando de carril o rodando por debajo.
  - Chocar con uno quita una vida.
  - Derribarlo con un disparo da puntos, y el turbo también lo rompe.
- **La zona va en 3D** (decisión de Claude), como en el prototipo.
- **Animación:** el corredor sigue corriendo con las piernas y apunta y dispara con los brazos y el
  torso (`Pistol_Aim_Neutral` y `Pistol_Shoot` de UAL1 solo en la parte de arriba del cuerpo). La
  pistola se ve en la mano derecha solo mientras la tiene.

### "¡Justo!"
- **Cuándo:** un movimiento empezado en el último momento antes del obstáculo:
  - un salto que pasa una valla;
  - un giro que pasa una viga;
  - un trepar que agarra el contenedor;
  - la suelta del cable en el centro de la franja buena.
- **Ventana (decisión de Claude):** unos 0,18 s antes del contacto.
- **Qué da:** 50 puntos y un letrero pequeño "¡Justo! +50" que sale junto al corredor y se va solo.
  No tapa la pista ni detiene la carrera.

### Reacciones del personaje
| Momento | Animación (todas CC0 de Quaternius salvo la de colgarse) |
|---|---|
| Golpe | `Hit_Chest` (ya está) |
| Escudo roto | `Idle_Shield_Break` de UAL2, breve, sin dejar de correr |
| Caer al foso | `Hit_Knockback` de UAL2 |
| Morir | `Death01` (ya está) |
| Celebrar al terminar el tramo | `Yes` de UAL2 o `Dance_Loop` de UAL1 (decide quien construye) |
| Doble salto | `NinjaJump_Start` de UAL2, para que se distinga del primer salto |

Todas se mezclan con las demás, como en la etapa 2 (unos 0,12 s de mezcla).

## 6. El tramo 1 de la Tierra baldía, rehecho

Se reemplaza `TIERRA_BALDIA_1` por una versión más larga, de unos 500 a 600 m. Sigue la estructura
del documento general (2D, portal a 3D, zona de combate, EMP, vuelta a 2D), pero todavía sin jefe ni
punto de control.

**Orden de enseñanza (decisión de Claude).** Cada movimiento aparece primero solo, con su pista en
pantalla y espacio de sobra. Después se mezcla con los anteriores.

1. **2D:** saltar vallas (como ahora), luego rodar bajo vigas, luego la caída rápida (valla alta
   seguida de una viga) y después trepar un contenedor.
2. **Portal a 3D:** carriles con bloques, vigas que cruzan los tres carriles, contenedores en uno o
   dos carriles y un foso corto.
3. **Zona de disparo en 3D:** estación de armas, drones en distintos carriles y pulso EMP al final.
4. **Portal a 2D:** fosos largos con cable (al menos dos) y un cierre que mezcla todo.

Las habilidades (escudo, turbo y doble salto) siguen apareciendo como en la etapa 2. Quien construye
diseña las distancias exactas. Debe sentirse justo y subir de a poco: siempre hay tiempo para ver y
reaccionar a la velocidad máxima de 12 m/s.

**Pistas en pantalla** (en el mismo lugar que las de la etapa 2; cada una se va al hacer el
movimiento):

| Pista | Cuándo aparece |
|---|---|
| "Desliza hacia abajo para rodar" | antes de la primera viga |
| "En el aire, desliza hacia abajo para caer rápido" | antes de la primera combinación de valla y viga |
| "Salta contra el muro para trepar" | antes del primer contenedor |
| "Salta al cable y toca para soltarte" | antes del primer cable |
| "Toca para disparar · desliza arriba para saltar" | al tomar el arma |

**Avisos**, como los de portal y habilidad: "Arma lista: toca para disparar" y "Pulso EMP: perdiste
el arma". A los consejos de la pantalla de carga se suma "Desliza hacia abajo para rodar". El texto
final lo afina quien construye, con el tono de los de la etapa 2.

## 7. Controles

| Gesto | En el suelo | En el aire | Con arma | Teclado |
|---|---|---|---|---|
| Tocar | Saltar | Doble salto (si lo tiene) | Disparar | Espacio o flecha arriba (saltar); X (disparar) |
| Deslizar arriba | Saltar | Doble salto | Saltar | Flecha arriba o W |
| Deslizar abajo | Rodar | Caída rápida | Igual | Flecha abajo o S |
| Deslizar a los lados (3D) | Cambiar de carril | Cambiar de carril | Igual | Flechas o A y D |
| Tocar colgado del cable | Soltarse | | | Espacio |

Deslizar hacia abajo ya estaba reservado en la etapa 2 (se ignoraba a propósito). Ahora rueda. El
mismo umbral de deslizar de la etapa 2 sirve para los cuatro sentidos.

## 8. Lo que se ve en pantalla

- **HUD de la etapa 2** sin cambios, más:
  - un indicador pequeño de arma mientras se tiene (ícono de la misma familia, Tabler);
  - el letrero del "¡Justo!".
- **Obstáculos nuevos con el estilo de la Tierra baldía,** como los bloques y vallas de la etapa 2:
  - vigas: tubos o carteles caídos;
  - contenedores;
  - fosos con borde de tierra rota;
  - cables colgando de una grúa;
  - estación de armas y drones, con el tono celeste de la torre como única luz artificial;
  - el EMP: líneas celestes que parpadean, como en el prototipo.
- **Modelos propios:** la pistola y el dron se modelan en Blender por script, en bajo detalle, como
  piezas propias (sin descargar paquetes nuevos). También pueden salir de un paquete CC0 si David
  autoriza la descarga.

## 9. Construcción técnica (decisiones de Claude)

- **Corredor:**
  - Sigue siendo el maniquí de Universal Animation Library en `public/modelos/corredor.glb`.
  - Ahora junta clips de UAL1 y UAL2, que comparten el mismo esqueleto de 65 huesos (comprobado),
    más el clip propio de colgarse hecho en Blender.
  - `scripts/preparar-corredor.mjs` pasa a recibir las dos bibliotecas y el clip propio, y deja solo
    los clips que se usan.
  - Meta de peso: menos de 800 KB.
- **Disparar mientras corre:**
  - Las piernas usan `Sprint_Loop` y el torso y los brazos (desde `spine_01` hacia arriba) usan las
    animaciones de pistola.
  - La pistola se cuelga del hueso `hand_r`.
- **Reglas en `simulacion.ts`,** sin Three.js, como en la etapa 2:
  - el estado del corredor (corriendo, rodando, trepando, colgado, cayendo al foso);
  - la altura del suelo bajo el corredor (suelo, encima de un contenedor o foso);
  - los eventos nuevos de nivel: viga, contenedor, foso, cable, estación de armas, dron y EMP;
  - los eventos nuevos de simulación para la carrera y el HUD: rodar, trepar, agarrar, soltar,
    "¡Justo!", disparo, dron derribado, arma tomada, EMP y caída al foso.
- **Validación del nivel:**
  - Se amplía `validar.ts`, por ejemplo: un cable siempre al principio de un foso largo, un foso
    largo siempre con cable, nada dentro de un foso y la zona de armas cerrada por un EMP.
  - Se agrega una prueba de que el tramo se puede pasar sin daño haciendo los movimientos a tiempo.
- **Modo de prueba:** `window.nexo.accion()` acepta `'rodar'` y `'disparar'`. `?desde=N` sigue
  sirviendo y aplica el arma y el EMP que ya habrían pasado.
- **Créditos:** UAL2 se suma a `CREDITOS.md` y a `LICENCIAS.txt` del sitio (Quaternius, CC0). Las
  piezas hechas en Blender se anotan como propias.
- **Pruebas:**
  - Cada regla nueva tiene su prueba en Vitest.
  - En el navegador (Playwright, escritorio y celular): cada pista aparece y se va con su
    movimiento, y no hay errores en la consola.
  - Al final, revisión en el iPhone de David.

## 10. Riesgos

- **La animación de colgarse** se hace a mano en Blender por script. Si se ve rígida, se simplifica
  a una pose fija bien hecha con un leve vaivén, que es honesto con el estilo del maniquí. No se
  reemplaza por un recurso de licencia dudosa.
- **El suelo variable** (contenedores y fosos) es el cambio más grande en las reglas. Toca saltos,
  aterrizajes, cámara y colisiones, así que necesita pruebas de cada borde: subir, caer del borde,
  cambiar de carril encima, aterrizar desde arriba y caer al foso con o sin escudo.
- **Gestos:** deslizar hacia abajo justo después de tocar no debe saltar y rodar a la vez. Se revisa
  en el iPhone.

## 11. Lo que queda en manos de quien construye

- Las distancias y el ritmo exactos del tramo, dentro del orden de la sección 6.
- Los números finos: duración del giro, fuerza de la caída rápida, tamaño de la franja buena del
  cable, puntos por dron y ventana del "¡Justo!".
- La forma exacta de vigas, contenedores, fosos, cables, estación de armas, drones y EMP, dentro del
  estilo de la Tierra baldía.
- Qué clip de celebrar usar y cómo se ve la caída rápida.
- La organización interna del código, siguiendo la de la etapa 2.

## 12. Decisiones de Claude para que David revise

- La caída al foso quita una vida y el corredor reaparece al otro lado (no es derrota inmediata).
- Si no tocas en el cable, te sueltas solo y pasas: tocar bien solo da más distancia y el "¡Justo!".
- Llegar por el suelo a un contenedor te golpea pero sube de todas formas.
- Rodar no protege de golpes.
- Cables solo en 2D y zona de disparo solo en 3D, en esta etapa.
- Después de una caída rápida no hay doble salto hasta tocar el suelo.
- La pistola y el dron se modelan en Blender, sin descargar paquetes nuevos.
- El tramo 1 crece a unos 500–600 m para enseñar todo.
- **El turbo:**
  - rompe vigas y drones, como ya rompe bloques;
  - no rompe contenedores, pero con turbo se trepan sin golpe aunque se llegue por el suelo;
  - en los fosos no ayuda.
- **Cada pista se queda** hasta que el jugador hace el movimiento, como la de saltar en la etapa 2.
  Si llega la pista siguiente, la reemplaza. Nunca hay dos pistas a la vez.
- **El récord guardado** de la Tierra baldía se conserva aunque el tramo cambie. Solo existe en los
  celulares de prueba y es por piso, no por versión del tramo.
