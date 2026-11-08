import {
  AnimationMixer,
  Box3,
  Color,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  PropertyBinding,
  Vector3,
  type AnimationAction,
  type AnimationClip,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { Postura } from '../juego/movimientos';
import type { EstadoCarrera, Simulacion } from '../juego/simulacion';
import { ANCHO_CARRIL } from '../juego/simulacion';
import type { PaletaExterior } from '../mundo/paletas';

export type Animacion =
  | 'quieto'
  | 'correr'
  | 'despegar'
  | 'aire'
  | 'aterrizar'
  | 'golpe'
  | 'morir'
  | 'rodar'
  | 'caer-rapido'
  | 'trepar'
  | 'colgado'
  | 'foso'
  | 'escudo-roto'
  | 'doble-salto'
  | 'celebrar';

/** Lo que acaba de pasar en la carrera y el corredor todavía acusa (lo decide la carrera). */
export interface Recientes {
  golpe: boolean;
  aterrizaje: boolean;
  escudoRoto: boolean;
  dobleSalto: boolean;
  disparo: boolean;
}

/**
 * Clips de cuerpo entero que trae corredor.glb: Universal Animation Library 1 y 2 (Quaternius, CC0)
 * y Colgar_Loop, propio. 'escudo-roto' no está aquí: es una capa del torso (ver abajo).
 */
const CLIP: Record<Exclude<Animacion, 'escudo-roto'>, string> = {
  quieto: 'Idle_Loop',
  correr: 'Sprint_Loop',
  despegar: 'Jump_Start',
  aire: 'Jump_Loop',
  aterrizar: 'Jump_Land',
  golpe: 'Hit_Chest',
  morir: 'Death01',
  rodar: 'Roll',
  'caer-rapido': 'Jump_Loop',
  trepar: 'ClimbUp_1m',
  colgado: 'Colgar_Loop',
  foso: 'Hit_Knockback',
  'doble-salto': 'NinjaJump_Start',
  celebrar: 'Yes',
};
/** Las que se reproducen una vez y se quedan en su último cuadro. */
const UNA_VEZ: readonly Animacion[] = [
  'despegar',
  'aterrizar',
  'golpe',
  'morir',
  'rodar',
  'trepar',
  'foso',
  'doble-salto',
  'celebrar',
];
const MEZCLA_S = 0.12;
const ALTURA_M = 1.75;
const INCLINACION_MAX = 0.25;
/** Inclinación hacia adelante durante la caída rápida. */
const INCLINACION_CAIDA = 0.35;
/** A esta velocidad (m/s) Sprint_Loop se ve a su ritmo natural. */
const VELOCIDAD_NATURAL = 10;
/** El hueso desde el que empieza la parte de arriba del cuerpo (torso, brazos y cabeza). */
const HUESO_TORSO = 'spine_01';
const HUESO_MANO = 'hand_r';
/** Cuánto dura a lo sumo el gesto de disparo antes de volver a apuntar. */
const DISPARO_MAX_S = 0.35;
/** La empuñadura queda un poco por delante de la muñeca. */
const MANO_A_EMPUNADURA = new Vector3(0.06, -0.02, 0);

/** Qué animación toca según el momento de la carrera (función pura, probada). */
export function elegirAnimacion(s: {
  estado: EstadoCarrera;
  postura: Postura;
  y: number;
  vy: number;
  suelo: number | null;
  caidaRapida: boolean;
  recientes: Recientes;
}): Animacion {
  if (s.estado === 'derrota') return 'morir';
  if (s.estado === 'fin') return 'celebrar';
  if (s.postura === 'foso') return 'foso';
  if (s.postura === 'trepando') return 'trepar';
  if (s.postura === 'colgado') return 'colgado';
  if (s.postura === 'rodando') return 'rodar';
  if (s.recientes.golpe) return 'golpe';
  if (s.recientes.escudoRoto) return 'escudo-roto';
  if (s.y > (s.suelo ?? -Infinity) + 0.01) {
    if (s.caidaRapida) return 'caer-rapido';
    if (s.recientes.dobleSalto) return 'doble-salto';
    return s.vy > 4 ? 'despegar' : 'aire';
  }
  if (s.recientes.aterrizaje) return 'aterrizar';
  return 'correr';
}

export interface Corredor {
  grupo: Group;
  animacion(): Animacion;
  /** Cuánto va la animación de ahora, de 0 a 1 (la de las piernas si corre con el arma). */
  avance(): number;
  actualizar(dt: number, s: Simulacion, recientes: Recientes): void;
  /** Le da la pistola (se ve en la mano derecha solo mientras la carrera lo tiene armado). */
  ponerArma(pistola: Object3D): void;
  /** La pistola se ve en la mano ahora. */
  armaVisible(): boolean;
  /** Vuelve a correr desde el principio (al reintentar). */
  reiniciar(): void;
}

/** Copia de un clip con solo las pistas de los huesos que pide `quedarse`. */
function recortar(clip: AnimationClip, nombre: string, quedarse: (hueso: string) => boolean): AnimationClip {
  const copia = clip.clone();
  copia.name = nombre;
  copia.tracks = copia.tracks.filter((t) => quedarse(PropertyBinding.parseTrackName(t.name).nodeName));
  return copia;
}

/**
 * El corredor provisional: el maniquí CC0 con esqueleto, teñido con la paleta. El personaje final
 * llega en la etapa 5 con esta misma firma.
 *
 * Las animaciones se mezclan por pesos: cada momento pide unas acciones con peso 1 y las demás van
 * a 0 en MEZCLA_S. Con el arma (o con el escudo roto) las piernas siguen corriendo con Sprint_Loop
 * recortado a la mitad de abajo, y el torso toma su propio clip.
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

  const torso = modelo.getObjectByName(HUESO_TORSO);
  const mano = modelo.getObjectByName(HUESO_MANO);
  if (!torso || !mano) throw new Error(`corredor.glb no trae los huesos ${HUESO_TORSO} y ${HUESO_MANO}`);
  const huesosTorso = new Set<string>();
  torso.traverse((o) => huesosTorso.add(o.name));
  const esTorso = (hueso: string) => huesosTorso.has(hueso);

  const buscarClip = (nombre: string): AnimationClip => {
    const clip = gltf.animations.find((c: AnimationClip) => c.name === nombre);
    if (!clip) throw new Error(`corredor.glb no trae la animación ${nombre}`);
    return clip;
  };

  const mezclador = new AnimationMixer(modelo);
  const preparar = (clip: AnimationClip, unaVez: boolean): AnimationAction => {
    const accion = mezclador.clipAction(clip);
    if (unaVez) {
      accion.setLoop(LoopOnce, 1);
      accion.clampWhenFinished = true;
    } else {
      accion.setLoop(LoopRepeat, Infinity);
    }
    return accion;
  };

  const cuerpoEntero = new Map<Animacion, AnimationAction>();
  for (const [animacion, nombre] of Object.entries(CLIP) as [Exclude<Animacion, 'escudo-roto'>, string][]) {
    // La caída rápida usa Jump_Loop como 'aire': una copia del clip para que sean dos acciones.
    const clip = animacion === 'caer-rapido' ? buscarClip(nombre).clone() : buscarClip(nombre);
    cuerpoEntero.set(animacion, preparar(clip, UNA_VEZ.includes(animacion)));
  }
  const correr = cuerpoEntero.get('correr')!;
  const rodar = cuerpoEntero.get('rodar')!;
  const trepar = cuerpoEntero.get('trepar')!;
  // Rodar y trepar no corren solos: su cuadro sale del avance del movimiento en la simulación.
  rodar.timeScale = 0;
  trepar.timeScale = 0;

  // Capas: piernas corriendo + torso apuntando, disparando o con el escudo roto.
  const piernas = preparar(recortar(buscarClip('Sprint_Loop'), 'Sprint_Piernas', (h) => !esTorso(h)), false);
  const apuntar = preparar(recortar(buscarClip('Pistol_Aim_Neutral'), 'Apuntar_Torso', esTorso), false);
  const disparo = preparar(recortar(buscarClip('Pistol_Shoot'), 'Disparo_Torso', esTorso), true);
  const escudo = preparar(recortar(buscarClip('Idle_Shield_Break'), 'Escudo_Torso', esTorso), true);

  const todas = [...cuerpoEntero.values(), piernas, apuntar, disparo, escudo];
  const peso = new Map<AnimationAction, number>(todas.map((a) => [a, 0]));

  let actual: Animacion = 'correr';
  let pistola: Object3D | null = null;
  let tiempo = 0;
  let disparoHasta = 0;
  let disparoAntes = false;
  const punto = new Vector3();

  /** Las acciones que pide un momento (con peso 1). */
  function pedidas(animacion: Animacion, armado: boolean): AnimationAction[] {
    if (animacion === 'escudo-roto') return [piernas, escudo];
    if (animacion === 'correr' && armado) return [piernas, tiempo < disparoHasta ? disparo : apuntar];
    return [cuerpoEntero.get(animacion)!];
  }

  function arrancar(a: AnimationAction): void {
    a.reset().play();
    // Las piernas recortadas y Sprint_Loop entero van al mismo paso para que no salten.
    if (a === piernas && peso.get(correr)! > 0) piernas.time = correr.time;
    if (a === correr && peso.get(piernas)! > 0) correr.time = piernas.time;
  }

  function cambiarA(nueva: Animacion, s: Simulacion): void {
    if (nueva === actual) return;
    actual = nueva;
    // Las de una vez empiezan de nuevo cada vez que se piden.
    for (const a of pedidas(nueva, s.armado)) if (a.loop === LoopOnce) arrancar(a);
  }

  function mezclar(dt: number, metas: readonly AnimationAction[]): void {
    const paso = dt / MEZCLA_S;
    for (const a of todas) {
      const antes = peso.get(a)!;
      const meta = metas.includes(a) ? 1 : 0;
      if (meta > 0 && antes === 0 && !a.isRunning()) arrancar(a);
      const ahora = meta > antes ? Math.min(meta, antes + paso) : Math.max(meta, antes - paso);
      peso.set(a, ahora);
      a.setEffectiveWeight(ahora);
      if (ahora === 0 && antes > 0) a.stop();
    }
  }

  function empezarCorriendo(): void {
    mezclador.stopAllAction();
    for (const a of todas) peso.set(a, 0);
    actual = 'correr';
    disparoHasta = 0;
    disparoAntes = false;
    correr.reset().play();
    correr.setEffectiveWeight(1);
    peso.set(correr, 1);
  }
  empezarCorriendo();

  return {
    grupo,
    animacion: () => actual,
    avance() {
      const a = pedidas(actual, pistola?.visible ?? false)[0];
      return a.time / a.getClip().duration;
    },
    actualizar(dt, s, recientes) {
      tiempo += dt;
      // Cada disparo nuevo con el arma hace el gesto de disparar con el torso.
      if (recientes.disparo && !disparoAntes && s.armado) {
        disparoHasta = tiempo + Math.min(DISPARO_MAX_S, disparo.getClip().duration);
        disparo.reset().play();
      }
      disparoAntes = recientes.disparo;

      cambiarA(
        elegirAnimacion({
          estado: s.estado,
          postura: s.postura,
          y: s.y,
          vy: s.vy,
          suelo: s.suelo,
          caidaRapida: s.caidaRapida,
          recientes,
        }),
        s,
      );
      const ritmo = Math.max(0.6, s.velocidad / VELOCIDAD_NATURAL);
      correr.timeScale = ritmo;
      piernas.timeScale = ritmo;
      mezclar(dt, pedidas(actual, s.armado));
      // Rodar otra vez vuelve a empezar el giro, y el trepar dura lo mismo que en las reglas (más lento
      // tras un golpe): el cuadro de los dos clips sale del avance de la simulación.
      const avance = s.progreso;
      const movimiento = actual === 'rodar' ? rodar : actual === 'trepar' ? trepar : null;
      if (movimiento && avance !== null) movimiento.time = Math.min(avance, 0.999) * movimiento.getClip().duration;
      mezclador.update(dt);

      // La altura puede ser negativa: cae dentro del foso.
      grupo.position.set(0, s.y, s.z);
      // Se inclina hacia el carril al que va (solo se ve en 3D) y hacia adelante en la caída rápida.
      const hacia = s.modo === 3 ? s.carril * ANCHO_CARRIL - s.z : 0;
      const inclinacion = Math.max(-INCLINACION_MAX, Math.min(INCLINACION_MAX, hacia * 0.18));
      const suave = Math.min(1, dt * 10);
      grupo.rotation.x += (inclinacion - grupo.rotation.x) * suave;
      const caida = actual === 'caer-rapido' ? -INCLINACION_CAIDA : 0;
      grupo.rotation.z += (caida - grupo.rotation.z) * suave;
      // Parpadea mientras no recibe daño, como en el prototipo.
      grupo.visible = !(s.estado === 'corriendo' && s.invulnerable > 0) || Math.floor(tiempo * 16) % 2 === 0;

      // La pistola sigue a la mano derecha, con el cañón hacia adelante.
      if (pistola) {
        pistola.visible = s.armado;
        if (s.armado) {
          grupo.updateMatrixWorld(true);
          mano.getWorldPosition(punto);
          grupo.worldToLocal(punto);
          pistola.position.copy(punto).add(MANO_A_EMPUNADURA);
        }
      }
    },
    armaVisible: () => pistola?.visible ?? false,
    ponerArma(modeloPistola) {
      pistola = modeloPistola.clone();
      pistola.name = 'pistola-corredor';
      pistola.position.set(0, 0, 0);
      pistola.rotation.set(0, 0, 0);
      pistola.visible = false;
      pistola.traverse((o) => {
        if (o instanceof Mesh) o.castShadow = true;
      });
      grupo.add(pistola);
    },
    reiniciar() {
      empezarCorriendo();
      grupo.rotation.set(0, 0, 0);
      grupo.visible = true;
      if (pistola) pistola.visible = false;
    },
  };
}
