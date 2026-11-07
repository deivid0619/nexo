import { describe, expect, it } from 'vitest';
import { TOMAS } from '../../camara/tomas';
import { crearAzar } from '../../nucleo/azar';
import { despejarVistaTorre, franjaVistaTorre } from './ruinas';
import { POSICION_TORRE } from './torre';

/** x de la línea que va de la cámara de una toma a la torre, a la altura z. */
function lineaHaciaTorre(toma: 'inicio' | 'torre', z: number): number {
  const [cx, , cz] = TOMAS[toma].posicion;
  const [tx, , tz] = POSICION_TORRE;
  return cx + ((tx - cx) * (cz - z)) / (cz - tz);
}

describe('despejarVistaTorre', () => {
  it('la franja libre cubre la vista a la torre desde el inicio y desde el mapa', () => {
    for (let z = -10; z > -310; z -= 10) {
      const { izquierda, derecha } = franjaVistaTorre(z);
      for (const toma of ['inicio', 'torre'] as const) {
        const x = lineaHaciaTorre(toma, z);
        // La torre con sus anillos mide unos 24 m de ancho a 336 m: unos 2° a cada lado de la línea.
        const holgura = 0.04 * (TOMAS[toma].posicion[2] - z);
        expect(x - holgura).toBeGreaterThanOrEqual(izquierda);
        expect(x + holgura).toBeLessThanOrEqual(derecha);
      }
    }
  });

  it('ningún edificio queda encima de la franja', () => {
    const azar = crearAzar(7);
    for (let i = 0; i < 2000; i++) {
      const z = -10 - azar() * 300;
      const mitad = 3 + azar() * 6;
      const x = despejarVistaTorre(5 + azar() * 40, z, mitad);
      const { izquierda, derecha } = franjaVistaTorre(z);
      const fuera = x - mitad >= derecha - 1e-9 || x + mitad <= izquierda + 1e-9;
      expect(fuera).toBe(true);
    }
  });

  it('no mueve los edificios que ya están fuera de la franja', () => {
    expect(despejarVistaTorre(-20, -100, 5)).toBe(-20);
    expect(despejarVistaTorre(60, -200, 6)).toBe(60);
  });

  it('detrás de la torre no hace falta despejar', () => {
    expect(despejarVistaTorre(26, -360, 5)).toBe(26);
  });
});
