import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import type { Modo } from '../datos/niveles/tipos';

/** Ancho visible de la pista en la vista lateral, en metros (como el prototipo). */
const ANCHO_LATERAL_M = 15;
const DISTANCIA_LATERAL = 22;
const FOV_DETRAS = 62;
const FOV_DETRAS_VERTICAL = 78;
const RAPIDEZ_GIRO = 2.4;
const APAGADO_SACUDIDA = 2;

export interface CamaraJuego {
  actualizar(dt: number, s: { modo: Modo; z: number; y: number }, aspecto: number): void;
  sacudir(fuerza: number): void;
  /** 0 = vista lateral (2D), 1 = detrás del personaje (3D). */
  mezcla(): number;
  reiniciar(modo: Modo): void;
}

/**
 * La cámara de la carrera siempre es 3D: en "2D" se pone de lado con lente cerrado y, al cruzar
 * un portal, gira detrás del personaje (prototipo, `camara()`).
 */
export function crearCamaraJuego(camara: PerspectiveCamera, opciones: { movimientoReducido: boolean }): CamaraJuego {
  let k = 0;
  let sacudida = 0;
  const p2 = new Vector3();
  const l2 = new Vector3();
  const p3 = new Vector3();
  const l3 = new Vector3();
  const mira = new Vector3();

  return {
    actualizar(dt, s, aspecto) {
      k += ((s.modo === 3 ? 1 : 0) - k) * Math.min(1, dt * RAPIDEZ_GIRO);
      const e = k * k * (3 - 2 * k);
      const fov2 = Math.min(72, MathUtils.radToDeg(2 * Math.atan(ANCHO_LATERAL_M / (2 * DISTANCIA_LATERAL * aspecto))));
      const fov3 = aspecto < 1 ? FOV_DETRAS_VERTICAL : FOV_DETRAS;
      p2.set(3.5, 2.2, DISTANCIA_LATERAL);
      l2.set(3.5, 1.6, 0);
      // Detrás: acompaña un poco el salto para no perder al personaje por arriba. No baja al foso.
      const alto = Math.max(0, s.y);
      p3.set(-5.5, 3.4 + alto * 0.3, s.z * 0.6);
      l3.set(7, 1.2 + alto * 0.2, s.z * 0.4);
      camara.position.lerpVectors(p2, p3, e);
      mira.lerpVectors(l2, l3, e);
      if (sacudida > 0) {
        camara.position.x += (Math.random() - 0.5) * sacudida;
        camara.position.y += (Math.random() - 0.5) * sacudida;
        sacudida = Math.max(0, sacudida - dt * APAGADO_SACUDIDA);
      }
      camara.lookAt(mira);
      camara.fov = fov2 + (fov3 - fov2) * e;
      camara.aspect = aspecto;
      camara.updateProjectionMatrix();
    },
    sacudir(fuerza) {
      if (!opciones.movimientoReducido) sacudida = Math.max(sacudida, fuerza);
    },
    mezcla: () => k,
    reiniciar(modo) {
      k = modo === 3 ? 1 : 0;
      sacudida = 0;
    },
  };
}
