import { CanvasTexture, Color, InstancedMesh, MeshBasicMaterial, Object3D, PlaneGeometry, SRGBColorSpace, type Scene } from 'three';
import { alturaTerreno } from './terreno';

/** Sombra suave de contacto bajo un objeto: lo "asienta" en el suelo. */
export interface SombraContacto {
  x: number;
  z: number;
  ancho: number;
  largo: number;
  opacidad: number;
  giro?: number;
}

/** Encima de la carretera (0,03) y de sus marcas (0,05), sin parpadeo de profundidad. */
const ALTURA = 0.06;

function texturaDegradado(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.55, 'rgba(255,255,255,.55)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * Todas las sombras de contacto en una sola malla instanciada (una llamada de dibujo).
 * La opacidad de cada una viaja en el canal rojo del color de instancia.
 */
export function crearSombrasContacto(escena: Scene, sombras: SombraContacto[]): InstancedMesh {
  const material = new MeshBasicMaterial({ map: texturaDegradado(), transparent: true, depthWrite: false });
  material.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\n\tdiffuseColor.a *= diffuseColor.r;\n\tdiffuseColor.rgb = vec3(0.0);',
    );
  };
  const malla = new InstancedMesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), material, sombras.length);
  malla.name = 'sombras-contacto';
  malla.renderOrder = 1;
  const guia = new Object3D();
  const color = new Color();
  sombras.forEach((s, i) => {
    guia.position.set(s.x, alturaTerreno(s.x, s.z) + ALTURA, s.z);
    guia.rotation.set(0, s.giro ?? 0, 0);
    guia.scale.set(s.ancho, 1, s.largo);
    guia.updateMatrix();
    malla.setMatrixAt(i, guia.matrix);
    malla.setColorAt(i, color.setRGB(s.opacidad, s.opacidad, s.opacidad));
  });
  escena.add(malla);
  return malla;
}
