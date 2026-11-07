import type { Nivel } from './tipos';

/**
 * Primer tramo de la Tierra baldía, sacado del prototipo (tramos 1 a 3) sin arma, drones ni EMP,
 * que llegan con el combate en la etapa 4. 2D para aprender a saltar, un portal a 3D con carriles
 * y un portal de vuelta a 2D antes del final.
 */
export const TIERRA_BALDIA_1: Nivel = {
  id: 'tierra-1',
  largo: 390,
  eventos: [
    // 2D: saltar.
    { en: 20, tipo: 'valla' },
    { en: 30, tipo: 'valla' },
    { en: 38, tipo: 'habilidad', clase: 'doble' },
    { en: 46, tipo: 'valla', alto: 1.1 },
    { en: 56, tipo: 'valla' },
    { en: 58.5, tipo: 'valla' },
    { en: 68, tipo: 'valla', alto: 1.1 },
    { en: 76, tipo: 'valla' },
    { en: 85, tipo: 'portal', a: 3 },
    // 3D: cambiar de carril.
    { en: 102, tipo: 'bloque', carril: -1 },
    { en: 102, tipo: 'bloque', carril: 0 },
    { en: 112, tipo: 'habilidad', clase: 'escudo', carril: 1 },
    { en: 122, tipo: 'bloque', carril: 1 },
    { en: 122, tipo: 'bloque', carril: 0 },
    { en: 134, tipo: 'valla' },
    { en: 146, tipo: 'bloque', carril: -1 },
    { en: 146, tipo: 'bloque', carril: 1 },
    { en: 156, tipo: 'habilidad', clase: 'turbo', carril: 0 },
    { en: 170, tipo: 'bloque', carril: 0 },
    { en: 170, tipo: 'bloque', carril: 1 },
    { en: 180, tipo: 'valla' },
    { en: 196, tipo: 'bloque', carril: -1 },
    { en: 196, tipo: 'bloque', carril: 0 },
    { en: 208, tipo: 'bloque', carril: -1 },
    { en: 208, tipo: 'bloque', carril: 1 },
    { en: 220, tipo: 'valla' },
    { en: 232, tipo: 'bloque', carril: 0 },
    { en: 232, tipo: 'bloque', carril: 1 },
    { en: 244, tipo: 'habilidad', clase: 'escudo', carril: -1 },
    { en: 256, tipo: 'bloque', carril: -1 },
    { en: 256, tipo: 'bloque', carril: 0 },
    { en: 268, tipo: 'valla' },
    { en: 280, tipo: 'bloque', carril: -1 },
    { en: 280, tipo: 'bloque', carril: 1 },
    { en: 296, tipo: 'portal', a: 2 },
    // 2D: el cierre.
    { en: 312, tipo: 'valla' },
    { en: 322, tipo: 'valla', alto: 1.1 },
    { en: 332, tipo: 'valla' },
    { en: 334.5, tipo: 'valla' },
    { en: 346, tipo: 'valla', alto: 1.1 },
    { en: 352, tipo: 'habilidad', clase: 'escudo' },
    { en: 362, tipo: 'valla' },
    { en: 372, tipo: 'valla' },
  ],
};
