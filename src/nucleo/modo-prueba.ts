/**
 * Ganchos para probar sin jugar desde el principio. Solo existen con ?prueba=1.
 * Cada tarea de la etapa agrega aquí sus miembros.
 */
export interface ApiPrueba {
  /** Avanza el juego en tiempo simulado (pasos de 1/60 s) y dibuja. */
  avanzar(segundos: number): void;
  /** Llamadas de dibujo y triángulos del último cuadro, con la pasada de sombras. */
  render(): { llamadas: number; triangulos: number };
}

declare global {
  interface Window {
    nexo?: ApiPrueba;
  }
}

export function instalarModoPrueba(api: ApiPrueba): void {
  window.nexo = api;
}
