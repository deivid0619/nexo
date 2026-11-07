import type { Toma } from '../camara/tomas';
import type { Intencion } from '../entrada/controles';
import type { EstadoJuego } from '../juego/carrera';
import type { Progreso } from '../guardado/progreso';
import type { IdPantalla } from '../interfaz/gestor-pantallas';

/** Cómo va la carga del arranque: las fracciones que se avisaron y lo que duró en pantalla. */
export interface EstadoCarga {
  estado: 'cargando' | 'lista' | 'error';
  fracciones: number[];
  /** Desde que se vio la carga hasta el revelado; 0 mientras no termina. */
  duracionMs: number;
}

/**
 * Ganchos para probar sin jugar desde el principio. Solo existen con ?prueba=1.
 * Cada tarea de la etapa agrega aquí sus miembros.
 */
export interface ApiPrueba {
  /** Avanza el juego en tiempo simulado (pasos de 1/60 s) y dibuja. */
  avanzar(segundos: number): void;
  /** Toma actual de la cámara del menú (sin el vaivén). */
  camara(): Toma;
  /** Llamadas de dibujo y triángulos del último cuadro, con la pasada de sombras. */
  render(): { llamadas: number; triangulos: number };
  /** Pantalla que se ve ahora ('carga' mientras arranca). */
  pantalla(): IdPantalla | null;
  /** Navega como lo haría la interfaz; false si no se pudo (ya estaba o hay un cambio en curso). */
  ir(id: IdPantalla): boolean;
  /** Devuelve el progreso; con cambios, los mezcla, los guarda y repinta las pantallas. */
  progreso(cambios?: Partial<Progreso>): Progreso;
  /** Piso resaltado en la torre 3D (índice en PISOS), o null. */
  resaltado(): number | null;
  /** True mientras una pantalla sale y otra entra. */
  enTransicion(): boolean;
  /** Estado de la carga del arranque (una copia). */
  carga(): EstadoCarga;
  /** La carrera en curso, o null fuera de la pantalla de juego. */
  juego(): EstadoJuego | null;
  /** Hace lo mismo que un toque o una tecla en la carrera. */
  accion(a: Intencion): void;
  /**
   * Detiene (false) o reanuda (true) el bucle en tiempo real. Con el reloj detenido solo
   * avanzar() mueve el juego: las pruebas ven siempre los mismos metros.
   */
  reloj(activo: boolean): void;
}

declare global {
  interface Window {
    nexo?: ApiPrueba;
  }
}

export function instalarModoPrueba(api: ApiPrueba): void {
  window.nexo = api;
}
