import type { Carril, Evento, Habilidad, Modo, Nivel } from '../datos/niveles/tipos';

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
  | { tipo: 'salto' | 'doble-salto' | 'aterrizaje' | 'carril' | 'derrota' | 'fin' | 'golpe' | 'escudo-roto' }
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
  objetos(): readonly ObjetoPista[];
  /** Avanza `dt` segundos; devuelve lo que pasó (incluye lo que causaron las acciones). */
  paso(dt: number): EventoSim[];
  saltar(): void;
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

  // Empezar a mitad del tramo (modo de prueba): se aplican los portales que ya habrían pasado.
  const desde = Math.max(0, opciones.desde ?? 0);
  while (siguiente < nivel.eventos.length && nivel.eventos[siguiente].en < desde) {
    const e = nivel.eventos[siguiente++];
    if (e.tipo === 'portal') modo = e.a;
  }
  distancia = desde;

  const zCarril = (c: Carril | undefined) => (c ?? 0) * ANCHO_CARRIL;

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

  function revisar(o: ObjetoPista): void {
    const e = o.evento;
    if (o.roto || o.tomado) return;
    switch (e.tipo) {
      case 'valla':
        if (Math.abs(o.x) < 0.32 && y < (e.alto ?? 0.7) - 0.05 && !golpeados.has(o.id)) {
          golpeados.add(o.id);
          chocar(o);
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
    nivel,
    objetos: () => objetos,

    paso(dt) {
      if (estado !== 'corriendo') {
        const quedan = pendientes;
        pendientes = [];
        return quedan;
      }
      velocidad =
        habilidades.turbo > 0 ? VELOCIDAD_TURBO : Math.min(VELOCIDAD_MAXIMA, VELOCIDAD_BASE + distancia * VELOCIDAD_POR_METRO);
      distancia += velocidad * dt;

      while (siguiente < nivel.eventos.length && nivel.eventos[siguiente].en - distancia < APARECE_M) {
        const evento = nivel.eventos[siguiente++];
        objetos.push({ id: ++ultimoId, evento, x: evento.en - distancia, roto: false, tomado: false });
      }

      vy -= GRAVEDAD * dt;
      y += vy * dt;
      if (y <= 0) {
        y = 0;
        vy = 0;
        dobleUsado = false;
        if (enAire) {
          enAire = false;
          pendientes.push({ tipo: 'aterrizaje' });
        }
      }
      z += (zCarril(modo === 3 ? carril : 0) - z) * Math.min(1, dt * SUAVIZADO_CARRIL);
      invulnerable = Math.max(0, invulnerable - dt);
      for (const k of Object.keys(habilidades) as Habilidad[]) habilidades[k] = Math.max(0, habilidades[k] - dt);

      for (const o of objetos) {
        o.x = o.evento.en - distancia;
        if (estado === 'corriendo') revisar(o);
      }
      objetos = objetos.filter((o) => o.x >= SE_VA_M);

      if (estado === 'corriendo' && distancia >= nivel.largo) {
        estado = 'fin';
        pendientes.push({ tipo: 'fin' });
      }
      const eventos = pendientes;
      pendientes = [];
      return eventos;
    },

    saltar() {
      if (estado !== 'corriendo') return;
      if (!enAire) {
        vy = SALTO;
        enAire = true;
        pendientes.push({ tipo: 'salto' });
      } else if (habilidades.doble > 0 && !dobleUsado) {
        vy = DOBLE_SALTO;
        dobleUsado = true;
        pendientes.push({ tipo: 'doble-salto' });
      }
    },

    cambiarCarril(d) {
      if (estado !== 'corriendo' || modo !== 3) return;
      const nuevo = Math.max(-1, Math.min(1, carril + d)) as Carril;
      if (nuevo !== carril) {
        carril = nuevo;
        pendientes.push({ tipo: 'carril' });
      }
    },
  };
  return sim;
}
