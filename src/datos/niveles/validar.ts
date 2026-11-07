import type { Carril, Evento, Modo, Nivel } from './tipos';

/** Bloques a esta distancia o menos cuentan como una sola fila (no hay tiempo de cambiar de carril). */
const FILA_M = 1;

const nombre = (i: number, e: Evento) => `evento ${i} (${e.tipo})`;

/**
 * Revisa que el tramo se pueda jugar y esté bien escrito. Devuelve los problemas encontrados;
 * vacío quiere decir válido. Cada mensaje dice qué evento falla.
 */
export function validarNivel(nivel: Nivel): string[] {
  const problemas: string[] = [];
  let modo: Modo = 2;
  let anterior = 0;
  const bloques: { i: number; en: number; carril: Carril }[] = [];

  nivel.eventos.forEach((e, i) => {
    if (!(e.en > 0 && e.en < nivel.largo)) {
      problemas.push(`${nombre(i, e)}: a ${e.en} m, fuera del tramo (0 a ${nivel.largo} m)`);
      return;
    }
    if (e.en < anterior) {
      problemas.push(`${nombre(i, e)}: a ${e.en} m, fuera de orden (el anterior está a ${anterior} m)`);
      return;
    }
    anterior = e.en;
    switch (e.tipo) {
      case 'bloque':
        if (modo === 2) problemas.push(`${nombre(i, e)}: un bloque solo va en 3D y aquí se está en 2D`);
        else bloques.push({ i, en: e.en, carril: e.carril });
        break;
      case 'habilidad':
        if (modo === 3 && e.carril === undefined) problemas.push(`${nombre(i, e)}: en 3D necesita carril`);
        if (modo === 2 && e.carril !== undefined) problemas.push(`${nombre(i, e)}: en 2D no lleva carril`);
        break;
      case 'portal':
        if (e.a === modo) problemas.push(`${nombre(i, e)}: lleva a ${e.a}D y ya se está en ${modo}D`);
        modo = e.a;
        break;
      case 'valla':
        break;
    }
  });

  // Una fila de bloques que tapa los tres carriles no se puede esquivar.
  for (let j = 0; j < bloques.length; j++) {
    const fila = bloques.filter((b) => b.en >= bloques[j].en && b.en - bloques[j].en <= FILA_M);
    if (new Set(fila.map((b) => b.carril)).size === 3) {
      problemas.push(`evento ${bloques[j].i} (bloque): sin carril libre a ${bloques[j].en} m`);
      j += fila.length - 1;
    }
  }
  return problemas;
}
