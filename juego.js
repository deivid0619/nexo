import * as THREE from 'three';

// ---------------------------------------------------------------------------
// NEXO: corredor futurista que pasa de 2D a 3D por portales.
// Un jugador. Dos niveles, cada uno termina con su jefe.
// Opciones para probar: ?desde=440 empieza en esa distancia, ?nivel=2, ?dios=1 sin daño.
// ---------------------------------------------------------------------------

const $ = id => document.getElementById(id);
const ui = {
  vidas: $('vidas'), puntos: $('puntos'), modo: $('modo'), aviso: $('aviso'), pista: $('pista'),
  jefe: $('jefe'), jefeNombre: $('jefe').querySelector('span'), jefeBarra: $('jefe-barra'),
  menu: $('menu'), menuRecord: $('menu-record'), fin: $('fin'), finTitulo: $('fin-titulo'), finTexto: $('fin-texto'),
};
const params = new URLSearchParams(location.search);
const MODO_DIOS = params.has('dios');
const SIN_SACUDIDA = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CLAVE_RECORD = 'nexo-record';
const fmt = n => Math.floor(n).toLocaleString('es-CO');

const COL = {
  fondo: 0x061a33, piso: 0x0b2f57, grid: 0x2fd4b0, grid2: 0x0f6e56,
  jugador: 0xffb22e, valla: 0xff4d5e, bloque: 0x8f7cff, portal: 0xb9a8ff,
  escudo: 0x3fe0c0, turbo: 0xffb22e, doble: 0xff7ab8, emp: 0x5cc8ff, dron: 0xff5d8f,
  torre: 0x534ab7, riel: 0x3fe0c0,
};
const COL_HAB = { esc: COL.escudo, tur: COL.turbo, dbl: COL.doble };

// ---------------- Niveles ----------------
// Cada evento ocurre a una distancia ("at") desde el inicio del nivel.
function armarNivel() {
  const L = [];
  const add = (at, t, o = {}) => L.push({ at, t, ...o });
  // Tramo 1: 2D
  add(20, 'bar'); add(30, 'bar'); add(38, 'pw', { k: 'dbl' }); add(46, 'bar', { h: 1.1 });
  add(56, 'bar'); add(58.5, 'bar'); add(68, 'bar', { h: 1.1 }); add(76, 'bar');
  add(85, 'portal', { to: 3 });
  // Tramo 2: 3D con carriles
  add(102, 'blk', { lane: -1 }); add(102, 'blk', { lane: 0 });
  add(112, 'pw', { k: 'esc', lane: 1 });
  add(122, 'blk', { lane: 1 }); add(122, 'blk', { lane: 0 });
  add(134, 'bar');
  add(146, 'blk', { lane: -1 }); add(146, 'blk', { lane: 1 });
  add(156, 'pw', { k: 'tur', lane: 0 });
  add(170, 'blk', { lane: 0 }); add(170, 'blk', { lane: 1 });
  add(180, 'bar');
  // Zona de combate
  add(195, 'arma');
  [0, -1, 1, 0, 1, -1, 0, 0, -1, 1].forEach((lane, i) => add(212 + i * 8, 'dron', { lane }));
  add(300, 'emp');
  // Tramo 3: 3D sin arma
  add(316, 'blk', { lane: 0 }); add(316, 'blk', { lane: 1 });
  add(328, 'bar');
  add(340, 'blk', { lane: -1 }); add(340, 'blk', { lane: 0 });
  add(350, 'pw', { k: 'dbl', lane: 1 });
  add(362, 'blk', { lane: 1 }); add(362, 'blk', { lane: -1 });
  add(375, 'portal', { to: 2 });
  // Tramo 4: 2D
  add(392, 'bar'); add(402, 'bar', { h: 1.1 }); add(412, 'bar'); add(414.5, 'bar');
  add(424, 'bar', { h: 1.1 }); add(430, 'pw', { k: 'esc' });
  add(440, 'portal', { to: 3, jefe: true });
  add(458, 'jefe');
  return L;
}
const NIVEL = armarNivel();

const JEFES = [
  { nombre: 'CENTINELA', color: 0x8f7cff, vida: 36, ataques: ['rayo', 'rayo', 'barrido'] },
  { nombre: 'HIDRA', color: 0xff5d8f, vida: 54, ataques: ['doble', 'barrido', 'drones', 'doble'] },
];

// ---------------- Escena ----------------
const lienzo = $('lienzo');
const R = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true });
R.setPixelRatio(Math.min(2, devicePixelRatio));
const S = new THREE.Scene();
S.background = new THREE.Color(COL.fondo);
S.fog = new THREE.Fog(COL.fondo, 30, 95);
const C = new THREE.PerspectiveCamera(18, 1, 0.1, 300);
S.add(new THREE.AmbientLight(0xffffff, 0.6));
const luz = new THREE.DirectionalLight(0xffffff, 0.8); luz.position.set(-3, 8, 6); S.add(luz);

