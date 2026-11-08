import { expect, test, vi } from 'vitest';
import type { Nivel } from '../datos/niveles/tipos';
import { crearCarrera, type DepsCarrera } from './carrera';

const DT = 1 / 60;
const nivel: Nivel = {
  id: 'prueba',
  largo: 60,
  eventos: [
    { en: 8, tipo: 'valla' },
    { en: 20, tipo: 'portal', a: 3 },
    { en: 30, tipo: 'habilidad', clase: 'escudo', carril: 0 },
  ],
};

function armar(opciones: DepsCarrera['opciones'] = {}, recordAnterior?: number, n: Nivel = nivel) {
  let mezcla = 0;
  const deps = {
    nivel: n,
    opciones,
    corredor: { actualizar: vi.fn(), reiniciar: vi.fn(), animacion: () => 'correr' as const, armaVisible: () => false, avance: () => 0 },
    camara: {
      actualizar: vi.fn((_dt: number, s: { modo: 2 | 3 }) => {
        mezcla = s.modo === 3 ? 1 : 0;
      }),
      sacudir: vi.fn(),
      mezcla: () => mezcla,
      reiniciar: vi.fn(),
    },
    pista: { actualizar: vi.fn() },
    hud: {
      reiniciar: vi.fn(),
      actualizar: vi.fn(),
      pista: vi.fn(),
      terminar: vi.fn(),
      justo: vi.fn(),
      arma: vi.fn(),
    },
    avisos: { mostrar: vi.fn() },
    vibrar: vi.fn(),
    proyectarCorredor: vi.fn(() => ({ x: 400, y: 120 })),
    guardarRecord: vi.fn((puntaje: number) =>
      recordAnterior !== undefined && recordAnterior >= puntaje
        ? { record: recordAnterior, nuevo: false }
        : { record: puntaje, nuevo: true },
    ),
  } satisfies DepsCarrera;
  return { carrera: crearCarrera(deps), ...deps };
}

let t = 0;
function correr(c: ReturnType<typeof crearCarrera>, segundos: number): void {
  for (let i = 0; i < Math.round(segundos / DT); i++) c.paso(DT, (t += DT), 1.8);
}

test('sin empezar no hay carrera: paso y acciones no hacen nada', () => {
  const { carrera, pista } = armar();
  expect(carrera.activa()).toBe(false);
  expect(carrera.estado()).toBeNull();
  carrera.accion('saltar');
  correr(carrera, 0.1);
  expect(pista.actualizar).not.toHaveBeenCalled();
});

test('empezar deja todo limpio y muestra la pista de saltar', () => {
  const { carrera, hud, corredor, camara } = armar();
  carrera.empezar();
  expect(carrera.activa()).toBe(true);
  expect(hud.reiniciar).toHaveBeenCalledTimes(1);
  expect(corredor.reiniciar).toHaveBeenCalledTimes(1);
  expect(camara.reiniciar).toHaveBeenCalledWith(2);
  expect(hud.pista).toHaveBeenLastCalledWith('saltar');
  expect(carrera.estado()).toMatchObject({ estado: 'corriendo', distancia: 0, vidas: 3, modo: 2, animacion: 'correr' });
});

test('el primer salto quita la pista y el HUD recibe vidas, puntaje y avance', () => {
  const { carrera, hud } = armar();
  carrera.empezar();
  carrera.accion('saltar');
  correr(carrera, 0.1);
  expect(hud.pista).toHaveBeenLastCalledWith(null);
  expect(carrera.estado()!.y).toBeGreaterThan(0);
  const ultimo = hud.actualizar.mock.lastCall![0];
  expect(ultimo.vidas).toBe(3);
  expect(ultimo.avance).toBeCloseTo(carrera.estado()!.distancia / nivel.largo, 5);
});

