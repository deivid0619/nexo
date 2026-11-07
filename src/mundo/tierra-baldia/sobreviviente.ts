import { CylinderGeometry, BoxGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, type BufferGeometry, type Scene } from 'three';
import type { PaletaExterior } from '../paletas';

/** Donde está parado, de espaldas a la cámara, mirando la torre. */
export const POSICION_SOBREVIVIENTE: [number, number, number] = [4.3, 0, 1.2];

/**
 * El sobreviviente de la maqueta (abrigo largo, capucha y mochila), con respiración.
 * Es provisional: en la etapa 3 se cambia por el modelo final con esta misma firma.
 */
export function crearSobreviviente(escena: Scene, paleta: PaletaExterior): { grupo: Group; actualizar(t: number): void } {
  const grupo = new Group();
  grupo.name = 'sobreviviente';
  grupo.position.set(...POSICION_SOBREVIVIENTE);
  escena.add(grupo);

  const abrigoM = new MeshStandardMaterial({ color: paleta.abrigo, roughness: 0.9 });
  const pantalonM = new MeshStandardMaterial({ color: paleta.pantalon, roughness: 0.9 });
  const mochilaM = new MeshStandardMaterial({ color: paleta.mochila, roughness: 0.85 });
  const pielM = new MeshStandardMaterial({ color: paleta.piel, roughness: 0.7 });
  const pieza = (g: BufferGeometry, m: MeshStandardMaterial, x: number, y: number, z: number) => {
    const malla = new Mesh(g, m);
    malla.position.set(x, y, z);
    malla.castShadow = malla.receiveShadow = true;
    grupo.add(malla);
    return malla;
  };

  pieza(new CylinderGeometry(0.085, 0.075, 0.82, 8), pantalonM, -0.1, 0.41, 0);
  pieza(new CylinderGeometry(0.085, 0.075, 0.82, 8), pantalonM, 0.1, 0.41, 0);
  const abrigo = pieza(new CylinderGeometry(0.2, 0.31, 0.86, 12), abrigoM, 0, 1.14, 0);
  const pecho = pieza(new CylinderGeometry(0.22, 0.2, 0.36, 12), abrigoM, 0, 1.56, 0);
  pieza(new SphereGeometry(0.115, 14, 10), pielM, 0, 1.83, -0.02);
  pieza(new SphereGeometry(0.15, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), abrigoM, 0, 1.82, 0.03);
  pieza(new BoxGeometry(0.34, 0.44, 0.2), mochilaM, 0, 1.45, 0.22);
  pieza(new CylinderGeometry(0.06, 0.055, 0.62, 8), abrigoM, -0.28, 1.3, 0).rotation.z = 0.12;
  pieza(new CylinderGeometry(0.06, 0.055, 0.62, 8), abrigoM, 0.28, 1.3, 0).rotation.z = -0.12;

  return {
    grupo,
    actualizar(t) {
      const r = 1 + Math.sin(t * 1.8) * 0.015;
      pecho.scale.set(r, 1, r);
      abrigo.rotation.z = Math.sin(t * 1.3) * 0.025;
    },
  };
}