const grid = new THREE.GridHelper(240, 120, COL.grid, COL.grid2);
grid.material.transparent = true; grid.material.opacity = 0.32; S.add(grid);
const piso = new THREE.Mesh(new THREE.PlaneGeometry(240, 5.4), new THREE.MeshBasicMaterial({ color: COL.piso, transparent: true, opacity: 0.65 }));
piso.rotation.x = -Math.PI / 2; piso.position.y = 0.01; S.add(piso);
const matCarril = new THREE.MeshBasicMaterial({ color: COL.grid, transparent: true, opacity: 0 });
[-0.8, 0.8].forEach(z => {
  const l = new THREE.Mesh(new THREE.PlaneGeometry(240, 0.05), matCarril);
  l.rotation.x = -Math.PI / 2; l.position.set(0, 0.02, z); S.add(l);
});
// Rieles luminosos a los lados de la pista
[-2.7, 2.7].forEach(z => {
  const r = new THREE.Mesh(new THREE.BoxGeometry(240, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: COL.riel }));
  r.position.set(0, 0.35, z); S.add(r);
});
// Estrellas
{
  const n = 500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 300;
    pos[i * 3 + 1] = 12 + Math.random() * 60;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 200 - 40;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  S.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbcd6f0, size: 0.5, fog: false })));
}

function neon(w, h, dp, col, op = 0.85) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, dp);
  g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COL.fondo, emissive: col, emissiveIntensity: 0.25, transparent: true, opacity: op })));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: col })));
  return g;
}

// Ciudad de fondo (paralaje). Las torres del lado de la cámara solo se ven en 3D.
const torres = [];
for (let i = 0; i < 28; i++) {
  const h = 4 + Math.random() * 14, lado = i % 2 ? -1 : 1;
  const m = neon(2.2, h, 2.2, COL.torre, 0.7);
  m.position.set(0, h / 2, lado * (15 + Math.random() * 10));
  const baliza = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: i % 3 ? COL.valla : COL.escudo }));
  baliza.position.y = h / 2 + 0.3; m.add(baliza);
  S.add(m); torres.push({ m, x: Math.random() * 160, lado });
}
// Anillos holográficos sobre la pista
const anillos = [];
for (let i = 0; i < 6; i++) {
  const a = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.04, 6, 48), new THREE.MeshBasicMaterial({ color: COL.portal, transparent: true, opacity: 0.35 }));
  a.rotation.y = Math.PI / 2; a.position.y = 2;
  S.add(a); anillos.push({ m: a, x: i * 30 });
}

// ---------------- Personaje ----------------
function mkCorredor() {
  const m = new THREE.MeshStandardMaterial({ color: COL.jugador, emissive: COL.jugador, emissiveIntensity: 0.35 });
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 0.42), m); torso.position.y = 1.15; g.add(torso);
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), m); cabeza.position.y = 1.68; g.add(cabeza);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.3), new THREE.MeshBasicMaterial({ color: COL.escudo }));
  visor.position.set(0.19, 1.7, 0); g.add(visor);
  const extremidad = (y, z, largo, grueso) => {
    const p = new THREE.Group(); p.position.set(0, y, z);
    const e = new THREE.Mesh(new THREE.BoxGeometry(grueso, largo, grueso), m); e.position.y = -largo / 2; p.add(e);
    g.add(p); return p;
  };
  g.piernas = [extremidad(0.84, 0.12, 0.8, 0.16), extremidad(0.84, -0.12, 0.8, 0.16)];
  g.brazos = [extremidad(1.42, 0.27, 0.6, 0.11), extremidad(1.42, -0.27, 0.6, 0.11)];
  const arma = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.45, 0.13), new THREE.MeshStandardMaterial({ color: COL.emp, emissive: COL.emp, emissiveIntensity: 0.7 }));
  arma.position.y = -0.72; g.brazos[0].add(arma); arma.visible = false;
  const escudo = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 10), new THREE.MeshBasicMaterial({ color: COL.escudo, wireframe: true, transparent: true, opacity: 0.6 }));
  escudo.position.y = 1.05; g.add(escudo); escudo.visible = false;
  g.mat = m; g.arma = arma; g.escudo = escudo;
  S.add(g); return g;
}
const yo = mkCorredor();

