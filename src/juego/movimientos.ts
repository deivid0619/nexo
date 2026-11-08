// Los movimientos de la etapa 3: números y funciones puras que usa la simulación.
// Metros y segundos; los números de partida están en el documento de diseño de la etapa 3 (sección 5).

/** Alto del corredor de pie y rodando. */
export const ALTURA_DE_PIE = 1.75;
export const ALTURA_RODANDO = 0.9;
/** Lo que dura un giro en el suelo. */
export const DURACION_RODAR = 0.7;
/** Velocidad hacia abajo de la caída rápida. */
export const VY_CAIDA_RAPIDA = -22;
/** La viga ocupa de 1,1 a 3,5 m: de pie o saltando golpea; rodando pasa por debajo. */
export const VIGA_LIBRE = 1.1;
export const VIGA_TOPE = 3.5;
/** "¡Justo!": un movimiento empezado a lo sumo esto antes del contacto da el bono. */
export const VENTANA_JUSTO_S = 0.18;
export const BONO_JUSTO = 50;

export type Postura = 'corriendo' | 'rodando' | 'trepando' | 'colgado' | 'foso';

/** Lo que mide el cuerpo hacia arriba desde los pies en cada postura. */
export function alturaCuerpo(p: Postura): number {
  return p === 'rodando' ? ALTURA_RODANDO : ALTURA_DE_PIE;
}