test('un golpe sacude la cámara, hace vibrar y el corredor lo acusa', () => {
  const { carrera, camara, vibrar, corredor } = armar();
  carrera.empezar();
  correr(carrera, 1.2);
  expect(carrera.estado()!.vidas).toBe(2);
  expect(camara.sacudir).toHaveBeenCalledTimes(1);
  expect(vibrar).toHaveBeenCalledWith(120);
  // actualizar(dt, sim, recientes)
  expect(corredor.actualizar.mock.calls.some((c) => c[2].golpe === true)).toBe(true);
});

test('el portal a 3D avisa y cambia la pista a la de los carriles, que se va al cambiar de carril', () => {
  const { carrera, hud, avisos } = armar({ sinDanio: true });
  carrera.empezar();
  correr(carrera, 2.4);
  expect(carrera.estado()!.modo).toBe(3);
  expect(avisos.mostrar).toHaveBeenCalledWith('Portal: ahora hay tres carriles');
  expect(hud.pista).toHaveBeenLastCalledWith('carril');
  carrera.accion('derecha');
  correr(carrera, 0.05);
  expect(carrera.estado()!.carril).toBe(1);
  expect(hud.pista).toHaveBeenLastCalledWith(null);
});

test('empezar después del portal muestra de una vez la pista de los carriles', () => {
  const { carrera, hud, camara } = armar({ desde: 25 });
  carrera.empezar();
  expect(camara.reiniciar).toHaveBeenCalledWith(3);
  expect(hud.pista).toHaveBeenLastCalledWith('carril');
});

test('recoger una habilidad avisa qué hace', () => {
  const { carrera, avisos } = armar({ desde: 25 });
  carrera.empezar();
  correr(carrera, 1);
  expect(avisos.mostrar).toHaveBeenCalledWith('Escudo: aguanta un golpe');
});

test('al llegar al final guarda el récord y muestra el panel una sola vez', () => {
  const { carrera, hud, guardarRecord } = armar({ desde: 50, sinDanio: true });
  carrera.empezar();
  correr(carrera, 2);
  expect(carrera.estado()!.estado).toBe('fin');
  correr(carrera, 1);
  expect(guardarRecord).toHaveBeenCalledTimes(1);
  expect(hud.terminar).toHaveBeenCalledTimes(1);
  const puntaje = carrera.estado()!.puntaje;
  expect(hud.terminar).toHaveBeenCalledWith({ tipo: 'fin', puntaje, record: puntaje, nuevoRecord: true });
});

test('si no supera el récord, el panel muestra el récord anterior', () => {
  const { carrera, hud } = armar({ desde: 50, sinDanio: true }, 99999);
  carrera.empezar();
  correr(carrera, 2);
  expect(hud.terminar).toHaveBeenCalledWith(expect.objectContaining({ record: 99999, nuevoRecord: false }));
});

test('detener termina la carrera y empezar otra vez arranca de cero', () => {
  const { carrera } = armar();
  carrera.empezar();
  carrera.accion('saltar');
  correr(carrera, 0.5);
  carrera.detener();
  expect(carrera.activa()).toBe(false);
  expect(carrera.estado()).toBeNull();
  carrera.empezar();
  expect(carrera.estado()).toMatchObject({ distancia: 0, y: 0, vidas: 3, modo: 2 });
});

// Revisión final: el panel salía en el mismo cuadro del golpe final.
test('el récord se guarda al terminar, pero el panel espera un momento', () => {
  const { carrera, hud, guardarRecord } = armar({ desde: 50, sinDanio: true });
  carrera.empezar();
  while (carrera.estado()!.estado === 'corriendo') correr(carrera, DT);
  expect(guardarRecord).toHaveBeenCalledTimes(1);
  expect(hud.terminar).not.toHaveBeenCalled();
  correr(carrera, 0.5);
  expect(hud.terminar).not.toHaveBeenCalled();
  correr(carrera, 0.4);
  expect(hud.terminar).toHaveBeenCalledTimes(1);
});

test('si sale antes de que aparezca el panel, la carrera siguiente no lo muestra', () => {
  const { carrera, hud } = armar({ desde: 50, sinDanio: true });
  carrera.empezar();
  while (carrera.estado()!.estado === 'corriendo') correr(carrera, DT);
  carrera.detener();
  carrera.empezar();
  correr(carrera, 1);
  expect(hud.terminar).not.toHaveBeenCalled();
});

