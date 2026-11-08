import type { CamaraJuego } from '../camara/camara-juego';
import type { Carril, Modo, Nivel, PistaNivel } from '../datos/niveles/tipos';
import type { Animacion, Corredor } from '../entidades/corredor';
import type { Intencion } from '../entrada/controles';
import type { Pista } from '../mundo/tierra-baldia/pista';
import { TEXTOS } from '../textos/es';
import type { Postura } from './movimientos';
import { crearSimulacion, type EstadoCarrera, type EventoSim, type Simulacion } from './simulacion';

/** Cuánto dura la animación de golpe y la de aterrizar después del evento (s). */
const GOLPE_S = 0.5;
const ATERRIZAJE_S = 0.25;
const SACUDIDA_GOLPE = 0.35;
const SACUDIDA_ROTO = 0.15;
const VIBRACION_MS = 120;
/** El torso acusa el escudo roto y el doble salto un momento después del evento (s). */
const ESCUDO_ROTO_S = 0.5;
const DOBLE_SALTO_S = 0.35;
/** Más corto que la cadencia (0,15 s): cada disparo vuelve a empezar el gesto. */
const DISPARO_S = 0.1;
/** La pista de un movimiento sale cuando su obstáculo está a esta distancia o menos. */
const PISTA_A_M = 35;
/** El movimiento que hace irse a cada pista del nivel. */
const QUITA_PISTA: Record<PistaNivel, EventoSim['tipo']> = {
  rodar: 'rodar',
  caer: 'caida-rapida',
  trepar: 'trepar',
  cable: 'soltar',
};
/** El panel de fin espera a que se vea la caída o la llegada (el prototipo esperaba 0,9 s). */
const DEMORA_PANEL_S = 0.8;

export type PistaHud = 'saltar' | 'carril' | 'rodar' | 'caer' | 'trepar' | 'cable' | 'disparar' | null;

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
  /** El letrero "¡Justo! +n" sobre la cabeza del corredor (`en`, en píxeles CSS). */
  justo(puntos: number, en: { x: number; y: number }): void;
  /** El indicador de arma junto a las vidas. */
  arma(visible: boolean): void;
}

export interface DepsCarrera {
  nivel: Nivel;
  opciones?: { desde?: number; sinDanio?: boolean };
  corredor: Pick<Corredor, 'actualizar' | 'reiniciar' | 'animacion' | 'armaVisible'>;
  camara: CamaraJuego;
  pista: Pick<Pista, 'actualizar'>;
  hud: HudCarrera;
  avisos: { mostrar(texto: string): void };
  vibrar(ms: number): void;
  /** Guarda el puntaje si supera el récord del piso; devuelve el récord que queda y si es nuevo. */
  guardarRecord(puntaje: number): { record: number; nuevo: boolean };
  /** La cabeza del corredor en la pantalla, en píxeles CSS (para el "¡Justo!"). */
  proyectarCorredor(): { x: number; y: number };
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
  postura: Postura;
  armado: boolean;
  /** La pistola se ve en la mano. */
  pistola: boolean;
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
  let escudoRotoHasta = 0;
  let dobleSaltoHasta = 0;
  let disparoHasta = 0;
  let pistaActual: PistaHud = null;
  let vioCarriles = false;
  /** Las pistas del nivel que ya salieron en esta carrera (cada una sale una vez). */
  const pistasVistas = new Set<PistaNivel>();
  let terminada = false;
  /** El resultado ya guardado, esperando su momento para mostrarse. */
  let panel: { en: number; resultado: ResultadoCarrera } | null = null;

  const ponerPista = (cual: PistaHud) => {
    if (cual === pistaActual) return;
    pistaActual = cual;
    hud.pista(cual);
  };

