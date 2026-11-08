import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Group, Mesh } from 'three';
import { expect, test } from 'vitest';
import { separarUtileria } from './utileria';

// La pistola y el dron: piezas propias hechas con scripts/blender/utileria.py.
const RUTA = fileURLToPath(new URL('../../public/modelos/utileria.glb', import.meta.url));
const TOPE_BYTES = 150 * 1024;

interface GltfJson {
  nodes?: { name?: string; mesh?: number }[];
  meshes?: unknown[];
  images?: unknown[];
}

function leerJson(ruta: string): GltfJson {
  const datos = readFileSync(ruta);
  expect(datos.readUInt32LE(0)).toBe(0x46546c67); // "glTF"
  const largo = datos.readUInt32LE(12);
  return JSON.parse(datos.subarray(20, 20 + largo).toString('utf8')) as GltfJson;
}

test('utileria.glb existe y pesa 150 KB o menos', () => {
  expect(existsSync(RUTA)).toBe(true);
  expect(statSync(RUTA).size).toBeLessThanOrEqual(TOPE_BYTES);
});

test('utileria.glb trae la pistola y el dron como dos mallas, sin texturas', () => {
  const json = leerJson(RUTA);
  const nombres = (json.nodes ?? []).filter((n) => n.mesh !== undefined).map((n) => n.name).sort();
  expect(nombres).toEqual(['dron', 'pistola']);
  expect(json.meshes).toHaveLength(2);
  expect(json.images ?? []).toHaveLength(0);
});

test('separarUtileria devuelve la pistola y el dron por su nombre', () => {
  const escena = new Group();
  const pistola = new Mesh();
  pistola.name = 'pistola';
  const dron = new Mesh();
  dron.name = 'dron';
  escena.add(pistola, dron);
  expect(separarUtileria(escena)).toEqual({ pistola, dron });
});

test('separarUtileria falla nombrando la pieza que falta', () => {
  const escena = new Group();
  const pistola = new Mesh();
  pistola.name = 'pistola';
  escena.add(pistola);
  expect(() => separarUtileria(escena)).toThrow(/dron/);
});
