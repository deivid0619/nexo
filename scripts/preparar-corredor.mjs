// Prepara el corredor para el celular a partir del maniquí CC0 de Quaternius.
// Uso: npm run modelos:corredor -- <ruta a UAL1_Standard.glb>
// El archivo de origen viene de "Universal Animation Library (Standard)":
// https://quaternius.com/packs/universalanimationlibrary.html (CC0). No se guarda en el repositorio.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, quantize, resample } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Las animaciones que usa el juego; el resto del paquete se descarta. */
const CLIPS = new Set(['Idle_Loop', 'Sprint_Loop', 'Jump_Start', 'Jump_Loop', 'Jump_Land', 'Hit_Chest', 'Death01']);

const origen = process.argv[2];
if (!origen) {
  console.error('Falta la ruta: npm run modelos:corredor -- <ruta a UAL1_Standard.glb>');
  process.exit(1);
}
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'public', 'modelos', 'corredor.glb');

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const documento = await io.read(origen);
const animaciones = documento.getRoot().listAnimations();
const encontradas = new Set(animaciones.map((a) => a.getName()));
const faltan = [...CLIPS].filter((c) => !encontradas.has(c));
if (faltan.length) {
  console.error(`Al archivo le faltan animaciones: ${faltan.join(', ')}`);
  process.exit(1);
}
/** Borra una animación con sus canales, muestreos y datos (dispose() solo no los suelta y prune no los ve sueltos). */
function borrarAnimacion(animacion) {
  for (const canal of animacion.listChannels()) canal.dispose();
  for (const muestreo of animacion.listSamplers()) borrarMuestreo(muestreo);
  animacion.dispose();
}
function borrarMuestreo(muestreo) {
  const datos = [muestreo.getInput(), muestreo.getOutput()];
  muestreo.dispose();
  for (const accesor of datos) if (accesor && accesor.listParents().every((p) => p.propertyType === 'Root')) accesor.dispose();
}
for (const animacion of animaciones) if (!CLIPS.has(animacion.getName())) borrarAnimacion(animacion);

/**
 * Quita los canales que nunca se apartan de la pose de reposo del hueso (casi todas las escalas y
 * posiciones): no cambian nada en pantalla y cada uno suma descriptores al archivo.
 */
function quitarCanalesQuietos() {
  const TOLERANCIA = 1e-4;
  let quitados = 0;
  for (const animacion of documento.getRoot().listAnimations()) {
    for (const canal of animacion.listChannels()) {
      const nodo = canal.getTargetNode();
      const ruta = canal.getTargetPath();
      if (!nodo || !['translation', 'rotation', 'scale'].includes(ruta)) continue;
      const reposo =
        ruta === 'translation' ? nodo.getTranslation() : ruta === 'rotation' ? nodo.getRotation() : nodo.getScale();
      const salida = canal.getSampler().getOutput();
      const valor = [];
      let quieto = true;
      for (let i = 0; i < salida.getCount() && quieto; i++) {
        salida.getElement(i, valor);
        // Un cuaternión y su opuesto son la misma rotación.
        const signo = ruta === 'rotation' && valor.reduce((s, v, j) => s + v * reposo[j], 0) < 0 ? -1 : 1;
        quieto = valor.every((v, j) => Math.abs(signo * v - reposo[j]) <= TOLERANCIA);
      }
      if (quieto) {
        const muestreo = canal.getSampler();
        canal.dispose();
        borrarMuestreo(muestreo);
        quitados++;
      }
    }
  }
  console.log(`Canales quietos quitados: ${quitados}.`);
}
quitarCanalesQuietos();

await documento.transform(
  prune(),
  dedup(),
  resample(),
  quantize(),
  meshopt({ encoder: MeshoptEncoder, level: 'high' }),
);
documento.createExtension(EXTMeshoptCompression).setRequired(true);

mkdirSync(dirname(destino), { recursive: true });
await io.write(destino, documento);
const kb = (statSync(destino).size / 1024).toFixed(0);
console.log(`Listo: public/modelos/corredor.glb (${kb} KB, ${CLIPS.size} animaciones).`);
