/** Tope de dt por cuadro: si el celular se traba, el juego no da saltos grandes. */
export const DT_MAX = 0.05;

const PASO_FIJO = 1 / 60;

export interface Bucle {
  iniciar(): void;
  detener(): void;
  /** Tiempo simulado para las pruebas: pasos fijos de 1/60 s. */
  avanzar(segundos: number): void;
  readonly corriendo: boolean;
}

export function crearBucle(paso: (dt: number, t: number) => void): Bucle {
  let t = 0;
  let corriendo = false;
  let pedido = 0;
  let ultimo = 0;

  const cuadro = (ahora: number) => {
    if (!corriendo) return;
    const dt = Math.min(DT_MAX, Math.max(0, (ahora - ultimo) / 1000));
    ultimo = ahora;
    t += dt;
    paso(dt, t);
    pedido = requestAnimationFrame(cuadro);
  };

  return {
    iniciar() {
      if (corriendo) return;
      corriendo = true;
      ultimo = performance.now();
      pedido = requestAnimationFrame(cuadro);
    },
    detener() {
      corriendo = false;
      cancelAnimationFrame(pedido);
    },
    avanzar(segundos: number) {
      const pasos = Math.round(segundos * 60);
      for (let i = 0; i < pasos; i++) {
        t += PASO_FIJO;
        paso(PASO_FIJO, t);
      }
    },
    get corriendo() {
      return corriendo;
    },
  };
}
