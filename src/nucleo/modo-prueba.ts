/**
 * Ganchos para probar sin jugar desde el principio. Solo existen con ?prueba=1.
 * Cada tarea de la etapa agrega aquí sus miembros.
 */
export interface ApiPrueba {
  avanzar(segundos: number): void;
}

declare global {
  interface Window {
    nexo?: ApiPrueba;
  }
}

export function instalarModoPrueba(api: ApiPrueba): void {
  window.nexo = api;
}
