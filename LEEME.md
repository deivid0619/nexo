# NEXO

Corredor futurista para celular: corres en 2D, cruzas un portal y el juego pasa a 3D.
Un jugador, dos niveles y un jefe al final de cada uno (Centinela e Hidra).

## Jugar en línea

https://deivid0619.github.io/nexo/

## Jugar en el computador (desde esta carpeta)

```bash
python -m http.server 5330 --bind 127.0.0.1
```

Abrir http://127.0.0.1:5330

## Jugar en el celular (misma red Wi-Fi)

```bash
python -m http.server 5330
```

En el celular abrir `http://IP-DEL-COMPUTADOR:5330` (la IP sale con `ipconfig`, "Dirección IPv4").
Si Windows pregunta por el firewall, permitir redes privadas. Necesita internet (Three.js y la fuente se cargan de un CDN).

## Controles

- Tocar: saltar (o disparar si tienes arma)
- Deslizar hacia arriba: saltar
- Deslizar a los lados: cambiar de carril en 3D
- Teclado: espacio o flecha arriba, flechas a los lados, X para disparar

## Opciones para probar

- `?desde=440` empezar en esa distancia del nivel (440 = justo antes del portal del jefe)
- `?nivel=2` empezar en el nivel 2
- `?dios=1` no recibir daño
- `?prueba=1` expone `window.nexo` para avanzar el juego desde la consola

## Archivos

- `index.html` pantallas (menú, HUD, fin)
- `estilos.css` estilos
- `juego.js` todo el juego: nivel, personaje, obstáculos, habilidades, armas, jefes, cámara 2D/3D
