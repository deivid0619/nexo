import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../nucleo/azar';
import { despejarVistaTorre, franjaVistaTorre } from './ruinas';

describe('despejarVistaTorre', () => {
  it('ningún edificio tapa la línea de vista de la cámara a la torre', () => {
    const azar = crearAzar(7);
    for (let i = 0; i < 2000; i++) {
      const z = -10 - azar() * 300;
      const mitad = 3 + azar() * 6;
      const x = despejarVistaTorre(5 + azar() * 40, z, mitad);
      const { centro, margen } = franjaVistaTorre(z);
      // El edificio queda entero a un lado de la franja, nunca encima.
      const fuera = x - mitad >= centro + margen - 1e-9 || x + mitad <= centro - margen + 1e-9;
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
