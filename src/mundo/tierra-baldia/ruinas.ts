import {
  BoxGeometry,
  BufferAttribute,
  CanvasTexture,
  Color,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  type BufferGeometry,
  type Scene,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { PaletaExterior } from '../paletas';
import { TOMAS } from '../../camara/tomas';
import type { SombraContacto } from './sombra-contacto';
import { alturaTerreno } from './terreno';
import { POSICION_TORRE } from './torre';

/**
 * Franja en x que tiene que quedar libre a la altura z para ver la torre desde la toma de inicio:
 * sigue la línea de la cámara a la torre y se ensancha hacia el fondo (la torre mide unos 20 m de ancho).
 */
export function franjaVistaTorre(z: number): { centro: number; margen: number } {
  const [cx, , cz] = TOMAS.inicio.posicion;
  const [tx, , tz] = POSICION_TORRE;
  const t = (cz - z) / (cz - tz);
  return { centro: cx + (tx - cx) * t, margen: 1 + 11 * t };
}

/** Si un edificio de media anchura `mitad` tapa la torre, lo corre hacia afuera, a la derecha de la franja. */
export function despejarVistaTorre(x: number, z: number, mitad: number): number {
  if (z <= POSICION_TORRE[2] + 20) return x;
  const { centro, margen } = franjaVistaTorre(z);
  if (x + mitad <= centro - margen || x - mitad >= centro + margen) return x;
  return centro + margen + mitad;
}

/** Fachada de concreto con ventanas oscuras y manchas de óxido (de la maqueta). */
function texturaFachada(paleta: PaletaExterior, azar: () => number): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = paleta.fachada;
  g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 900; i++) {
    const v = azar() < 0.5 ? 40 : 200;
    g.fillStyle = `rgba(${v},${v - 6},30,${azar() * 0.08})`;
    g.fillRect(azar() * 128, azar() * 256, 2, 2);
  }
  for (let fila = 0; fila < 10; fila++) {
    for (let k = 0; k < 4; k++) {
      if (azar() < 0.12) continue;
      const x = 10 + k * 29;
      const y = 10 + fila * 24;
      g.fillStyle = azar() < 0.2 ? '#4A443D' : '#26221E';
      g.fillRect(x, y, 16, 13);
      g.fillStyle = 'rgba(255,255,255,.06)';
      g.fillRect(x, y + 13, 16, 2);
    }
  }
  for (let i = 0; i < 14; i++) {
    g.fillStyle = 'rgba(30,24,18,.11)';
    g.fillRect(azar() * 128, azar() * 120, 2 + azar() * 4, 60 + azar() * 140);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function escalarUV(g: BufferGeometry, su: number, sv: number): void {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
}

function pintar(g: BufferGeometry, color: Color): void {
  const n = g.attributes.position.count;
  const datos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    datos[i * 3] = color.r;
    datos[i * 3 + 1] = color.g;
    datos[i * 3 + 2] = color.b;
  }
  g.setAttribute('color', new BufferAttribute(datos, 3));
}

/**
 * Edificios en ruinas a los dos lados de la carretera (una sola malla) y escombros (instanciados).
 * Devuelve las sombras de contacto de la base de cada edificio.
 */
export function crearRuinas(escena: Scene, paleta: PaletaExterior, azar: () => number): SombraContacto[] {
  const piezas: BufferGeometry[] = [];
  const sombras: SombraContacto[] = [];
  const grupo = new Object3D();
  const pieza = new Object3D();
  grupo.add(pieza);
  const tinte = new Color();

  const edificio = (xPedida: number, z: number, w: number, d: number, h: number) => {
    const su = Math.max(1, w / 8);
    const sv = Math.max(1, h / 14);
    tinte.set(paleta.tintes[Math.floor(azar() * paleta.tintes.length)]);
    const giro = (azar() - 0.5) * 0.5;
    const inclinacion = azar() < 0.15 ? (azar() - 0.5) * 0.18 : 0;
    // Media anchura en x, contando el giro y lo que se corre la punta si el edificio está inclinado.
    const mitad =
      (w / 2) * Math.abs(Math.cos(giro)) + (d / 2) * Math.abs(Math.sin(giro)) + h * 1.25 * Math.abs(inclinacion);
    const x = despejarVistaTorre(xPedida, z, mitad);
    grupo.position.set(x, alturaTerreno(x, z) - 1, z);
    grupo.rotation.set(0, giro, inclinacion);
    const agregar = (g: BufferGeometry) => {
      grupo.updateMatrixWorld(true);
      escalarUV(g, su, sv);
      pintar(g, tinte);
      piezas.push(g.applyMatrix4(pieza.matrixWorld));
    };
    pieza.position.set(0, h / 2, 0);
    pieza.rotation.set(0, 0, 0);
    agregar(new BoxGeometry(w, h, d));
    // Pedazos de techo derrumbados encima.
    const n = 1 + Math.floor(azar() * 3);
    for (let i = 0; i < n; i++) {
      const hw = w * (0.3 + azar() * 0.5);
      const hh = 1 + azar() * h * 0.25;
      const hd = d * (0.3 + azar() * 0.5);
      pieza.position.set((azar() - 0.5) * (w - hw), h + hh / 2 - 0.3, (azar() - 0.5) * (d - hd));
      pieza.rotation.set((azar() - 0.5) * 0.16, 0, (azar() - 0.5) * 0.28);
      agregar(new BoxGeometry(hw, hh, hd));
    }
    sombras.push({ x, z, ancho: w + 2, largo: d + 2, opacidad: 0.35, giro: grupo.rotation.y });
  };

  for (const s of [-1, 1]) {
    for (let j = 0; j < 30; j++) {
      const z = -12 - j * 10 - azar() * 6;
      edificio(s * (13 + azar() * 24 + j * 0.4), z, 6 + azar() * 9, 6 + azar() * 9, (5 + azar() * 30) * (j < 3 ? 0.6 : 1));
    }
    for (let j = 0; j < 16; j++) {
      edificio(s * (50 + azar() * 50), -40 - j * 22, 10 + azar() * 12, 10 + azar() * 12, 20 + azar() * 45);
    }
  }

  const edificios = new Mesh(
    mergeGeometries(piezas),
    new MeshStandardMaterial({ map: texturaFachada(paleta, azar), vertexColors: true, roughness: 0.95 }),
  );
  edificios.name = 'edificios';
  edificios.castShadow = edificios.receiveShadow = true;
  escena.add(edificios);

  // Escombros sueltos a los lados de la carretera.
  const N = 170;
  const escombros = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial({ color: paleta.escombros, roughness: 1 }), N);
  escombros.name = 'escombros';
  const guia = new Object3D();
  for (let i = 0; i < N; i++) {
    const s = 0.2 + azar() * 1.4;
    const x = (azar() < 0.5 ? -1 : 1) * (4.2 + azar() * 12);
    const z = 4 - azar() * 200;
    guia.position.set(x, alturaTerreno(x, z) + s * 0.2, z);
    guia.rotation.set(azar(), azar() * 3, azar());
    guia.scale.set(s, s * 0.6, s * (0.6 + azar()));
    guia.updateMatrix();
    escombros.setMatrixAt(i, guia.matrix);
  }
  escombros.castShadow = escombros.receiveShadow = true;
  escena.add(escombros);
  return sombras;
}
