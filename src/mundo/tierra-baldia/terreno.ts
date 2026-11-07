import {
  BoxGeometry,
  BufferAttribute,
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  type Scene,
} from 'three';
import type { PaletaExterior } from '../paletas';

/** Medio ancho de la carretera plana: ahí el terreno vale 0. */
const BORDE_CARRETERA = 5;

/** Relieve de la maqueta: plano en la carretera y ondulado hacia los lados. */
export function alturaTerreno(x: number, z: number): number {
  const m = Math.min(1, Math.max(0, (Math.abs(x) - BORDE_CARRETERA) / 12));
  if (m === 0) return 0;
  return m * (Math.sin(x * 0.045) * 1.4 + Math.sin(z * 0.028 + x * 0.02) * 1.8 + Math.sin(x * 0.12 + z * 0.09) * 0.5 + 1.4);
}

/** Suelo de arena con relieve, carretera rota y marcas de carril. */
export function crearTerreno(escena: Scene, paleta: PaletaExterior, azar: () => number): void {
  const g = new PlaneGeometry(700, 700, 140, 140);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, -250);
  const p = g.attributes.position;
  const colores = new Float32Array(p.count * 3);
  const clara = new Color(paleta.arenaClara);
  const oscura = new Color(paleta.arenaOscura);
  const roca = new Color(paleta.roca);
  const c = new Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const h = alturaTerreno(x, z);
    p.setY(i, h);
    const m = Math.min(1, Math.max(0, (Math.abs(x) - BORDE_CARRETERA) / 12));
    const n = (Math.sin(x * 0.7) * Math.sin(z * 0.6) + 1) / 2;
    c.copy(oscura).lerp(clara, Math.min(1, n * 0.6 + h * 0.09));
    c.lerp(roca, (1 - m) * 0.55);
    colores[i * 3] = c.r;
    colores[i * 3 + 1] = c.g;
    colores[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new BufferAttribute(colores, 3));
  g.computeVertexNormals();
  const suelo = new Mesh(g, new MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  suelo.name = 'suelo';
  suelo.receiveShadow = true;
  escena.add(suelo);

  const via = new Mesh(new PlaneGeometry(9, 700), new MeshStandardMaterial({ color: paleta.asfalto, roughness: 1 }));
  via.name = 'carretera';
  via.rotation.x = -Math.PI / 2;
  via.position.set(0, 0.03, -250);
  via.receiveShadow = true;
  escena.add(via);

  // Marcas del carril central, con huecos donde el asfalto se rompió.
  const posiciones: number[] = [];
  for (let z = 4; z > -320; z -= 8) if (azar() >= 0.3) posiciones.push(z);
  const marcas = new InstancedMesh(
    new BoxGeometry(0.18, 0.02, 2.2),
    new MeshStandardMaterial({ color: paleta.marcas, roughness: 1 }),
    posiciones.length,
  );
  marcas.name = 'marcas';
  const m = new Matrix4();
  posiciones.forEach((z, i) => marcas.setMatrixAt(i, m.makeTranslation(0, 0.05, z)));
  marcas.receiveShadow = true;
  escena.add(marcas);
}
