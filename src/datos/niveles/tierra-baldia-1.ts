import type { Nivel } from './tipos';

/**
 * Primer tramo de la Tierra baldía (etapa 3). Cada movimiento aparece primero solo, con su pista, y
 * después se mezcla con los anteriores:
 * - 2D: saltar vallas, rodar bajo vigas, la caída rápida (valla alta y viga) y trepar contenedores.
 * - Portal a 3D: carriles con bloques, vigas, contenedores en carriles y un foso corto.
 * - Zona de armas en 3D: la estación, drones en carriles alternados y el pulso EMP.
 * - Portal a 2D: dos fosos largos con cable y un cierre que mezcla todo.
 * La prueba lo juega entero con un piloto, a la velocidad real.
 */
export const TIERRA_BALDIA_1: Nivel = {
  id: 'tierra-1',
  largo: 600,
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
    // Rodar bajo vigas.
    { en: 96, tipo: 'viga', pista: 'rodar' },
    { en: 110, tipo: 'viga' },
    { en: 120, tipo: 'valla' },
    { en: 130, tipo: 'viga' },
    // Caída rápida: saltar la valla alta y caer rodando bajo la viga.
    { en: 150, tipo: 'valla', alto: 1.1, pista: 'caer' },
    { en: 154, tipo: 'viga' },
    { en: 168, tipo: 'valla', alto: 1.1 },
    { en: 172, tipo: 'viga' },
    // Trepar.
    { en: 192, tipo: 'contenedor', largo: 6, pista: 'trepar' },
    { en: 210, tipo: 'contenedor', largo: 6 },
    { en: 228, tipo: 'foso', largo: 3 },
    { en: 240, tipo: 'portal', a: 3 },
    // 3D: carriles con todo lo anterior.
    { en: 252, tipo: 'bloque', carril: -1 },
    { en: 252, tipo: 'bloque', carril: 0 },
    { en: 258, tipo: 'habilidad', clase: 'turbo', carril: 1 },
    { en: 272, tipo: 'bloque', carril: 0 },
    { en: 272, tipo: 'bloque', carril: 1 },
    { en: 280, tipo: 'viga' },
    { en: 290, tipo: 'contenedor', largo: 6, carril: -1 },
    { en: 290, tipo: 'contenedor', largo: 6, carril: 0 },
    { en: 310, tipo: 'foso', largo: 3 },
    { en: 320, tipo: 'bloque', carril: -1 },
    { en: 320, tipo: 'bloque', carril: 1 },
    { en: 328, tipo: 'habilidad', clase: 'escudo', carril: 0 },
    { en: 338, tipo: 'viga' },
    { en: 348, tipo: 'bloque', carril: 0 },
    { en: 348, tipo: 'bloque', carril: 1 },
    // Zona de armas: drones en carriles alternados y el EMP al final.
    { en: 360, tipo: 'arma' },
    { en: 370, tipo: 'dron', carril: -1 },
    { en: 377, tipo: 'dron', carril: 1 },
    { en: 385, tipo: 'dron', carril: 0 },
    { en: 392, tipo: 'dron', carril: -1 },
    { en: 400, tipo: 'dron', carril: 1 },
    { en: 407, tipo: 'dron', carril: 0 },
    { en: 415, tipo: 'dron', carril: -1 },
    { en: 422, tipo: 'dron', carril: 1 },
    { en: 430, tipo: 'dron', carril: 0 },
    { en: 442, tipo: 'emp' },
    { en: 454, tipo: 'portal', a: 2 },
    // 2D: fosos con cable y el cierre.
    { en: 476, tipo: 'foso', largo: 12 },
    { en: 476, tipo: 'cable', pista: 'cable' },
    { en: 508, tipo: 'valla' },
    { en: 518, tipo: 'viga' },
    { en: 528, tipo: 'contenedor', largo: 6 },
    { en: 550, tipo: 'foso', largo: 12 },
    { en: 550, tipo: 'cable' },
    { en: 580, tipo: 'valla' },
    { en: 590, tipo: 'valla', alto: 1.1 },
  ],
};