// Etapa 3: pistas de cada movimiento, arma, EMP, "¡Justo!" y los toques nuevos.
const MOVIMIENTOS: Nivel = {
  id: 'movimientos',
  largo: 300,
  eventos: [
    { en: 50, tipo: 'viga', pista: 'rodar' },
    { en: 100, tipo: 'valla', alto: 1.1, pista: 'caer' },
    { en: 104, tipo: 'viga' },
    { en: 150, tipo: 'contenedor', largo: 6, pista: 'trepar' },
    { en: 200, tipo: 'foso', largo: 12 },
    { en: 200, tipo: 'cable', pista: 'cable' },
  ],
};
const ZONA: Nivel = {
  id: 'zona',
  largo: 200,
  eventos: [
    { en: 10, tipo: 'portal', a: 3 },
    { en: 30, tipo: 'arma' },
    { en: 60, tipo: 'dron', carril: 0 },
    { en: 90, tipo: 'emp' },
  ],
};

type ArmadoCarrera = ReturnType<typeof armar>;
/** Corre hasta que la distancia llega a `d` (o se acaba la carrera). */
function correrHasta(c: ArmadoCarrera['carrera'], d: number): void {
  while (c.estado()!.estado === 'corriendo' && c.estado()!.distancia < d) correr(c, DT);
}
const pistasMostradas = (hud: ArmadoCarrera['hud']) => hud.pista.mock.calls.map((c) => c[0]);

test('cada pista de nivel aparece cuando su evento está a 35 m o menos', () => {
  for (const [en, pista] of [
    [50, 'rodar'],
    [100, 'caer'],
    [150, 'trepar'],
    [200, 'cable'],
  ] as const) {
    const { carrera, hud } = armar({ desde: en - 40, sinDanio: true }, undefined, MOVIMIENTOS);
    carrera.empezar();
    correrHasta(carrera, en - 35.3);
    expect(pistasMostradas(hud)).not.toContain(pista);
    correrHasta(carrera, en - 34.9);
    expect(hud.pista).toHaveBeenLastCalledWith(pista);
  }
});

test('cada pista se va con su movimiento', () => {
  // Rodar.
  let a = armar({ desde: 20, sinDanio: true }, undefined, MOVIMIENTOS);
  a.carrera.empezar();
  correr(a.carrera, DT);
  expect(a.hud.pista).toHaveBeenLastCalledWith('rodar');
  a.carrera.accion('rodar');
  correr(a.carrera, DT);
  expect(a.hud.pista).toHaveBeenLastCalledWith(null);
  // Caída rápida.
  a = armar({ desde: 70, sinDanio: true }, undefined, MOVIMIENTOS);
  a.carrera.empezar();
  correr(a.carrera, DT);
  expect(a.hud.pista).toHaveBeenLastCalledWith('caer');
  a.carrera.accion('saltar');
  correr(a.carrera, 0.3);
  expect(a.hud.pista).toHaveBeenLastCalledWith('caer');
  a.carrera.accion('rodar');
  correr(a.carrera, DT);
  expect(a.hud.pista).toHaveBeenLastCalledWith(null);
  // Trepar.
  a = armar({ desde: 130, sinDanio: true }, undefined, MOVIMIENTOS);
  a.carrera.empezar();
  correrHasta(a.carrera, 149);
  expect(a.hud.pista).toHaveBeenLastCalledWith('trepar');
  a.carrera.accion('saltar');
  correr(a.carrera, 0.2);
  expect(a.carrera.estado()!.postura).toBe('trepando');
  expect(a.hud.pista).toHaveBeenLastCalledWith(null);
  // Cable: tocar colgado suelta.
  a = armar({ desde: 180, sinDanio: true }, undefined, MOVIMIENTOS);
  a.carrera.empezar();
  correrHasta(a.carrera, 198.5);
  a.carrera.accion('saltar');
  correr(a.carrera, 0.3);
  expect(a.carrera.estado()!.postura).toBe('colgado');
  expect(a.hud.pista).toHaveBeenLastCalledWith('cable');
  a.carrera.accion('tocar');
  correr(a.carrera, DT);
  expect(a.carrera.estado()!.postura).toBe('corriendo');
  expect(a.hud.pista).toHaveBeenLastCalledWith(null);
});

