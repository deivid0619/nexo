# NEXO, etapa 4 "Mantener y soltar": documento de diseño

Fecha: 2026-11-07. Se apoya en el documento general
`docs/superpowers/specs/2026-11-06-nexo-design.md` y en el de la etapa 3
`docs/superpowers/specs/2026-11-07-nexo-etapa-3-movimientos-design.md`: su historia, sus reglas, su
dirección visual y sus restricciones siguen valiendo. Este documento solo agrega lo de la etapa 4.

## 1. Intención y porqué

David jugó la etapa 3 publicada. No sintió que faltara algo en un punto concreto, pero pidió
**variedad** y una forma nueva de jugar: **mantener el dedo apretado y soltarlo**. Dio dos ejemplos
suyos, balancearse en el cable y deslizarse manteniendo, y aprobó con "perfecto, me encanta" la lista
que le propusimos: cinco gestos de mantener y soltar, y obstáculos nuevos para el modo 2D.

Pidió además, con sus palabras:
- pensar **más en la versión de celular que en la de PC**;
- que al subir a los contenedores **trepe más rápido**;
- **más obstáculos o funcionalidades en el modo 2D**;
- que **las animaciones estén pulidas**, que **el entorno quede bien adaptado** y que **los
  obstáculos se vean bien animados y con buen diseño**.

La etapa 4 suma una capa de juego (mantener y soltar), un juego de obstáculos animados para el 2D
con una ruta de arriba y otra de abajo, y una pasada de pulido de animación y de entorno pensada para
el iPhone.

**Éxito para David:** juega en su iPhone 16 Pro con un pulgar. Cada gesto de mantener y soltar se
entiende al primer intento y nunca se confunde con un toque o un deslizamiento. Los obstáculos nuevos
se ven como parte de la Tierra baldía, se mueven de forma que se leen de lejos, y el corredor tiene
una animación cuidada para cada cosa que hace.

## 2. Cambio en el orden de las etapas (David, 2026-11-07)

La etapa 4 "Tramos al azar" creció con los pedidos de David y se partió en dos. David dejó la
división en nuestras manos ("pártela como desees"). El orden queda así, de 9 a 10 etapas:

1. Marco (publicada).
2. Núcleo jugable (publicada).
3. Movimientos (publicada).
4. **Mantener y soltar** (este documento).
5. **Tramos al azar:** la pista se arma distinta en cada partida con piezas diseñadas a mano, ya con
   todos los obstáculos de las etapas 3 y 4; siempre hay un camino posible; la chatarra suma puntos.
6. Personaje final (era la 5).
7. Tierra baldía completa (era la 6).
8. Historia (era la 7).
9. Cristal completo (era la 8).
10. Pulido y lanzamiento del Capítulo 1 (era la 9).

La sección 10 del documento general se actualiza en el mismo cambio que este documento. Los hitos de
GitHub se renombran y se agrega uno: lo hace David, o Claude si David le da permiso (en la etapa 3 el
sistema de permisos no dejó cerrar el hito 3 desde aquí).

## 3. Metas, no-metas y anti-metas

**Metas**
- Cinco gestos de mantener y soltar: colgarse del cable, deslizarse, planear con una lona, la
  tirolesa y el disparo cargado.
- Obstáculos nuevos para el 2D, animados: tubos largos, bola de demolición, prensa, escombros que
  caen, barriles y llantas que ruedan, plataformas que se derrumban, resorte y rejillas de vapor.
- Una ruta de arriba y otra de abajo en el 2D (plataformas altas a las que se llega con el resorte o
  la tirolesa).
- Un dron blindado en la zona de armas, que solo cae con el disparo cargado.
- Trepar más rápido, con una animación ágil.
- Pulido de las animaciones del corredor y del entorno donde viven los obstáculos.
- Controles pensados primero para el celular: más rápidos de reconocer y sin choques con los gestos
  del sistema del iPhone.
- Arreglar lo que quedó pendiente de la etapa 3 (sección 10).
- El tramo 1 crece para enseñar todo lo nuevo, con una pista en pantalla para cada gesto.

**No-metas** (van en otras etapas)
- Tramos que se mezclan al azar y la chatarra (etapa 5). En esta etapa los obstáculos se ponen a
  mano. La ruta de arriba lleva habilidades y puntos por "¡Justo!"; la chatarra llega en la etapa 5.
