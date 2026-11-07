/** 2 = vista lateral, 3 = detrás del personaje con tres carriles. */
export type Modo = 2 | 3;
/** Carril en 3D: −1 izquierda, 0 centro, 1 derecha. */
export type Carril = -1 | 0 | 1;
export type Habilidad = 'escudo' | 'turbo' | 'doble';

/** Algo que pasa a `en` metros del inicio del tramo. */
export type Evento =
  | { en: number; tipo: 'valla'; alto?: 0.7 | 1.1 }
  | { en: number; tipo: 'bloque'; carril: Carril }
  | { en: number; tipo: 'habilidad'; clase: Habilidad; carril?: Carril }
  | { en: number; tipo: 'portal'; a: Modo };

/** Un tramo de un piso. Siempre empieza en 2D. */
export interface Nivel {
  id: string;
  /** Metros hasta el final del tramo. */
  largo: number;
  eventos: Evento[];
}
