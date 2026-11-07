/** Mensaje del sistema a pantalla completa: sin WebGL o recuperando el contexto. */
export function crearVeloSistema(contenedor: HTMLElement): { mostrar(texto: string): void; ocultar(): void } {
  const el = document.createElement('div');
  el.className = 'velo-sistema';
  el.setAttribute('role', 'alert');
  el.hidden = true;
  contenedor.append(el);
  return {
    mostrar(texto: string) {
      el.textContent = texto;
      el.hidden = false;
    },
    ocultar() {
      el.hidden = true;
    },
  };
}