test('la siguiente pista reemplaza a la anterior y cada una sale una sola vez', () => {
  const { carrera, hud } = armar({ sinDanio: true }, undefined, MOVIMIENTOS);
  carrera.empezar();
  correrHasta(carrera, 300);
  const pistas = pistasMostradas(hud);
  // Sin hacer los movimientos, cada pista reemplaza a la de antes sin pasar por null. Llegar por el
  // suelo al contenedor también lo trepa (con golpe), y eso quita su pista; el final quita la última.
  expect(pistas.slice(pistas.indexOf('rodar'))).toEqual(['rodar', 'caer', 'trepar', null, 'cable', null]);
  for (const p of ['rodar', 'caer', 'trepar', 'cable']) expect(pistas.filter((x) => x === p)).toHaveLength(1);
});

test('el arma avisa, muestra su indicador y la pista de disparar; el primer disparo la quita', () => {
  const { carrera, hud, avisos, corredor } = armar({ desde: 20, sinDanio: true }, undefined, ZONA);
  carrera.empezar();
  expect(hud.arma).toHaveBeenLastCalledWith(false);
  correrHasta(carrera, 31);
  expect(carrera.estado()!.armado).toBe(true);
  expect(avisos.mostrar).toHaveBeenCalledWith('Arma lista: toca para disparar');
  expect(hud.arma).toHaveBeenLastCalledWith(true);
  expect(hud.pista).toHaveBeenLastCalledWith('disparar');
  // Armado, tocar dispara (no salta).
  carrera.accion('tocar');
  correr(carrera, DT);
  expect(carrera.estado()!.y).toBe(0);
  expect(hud.pista).toHaveBeenLastCalledWith(null);
  expect(corredor.actualizar.mock.lastCall![2].disparo).toBe(true);
});

test('el EMP avisa que se perdió el arma y apaga el indicador', () => {
  const { carrera, hud, avisos } = armar({ desde: 80, sinDanio: true }, undefined, ZONA);
  carrera.empezar();
  expect(hud.arma).toHaveBeenLastCalledWith(true);
  correrHasta(carrera, 91);
  expect(carrera.estado()!.armado).toBe(false);
  expect(avisos.mostrar).toHaveBeenCalledWith('Pulso EMP: perdiste el arma');
  expect(hud.arma).toHaveBeenLastCalledWith(false);
});

test('un "¡Justo!" llama al HUD con los puntos y la cabeza del corredor en pantalla', () => {
  const n: Nivel = { id: 'justo', largo: 60, eventos: [{ en: 20, tipo: 'contenedor', largo: 6 }] };
  const { carrera, hud, proyectarCorredor } = armar({}, undefined, n);
  carrera.empezar();
  correrHasta(carrera, 19);
  carrera.accion('saltar');
  correr(carrera, 0.2);
  expect(proyectarCorredor).toHaveBeenCalled();
  expect(hud.justo).toHaveBeenCalledWith(50, { x: 400, y: 120 });
});

test('caer a un foso sacude la cámara y vibra como un golpe', () => {
  const n: Nivel = { id: 'foso', largo: 60, eventos: [{ en: 20, tipo: 'foso', largo: 3 }] };
  // Sin daño: el foso no quita vida, así que la sacudida es del foso.
  const { carrera, camara, vibrar } = armar({ sinDanio: true }, undefined, n);
  carrera.empezar();
  correrHasta(carrera, 21);
  expect(carrera.estado()!.postura).toBe('foso');
  expect(camara.sacudir).toHaveBeenCalledWith(0.35);
  expect(vibrar).toHaveBeenCalledWith(120);
});

