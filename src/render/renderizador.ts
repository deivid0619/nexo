import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace, WebGLRenderer } from 'three';
import type { Calidad } from './calidad';

export class ErrorSinWebGL extends Error {
  constructor(causa?: unknown) {
    super('Este navegador no tiene WebGL', { cause: causa });
    this.name = 'ErrorSinWebGL';
  }
}

/** Renderizador con la luz de la maqueta: tonos ACES, exposición 1,08 y sombras filtradas. */
export function crearRenderizador(lienzo: HTMLCanvasElement, calidad: Calidad): WebGLRenderer {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas: lienzo, antialias: calidad.antialias, powerPreference: 'high-performance' });
  } catch (e) {
    throw new ErrorSinWebGL(e);
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, calidad.pixelRatioMax));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  // En three 0.187 PCFShadowMap ya filtra con disco de Vogel; la suavidad se da con shadow.radius.
  renderer.shadowMap.type = PCFShadowMap;
  return renderer;
}

/** Ajusta el tamaño de dibujo al tamaño real del lienzo en pantalla. */
export function observarTamano(renderer: WebGLRenderer, alCambiar: (ancho: number, alto: number) => void): void {
  const lienzo = renderer.domElement;
  const ajustar = () => {
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    if (!ancho || !alto) return;
    renderer.setSize(ancho, alto, false);
    alCambiar(ancho, alto);
  };
  new ResizeObserver(ajustar).observe(lienzo);
  ajustar();
}

/** iOS puede quitarle el contexto WebGL a la página al cambiar de app: se avisa y se espera a que vuelva. */
export function vigilarContexto(lienzo: HTMLCanvasElement, alPerder: () => void, alRecuperar: () => void): void {
  lienzo.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    alPerder();
  });
  lienzo.addEventListener('webglcontextrestored', () => alRecuperar());
}
