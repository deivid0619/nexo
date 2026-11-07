// Arranque de NEXO. Cada etapa conecta aquí sus piezas.
import './interfaz/tokens.css';
import './interfaz/base.css';
import './interfaz/componentes.css';

import { PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { crearAzar } from './nucleo/azar';
import { crearBucle } from './nucleo/bucle';
import { crearTierraBaldia } from './mundo/tierra-baldia';
import { leerParametros, movimientoReducido } from './nucleo/preferencias';
import { crearCamaraMenu } from './camara/camara-menu';
import { crearCamaraJuego } from './camara/camara-juego';
import { crearPista } from './mundo/tierra-baldia/pista';
import { TIERRA_BALDIA } from './mundo/paletas';
import { cargarCorredor, type Corredor } from './entidades/corredor';
import { crearControles } from './entrada/controles';
import { crearCarrera, type Carrera } from './juego/carrera';
import { TIERRA_BALDIA_1 } from './datos/niveles/tierra-baldia-1';
import type { IdPiso } from './datos/pisos';
import { instalarModoPrueba, type EstadoCarga } from './nucleo/modo-prueba';
import { CALIDADES, elegirCalidad } from './render/calidad';
import { crearRenderizador, ErrorSinWebGL, observarTamano, vigilarContexto } from './render/renderizador';
import { crearMedidor } from './render/medidor';
import { crearVeloSistema } from './interfaz/velo-sistema';
import { crearGestorPantallas } from './interfaz/gestor-pantallas';
import { crearAvisos } from './interfaz/aviso';
import { crearAvisoGirar } from './interfaz/girar';
import { pedirConfirmacion } from './interfaz/confirmacion';
import { crearPantallaCarga } from './interfaz/pantallas/carga';
import { crearPantallaInicio } from './interfaz/pantallas/inicio';
import { crearPantallaTorre } from './interfaz/pantallas/torre';
import { crearPantallaJuego } from './interfaz/pantallas/juego';
import { crearCortina } from './interfaz/cortina';
import { almacenLocal } from './guardado/almacen';
import { cargarProgreso, guardarProgreso, progresoInicial, tieneAvance } from './guardado/progreso';
import { CARGA_MINIMA_MS, completarMinimo, ejecutarTareas, type Tarea } from './carga/cargador';
import { TEXTOS } from './textos/es';

/** Semilla del mundo: sale igual en cada arranque. */
const SEMILLA_MUNDO = 20261106;
/** Semilla del decorado de la carrera (otra, para que sus ruinas no copien las del menú). */
const SEMILLA_PISTA = 20261107;
/** El corredor CC0 (Quaternius), servido desde public/. */
const URL_CORREDOR = './modelos/corredor.glb';
/** El piso de la carrera de esta etapa: su récord se guarda en el progreso. */
const PISO_CARRERA: IdPiso = 'tierra';
/** Lo que dura cada mitad del cambio de pantalla (igual a --d-pantalla en tokens.css). */
const DURACION_PANTALLA_MS = 280;
/** Si las fuentes tardan más que esto, la carga sale igual con las del sistema. */
const ESPERA_FUENTES_MS = 2000;
/** Marca de ?fallarCarga=1: la carga falla solo la primera vez, para probar "Reintentar". */
const CLAVE_FALLO_HECHO = 'nexo.fallo-hecho';
/** Las caras que usa la interfaz (tokens.css): se piden antes de mostrar la carga. */
const FUENTES = ['700 1em Syncopate', '500 1em Barlow', '600 1em Barlow', '600 1em "Barlow Condensed"'];

const esperar = (ms: number) => new Promise<void>((listo) => setTimeout(listo, ms));

/** Un cuadro para que la barra alcance a pintarse; con la pestaña oculta no hay cuadros, así que hay un tope. */
function esperarCuadro(): Promise<void> {
  return new Promise((listo) => {
    const tope = setTimeout(listo, 100);
    requestAnimationFrame(() => {
      clearTimeout(tope);
      listo();
    });
  });
}

/** Pide las fuentes de la interfaz; `fonts.ready` solo no basta porque nada las ha usado todavía. */
async function esperarFuentes(): Promise<void> {
  if (!document.fonts) return;
  const cargar = Promise.all(FUENTES.map((f) => document.fonts.load(f))).catch(() => undefined);
  await Promise.race([cargar.then(() => document.fonts.ready), esperar(ESPERA_FUENTES_MS)]);
}

/** Con ?prueba=1&fallarCarga=1 el paso `ruinas` falla una vez por sesión de la pestaña. */
function conFalloDePrueba(pasos: Tarea[]): Tarea[] {
  const yaFallo = () => {
    try {
      return sessionStorage.getItem(CLAVE_FALLO_HECHO) === '1';
    } catch {
      return true;
    }
  };
  return pasos.map((paso) =>
    paso.nombre !== 'ruinas'
      ? paso
      : {
          ...paso,
          correr() {
            if (!yaFallo()) {
              try {
                sessionStorage.setItem(CLAVE_FALLO_HECHO, '1');
              } catch {
                // Sin almacenamiento la marca no queda, pero el reintento tampoco fallaría de nuevo.
              }
              throw new Error('Fallo de prueba (?fallarCarga=1)');
            }
            return paso.correr();
          },
        },
  );
}

async function arrancar(): Promise<void> {
  const parametros = leerParametros(location.search);
  const calidad = CALIDADES[elegirCalidad(parametros.calidad)];
  const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
  const capa = document.getElementById('capa') as HTMLElement;
  const velo = crearVeloSistema(document.body);
  const girar = crearAvisoGirar(document.body);
  const cortina = crearCortina(document.body);

  // 1. Las fuentes primero, para que la carga no cambie de letra a la vista.
  await esperarFuentes();

  // 2. El renderizador; sin WebGL no hay juego.
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
  const camara = new PerspectiveCamera(42, 2, 0.1, 2200);
  const camaraMenu = crearCamaraMenu(camara, { movimientoReducido });

  // La carrera: otra escena y otra cámara con el mismo renderizador.
  const pista = crearPista(calidad, crearAzar(SEMILLA_PISTA));
  const camaraCarrera = new PerspectiveCamera(62, 2, 0.1, 2200);
  const camaraJuego = crearCamaraJuego(camaraCarrera, { movimientoReducido: movimientoReducido() });
  let aspecto = 2;

  observarTamano(renderer, (ancho, alto) => {
    aspecto = ancho / alto;
    camara.aspect = aspecto;
    camara.updateProjectionMatrix();
    camaraCarrera.aspect = aspecto;
    camaraCarrera.updateProjectionMatrix();
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
    cortina,
  });

  const consejos = TEXTOS.carga.consejos;
  const carga = crearPantallaCarga({
    frase: TEXTOS.carga.fraseInicial,
    consejo: consejos[Math.floor(Math.random() * consejos.length)],
    alReintentar: () => location.reload(),
  });

  // "Continuar" abre el mapa de la torre; queda en el historial para que "atrás" vuelva al inicio.
  const alContinuar = () => void gestor.ir('torre', { apilar: true });

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
  let resaltado: number | null = null;
  const torre = crearPantallaTorre({
    estado: () => estado,
    avisos,
    // Solo la Tierra baldía tiene carrera en esta etapa; los demás portales avisan.
    alEntrarPortal(id) {
      if (id === PISO_CARRERA) gestor.ir('juego', { apilar: true });
      else avisos.mostrar(TEXTOS.torre.portalPronto);
    },
    alResaltar(indice) {
      resaltado = indice;
      mundo.resaltarPiso(indice);
    },
    alVolver: () => gestor.atras(),
  });
  const refrescables = [inicio, torre];

  // La carrera se arma al terminar la carga (necesita el corredor); hasta entonces no hay portal.
  let carrera: Carrera | null = null;
  const juego = crearPantallaJuego({
    alAbrir() {
      carrera?.empezar();
      controles.activar();
    },
    alCerrar() {
      controles.desactivar();
      carrera?.detener();
    },
    alReintentar() {
      carrera?.empezar();
      controles.activar();
    },
    alVolver: () => gestor.atras(),
  });
  const controles = crearControles(juego.superficie, window, (i) => carrera?.accion(i));

  /** Guarda el puntaje si supera el récord del piso y repinta las pantallas. */
  function guardarRecord(puntaje: number): { record: number; nuevo: boolean } {
    const antes = estado.progreso.records[PISO_CARRERA];
    if (antes !== undefined && antes >= puntaje) return { record: antes, nuevo: false };
    const ahora = Date.now();
    const records = { ...estado.progreso.records, [PISO_CARRERA]: puntaje };
    const progreso = { ...estado.progreso, records, guardadoEn: ahora };
    guardarProgreso(almacen, progreso, ahora);
    estado = { progreso, existia: true };
    for (const p of refrescables) p.refrescar();
    return { record: puntaje, nuevo: true };
  }

  function armarCarrera(corredor: Corredor): Carrera {
    return crearCarrera({
      nivel: TIERRA_BALDIA_1,
      opciones: { desde: parametros.desde ?? undefined, sinDanio: parametros.dios },
      corredor,
      camara: camaraJuego,
      pista,
      hud: {
        reiniciar: () => juego.reiniciar(),
        actualizar: (d) => juego.actualizar(d),
        pista: (cual) => juego.pista(cual),
        terminar(r) {
          controles.desactivar();
          juego.terminar(r);
        },
      },
      avisos,
      vibrar(ms) {
        // Sin un toque o una tecla antes, Chrome bloquea la vibración y lo anota como error en la consola.
        if ('vibrate' in navigator && navigator.userActivation?.hasBeenActive) navigator.vibrate(ms);
      },
      guardarRecord,
    });
  }

  // 3. La carga en pantalla, con la cámara en su toma y la escena todavía oculta (opacidad 0 en base.css).
  gestor.registrar(carga);
  gestor.registrar(inicio);
  gestor.registrar(torre);
  gestor.registrar(juego);
  gestor.ir('carga', { instantaneo: true });
  const inicioCarga = performance.now();

  const medidor = parametros.fps ? crearMedidor(renderer, document.body) : null;
  /** Dibuja la escena activa: la de la carrera o la del menú. */
  const dibujar = () =>
    carrera?.activa() ? renderer.render(pista.escena, camaraCarrera) : renderer.render(escena, camara);
  /** avanzar() del modo de prueba lo apaga para dibujar solo el último de sus pasos. */
  let dibujarCadaPaso = true;
  const bucle = crearBucle((dt, t) => {
    if (carrera?.activa()) {
      // Pestaña oculta o celular en vertical: la carrera espera. Se lee antes de tocar el HUD.
      const enPausa = document.visibilityState === 'hidden' || girar.visible();
      if (!enPausa) carrera.paso(dt, t, aspecto);
    } else {
      camaraMenu.actualizar(dt, t);
      mundo.actualizar(dt, t);
    }
    if (dibujarCadaPaso) dibujar();
    medidor?.actualizar(dt);
  });
  let revelado = false;
  /** Con ?prueba=1 las pruebas pueden detener el tiempo real (reloj(false)). */
  let relojActivo = true;

  vigilarContexto(
    lienzo,
    () => {
      bucle.detener();
      velo.mostrar(TEXTOS.sistema.recuperando);
    },
    () => {
      velo.ocultar();
      if (revelado && relojActivo) bucle.iniciar();
    },
  );

  const registroCarga: EstadoCarga = { estado: 'cargando', fracciones: [], duracionMs: 0 };

  if (parametros.prueba) {
    instalarModoPrueba({
      // Cientos de cuadros dibujados de golpe dejan la página sin pintar durante segundos
      // (WebGL por software en las pruebas): se simulan todos y se dibuja solo el último.
      avanzar(segundos) {
        dibujarCadaPaso = false;
        try {
          bucle.avanzar(segundos);
        } finally {
          dibujarCadaPaso = true;
        }
        dibujar();
      },
      camara: () => camaraMenu.estado(),
      render: () => ({ llamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles }),
      pantalla: () => gestor.actual(),
      ir: (id) => gestor.ir(id, { apilar: id === 'torre' || id === 'juego' }),
      resaltado: () => resaltado,
      enTransicion: () => gestor.enTransicion(),
      progreso(cambios) {
        if (cambios) {
          const progreso = { ...estado.progreso, ...cambios };
          guardarProgreso(almacen, progreso, progreso.guardadoEn);
          estado = { progreso, existia: true };
          for (const p of refrescables) p.refrescar();
        }
        return estado.progreso;
      },
      carga: () => ({ ...registroCarga, fracciones: [...registroCarga.fracciones] }),
      juego: () => carrera?.estado() ?? null,
      accion: (a) => carrera?.accion(a),
      reloj(activo) {
        relojActivo = activo;
        if (!activo) bucle.detener();
        else if (revelado) bucle.iniciar();
      },
    });
  }

  // 4. Construir el mundo y la carrera, compilar los sombreadores y dibujar el primer cuadro, con avance real.
  let corredor: Corredor | null = null;
  const tareas: Tarea[] = [
    ...(parametros.fallarCarga ? conFalloDePrueba(mundo.pasos) : mundo.pasos),
    ...pista.pasos,
    {
      nombre: 'corredor',
      peso: 3,
      async correr() {
        corredor = await cargarCorredor(URL_CORREDOR, TIERRA_BALDIA);
        pista.escena.add(corredor.grupo);
      },
    },
    {
      nombre: 'sombreadores',
      peso: 5,
      async correr() {
        await renderer.compileAsync(escena, camara);
        await renderer.compileAsync(pista.escena, camaraCarrera);
      },
    },
    { nombre: 'primer-cuadro', peso: 1, correr: () => renderer.render(escena, camara) },
  ];
  try {
    await ejecutarTareas(
      tareas,
      (fraccion) => {
        registroCarga.fracciones.push(fraccion);
        carga.progreso(fraccion);
      },
      esperarCuadro,
    );
  } catch (e) {
    // 7. La carga se detiene y ofrece reintentar (recarga la página).
    console.error(e);
    registroCarga.estado = 'error';
    carga.error(TEXTOS.carga.error);
    return;
  }

  // 5. Un mínimo en pantalla para que la carga no parpadee.
  registroCarga.duracionMs = await completarMinimo(inicioCarga, CARGA_MINIMA_MS, () => performance.now(), esperar);
  registroCarga.estado = 'lista';
  carrera = armarCarrera(corredor!);

  // 6. Revelar: la escena aparece mientras la cámara viaja de la carga al inicio.
  revelado = true;
  lienzo.classList.add('revelado');
  if (relojActivo) bucle.iniciar();
  gestor.ir('inicio');
  history.replaceState({ pantalla: 'inicio' }, '');
}

void arrancar();
