/** 2 = vista lateral, 3 = detrás del personaje con tres carriles. */
export type Modo = 2 | 3;
/** Carril en 3D: −1 izquierda, 0 centro, 1 derecha. */
export type Carril = -1 | 0 | 1;
export type Habilidad = 'escudo' | 'turbo' | 'doble';

/** Los movimientos que enseñan las pistas del tramo 1. */
export type PistaNivel = 'rodar' | 'caer' | 'trepar' | 'cable';

/** Lo común a todo evento: dónde pasa y, si se quiere, la pista que se muestra al acercarse. */
type Base = { en: number; pista?: PistaNivel };

/** Algo que pasa a `en` metros del inicio del tramo. */
export type Evento = Base &
  (
    | { tipo: 'valla'; alto?: 0.7 | 1.1 }
    | { tipo: 'bloque'; carril: Carril }
    | { tipo: 'habilidad'; clase: Habilidad; carril?: Carril }
    | { tipo: 'portal'; a: Modo }
    /** Viga a media altura que cruza todos los carriles: se pasa rodando. */
    | { tipo: 'viga' }
    /** Contenedor de 2 m que se trepa: en 2D sin carril, en 3D con carril. */
    | { tipo: 'contenedor'; largo: number; carril?: Carril }
    /** Hueco en el suelo que cruza todos los carriles. */
    | { tipo: 'foso'; largo: number }
    /** Cable para cruzar un foso largo; va al principio del foso. */
    | { tipo: 'cable' }
    /** Estación de armas: abre la zona de disparo en 3D. */
    | { tipo: 'arma' }
    | { tipo: 'dron'; carril: Carril }
    /** Pulso que cierra la zona de armas. */
    | { tipo: 'emp' }
  );

/** Un tramo de un piso. Siempre empieza en 2D. */
export interface Nivel {
  id: string;
  /** Metros hasta el final del tramo. */
  largo: number;
  eventos: Evento[];
}
