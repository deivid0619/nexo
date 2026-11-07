/** Un trabajo de la carga. `PasoConstruccion` (del mundo) ya cumple esta forma. */
export interface Tarea {
  nombre: string;
  /** Cuánto pesa en la barra, comparado con las otras. */
  peso: number;
  correr(): void | Promise<void>;
}

/** La carga se detuvo en una tarea; `tarea` dice cuál. */
export class ErrorDeCarga extends Error {
  readonly tarea: string;

  constructor(tarea: string, causa: unknown) {
    super(`Falló la tarea de carga "${tarea}"`, { cause: causa });
    this.name = 'ErrorDeCarga';
    this.tarea = tarea;
  }
}

/** Lo mínimo que se ve la pantalla de carga, aunque todo cargue antes (para que no parpadee). */
export const CARGA_MINIMA_MS = 1200;

/**
 * Corre las tareas en orden y avisa el avance real (0 al empezar, 1 al terminar).
 * Entre una tarea y otra espera un cuadro para que la barra alcance a pintarse.
 */
export async function ejecutarTareas(
  tareas: Tarea[],
  alProgreso: (fraccion: number, tarea: string) => void,
  esperarCuadro: () => Promise<void>,
): Promise<void> {
  const total = tareas.reduce((n, t) => n + Math.max(0, t.peso), 0);
  // Si nada pesa, todas cuentan igual.
  const pesoDe = (t: Tarea) => (total > 0 ? Math.max(0, t.peso) / total : 1 / tareas.length);
  let hecho = 0;
  alProgreso(0, tareas[0]?.nombre ?? '');
  for (const [i, tarea] of tareas.entries()) {
    try {
      await tarea.correr();
    } catch (e) {
      throw new ErrorDeCarga(tarea.nombre, e);
    }
    hecho += pesoDe(tarea);
    // La última siempre es 1 exacto, sin restos de redondeo.
    alProgreso(i === tareas.length - 1 ? 1 : hecho, tarea.nombre);
    await esperarCuadro();
  }
}

/**
 * Espera lo que falte para que la carga dure al menos `minimoMs` desde `inicio` y devuelve lo que
 * duró. Repite porque los temporizadores del navegador pueden despertar una fracción antes.
 */
export async function completarMinimo(
  inicio: number,
  minimoMs: number,
  ahora: () => number,
  esperar: (ms: number) => Promise<void>,
): Promise<number> {
  let transcurrido = ahora() - inicio;
  while (transcurrido < minimoMs) {
    await esperar(Math.ceil(minimoMs - transcurrido));
    transcurrido = ahora() - inicio;
  }
  return transcurrido;
}