- Versiones en 3D de los obstáculos nuevos del 2D (etapa 5 las puede mezclar en carriles). En 3D
  solo cambia la zona de armas (disparo cargado y dron blindado).
- El personaje final con ropa (etapa 6). Se sigue usando el maniquí.
- Criaturas, combate, punto de control y jefe (etapa 7).
- Sonido, pausa y resultados completos (etapa 10).

**Anti-metas.** La etapa falla aunque funcione si:
- Mantener el dedo en el iPhone abre la lupa, selecciona texto, muestra un menú o hace vibrar el
  sistema.
- Un gesto se confunde con otro: un mantener que también salta dos veces, un deslizar abajo que rueda
  y además se desliza, o un toque que se lee como mantener.
- Un obstáculo pega sin que se pudiera ver venir: todo obstáculo que se mueve se lee desde lejos y su
  movimiento no depende del azar.
- Un obstáculo se ve como una caja lisa, flota o atraviesa el suelo, o un objeto del escenario flota
  sobre un foso.
- El corredor salta de una pose a otra, se desliza quieto o mueve los pies sin avanzar.
- La carrera baja de 60 cuadros por segundo en el iPhone de David.
- Se usa un recurso con una licencia que no permite el repositorio público.

## 4. Restricciones

Las de los documentos anteriores, en especial:
- **El celular manda** (pedido de David): iPhone 16 Pro en horizontal, un pulgar. El teclado sigue
  funcionando, pero no se pule para PC.
- Licencias: CC0 y CC-BY con crédito. Nada de CC-BY-SA, NC, ND ni Mixamo.
- Repositorio público: sin secretos ni rutas personales.
- Todos los textos en `src/textos/es.ts`, en español.
- Puertos de NEXO: 5331 (desarrollo), 5332 (sitio armado) y 5330 (prototipo).
- David revisa en local antes de publicar. Se sube a GitHub solo con su visto bueno.
- Rendimiento: como máximo 150 llamadas de dibujo por cuadro en la carrera (calidad alta) y 60
  cuadros por segundo en el iPhone de David.
- **El iPhone no deja vibrar desde una página web.** Todo aviso y todo golpe tiene que verse en la
  pantalla; la vibración queda solo como extra en Android.

## 5. Mantener y soltar: cómo se reconocen los gestos

Hoy el juego decide el gesto al levantar el dedo. Para mantener y soltar eso cambia (decisión de
Claude):

| Gesto | Cuándo se reconoce | Qué es |
|---|---|---|
| Tocar | al levantar el dedo, si fue corto y casi no se movió | igual que hoy |
| Deslizar | apenas el dedo pasa los 40 px en un sentido, **sin esperar a que se levante** | más rápido de reconocer que hoy |
| Mantener | el dedo quieto (sin pasar los 40 px) unos 0,18 s | gesto nuevo |
| Soltar | al levantar el dedo después de un mantener, o después de un deslizar abajo mantenido | gesto nuevo |

- Un gesto da una sola acción: un mantener no es además un toque, y un deslizar no es además un
  toque.
- **Dedo apoyado (decisión de Claude):** para colgarse, la tirolesa y la lona cuenta que el dedo
  esté apoyado, venga de donde venga. Es lo normal con el pulgar: desliza arriba para saltar y se
  queda en la pantalla.
  - Si al agarrar el cable o la tirolesa el dedo está apoyado, levantarlo suelta.
  - Con la lona, el dedo que lleva 0,18 s apoyado en el aire la abre, también después de deslizar
    arriba.
  - Un mantener (dedo quieto 0,18 s) da su acción una sola vez: en el suelo salta; en el aire sin
    lona es el doble salto, si lo tiene, para que un toque lento no lo pierda; con lona abre la
    lona.
  - El dedo que se queda apoyado después de deslizar arriba no da otra acción: no salta dos veces.
- Un solo dedo a la vez, como hasta ahora. El segundo dedo se ignora mientras el primero está
  apoyado.
- **Sin gestos del sistema:** la superficie del juego no deja que el iPhone abra la lupa, seleccione,
  muestre menús ni haga el toque largo del sistema. Se prueba en el iPhone de David y en el proyecto
  `iphone` de Playwright.
