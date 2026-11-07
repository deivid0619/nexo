import { expect, test } from 'vitest';
import { ejecutarTareas } from './cargador';

const cuadro = () => Promise.resolve();

test('avanza por pesos hasta 1 exacto', async () => {
  const f: number[] = [];
  await ejecutarTareas(
    [
      { nombre: 'a', peso: 1, correr() {} },
      { nombre: 'b', peso: 3, correr: async () => {} },
    ],
    (x) => f.push(x),
    cuadro,
  );
  expect(f).toEqual([0, 0.25, 1]);
});

test('pesos en cero no dan NaN', async () => {
  const f: number[] = [];
  await ejecutarTareas(
    [
      { nombre: 'a', peso: 0, correr() {} },
      { nombre: 'b', peso: 0, correr() {} },
    ],
    (x) => f.push(x),
    cuadro,
  );
  expect(f).toEqual([0, 0.5, 1]);
});

test('una tarea que falla detiene la carga y dice cuál fue', async () => {
  const f: number[] = [];
  const p = ejecutarTareas(
    [
      { nombre: 'a', peso: 1, correr() {} },
      {
        nombre: 'b',
        peso: 1,
        correr() {
          throw new Error('x');
        },
      },
    ],
    (x) => f.push(x),
    cuadro,
  );
  await expect(p).rejects.toMatchObject({ name: 'ErrorDeCarga', tarea: 'b' });
  expect(f).toEqual([0, 0.5]);
});

test('también detiene la carga si una tarea asíncrona rechaza', async () => {
  const p = ejecutarTareas([{ nombre: 'c', peso: 1, correr: () => Promise.reject(new Error('y')) }], () => {}, cuadro);
  await expect(p).rejects.toMatchObject({ name: 'ErrorDeCarga', tarea: 'c' });
});

test('espera un cuadro entre tareas para que la barra se pinte', async () => {
  const orden: string[] = [];
  await ejecutarTareas(
    [
      { nombre: 'a', peso: 1, correr: () => void orden.push('a') },
      { nombre: 'b', peso: 1, correr: () => void orden.push('b') },
    ],
    () => {},
    async () => void orden.push('cuadro'),
  );
  expect(orden).toEqual(['a', 'cuadro', 'b', 'cuadro']);
});
