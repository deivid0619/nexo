import type { Scene } from 'three';
import type { Calidad } from '../../render/calidad';
import { TIERRA_BALDIA } from '../paletas';
import { crearCielo } from './cielo';
import { crearPolvo } from './polvo';
import { crearRuinas } from './ruinas';
import { crearSobreviviente, POSICION_SOBREVIVIENTE } from './sobreviviente';
import { crearSombrasContacto, type SombraContacto } from './sombra-contacto';
import { crearTerreno } from './terreno';
import { crearTorre, type Torre } from './torre';
import { crearUtileria } from './utileria';

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

type Animado = { actualizar(dt: number, t: number): void };

/** El exterior del búnker al atardecer: la escena de fondo de los menús. */
export function crearTierraBaldia(escena: Scene, calidad: Calidad, azar: () => number): MundoMenu {
  const paleta = TIERRA_BALDIA;
  let torre: Torre | null = null;
  let resaltado: number | null = null;
  const animados: Animado[] = [];
  const sombras: SombraContacto[] = [];

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
    { nombre: 'ruinas', peso: 4, correr: () => void sombras.push(...crearRuinas(escena, paleta, azar)) },
    {
      nombre: 'utileria',
      peso: 2,
      correr: () => {
        const utileria = crearUtileria(escena, paleta, azar);
        sombras.push(...utileria.sombras);
        animados.push({ actualizar: (_dt, t) => utileria.actualizar(t) });
      },
    },
    {
      nombre: 'personaje',
      peso: 1,
      correr: () => {
        const yo = crearSobreviviente(escena, paleta);
        animados.push({ actualizar: (_dt, t) => yo.actualizar(t) });
        const [x, , z] = POSICION_SOBREVIVIENTE;
        sombras.push({ x, z, ancho: 0.9, largo: 0.9, opacidad: 0.5 });
        // Las sombras de contacto van al final, cuando ya se conocen todas.
        crearSombrasContacto(escena, sombras);
      },
    },
    { nombre: 'polvo', peso: 1, correr: () => void animados.push(crearPolvo(escena, paleta, calidad.polvo, azar)) },
  ];

  return {
    pasos,
    actualizar(dt, t) {
      torre?.actualizar(t);
      for (const a of animados) a.actualizar(dt, t);
    },
    resaltarPiso(indice) {
      resaltado = indice;
      torre?.resaltarPiso(indice);
    },
  };
}
