import { test, expect } from 'vitest';
import { CALIDADES, elegirCalidad } from './calidad';

test('tabla de calidades', () => {
  expect(CALIDADES.alto).toEqual({ pixelRatioMax: 2, sombraTam: 4096, sombraSuave: true, polvo: 1600, antialias: true });
  expect(CALIDADES.medio).toEqual({ pixelRatioMax: 1.5, sombraTam: 2048, sombraSuave: true, polvo: 900, antialias: true });
  expect(CALIDADES.bajo).toEqual({ pixelRatioMax: 1, sombraTam: 1024, sombraSuave: false, polvo: 400, antialias: false });
});

test('elegirCalidad', () => {
  expect(elegirCalidad(null)).toBe('alto');
  expect(elegirCalidad('bajo')).toBe('bajo');
});
