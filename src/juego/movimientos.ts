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

/** Contenedor: alto, lo que tarda en treparse (saltando o llegando por el suelo) y su medio ancho en z. */
export const ALTO_CONTENEDOR = 2;
export const DURACION_TREPAR = 0.45;
export const DURACION_TREPAR_GOLPE = 0.8;
export const MEDIO_ANCHO_CONTENEDOR = 0.75;

/** Cable: un vaivén completo hacia adelante dura esto; u va de 0 (al agarrarse) a 1 (se suelta solo). */
export const VAIVEN_S = 1.0;
/** Soltarse dentro de la franja buena pasa el foso; en su centro, con el vuelo más largo y "¡Justo!". */
export const FRANJA_BUENA: readonly [number, number] = [0.6, 1.0];
export const CENTRO_FRANJA: readonly [number, number] = [0.75, 0.85];

/** Zona de armas: el dron ocupa de 1 a 1,6 m de alto (rodando se pasa por debajo). */
export const DRON_ABAJO = 1.0;
export const DRON_ARRIBA = 1.6;
/** Balas: velocidad, espera entre disparos y alcance, como en el prototipo. */
export const BALA_MS = 40;
export const CADENCIA_S = 0.15;
export const BALA_ALCANCE_M = 45;
export const BONO_DRON = 50;

/** Altura de los pies a lo largo del vaivén: sube de 1,2 m (cerca de donde se agarra al saltar) a 2,4 m. */
export function alturaVaiven(u: number): number {
  const k = Math.min(1, Math.max(0, u));
  return 1.2 + 1.2 * k * k;
}

/**
 * Impulso hacia arriba al soltarse en u, y si cuenta como "¡Justo!".
 * - Antes de la franja: de 2 a 5,6 m/s, un vuelo corto que cae al foso.
 * - En la franja: 7,5 m/s en sus bordes, hasta 9,5 m/s en el centro (0,8).
 */
export function suelta(u: number): { vy: number; justo: boolean } {
  const k = Math.min(1, Math.max(0, u));
  const [desde, hasta] = FRANJA_BUENA;
  if (k < desde) return { vy: 2 + 6 * k, justo: false };
  const medio = (CENTRO_FRANJA[0] + CENTRO_FRANJA[1]) / 2;
  const cerca = 1 - Math.abs(k - medio) / Math.max(medio - desde, hasta - medio);
  return { vy: 7.5 + 2 * cerca, justo: k >= CENTRO_FRANJA[0] && k <= CENTRO_FRANJA[1] };
}
