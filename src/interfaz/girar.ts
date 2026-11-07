import { TEXTOS } from '../textos/es';
import { ICONOS } from './iconos';

/**
 * "Gira el celular": NEXO se juega en horizontal. El CSS lo muestra solo en vertical
 * y con pantalla táctil (@media (orientation: portrait) and (pointer: coarse)).
 */
export function crearAvisoGirar(contenedor: HTMLElement): { visible(): boolean } {
  const aviso = document.createElement('div');
  aviso.className = 'girar';
  aviso.innerHTML = `${ICONOS.girar}<p class="titulo"></p><p></p>`;
  const [titulo, texto] = aviso.querySelectorAll('p');
  titulo.textContent = TEXTOS.girar.titulo;
  texto.textContent = TEXTOS.girar.texto;
  contenedor.append(aviso);
  // Lo decide el CSS: se pregunta a la página si el aviso ocupa lugar (display: none no tiene cajas).
  return { visible: () => aviso.getClientRects().length > 0 };
}
