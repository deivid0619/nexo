import type { WebGLRenderer } from 'three';

const INTERVALO = 0.5;

/** Cuadros por segundo y llamadas de dibujo, para probar en el celular (?fps=1). */
export function crearMedidor(renderer: WebGLRenderer, contenedor: HTMLElement): { actualizar(dt: number): void } {
  const el = document.createElement('div');
  el.className = 'medidor';
  el.setAttribute('aria-hidden', 'true');
  contenedor.append(el);
  let acumulado = 0;
  let cuadros = 0;
  return {
    actualizar(dt: number) {
      acumulado += dt;
      cuadros++;
      if (acumulado < INTERVALO) return;
      const fps = Math.round(cuadros / acumulado);
      el.textContent = `${fps} fps · ${renderer.info.render.calls} llamadas`;
      acumulado = 0;
      cuadros = 0;
    },
  };
}