// ---------------- Objetos del nivel ----------------
function mkPortal(col) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.1, 12, 56), new THREE.MeshBasicMaterial({ color: col })));
  g.add(new THREE.Mesh(new THREE.CircleGeometry(2.25, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })));
  g.rotation.y = Math.PI / 2 - 0.55;
  return g;
}
function mkDron() {
  const g = neon(0.8, 0.25, 0.8, COL.dron);
  const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  ojo.position.set(-0.42, 0, 0); g.add(ojo);
  return g;
}
function mkEstacionArma(o) {
  const g = new THREE.Group();
  const panel = neon(0.1, 2.6, 5.2, COL.emp, 0.12); panel.position.y = 1.3; g.add(panel);
  const arma = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: COL.emp, emissive: COL.emp, emissiveIntensity: 0.9 }));
  arma.position.y = 1.4; g.add(arma); o.arma = arma;
  return g;
}
function mkEmp() {
  const g = new THREE.Group();
  for (let i = 0; i < 11; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.6, 0.04), new THREE.MeshBasicMaterial({ color: COL.emp, transparent: true }));
    l.position.set(0, 1.3, -2.5 + i * 0.5); g.add(l);
  }
  return g;
}

let objs = [], balas = [], parts = [];
const geoBala = new THREE.BoxGeometry(0.5, 0.08, 0.08);
const matBala = new THREE.MeshBasicMaterial({ color: COL.emp });
const geoParte = new THREE.BoxGeometry(0.14, 0.14, 0.14);

function liberar(obj) {
  S.remove(obj);
  obj.traverse(c => {
    if (c.geometry && c.geometry !== geoBala && c.geometry !== geoParte) c.geometry.dispose();
    if (c.material && c.material !== matBala && c.material !== matCarril) c.material.dispose();
  });
}

function crear(ev) {
  const o = { t: ev.t, x: ev.at + base - d, lane: ev.lane || 0, k: ev.k, h: ev.h || 0.7, to: ev.to, jefe: ev.jefe, vx: ev.vx || 0 };
  o.z = o.lane * 1.6;
  let m;
  switch (ev.t) {
    case 'bar': m = neon(0.22, o.h, 5.2, COL.valla); m.position.y = o.h / 2; o.z = 0; break;
    case 'blk': m = neon(1.1, 1.5, 1.1, COL.bloque); m.position.y = 0.75; break;
    case 'pw': m = new THREE.Mesh(new THREE.OctahedronGeometry(0.34), new THREE.MeshStandardMaterial({ color: COL_HAB[o.k], emissive: COL_HAB[o.k], emissiveIntensity: 0.9 })); m.position.y = 1.3; break;
    case 'dron': m = mkDron(); o.vx = 3; break;
    case 'portal': m = mkPortal(o.jefe ? COL.valla : COL.portal); m.position.y = 2.1; o.z = 0; break;
    case 'arma': m = mkEstacionArma(o); o.z = 0; break;
    case 'emp': m = mkEmp(); o.z = 0; break;
    default: m = new THREE.Group();
  }
  m.position.x = o.x; m.position.z = o.z;
  S.add(m); o.m = m; objs.push(o);
  return o;
}

function chispas(pos, col, n = 14, fuerza = 6) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geoParte, new THREE.MeshBasicMaterial({ color: col, transparent: true }));
    m.position.copy(pos); S.add(m);
    parts.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * fuerza, Math.random() * fuerza, (Math.random() - 0.5) * fuerza), vida: 0.7 });
  }
}

// ---------------- Sonido (sintetizado, sin archivos) ----------------
let AC = null;
function activarAudio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume();
}
function sonido(f, dur = 0.12, tipo = 'square', vol = 0.05, f2) {
  if (!AC) return;
  const t0 = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}

// ---------------- Estado ----------------
let estado = 'menu';
let d = 0, base = 0, sig = 0, nivel = 0, vel = 6, tiempo = 0;
let y = 0, vy = 0, lane = 0, rz = 0, fase = 0;
let modo = 2, k = 0, vidas = 3, inv = 0, escT = 0, turT = 0, dblT = 0, dblUsado = false;
let armado = false, cad = 0, bonus = 0, sacudida = 0, finT = 0, sigNivelT = 0;
let jefe = null;

const puntaje = () => Math.floor(d) + bonus;
const vidasUI = () => { ui.vidas.textContent = '♥'.repeat(Math.max(0, vidas)) + '♡'.repeat(Math.max(0, 3 - vidas)); };
let avisoT;
function aviso(t) {
  ui.aviso.textContent = t; ui.aviso.classList.add('ver');
  clearTimeout(avisoT); avisoT = setTimeout(() => ui.aviso.classList.remove('ver'), 1500);
}
function setModo(m) {
  modo = m; if (m === 2) lane = 0;
  ui.modo.textContent = m === 3 ? '3D' : '2D';
  aviso(m === 3 ? 'Portal: ahora en 3D' : 'Portal: de vuelta a 2D');
  sonido(300, 0.5, 'sine', 0.06, m === 3 ? 900 : 150);
}
function sacudir(v) { if (!SIN_SACUDIDA) sacudida = Math.max(sacudida, v); }

function limpiarNivel() {
  objs.forEach(o => liberar(o.m)); objs = [];
  balas.forEach(b => S.remove(b.m)); balas = [];
  if (jefe) { liberar(jefe.g); jefe = null; }
  ui.jefe.hidden = true;
}

