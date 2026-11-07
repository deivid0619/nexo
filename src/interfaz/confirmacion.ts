interface TextosConfirmacion {
  titulo: string;
  texto: string;
  aceptar: string;
  cancelar: string;
}

let siguienteId = 0;

/**
 * Pregunta antes de algo que no se puede deshacer. El foco empieza en Cancelar;
 * Escape o un toque fuera del cuadro también cancelan.
 */
export function pedirConfirmacion(contenedor: HTMLElement, textos: TextosConfirmacion): Promise<boolean> {
  const idTitulo = `confirmacion-titulo-${++siguienteId}`;
  const telon = document.createElement('div');
  telon.className = 'telon';
  const modal = document.createElement('div');
  modal.className = 'modal panel';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', idTitulo);

  const titulo = document.createElement('h2');
  titulo.className = 'titulo';
  titulo.id = idTitulo;
  titulo.textContent = textos.titulo;
  const texto = document.createElement('p');
  texto.textContent = textos.texto;
  const acciones = document.createElement('div');
  acciones.className = 'acciones';
  const boton = (accion: 'cancelar' | 'aceptar', etiqueta: string) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'boton';
    b.dataset.accion = accion;
    b.textContent = etiqueta;
    return b;
  };
  const cancelar = boton('cancelar', textos.cancelar);
  const aceptar = boton('aceptar', textos.aceptar);
  acciones.append(cancelar, aceptar);
  modal.append(titulo, texto, acciones);
  telon.append(modal);

  const antes = document.activeElement as HTMLElement | null;
  contenedor.append(telon);
  cancelar.focus();

  return new Promise((resolver) => {
    const responder = (valor: boolean) => {
      document.removeEventListener('keydown', alTeclado, true);
      telon.remove();
      antes?.focus?.();
      resolver(valor);
    };
    // En fase de captura: la pantalla de abajo no recibe ninguna tecla mientras esto está abierto.
    const alTeclado = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        e.preventDefault();
        responder(false);
      } else if (e.key === 'Tab') {
        // El foco no se escapa del cuadro: va y vuelve entre los dos botones.
        e.preventDefault();
        (document.activeElement === cancelar ? aceptar : cancelar).focus();
      }
    };
    document.addEventListener('keydown', alTeclado, true);
    aceptar.addEventListener('click', () => responder(true));
    cancelar.addEventListener('click', () => responder(false));
    telon.addEventListener('click', (e) => {
      if (e.target === telon) responder(false);
    });
  });
}
