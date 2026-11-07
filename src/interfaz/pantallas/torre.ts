import { PISOS, type IdPiso } from '../../datos/pisos';
import { estadoDePiso, registrosDePiso, type Progreso } from '../../guardado/progreso';
import { TEXTOS } from '../../textos/es';
import { formatearPuntaje } from '../../textos/formato';
import type { Pantalla } from '../gestor-pantallas';
import { ICONOS } from '../iconos';
import { crearListaMenu, type ListaMenu } from '../lista-menu';

interface Dependencias {
  estado: () => { progreso: Progreso };
  avisos: { mostrar(t: string): void };
  alEntrarPortal(id: IdPiso): void;
  /** Índice del piso en PISOS (0 = abajo), o null al salir del mapa. */
  alResaltar(indice: number | null): void;
  alVolver(): void;
}

/** Las filas van de arriba hacia abajo, como se ve la torre: la fila r es el piso PISOS[ULTIMO - r]. */
const ULTIMO = PISOS.length - 1;
const pisoDeFila = (fila: number) => ULTIMO - fila;

/** El mapa de la torre: los cinco pisos a la izquierda, la tarjeta del elegido abajo a la derecha. */
export function crearPantallaTorre(deps: Dependencias): Pantalla & { refrescar(): void } {
  const t = TEXTOS.torre;
  const elemento = document.createElement('section');
  elemento.className = 'pantalla pantalla-torre';
  elemento.innerHTML = `
    <div class="velo-torre"></div>
    <nav class="panel lista-pisos"><div class="etiqueta"></div><div class="filas"></div></nav>
    <div class="panel tarjeta-piso">
      <div class="etiqueta"></div>
      <h2 class="titulo"></h2>
      <div class="detalle"><div data-dato="jefe"></div><div data-dato="registros"></div><div data-dato="record"></div></div>
      <button type="button" class="cta"><span></span>${ICONOS.flechaDerecha}</button>
    </div>
    <button type="button" class="boton-volver">${ICONOS.flechaIzquierda}<span></span></button>`;
  const q = <T extends HTMLElement>(s: string) => elemento.querySelector<T>(s)!;
  const lista = q('.lista-pisos');
  lista.setAttribute('aria-label', t.titulo);
  q('.lista-pisos > .etiqueta').textContent = t.titulo;
  const filas = q('.filas');
  const tarjeta = q('.tarjeta-piso');
  q('.cta > span').textContent = t.entrar;
  q('.boton-volver > span').textContent = t.volver;
  elemento.querySelectorAll('svg').forEach((s) => s.setAttribute('aria-hidden', 'true'));

  let menu: ListaMenu | null = null;
  let elegido = 0;
  let dentro = false;

  const mostrarPiso = (indice: number) => {
    elegido = indice;
    const piso = PISOS[indice];
    const { progreso } = deps.estado();
    const record = progreso.records[piso.id];
    tarjeta.querySelector('.etiqueta')!.textContent = `${t.piso} ${piso.numero} · ${t.dimension}`;
    tarjeta.querySelector('.titulo')!.textContent = piso.nombre;
    const dato = (d: string) => tarjeta.querySelector(`[data-dato="${d}"]`)!;
    dato('jefe').textContent = `${t.jefe}: ${piso.jefe ?? t.jefeDesconocido}`;
    dato('registros').textContent = `${t.registros}: ${registrosDePiso(progreso, piso.id)} ${t.de} ${piso.registros}`;
    dato('record').textContent = `${t.record}: ${record === undefined ? t.sinRecord : formatearPuntaje(record)}`;
    if (dentro) deps.alResaltar(indice);
  };

  const icono = (estado: ReturnType<typeof estadoDePiso>) => {
    if (estado === 'sellado') return ICONOS.candado;
    if (estado === 'completado') return ICONOS.check;
    return '<span class="marca" aria-hidden="true"></span>';
  };

  const alActivar = (fila: number, origen: 'toque' | 'tecla') => {
    const piso = PISOS[pisoDeFila(fila)];
    if (estadoDePiso(deps.estado().progreso, piso.id) === 'sellado') {
      deps.avisos.mostrar(piso.disponible ? t.sellado : t.proximoCapitulo);
    } else if (origen === 'tecla') {
      deps.alEntrarPortal(piso.id);
    }
  };

  const refrescar = () => {
    const { progreso } = deps.estado();
    const botones = [...PISOS].reverse().map((piso) => {
      const estado = estadoDePiso(progreso, piso.id);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = estado === 'sellado' ? 'fila sellada' : 'fila';
      if (estado === 'sellado') b.setAttribute('aria-disabled', 'true');
      b.innerHTML = `${icono(estado)}<span></span><span class="pista"></span>`;
      b.querySelector('svg')?.setAttribute('aria-hidden', 'true');
      const [nombre, pista] = b.querySelectorAll<HTMLElement>('span:not(.marca)');
      nombre.textContent = piso.nombre;
      pista.textContent = t.estados[estado];
      return b;
    });
    menu?.destruir();
    filas.replaceChildren(...botones);
    const filaActual = ULTIMO - PISOS.findIndex((p) => p.id === progreso.pisoActual);
    menu = crearListaMenu(filas, {
      selector: '.fila',
      inicial: filaActual,
      alActivar,
      alCambiar: (fila) => mostrarPiso(pisoDeFila(fila)),
    });
    mostrarPiso(pisoDeFila(menu.activo()));
  };

  q('.cta').addEventListener('click', () => deps.alEntrarPortal(PISOS[elegido].id));
  q('.boton-volver').addEventListener('click', () => deps.alVolver());

  refrescar();

  return {
    id: 'torre',
    toma: 'torre',
    elemento,
    refrescar,
    alEntrar() {
      dentro = true;
      refrescar();
    },
    alSalir() {
      dentro = false;
      deps.alResaltar(null);
    },
    alTecla: (e) => menu?.teclado(e) ?? false,
  };
}
