import { PerspectiveCamera, Vector3 } from 'three';
import { expect, test } from 'vitest';
import { crearCamaraJuego } from './camara-juego';

const DT = 1 / 60;
const ASPECTO = 874 / 402;
const enSuelo = { modo: 2 as const, z: 0, y: 0 };
const en3D = { modo: 3 as const, z: 0, y: 0 };

function preparar(movimientoReducido = false) {
  const camara = new PerspectiveCamera(42, ASPECTO, 0.1, 2200);
  return { camara, control: crearCamaraJuego(camara, { movimientoReducido }) };
}
const mirada = (c: PerspectiveCamera) => c.getWorldDirection(new Vector3());

test('en 2D la cámara está de lado (+z) y mira hacia el carril', () => {
  const { camara, control } = preparar();
  control.actualizar(DT, enSuelo, ASPECTO);
  expect(control.mezcla()).toBe(0);
  expect(camara.position.z).toBeGreaterThan(15);
  expect(mirada(camara).z).toBeLessThan(-0.9);
});

test('tras el portal gira detrás del personaje en menos de 1,5 s', () => {
  const { camara, control } = preparar();
  let t = 0;
  while (control.mezcla() < 0.9) {
    control.actualizar(DT, en3D, ASPECTO);
    t += DT;
  }
  expect(t).toBeLessThan(1.5);
  for (let i = 0; i < 180; i++) control.actualizar(DT, en3D, ASPECTO);
  expect(camara.position.x).toBeLessThan(-4);
  expect(camara.position.y).toBeGreaterThan(1.8);
  expect(mirada(camara).x).toBeGreaterThan(0.8);
  expect(camara.fov).toBeCloseTo(62, 0);
});

test('en 3D sigue al carril de lado a lado', () => {
  const { camara, control } = preparar();
  control.reiniciar(3);
  control.actualizar(DT, { modo: 3, z: 1.6, y: 0 }, ASPECTO);
  expect(camara.position.z).toBeGreaterThan(0.5);
});

test('la sacudida mueve la cámara y se apaga sola', () => {
  const { camara, control } = preparar();
  const base = preparar();
  control.actualizar(DT, enSuelo, ASPECTO);
  base.control.actualizar(DT, enSuelo, ASPECTO);
  control.sacudir(0.5);
  control.actualizar(DT, enSuelo, ASPECTO);
  base.control.actualizar(DT, enSuelo, ASPECTO);
  expect(camara.position.distanceTo(base.camara.position)).toBeGreaterThan(0);
  for (let i = 0; i < 60; i++) {
    control.actualizar(DT, enSuelo, ASPECTO);
    base.control.actualizar(DT, enSuelo, ASPECTO);
  }
  expect(camara.position.distanceTo(base.camara.position)).toBeLessThan(1e-9);
});

test('con movimiento reducido no hay sacudida', () => {
  const { camara, control } = preparar(true);
  const base = preparar(true);
  control.sacudir(0.5);
  control.actualizar(DT, enSuelo, ASPECTO);
  base.control.actualizar(DT, enSuelo, ASPECTO);
  expect(camara.position.distanceTo(base.camara.position)).toBe(0);
});

test('reiniciar(2) vuelve a la vista lateral al instante', () => {
  const { control } = preparar();
  for (let i = 0; i < 120; i++) control.actualizar(DT, en3D, ASPECTO);
  control.reiniciar(2);
  expect(control.mezcla()).toBe(0);
});

test('en 3D la cámara no baja al foso', () => {
  const suelo = preparar();
  const foso = preparar();
  suelo.control.reiniciar(3);
  foso.control.reiniciar(3);
  suelo.control.actualizar(DT, { modo: 3, z: 0, y: 0 }, ASPECTO);
  foso.control.actualizar(DT, { modo: 3, z: 0, y: -2 }, ASPECTO);
  expect(foso.camara.position.y).toBeCloseTo(suelo.camara.position.y, 9);
  expect(mirada(foso.camara).y).toBeCloseTo(mirada(suelo.camara).y, 9);
});
