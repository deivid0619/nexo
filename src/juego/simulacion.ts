import type { Carril, Evento, Habilidad, Modo, Nivel } from '../datos/niveles/tipos';
import {
  ALTO_CONTENEDOR,
  alturaCuerpo,
  BONO_JUSTO,
  DURACION_RODAR,
  DURACION_TREPAR,
  DURACION_TREPAR_GOLPE,
  MEDIO_ANCHO_CONTENEDOR,
  type Postura,
  VENTANA_JUSTO_S,
  VIGA_LIBRE,
  VIGA_TOPE,
  VY_CAIDA_RAPIDA,
} from './movimientos';

// Números del prototipo (metros y segundos), en el documento de diseño y el plan de la etapa 2.
export const GRAVEDAD = 24;
export const SALTO = 8.5;
export const DOBLE_SALTO = 8;
export const ANCHO_CARRIL = 1.6;
const SUAVIZADO_CARRIL = 12;
const VELOCIDAD_BASE = 9;
const VELOCIDAD_POR_METRO = 0.006;
const VELOCIDAD_MAXIMA = 12;
const VELOCIDAD_TURBO = 15;
export const VIDAS = 3;
const SIN_DANIO_TRAS_GOLPE = 1.4;
const SIN_DANIO_TRAS_ESCUDO = 0.8;
const DURACION: Record<Habilidad, number> = { escudo: 10, turbo: 3, doble: 10 };
/** Los objetos aparecen a esta distancia por delante y se van a esta por detrás. */
export const APARECE_M = 75;
export const SE_VA_M = -14;
const BONO_HABILIDAD = 25;
const BONO_ROTO = 30;
/** Medio largo de cada obstáculo a lo largo de la pista: el contacto empieza a esta x. */
const BORDE_VALLA = 0.32;
const BORDE_VIGA = 0.35;
const BORDE_CONTENEDOR = 0.3;
/** Hasta dónde se ve caer al corredor dentro de un foso. */
const FONDO_FOSO = -6;

export type EstadoCarrera = 'corriendo' | 'derrota' | 'fin';

/** Un evento del nivel que ya está cerca, con su x relativa al jugador (x = en − distancia). */
export interface ObjetoPista {
  id: number;
  evento: Evento;
  x: number;
  /** Lo rompió el turbo. */
  roto: boolean;
  /** Una habilidad ya recogida. */
  tomado: boolean;
}

export type EventoSim =
  | {
      tipo:
        | 'salto'
        | 'doble-salto'
        | 'aterrizaje'
        | 'carril'
        | 'derrota'
        | 'fin'
        | 'golpe'
        | 'escudo-roto'
        | 'rodar'
        | 'caida-rapida'
        | 'trepar'
        | 'foso';
    }
  | { tipo: 'justo'; puntos: number }
  | { tipo: 'portal'; a: Modo }
  | { tipo: 'habilidad'; clase: Habilidad }
  | { tipo: 'roto'; id: number };

export interface Simulacion {
  readonly estado: EstadoCarrera;
  /** Metros recorridos desde el inicio del tramo. */
  readonly distancia: number;
  readonly velocidad: number;
  readonly modo: Modo;
  readonly carril: Carril;
  /** Posición lateral, suavizada hacia el carril. */
  readonly z: number;
  /** Altura del salto. */
  readonly y: number;
  readonly vy: number;
  readonly vidas: number;
  /** Segundos que quedan sin recibir daño. */
  readonly invulnerable: number;
  /** Segundos que le quedan a cada habilidad. */
  readonly habilidades: Readonly<Record<Habilidad, number>>;
  readonly puntaje: number;
  readonly nivel: Nivel;
  /** Qué hace el cuerpo (en el aire sigue 'corriendo'; mira `y`). */
  readonly postura: Postura;
  /** Bajando en caída rápida, hasta tocar el suelo. */
  readonly caidaRapida: boolean;
  /** Altura del suelo bajo el corredor: 0, 2 encima de un contenedor y null sobre un foso. */
  readonly suelo: number | null;
  objetos(): readonly ObjetoPista[];
  /** Avanza `dt` segundos; devuelve lo que pasó (incluye lo que causaron las acciones). */
  paso(dt: number): EventoSim[];
  saltar(): void;
  /** En el suelo rueda; en el aire hace la caída rápida. */
  rodar(): void;
  cambiarCarril(d: -1 | 1): void;
}