function empezarNivel(n, desde = 0) {
  limpiarNivel();
  nivel = n; base = d - desde; sig = 0; armado = false; modo = 2; lane = 0;
  // Si se empieza a mitad de nivel (para pruebas), aplicar lo que ya habría pasado.
  while (sig < NIVEL.length && NIVEL[sig].at < desde) {
    const ev = NIVEL[sig++];
    if (ev.t === 'portal') modo = ev.to;
    if (ev.t === 'arma') armado = true;
    if (ev.t === 'emp') armado = false;
  }
  if (desde > 0) k = modo === 3 ? 1 : 0; // al pasar de nivel la cámara vuelve a 2D suavemente
  ui.modo.textContent = modo === 3 ? '3D' : '2D';
}

function reiniciar() {
  limpiarNivel();
  parts.forEach(p => { S.remove(p.m); p.m.material.dispose(); }); parts = [];
  d = 0; y = 0; vy = 0; rz = 0; vidas = 3; inv = 0; escT = 0; turT = 0; dblT = 0; dblUsado = false;
  cad = 0; bonus = 0; finT = 0; sigNivelT = 0; yo.rotation.z = 0;
  const nivelInicial = Math.min(JEFES.length - 1, Math.max(0, (+params.get('nivel') || 1) - 1));
  empezarNivel(nivelInicial, Math.max(0, +params.get('desde') || 0));
  vidasUI();
}

// ---------------- Acciones del jugador ----------------
function saltar() {
  if (estado !== 'jugando') return;
  if (y === 0) { vy = 8.5; sonido(520, 0.12, 'square', 0.04, 880); }
  else if (dblT > 0 && !dblUsado) {
    vy = 8; dblUsado = true; sonido(700, 0.12, 'square', 0.04, 1200);
    chispas(new THREE.Vector3(0, y, rz), COL.doble, 8, 3);
  }
}
function carril(dl) {
  if (estado !== 'jugando' || modo !== 3) return;
  const n = Math.max(-1, Math.min(1, lane + dl));
  if (n !== lane) { lane = n; sonido(330, 0.06, 'triangle', 0.03); }
}
const posNucleo = () => jefe.g.position.clone().add(new THREE.Vector3(-2.3, 0, 0));
function disparar() {
  if (estado !== 'jugando' || !armado || cad > 0) return;
  cad = 0.15;
  const m = new THREE.Mesh(geoBala, matBala);
  const p = new THREE.Vector3(0.7, y + 1.35, rz); m.position.copy(p);
  let v = new THREE.Vector3(40, 0, 0);
  if (jefe && jefe.fase === 'abierto') v = posNucleo().sub(p).normalize().multiplyScalar(40);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), v.clone().normalize());
  S.add(m); balas.push({ m, v, vida: 1.5 });
  sonido(900, 0.07, 'square', 0.03, 400);
}
function habilidad(kind) {
  bonus += 25; sonido(660, 0.15, 'triangle', 0.06, 1320);
  if (kind === 'esc') { escT = 10; aviso('Escudo'); }
  else if (kind === 'tur') { turT = 3; aviso('Turbo: rompes todo'); }
  else { dblT = 10; aviso('Doble salto'); }
}
function daño() {
  if (MODO_DIOS || inv > 0 || turT > 0) return;
  if (escT > 0) { escT = 0; inv = 0.8; aviso('El escudo te salvó'); sonido(300, 0.2, 'triangle', 0.08, 120); return; }
  vidas--; vidasUI(); inv = 1.4; sacudir(0.5);
  if (navigator.vibrate) navigator.vibrate(120);
  sonido(140, 0.3, 'sawtooth', 0.08, 60);
  chispas(new THREE.Vector3(0, y + 1.1, rz), COL.jugador, 16);
  if (vidas <= 0) terminar(false);
}
function romper(o, col) {
  o.muerto = true; bonus += 30;
  chispas(o.m.position.clone().setY(0.8), col, 18);
  sonido(200, 0.15, 'square', 0.05, 80);
}