test('acciones: tocar salta, dispara o suelta; deslizar arriba salta o suelta; abajo rueda', () => {
  // En el suelo, tocar salta.
  let a = armar({}, undefined, MOVIMIENTOS);
  a.carrera.empezar();
  a.carrera.accion('tocar');
  correr(a.carrera, 0.1);
  expect(a.carrera.estado()!.y).toBeGreaterThan(0);
  // Abajo rueda.
  a = armar({}, undefined, MOVIMIENTOS);
  a.carrera.empezar();
  a.carrera.accion('rodar');
  correr(a.carrera, DT);
  expect(a.carrera.estado()!.postura).toBe('rodando');
  // Armado, deslizar arriba salta y 'disparar' (la X) dispara.
  a = armar({ desde: 40, sinDanio: true }, undefined, ZONA);
  a.carrera.empezar();
  a.carrera.accion('disparar');
  correr(a.carrera, DT);
  expect(a.corredor.actualizar.mock.lastCall![2].disparo).toBe(true);
  a.carrera.accion('saltar');
  correr(a.carrera, 0.1);
  expect(a.carrera.estado()!.y).toBeGreaterThan(0);
  // Colgado, deslizar arriba también suelta.
  a = armar({ desde: 180, sinDanio: true }, undefined, MOVIMIENTOS);
  a.carrera.empezar();
  correrHasta(a.carrera, 198.5);
  a.carrera.accion('saltar');
  correr(a.carrera, 0.3);
  expect(a.carrera.estado()!.postura).toBe('colgado');
  a.carrera.accion('saltar');
  correr(a.carrera, DT);
  expect(a.carrera.estado()!.postura).toBe('corriendo');
  // A los lados cambia de carril (en 3D).
  a = armar({ desde: 20, sinDanio: true }, undefined, ZONA);
  a.carrera.empezar();
  a.carrera.accion('izquierda');
  correr(a.carrera, DT);
  expect(a.carrera.estado()!.carril).toBe(-1);
});

test('el corredor recibe el escudo roto y el doble salto de los últimos momentos', () => {
  const n: Nivel = {
    id: 'recientes',
    largo: 80,
    eventos: [
      { en: 10, tipo: 'habilidad', clase: 'escudo' },
      { en: 20, tipo: 'valla' },
      { en: 30, tipo: 'habilidad', clase: 'doble' },
    ],
  };
  const { carrera, corredor } = armar({}, undefined, n);
  carrera.empezar();
  correrHasta(carrera, 21);
  expect(corredor.actualizar.mock.lastCall![2].escudoRoto).toBe(true);
  correrHasta(carrera, 32);
  carrera.accion('saltar');
  correr(carrera, 0.2);
  carrera.accion('saltar');
  correr(carrera, DT);
  expect(corredor.actualizar.mock.lastCall![2].dobleSalto).toBe(true);
});

test('el estado de la prueba trae la postura, el arma y si la pistola se ve', () => {
  const { carrera } = armar({ desde: 40, sinDanio: true }, undefined, ZONA);
  carrera.empezar();
  expect(carrera.estado()).toMatchObject({ postura: 'corriendo', armado: true, pistola: false });
});

test('una pista no sale mientras otro obstáculo viene antes que su evento; sale al pasarlo', () => {
  const CON_VALLA: Nivel = {
    id: 'con-valla',
    largo: 200,
    eventos: [
      { en: 30, tipo: 'valla' },
      { en: 50, tipo: 'viga', pista: 'rodar' },
    ],
  };
  const { carrera, hud } = armar({ desde: 10, sinDanio: true }, undefined, CON_VALLA);
  carrera.empezar();
  // La viga ya está a menos de 35 m, pero la valla de 30 m viene antes.
  correrHasta(carrera, 29.5);
  expect(pistasMostradas(hud)).not.toContain('rodar');
  correrHasta(carrera, 31);
  expect(hud.pista).toHaveBeenLastCalledWith('rodar');
});
