import { expect, test } from 'vitest';
import { ANCHO_CARRIL, crearSimulacion, GRAVEDAD, SALTO, type ObjetoPista, type Simulacion } from '../../juego/simulacion';
import { TIERRA_BALDIA_1 } from './tierra-baldia-1';
import type { Carril, Evento, PistaNivel } from './tipos';
import { FOSO_CON_CABLE_M, validarNivel } from './validar';

const eventos = TIERRA_BALDIA_1.eventos;
const DT = 1 / 60;

test('el primer tramo de la Tierra baldía es válido', () => {
  expect(validarNivel(TIERRA_BALDIA_1)).toEqual([]);
});

test('dura entre 500 y 600 metros, cruza a 3D y vuelve a 2D', () => {
  expect(TIERRA_BALDIA_1.id).toBe('tierra-1');
  expect(TIERRA_BALDIA_1.largo).toBeGreaterThanOrEqual(500);
  expect(TIERRA_BALDIA_1.largo).toBeLessThanOrEqual(600);
  const portales = eventos.flatMap((e) => (e.tipo === 'portal' ? [e.a] : []));
  expect(portales).toContain(3);
  expect(portales).toContain(2);
});

test('trae cada obstáculo nuevo, dos fosos con cable y una zona de armas con 8 drones o más', () => {
  for (const tipo of ['viga', 'contenedor', 'foso', 'cable', 'arma', 'dron', 'emp'] as const) {
    expect(eventos.some((e) => e.tipo === tipo), tipo).toBe(true);
  }
  const conCable = eventos.filter(
    (e) => e.tipo === 'foso' && e.largo >= FOSO_CON_CABLE_M && eventos.some((c) => c.tipo === 'cable' && c.en === e.en),
  );
  expect(conCable.length).toBeGreaterThanOrEqual(2);
  const arma = eventos.findIndex((e) => e.tipo === 'arma');
  const emp = eventos.findIndex((e) => e.tipo === 'emp');
  expect(eventos.slice(arma, emp).filter((e) => e.tipo === 'dron').length).toBeGreaterThanOrEqual(8);
});

test('lleva una pista por movimiento, en el primer obstáculo de cada uno', () => {
  const pistas = eventos.flatMap((e) => (e.pista ? [e.pista] : []));
  expect(pistas.sort()).toEqual(['cable', 'caer', 'rodar', 'trepar']);
  expect(eventos.find((e) => e.tipo === 'viga')?.pista).toBe('rodar');
  // La caída rápida: la primera valla alta que tiene una viga justo después.
  const combo = eventos.find((e, i) => {
    const sig = eventos[i + 1];
    return e.tipo === 'valla' && e.alto === 1.1 && sig?.tipo === 'viga' && sig.en - e.en <= 5;
  });
  expect(combo?.pista).toBe('caer');
  expect(eventos.find((e) => e.tipo === 'contenedor')?.pista).toBe('trepar');
  expect(eventos.find((e) => e.tipo === 'cable')?.pista).toBe('cable');
});

test('cada movimiento aparece primero solo: 15 m o más hasta el siguiente obstáculo de otro tipo', () => {
  const propios: Record<PistaNivel, Evento['tipo'][]> = {
    rodar: ['viga'],
    caer: ['valla', 'viga'],
    trepar: ['contenedor'],
    cable: ['cable', 'foso'],
  };
  const obstaculos: Evento['tipo'][] = ['valla', 'viga', 'contenedor', 'foso', 'cable', 'bloque', 'dron'];
  eventos.forEach((e, i) => {
    if (!e.pista) return;
    const pista = e.pista;
    const sig = eventos.slice(i + 1).find((f) => obstaculos.includes(f.tipo) && !propios[pista].includes(f.tipo));
    expect(sig, pista).toBeDefined();
    expect(sig!.en - e.en, pista).toBeGreaterThanOrEqual(15);
  });
});

/** Desde y hasta cuándo (s) un salto desde el suelo va por encima de `h` metros. */
function sobre(h: number): [number, number] {
  const r = Math.sqrt(SALTO * SALTO - 2 * GRAVEDAD * h);
  return [(SALTO - r) / GRAVEDAD, (SALTO + r) / GRAVEDAD];
}

/**
 * Un jugador que no se equivoca: en cada paso mira lo que viene y hace el movimiento justo a tiempo.
 * Atiende cada obstáculo una sola vez y solo el más cercano que le toca.
 */
