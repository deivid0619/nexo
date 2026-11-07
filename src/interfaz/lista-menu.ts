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
  let activo = -1;
  const quitar: (() => void)[] = [];

  const lista: ListaMenu = {
    activo: () => activo,
    enfocar(indice) {
      if (indice < 0 || indice >= items.length || indice === activo) return;
      items[activo]?.classList.remove('activo');
      activo = indice;
      items[activo].classList.add('activo');
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
        // Sin esto, un botón con el foco del navegador también se activaría por su cuenta.
        e.preventDefault();
        if (activo >= 0) opciones.alActivar(activo, 'tecla');
        return true;
      }
      return false;
    },
    destruir() {
      for (const q of quitar.splice(0)) q();
    },
  };

  items.forEach((el, i) => {
    const alEntrar = () => lista.enfocar(i);
    const alTocar = () => {
      lista.enfocar(i);
      opciones.alActivar(i, 'toque');
    };
    el.addEventListener('pointerenter', alEntrar);
    el.addEventListener('click', alTocar);
    quitar.push(() => {
      el.removeEventListener('pointerenter', alEntrar);
      el.removeEventListener('click', alTocar);
    });
  });

  lista.enfocar(Math.min(Math.max(opciones.inicial ?? 0, 0), items.length - 1));
  return lista;
}
