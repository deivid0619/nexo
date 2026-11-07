import {
  AdditiveBlending,
  BoxGeometry,
  type BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  type Scene,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { PaletaExterior } from '../paletas';

export interface Torre {
  actualizar(t: number): void;
  /** 0..3 = anillo del piso; 4 = brillo de la punta (Núcleo); null = sin resalte. */
  resaltarPiso(indice: number | null): void;
}

const ANILLOS: [altura: number, radio: number][] = [
  [40, 11],
  [80, 9],
  [120, 7],
  [160, 5.4],
];
const ESCALA_BRILLO = 70;
const ESCALA_BRILLO_RESALTADO = 84;

function texturaBrillo(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** La torre del Proyecto NEXO: la meta visible y la única luz artificial del mundo. */
export function crearTorre(escena: Scene, paleta: PaletaExterior): Torre {
  const T = new Group();
  T.name = 'torre';
  T.position.set(26, 0, -330);
  escena.add(T);

  // Base, eje y aletas en una sola malla.
  const partes: BufferGeometry[] = [new CylinderGeometry(16, 20, 8, 16).translate(0, 4, 0), new CylinderGeometry(3, 9, 190, 12).translate(0, 95, 0)];
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    partes.push(new BoxGeometry(1.4, 150, 2.4).rotateY(-a).translate(Math.cos(a) * 6.4, 78, Math.sin(a) * 6.4));
  }
  const cuerpo = new Mesh(mergeGeometries(partes), new MeshStandardMaterial({ color: paleta.torreMetal, roughness: 0.55, metalness: 0.5 }));
  T.add(cuerpo);

  const colorLuz = new Color(paleta.torreLuz);
  const colorResalte = new Color(paleta.torreResalte);
  const anillos = ANILLOS.map(([y, r]) => {
    const a = new Mesh(
      new TorusGeometry(r, 0.45, 8, 64),
      new MeshBasicMaterial({ color: paleta.torreLuz, transparent: true, opacity: 0.8, fog: false }),
    );
    a.rotation.x = Math.PI / 2;
    a.position.y = y;
    T.add(a);
    return a;
  });

  const haz = new Mesh(
    new CylinderGeometry(0.7, 0.7, 900, 8, 1, true),
    new MeshBasicMaterial({ color: paleta.haz, transparent: true, opacity: 0.26, fog: false, depthWrite: false }),
  );
  haz.position.y = 640;
  T.add(haz);

  const brillo = new Sprite(
    new SpriteMaterial({
      map: texturaBrillo(),
      color: paleta.brillo,
      transparent: true,
      blending: AdditiveBlending,
      fog: false,
      depthWrite: false,
    }),
  );
  brillo.scale.set(ESCALA_BRILLO, ESCALA_BRILLO, 1);
  brillo.position.y = 190;
  T.add(brillo);

  let resaltado: number | null = null;

  return {
    actualizar(t) {
      anillos.forEach((a, i) => {
        const latido = 0.45 + 0.4 * Math.sin(t * 1.6 + i * 0.9);
        if (resaltado === i) {
          a.material.opacity = 0.95;
          a.material.color.copy(colorResalte);
        } else {
          a.material.opacity = resaltado === null ? latido : latido * 0.6;
          a.material.color.copy(colorLuz);
        }
      });
      const e = resaltado === 4 ? ESCALA_BRILLO_RESALTADO : ESCALA_BRILLO;
      brillo.scale.set(e, e, 1);
    },
    resaltarPiso(indice) {
      resaltado = indice;
    },
  };
}
