import { NIVELES, type NivelCalidad } from '../render/calidad';

/** Opciones de la dirección (?prueba=1 ...). Cada etapa agrega las suyas. */
export interface Parametros {
  prueba: boolean;
  /** Muestra cuadros por segundo y llamadas de dibujo. */
  fps: boolean;
  /** Calidad pedida a mano (?calidad=alto|medio|bajo); null si no se pidió o no existe. */
  calidad: NivelCalidad | null;
  /** Hace fallar la carga una vez para probar "Reintentar". Solo vale con ?prueba=1. */
  fallarCarga: boolean;
  /** Metros desde donde empieza la carrera (?desde=80). Solo vale con ?prueba=1; null si no se pidió. */
  desde: number | null;
  /** La carrera no quita vidas (?dios=1). Solo vale con ?prueba=1. */
  dios: boolean;
}

export function leerParametros(busqueda: string): Parametros {
  const p = new URLSearchParams(busqueda);
  const calidad = p.get('calidad');
  const prueba = p.get('prueba') === '1';
  const desde = Number(p.get('desde') ?? NaN);
  return {
    prueba,
    fps: p.get('fps') === '1',
    calidad: NIVELES.includes(calidad as NivelCalidad) ? (calidad as NivelCalidad) : null,
    fallarCarga: prueba && p.get('fallarCarga') === '1',
    desde: prueba && Number.isFinite(desde) && desde >= 0 ? desde : null,
    dios: prueba && p.get('dios') === '1',
  };
}

const CONSULTA_MOVIMIENTO = '(prefers-reduced-motion: reduce)';

/** Ajuste del sistema "reducir movimiento": sin vaivén, sin desplazamientos, sin destellos. */
export function movimientoReducido(): boolean {
  return typeof matchMedia === 'function' && matchMedia(CONSULTA_MOVIMIENTO).matches;
}