- **Respuesta al mantener:** cuando se reconoce, aparece bajo el dedo un anillo celeste fino; en el
  disparo cargado se llena con la carga. Se va al soltar. Con movimiento reducido aparece sin
  animación.
- **Teclado:** mantener espacio es mantener; mantener flecha abajo o S es deslizarse; mantener X
  carga el disparo.

## 6. Los gestos nuevos

Números de partida (decisión de Claude, se ajustan al probar). Los de la etapa 3 siguen igual salvo
el trepar.

### 6.1 Mantener en el suelo
Mantener en el suelo, sin nada especial alrededor, **salta** al reconocerse el mantener (como un
toque, pero sin esperar a levantar el dedo). Si se sigue manteniendo en el aire, el corredor queda
listo para agarrar el cable o la tirolesa, o para planear si tiene la lona. Así un solo gesto, "toca y
mantén", sirve para todo lo de colgarse y planear.

### 6.2 Colgarse del cable (cambia el de la etapa 3)
- **Agarrar:** igual que en la etapa 3, al pasar por el cable en el aire.
- **Colgado con el dedo apoyado: vaivén de ida y vuelta** (David, 2026-11-08). Mientras mantiene, el
  corredor se balancea adelante y atrás sobre el foso, como un columpio. La pista ya no avanza sola:
  el corredor va y viene con el cable y la cámara lo sigue.
  - **Soltar yendo hacia adelante** lo lanza hacia adelante. Soltar en lo más alto del vaivén
    hacia adelante es la franja buena: da el "¡Justo!" (+50) y el salto más largo. Soltar muy
    pronto puede no alcanzar el otro lado, como en la etapa 3.
  - **Soltar yendo hacia atrás** lo deja caer al foso: pierde una vida y reaparece al otro lado, con
    la regla de fosos de la etapa 3.
  - **Sentido que se lee:** el cable, el cuerpo y las piernas dejan ver hacia dónde va. Las piernas
    se adelantan al ir hacia adelante y quedan atrás al volver.
  - **Si mantiene sin soltar,** después de tres vaivenes completos el corredor se cansa y se suelta
    solo en lo más alto del siguiente vaivén hacia adelante: pasa, sin "¡Justo!" (decisión de
    Claude). Así la carrera nunca se queda quieta.
  - **El contador de metros no baja** mientras va hacia atrás (decisión de Claude).
  - El vaivén es igual en cada cable: siempre de la misma altura, sin azar.
- **Si agarró sin tener el dedo apoyado:** hace un solo vaivén hacia adelante, como en la etapa 3.
  Un toque lo suelta, y si no toca se suelta solo al final y pasa.
- **Gracia de agarre:** durante los primeros 0,15 s colgado no se suelta. Así un doble toque al
  llegar al cable no lo tira al foso (pendiente de la etapa 3).
- **Los cables siguen en el 2D,** como en la etapa 3.
- **Animación:** sale de `Colgar_Loop`, con el cuerpo inclinado según el ángulo del cable y las
  piernas que acompañan el vaivén. Puede ser un clip propio de Blender (`Columpio_Loop`).
- **Pista:** "Mantén para balancearte · suelta yendo adelante".

### 6.3 Deslizarse
- **Cómo:** deslizar hacia abajo en el suelo y **dejar el dedo apoyado**.
- **Qué hace:** el corredor se desliza con los pies por delante mientras mantiene, a 0,9 m de alto
  como al rodar. Dura al menos lo que un giro (0,7 s) y sigue mientras se mantenga.
- **Deslizar abajo y levantar enseguida** (antes de unos 0,2 s) sigue siendo **rodar**, como en la
  etapa 3.
- **Bajo un tubo:** si suelta debajo, sigue deslizándose hasta salir, sin golpe. Nunca se traba.
- **Entrar de pie a un tubo** golpea una vez (pierde una vida o el escudo) y lo hace deslizarse hasta
  el final.
- **Caída rápida y mantener:** si en el aire desliza abajo y deja el dedo, al tocar el suelo se
  desliza en vez de rodar.
- **Saltar corta el deslizamiento,** como corta el giro.
- **Animación:** `Slide_Start`, `Slide_Loop` y `Slide_Exit` de UAL2 (CC0). Con polvo que levanta
  bajo los pies.
- **Pista:** "Desliza abajo y mantén para deslizarte".

