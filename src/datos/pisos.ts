/** Los cinco pisos de la torre del Proyecto NEXO. En la etapa 1 solo se pueden jugar los dos primeros. */
export type IdPiso = 'tierra' | 'cristal' | 'magma' | 'vacio' | 'nucleo';

export interface Piso {
  id: IdPiso;
  numero: number;
  nombre: string;
  jefe: string | null;
  /** Registros de la historia escondidos en el piso. */
  registros: number;
  disponible: boolean;
}

/** De abajo hacia arriba. */
export const PISOS: readonly Piso[] = [
  { id: 'tierra', numero: 1, nombre: 'Tierra baldía', jefe: 'Centinela', registros: 2, disponible: true },
  { id: 'cristal', numero: 2, nombre: 'Cristal', jefe: 'Hidra de cristal', registros: 2, disponible: true },
  { id: 'magma', numero: 3, nombre: 'Magma', jefe: null, registros: 0, disponible: false },
  { id: 'vacio', numero: 4, nombre: 'Vacío', jefe: null, registros: 0, disponible: false },
  { id: 'nucleo', numero: 5, nombre: 'Núcleo', jefe: null, registros: 0, disponible: false },
];

export function pisoPorId(id: IdPiso): Piso {
  const piso = PISOS.find((p) => p.id === id);
  if (!piso) throw new Error(`Piso desconocido: ${id}`);
  return piso;
}

export function esIdPiso(valor: unknown): valor is IdPiso {
  return PISOS.some((p) => p.id === valor);
}

/** El piso de arriba, si ya se puede jugar. */
export function siguientePisoDisponible(id: IdPiso): IdPiso | null {
  const siguiente = PISOS[PISOS.findIndex((p) => p.id === id) + 1];
  return siguiente?.disponible ? siguiente.id : null;
}

/** Registros que se pueden encontrar hoy (los de los pisos disponibles). */
export const TOTAL_REGISTROS = PISOS.filter((p) => p.disponible).reduce((n, p) => n + p.registros, 0);