/** La carrera de un tramo: reglas y estado, sin nada de Three.js. */
export function crearSimulacion(nivel: Nivel, opciones: { desde?: number; sinDanio?: boolean } = {}): Simulacion {
  const sinDanio = opciones.sinDanio ?? false;
  let estado: EstadoCarrera = 'corriendo';
  let distancia = 0;
  let velocidad = VELOCIDAD_BASE;
  let modo: Modo = 2;
  let carril: Carril = 0;
  let z = 0;
  let y = 0;
  let vy = 0;
  let enAire = false;
  let dobleUsado = false;
  let vidas = VIDAS;
  let invulnerable = 0;
  const habilidades: Record<Habilidad, number> = { escudo: 0, turbo: 0, doble: 0 };
  let bono = 0;
  let siguiente = 0;
  let ultimoId = 0;
  let objetos: ObjetoPista[] = [];
  let pendientes: EventoSim[] = [];
  /** Objetos que ya actuaron (un golpe o un portal cuentan una sola vez). */
  const golpeados = new Set<number>();
  /** Obstáculos que ya pasaron sin golpe (se revisa una vez si fue "¡Justo!"). */
  const pasados = new Set<number>();
  /** Reloj de la carrera, para el "¡Justo!" y la duración del giro. */
  let tiempo = 0;
  let postura: Postura = 'corriendo';
  let finRodar = 0;
  let caidaRapida = false;
  let inicioSalto = -Infinity;
  let inicioRodar = -Infinity;
  // Trepar: el contenedor, desde qué altura y cuándo termina.
  let trepado: ObjetoPista | null = null;
  let yTrepar = 0;
  let inicioTrepar = 0;
  let finTrepar = 0;

  // Empezar a mitad del tramo (modo de prueba): se aplican los portales que ya habrían pasado.
  const desde = Math.max(0, opciones.desde ?? 0);
  while (siguiente < nivel.eventos.length && nivel.eventos[siguiente].en < desde) {
    const e = nivel.eventos[siguiente++];
    if (e.tipo === 'portal') modo = e.a;
  }
  distancia = desde;

  const zCarril = (c: Carril | undefined) => (c ?? 0) * ANCHO_CARRIL;
  /** El cuerpo cae dentro del ancho del contenedor (en 2D siempre). */
  const alLado = (c: Carril | undefined) => modo === 2 || Math.abs(z - zCarril(c)) < MEDIO_ANCHO_CONTENEDOR;
  /** Largo de un obstáculo a lo largo de la pista (0 si es puntual). */
  const largoDe = (e: Evento) => ('largo' in e ? e.largo : 0);

  /** Lo que hay bajo el centro del corredor: 0, el techo de un contenedor o null sobre un foso. */
  function sueloBajo(): number | null {
    let piso: number | null = 0;
    for (const o of objetos) {
      const e = o.evento;
      const x = e.en - distancia;
      if (e.tipo === 'contenedor' && x <= 0 && x + e.largo >= 0 && alLado(e.carril)) return ALTO_CONTENEDOR;
      if (e.tipo === 'foso' && x < 0 && x + e.largo > 0) piso = null;
    }
    return piso;
  }

  function danio(): void {
    if (sinDanio || invulnerable > 0) return;
    if (habilidades.escudo > 0) {
      habilidades.escudo = 0;
      invulnerable = SIN_DANIO_TRAS_ESCUDO;
      pendientes.push({ tipo: 'escudo-roto' });
      return;
    }
    vidas--;
    invulnerable = SIN_DANIO_TRAS_GOLPE;
    pendientes.push({ tipo: 'golpe' });
    if (vidas <= 0) {
      estado = 'derrota';
      pendientes.push({ tipo: 'derrota' });
    }
  }

  function chocar(o: ObjetoPista): void {
    if (habilidades.turbo > 0) {
      o.roto = true;
      bono += BONO_ROTO;
      pendientes.push({ tipo: 'roto', id: o.id });
    } else {
      danio();
    }
  }

  function empezarRodar(): void {
    postura = 'rodando';
    finRodar = tiempo + DURACION_RODAR;
    inicioRodar = tiempo;
    pendientes.push({ tipo: 'rodar' });
  }

  /**
   * La primera vez que un obstáculo queda atrás sin golpe: si el movimiento que lo pasó empezó a lo
   * sumo VENTANA_JUSTO_S antes del contacto (cuando su x llegó a `borde`), es "¡Justo!".
   */
  function pasar(o: ObjetoPista, borde: number, inicio: number): void {
    if (o.x > 0 || golpeados.has(o.id) || pasados.has(o.id)) return;
    pasados.add(o.id);
    const contacto = tiempo - (borde - o.x) / velocidad;
    if (inicio <= contacto && contacto - inicio <= VENTANA_JUSTO_S) {
      bono += BONO_JUSTO;
      pendientes.push({ tipo: 'justo', puntos: BONO_JUSTO });
    }
  }

  function aterrizar(piso: number): void {
    y = piso;
    vy = 0;
    enAire = false;
    dobleUsado = false;
    pendientes.push({ tipo: 'aterrizaje' });
    // La caída rápida termina rodando.
    if (caidaRapida) {
      caidaRapida = false;
      empezarRodar();
    }
  }

  function empezarTrepar(o: ObjetoPista, duracion: number): void {
    postura = 'trepando';
    trepado = o;
    yTrepar = y;
    inicioTrepar = tiempo;
    finTrepar = tiempo + duracion;
    vy = 0;
    enAire = false;
    caidaRapida = false;
    pendientes.push({ tipo: 'trepar' });
  }

  /** Mueve al corredor en vertical según su postura y el suelo que tenga debajo. */
  function moverVertical(dt: number): void {
    if (postura === 'trepando') {
      const pasoElFinal = trepado !== null && trepado.evento.en + largoDe(trepado.evento) - distancia < 0;
      if (pasoElFinal) {
        // Se acabó el contenedor antes de terminar de subir: cae desde donde va.
        postura = 'corriendo';
        trepado = null;
        enAire = true;
      } else if (tiempo >= finTrepar - 1e-9) {
        postura = 'corriendo';
        trepado = null;
        y = ALTO_CONTENEDOR;
        dobleUsado = false;
      } else {
        const k = (tiempo - inicioTrepar) / (finTrepar - inicioTrepar);
        y = yTrepar + (ALTO_CONTENEDOR - yTrepar) * k * k * (3 - 2 * k);
      }
      return;
    }
    if (postura === 'foso') {
      vy -= GRAVEDAD * dt;
      y = Math.max(FONDO_FOSO, y + vy * dt);
      const piso = sueloBajo();
      if (piso !== null) {
        // Pasó el borde lejano: reaparece de pie, con el momento sin daño de siempre.
        postura = 'corriendo';
        y = piso;
        vy = 0;
        enAire = false;
        invulnerable = SIN_DANIO_TRAS_GOLPE;
      }
      return;
    }
    const piso = sueloBajo();
    // Se acabó el suelo bajo los pies (final de un contenedor o un foso): empieza a caer sin saltar.
    if (!enAire && (piso === null || y > piso + 1e-6)) {
      enAire = true;
      vy = 0;
    }
    if (!enAire) return;
    vy -= GRAVEDAD * dt;
    const nuevo = y + vy * dt;
    if (piso !== null && nuevo <= piso && y >= piso - 0.05) {
      aterrizar(piso);
      return;
    }
    y = nuevo;
    if (piso === null && y < 0) {
      postura = 'foso';
      pendientes.push({ tipo: 'foso' });
      danio();
    }
  }

  function revisar(o: ObjetoPista): void {
    const e = o.evento;
    if (o.roto || o.tomado) return;
    switch (e.tipo) {
      case 'valla':
        if (Math.abs(o.x) < BORDE_VALLA && y < (e.alto ?? 0.7) - 0.05 && !golpeados.has(o.id)) {
          golpeados.add(o.id);
          chocar(o);
        }
        pasar(o, BORDE_VALLA, inicioSalto);
        break;
      case 'viga':
        if (
          Math.abs(o.x) < BORDE_VIGA &&
          y + alturaCuerpo(postura) > VIGA_LIBRE &&
          y < VIGA_TOPE &&
          !golpeados.has(o.id)
        ) {
          golpeados.add(o.id);
          chocar(o);
        }
        if (!o.roto) pasar(o, BORDE_VIGA, inicioRodar);
        break;
      case 'contenedor':
        if (
          o.x <= BORDE_CONTENEDOR &&
          o.x + e.largo >= 0 &&
          alLado(e.carril) &&
          y < ALTO_CONTENEDOR - 0.05 &&
          postura !== 'trepando' &&
          postura !== 'foso'
        ) {
          if (enAire) {
            // Se agarra del borde. Saltar en el último momento da el bono.
            if (tiempo - inicioSalto <= VENTANA_JUSTO_S) {
              bono += BONO_JUSTO;
              pendientes.push({ tipo: 'justo', puntos: BONO_JUSTO });
            }
            empezarTrepar(o, DURACION_TREPAR);
          } else if (habilidades.turbo > 0) {
            empezarTrepar(o, DURACION_TREPAR);
          } else {
            // Por el suelo: golpea una sola vez por contenedor y sube de todas formas, más lento.
            if (!golpeados.has(o.id)) {
              golpeados.add(o.id);
              danio();
            }
            if (estado === 'corriendo') empezarTrepar(o, DURACION_TREPAR_GOLPE);
          }
        }
        break;
      case 'bloque':
        if (Math.abs(o.x) < 0.75 && Math.abs(z - zCarril(e.carril)) < 0.95 && y < 1.45 && !golpeados.has(o.id)) {
          golpeados.add(o.id);
          chocar(o);
        }
        break;
      case 'habilidad':
        if (Math.abs(o.x) < 0.8 && (modo === 2 || Math.abs(z - zCarril(e.carril)) < 0.95)) {
          o.tomado = true;
          habilidades[e.clase] = DURACION[e.clase];
          bono += BONO_HABILIDAD;
          pendientes.push({ tipo: 'habilidad', clase: e.clase });
        }
        break;
      case 'portal':
        if (o.x <= 0 && !golpeados.has(o.id)) {
          golpeados.add(o.id);
          modo = e.a;
          if (modo === 2) carril = 0;
          pendientes.push({ tipo: 'portal', a: e.a });
        }
        break;
    }
  }

  const sim: Simulacion = {
    get estado() {
      return estado;
    },
    get distancia() {
      return distancia;
    },
    get velocidad() {
      return velocidad;
    },
    get modo() {
      return modo;
    },
    get carril() {
      return carril;
    },
    get z() {
      return z;
    },
    get y() {
      return y;
    },
    get vy() {
      return vy;
    },
    get vidas() {
      return vidas;
    },
    get invulnerable() {
      return invulnerable;
    },
    get habilidades() {
      return habilidades;
    },
    get puntaje() {
      return Math.floor(distancia) + bono;
    },
    get postura() {
      return postura;
    },
    get caidaRapida() {
      return caidaRapida;
    },
    get suelo() {
      return sueloBajo();
    },
    nivel,
    objetos: () => objetos,

    paso(dt) {
      if (estado !== 'corriendo') {
        // La carrera ya terminó, pero si fue en el aire el corredor sigue cayendo hasta su piso
        // (dentro de un foso sigue cayendo y no vuelve arriba).
        const piso = postura === 'foso' ? null : sueloBajo();
        if (piso === null || y > piso) {
          vy -= GRAVEDAD * dt;
          y = Math.max(piso ?? FONDO_FOSO, y + vy * dt);
          if (y === piso) vy = 0;
        }
        const quedan = pendientes;
        pendientes = [];
        return quedan;
      }
      tiempo += dt;
      velocidad =
        habilidades.turbo > 0 ? VELOCIDAD_TURBO : Math.min(VELOCIDAD_MAXIMA, VELOCIDAD_BASE + distancia * VELOCIDAD_POR_METRO);
      distancia += velocidad * dt;

      while (siguiente < nivel.eventos.length && nivel.eventos[siguiente].en - distancia < APARECE_M) {
        const evento = nivel.eventos[siguiente++];
        objetos.push({ id: ++ultimoId, evento, x: evento.en - distancia, roto: false, tomado: false });
      }

      moverVertical(dt);
      if (postura === 'rodando' && tiempo >= finRodar - 1e-9) postura = 'corriendo';
      z += (zCarril(modo === 3 ? carril : 0) - z) * Math.min(1, dt * SUAVIZADO_CARRIL);
      invulnerable = Math.max(0, invulnerable - dt);
      for (const k of Object.keys(habilidades) as Habilidad[]) habilidades[k] = Math.max(0, habilidades[k] - dt);

      for (const o of objetos) {
        o.x = o.evento.en - distancia;
        if (estado === 'corriendo') revisar(o);
      }
      objetos = objetos.filter((o) => o.x + largoDe(o.evento) >= SE_VA_M);

      if (estado === 'corriendo' && distancia >= nivel.largo) {
        estado = 'fin';
        pendientes.push({ tipo: 'fin' });
      }
      const eventos = pendientes;
      pendientes = [];
      return eventos;
    },

    saltar() {
      if (estado !== 'corriendo' || postura === 'trepando' || postura === 'foso') return;
      if (!enAire) {
        // Saltar corta el giro.
        postura = 'corriendo';
        vy = SALTO;
        enAire = true;
        inicioSalto = tiempo;
        pendientes.push({ tipo: 'salto' });
      } else if (habilidades.doble > 0 && !dobleUsado && !caidaRapida) {
        vy = DOBLE_SALTO;
        dobleUsado = true;
        inicioSalto = tiempo;
        pendientes.push({ tipo: 'doble-salto' });
      }
    },

    rodar() {
      if (estado !== 'corriendo' || postura === 'trepando' || postura === 'foso') return;
      if (!enAire) {
        empezarRodar();
      } else if (!caidaRapida) {
        vy = VY_CAIDA_RAPIDA;
        caidaRapida = true;
        pendientes.push({ tipo: 'caida-rapida' });
      }
    },

    cambiarCarril(d) {
      if (estado !== 'corriendo' || modo !== 3 || postura === 'trepando' || postura === 'foso') return;
      const nuevo = Math.max(-1, Math.min(1, carril + d)) as Carril;
      if (nuevo !== carril) {
        carril = nuevo;
        pendientes.push({ tipo: 'carril' });
      }
    },
  };
  return sim;
}