### 6.4 Planear con la lona
- **La lona se recoge** en una estación al empezar una **zona de viento** en 2D, como el arma en la
  zona de armas. Al final de la zona el viento la rompe y sale el aviso "El viento rompió la lona".
- **Cómo:** con la lona, mantener en el aire la abre. El corredor baja despacio (unos 1,5 m/s) y
  sigue avanzando. Soltar la cierra y cae normal.
- **Rejillas de vapor:** en el fondo de los fosos anchos de la zona. Planeando sobre una, el vapor lo
  sube. Así se cruzan fosos de 15 a 30 m encadenando rejillas.
- **Sin la lona,** el vapor da solo un empujón pequeño hacia arriba y no hace daño.
- **Con la lona, tocar en el aire** sigue siendo el doble salto si tiene la habilidad.
- **Animación:** propia, hecha en Blender sobre el mismo esqueleto (`Planear_Loop`): brazos arriba
  agarrando la barra de la lona y piernas sueltas. La lona es una tela que ondea.
- **Pista:** "Mantén en el aire para planear".

### 6.5 La tirolesa
- **Qué es:** un cable inclinado que baja desde un poste alto, en una plataforma de la ruta de
  arriba, hasta un ancla adelante (15 a 30 m).
- **Agarrar:** al pasar por la manija del principio, en el aire o corriendo por el borde de la
  plataforma.
- **Colgado:** baja rápido por el cable, más rápido que corriendo. Mientras mantiene, sigue colgado;
  **soltar el dedo lo suelta** y cae donde esté. Si agarró sin el dedo apoyado, un toque lo suelta.
  Al final se suelta solo y cae en la ruta de abajo.
- **Elegir la ruta:** debajo de la tirolesa hay plataformas. Soltarse sobre una deja al corredor en
  la ruta de arriba; seguir hasta el final lo deja abajo. Las dos rutas se pueden pasar.
- **Animación:** propia (`Tirolesa_Loop`): colgado de una polea con las dos manos, piernas juntas y
  un leve vaivén. Parte de `Colgar_Loop`.
- **Pista:** "Mantén en la tirolesa · suelta sobre una plataforma".

### 6.6 El disparo cargado
- **Dónde:** en la zona de armas (3D), con el arma.
- **Cómo:** mantener carga el disparo. A los 0,6 s está lleno: el anillo bajo el dedo se completa y
  la pistola brilla en celeste. Soltar dispara.
- **Lleno:** sale un disparo que atraviesa todos los drones de su carril hasta el alcance, y rompe
  los drones blindados.
- **Sin llenar:** sale un disparo normal.
- **Tocar** sigue siendo el disparo normal, y deslizar arriba sigue saltando.
- **Dron blindado:** con placas de metal. Los disparos normales rebotan con una chispa. Lo rompen el
  disparo cargado y el turbo. Se esquiva igual que un dron (carril o rodando). Derribarlo da 100.
- **Animación:** el torso apunta (`Pistol_Aim_Neutral`) con la pistola cargándose, y el disparo
  cargado tiene un retroceso más fuerte que el normal.
- **Pista:** "Mantén para cargar · suelta para disparar".

### 6.7 Trepar más rápido (pedido de David)
- Saltando contra el contenedor: de 0,45 s a unos 0,28 s.
- Llegando por el suelo (con golpe): de 0,8 s a unos 0,5 s.
- **Mientras trepa sigue avanzando** un poco (no se detiene la pista), pero nunca atraviesa el
  contenedor (regla de la revisión de la etapa 3).
- **Animación:** un trepar ágil, como apoyar la mano y pasar las piernas. Puede salir de
  `ClimbUp_1m` recortado y acelerado, o de un clip propio en Blender. El cuerpo nunca se ve más alto
  que el corredor real; al terminar no hay salto de pose.

## 7. Los obstáculos nuevos del 2D

**Regla para todos los que se mueven:** su movimiento va sincronizado con la llegada del corredor.
Siempre piden el mismo gesto, nunca dependen del azar, y su movimiento se ve venir al menos 1,5 s
antes a la velocidad máxima (12 m/s).

