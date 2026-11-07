import {
  BackSide,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type Scene,
} from 'three';
import type { Calidad } from '../../render/calidad';
import type { PaletaExterior } from '../paletas';

/** Valores sRGB tal cual (0..1), sin pasar a lineal: el cielo sale idéntico a la maqueta. */
export function srgb(hex: string): Vector3 {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const VERTICE = /* glsl */ `
varying vec3 vP;
void main() {
  vP = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Degradado de la maqueta: ocre en el horizonte, gris azulado arriba y el disco del sol.
// Sin trozos de tonemapping ni de espacio de color, a propósito.
const FRAGMENTO = /* glsl */ `
uniform vec3 cTop;
uniform vec3 cHor;
uniform vec3 cSun;
uniform vec3 dir;
varying vec3 vP;
void main() {
  vec3 p = normalize(vP);
  float h = clamp(p.y, 0.0, 1.0);
  vec3 c = mix(cHor, cTop, pow(h, 0.6));
  float s = max(dot(p, normalize(dir)), 0.0);
  c += cSun * (pow(s, 700.0) * 1.4 + pow(s, 10.0) * 0.32);
  if (p.y < 0.0) c = cHor;
  gl_FragColor = vec4(c, 1.0);
}`;

/** Bruma, cielo, luz del cielo y sol bajo detrás de la torre con sombras largas. */
export function crearCielo(escena: Scene, paleta: PaletaExterior, calidad: Calidad): { sol: DirectionalLight } {
  escena.fog = new Fog(paleta.niebla, paleta.nieblaCerca, paleta.nieblaLejos);
  escena.background = new Color(paleta.niebla);

  const dirSol = new Vector3(...paleta.dirSol).normalize();
  const cielo = new Mesh(
    new SphereGeometry(1600, 32, 16),
    new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      uniforms: {
        cTop: { value: srgb(paleta.cieloArriba) },
        cHor: { value: srgb(paleta.niebla) },
        cSun: { value: srgb(paleta.sol) },
        dir: { value: dirSol },
      },
      vertexShader: VERTICE,
      fragmentShader: FRAGMENTO,
    }),
  );
  cielo.name = 'cielo';
  escena.add(cielo);

  // Intensidades de la maqueta (r128) ×π: three 0.187 usa luces físicas.
  escena.add(new HemisphereLight(paleta.hemiCielo, paleta.hemiSuelo, 0.7 * Math.PI));

  const sol = new DirectionalLight(paleta.luzSol, 1.75 * Math.PI);
  sol.position.copy(dirSol).multiplyScalar(120).add(new Vector3(0, 0, -20));
  sol.target.position.set(0, 0, -20);
  sol.castShadow = true;
  sol.shadow.mapSize.set(calidad.sombraTam, calidad.sombraTam);
  const c = sol.shadow.camera;
  c.left = -60;
  c.right = 60;
  c.top = 60;
  c.bottom = -60;
  c.near = 1;
  c.far = 330;
  sol.shadow.bias = -0.0006;
  sol.shadow.normalBias = 0.03;
  sol.shadow.radius = calidad.sombraSuave ? 3 : 1;
  escena.add(sol, sol.target);
  return { sol };
}
