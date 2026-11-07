import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three';
import type { Habilidad } from '../../datos/niveles/tipos';
import { ANCHO_CARRIL, type Simulacion } from '../../juego/simulacion';
import type { Calidad } from '../../render/calidad';
import { TIERRA_BALDIA, type PaletaExterior } from '../paletas';
import { crearCielo } from './cielo';
import type { PasoConstruccion } from './index';
import { crearTorre, type Torre } from './torre';

/** Tope de llamadas de dibujo por cuadro en calidad alta (con la pasada de sombras). */
export const LLAMADAS_MAXIMAS = 150;
/** Cada cuántos metros se repite el decorado de los lados. */
const CICLO_DECORADO = 240;
const DETRAS_M = 40;
const ANCHO_CARRETERA = 5.4;
const LARGO_CARRETERA = 200;
/** Metros de carretera que cubre una vez la textura del asfalto. */
const TRAMO_TEXTURA = 20;
/** La torre: lejos, hacia donde se corre. Se ve al girar a 3D y no se acerca nunca. */
const POSICION_TORRE = new Vector3(330, 0, -40);
const COLOR_HABILIDAD: Record<Habilidad, string> = { escudo: '#7FD6DC', turbo: '#E8A84A', doble: '#F4EFE7' };
const MAX = { vallas: 12, bloques: 16, habilidades: 6, portales: 2 };

/**
 * Dónde va un elemento del decorado que se recicla: avanza hacia −x con la carrera y vuelve a
 * empezar adelante al quedar `DETRAS_M` metros atrás. Función pura (probada).
 */
export function posicionDecorado(baseX: number, distancia: number, largoCiclo: number): number {
  const r = (((baseX - distancia) % largoCiclo) + largoCiclo) % largoCiclo;
  return r - DETRAS_M;
}

export interface Pista {
  escena: Scene;
  pasos: PasoConstruccion[];
  /** `mezcla`: 0 = vista lateral, 1 = detrás del personaje (de la cámara de la carrera). */
  actualizar(dt: number, t: number, s: Simulacion, mezcla: number): void;
  llamadasMaximas: number;
}

function lienzo(ancho: number, alto: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  return [c, c.getContext('2d')!];
}

function textura(c: HTMLCanvasElement, repetirX: number, repetirY: number): CanvasTexture {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repetirX, repetirY);
  t.anisotropy = 4;
  return t;
}

