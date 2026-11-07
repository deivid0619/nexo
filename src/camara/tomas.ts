export type IdToma = 'inicio' | 'carga' | 'torre';

export interface Toma {
  posicion: [number, number, number];
  mira: [number, number, number];
  fov: number;
}

/** Tomas de la maqueta aprobada: cada pantalla tiene la suya. */
export const TOMAS: Record<IdToma, Toma> = {
  inicio: { posicion: [2.4, 1.8, 6.6], mira: [12, 8, -160], fov: 42 },
  carga: { posicion: [6.4, 1.4, 3.9], mira: [4.3, 1.4, 1.0], fov: 34 },
  torre: { posicion: [4, 3, 6], mira: [26, 100, -330], fov: 13 },
};

/** Proporción del celular de la maqueta (horizontal). */
export const ASPECTO_REFERENCIA = 640 / 296;

const GRADOS = 180 / Math.PI;

/**
 * En pantallas más angostas que la maqueta (iPad, computador 16:9) abre el fov vertical para
 * conservar el ancho horizontal: la torre y el personaje siguen en cuadro.
 */
export function fovParaAspecto(fov: number, aspecto: number): number {
  if (aspecto >= ASPECTO_REFERENCIA) return fov;
  const mitad = fov / 2 / GRADOS;
  return 2 * Math.atan(Math.tan(mitad) * (ASPECTO_REFERENCIA / aspecto)) * GRADOS;
}

/** Cuánto se acerca la cámara a su toma en un cuadro (viaje suave de la maqueta). */
export function factorSuavizado(dt: number): number {
  return 1 - Math.exp(-dt * 1.6);
}
