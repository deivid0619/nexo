export type NivelCalidad = 'alto' | 'medio' | 'bajo';

export interface Calidad {
  /** Tope de píxeles por punto de pantalla (el iPhone 16 Pro tiene 3). */
  pixelRatioMax: number;
  /** Tamaño del mapa de sombras del sol. */
  sombraTam: number;
  /** Borde de sombra suavizado (radio de filtrado mayor). */
  sombraSuave: boolean;
  /** Partículas de polvo en el aire. */
  polvo: number;
  antialias: boolean;
}

/** Alto = la maqueta aprobada. Medio y Bajo quitan efectos en orden de costo; la jugabilidad no cambia. */
export const CALIDADES: Record<NivelCalidad, Calidad> = {
  alto: { pixelRatioMax: 2, sombraTam: 4096, sombraSuave: true, polvo: 1600, antialias: true },
  medio: { pixelRatioMax: 1.5, sombraTam: 2048, sombraSuave: true, polvo: 900, antialias: true },
  bajo: { pixelRatioMax: 1, sombraTam: 1024, sombraSuave: false, polvo: 400, antialias: false },
};

export const NIVELES: readonly NivelCalidad[] = ['alto', 'medio', 'bajo'];

/** Etapa 1: la calidad pedida por parámetro o "alto". La detección automática llega en la etapa 7. */
export function elegirCalidad(pedida: NivelCalidad | null): NivelCalidad {
  return pedida ?? 'alto';
}
