// Arranque de NEXO. Cada tarea de la etapa 1 conecta aquí sus piezas.
import './interfaz/tokens.css';
import './interfaz/base.css';
import './interfaz/componentes.css';

import { Color, PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { crearBucle } from './nucleo/bucle';
import { leerParametros } from './nucleo/preferencias';
import { instalarModoPrueba } from './nucleo/modo-prueba';
import { CALIDADES, elegirCalidad } from './render/calidad';
import { crearRenderizador, ErrorSinWebGL, observarTamano, vigilarContexto } from './render/renderizador';
import { crearMedidor } from './render/medidor';
import { crearVeloSistema } from './interfaz/velo-sistema';
import { TEXTOS } from './textos/es';

function arrancar(): void {
  const parametros = leerParametros(location.search);
  const calidad = CALIDADES[elegirCalidad(parametros.calidad)];
  const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
  const velo = crearVeloSistema(document.body);

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

  // Escena provisional: la Tierra baldía llega en la Tarea 6.
  const escena = new Scene();
  escena.background = new Color(0xc9a47e);
  const camara = new PerspectiveCamera(42, 2, 0.1, 2200);

  observarTamano(renderer, (ancho, alto) => {
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  });

  const medidor = parametros.fps ? crearMedidor(renderer, document.body) : null;
  const bucle = crearBucle((dt) => {
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
      render: () => ({ llamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles }),
    });
  }
}

arrancar();
