import { test, expect } from 'vitest';
import { crearBucle } from './bucle';

test('avanzar(1) da 60 pasos de 1/60 y el tiempo llega a 1', () => {
  const dts: number[] = [];
  let tf = 0;
  crearBucle((dt, t) => {
    dts.push(dt);
    tf = t;
  }).avanzar(1);
  expect(dts).toHaveLength(60);
  expect(dts.every((d) => d === 1 / 60)).toBe(true);
  expect(tf).toBeCloseTo(1, 9);
});

test('avanzar(0.5) da 30 pasos', () => {
  const dts: number[] = [];
  let tf = 0;
  crearBucle((dt, t) => {
    dts.push(dt);
    tf = t;
  }).avanzar(0.5);
  expect(dts).toHaveLength(30);
  expect(tf).toBeCloseTo(0.5, 9);
});

test('el tiempo sigue sumando entre llamadas', () => {
  let tf = 0;
  const b = crearBucle((_dt, t) => {
    tf = t;
  });
  b.avanzar(1);
  b.avanzar(1);
  expect(tf).toBeCloseTo(2, 9);
});
