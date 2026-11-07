import { BufferAttribute, BufferGeometry, Points, PointsMaterial, type Scene } from 'three';
import type { PaletaExterior } from '../paletas';

/** Polvo que flota con el viento; al salir por un lado vuelve a entrar por el otro. */
export function crearPolvo(
  escena: Scene,
  paleta: PaletaExterior,
  cantidad: number,
  azar: () => number,
): { actualizar(dt: number, t: number): void } {
  const pos = new Float32Array(cantidad * 3);
  for (let i = 0; i < cantidad; i++) {
    pos[i * 3] = (azar() - 0.5) * 80;
    pos[i * 3 + 1] = azar() * 14;
    pos[i * 3 + 2] = 9 - azar() * 120;
  }
  const geo = new BufferGeometry();
  const atributo = new BufferAttribute(pos, 3);
  geo.setAttribute('position', atributo);
  const puntos = new Points(
    geo,
    new PointsMaterial({ color: paleta.polvo, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }),
  );
  puntos.name = 'polvo';
  puntos.frustumCulled = false;
  escena.add(puntos);

  return {
    actualizar(dt, t) {
      for (let i = 0; i < cantidad; i++) {
        pos[i * 3] += dt * (1.4 + (i % 7) * 0.15);
        pos[i * 3 + 1] += Math.sin(t + i) * dt * 0.08;
        if (pos[i * 3] > 40) pos[i * 3] -= 80;
      }
      atributo.needsUpdate = true;
    },
  };
}