/** Asfalto roto: grietas, parches de arena y bordes comidos (20 m de carretera). */
function texturaAsfalto(p: PaletaExterior, azar: () => number): CanvasTexture {
  const [c, g] = lienzo(512, 128);
  g.fillStyle = p.asfalto;
  g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = azar() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.05)';
    g.fillRect(azar() * 512, azar() * 128, 2, 2);
  }
  g.fillStyle = p.arenaOscura;
  for (let i = 0; i < 6; i++) {
    g.globalAlpha = 0.35 + azar() * 0.35;
    g.beginPath();
    g.ellipse(azar() * 512, azar() < 0.5 ? azar() * 18 : 128 - azar() * 18, 20 + azar() * 40, 6 + azar() * 10, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  g.strokeStyle = 'rgba(10,8,6,0.55)';
  for (let i = 0; i < 7; i++) {
    g.lineWidth = 1 + azar() * 1.5;
    g.beginPath();
    let x = azar() * 512;
    let y = azar() * 128;
    g.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (azar() - 0.3) * 40;
      y += (azar() - 0.5) * 30;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  return textura(c, LARGO_CARRETERA / TRAMO_TEXTURA, 1);
}

/** Las dos líneas entre carriles, a trazos; solo se ven en 3D. */
function texturaCarriles(p: PaletaExterior): CanvasTexture {
  const [c, g] = lienzo(256, 128);
  g.fillStyle = p.marcas;
  for (const z of [-ANCHO_CARRIL / 2, ANCHO_CARRIL / 2]) {
    const v = 64 + (z / ANCHO_CARRETERA) * 128;
    for (let x = 0; x < 256; x += 64) g.fillRect(x, v - 2, 36, 4);
  }
  return textura(c, LARGO_CARRETERA / TRAMO_TEXTURA, 1);
}

function texturaArena(p: PaletaExterior, azar: () => number): CanvasTexture {
  const [c, g] = lienzo(256, 256);
  g.fillStyle = p.arenaClara;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = p.arenaOscura;
  for (let i = 0; i < 1400; i++) {
    g.globalAlpha = 0.15 + azar() * 0.3;
    g.fillRect(azar() * 256, azar() * 256, 1 + azar() * 3, 1 + azar() * 2);
  }
  g.globalAlpha = 1;
  return textura(c, 60, 60);
}

/** Sombra suave bajo el corredor. */
function texturaSombra(): CanvasTexture {
  const [c, g] = lienzo(64, 64);
  const r = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  r.addColorStop(0, 'rgba(0,0,0,0.55)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

const conSombra = <T extends Mesh>(m: T, proyecta = true): T => {
  m.castShadow = proyecta;
  m.receiveShadow = true;
  return m;
};

interface Decorado {
  malla: InstancedMesh;
  bases: { x: number; y: number; z: number; sx: number; sy: number; sz: number; giro: number }[];
}

/** La escena de la carrera: la carretera rota hacia la torre, entre ruinas, al atardecer. */
export function crearPista(calidad: Calidad, azar: () => number): Pista {
  const paleta = TIERRA_BALDIA;
  const escena = new Scene();
  escena.name = 'pista';
  const ayudante = new Object3D();
  const decorados: { lejos: Decorado[]; cerca: Decorado[] } = { lejos: [], cerca: [] };
  let torre: Torre | null = null;
  let mallaVallas: InstancedMesh | null = null;
  let mallaBloques: InstancedMesh | null = null;
  let mallaTapas: InstancedMesh | null = null;
  let mallaHabilidades: InstancedMesh | null = null;
  const portales: Group[] = [];
  let materialCarriles: MeshBasicMaterial | null = null;
  const desplazables: CanvasTexture[] = [];
  let suelo: CanvasTexture | null = null;
  let sombraCorredor: Mesh | null = null;

  function decorado(geo: BufferGeometry, material: Material, cantidad: number, ubicar: (i: number) => Decorado['bases'][number], colores?: readonly string[]): Decorado {
    const malla = conSombra(new InstancedMesh(geo, material, cantidad));
    malla.instanceMatrix.setUsage(DynamicDrawUsage);
    malla.frustumCulled = false;
    const bases = Array.from({ length: cantidad }, (_, i) => ubicar(i));
    if (colores) {
      const color = new Color();
      bases.forEach((_, i) => malla.setColorAt(i, color.set(colores[Math.floor(azar() * colores.length)])));
    }
    escena.add(malla);
    return { malla, bases };
  }

  const pasos: PasoConstruccion[] = [
    {
      nombre: 'pista-cielo',
      peso: 1,
      correr() {
        const { sol } = crearCielo(escena, paleta, calidad);
        // La sombra del sol se centra en lo que viene por delante del corredor.
        const dir = new Vector3(...paleta.dirSol).normalize();
        sol.target.position.set(18, 0, 0);
        sol.position.copy(dir).multiplyScalar(120).add(sol.target.position);
        const c = sol.shadow.camera;
        c.left = c.bottom = -45;
        c.right = c.top = 45;
        c.updateProjectionMatrix();
      },
    },
    {
      nombre: 'pista-suelo',
      peso: 1,
      correr() {
        suelo = texturaArena(paleta, azar);
        const arena = conSombra(new Mesh(new PlaneGeometry(900, 900), new MeshStandardMaterial({ map: suelo, roughness: 1 })), false);
        arena.rotation.x = -Math.PI / 2;
        arena.position.y = -0.02;
        escena.add(arena);

        const asfalto = texturaAsfalto(paleta, azar);
        const carriles = texturaCarriles(paleta);
        desplazables.push(asfalto, carriles);
        const carretera = conSombra(
          new Mesh(new PlaneGeometry(LARGO_CARRETERA, ANCHO_CARRETERA), new MeshStandardMaterial({ map: asfalto, roughness: 0.95 })),
          false,
        );
        carretera.rotation.x = -Math.PI / 2;
        carretera.position.set(LARGO_CARRETERA / 2 - DETRAS_M, 0, 0);
        escena.add(carretera);

        materialCarriles = new MeshBasicMaterial({ map: carriles, transparent: true, opacity: 0, depthWrite: false });
        const marcas = new Mesh(new PlaneGeometry(LARGO_CARRETERA, ANCHO_CARRETERA), materialCarriles);
        marcas.rotation.x = -Math.PI / 2;
        marcas.position.set(LARGO_CARRETERA / 2 - DETRAS_M, 0.01, 0);
        escena.add(marcas);

        sombraCorredor = new Mesh(
          new CircleGeometry(0.55, 24),
          new MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false }),
        );
        sombraCorredor.rotation.x = -Math.PI / 2;
        sombraCorredor.position.y = 0.02;
        escena.add(sombraCorredor);
      },
    },
    {
      nombre: 'pista-decorado',
      peso: 2,
      correr() {
        const caja = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
        const fachada = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.95 });
        const lado = (cerca: boolean) => (cerca ? 9 + azar() * 7 : -(12 + azar() * 34));
        // Edificios en ruinas: altos y rotos lejos; pocos y bajos del lado de la cámara (solo en 3D).
        decorados.lejos.push(
          decorado(caja, fachada, 46, () => ({ x: azar() * CICLO_DECORADO, y: 0, z: lado(false), sx: 4 + azar() * 7, sy: 3 + azar() * 13, sz: 4 + azar() * 6, giro: (azar() - 0.5) * 0.3 }), paleta.tintes),
        );
        decorados.cerca.push(
          decorado(caja, fachada, 14, () => ({ x: azar() * CICLO_DECORADO, y: 0, z: lado(true), sx: 3 + azar() * 5, sy: 2 + azar() * 6, sz: 3 + azar() * 4, giro: (azar() - 0.5) * 0.3 }), paleta.tintes),
        );
        // Escombros junto a la carretera, en los dos lados.
        const roca = new MeshStandardMaterial({ color: paleta.escombros, roughness: 1 });
        decorados.lejos.push(
          decorado(new BoxGeometry(1, 1, 1).translate(0, 0.35, 0), roca, 70, () => ({
            x: azar() * CICLO_DECORADO,
            y: -0.1,
            z: (azar() < 0.5 ? -1 : 1) * (ANCHO_CARRETERA / 2 + 0.6 + azar() * 4),
            sx: 0.3 + azar() * 1.2,
            sy: 0.2 + azar() * 0.7,
            sz: 0.3 + azar() * 1,
            giro: azar() * Math.PI,
          })),
        );
        // Postes de luz caídos o torcidos del lado de lejos.
        const postes = new MeshStandardMaterial({ color: paleta.postes, roughness: 0.7, metalness: 0.4 });
        decorados.lejos.push(
          decorado(new CylinderGeometry(0.08, 0.1, 1, 6).translate(0, 0.5, 0), postes, 14, () => ({
            x: azar() * CICLO_DECORADO,
            y: 0,
            z: -(ANCHO_CARRETERA / 2 + 1.2),
            sx: 1,
            sy: 5 + azar() * 2,
            sz: 1,
            giro: (azar() - 0.5) * 0.5,
          })),
        );
      },
    },
    {
      nombre: 'pista-obstaculos',
      peso: 1,
      correr() {
        const concreto = new MeshStandardMaterial({ color: paleta.roca, roughness: 0.95 });
        mallaVallas = conSombra(new InstancedMesh(new BoxGeometry(0.45, 1, ANCHO_CARRETERA - 0.3).translate(0, 0.5, 0), concreto, MAX.vallas));
        const oxido = new MeshStandardMaterial({ color: paleta.carroceria, roughness: 0.8, metalness: 0.35 });
        mallaBloques = conSombra(new InstancedMesh(new BoxGeometry(1.4, 1.3, 1.45).translate(0, 0.65, 0), oxido, MAX.bloques));
        const metal = new MeshStandardMaterial({ color: paleta.metal, roughness: 0.6, metalness: 0.5 });
        mallaTapas = conSombra(new InstancedMesh(new BoxGeometry(1.55, 0.12, 1.6).translate(0, 1.36, 0), metal, MAX.bloques));
        mallaHabilidades = new InstancedMesh(new CapsuleGeometry(0.22, 0.35, 6, 12), new MeshBasicMaterial({ color: '#ffffff' }), MAX.habilidades);
        mallaHabilidades.castShadow = true;
        for (const m of [mallaVallas, mallaBloques, mallaTapas, mallaHabilidades]) {
          m.instanceMatrix.setUsage(DynamicDrawUsage);
          m.frustumCulled = false;
          m.count = 0;
          escena.add(m);
        }
        mallaHabilidades.setColorAt(0, new Color('#ffffff'));

        for (let i = 0; i < MAX.portales; i++) {
          const portal = new Group();
          portal.add(new Mesh(new TorusGeometry(2.3, 0.09, 10, 64), new MeshBasicMaterial({ color: paleta.torreLuz })));
          const velo = new Mesh(
            new CircleGeometry(2.25, 48),
            new MeshBasicMaterial({ color: paleta.torreLuz, transparent: true, opacity: 0.16, blending: AdditiveBlending, depthWrite: false }),
          );
          portal.add(velo);
          // Girado para que también se lea en la vista lateral.
          portal.rotation.y = Math.PI / 2 - 0.55;
          portal.position.y = 2.3;
          portal.visible = false;
          escena.add(portal);
          portales.push(portal);
        }
      },
    },
    {
      nombre: 'pista-torre',
      peso: 1,
      correr() {
        torre = crearTorre(escena, paleta);
        escena.getObjectByName('torre')?.position.copy(POSICION_TORRE);
      },
    },
  ];

  function moverDecorado(d: Decorado, distancia: number): void {
    d.bases.forEach((b, i) => {
      ayudante.position.set(posicionDecorado(b.x, distancia, CICLO_DECORADO), b.y, b.z);
      ayudante.rotation.set(0, b.giro, 0);
      ayudante.scale.set(b.sx, b.sy, b.sz);
      ayudante.updateMatrix();
      d.malla.setMatrixAt(i, ayudante.matrix);
    });
    d.malla.instanceMatrix.needsUpdate = true;
  }

  function ponerInstancia(malla: InstancedMesh, x: number, y: number, z: number, sy = 1, giro = 0): number {
    ayudante.position.set(x, y, z);
    ayudante.rotation.set(0, giro, 0);
    ayudante.scale.set(1, sy, 1);
    ayudante.updateMatrix();
    malla.setMatrixAt(malla.count, ayudante.matrix);
    return malla.count++;
  }

  const colorHabilidad = new Color();

  return {
    escena,
    pasos,
    llamadasMaximas: LLAMADAS_MAXIMAS,
    actualizar(_dt, t, s, mezcla) {
      const d = s.distancia;
      for (const tex of desplazables) tex.offset.x = d / TRAMO_TEXTURA;
      if (suelo) suelo.offset.x = (d / 900) * 60;
      if (materialCarriles) materialCarriles.opacity = 0.75 * Math.max(0, mezcla * 2 - 1);
      for (const dec of decorados.lejos) moverDecorado(dec, d);
      for (const dec of decorados.cerca) {
        dec.malla.visible = mezcla > 0.5;
        if (dec.malla.visible) moverDecorado(dec, d);
      }
      if (sombraCorredor) {
        sombraCorredor.position.z = s.z;
        const escala = Math.max(0.4, 1 - s.y * 0.35);
        sombraCorredor.scale.set(escala, escala, escala);
      }

      if (mallaVallas && mallaBloques && mallaTapas && mallaHabilidades) {
        mallaVallas.count = mallaBloques.count = mallaTapas.count = mallaHabilidades.count = 0;
        let portal = 0;
        for (const o of s.objetos()) {
          if (o.roto || o.tomado) continue;
          const e = o.evento;
          if (e.tipo === 'valla' && mallaVallas.count < MAX.vallas) ponerInstancia(mallaVallas, o.x, 0, 0, e.alto ?? 0.7);
          else if (e.tipo === 'bloque' && mallaBloques.count < MAX.bloques) {
            const z = e.carril * ANCHO_CARRIL;
            const giro = ((o.id * 37) % 10) / 60 - 0.08;
            ponerInstancia(mallaBloques, o.x, 0, z, 1, giro);
            ponerInstancia(mallaTapas, o.x, 0, z, 1, giro);
          } else if (e.tipo === 'habilidad' && mallaHabilidades.count < MAX.habilidades) {
            const i = ponerInstancia(mallaHabilidades, o.x, 1.3 + Math.sin(t * 4 + o.id) * 0.12, (e.carril ?? 0) * ANCHO_CARRIL, 1, t * 2.5);
            mallaHabilidades.setColorAt(i, colorHabilidad.set(COLOR_HABILIDAD[e.clase]));
          } else if (e.tipo === 'portal' && portal < portales.length) {
            const g = portales[portal++];
            g.visible = true;
            g.position.x = o.x;
            const pulso = 1 + Math.sin(t * 4) * 0.05;
            g.scale.setScalar(pulso);
          }
        }
        for (let i = portal; i < portales.length; i++) portales[i].visible = false;
        for (const m of [mallaVallas, mallaBloques, mallaTapas, mallaHabilidades]) m.instanceMatrix.needsUpdate = true;
        if (mallaHabilidades.instanceColor) mallaHabilidades.instanceColor.needsUpdate = true;
      }
      torre?.actualizar(t);
    },
  };
}