// ---------------- Jefes ----------------
function mkJefe(cfg) {
  const g = new THREE.Group();
  const geo = new THREE.OctahedronGeometry(2.1);
  const cuerpo = new THREE.Group();
  cuerpo.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COL.fondo, emissive: cfg.color, emissiveIntensity: 0.3, transparent: true, opacity: 0.9 })));
  cuerpo.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: cfg.color })));
  g.add(cuerpo);
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.07, 8, 64), new THREE.MeshBasicMaterial({ color: COL.portal }));
  anillo.rotation.y = Math.PI / 2; g.add(anillo);
  if (cfg.nombre === 'HIDRA') { // segundo anillo y "cabezas" laterales
    const a2 = anillo.clone(); a2.material = anillo.material.clone(); a2.scale.setScalar(1.3); g.add(a2); g.userData.a2 = a2;
    [-1, 1].forEach(s => { const c = neon(1, 1, 1, cfg.color); c.position.set(0, 0.6, s * 3.4); g.add(c); });
  }
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 14), new THREE.MeshStandardMaterial({ color: COL.valla, emissive: COL.valla, emissiveIntensity: 0.6 }));
  nucleo.position.x = -2.3; g.add(nucleo);
  Object.assign(g.userData, { cuerpo, anillo, nucleo });
  g.position.set(45, 3.6, 0);
  return g;
}
function iniciarJefe() {
  const cfg = JEFES[nivel];
  jefe = { cfg, g: mkJefe(cfg), vida: cfg.vida, max: cfg.vida, fase: 'entrada', t: 0, prox: 1, i: 0 };
  S.add(jefe.g);
  ui.jefeNombre.textContent = cfg.nombre; ui.jefeBarra.style.width = '100%'; ui.jefe.hidden = false;
  armado = false;
  aviso(`Jefe: ${cfg.nombre}`); sonido(110, 0.8, 'sawtooth', 0.06, 55); sacudir(0.4);
}
function colorNucleo(c) { const n = jefe.g.userData.nucleo; n.material.color.setHex(c); n.material.emissive.setHex(c); }
function avisoCarril(l) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.3), new THREE.MeshBasicMaterial({ color: COL.valla, transparent: true, opacity: 0.4, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(8, 0.04, l * 1.6); S.add(m);
  objs.push({ t: 'aviso', fijo: true, vida: 0.9, lane: l, z: l * 1.6, m, x: 8 });
}
function rayo(l) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(26, 0.35, 0.35), new THREE.MeshBasicMaterial({ color: COL.valla }));
  m.position.set(8, 1.0, l * 1.6); S.add(m);
  objs.push({ t: 'rayo', fijo: true, vida: 0.3, z: l * 1.6, m, x: 8 });
  sacudir(0.15); sonido(90, 0.3, 'sawtooth', 0.07, 40);
}
function ataqueJefe() {
  const j = jefe, tipo = j.cfg.ataques[j.i++ % j.cfg.ataques.length];
  const lanes = [-1, 0, 1];
  if (tipo === 'rayo') {
    avisoCarril(Math.random() < 0.7 ? lane : lanes[Math.floor(Math.random() * 3)]);
    sonido(220, 0.5, 'sawtooth', 0.03, 440);
  } else if (tipo === 'doble') { // dos carriles, uno queda libre
    const libre = lanes[Math.floor(Math.random() * 3)];
    lanes.filter(l => l !== libre).forEach(avisoCarril);
    sonido(240, 0.5, 'sawtooth', 0.04, 480);
  } else if (tipo === 'barrido') {
    crear({ t: 'bar', at: d - base + j.g.position.x - 2, vx: 9 });
    sonido(160, 0.4, 'square', 0.03, 90);
  } else if (tipo === 'drones') {
    const hueco = lanes[Math.floor(Math.random() * 3)];
    lanes.filter(l => l !== hueco).forEach(l => crear({ t: 'dron', at: d - base + j.g.position.x - 3, lane: l }));
    sonido(500, 0.3, 'square', 0.03, 250);
  }
}
function golpeJefe() {
  const j = jefe; j.vida--; bonus += 20;
  chispas(posNucleo(), COL.escudo, 8, 5); sonido(1200, 0.06, 'square', 0.04, 600);
  ui.jefeBarra.style.width = (j.vida / j.max * 100) + '%';
  if (j.vida <= 0) derrotarJefe();
}
function derrotarJefe() {
  const p = jefe.g.position.clone();
  chispas(p, jefe.cfg.color, 40, 12); chispas(p, COL.turbo, 30, 10);
  liberar(jefe.g); jefe = null; armado = false; ui.jefe.hidden = true;
  objs.forEach(o => { if (o.t === 'aviso' || o.t === 'rayo' || o.vx) o.muerto = true; });
  bonus += 1500; sacudir(0.8);
  sonido(80, 1.2, 'sawtooth', 0.08, 30); setTimeout(() => sonido(660, 0.5, 'triangle', 0.07, 1320), 300);
  if (nivel + 1 < JEFES.length) { aviso('¡Jefe derrotado! Nivel 2'); sigNivelT = 2.5; }
  else { aviso('¡Derrotaste a todos los jefes!'); finT = 2; }
}
function actualizarJefe(dt) {
  const j = jefe, g = j.g, u = g.userData;
  j.t += dt;
  g.position.x += (17 - g.position.x) * Math.min(1, dt * 1.2);
  g.position.y = 3.6 + Math.sin(tiempo * 1.4) * 0.35;
  g.position.z = Math.sin(tiempo * 0.7) * 1.2;
  u.cuerpo.rotation.x += dt * 0.5; u.cuerpo.rotation.y += dt * 0.3;
  u.anillo.rotation.x += dt * 1.5;
  if (u.a2) u.a2.rotation.x -= dt * 1.1;
  if (estado !== 'jugando') return;
  if (j.fase === 'entrada') {
    if (g.position.x < 18) { j.fase = 'ataque'; j.t = 0; j.prox = 0.8; }
  } else if (j.fase === 'ataque') {
    j.prox -= dt;
    if (j.prox <= 0) { ataqueJefe(); j.prox = (nivel ? 1.5 : 1.7) - (1 - j.vida / j.max) * 0.8; }
    if (j.t > 6.5) {
      j.fase = 'abierto'; j.t = 0; armado = true; colorNucleo(COL.escudo);
      aviso('¡Punto débil abierto! Dispara'); sonido(440, 0.3, 'triangle', 0.06, 880);
    }
  } else if (j.fase === 'abierto') {
    u.nucleo.scale.setScalar(1 + Math.sin(tiempo * 10) * 0.12);
    if (j.t > 4) {
      j.fase = 'ataque'; j.t = 0; j.prox = 0.6; armado = false;
      u.nucleo.scale.setScalar(1); colorNucleo(COL.valla); aviso('Se cerró: esquiva');
    }
  }
}

