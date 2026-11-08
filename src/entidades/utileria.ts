// La utilería propia: la pistola del corredor y el dron de la zona de armas
// (public/modelos/utileria.glb, hecho con scripts/blender/utileria.py).
import type { Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface Utileria {
  pistola: Object3D;
  dron: Object3D;
}

/** Toma las dos piezas de la escena del GLB por su nombre; si falta una, falla nombrándola. */
export function separarUtileria(escena: Object3D): Utileria {
  const buscar = (nombre: string): Object3D => {
    const pieza = escena.getObjectByName(nombre);
    if (!pieza) throw new Error(`utileria.glb no trae la pieza "${nombre}"`);
    return pieza;
  };
  return { pistola: buscar('pistola'), dron: buscar('dron') };
}

export async function cargarUtileria(url: string): Promise<Utileria> {
  const gltf = await new GLTFLoader().loadAsync(url);
  return separarUtileria(gltf.scene);
}