| Obstáculo | Cómo se ve y se mueve | Cómo se pasa |
|---|---|---|
| **Tubo largo** | Tubería industrial baja y oxidada, de 3 a 20 m, apoyada en soportes | Deslizarse manteniendo (rodando solo si es corto) |
| **Bola de demolición** | Cuelga de una grúa con cadena y se balancea a lo largo de la pista | Cadena corta: pasa a la altura de la cabeza, se rueda o desliza por debajo. Cadena larga: pasa baja, se salta. El largo de la cadena se ve de lejos |
| **Prensa** | Martillo hidráulico de una fábrica rota, con pistones, luz de aviso y vapor | Golpea el suelo justo antes de que llegues y queda abajo como un bloque bajo: se salta. La luz de aviso parpadea antes de cada golpe |
| **Escombros** | Bloques de concreto que caen del cielo con polvo | Una sombra en el suelo avisa dónde caen; caen antes de que llegues y quedan como un bloque: se saltan |
| **Barril** | Rueda hacia el corredor levantando polvo | Se salta |
| **Llanta** | Rebota hacia el corredor | Se pasa por debajo cuando sube o se salta cuando baja (quien construye fija una sola forma por llanta para que siempre pida lo mismo) |
| **Plataforma que se derrumba** | Pasarela de chatarra de la ruta de arriba | Tiembla al pisarla y cae unos 0,5 s después: hay que saltar a la siguiente. Si cae con el corredor encima, baja a la ruta de abajo sin perder vida |
| **Resorte** | Placa con un resorte grande | Pisarlo lanza al corredor alto, hasta la ruta de arriba. Saltarlo deja al corredor abajo |
| **Rejilla de vapor** | Rejilla en el fondo de un foso ancho, con columnas de vapor | Con la lona, sube al planear encima (sección 6.4) |

**Golpes:** chocar con cualquiera de estos quita una vida (o el escudo), con la sacudida de cámara y
el destello del golpe. El turbo rompe barriles, llantas y escombros, pero no la bola ni la prensa.

## 8. La ruta de arriba y la de abajo (2D)

- **Plataformas altas** de chatarra y andamios, a unos 3,5 m, con barandas. Se llega con el resorte o
  bajando de la tirolesa, y se baja cayendo por el borde.
- **Las dos rutas se pueden pasar.** La de arriba evita algunos obstáculos de abajo, tiene
  plataformas que se derrumban y lleva habilidades. La de abajo tiene los obstáculos de la tabla.
- **Cámara en 2D:** sube y se aleja un poco cuando el corredor está arriba o planeando alto, para que
  siempre se vea el obstáculo siguiente con al menos 1,5 s de anticipación.
- **Aterrizar desde alto** (3 m o más) usa una animación de aterrizaje fuerte (`NinjaJump_Land` de
  UAL2) en vez de la normal.

## 9. Pulido de animación y de entorno (prioridad de David)

**El corredor**
- Cada gesto nuevo tiene su animación y se mezcla con las demás en unos 0,12 s, como en las etapas 2
  y 3.
- Animaciones nuevas: deslizarse (UAL2), planear, tirolesa y trepar ágil (propias o recortadas),
  aterrizaje fuerte (UAL2), salir lanzado por el resorte (`NinjaJump_Start` de UAL2) y el disparo
  cargado.
- **La pistola sigue la mano también al girar:** hoy queda horizontal mientras rueda o trepa armado
  (decisión de la etapa 3 que se corrige).
- El polvo al aterrizar, deslizarse o caer escombros, el vapor y las chispas son partículas baratas
  para el celular.

**Los obstáculos**
- **Modelos propios hechos en Blender por script,** como la pistola y el dron: tubo, grúa con bola y
  cadena, prensa, bloques de escombro, barril, llanta, plataformas, resorte, rejilla, poste y polea
  de la tirolesa, estación y tela de la lona, y el dron blindado. Sin descargar paquetes nuevos (si
  David autoriza una descarga CC0, se puede usar).
- Materiales de la Tierra baldía: concreto, óxido, metal pintado y gastado, tela; colores naturales
  del atardecer. El celeste de la torre sigue siendo la única luz artificial (anillo de carga,
  pistola cargada, luces de la zona de armas). La luz de aviso de la prensa es ámbar tenue, no un
  color nuevo saturado.
- **Cada uno se anima:** la bola se balancea con su cadena; la prensa sube con sus pistones, avisa
  y golpea con polvo; los escombros caen girando y se rompen en pedazos; barriles y llantas giran al
  rodar; las plataformas tiemblan y se desarman; el resorte se comprime y se estira; la lona ondea.

