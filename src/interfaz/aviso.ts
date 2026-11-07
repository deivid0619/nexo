/** Lo que tarda en irse (igual a --d-aviso-sale en tokens.css). */
const SALIDA_MS = 160;

/** Avisos cortos arriba al centro: uno a la vez, el nuevo reemplaza al anterior. */
export function crearAvisos(contenedor: HTMLElement, duracionMs = 2600): { mostrar(texto: string): void } {
  let actual: { elemento: HTMLElement; temporizadores: number[] } | null = null;

  const quitarActual = () => {
    if (!actual) return;
    actual.temporizadores.forEach(clearTimeout);
    actual.elemento.remove();
    actual = null;
  };

  return {
    mostrar(texto) {
      quitarActual();
      const elemento = document.createElement('div');
      elemento.className = 'aviso panel';
      elemento.setAttribute('role', 'status');
      elemento.setAttribute('aria-live', 'polite');
      elemento.textContent = texto;
      contenedor.append(elemento);
      const este = { elemento, temporizadores: [] as number[] };
      actual = este;
      // Entra en el cuadro siguiente para que se vea la transición.
      este.temporizadores.push(
        window.setTimeout(() => elemento.classList.add('visible'), 16),
        window.setTimeout(() => {
          elemento.classList.remove('visible');
          este.temporizadores.push(
            window.setTimeout(() => {
              if (actual === este) quitarActual();
            }, SALIDA_MS),
          );
        }, duracionMs),
      );
    },
  };
}
