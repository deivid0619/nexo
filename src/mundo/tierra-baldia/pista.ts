import {
  AdditiveBlending,
  AlwaysStencilFunc,
  BackSide,
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NotEqualStencilFunc,
  Object3D,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  ReplaceStencilOp,
  SRGBColorSpace,
  Scene,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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
export const MAX = {
  vallas: 12,
  bloques: 16,
  habilidades: 6,
  portales: 2,
  vigas: 8,
  contenedores: 6,
  fosos: 4,
  cables: 3,
  armas: 2,
  drones: 12,
  destellos: 6,
  emps: 2,
  balas: 16,
};
/** Grúa del cable: el pivote está alto sobre el borde del foso y el asa cuelga a 3,2 m. */
const ALTO_PIVOTE = 18;
const LARGO_CABLE = 14.8;
/** Las manos del corredor colgado, sobre sus pies. */
const MANOS_SOBRE_PIES = 2.05;
const PROFUNDIDAD_FOSO = 6.5;
/** El hueco cruza la carretera y la arena de los lados. */
const ANCHO_HUECO = 14;
/** Contenedor: ancho en 2D (sin carril) y en un carril de 3D. */
const ANCHO_CONTENEDOR_2D = 2.4;
const ANCHO_CONTENEDOR_3D = 1.5;
const ALTO_BALA = 1.3;
const DESTELLO_S = 0.25;
const LINEAS_EMP = 7;

/**
 * El extremo de abajo del cable en la vista lateral (x, y): la mano del corredor mientras cuelga,
 * o `largo` metros recto hacia abajo desde el pivote si no. Función pura (probada).
 */
export function puntaCable(pivote: [number, number], largo: number, mano: [number, number] | null): [number, number] {
  return mano ? [mano[0], mano[1]] : [pivote[0], pivote[1] - largo];
}

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
  /** Arma los drones con el modelo de la utilería (antes de eso no se dibujan). */
  usarDron(modelo: Object3D): void;
  /** La pistola que gira sobre la estación de armas. */
  usarPistola(modelo: Object3D): void;
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

/** Chapa corrugada de contenedor: blanca, para teñirla con el color de cada uno. */
function texturaContenedor(): CanvasTexture {
  const [c, g] = lienzo(256, 128);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 128);
  for (let x = 0; x < 256; x += 8) {
    g.fillStyle = 'rgba(0,0,0,0.16)';
    g.fillRect(x, 0, 3, 128);
    g.fillStyle = 'rgba(255,255,255,0.10)';
    g.fillRect(x + 4, 0, 1, 128);
  }
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.fillRect(0, 0, 256, 7);
  g.fillRect(0, 118, 256, 10);
  g.fillStyle = 'rgba(60,30,10,0.25)';
  for (let i = 0; i < 9; i++) g.fillRect((i * 53) % 256, 100 + (i % 3) * 5, 18 + (i % 4) * 9, 18);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Le pone a una geometría un color de vértice parejo (para juntar piezas de colores en una malla). */
function pintar(geo: BufferGeometry, color: string): BufferGeometry {
  const c = new Color(color);
  const n = geo.getAttribute('position').count;
  const datos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) datos.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new Float32BufferAttribute(datos, 3));
  return geo;
}