**El entorno**
- Una **zona industrial** dentro del tramo (una fábrica y un patio de chatarra en ruinas) para que
  grúas, prensas y tubos tengan sentido: grúas, andamios y tanques de fondo, con el mismo estilo de
  los edificios en ruinas.
- Nada flota: los escombros y postes del fondo no quedan sobre el hueco de los fosos (pendiente de la
  etapa 3).

**Vista previa para David:** antes de meter los obstáculos y las animaciones nuevas en el tramo,
David los ve en una página de vista previa en su iPhone (cada obstáculo animado y cada pose del
corredor) y la aprueba. Si algo no le gusta, se ajusta antes de seguir.

## 10. Lo que queda pendiente de la etapa 3 y se arregla aquí

- **La física por pasos fijos** (por ejemplo 1/120 s), igual a 60 y a 120 cuadros por segundo. Así el
  "¡Justo!" en la valla alta se puede lograr, los obstáculos sincronizados caen siempre igual y el
  turbo no atraviesa vigas en un cuadro lento.
- **Gracia al agarrar el cable** (sección 6.2).
- **Escombros que flotan sobre los fosos** (sección 9).
- **Validación de tramos:** foso con cable de 12 m como máximo, ninguna viga encima de un contenedor,
  y las reglas de los obstáculos nuevos (por ejemplo, una zona de viento cerrada por el final que
  rompe la lona, rejillas solo dentro de fosos de la zona de viento, una tirolesa que empieza en una
  plataforma).
- **`?desde` en el metro exacto** de un foso o contenedor empieza en un estado posible.
- **Llamadas de dibujo medidas** también en la sección de cables y en la zona industrial.

## 11. El tramo 1, más largo

- Crece a unos 900 a 1000 m (decisión de Claude). Lo de la etapa 3 se mantiene, más corto donde
  convenga, y se agrega la zona industrial en 2D.
- **Orden de enseñanza:** cada gesto nuevo aparece primero solo, con su pista y espacio de sobra.
  Después se mezcla con los anteriores.
  1. Deslizarse bajo tubos de largo creciente.
  2. Barriles, escombros, prensa, bola y llantas, uno por uno.
  3. El resorte, la ruta de arriba y las plataformas que se derrumban.
  4. La tirolesa, con la opción de quedarse arriba o bajar.
  5. La zona de viento: la lona, planear y las rejillas sobre fosos anchos.
  6. En la zona de armas (3D): el disparo cargado y los drones blindados.
- **Los cables de la etapa 3** enseñan ahora el vaivén de ida y vuelta, con su pista nueva.
- **Pistas en pantalla** como las de la etapa 3: una a la vez, cada una se va al hacer el gesto, y
  nunca sale con otro obstáculo de otro gesto delante.
- **Avisos nuevos:** "Lona lista: mantén en el aire para planear" y "El viento rompió la lona".
- Siempre hay tiempo para ver y reaccionar a 12 m/s. Una prueba recorre el tramo entero con la
  simulación y usa cada gesto, como el piloto de la etapa 3.

## 12. Construcción técnica (decisiones de Claude)

- **Controles** (`src/entrada/controles.ts`): reconocen tocar, deslizar (al pasar el umbral),
  mantener y soltar, con pruebas para cada combinación. Las intenciones nuevas llegan a la carrera,
  que decide qué hacen según el momento.
- **Reglas en `simulacion.ts`,** sin Three.js:
  - los estados nuevos del corredor (deslizándose, planeando, en la tirolesa);
  - el cable como péndulo de ida y vuelta (sección 6.2): mientras va hacia atrás, la distancia del
    corredor baja, pero el contador y los puntos usan la más lejana;
  - la lona, las rejillas, la ruta de arriba (el suelo bajo el corredor puede estar a 0, 2 o 3,5 m,
    o no haber suelo);
  - los obstáculos que se mueven, calculados a partir de la distancia, para que sean siempre iguales
    y se puedan probar;
  - el disparo cargado y el dron blindado;
  - el paso fijo de la física.
- **Modelos:** un script de Blender nuevo para los obstáculos (`public/modelos/obstaculos.glb`, meta
  de peso unos 400 KB). Las animaciones propias nuevas se suman a `corredor.glb` (meta: menos de
  800 KB). Las piezas que se repiten se dibujan juntas para no pasar de 150 llamadas de dibujo.
