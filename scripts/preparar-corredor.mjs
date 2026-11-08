// Prepara el corredor para el celular a partir del maniquí CC0 de Quaternius.
// Uso: npm run modelos:corredor -- <UAL1_Standard.glb> <UAL2_Standard.glb> <colgar.glb>
// Los dos primeros vienen de "Universal Animation Library" 1 y 2 (Standard), de Quaternius (CC0):
// https://quaternius.com/packs/universalanimationlibrary.html y .../universalanimationlibrary2.html.
// colgar.glb es propio: lo crea scripts/blender/colgar.py. Ninguno se guarda en el repositorio.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, quantize, resample } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Las animaciones que usa el juego, por archivo; el resto de cada paquete se descarta. */
const CLIPS_UAL1 = [
  'Idle_Loop', 'Sprint_Loop', 'Jump_Start', 'Jump_Loop', 'Jump_Land', 'Hit_Chest', 'Death01',
  'Roll', 'Pistol_Aim_Neutral', 'Pistol_Shoot',
];
const CLIPS_UAL2 = ['ClimbUp_1m', 'Hit_Knockback', 'Idle_Shield_Break', 'NinjaJump_Start', 'Yes'];
const CLIPS_PROPIOS = ['Colgar_Loop'];
const TOTAL = CLIPS_UAL1.length + CLIPS_UAL2.length + CLIPS_PROPIOS.length;

const [origen, origen2, propio] = process.argv.slice(2);
if (!origen || !origen2 || !propio) {
  console.error('Faltan rutas: npm run modelos:corredor -- <UAL1_Standard.glb> <UAL2_Standard.glb> <colgar.glb>');
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

function revisar(doc, nombres, archivo) {
  const encontradas = new Set(doc.getRoot().listAnimations().map((a) => a.getName()));
  const faltan = nombres.filter((c) => !encontradas.has(c));
  if (faltan.length) {
    console.error(`A ${archivo} le faltan animaciones: ${faltan.join(', ')}`);
    process.exit(1);
  }
}
revisar(documento, CLIPS_UAL1, 'UAL1');

/**
 * Copia animaciones de otro archivo con el mismo esqueleto: cada canal apunta al hueso del
 * corredor con el mismo nombre. `soloGiros` deja solo las rotaciones (el exportador de Blender
 * escribe también posiciones y escalas de todos los huesos, que ya están en el corredor).
 */
async function copiarAnimaciones(ruta, nombres, archivo, soloGiros = false) {
  const otro = await io.read(ruta);
  revisar(otro, nombres, archivo);
  const huesos = new Map(documento.getRoot().listNodes().map((n) => [n.getName(), n]));
  const bufer = documento.getRoot().listBuffers()[0];
  const copiar = (a) =>
    documento
      .createAccessor()
      .setType(a.getType())
      .setArray(a.getArray().slice())
      .setNormalized(a.getNormalized())
      .setBuffer(bufer);
  for (const animacion of otro.getRoot().listAnimations()) {
    if (!nombres.includes(animacion.getName())) continue;
    const nueva = documento.createAnimation(animacion.getName());
    for (const canal of animacion.listChannels()) {
      const ruta = canal.getTargetPath();
      if (soloGiros && ruta !== 'rotation') continue;
      const nombre = canal.getTargetNode()?.getName();
      const hueso = huesos.get(nombre);
      if (!hueso) {
        console.error(`${archivo}: ${animacion.getName()} mueve el hueso "${nombre}", que el corredor no tiene`);
        process.exit(1);
      }
      const origenMuestreo = canal.getSampler();
      const muestreo = documento
        .createAnimationSampler()
        .setInterpolation(origenMuestreo.getInterpolation())
        .setInput(copiar(origenMuestreo.getInput()))
        .setOutput(copiar(origenMuestreo.getOutput()));
      nueva.addSampler(muestreo).addChannel(documento.createAnimationChannel().setTargetNode(hueso).setTargetPath(ruta).setSampler(muestreo));
    }
  }
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
for (const animacion of documento.getRoot().listAnimations()) if (!CLIPS_UAL1.includes(animacion.getName())) borrarAnimacion(animacion);
await copiarAnimaciones(origen2, CLIPS_UAL2, 'UAL2');
await copiarAnimaciones(propio, CLIPS_PROPIOS, 'colgar.glb', true);

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
console.log(`Listo: public/modelos/corredor.glb (${kb} KB, ${TOTAL} animaciones).`);
