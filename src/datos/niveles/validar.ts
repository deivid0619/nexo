import type { Carril, Evento, Modo, Nivel } from './tipos';

/** Bloques a esta distancia o menos cuentan como una sola fila (no hay tiempo de cambiar de carril). */
const FILA_M = 1;
/** Un foso de este largo o menos se cruza de un salto. */
export const FOSO_SALTABLE_M = 4;
/** Un foso de este largo o más se cruza con un cable. Entre los dos no se puede cruzar. */
export const FOSO_CON_CABLE_M = 9;
/** Largo de un contenedor, en metros. */
const CONTENEDOR_MIN_M = 4;
const CONTENEDOR_MAX_M = 12;

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
  // Zona de armas abierta: el índice del arma que espera su EMP.
  let armaAbierta: number | null = null;
  const pistas = new Set<string>();
  const fosos = nivel.eventos.flatMap((e) => (e.tipo === 'foso' ? [e] : []));
  const fosoLargoEn = (en: number) => fosos.some((f) => f.en === en && f.largo >= FOSO_CON_CABLE_M);
  const cerrarArma = (donde: string) => {
    if (armaAbierta === null) return;
    problemas.push(`${nombre(armaAbierta, nivel.eventos[armaAbierta])}: la zona de armas no tiene EMP antes de ${donde}`);
    armaAbierta = null;
  };

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
    if (e.pista) {
      if (pistas.has(e.pista)) problemas.push(`${nombre(i, e)}: la pista "${e.pista}" ya está en otro evento`);
      pistas.add(e.pista);
    }
    // Dentro de un foso no hay suelo; solo el cable va en su borde.
    const foso = fosos.find((f) => f !== e && e.en >= f.en && e.en < f.en + f.largo);
    if (foso && !(e.tipo === 'cable' && e.en === foso.en)) {
      problemas.push(`${nombre(i, e)}: a ${e.en} m cae dentro del foso de ${foso.en} m`);
    }
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
        cerrarArma(`el portal de ${e.en} m`);
        modo = e.a;
        break;
      case 'contenedor':
        if (modo === 3 && e.carril === undefined) problemas.push(`${nombre(i, e)}: en 3D necesita carril`);
        if (modo === 2 && e.carril !== undefined) problemas.push(`${nombre(i, e)}: en 2D no lleva carril`);
        if (!(e.largo >= CONTENEDOR_MIN_M && e.largo <= CONTENEDOR_MAX_M)) {
          problemas.push(`${nombre(i, e)}: largo de ${e.largo} m (va de ${CONTENEDOR_MIN_M} a ${CONTENEDOR_MAX_M} m)`);
        }
        break;
      case 'foso':
        if (!(e.largo > 0 && (e.largo <= FOSO_SALTABLE_M || e.largo >= FOSO_CON_CABLE_M))) {
          problemas.push(
            `${nombre(i, e)}: largo de ${e.largo} m no se cruza (hasta ${FOSO_SALTABLE_M} m se salta, desde ${FOSO_CON_CABLE_M} m lleva cable)`,
          );
        } else if (e.largo >= FOSO_CON_CABLE_M) {
          if (modo === 3) problemas.push(`${nombre(i, e)}: un foso con cable solo va en 2D y aquí se está en 3D`);
          if (!nivel.eventos.some((c) => c.tipo === 'cable' && c.en === e.en)) {
            problemas.push(`${nombre(i, e)}: un foso de ${e.largo} m necesita un cable a ${e.en} m`);
          }
        }
        break;
      case 'cable':
        if (modo === 3) problemas.push(`${nombre(i, e)}: un cable solo va en 2D y aquí se está en 3D`);
        if (!fosoLargoEn(e.en)) problemas.push(`${nombre(i, e)}: va al principio de un foso de ${FOSO_CON_CABLE_M} m o más`);
        break;
      case 'arma':
        if (modo === 2) problemas.push(`${nombre(i, e)}: la zona de armas solo va en 3D y aquí se está en 2D`);
        if (armaAbierta !== null) problemas.push(`${nombre(i, e)}: ya hay una zona de armas abierta sin su EMP`);
        else armaAbierta = i;
        break;
      case 'emp':
        if (armaAbierta === null) problemas.push(`${nombre(i, e)}: no hay un arma antes que cerrar`);
        armaAbierta = null;
        break;
      case 'dron':
        if (modo === 2) problemas.push(`${nombre(i, e)}: un dron solo va en 3D y aquí se está en 2D`);
        break;
      case 'valla':
      case 'viga':
        break;
    }
  });
  cerrarArma('el final del tramo');

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