- **Créditos:** las piezas nuevas de Blender se anotan como propias en `CREDITOS.md` y en
  `LICENCIAS.txt` del sitio.
- **Modo de prueba:** `window.nexo.accion()` acepta mantener y soltar. `?desde=N` aplica lo que ya
  habría pasado (arma, lona, EMP, viento).
- **Pruebas:**
  - cada regla nueva en Vitest;
  - en el navegador, los proyectos `celular` e `iphone` mandan; el de escritorio queda como
    comprobación;
  - al final, revisión en el iPhone de David.

## 13. Riesgos

- **Gestos en el iPhone:** el toque largo del sistema y la diferencia entre tocar, mantener y
  deslizar son lo más delicado. Se construyen primero y se prueban pronto en el iPhone de David,
  antes de construir lo demás encima.
- **Animaciones propias** (planear, tirolesa, trepar ágil): si una se ve rígida, se reemplaza por una
  pose fija bien hecha con un leve movimiento, como se acordó para colgarse en la etapa 3.
- **La ruta de arriba** cambia la cámara del 2D y el suelo bajo el corredor. Necesita pruebas de cada
  borde: subir con el resorte, caer de una plataforma, una plataforma que se derrumba con el corredor
  encima y soltarse de la tirolesa sobre una plataforma o fuera de ella.
- **Rendimiento:** muchos obstáculos animados y partículas a la vez. Se mide en la zona industrial y
  en la zona de viento.
- **El cable de ida y vuelta** rehace el de la etapa 3: la distancia del corredor puede ir hacia
  atrás. Necesita pruebas de soltar hacia adelante (pronto, en lo alto), hacia atrás y al cansarse,
  y que los fosos con cable siempre se puedan cruzar soltando en la franja buena.
- **Tamaño:** es la etapa más grande hasta ahora. La vista previa para David a mitad de camino evita
  pulir de más algo que no le guste.

## 14. Lo que queda en manos de quien construye

- Las distancias y el ritmo exactos del tramo, dentro del orden de la sección 11.
- Los números finos: umbral de mantener, velocidad de planeo y de la tirolesa, empuje de las
  rejillas, tiempos del derrumbe, carga del disparo y los tiempos del trepar.
- La forma exacta de cada obstáculo y del fondo industrial, dentro del estilo de la Tierra baldía.
- Si el trepar ágil sale de `ClimbUp_1m` o de un clip propio.
- La organización interna del código, siguiendo la de las etapas 2 y 3.

## 15. Decisiones de Claude para que David revise

- **Mantener en el suelo salta,** para que "toca y mantén" sirva para colgarse y planear.
- **Colgado del cable o de la tirolesa, levantar el dedo te suelta.** Si llegaste sin el dedo
  apoyado, un toque te suelta; si no haces nada, te sueltas solo al final y pasas.
- **Cuenta el dedo apoyado, venga de donde venga** (sección 5): el pulgar que desliza arriba y se
  queda en la pantalla sirve para colgarse y para la lona, sin saltar dos veces.
- **En el cable, después de tres vaivenes te cansas** y te sueltas solo hacia adelante, sin
  "¡Justo!". El vaivén de ida y vuelta lo eligió David; esto es para que la carrera nunca se quede
  quieta.
- **El contador de metros no baja** cuando el vaivén va hacia atrás.
- **Deslizar abajo y levantar enseguida sigue siendo rodar;** dejar el dedo es deslizarse.
- **La lona solo existe en las zonas de viento,** como el arma en la zona de armas. Si se pudiera
  planear siempre, cualquier foso se cruzaría sin esfuerzo.
- **Los obstáculos de esta etapa son para el 2D;** en 3D solo cambia la zona de armas.
- **El dron blindado** solo cae con el disparo cargado o el turbo.
- **La ruta de arriba lleva habilidades;** la chatarra llega en la etapa 5.
- **Una plataforma que se derrumba contigo encima** te baja a la ruta de abajo sin quitarte vida.
- **Los modelos nuevos son propios,** hechos en Blender por script, sin descargas.
- **El tramo 1 crece a unos 900 a 1000 m.**
- **Las etapas pasan de 9 a 10** (sección 2).
