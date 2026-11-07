import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

// El corredor que se publica: el maniquí CC0 de Quaternius, recortado y comprimido para el celular.
const RUTA = fileURLToPath(new URL('../../public/modelos/corredor.glb', import.meta.url));
const CLIPS = ['Idle_Loop', 'Sprint_Loop', 'Jump_Start', 'Jump_Loop', 'Jump_Land', 'Hit_Chest', 'Death01'];
const TOPE_BYTES = 1.5 * 1024 * 1024;

interface GltfJson {
  animations?: { name?: string }[];
  skins?: unknown[];
  extensionsUsed?: string[];
}

/** El bloque JSON de un GLB: encabezado de 12 bytes y luego el primer bloque. */
function leerJson(ruta: string): GltfJson {
  const datos = readFileSync(ruta);
  expect(datos.readUInt32LE(0)).toBe(0x46546c67); // "glTF"
  const largo = datos.readUInt32LE(12);
  return JSON.parse(datos.subarray(20, 20 + largo).toString('utf8')) as GltfJson;
}

test('corredor.glb existe y pesa 1,5 MB o menos', () => {
  expect(existsSync(RUTA)).toBe(true);
  expect(statSync(RUTA).size).toBeLessThanOrEqual(TOPE_BYTES);
});

test('corredor.glb trae exactamente las 7 animaciones del juego', () => {
  const nombres = (leerJson(RUTA).animations ?? []).map((a) => a.name).sort();
  expect(nombres).toEqual([...CLIPS].sort());
});

test('corredor.glb tiene un solo esqueleto y viene comprimido con meshopt', () => {
  const json = leerJson(RUTA);
  expect(json.skins).toHaveLength(1);
  expect(json.extensionsUsed).toContain('EXT_meshopt_compression');
});
