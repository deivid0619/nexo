import { NIVELES, type NivelCalidad } from '../render/calidad';

/** Opciones de la dirección (?prueba=1 ...). Cada etapa agrega las suyas. */
export interface Parametros {
  prueba: boolean;
  /** Muestra cuadros por segundo y llamadas de dibujo. */
  fps: boolean;
  /** Calidad pedida a mano (?calidad=alto|medio|bajo); null si no se pidió o no existe. */
  calidad: NivelCalidad | null;
}

export function leerParametros(busqueda: string): Parametros {
  const p = new URLSearchParams(busqueda);
  const calidad = p.get('calidad');
  return {
    prueba: p.get('prueba') === '1',
    fps: p.get('fps') === '1',
    calidad: NIVELES.includes(calidad as NivelCalidad) ? (calidad as NivelCalidad) : null,
  };
}

const CONSULTA_MOVIMIENTO = '(prefers-reduced-motion: reduce)';

/** Ajuste del sistema "reducir movimiento": sin vaivén, sin desplazamientos, sin destellos. */
export function movimientoReducido(): boolean {
  return typeof matchMedia === 'function' && matchMedia(CONSULTA_MOVIMIENTO).matches;
}
