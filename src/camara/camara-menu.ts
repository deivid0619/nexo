import { Vector3, type PerspectiveCamera } from 'three';
import { TOMAS, factorSuavizado, fovParaAspecto, type IdToma, type Toma } from './tomas';

export interface CamaraMenu {
  irA(toma: IdToma, instantaneo?: boolean): void;
  actualizar(dt: number, t: number): void;
  /** Toma suavizada actual, sin el vaivén. */
  estado(): Toma;
}

/** Cámara de los menús: viaja suave entre las tomas de cada pantalla y se mece apenas. */
export function crearCamaraMenu(camara: PerspectiveCamera, opciones: { movimientoReducido: () => boolean }): CamaraMenu {
  const posicion = new Vector3().fromArray(TOMAS.inicio.posicion);
  const mira = new Vector3().fromArray(TOMAS.inicio.mira);
  let fov = TOMAS.inicio.fov;
  let destino: Toma = TOMAS.inicio;
  const objetivoPos = new Vector3();
  const objetivoMira = new Vector3();

  const saltar = () => {
    posicion.fromArray(destino.posicion);
    mira.fromArray(destino.mira);
    fov = destino.fov;
  };

  const aplicar = (t: number) => {
    camara.position.copy(posicion);
    if (!opciones.movimientoReducido()) {
      camara.position.x += Math.sin(t * 0.25) * 0.12;
      camara.position.y += Math.sin(t * 0.4) * 0.04;
    }
    camara.fov = fovParaAspecto(fov, camara.aspect);
    camara.lookAt(mira);
    camara.updateProjectionMatrix();
  };

  return {
    irA(toma, instantaneo = false) {
      destino = TOMAS[toma];
      if (instantaneo || opciones.movimientoReducido()) saltar();
    },
    actualizar(dt, t) {
      if (opciones.movimientoReducido()) {
        saltar();
      } else {
        const k = factorSuavizado(dt);
        posicion.lerp(objetivoPos.fromArray(destino.posicion), k);
        mira.lerp(objetivoMira.fromArray(destino.mira), k);
        fov += (destino.fov - fov) * k;
      }
      aplicar(t);
    },
    estado() {
      return { posicion: posicion.toArray() as Toma['posicion'], mira: mira.toArray() as Toma['mira'], fov };
    },
  };
}
