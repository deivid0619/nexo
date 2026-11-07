import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  type BufferGeometry,
  type Scene,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { PaletaExterior } from '../paletas';
import type { SombraContacto } from './sombra-contacto';

const CARROS: [x: number, z: number, giro: number][] = [
  [-2.8, -22, 0.35],
  [3, -58, -0.8],
  [-3.4, -95, 2.6],
];
const ESCOTILLA: [number, number, number] = [5.7, 0, 2.7];

/** Postes caídos, carros oxidados y la escotilla abierta del búnker con su luz cálida. */
export function crearUtileria(
  escena: Scene,
  paleta: PaletaExterior,
  azar: () => number,
): { actualizar(t: number): void; sombras: SombraContacto[] } {
  const sombras: SombraContacto[] = [];
  const guia = new Object3D();
  const sub = new Object3D();
  guia.add(sub);
  const colocar = (g: BufferGeometry, x: number, y: number, z: number, rx = 0) => {
    sub.position.set(x, y, z);
    sub.rotation.set(rx, 0, 0);
    guia.updateMatrixWorld(true);
    return g.applyMatrix4(sub.matrixWorld);
  };

  // Postes: una sola malla.
  const postes: BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    guia.position.set(i % 2 ? 6.5 : -6.5, 0, -4 - i * 14);
    guia.rotation.set((azar() - 0.5) * 0.2, 0, (azar() - 0.5) * 0.35);
    postes.push(colocar(new CylinderGeometry(0.1, 0.14, 9, 6), 0, 4.5, 0));
    postes.push(colocar(new BoxGeometry(1.8, 0.12, 0.12), 0, 8.4, 0));
  }
  const mallaPostes = new Mesh(mergeGeometries(postes), new MeshStandardMaterial({ color: paleta.postes, roughness: 0.9 }));
  mallaPostes.name = 'postes';
  mallaPostes.castShadow = true;
  escena.add(mallaPostes);

  // Carros: carrocería y vidrios, cada uno en una malla.
  const carrocerias: BufferGeometry[] = [];
  const vidrios: BufferGeometry[] = [];
  for (const [x, z, giro] of CARROS) {
    guia.position.set(x, 0, z);
    guia.rotation.set(0, giro, 0.04);
    carrocerias.push(colocar(new BoxGeometry(1.9, 0.7, 4.2), 0, 0.55, 0));
    carrocerias.push(colocar(new BoxGeometry(1.7, 0.6, 2.1), 0, 1.15, -0.2));
    vidrios.push(colocar(new BoxGeometry(1.74, 0.38, 2.14), 0, 1.2, -0.2));
    sombras.push({ x, z, ancho: 2.6, largo: 4.8, opacidad: 0.45, giro });
  }
  const mallaCarros = new Mesh(
    mergeGeometries(carrocerias),
    new MeshStandardMaterial({ color: paleta.carroceria, roughness: 0.8, metalness: 0.3 }),
  );
  const mallaVidrios = new Mesh(mergeGeometries(vidrios), new MeshStandardMaterial({ color: paleta.vidrio, roughness: 0.3 }));
  mallaCarros.name = 'carros';
  mallaVidrios.name = 'vidrios';
  for (const m of [mallaCarros, mallaVidrios]) {
    m.castShadow = m.receiveShadow = true;
    escena.add(m);
  }

  // Escotilla del búnker, abierta, con la luz de adentro.
  const escotilla = new Group();
  escotilla.name = 'escotilla';
  escotilla.position.set(...ESCOTILLA);
  const metal = new MeshStandardMaterial({ color: paleta.metal, roughness: 0.6, metalness: 0.6 });
  const aro = new Mesh(new CylinderGeometry(0.72, 0.78, 0.26, 24), metal);
  aro.position.y = 0.13;
  const hueco = new Mesh(new CircleGeometry(0.6, 24), new MeshBasicMaterial({ color: paleta.hueco }));
  hueco.rotation.x = -Math.PI / 2;
  hueco.position.y = 0.27;
  const tapa = new Mesh(new CylinderGeometry(0.72, 0.72, 0.08, 24), metal);
  tapa.position.set(0, 0.68, 0.74);
  tapa.rotation.x = 1.75;
  escotilla.add(aro, hueco, tapa);
  escotilla.traverse((o) => {
    if (o instanceof Mesh) o.castShadow = o.receiveShadow = true;
  });
  escena.add(escotilla);
  sombras.push({ x: ESCOTILLA[0], z: ESCOTILLA[2], ancho: 1.9, largo: 1.9, opacidad: 0.4 });

  const luz = new PointLight(paleta.escotilla, 1.1 * Math.PI, 5, 2);
  luz.position.set(ESCOTILLA[0], 0.35, ESCOTILLA[2]);
  escena.add(luz);

  return {
    sombras,
    actualizar(t) {
      // Titila como una lámpara vieja.
      luz.intensity = (1 + Math.sin(t * 7) * 0.08 + Math.sin(t * 2.3) * 0.06) * Math.PI;
    },
  };
}
