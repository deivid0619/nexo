import { expect, test } from 'vitest';
import { PISOS, pisoPorId, siguientePisoDisponible, TOTAL_REGISTROS } from './pisos';

test('datos de pisos', () => {
  expect(TOTAL_REGISTROS).toBe(4);
  expect(siguientePisoDisponible('tierra')).toBe('cristal');
  expect(siguientePisoDisponible('cristal')).toBeNull();
});

test('los cinco pisos van de abajo hacia arriba', () => {
  expect(PISOS.map((p) => [p.id, p.numero])).toEqual([
    ['tierra', 1],
    ['cristal', 2],
    ['magma', 3],
    ['vacio', 4],
    ['nucleo', 5],
  ]);
  expect(pisoPorId('cristal')).toMatchObject({ nombre: 'Cristal', jefe: 'Hidra de cristal', registros: 2, disponible: true });
  expect(pisoPorId('tierra')).toMatchObject({ nombre: 'Tierra baldía', jefe: 'Centinela' });
  expect(pisoPorId('vacio')).toMatchObject({ nombre: 'Vacío', jefe: null, registros: 0, disponible: false });
});
