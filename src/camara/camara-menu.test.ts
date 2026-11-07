import { test, expect } from 'vitest';
import { PerspectiveCamera } from 'three';
import { crearCamaraMenu } from './camara-menu';
import { TOMAS } from './tomas';

test('viaja a la toma de la torre', () => {
  const cam = new PerspectiveCamera(42, 640 / 296);
  const m = crearCamaraMenu(cam, { movimientoReducido: () => false });
  m.irA('inicio', true);
  m.irA('torre');
  for (let i = 0; i < 600; i++) m.actualizar(1 / 60, i / 60);
  const p = m.estado().posicion;
  TOMAS.torre.posicion.forEach((v, k) => expect(Math.abs(p[k] - v)).toBeLessThan(0.15));
  expect(m.estado().fov).toBeCloseTo(13, 1);
});

test('irA instantáneo llega en el acto', () => {
  const cam = new PerspectiveCamera(42, 640 / 296);
  const m = crearCamaraMenu(cam, { movimientoReducido: () => false });
  m.irA('carga', true);
  expect(m.estado()).toEqual(TOMAS.carga);
});

test('con movimiento reducido llega en un cuadro y sin vaivén', () => {
  const cam = new PerspectiveCamera(42, 640 / 296);
  const m = crearCamaraMenu(cam, { movimientoReducido: () => true });
  m.irA('inicio');
  m.irA('torre');
  m.actualizar(1 / 60, 5);
  expect(m.estado().posicion).toEqual(TOMAS.torre.posicion);
  expect(cam.position.toArray()).toEqual(TOMAS.torre.posicion);
});

test('en pantalla 4:3 la cámara abre el fov', () => {
  const cam = new PerspectiveCamera(42, 4 / 3);
  const m = crearCamaraMenu(cam, { movimientoReducido: () => true });
  m.irA('inicio', true);
  m.actualizar(1 / 60, 0);
  expect(cam.fov).toBeCloseTo(63.8, 1);
});
