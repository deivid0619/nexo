import type { CamaraJuego } from '../camara/camara-juego';
import type { Carril, Modo, Nivel } from '../datos/niveles/tipos';
import type { Animacion, Corredor } from '../entidades/corredor';
import type { Intencion } from '../entrada/controles';
import type { Pista } from '../mundo/tierra-baldia/pista';
import { TEXTOS } from '../textos/es';
import { crearSimulacion, type EstadoCarrera, type EventoSim, type Simulacion } from './simulacion';

/** Cuánto dura la animación de golpe y la de aterrizar después del evento (s). */
const GOLPE_S = 0.5;
const ATERRIZAJE_S = 0.25;
const SACUDIDA_GOLPE = 0.35;
const SACUDIDA_ROTO = 0.15;
const VIBRACION_MS = 120;

export type PistaHud = 'saltar' | 'carril' | null;

export interface ResultadoCarrera {
  tipo: 'derrota' | 'fin';
  puntaje: number;
  record: number;
  nuevoRecord: boolean;
}

/** Lo que la carrera le pide a la pantalla (pantallas/juego.ts). */
export interface HudCarrera {
  reiniciar(): void;
  actualizar(d: { vidas: number; puntaje: number; avance: number }): void;
  pista(cual: PistaHud): void;
  terminar(r: ResultadoCarrera): void;
}

export interface DepsCarrera {
  nivel: Nivel;
  opciones?: { desde?: number; sinDanio?: boolean };
  corredor: Pick<Corredor, 'actualizar' | 'reiniciar' | 'animacion'>;
  camara: CamaraJuego;
  pista: Pick<Pista, 'actualizar'>;
  hud: HudCarrera;
  avisos: { mostrar(texto: string): void };
  vibrar(ms: number): void;
  /** Guarda el puntaje si supera el récord del piso; devuelve el récord que queda y si es nuevo. */
  guardarRecord(puntaje: number): { record: number; nuevo: boolean };
}

/** Lo que el modo de prueba lee de la carrera. */
export interface EstadoJuego {
  estado: EstadoCarrera;
  distancia: number;
  modo: Modo;
  carril: Carril;
  y: number;
  vidas: number;
  puntaje: number;
  animacion: Animacion;
  mezcla: number;
}

export interface Carrera {
  /** Empieza un tramo desde cero (también al reintentar). */
  empezar(): void;
  /** Termina la carrera al salir de la pantalla. */
  detener(): void;
  activa(): boolean;
  /** Un cuadro: simulación, eventos, corredor, cámara y escena. */
  paso(dt: number, t: number, aspecto: number): void;
  accion(i: Intencion): void;
  estado(): EstadoJuego | null;
}

/**
 * Una carrera en curso: une la simulación (reglas) con lo que se ve y se siente
 * (corredor, cámara, escena, HUD, avisos y vibración).
 */
export function crearCarrera(deps: DepsCarrera): Carrera {
  const { nivel, corredor, camara, pista, hud, avisos } = deps;
  let sim: Simulacion | null = null;
  let t = 0;
  let golpeHasta = 0;
  let aterrizajeHasta = 0;
  let pistaActual: PistaHud = null;
  let vioCarriles = false;
  let terminada = false;

  const ponerPista = (cual: PistaHud) => {
    if (cual === pistaActual) return;
    pistaActual = cual;
    hud.pista(cual);
  };

  function alEvento(e: EventoSim, s: Simulacion): void {
    switch (e.tipo) {
      case 'salto':
        if (pistaActual === 'saltar') ponerPista(null);
        break;
      case 'carril':
        if (pistaActual === 'carril') ponerPista(null);
        break;
      case 'aterrizaje':
        aterrizajeHasta = t + ATERRIZAJE_S;
        break;
      case 'golpe':
        golpeHasta = t + GOLPE_S;
        camara.sacudir(SACUDIDA_GOLPE);
        deps.vibrar(VIBRACION_MS);
        break;
      case 'roto':
        camara.sacudir(SACUDIDA_ROTO);
        break;
      case 'escudo-roto':
        avisos.mostrar(TEXTOS.juego.escudoRoto);
        break;
      case 'habilidad':
        avisos.mostrar(TEXTOS.juego.habilidades[e.clase]);
        break;
      case 'portal':
        avisos.mostrar(e.a === 3 ? TEXTOS.juego.portal3d : TEXTOS.juego.portal2d);
        if (e.a === 3 && !vioCarriles) {
          vioCarriles = true;
          ponerPista('carril');
        } else if (e.a === 2 && pistaActual === 'carril') {
          ponerPista(null);
        }
        break;
      case 'derrota':
      case 'fin': {
        if (terminada) break;
        terminada = true;
        ponerPista(null);
        const { record, nuevo } = deps.guardarRecord(s.puntaje);
        hud.terminar({ tipo: e.tipo, puntaje: s.puntaje, record, nuevoRecord: nuevo });
        break;
      }
    }
  }

  return {
    empezar() {
      const o = deps.opciones ?? {};
      sim = crearSimulacion(nivel, { desde: o.desde, sinDanio: o.sinDanio });
      golpeHasta = aterrizajeHasta = 0;
      terminada = false;
      pistaActual = null;
      vioCarriles = sim.modo === 3;
      corredor.reiniciar();
      camara.reiniciar(sim.modo);
      hud.reiniciar();
      ponerPista(sim.modo === 3 ? 'carril' : 'saltar');
      hud.actualizar({ vidas: sim.vidas, puntaje: sim.puntaje, avance: sim.distancia / nivel.largo });
    },
    detener() {
      sim = null;
    },
    activa: () => sim !== null,
    paso(dt, ahora, aspecto) {
      const s = sim;
      if (!s) return;
      t = ahora;
      for (const e of s.paso(dt)) alEvento(e, s);
      corredor.actualizar(dt, s, t < golpeHasta, t < aterrizajeHasta);
      camara.actualizar(dt, s, aspecto);
      pista.actualizar(dt, t, s, camara.mezcla());
      hud.actualizar({ vidas: s.vidas, puntaje: s.puntaje, avance: Math.min(1, s.distancia / nivel.largo) });
    },
    accion(i) {
      if (!sim) return;
      if (i === 'saltar') sim.saltar();
      else sim.cambiarCarril(i === 'derecha' ? 1 : -1);
    },
    estado() {
      if (!sim) return null;
      return {
        estado: sim.estado,
        distancia: sim.distancia,
        modo: sim.modo,
        carril: sim.carril,
        y: sim.y,
        vidas: sim.vidas,
        puntaje: sim.puntaje,
        animacion: corredor.animacion(),
        mezcla: camara.mezcla(),
      };
    },
  };
}
