import { TEXTOS } from './es';

/** 12480 → "12.480". No usa Intl: en algunos idiomas deja "1234" sin punto. */
export function formatearPuntaje(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/** "hace 2 h", "ayer"... Si el reloj del celular cambió y la fecha queda en el futuro: "hace un momento". */
export function tiempoRelativo(desdeMs: number, ahoraMs: number): string {
  const t = TEXTOS.tiempo;
  const pasado = ahoraMs - desdeMs;
  if (pasado < MINUTO) return t.momento;
  if (pasado < HORA) return t.minutos.replace('{n}', String(Math.floor(pasado / MINUTO)));
  if (pasado < DIA) return t.horas.replace('{n}', String(Math.floor(pasado / HORA)));
  if (pasado < 2 * DIA) return t.ayer;
  return t.dias.replace('{n}', String(Math.floor(pasado / DIA)));
}
