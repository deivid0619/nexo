import type { Toma } from '../camara/tomas';
import type { Progreso } from '../guardado/progreso';
import type { IdPantalla } from '../interfaz/gestor-pantallas';

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
  /** Pantalla que se ve ahora (null mientras arranca). */
  pantalla(): IdPantalla | null;
  /** Navega como lo haría la interfaz; false si no se pudo (ya estaba o hay un cambio en curso). */
  ir(id: IdPantalla): boolean;
  /** Devuelve el progreso; con cambios, los mezcla, los guarda y repinta las pantallas. */
  progreso(cambios?: Partial<Progreso>): Progreso;
}

declare global {
  interface Window {
    nexo?: ApiPrueba;
  }
}

export function instalarModoPrueba(api: ApiPrueba): void {
  window.nexo = api;
}