// ---------------- Fin de partida ----------------
function terminar(gano) {
  if (estado !== 'jugando') return;
  estado = gano ? 'victoria' : 'derrota'; armado = false;
  const total = puntaje(), prev = +localStorage.getItem(CLAVE_RECORD) || 0, nuevo = total > prev;
  if (nuevo) localStorage.setItem(CLAVE_RECORD, total);
  if (!gano) { yo.rotation.z = 1.3; sonido(200, 0.6, 'sawtooth', 0.07, 50); }
  setTimeout(() => {
    ui.finTitulo.textContent = gano ? '¡Ganaste!' : 'Te atraparon';
    ui.finTexto.innerHTML = `Puntaje <b>${fmt(total)}</b><br>${nuevo ? '¡Nuevo récord!' : 'Récord ' + fmt(prev)}`;
    ui.fin.hidden = false;
  }, gano ? 300 : 900);
}
function mostrarRecord() {
  const r = +localStorage.getItem(CLAVE_RECORD) || 0;
  ui.menuRecord.textContent = r ? `Tu récord: ${fmt(r)}` : '';
}

// ---------------- Bucle principal ----------------
let pistaActual = '';
function pista() {
  let t = '';
  if (estado === 'jugando') {
    if (armado) t = modo === 3 ? 'Toca: disparar · Desliza arriba: saltar · A los lados: carril' : 'Toca: disparar · Desliza arriba: saltar';
    else t = modo === 3 ? 'Toca: saltar · Desliza a los lados: cambiar de carril' : 'Toca: saltar';
  }
  if (t !== pistaActual) { ui.pista.textContent = t; pistaActual = t; }
}

