import type { Scene } from 'three';
import type { Calidad } from '../../render/calidad';
import { TIERRA_BALDIA } from '../paletas';
import { crearCielo } from './cielo';
import { crearTerreno } from './terreno';
import { crearTorre, type Torre } from './torre';

/** Un paso de la construcción del mundo; la pantalla de carga muestra el avance por peso. */
export interface PasoConstruccion {
  nombre: string;
  peso: number;
  correr(): void;
}

export interface MundoMenu {
  pasos: PasoConstruccion[];
  actualizar(dt: number, t: number): void;
  resaltarPiso(indice: number | null): void;
}

/** El exterior del búnker al atardecer: la escena de fondo de los menús. */
export function crearTierraBaldia(escena: Scene, calidad: Calidad, azar: () => number): MundoMenu {
  const paleta = TIERRA_BALDIA;
  let torre: Torre | null = null;
  let resaltado: number | null = null;

  const pasos: PasoConstruccion[] = [
    { nombre: 'cielo', peso: 1, correr: () => void crearCielo(escena, paleta, calidad) },
    { nombre: 'terreno', peso: 2, correr: () => crearTerreno(escena, paleta, azar) },
    {
      nombre: 'torre',
      peso: 1,
      correr: () => {
        torre = crearTorre(escena, paleta);
        torre.resaltarPiso(resaltado);
      },
    },
  ];

  return {
    pasos,
    actualizar(_dt, t) {
      torre?.actualizar(t);
    },
    resaltarPiso(indice) {
      resaltado = indice;
      torre?.resaltarPiso(indice);
    },
  };
}
