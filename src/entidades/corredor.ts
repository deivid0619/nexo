import {
  AnimationMixer,
  Box3,
  Color,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type AnimationAction,
  type AnimationClip,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { EstadoCarrera, Simulacion } from '../juego/simulacion';
import { ANCHO_CARRIL } from '../juego/simulacion';
import type { PaletaExterior } from '../mundo/paletas';

export type Animacion = 'quieto' | 'correr' | 'despegar' | 'aire' | 'aterrizar' | 'golpe' | 'morir';

/** Animaciones de Universal Animation Library (Quaternius, CC0) que trae corredor.glb. */
const CLIP: Record<Animacion, string> = {
  quieto: 'Idle_Loop',
  correr: 'Sprint_Loop',
  despegar: 'Jump_Start',
  aire: 'Jump_Loop',
  aterrizar: 'Jump_Land',
  golpe: 'Hit_Chest',
  morir: 'Death01',
};
/** Las que se reproducen una vez y se quedan en su último cuadro. */
const UNA_VEZ: readonly Animacion[] = ['despegar', 'aterrizar', 'golpe', 'morir'];
const MEZCLA_S = 0.12;
const ALTURA_M = 1.75;
const INCLINACION_MAX = 0.25;
/** A esta velocidad (m/s) Sprint_Loop se ve a su ritmo natural. */
const VELOCIDAD_NATURAL = 10;

/** Qué animación toca según el momento de la carrera (función pura, probada). */
export function elegirAnimacion(s: {
  estado: EstadoCarrera;
  y: number;
  vy: number;
  golpeReciente: boolean;
  aterrizajeReciente: boolean;
}): Animacion {
  if (s.estado === 'derrota') return 'morir';
  if (s.estado === 'fin') return 'quieto';
  if (s.golpeReciente) return 'golpe';
  if (s.y > 0) return s.vy > 4 ? 'despegar' : 'aire';
  if (s.aterrizajeReciente) return 'aterrizar';
  return 'correr';
}

export interface Corredor {
  grupo: Group;
  animacion(): Animacion;
  actualizar(dt: number, s: Simulacion, golpeReciente: boolean, aterrizajeReciente: boolean): void;
  /** Vuelve a correr desde el principio (al reintentar). */
  reiniciar(): void;
}

/**
 * El corredor provisional de la etapa 2: el maniquí CC0 con esqueleto, teñido con la paleta.
 * En la etapa 3 se cambia por el sobreviviente final con esta misma firma.
 */
export async function cargarCorredor(url: string, paleta: PaletaExterior): Promise<Corredor> {
  const cargador = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await cargador.loadAsync(url);
  const modelo = gltf.scene;

  const cuerpo = new MeshStandardMaterial({ color: new Color(paleta.abrigo), roughness: 0.85 });
  const uniones = new MeshStandardMaterial({ color: new Color(paleta.pantalon), roughness: 0.9 });
  modelo.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    o.castShadow = true;
    o.receiveShadow = true;
    o.frustumCulled = false; // la caja de una malla con esqueleto no sigue a la animación
    const nombre = (Array.isArray(o.material) ? o.material[0] : o.material)?.name ?? '';
    o.material = nombre.includes('Joint') ? uniones : cuerpo;
  });

  // Alto de 1,75 m con los pies en el suelo, mirando hacia +x (hacia donde corre).
  const caja = new Box3().setFromObject(modelo);
  const alto = caja.getSize(new Vector3()).y || 1;
  modelo.scale.setScalar(ALTURA_M / alto);
  modelo.position.y = -caja.min.y * (ALTURA_M / alto);
  modelo.rotation.y = Math.PI / 2;

  const grupo = new Group();
  grupo.name = 'corredor';
  grupo.add(modelo);

  const mezclador = new AnimationMixer(modelo);
  const acciones = new Map<Animacion, AnimationAction>();
  for (const [animacion, nombre] of Object.entries(CLIP) as [Animacion, string][]) {
    const clip = gltf.animations.find((c: AnimationClip) => c.name === nombre);
    if (!clip) throw new Error(`corredor.glb no trae la animación ${nombre}`);
    const accion = mezclador.clipAction(clip);
    if (UNA_VEZ.includes(animacion)) {
      accion.setLoop(LoopOnce, 1);
      accion.clampWhenFinished = true;
    } else {
      accion.setLoop(LoopRepeat, Infinity);
    }
    acciones.set(animacion, accion);
  }

  let actual: Animacion = 'correr';
  acciones.get(actual)!.play();
  let tiempo = 0;

  function cambiarA(nueva: Animacion): void {
    if (nueva === actual) return;
    const antes = acciones.get(actual)!;
    const despues = acciones.get(nueva)!;
    despues.reset().setEffectiveWeight(1).play();
    antes.crossFadeTo(despues, MEZCLA_S, false);
    actual = nueva;
  }

  return {
    grupo,
    animacion: () => actual,
    actualizar(dt, s, golpeReciente, aterrizajeReciente) {
      tiempo += dt;
      cambiarA(elegirAnimacion({ estado: s.estado, y: s.y, vy: s.vy, golpeReciente, aterrizajeReciente }));
      acciones.get('correr')!.timeScale = Math.max(0.6, s.velocidad / VELOCIDAD_NATURAL);
      mezclador.update(dt);

      grupo.position.set(0, s.y, s.z);
      // Se inclina hacia el carril al que va (solo se ve en 3D).
      const hacia = s.modo === 3 ? s.carril * ANCHO_CARRIL - s.z : 0;
      const inclinacion = Math.max(-INCLINACION_MAX, Math.min(INCLINACION_MAX, hacia * 0.18));
      grupo.rotation.x += (inclinacion - grupo.rotation.x) * Math.min(1, dt * 10);
      // Parpadea mientras no recibe daño, como en el prototipo.
      grupo.visible = !(s.estado === 'corriendo' && s.invulnerable > 0) || Math.floor(tiempo * 16) % 2 === 0;
    },
    reiniciar() {
      mezclador.stopAllAction();
      actual = 'correr';
      acciones.get(actual)!.reset().play();
      grupo.rotation.set(0, 0, 0);
      grupo.visible = true;
    },
  };
}