  /** Saca la pista del primer obstáculo de cada movimiento cuando ya está cerca. */
  function mirarPistas(s: Simulacion): void {
    for (const o of s.objetos()) {
      const p = o.evento.pista;
      if (p && !pistasVistas.has(p) && o.x > 0 && o.x <= PISTA_A_M) {
        pistasVistas.add(p);
        ponerPista(p);
      }
    }
  }

  /** Un golpe se siente: la cámara se sacude y el celular vibra. */
  function sentirGolpe(): void {
    golpeHasta = t + GOLPE_S;
    camara.sacudir(SACUDIDA_GOLPE);
    deps.vibrar(VIBRACION_MS);
  }

  function alEvento(e: EventoSim, s: Simulacion): void {
    for (const [p, quita] of Object.entries(QUITA_PISTA)) {
      if (e.tipo === quita && pistaActual === p) ponerPista(null);
    }
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
      case 'foso':
        sentirGolpe();
        break;
      case 'doble-salto':
        dobleSaltoHasta = t + DOBLE_SALTO_S;
        break;
      case 'disparo':
        disparoHasta = t + DISPARO_S;
        if (pistaActual === 'disparar') ponerPista(null);
        break;
      case 'arma':
        avisos.mostrar(TEXTOS.juego.armaLista);
        hud.arma(true);
        ponerPista('disparar');
        break;
      case 'emp':
        avisos.mostrar(TEXTOS.juego.emp);
        hud.arma(false);
        if (pistaActual === 'disparar') ponerPista(null);
        break;
      case 'justo':
        hud.justo(e.puntos, deps.proyectarCorredor());
        break;
      case 'roto':
        camara.sacudir(SACUDIDA_ROTO);
        break;
      case 'escudo-roto':
        escudoRotoHasta = t + ESCUDO_ROTO_S;
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
        // El récord se guarda ya (por si sale antes); el panel aparece un momento después.
        const { record, nuevo } = deps.guardarRecord(s.puntaje);
        panel = { en: t + DEMORA_PANEL_S, resultado: { tipo: e.tipo, puntaje: s.puntaje, record, nuevoRecord: nuevo } };
        break;
      }
    }
  }

  return {
    empezar() {
      const o = deps.opciones ?? {};
      sim = crearSimulacion(nivel, { desde: o.desde, sinDanio: o.sinDanio });
      golpeHasta = aterrizajeHasta = escudoRotoHasta = dobleSaltoHasta = disparoHasta = 0;
      terminada = false;
      panel = null;
      pistaActual = null;
      pistasVistas.clear();
      vioCarriles = sim.modo === 3;
      corredor.reiniciar();
      camara.reiniciar(sim.modo);
      hud.reiniciar();
      hud.arma(sim.armado);
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
      if (s.estado === 'corriendo') mirarPistas(s);
      if (panel && t >= panel.en) {
        hud.terminar(panel.resultado);
        panel = null;
      }
      corredor.actualizar(dt, s, {
        golpe: t < golpeHasta,
        aterrizaje: t < aterrizajeHasta,
        escudoRoto: t < escudoRotoHasta,
        dobleSalto: t < dobleSaltoHasta,
        disparo: t < disparoHasta,
      });
      camara.actualizar(dt, s, aspecto);
      pista.actualizar(dt, t, s, camara.mezcla());
      hud.actualizar({ vidas: s.vidas, puntaje: s.puntaje, avance: Math.min(1, s.distancia / nivel.largo) });
    },
    accion(i) {
      if (!sim) return;
      // Tocar: colgado suelta, armado dispara y si no salta. Deslizar arriba: suelta o salta.
      if (i === 'tocar' || i === 'saltar') {
        if (sim.postura === 'colgado') sim.soltar();
        else if (i === 'tocar' && sim.armado) sim.disparar();
        else sim.saltar();
      } else if (i === 'rodar') sim.rodar();
      else if (i === 'disparar') sim.disparar();
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
        postura: sim.postura,
        armado: sim.armado,
        pistola: corredor.armaVisible(),
      };
    },
  };
}
