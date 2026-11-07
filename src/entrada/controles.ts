/** Lo que el jugador quiere hacer, venga de un toque o de una tecla. */
export type Intencion = 'saltar' | 'izquierda' | 'derecha';

/** Desde cuántos píxeles un toque cuenta como deslizar (documento de diseño, sección 4). */
export const UMBRAL_DESLIZAR_PX = 40;

const TECLAS: Record<string, Intencion> = {
  ' ': 'saltar',
  arrowup: 'saltar',
  w: 'saltar',
  arrowleft: 'izquierda',
  a: 'izquierda',
  arrowright: 'derecha',
  d: 'derecha',
};

export interface Controles {
  activar(): void;
  desactivar(): void;
  destruir(): void;
}

/**
 * Un dedo: tocar salta, deslizar hacia arriba salta y deslizar a los lados cambia de carril.
 * Teclado: espacio, flecha arriba o W saltan; flechas o A/D cambian de carril.
 */
export function crearControles(superficie: HTMLElement, ventana: Window, alIntentar: (i: Intencion) => void): Controles {
  let activos = false;
  let inicio: { id: number; x: number; y: number } | null = null;

  const alBajar = (e: PointerEvent) => {
    if (!activos) return;
    inicio = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const alSubir = (e: PointerEvent) => {
    if (!activos || !inicio || inicio.id !== e.pointerId) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    inicio = null;
    if (Math.abs(dx) > UMBRAL_DESLIZAR_PX && Math.abs(dx) > Math.abs(dy)) alIntentar(dx > 0 ? 'derecha' : 'izquierda');
    // Un toque o deslizar hacia arriba saltan; deslizar hacia abajo no hace nada.
    else if (dy <= UMBRAL_DESLIZAR_PX) alIntentar('saltar');
  };
  const alCancelar = () => {
    inicio = null;
  };
  const alTecla = (e: KeyboardEvent) => {
    if (!activos || e.repeat) return;
    const intencion = TECLAS[e.key.toLowerCase()];
    if (!intencion) return;
    e.preventDefault();
    alIntentar(intencion);
  };
  const sinMenu = (e: Event) => e.preventDefault();

  superficie.addEventListener('pointerdown', alBajar);
  superficie.addEventListener('pointerup', alSubir);
  superficie.addEventListener('pointercancel', alCancelar);
  superficie.addEventListener('contextmenu', sinMenu);
  ventana.addEventListener('keydown', alTecla);

  return {
    activar() {
      activos = true;
    },
    desactivar() {
      activos = false;
      inicio = null;
    },
    destruir() {
      activos = false;
      superficie.removeEventListener('pointerdown', alBajar);
      superficie.removeEventListener('pointerup', alSubir);
      superficie.removeEventListener('pointercancel', alCancelar);
      superficie.removeEventListener('contextmenu', sinMenu);
      ventana.removeEventListener('keydown', alTecla);
    },
  };
}
