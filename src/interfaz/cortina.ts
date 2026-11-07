/**
 * Fundido a negro a pantalla completa para cambiar de escena (del menú a la carrera y de vuelta).
 * El CSS lo hace en --d-pantalla, o de golpe con movimiento reducido. Mientras tapa, no deja tocar
 * lo de abajo: un toque en medio del cambio no llega a ninguna pantalla.
 */
export function crearCortina(contenedor: HTMLElement): { cubrir(): void; descubrir(): void; cubierta(): boolean } {
  const el = document.createElement('div');
  el.className = 'cortina';
  el.setAttribute('aria-hidden', 'true');
  contenedor.append(el);
  return {
    cubrir: () => el.classList.add('cubierta'),
    descubrir: () => el.classList.remove('cubierta'),
    cubierta: () => el.classList.contains('cubierta'),
  };
}