function crearPiloto(): (s: Simulacion) => void {
  const hechos = new Set<number>();
  const pendiente = (o: ObjetoPista) => !o.roto && !o.tomado && !hechos.has(o.id);
  const altoValla = (o: ObjetoPista) => (o.evento.tipo === 'valla' ? (o.evento.alto ?? 0.7) : 0) - 0.03;

  /** En 3D, si un bloque viene por su carril, va al carril libre más cercano (un paso por cuadro). */
  function elegirCarril(s: Simulacion, delante: readonly ObjetoPista[]): void {
    const bloqueado = (c: Carril) =>
      delante.some((o) => o.evento.tipo === 'bloque' && o.evento.carril === c && !o.roto && o.x > -0.8 && o.x < 11);
    if (!bloqueado(s.carril)) return;
    const libres = ([-1, 0, 1] as Carril[]).filter((c) => !bloqueado(c));
    libres.sort((a, b) => Math.abs(a - s.carril) - Math.abs(b - s.carril));
    if (libres.length > 0) s.cambiarCarril(libres[0] > s.carril ? 1 : -1);
  }

  return (s) => {
    if (s.estado !== 'corriendo') return;
    if (s.postura === 'colgado') {
      if ((s.vaiven ?? 0) >= 0.8 - 1e-9) s.soltar();
      return;
    }
    if (s.postura === 'trepando' || s.postura === 'foso') return;
    const v = s.velocidad;
    const delante = [...s.objetos()].sort((a, b) => a.x - b.x);
    const deMiCarril = (c: Carril | undefined) => s.modo === 2 || Math.abs(s.z - (c ?? 0) * ANCHO_CARRIL) < 0.75;
    if (s.modo === 3) elegirCarril(s, delante);
    const dronDelante = delante.some(
      (o) => o.evento.tipo === 'dron' && !o.roto && o.evento.carril === s.carril && o.x > 0.7 && o.x < 40,
    );
    if (s.armado && dronDelante) s.disparar();

    const enSuelo = s.suelo !== null && s.y === s.suelo && s.vy === 0;
    if (!enSuelo) {
      // En el aire: si una viga llega antes de volver al suelo, caída rápida (y termina rodando).
      const viga = delante.find((o) => o.evento.tipo === 'viga' && pendiente(o) && o.x > 1.3 && o.x <= 3);
      if (!viga || s.caidaRapida || s.suelo !== 0) return;
      const estorba = delante.some(
        (o) =>
          (o.evento.tipo === 'valla' && o.x > -0.4 && o.x < viga.x) ||
          (o.evento.tipo === 'foso' && o.x < viga.x + 2 && o.x + o.evento.largo > -1),
      );
      if (!estorba) {
        s.rodar();
        hechos.add(viga.id);
      }
      return;
    }

    for (const o of delante) {
      if (!pendiente(o)) continue;
      const e = o.evento;
      if (e.tipo === 'valla' && o.x > 0.32) {
        // Vallas seguidas se pasan de un salto: apunta al medio de lo que sirve para todas.
        const grupo = delante.filter((p) => p.evento.tipo === 'valla' && p.x >= o.x && p.x - o.x < 3.5);
        const ultima = grupo[grupo.length - 1];
        const desde = 0.32 + sobre(altoValla(o))[0] * v;
        const hasta = sobre(altoValla(ultima))[1] * v - 0.32 - (ultima.x - o.x);
        if (o.x <= (desde + hasta) / 2) {
          s.saltar();
          for (const p of grupo) hechos.add(p.id);
        }
        return;
      }
      if (e.tipo === 'viga' && o.x > 0.35) {
        if (o.x <= 0.35 + 0.35 * v) {
          s.rodar();
          hechos.add(o.id);
        }
        return;
      }
      if (e.tipo === 'contenedor' && o.x > 0.3 && deMiCarril(e.carril)) {
        if (o.x <= 0.3 + 0.1 * v) {
          s.saltar();
          hechos.add(o.id);
        }
        return;
      }
      if (e.tipo === 'foso' && o.x > 0) {
        if (o.x <= 0.15 * v) {
          s.saltar();
          hechos.add(o.id);
        }
        return;
      }
      if (e.tipo === 'dron' && e.carril === s.carril && o.x > 0.6 && !s.armado) {
        if (o.x <= 0.6 + 0.35 * v) {
          s.rodar();
          hechos.add(o.id);
        }
        return;
      }
    }
  };
}

test('el tramo se puede pasar: un piloto lo juega a la velocidad real sin perder vidas', () => {
  const s = crearSimulacion(TIERRA_BALDIA_1);
  const decidir = crearPiloto();
  const tipos: string[] = [];
  const malos: { tipo: string; en: number }[] = [];
  for (let i = 0; i < 60 * 90 && s.estado === 'corriendo'; i++) {
    decidir(s);
    for (const e of s.paso(DT)) {
      tipos.push(e.tipo);
      if (e.tipo === 'golpe' || e.tipo === 'foso' || e.tipo === 'escudo-roto') {
        malos.push({ tipo: e.tipo, en: Math.round(s.distancia * 10) / 10 });
      }
    }
  }
  expect(malos).toEqual([]);
  expect(s.estado).toBe('fin');
  expect(s.vidas).toBe(3);
  // Usó cada movimiento del tramo.
  for (const t of ['salto', 'rodar', 'caida-rapida', 'trepar', 'agarre', 'soltar', 'carril', 'arma', 'disparo', 'dron', 'emp']) {
    expect(tipos, t).toContain(t);
  }
});
