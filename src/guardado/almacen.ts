/** Dónde se guarda el progreso. Nunca lanza error: si el navegador bloquea el guardado, el juego sigue. */
export interface Almacen {
  leer(clave: string): string | null;
  /** Devuelve false si no se pudo guardar (modo privado, cuota llena, bloqueado). */
  escribir(clave: string, valor: string): boolean;
  borrar(clave: string): void;
}

/** localStorage envuelto: en Safari hasta leer el objeto `localStorage` puede lanzar error. */
export function almacenLocal(): Almacen {
  const local = (): Storage | null => {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  };
  return {
    leer(clave) {
      try {
        return local()?.getItem(clave) ?? null;
      } catch {
        return null;
      }
    },
    escribir(clave, valor) {
      try {
        const l = local();
        if (!l) return false;
        l.setItem(clave, valor);
        return true;
      } catch {
        return false;
      }
    },
    borrar(clave) {
      try {
        local()?.removeItem(clave);
      } catch {
        // Nada que hacer: el dato sigue donde estaba.
      }
    },
  };
}

/** Para las pruebas y para cuando no hay dónde guardar. */
export function almacenMemoria(): Almacen {
  const datos = new Map<string, string>();
  return {
    leer: (clave) => datos.get(clave) ?? null,
    escribir(clave, valor) {
      datos.set(clave, valor);
      return true;
    },
    borrar: (clave) => void datos.delete(clave),
  };
}
