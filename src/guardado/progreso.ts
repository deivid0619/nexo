import { esIdPiso, siguientePisoDisponible, pisoPorId, type IdPiso } from '../datos/pisos';
import type { Almacen } from './almacen';

export type EstadoPiso = 'completado' | 'actual' | 'sellado';

export interface Progreso {
  version: 1;
  pisoActual: IdPiso;
  completados: IdPiso[];
  /** Mejor puntaje por piso. */
  records: Partial<Record<IdPiso, number>>;
  /** Registros encontrados, con ids `<idPiso>-<n>`. */
  registros: string[];
  guardadoEn: number;
}

export const CLAVE_PROGRESO = 'nexo.progreso';
/** Si el guardado no se puede leer, el texto original queda aquí en vez de perderse. */
export const CLAVE_RESPALDO = 'nexo.progreso.respaldo';

export function progresoInicial(ahora: number): Progreso {
  return { version: 1, pisoActual: 'tierra', completados: [], records: {}, registros: [], guardadoEn: ahora };
}

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Revisa campo por campo; cualquier cosa rara (otra versión, un piso que no existe) lo invalida. */
function validar(v: unknown): Progreso | null {
  if (!esObjeto(v) || v.version !== 1 || !esIdPiso(v.pisoActual)) return null;
  const { completados, records, registros, guardadoEn } = v;
  if (!Array.isArray(completados) || !completados.every(esIdPiso)) return null;
  if (!esObjeto(records)) return null;
  for (const [id, puntaje] of Object.entries(records)) {
    if (!esIdPiso(id) || typeof puntaje !== 'number' || !Number.isFinite(puntaje)) return null;
  }
  if (!Array.isArray(registros) || !registros.every((r) => typeof r === 'string')) return null;
  if (typeof guardadoEn !== 'number' || !Number.isFinite(guardadoEn)) return null;
  return {
    version: 1,
    pisoActual: v.pisoActual,
    completados: [...completados],
    records: { ...(records as Progreso['records']) },
    registros: [...registros],
    guardadoEn,
  };
}

/** Carga el progreso. Si está dañado o es de otra versión, lo respalda y arranca de cero. */
export function cargarProgreso(almacen: Almacen, ahora: number): { progreso: Progreso; existia: boolean } {
  const crudo = almacen.leer(CLAVE_PROGRESO);
  if (crudo === null) return { progreso: progresoInicial(ahora), existia: false };
  let datos: unknown;
  try {
    datos = JSON.parse(crudo);
  } catch {
    datos = undefined;
  }
  const progreso = validar(datos);
  if (progreso) return { progreso, existia: true };
  almacen.escribir(CLAVE_RESPALDO, crudo);
  return { progreso: progresoInicial(ahora), existia: false };
}

export function guardarProgreso(almacen: Almacen, p: Progreso, ahora: number): boolean {
  return almacen.escribir(CLAVE_PROGRESO, JSON.stringify({ ...p, guardadoEn: ahora }));
}

/** "Completado" gana sobre "actual". */
export function estadoDePiso(p: Progreso, id: IdPiso): EstadoPiso {
  if (p.completados.includes(id)) return 'completado';
  return p.pisoActual === id ? 'actual' : 'sellado';
}

/** Devuelve un progreso nuevo con el piso completado; los pisos sellados no se pueden completar. */
export function completarPiso(p: Progreso, id: IdPiso): Progreso {
  if (!pisoPorId(id).disponible) return p;
  const completados = p.completados.includes(id) ? [...p.completados] : [...p.completados, id];
  const siguiente = siguientePisoDisponible(id);
  return { ...p, completados, pisoActual: siguiente ?? p.pisoActual };
}

/** Hay algo que continuar: un piso completado o un registro encontrado. */
export function tieneAvance(p: Progreso): boolean {
  return p.completados.length > 0 || p.registros.length > 0;
}

export function registrosDePiso(p: Progreso, id: IdPiso): number {
  return p.registros.filter((r) => r.startsWith(`${id}-`)).length;
}