function actualizar(dt) {
  const jugando = estado === 'jugando';
  if (estado === 'menu') vel = 6;
  else if (jugando) vel = jefe ? 9 + nivel : (turT > 0 ? 15 : Math.min(12, 9 + (d - base) * 0.006) + nivel * 1.5);
  else vel = Math.max(0, vel - 18 * dt);
  d += vel * dt;

  if (jugando) while (sig < NIVEL.length && NIVEL[sig].at + base - d < 75) crear(NIVEL[sig++]);

  // Física del personaje
  if (estado !== 'derrota') {
    vy -= 24 * dt; y += vy * dt;
    if (y <= 0) { y = 0; vy = 0; dblUsado = false; }
  }
  rz += ((modo === 3 ? lane * 1.6 : 0) - rz) * Math.min(1, dt * 12);
  inv -= dt; escT -= dt; turT -= dt; dblT -= dt; cad -= dt;

  // Objetos
  for (const o of objs) {
    if (!o.fijo) { o.x -= (vel + o.vx) * dt; o.m.position.x = o.x; }
    switch (o.t) {
      case 'bar':
        if (jugando && !o.golpe && Math.abs(o.x) < 0.32 && y < o.h - 0.05) { o.golpe = true; turT > 0 ? romper(o, COL.valla) : daño(); }
        break;
      case 'blk':
        if (jugando && !o.golpe && Math.abs(o.x) < 0.75 && Math.abs(rz - o.z) < 0.95 && y < 1.45) { o.golpe = true; turT > 0 ? romper(o, COL.bloque) : daño(); }
        break;
      case 'pw':
        o.m.rotation.y += dt * 2.5; o.m.position.y = 1.3 + Math.sin(tiempo * 4) * 0.12;
        if (jugando && Math.abs(o.x) < 0.8 && (modo === 2 || Math.abs(rz - o.z) < 0.95)) {
          o.muerto = true; habilidad(o.k); chispas(o.m.position, COL_HAB[o.k], 12, 4);
        }
        break;
      case 'dron':
        o.m.position.y = 1.25 + Math.sin(tiempo * 5 + o.x) * 0.12; o.m.rotation.y += dt * 3;
        if (jugando && Math.abs(o.x) < 0.7 && Math.abs(rz - o.z) < 0.9 && y < 1.6) {
          o.muerto = true; chispas(o.m.position, COL.dron, 16);
          if (turT > 0) bonus += 50; else daño();
        }
        break;
      case 'portal': {
        const s = 1 + Math.sin(tiempo * 4) * 0.05; o.m.scale.set(s, s, s);
        if (jugando && !o.hecho && o.x <= 0) { o.hecho = true; setModo(o.to); if (o.jefe) aviso('Portal del jefe'); }
        break;
      }
      case 'arma':
        o.arma.rotation.y += dt * 3;
        if (jugando && !o.hecho && o.x <= 0) { o.hecho = true; armado = true; aviso('Arma lista: toca para disparar'); sonido(500, 0.3, 'triangle', 0.06, 1000); }
        break;
      case 'emp':
        o.m.children.forEach(c => { c.material.opacity = 0.3 + Math.random() * 0.7; });
        if (jugando && !o.hecho && o.x <= 0) {
          o.hecho = true; sacudir(0.25); sonido(60, 0.5, 'sawtooth', 0.07, 30);
          if (armado) { armado = false; chispas(new THREE.Vector3(0.4, y + 1.2, rz), COL.emp, 20); aviso('Pulso EMP: perdiste el arma'); }
          else aviso('Pulso EMP');
        }
        break;
      case 'jefe':
        if (jugando && !o.hecho && o.x <= 0) { o.hecho = true; iniciarJefe(); }
        break;
      case 'aviso':
        o.vida -= dt; o.m.material.opacity = 0.2 + 0.35 * Math.abs(Math.sin(tiempo * 18));
        if (o.vida <= 0) { o.muerto = true; if (jefe) rayo(o.lane); }
        break;
      case 'rayo':
        o.vida -= dt;
        if (jugando && !o.golpe && Math.abs(rz - o.z) < 0.9) { o.golpe = true; daño(); }
        o.m.scale.y = o.m.scale.z = Math.max(0.1, o.vida / 0.3);
        if (o.vida <= 0) o.muerto = true;
        break;
    }
  }
  objs = objs.filter(o => {
    if (o.muerto || (!o.fijo && o.x < -14)) { liberar(o.m); return false; }
    return true;
  });

  // Balas
  for (const b of balas) {
    b.m.position.addScaledVector(b.v, dt); b.vida -= dt;
    for (const o of objs) {
      if (o.t === 'dron' && !o.muerto && Math.abs(o.x - b.m.position.x) < 0.7 && Math.abs(o.z - b.m.position.z) < 0.8) {
        o.muerto = true; b.vida = 0; bonus += 50; chispas(o.m.position, COL.dron, 16); sonido(250, 0.15, 'square', 0.05, 60);
      }
    }
    if (jefe && jefe.fase === 'abierto' && b.vida > 0 && b.m.position.distanceTo(posNucleo()) < 1.2) { b.vida = 0; golpeJefe(); }
  }
  balas = balas.filter(b => { if (b.vida <= 0 || b.m.position.x > 60) { S.remove(b.m); return false; } return true; });

  if (jefe) actualizarJefe(dt);
  if (finT > 0) { finT -= dt; if (finT <= 0) terminar(true); }
  if (sigNivelT > 0) { sigNivelT -= dt; if (sigNivelT <= 0) { empezarNivel(nivel + 1); aviso(`Nivel ${nivel + 1}`); } }

  // Partículas (se quedan atrás con el mundo)
  for (const p of parts) {
    p.vida -= dt; p.v.y -= 12 * dt;
    p.m.position.addScaledVector(p.v, dt); p.m.position.x -= vel * dt;
    p.m.material.opacity = Math.max(0, p.vida / 0.7); p.m.scale.setScalar(Math.max(0.1, p.vida / 0.7));
  }
  parts = parts.filter(p => { if (p.vida <= 0) { S.remove(p.m); p.m.material.dispose(); return false; } return true; });
  if (turT > 0 && jugando) chispas(new THREE.Vector3(-0.3, y + 1, rz), COL.turbo, 1, 1);

  // Escenario
  grid.position.x = -(d % 2);
  for (const t of torres) {
    t.m.position.x = ((t.x - d * 0.5) % 160 + 160) % 160 - 40;
    if (t.lado > 0) t.m.visible = k > 0.5;
  }
  for (const a of anillos) {
    a.m.position.x = ((a.x - d) % 180 + 180) % 180 - 20;
    a.m.material.opacity = 0.35 * k;
  }

  animarCorredor(dt);
  if (jugando) ui.puntos.textContent = fmt(puntaje());
  pista();
}

