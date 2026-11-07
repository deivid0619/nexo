/** Opciones de la dirección (?prueba=1 ...). Cada etapa agrega las suyas. */
export interface Parametros {
  prueba: boolean;
}

export function leerParametros(busqueda: string): Parametros {
  const p = new URLSearchParams(busqueda);
  return {
    prueba: p.get('prueba') === '1',
  };
}

const CONSULTA_MOVIMIENTO = '(prefers-reduced-motion: reduce)';

/** Ajuste del sistema "reducir movimiento": sin vaivén, sin desplazamientos, sin destellos. */
export function movimientoReducido(): boolean {
  return typeof matchMedia === 'function' && matchMedia(CONSULTA_MOVIMIENTO).matches;
}
