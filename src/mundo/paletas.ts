/**
 * Colores del mundo 3D por dimensión. La interfaz usa tokens.css; el mundo usa esto.
 * Tierra baldía: sale de la maqueta aprobada (atardecer con polvo, la torre es la única luz artificial).
 */
export interface PaletaExterior {
  niebla: string;
  nieblaCerca: number;
  nieblaLejos: number;
  cieloArriba: string;
  sol: string;
  dirSol: [number, number, number];
  hemiCielo: string;
  hemiSuelo: string;
  luzSol: string;
  arenaClara: string;
  arenaOscura: string;
  roca: string;
  asfalto: string;
  marcas: string;
  fachada: string;
  tintes: readonly string[];
  escombros: string;
  postes: string;
  carroceria: string;
  vidrio: string;
  metal: string;
  hueco: string;
  escotilla: string;
  abrigo: string;
  pantalon: string;
  mochila: string;
  piel: string;
  torreMetal: string;
  torreLuz: string;
  torreResalte: string;
  haz: string;
  brillo: string;
  polvo: string;
}

export const TIERRA_BALDIA: PaletaExterior = {
  niebla: '#C9A47E',
  nieblaCerca: 30,
  nieblaLejos: 520,
  cieloArriba: '#617080',
  sol: '#FFE2B8',
  dirSol: [-0.55, 0.16, -0.8],
  hemiCielo: '#C3CAD2',
  hemiSuelo: '#6E5843',
  luzSol: '#FFD2A0',
  arenaClara: '#A68C69',
  arenaOscura: '#7A6650',
  roca: '#5C544B',
  asfalto: '#4F4842',
  marcas: '#8E877C',
  fachada: '#8F877B',
  tintes: ['#DCD3C6', '#CBB9A4', '#BCB3A8', '#D0B69A', '#C4BDB2'],
  escombros: '#6B6157',
  postes: '#3D352D',
  carroceria: '#6E4B35',
  vidrio: '#1D1C1B',
  metal: '#4B4A46',
  hueco: '#2A1A0E',
  escotilla: '#FFB36B',
  abrigo: '#3B3631',
  pantalon: '#2C2925',
  mochila: '#4A4237',
  piel: '#8A6A52',
  torreMetal: '#2D3134',
  torreLuz: '#A6E8EC',
  torreResalte: '#DDFBFC',
  haz: '#C9F4F6',
  brillo: '#BFF2F4',
  polvo: '#EAD7BC',
};