function animarCorredor(dt) {
  if (estado !== 'derrota') fase += dt * Math.max(vel, 4) * 1.4;
  yo.position.set(0, y, rz);
  const s = Math.sin(fase), [p0, p1] = yo.piernas, [b0, b1] = yo.brazos;
  if (estado === 'derrota') { /* queda tendido */ }
  else if (y > 0) { p0.rotation.z = 0.6; p1.rotation.z = -0.4; b0.rotation.z = -0.9; b1.rotation.z = 0.9; }
  else { p0.rotation.z = s * 0.9; p1.rotation.z = -s * 0.9; b0.rotation.z = -s * 0.8; b1.rotation.z = s * 0.8; }
  if (armado) b0.rotation.z = 1.45;
  yo.arma.visible = armado;
  yo.escudo.visible = escT > 0; yo.escudo.rotation.y += dt * 2;
  yo.mat.emissiveIntensity = turT > 0 ? 1.2 : 0.35;
  yo.visible = inv > 0 && estado === 'jugando' ? Math.floor(tiempo * 16) % 2 === 0 : true;
}

// Cámara: siempre es 3D. En "2D" se pone de lado con lente cerrado; al cruzar el portal gira detrás.
const p2 = new THREE.Vector3(), l2 = new THREE.Vector3(), p3 = new THREE.Vector3(), l3 = new THREE.Vector3(), mira = new THREE.Vector3();
function camara(dt) {
  k += ((modo === 3 ? 1 : 0) - k) * Math.min(1, dt * 2.4);
  const e = k * k * (3 - 2 * k), asp = innerWidth / innerHeight;
  const fov2 = Math.min(72, THREE.MathUtils.radToDeg(2 * Math.atan(15 / (2 * 22 * asp))));
  const fov3 = asp < 1 ? 78 : 62;
  p2.set(3.5, 2.2, 22); l2.set(3.5, 1.6, 0);
  p3.set(-5.5, 3.4, rz * 0.6); l3.set(7, jefe ? 2 : 1.2, rz * 0.4);
  C.position.lerpVectors(p2, p3, e); mira.lerpVectors(l2, l3, e);
  if (sacudida > 0) {
    C.position.x += (Math.random() - 0.5) * sacudida; C.position.y += (Math.random() - 0.5) * sacudida;
    sacudida = Math.max(0, sacudida - dt * 2);
  }
  C.lookAt(mira); C.fov = fov2 + (fov3 - fov2) * e; C.updateProjectionMatrix();
}

let ultimo = performance.now();
function cuadro(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora; tiempo += dt;
  actualizar(dt); camara(dt);
  R.render(S, C);
  requestAnimationFrame(cuadro);
}

function ajustar() {
  R.setSize(innerWidth, innerHeight, false);
  C.aspect = innerWidth / innerHeight; C.updateProjectionMatrix();
}
addEventListener('resize', ajustar);
ajustar();

// ---------------- Controles ----------------
let toque = null;
lienzo.addEventListener('pointerdown', e => { activarAudio(); toque = { x: e.clientX, y: e.clientY }; });
lienzo.addEventListener('pointerup', e => {
  if (!toque) return;
  const dx = e.clientX - toque.x, dy = e.clientY - toque.y; toque = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) carril(dx > 0 ? 1 : -1);
  else if (dy < -40) saltar();
  else if (armado) disparar();
  else saltar();
});
lienzo.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', e => {
  const t = e.key.toLowerCase();
  if (t === ' ' || t === 'arrowup' || t === 'w') { saltar(); e.preventDefault(); }
  else if (t === 'arrowleft' || t === 'a') carril(-1);
  else if (t === 'arrowright' || t === 'd') carril(1);
  else if (t === 'x' || t === 'enter' || t === 'f') disparar();
});

function jugar() {
  activarAudio(); reiniciar();
  estado = 'jugando'; ui.menu.hidden = true; ui.fin.hidden = true;
  aviso(nivel ? `Nivel ${nivel + 1}` : '¡Corre!');
}
$('jugar').addEventListener('click', jugar);
$('otra').addEventListener('click', jugar);
$('al-menu').addEventListener('click', () => {
  reiniciar(); estado = 'menu'; ui.fin.hidden = true; ui.menu.hidden = false; mostrarRecord();
});

vidasUI(); mostrarRecord();
requestAnimationFrame(cuadro);

// Solo para pruebas (?prueba=1): avanzar el juego con tiempo simulado desde la consola.
if (params.has('prueba')) {
  window.nexo = {
    avanzar(seg) {
      for (let i = 0; i < seg * 60; i++) { tiempo += 1 / 60; actualizar(1 / 60); camara(1 / 60); }
      R.render(S, C); return this.estado();
    },
    estado: () => ({ estado, d: Math.round(d - base), modo, armado, nivel: nivel + 1, vidas, puntos: puntaje(), jefe: jefe && { vida: jefe.vida, fase: jefe.fase } }),
    saltar, carril, disparar,
  };
}