/** El suelo no se dibuja donde un hueco marcó el stencil (la boca de un foso). */
function conHuecos<T extends Material>(m: T): T {
  m.stencilWrite = true;
  m.stencilRef = 1;
  m.stencilFunc = NotEqualStencilFunc;
  return m;
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
export function crearPista(calidad: Calidad, azar: () => number, opciones: { movimientoReducido?: boolean } = {}): Pista {
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
  // Etapa 3: los obstáculos de los movimientos y la zona de armas.
  const nuevas: InstancedMesh[] = [];
  let mallaVigas: InstancedMesh | null = null;
  let mallaContenedores: InstancedMesh | null = null;
  let mallaHuecos: InstancedMesh | null = null;
  let mallaInteriores: InstancedMesh | null = null;
  let mallaBordes: InstancedMesh | null = null;
  let mallaGruas: InstancedMesh | null = null;
  let mallaCables: InstancedMesh | null = null;
  let mallaAsas: InstancedMesh | null = null;
  let mallaEstaciones: InstancedMesh | null = null;
  let mallaLuces: InstancedMesh | null = null;
  let mallaArmas: InstancedMesh | null = null;
  let mallaDrones: InstancedMesh | null = null;
  let mallaDestellos: InstancedMesh | null = null;
  let mallaEmp: InstancedMesh | null = null;
  let mallaBalas: InstancedMesh | null = null;
  /** Drones derribados: cuándo empezó su destello (se borra al empezar otra carrera). */
  const destellos = new Map<number, number>();
  let simAnterior: Simulacion | null = null;

  function instanciada(geo: BufferGeometry, material: Material, cantidad: number, sombra = true): InstancedMesh {
    const malla = new InstancedMesh(geo, material, cantidad);
    malla.castShadow = sombra;
    malla.receiveShadow = sombra;
    malla.instanceMatrix.setUsage(DynamicDrawUsage);
    malla.frustumCulled = false;
    malla.count = 0;
    malla.visible = false;
    escena.add(malla);
    nuevas.push(malla);
    return malla;
  }

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
        const arena = conSombra(new Mesh(new PlaneGeometry(900, 900), conHuecos(new MeshStandardMaterial({ map: suelo, roughness: 1 }))), false);
        arena.rotation.x = -Math.PI / 2;
        arena.position.y = -0.02;
        escena.add(arena);

        const asfalto = texturaAsfalto(paleta, azar);
        const carriles = texturaCarriles(paleta);
        desplazables.push(asfalto, carriles);
        const carretera = conSombra(
          new Mesh(new PlaneGeometry(LARGO_CARRETERA, ANCHO_CARRETERA), conHuecos(new MeshStandardMaterial({ map: asfalto, roughness: 0.95 }))),
          false,
        );
        carretera.rotation.x = -Math.PI / 2;
        carretera.position.set(LARGO_CARRETERA / 2 - DETRAS_M, 0, 0);
        escena.add(carretera);

        materialCarriles = conHuecos(new MeshBasicMaterial({ map: carriles, transparent: true, opacity: 0, depthWrite: false }));
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
      nombre: 'pista-movimientos',
      peso: 1,
      correr() {
        const color = new Color();
        // Viga: cartel caído de 1,1 a 3,3 m que cruza la carretera, sobre dos postes.
        const anchoViga = ANCHO_CARRETERA;
        const viga = mergeGeometries([
          pintar(new BoxGeometry(0.3, 2.2, anchoViga).translate(0, 2.2, 0), paleta.carroceria),
          pintar(new BoxGeometry(0.34, 0.14, anchoViga + 0.1).translate(0, 1.17, 0), paleta.postes),
          pintar(new BoxGeometry(0.34, 0.14, anchoViga + 0.1).translate(0, 3.23, 0), paleta.postes),
          pintar(new BoxGeometry(0.32, 0.5, anchoViga * 0.7).translate(0.01, 2.2, 0), paleta.metal),
          pintar(new CylinderGeometry(0.1, 0.12, 3.4, 8).translate(0, 1.7, anchoViga / 2 + 0.3), paleta.postes),
          pintar(new CylinderGeometry(0.1, 0.12, 3.4, 8).translate(0, 1.7, -anchoViga / 2 - 0.3), paleta.postes),
        ]);
        mallaVigas = instanciada(viga, new MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.3 }), MAX.vigas);

        // Contenedor: 2 m de alto; el origen en el frente, abajo y al centro.
        mallaContenedores = instanciada(
          new BoxGeometry(1, 2, 1).translate(0.5, 1, 0),
          new MeshStandardMaterial({ map: texturaContenedor(), roughness: 0.75, metalness: 0.25 }),
          MAX.contenedores,
        );
        mallaContenedores.setColorAt(0, color.set(paleta.carroceria));

        // Foso: la boca marca el stencil antes que el suelo; el suelo no se dibuja ahí.
        const boca = new MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false });
        boca.stencilWrite = true;
        boca.stencilRef = 1;
        boca.stencilFunc = AlwaysStencilFunc;
        boca.stencilZPass = ReplaceStencilOp;
        mallaHuecos = instanciada(
          new PlaneGeometry(1, ANCHO_HUECO).rotateX(-Math.PI / 2).translate(0.5, 0.01, 0),
          boca,
          MAX.fosos,
          false,
        );
        mallaHuecos.renderOrder = -1;
        // El interior: una caja oscura vista por dentro, más negra hacia el fondo.
        const interior = new BoxGeometry(1, PROFUNDIDAD_FOSO, ANCHO_HUECO).translate(0.5, -PROFUNDIDAD_FOSO / 2, 0);
        const posiciones = interior.getAttribute('position');
        const arriba = new Color(paleta.arenaOscura).multiplyScalar(0.45);
        const fondo = new Color('#0B0907');
        const tonos = new Float32Array(posiciones.count * 3);
        for (let i = 0; i < posiciones.count; i++) {
          const k = Math.min(1, -posiciones.getY(i) / PROFUNDIDAD_FOSO);
          const c = arriba.clone().lerp(fondo, k);
          tonos.set([c.r, c.g, c.b], i * 3);
        }
        interior.setAttribute('color', new Float32BufferAttribute(tonos, 3));
        mallaInteriores = instanciada(interior, new MeshBasicMaterial({ vertexColors: true, side: BackSide }), MAX.fosos, false);
        // Bordes de asfalto roto en las dos orillas.
        mallaBordes = instanciada(
          new BoxGeometry(0.35, 0.12, ANCHO_CARRETERA + 0.4),
          new MeshStandardMaterial({ color: paleta.asfalto, roughness: 1 }),
          MAX.fosos * 2,
        );

        // Grúa del cable: poste al fondo de la carretera y brazo hasta el pivote, sobre el borde.
        const grua = mergeGeometries([
          pintar(new CylinderGeometry(0.16, 0.22, ALTO_PIVOTE + 0.8, 8).translate(-1.5, (ALTO_PIVOTE + 0.8) / 2, -3.6), paleta.postes),
          pintar(new BoxGeometry(0.3, 0.3, 3.9).translate(-1.5, ALTO_PIVOTE + 0.5, -1.8), paleta.carroceria),
          pintar(new BoxGeometry(1.8, 0.3, 0.3).translate(-0.75, ALTO_PIVOTE + 0.5, 0), paleta.carroceria),
          pintar(new CylinderGeometry(0.25, 0.25, 0.2, 12).rotateX(Math.PI / 2).translate(0, ALTO_PIVOTE + 0.2, 0), paleta.metal),
        ]);
        mallaGruas = instanciada(grua, new MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.35 }), MAX.cables);
        mallaCables = instanciada(
          new CylinderGeometry(0.035, 0.035, 1, 6).translate(0, 0.5, 0),
          new MeshStandardMaterial({ color: paleta.postes, roughness: 0.6, metalness: 0.5 }),
          MAX.cables,
        );
        mallaAsas = instanciada(
          new BoxGeometry(0.08, 0.08, 0.6),
          new MeshStandardMaterial({ color: paleta.metal, roughness: 0.5, metalness: 0.6 }),
          MAX.cables,
        );

        // Estación de armas: panel al costado con la luz celeste de la torre.
        const panel = mergeGeometries([
          pintar(new BoxGeometry(0.5, 1.5, 1.1).translate(0, 0.75, 0), paleta.metal),
          pintar(new BoxGeometry(0.6, 0.12, 1.2).translate(0, 1.55, 0), paleta.postes),
        ]);
        mallaEstaciones = instanciada(panel, new MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.45 }), MAX.armas);
        mallaLuces = instanciada(
          new BoxGeometry(0.52, 0.12, 0.9).translate(0, 1.25, 0),
          new MeshBasicMaterial({ color: paleta.torreLuz }),
          MAX.armas,
          false,
        );

        // Destello de un dron derribado, EMP y balas: luz celeste sin sombra.
        const luz = () =>
          new MeshBasicMaterial({ color: paleta.torreLuz, transparent: true, opacity: 0.85, blending: AdditiveBlending, depthWrite: false });
        mallaDestellos = instanciada(new IcosahedronGeometry(0.5, 1), luz(), MAX.destellos, false);
        mallaEmp = instanciada(new BoxGeometry(0.05, 3.2, 0.05).translate(0, 1.6, 0), luz(), MAX.emps * LINEAS_EMP, false);
        mallaEmp.setColorAt(0, color.set('#ffffff'));
        mallaBalas = instanciada(new BoxGeometry(0.6, 0.06, 0.06), luz(), MAX.balas, false);
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
  const colorInstancia = new Color();
  const arribaY = new Vector3(0, 1, 0);
  const haciaPivote = new Vector3();
  const giro = new Quaternion();
  const coloresContenedor = [paleta.carroceria, ...paleta.tintes.slice(1, 4), paleta.metal];

  /** Pone una instancia con posición, escala y giro (en y y en z). */
  function poner(malla: InstancedMesh, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, giroY = 0, giroZ = 0): number {
    ayudante.position.set(x, y, z);
    ayudante.rotation.set(0, giroY, giroZ);
    ayudante.scale.set(sx, sy, sz);
    ayudante.updateMatrix();
    malla.setMatrixAt(malla.count, ayudante.matrix);
    return malla.count++;
  }

  /** El cable de la grúa, de su punta (abajo) al pivote. */
  function ponerCable(malla: InstancedMesh, punta: [number, number], pivote: [number, number]): void {
    haciaPivote.set(pivote[0] - punta[0], pivote[1] - punta[1], 0);
    const largo = haciaPivote.length();
    giro.setFromUnitVectors(arribaY, haciaPivote.normalize());
    ayudante.position.set(punta[0], punta[1], 0);
    ayudante.quaternion.copy(giro);
    ayudante.scale.set(1, largo, 1);
    ayudante.updateMatrix();
    malla.setMatrixAt(malla.count++, ayudante.matrix);
  }

  /** Los obstáculos de la etapa 3, la zona de armas y las balas. */
  function moverMovimientos(t: number, s: Simulacion): void {
    if (s !== simAnterior) {
      destellos.clear();
      simAnterior = s;
    }
    for (const m of nuevas) m.count = 0;
    const quieto = opciones.movimientoReducido ?? false;
    for (const o of s.objetos()) {
      const e = o.evento;
      if (e.tipo === 'viga' && mallaVigas && !o.roto && mallaVigas.count < MAX.vigas) {
        poner(mallaVigas, o.x, 0, 0);
      } else if (e.tipo === 'contenedor' && mallaContenedores && mallaContenedores.count < MAX.contenedores) {
        const ancho = e.carril === undefined ? ANCHO_CONTENEDOR_2D : ANCHO_CONTENEDOR_3D;
        const i = poner(mallaContenedores, o.x, 0, (e.carril ?? 0) * ANCHO_CARRIL, e.largo, 1, ancho);
        mallaContenedores.setColorAt(i, colorInstancia.set(coloresContenedor[o.id % coloresContenedor.length]));
      } else if (e.tipo === 'foso' && mallaHuecos && mallaInteriores && mallaBordes && mallaHuecos.count < MAX.fosos) {
        poner(mallaHuecos, o.x, 0, 0, e.largo);
        poner(mallaInteriores, o.x, 0, 0, e.largo);
        poner(mallaBordes, o.x, -0.03, 0, 1, 1, 1, 0, 0.12);
        poner(mallaBordes, o.x + e.largo, -0.03, 0, 1, 1, 1, 0, -0.12);
      } else if (e.tipo === 'cable' && mallaGruas && mallaCables && mallaAsas && mallaGruas.count < MAX.cables) {
        const pivote: [number, number] = [o.x, ALTO_PIVOTE];
        const colgado = s.postura === 'colgado' && o.x <= 0.5 && o.x > -20;
        const punta = puntaCable(pivote, LARGO_CABLE, colgado ? [0, s.y + MANOS_SOBRE_PIES] : null);
        poner(mallaGruas, o.x, 0, 0);
        ponerCable(mallaCables, punta, pivote);
        poner(mallaAsas, punta[0], punta[1], 0);
      } else if (e.tipo === 'arma' && mallaEstaciones && mallaLuces && mallaEstaciones.count < MAX.armas) {
        poner(mallaEstaciones, o.x, 0, -(ANCHO_CARRETERA / 2 + 0.7));
        poner(mallaLuces, o.x, 0, -(ANCHO_CARRETERA / 2 + 0.7));
        // La pistola gira sobre la carretera hasta que el corredor la toma.
        if (mallaArmas && o.x > 0) poner(mallaArmas, o.x, 1.3, 0, 2.4, 2.4, 2.4, quieto ? 0.6 : t * 2.5);
      } else if (e.tipo === 'dron') {
        if (!o.roto) {
          if (mallaDrones && mallaDrones.count < MAX.drones) {
            const vaiven = quieto ? 0 : Math.sin(t * 5 + o.id) * 0.1;
            poner(mallaDrones, o.x, 1.3 + vaiven, e.carril * ANCHO_CARRIL, 1, 1, 1, 0, vaiven * 0.6);
          }
        } else if (mallaDestellos) {
          if (!destellos.has(o.id)) destellos.set(o.id, t);
          const k = (t - destellos.get(o.id)!) / DESTELLO_S;
          if (k < 1 && mallaDestellos.count < MAX.destellos) {
            const tam = quieto ? 1 : 0.5 + k * 1.3;
            poner(mallaDestellos, o.x, 1.3, e.carril * ANCHO_CARRIL, tam, tam, tam);
          }
        }
      } else if (e.tipo === 'emp' && mallaEmp && mallaEmp.count < MAX.emps * LINEAS_EMP) {
        for (let j = 0; j < LINEAS_EMP; j++) {
          const z = -2.4 + (4.8 * j) / (LINEAS_EMP - 1);
          const brillo = quieto ? 0.8 : 0.3 + azar() * 0.7;
          const i = poner(mallaEmp, o.x, 0, z, 1, quieto ? 1 : 0.7 + azar() * 0.3);
          mallaEmp.setColorAt(i, colorInstancia.setScalar(brillo));
        }
      }
    }
    if (mallaBalas) {
      for (const b of s.balas()) {
        if (mallaBalas.count >= MAX.balas) break;
        poner(mallaBalas, b.x, ALTO_BALA, b.carril * ANCHO_CARRIL);
      }
    }
    for (const m of nuevas) {
      m.visible = m.count > 0;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }

  /** Copia la geometría y el material de la primera malla de un modelo de la utilería. */
  function mallaDe(modelo: Object3D): Mesh {
    let fuente: Mesh | null = modelo instanceof Mesh ? modelo : null;
    modelo.traverse((o) => {
      if (!fuente && o instanceof Mesh) fuente = o;
    });
    if (!fuente) throw new Error(`el modelo "${modelo.name}" no trae una malla`);
    return fuente;
  }

  return {
    escena,
    pasos,
    llamadasMaximas: LLAMADAS_MAXIMAS,
    usarDron(modelo) {
      const fuente = mallaDe(modelo);
      mallaDrones = instanciada(fuente.geometry, fuente.material as Material, MAX.drones);
    },
    usarPistola(modelo) {
      const fuente = mallaDe(modelo);
      mallaArmas = instanciada(fuente.geometry, fuente.material as Material, MAX.armas);
    },
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
        // La sombra sigue al suelo de debajo (2 m encima de un contenedor) y no se ve sobre un foso.
        const piso = s.suelo;
        sombraCorredor.visible = piso !== null;
        if (piso !== null) {
          sombraCorredor.position.set(0, piso + 0.02, s.z);
          const escala = Math.max(0.4, 1 - (s.y - piso) * 0.35);
          sombraCorredor.scale.set(escala, escala, escala);
        }
      }
      moverMovimientos(t, s);

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
