import { VIDAS } from '../../juego/simulacion';
import type { HudCarrera, PistaHud, ResultadoCarrera } from '../../juego/carrera';
import { TEXTOS } from '../../textos/es';
import { formatearPuntaje } from '../../textos/formato';
import type { Pantalla } from '../gestor-pantallas';
import { ICONOS } from '../iconos';

interface Dependencias {
  /** La pantalla entra (ya con la cortina cubriendo): empieza una carrera. */
  alAbrir(): void;
  /** La pantalla sale: se detiene la carrera. */
  alCerrar(): void;
  alReintentar(): void;
  /** Salir o "Volver al mapa". */
  alVolver(): void;
}

export type PantallaJuego = Pantalla & HudCarrera & {
  /** Donde se toca para jugar: toda la pantalla menos los botones. */
  superficie: HTMLElement;
};

/**
 * La carrera: arriba a la izquierda Salir y las vidas; arriba a la derecha el puntaje y el avance
 * del tramo; abajo al centro la pista de cómo se juega; al terminar, un panel con el resultado.
 */
export function crearPantallaJuego(deps: Dependencias): PantallaJuego {
  const t = TEXTOS.juego;
  const elemento = document.createElement('section');
  elemento.className = 'pantalla pantalla-juego';
  elemento.innerHTML = `
    <div class="velo-juego"></div>
    <div class="superficie-juego"></div>
    <div class="hud-estado">
      <button type="button" class="boton-icono boton-salir">${ICONOS.cerrar}</button>
      <div class="panel vidas" role="img">${`<span class="vida">${ICONOS.corazon}</span>`.repeat(VIDAS)}</div>
    </div>
    <div class="panel hud-puntaje">
      <div class="puntaje" aria-live="off"></div>
      <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="barra-relleno"></div></div>
    </div>
    <p class="panel pista-juego" hidden></p>
    <div class="telon fin-carrera" hidden>
      <div class="panel modal" role="dialog" aria-modal="true" aria-labelledby="fin-carrera-titulo">
        <div class="etiqueta"></div>
        <h2 class="titulo" id="fin-carrera-titulo"></h2>
        <div class="detalle"><div data-dato="puntaje"></div><div data-dato="record"></div></div>
        <div class="acciones"><button type="button" class="boton volver"></button><button type="button" class="cta otra"></button></div>
      </div>
    </div>`;
  const q = <T extends HTMLElement>(s: string) => elemento.querySelector<T>(s)!;
  const superficie = q('.superficie-juego');
  const salir = q('.boton-salir');
  salir.setAttribute('aria-label', t.salir);
  const vidas = q('.vidas');
  const corazones = [...elemento.querySelectorAll<HTMLElement>('.vida')];
  const puntaje = q('.puntaje');
  puntaje.setAttribute('aria-label', t.puntaje);
  const barra = q('.barra');
  barra.setAttribute('aria-label', t.avance);
  const relleno = q('.barra-relleno');
  const pista = q('.pista-juego');
  const fin = q('.fin-carrera');
  q('.fin-carrera .etiqueta').textContent = t.tramo;
  const titulo = q('.fin-carrera .titulo');
  const datoPuntaje = q('[data-dato="puntaje"]');
  const datoRecord = q('[data-dato="record"]');
  const volver = q('.fin-carrera .volver');
  volver.textContent = t.volverMapa;
  const otra = q('.fin-carrera .otra');
  elemento.querySelectorAll('svg').forEach((s) => s.setAttribute('aria-hidden', 'true'));

  salir.addEventListener('click', () => deps.alVolver());
  volver.addEventListener('click', () => deps.alVolver());
  otra.addEventListener('click', () => deps.alReintentar());

  // Solo se toca el DOM cuando cambia algo: el HUD se actualiza en cada cuadro.
  let ultimo = { vidas: -1, puntaje: -1, avance: -1 };

  const pantalla: PantallaJuego = {
    id: 'juego',
    cortina: true,
    elemento,
    superficie,
    alEntrar: () => deps.alAbrir(),
    alSalir: () => deps.alCerrar(),

    reiniciar() {
      fin.hidden = true;
      ultimo = { vidas: -1, puntaje: -1, avance: -1 };
    },

    actualizar(d) {
      if (d.vidas !== ultimo.vidas) {
        corazones.forEach((c, i) => c.classList.toggle('llena', i < d.vidas));
        vidas.setAttribute('aria-label', t.vidas.replace('{n}', String(d.vidas)).replace('{total}', String(VIDAS)));
      }
      if (d.puntaje !== ultimo.puntaje) puntaje.textContent = formatearPuntaje(d.puntaje);
      // La barra cambia de a medio por ciento: no hace falta repintarla cada cuadro.
      const avance = Math.round(d.avance * 200) / 2;
      if (avance !== ultimo.avance) {
        relleno.style.width = `${avance}%`;
        barra.setAttribute('aria-valuenow', String(Math.round(avance)));
      }
      ultimo = { vidas: d.vidas, puntaje: d.puntaje, avance };
    },

    pista(cual: PistaHud) {
      pista.hidden = cual === null;
      if (cual) pista.textContent = cual === 'saltar' ? t.pistaSaltar : t.pistaCarril;
    },

    terminar(r: ResultadoCarrera) {
      titulo.textContent = r.tipo === 'fin' ? t.fin : t.derrota;
      datoPuntaje.textContent = `${t.puntaje}: ${formatearPuntaje(r.puntaje)}`;
      datoRecord.textContent = r.nuevoRecord ? t.nuevoRecord : `${t.record}: ${formatearPuntaje(r.record)}`;
      otra.textContent = r.tipo === 'fin' ? t.repetir : t.reintentar;
      fin.hidden = false;
      otra.focus();
    },
  };
  return pantalla;
}
