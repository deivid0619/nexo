# Créditos

Todo lo que usa NEXO y que no se hizo para el juego, con su autor, enlace y licencia.
Solo se aceptan recursos que se puedan redistribuir en un repositorio público
(CC0, CC-BY con crédito, o licencias libres de código y fuentes como MIT, OFL y Apache).

## Código

| Recurso | Autor | Enlace | Licencia |
|---|---|---|---|
| three.js | three.js authors | https://github.com/mrdoob/three.js | MIT |

## Fuentes

| Recurso | Autor | Enlace | Licencia |
|---|---|---|---|
| Syncopate | Astigmatic (Brian J. Bonislawsky) | https://fonts.google.com/specimen/Syncopate | Apache-2.0 |
| Barlow | Jeremy Tribby | https://fonts.google.com/specimen/Barlow | OFL-1.1 |
| Barlow Condensed | Jeremy Tribby | https://fonts.google.com/specimen/Barlow+Condensed | OFL-1.1 |

Las fuentes se incluyen con los paquetes de Fontsource (https://fontsource.org).
El sitio publicado lleva los textos completos de estas licencias en `avance/LICENCIAS.txt`
(lo arma `scripts/armar-sitio.mjs`), porque el build quita los comentarios de licencia.

## Modelos y animaciones

| Recurso | Autor | Enlace | Licencia |
|---|---|---|---|
| Maniquí y animaciones del corredor (`public/modelos/corredor.glb`): Universal Animation Library, versión Standard | Quaternius | https://quaternius.com/packs/universalanimationlibrary.html | CC0 1.0 |
| Más animaciones del corredor (trepar, empujón, escudo roto, doble salto y celebrar): Universal Animation Library 2, versión Standard | Quaternius | https://quaternius.com/packs/universalanimationlibrary2.html | CC0 1.0 |

El corredor es provisional: el personaje final con ropa llega en la etapa 5. El archivo junta
16 animaciones de los dos paquetes y la propia de colgarse, y se comprime con
`scripts/preparar-corredor.mjs`.

Piezas propias de NEXO, hechas con los scripts de `scripts/blender/`:
- la pistola y el dron (`public/modelos/utileria.glb`, con `utileria.py`);
- la animación `Colgar_Loop` del corredor colgado del cable (con `colgar.py`).

## Íconos

| Recurso | Autor | Enlace | Licencia |
|---|---|---|---|
| Tabler Icons 3.19.0 (lock, check, arrow-right, arrow-left, x, heart, crosshair, device-mobile-rotated) | Paweł Kuna | https://tabler.io/icons | MIT |

## Prototipo (`prototipo/`)

El prototipo no incluye estos archivos: los carga de un CDN al abrirse.

| Recurso | Autor | Enlace | Licencia |
|---|---|---|---|
| three.js 0.160.0 (por jsDelivr) | three.js authors | https://github.com/mrdoob/three.js | MIT |
| Chakra Petch (por Google Fonts) | Cadson Demak | https://fonts.google.com/specimen/Chakra+Petch | OFL-1.1 |
