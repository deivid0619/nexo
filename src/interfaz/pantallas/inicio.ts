import { pisoPorId, TOTAL_REGISTROS } from '../../datos/pisos';
import type { Progreso } from '../../guardado/progreso';
import { TEXTOS } from '../../textos/es';
import { tiempoRelativo } from '../../textos/formato';
import type { Pantalla } from '../gestor-pantallas';
import { crearListaMenu, type ListaMenu } from '../lista-menu';

interface Dependencias {
  estado: () => { progreso: Progreso; existia: boolean };
  ahora: () => number;
  alContinuar(): void;
  alNuevaPartida(): void;
  avisos: { mostrar(t: string): void };
}

type Opcion = 'continuar' | 'nueva' | 'registros' | 'ajustes';

/** La pantalla de inicio: el sobreviviente mira la torre y el menú espera abajo a la izquierda. */
export function crearPantallaInicio(deps: Dependencias): Pantalla & { refrescar(): void } {
  const elemento = document.createElement('section');
  elemento.className = 'pantalla pantalla-inicio';
  elemento.innerHTML = `
    <div class="velo-inicio"></div>
    <header class="inicio-marca">
      <h1 class="logo"></h1>
      <div class="etiqueta"></div>
    </header>
    <nav class="menu inicio-menu"></nav>
    <div class="etiqueta inicio-guardado"></div>`;
  const q = <T extends HTMLElement>(s: string) => elemento.querySelector<T>(s)!;
  q('.logo').textContent = TEXTOS.juego.nombre;
  q('.inicio-marca .etiqueta').textContent = TEXTOS.juego.capitulo;
  const menu = q('.inicio-menu');
  menu.setAttribute('aria-label', TEXTOS.inicio.menu);
  const guardado = q('.inicio-guardado');

  let lista: ListaMenu | null = null;
  let opciones: Opcion[] = [];

  const activar = (opcion: Opcion) => {
    if (opcion === 'continuar') deps.alContinuar();
    else if (opcion === 'nueva') deps.alNuevaPartida();
    else deps.avisos.mostrar(TEXTOS.pronto);
  };

  const opcionHtml = (opcion: Opcion, texto: string, pista?: string) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'item';
    boton.dataset.opcion = opcion;
    const marca = document.createElement('span');
    marca.className = 'marca';
    marca.setAttribute('aria-hidden', 'true');
    boton.append(marca, texto);
    if (pista !== undefined) {
      const p = document.createElement('span');
      p.className = 'pista';
      p.textContent = pista;
      boton.append(p);
    }
    return boton;
  };

  const refrescar = () => {
    const { progreso, existia } = deps.estado();
    const t = TEXTOS.inicio;
    const botones: HTMLButtonElement[] = [];
    if (existia) botones.push(opcionHtml('continuar', t.continuar, pisoPorId(progreso.pisoActual).nombre));
    botones.push(
      opcionHtml('nueva', t.nuevaPartida),
      opcionHtml('registros', t.registros, `${progreso.registros.length} / ${TOTAL_REGISTROS}`),
      opcionHtml('ajustes', t.ajustes),
    );
    opciones = botones.map((b) => b.dataset.opcion as Opcion);
    lista?.destruir();
    menu.replaceChildren(...botones);
    lista = crearListaMenu(menu, { selector: '.item', alActivar: (i) => activar(opciones[i]) });

    guardado.hidden = !existia;
    guardado.textContent = existia ? `${t.ultimoGuardado} · ${tiempoRelativo(progreso.guardadoEn, deps.ahora())}` : '';
  };

  refrescar();

  return {
    id: 'inicio',
    toma: 'inicio',
    elemento,
    refrescar,
    alEntrar: refrescar,
    alTecla: (e) => lista?.teclado(e) ?? false,
  };
}
