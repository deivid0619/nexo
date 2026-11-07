import { TEXTOS } from '../../textos/es';
import type { Pantalla } from '../gestor-pantallas';

interface Dependencias {
  frase: { texto: string; autor: string };
  consejo: string;
  alReintentar(): void;
}

/**
 * La carga del arranque: una frase de la radio del búnker, la barra con el avance real
 * y un consejo. Si algo falla, la fila de estado cambia por el mensaje y "Reintentar".
 */
export function crearPantallaCarga(
  deps: Dependencias,
): Pantalla & { progreso(fraccion: number): void; error(mensaje: string): void } {
  const t = TEXTOS.carga;
  const elemento = document.createElement('section');
  elemento.className = 'pantalla pantalla-carga';
  elemento.innerHTML = `
    <div class="logo pequeno carga-logo"></div>
    <div class="panel carga-panel">
      <div class="etiqueta carga-autor"></div>
      <p class="carga-frase"></p>
      <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="barra-relleno"></div>
      </div>
      <div class="etiqueta carga-estado"><span class="carga-tarea"></span><span class="carga-porcentaje">0 %</span></div>
    </div>
    <div class="carga-consejo"><div class="etiqueta"></div><p></p></div>`;
  const q = <T extends HTMLElement>(s: string) => elemento.querySelector<T>(s)!;
  q('.carga-logo').textContent = TEXTOS.juego.nombre;
  q('.carga-autor').textContent = deps.frase.autor;
  q('.carga-frase').textContent = deps.frase.texto;
  q('.carga-tarea').textContent = t.etiqueta;
  q('.carga-consejo .etiqueta').textContent = t.consejoTitulo;
  q('.carga-consejo p').textContent = deps.consejo;
  const barra = q('.barra');
  barra.setAttribute('aria-label', t.etiqueta);
  const relleno = q('.barra-relleno');
  const porcentaje = q('.carga-porcentaje');
  const estado = q('.carga-estado');

  return {
    id: 'carga',
    toma: 'carga',
    elemento,
    progreso(fraccion) {
      const f = Math.min(1, Math.max(0, fraccion));
      const p = Math.floor(f * 100);
      relleno.style.width = `${f * 100}%`;
      porcentaje.textContent = `${p} %`;
      barra.setAttribute('aria-valuenow', String(p));
    },
    error(mensaje) {
      const texto = document.createElement('span');
      texto.setAttribute('role', 'alert');
      texto.textContent = mensaje;
      const reintentar = document.createElement('button');
      reintentar.type = 'button';
      reintentar.className = 'cta';
      reintentar.textContent = t.reintentar;
      reintentar.addEventListener('click', () => deps.alReintentar());
      estado.classList.add('con-error');
      estado.replaceChildren(texto, reintentar);
      reintentar.focus();
    },
  };
}
