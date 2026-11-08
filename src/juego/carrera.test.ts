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

function armar(opciones: DepsCarrera['opciones'] = {}, recordAnterior?: number) {
  let mezcla = 0;
  const deps = {
    nivel,
    opciones,
    corredor: { actualizar: vi.fn(), reiniciar: vi.fn(), animacion: () => 'correr' as const },
    camara: {
      actualizar: vi.fn((_dt: number, s: { modo: 2 | 3 }) => {
        mezcla = s.modo === 3 ? 1 : 0;
      }),
      sacudir: vi.fn(),
      mezcla: () => mezcla,
      reiniciar: vi.fn(),
    },
    pista: { actualizar: vi.fn() },
    hud: { reiniciar: vi.fn(), actualizar: vi.fn(), pista: vi.fn(), terminar: vi.fn() },
    avisos: { mostrar: vi.fn() },
    vibrar: vi.fn(),
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
