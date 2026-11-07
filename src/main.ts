// Arranque de NEXO. Cada tarea de la etapa 1 conecta aquí sus piezas.
import './interfaz/tokens.css';
import './interfaz/base.css';
import './interfaz/componentes.css';

import { PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { crearAzar } from './nucleo/azar';
import { crearBucle } from './nucleo/bucle';
import { crearTierraBaldia } from './mundo/tierra-baldia';
import { leerParametros, movimientoReducido } from './nucleo/preferencias';
import { crearCamaraMenu } from './camara/camara-menu';
import { instalarModoPrueba } from './nucleo/modo-prueba';
import { CALIDADES, elegirCalidad } from './render/calidad';
import { crearRenderizador, ErrorSinWebGL, observarTamano, vigilarContexto } from './render/renderizador';
import { crearMedidor } from './render/medidor';
import { crearVeloSistema } from './interfaz/velo-sistema';
import { crearGestorPantallas } from './interfaz/gestor-pantallas';
import { crearAvisos } from './interfaz/aviso';
import { crearAvisoGirar } from './interfaz/girar';
import { pedirConfirmacion } from './interfaz/confirmacion';
import { crearPantallaInicio } from './interfaz/pantallas/inicio';
import { almacenLocal } from './guardado/almacen';
import { cargarProgreso, guardarProgreso, progresoInicial, tieneAvance } from './guardado/progreso';
import { TEXTOS } from './textos/es';

/** Semilla del mundo: sale igual en cada arranque. */
const SEMILLA_MUNDO = 20261106;
/** Lo que dura cada mitad del cambio de pantalla (igual a --d-pantalla en tokens.css). */
const DURACION_PANTALLA_MS = 280;

function arrancar(): void {
  const parametros = leerParametros(location.search);
  const calidad = CALIDADES[elegirCalidad(parametros.calidad)];
  const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
  const capa = document.getElementById('capa') as HTMLElement;
  const velo = crearVeloSistema(document.body);
  crearAvisoGirar(document.body);

  let renderer: WebGLRenderer;
  try {
    renderer = crearRenderizador(lienzo, calidad);
  } catch (e) {
    if (e instanceof ErrorSinWebGL) {
      velo.mostrar(TEXTOS.sistema.sinWebgl);
      return;
    }
    throw e;
  }

  const escena = new Scene();
  const mundo = crearTierraBaldia(escena, calidad, crearAzar(SEMILLA_MUNDO));
  // Hasta la Tarea 12 los pasos corren seguidos; después los reparte la pantalla de carga.
  for (const paso of mundo.pasos) paso.correr();
  const camara = new PerspectiveCamera(42, 2, 0.1, 2200);
  const camaraMenu = crearCamaraMenu(camara, { movimientoReducido });
  camaraMenu.irA('inicio', true);

  observarTamano(renderer, (ancho, alto) => {
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  });

  // Progreso guardado en este dispositivo.
  const almacen = almacenLocal();
  let estado = cargarProgreso(almacen, Date.now());

  const avisos = crearAvisos(capa);
  const gestor = crearGestorPantallas(capa, {
    camara: camaraMenu,
    historial: history,
    ventana: window,
    duracionMs: DURACION_PANTALLA_MS,
  });

  // En esta tarea "Continuar" todavía no lleva a ningún lado; la Tarea 11 abre el mapa de la torre.
  const alContinuar = () => avisos.mostrar(TEXTOS.pronto);

  const inicio = crearPantallaInicio({
    estado: () => estado,
    ahora: () => Date.now(),
    alContinuar,
    async alNuevaPartida() {
      if (estado.existia && tieneAvance(estado.progreso)) {
        const seguir = await pedirConfirmacion(capa, TEXTOS.confirmarNueva);
        if (!seguir) return;
      }
      const ahora = Date.now();
      const progreso = progresoInicial(ahora);
      guardarProgreso(almacen, progreso, ahora);
      estado = { progreso, existia: true };
      inicio.refrescar();
      alContinuar();
    },
    avisos,
  });
  const refrescables = [inicio];

  gestor.registrar(inicio);
  gestor.ir('inicio', { instantaneo: true });
  history.replaceState({ pantalla: 'inicio' }, '');

  const medidor = parametros.fps ? crearMedidor(renderer, document.body) : null;
  const bucle = crearBucle((dt, t) => {
    camaraMenu.actualizar(dt, t);
    mundo.actualizar(dt, t);
    renderer.render(escena, camara);
    medidor?.actualizar(dt);
  });

  vigilarContexto(
    lienzo,
    () => {
      bucle.detener();
      velo.mostrar(TEXTOS.sistema.recuperando);
    },
    () => {
      velo.ocultar();
      bucle.iniciar();
    },
  );
  bucle.iniciar();

  if (parametros.prueba) {
    instalarModoPrueba({
      avanzar: (segundos) => bucle.avanzar(segundos),
      camara: () => camaraMenu.estado(),
      render: () => ({ llamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles }),
      pantalla: () => gestor.actual(),
      ir: (id) => gestor.ir(id),
      progreso(cambios) {
        if (cambios) {
          const progreso = { ...estado.progreso, ...cambios };
          guardarProgreso(almacen, progreso, progreso.guardadoEn);
          estado = { progreso, existia: true };
          for (const p of refrescables) p.refrescar();
        }
        return estado.progreso;
      },
    });
  }
}

arrancar();
