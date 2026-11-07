export interface ListaMenu {
  activo(): number;
  mover(delta: 1 | -1): void;
  enfocar(indice: number): void;
  /** Devuelve true si usó la tecla. */
  teclado(e: KeyboardEvent): boolean;
  destruir(): void;
}

interface Opciones {
  selector: string;
  /** También se llama con los deshabilitados, para que la pantalla muestre por qué. */
  alActivar(indice: number, origen: 'toque' | 'tecla'): void;
  alCambiar?(indice: number): void;
  inicial?: number;
}

const deshabilitado = (el: Element) => el.getAttribute('aria-disabled') === 'true';

/** Un menú vertical que se maneja igual con el dedo, el mouse y el teclado. */
export function crearListaMenu(contenedor: HTMLElement, opciones: Opciones): ListaMenu {
  const items = [...contenedor.querySelectorAll<HTMLElement>(opciones.selector)];
  const documento = contenedor.ownerDocument;
  let activo = -1;
  const quitar: (() => void)[] = [];
  /** Índice del elemento que tiene el foco del navegador, o -1. */
  const conFoco = () => items.indexOf(documento.activeElement as HTMLElement);

  const lista: ListaMenu = {
    activo: () => activo,
    enfocar(indice) {
      if (indice < 0 || indice >= items.length || indice === activo) return;
      items[activo]?.classList.remove('activo');
      activo = indice;
      items[activo].classList.add('activo');
      // Si el foco del teclado está en la lista, va con la selección: son la misma cosa.
      const foco = conFoco();
      if (foco >= 0 && foco !== activo) items[activo].focus({ preventScroll: true });
      opciones.alCambiar?.(activo);
    },
    mover(delta) {
      for (let paso = 1; paso <= items.length; paso++) {
        const i = (((activo + delta * paso) % items.length) + items.length) % items.length;
        if (!deshabilitado(items[i])) {
          lista.enfocar(i);
          return;
        }
      }
    },
    teclado(e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        lista.mover(e.key === 'ArrowDown' ? 1 : -1);
        return true;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const foco = conFoco();
        // Con el foco en otro botón (Volver, Entrar al portal), ese botón responde por su cuenta.
        const otro = documento.activeElement;
        if (foco < 0 && otro instanceof HTMLElement && otro !== documento.body && otro.matches('button, a, [tabindex]')) {
          return false;
        }
        // Sin esto, el botón con el foco también se activaría por su cuenta.
        e.preventDefault();
        const elegido = foco >= 0 ? foco : activo;
        if (elegido >= 0) opciones.alActivar(elegido, 'tecla');
        return true;
      }
      return false;
    },
    destruir() {
      for (const q of quitar.splice(0)) q();
    },
  };

  items.forEach((el, i) => {
    // Un elemento deshabilitado nunca se queda con la selección: el toque solo le pide a la pantalla que avise.
    const alEntrar = () => {
      if (!deshabilitado(el)) lista.enfocar(i);
    };
    const alTocar = () => {
      alEntrar();
      opciones.alActivar(i, 'toque');
    };
    el.addEventListener('pointerenter', alEntrar);
    // Tab también elige: el foco del teclado y la selección no se separan.
    el.addEventListener('focus', alEntrar);
    el.addEventListener('click', alTocar);
    quitar.push(() => {
      el.removeEventListener('pointerenter', alEntrar);
      el.removeEventListener('focus', alEntrar);
      el.removeEventListener('click', alTocar);
    });
  });

  lista.enfocar(Math.min(Math.max(opciones.inicial ?? 0, 0), items.length - 1));
  return lista;
}
