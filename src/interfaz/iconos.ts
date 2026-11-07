/**
 * Íconos de Tabler Icons v3.19.0 (outline), licencia MIT: https://tabler.io/icons
 * Toman el color del texto (currentColor) y el tamaño de la letra (1em).
 */
const svg = (trazos: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazos}</svg>`;

export const ICONOS = {
  candado: svg(
    '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"/><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"/><path d="M8 11v-4a4 4 0 1 1 8 0v4"/>',
  ),
  check: svg('<path d="M5 12l5 5l10 -10"/>'),
  flechaDerecha: svg('<path d="M5 12l14 0"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/>'),
  flechaIzquierda: svg('<path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/>'),
  girar: svg(
    '<path d="M3 6m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M20 11v2"/><path d="M7 12h-.01"/>',
  ),
} as const satisfies Record<'candado' | 'check' | 'flechaDerecha' | 'flechaIzquierda' | 'girar', string>;
