import type { IdToma } from '../camara/tomas';

export type IdPantalla = 'carga' | 'inicio' | 'torre';

export interface Pantalla {
  id: IdPantalla;
  /** La toma de cámara que acompaña a la pantalla. */
  toma: IdToma;
  /** Un `section.pantalla.pantalla-<id>`; el gestor lo pone dentro de la capa. */
  elemento: HTMLElement;
  alEntrar?(): void;
  alSalir?(): void;
  /** Devuelve true si usó la tecla. */
  alTecla?(e: KeyboardEvent): boolean;
}

export interface GestorPantallas {
  registrar(p: Pantalla): void;
  /** Devuelve false si no navegó: ya está en esa pantalla o hay un cambio en curso. */
  ir(id: IdPantalla, opciones?: { apilar?: boolean; instantaneo?: boolean }): boolean;
  atras(): void;
  actual(): IdPantalla | null;
  enTransicion(): boolean;
}

interface Dependencias {
  camara: { irA(t: IdToma, instantaneo?: boolean): void };
  historial: Pick<History, 'pushState' | 'replaceState' | 'back'>;
  ventana: Window;
  /** Lo que dura cada mitad del cambio (sale la vieja, entra la nueva). */
  duracionMs: number;
}

/** Desde estas pantallas, "atrás" saldría del juego: no se hace nada. */
const SIN_ATRAS: readonly IdPantalla[] = ['inicio', 'carga'];

/**
 * Cambia de pantalla con un fundido y mueve la cámara a la vez. Un toque doble o un "atrás"
 * en medio de un cambio nunca produce dos navegaciones.
 */
export function crearGestorPantallas(capa: HTMLElement, deps: Dependencias): GestorPantallas {
  const { camara, historial, ventana, duracionMs } = deps;
  const pantallas = new Map<IdPantalla, Pantalla>();
  let actual: Pantalla | null = null;
  let enCurso = false;
  let pendiente: IdPantalla | null = null;
  /** Ya se pidió history.back() y su popstate no ha llegado: otro "atrás" saldría del juego. */
  let volviendo = false;

  const mostrar = (p: Pantalla) => {
    p.elemento.hidden = false;
    p.alEntrar?.();
  };
  const ocultar = (p: Pantalla) => {
    p.elemento.classList.remove('saliendo');
    p.elemento.hidden = true;
    p.alSalir?.();
  };

  const gestor: GestorPantallas = {
    registrar(p) {
      p.elemento.hidden = true;
      if (p.elemento.parentElement !== capa) capa.append(p.elemento);
      pantallas.set(p.id, p);
    },

    ir(id, opciones = {}) {
      const nueva = pantallas.get(id);
      if (enCurso || !nueva || actual?.id === id) return false;
      const instantaneo = opciones.instantaneo ?? false;
      camara.irA(nueva.toma, instantaneo);
      if (opciones.apilar) historial.pushState({ pantalla: id }, '');
      const vieja = actual;

      if (instantaneo) {
        if (vieja) ocultar(vieja);
        actual = nueva;
        mostrar(nueva);
        return true;
      }

      enCurso = true;
      vieja?.elemento.classList.add('saliendo');
      setTimeout(() => {
        if (vieja) ocultar(vieja);
        actual = nueva;
        nueva.elemento.classList.add('entrando');
        // Se prepara en el mismo instante en que pasa a ser la actual: un toque rápido ya la encuentra lista.
        mostrar(nueva);
        // El fundido de entrada arranca en el cuadro siguiente.
        ventana.requestAnimationFrame(() => nueva.elemento.classList.remove('entrando'));
      }, duracionMs);
      setTimeout(() => {
        enCurso = false;
        if (pendiente) {
          const destino = pendiente;
          pendiente = null;
          gestor.ir(destino);
        }
      }, duracionMs * 2);
      return true;
    },

    atras() {
      // Un solo "atrás" a la vez: durante un cambio, o con uno ya en camino, se ignora.
      if (enCurso || volviendo || !actual || SIN_ATRAS.includes(actual.id)) return;
      volviendo = true;
      historial.back();
    },

    actual: () => actual?.id ?? null,
    enTransicion: () => enCurso,
  };

  ventana.addEventListener('popstate', (e) => {
    volviendo = false;
    const estado = (e as PopStateEvent).state as { pantalla?: IdPantalla } | null;
    const destino = estado?.pantalla ?? 'inicio';
    if (enCurso) pendiente = destino;
    else gestor.ir(destino);
  });

  ventana.addEventListener('keydown', (e) => {
    const tecla = e as KeyboardEvent;
    if (actual?.alTecla?.(tecla)) return;
    // Escape sostenido se repite solo: cuenta una vez.
    if (tecla.key === 'Escape' && !tecla.repeat) gestor.atras();
  });

  return gestor;
}
