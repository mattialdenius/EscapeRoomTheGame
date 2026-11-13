/* =====================================================================
   ZOO-KARTE („Entdecker-Modus“) für den Grammar Escape Room
   ---------------------------------------------------------------------
   Zweck:    Ersetzt die Übersicht mit den Kacheln durch eine begehbare
             Karte. Die Kinder tippen auf die Karte, die Spielfigur läuft
             hin, und am Gehege öffnet sich der gewohnte Aufgabenraum.
             Die Karte zeichnet und steuert nur. Aufgaben, Zeit, Ziffern
             und Zahlenschloss bleiben in index.html (über EscapeAPI).
   Version:  karte 0.1  (passt zu App-Version 0.5.4, Testbereich)
   Daten:    Positionen und Texte stehen in daten/klasse5.js unter
             K5.welt.karte. Hier im Code steht nichts Festes davon.
   Speichert nichts: kein localStorage, keine Cookies, kein Netzwerk,
             keine fremden Schriften oder Bilder. Alles wird gezeichnet.
             Nach dem Neuladen der Seite ist alles wieder am Anfang.

   Änderungsliste:
     0.1  (13.11.2026)  Erste Fassung: Zoo bei Nacht, vier Gehege,
          Raubtierhaus (Kulisse), Zootor mit Code-Tafel, Polly,
          Zoowärterin (Regelkarte), Nachtwächter (Zeitwarnung),
          zwei Tiere am Wegrand (Wörter). Bedienung mit Finger, Maus,
          Tastatur (Pfeile/WASD, Enter, Tab). Technik aus „Wunderwelt“
          übernommen (Kamera, Wegsuche, Eingabe, Effekte, Töne),
          Spielstand-Speicher und Vorlesestimme entfernt.

   Aufbau dieser Datei:
     1. Hilfen und Zustand
     2. Karte aufbauen (Geometrie, Hindernisse, Wegsuche)
     3. Zeichnen
     4. Ablauf (Bewegung, Figuren, Hinweise)
     5. Eingabe (Finger, Maus, Tastatur, Knopfliste für Screenreader)
     6. Einbettung (Container, zeigen/verbergen, Anmeldung bei EscapeAPI)
   ===================================================================== */
(function () {
'use strict';
if (window.ZooKarte) return;
const API = window.EscapeAPI;
if (!API || typeof API.karteAnmelden !== 'function') { if (window.console) console.warn('Zoo-Karte: EscapeAPI fehlt – es bleibt bei der klassischen Übersicht.'); return; }

/* ============ 1. HILFEN UND ZUSTAND ============ */
const VERSION = '0.1';
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rnd = (a, b) => a + Math.random() * (b - a);
function seeded(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fuelle = (text, werte) => String(text || '').replace(/\{(\w+)\}/g, (m, k) => werte && werte[k] != null ? werte[k] : m);
const EMOJI_FONT = 'system-ui,-apple-system,"Segoe UI","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const TEXT_FONT = 'system-ui,-apple-system,"Segoe UI",Arial,sans-serif';
const MONO_FONT = 'ui-monospace,"SF Mono",Menlo,Consolas,"Courier New",monospace';
const GESCHW = 340;          // Lauftempo der Spielfigur (Karten-Einheiten pro Sekunde)
const MAX_LAUFZEIT = 4.5;    // kein Lauf dauert länger (Sekunden) – lange Wege werden schneller gelaufen
const ZELLE = 20;            // Rastergröße der Wegsuche

// Ersatztexte, falls in den Daten ein Text fehlt
const TEXTE = {
  gesperrt: 'Dieses Gehege ist noch zu. Schafft zuerst das Gehege mit dem Pfeil!',
  schonGeschafft: 'Hier habt ihr die Ziffer schon gefunden. Weiter geht’s!',
  torZu: 'Erst alle vier Gehege schaffen!',
  loewe: 'Psst! Der Löwe schläft.',
  jubel: 'Kraaah! Eine neue Ziffer!',
  tipp: 'Als Nächstes: {name}! Folgt dem Pfeil.',
  tippTor: 'Alle Ziffern gefunden! Lauft zum Zootor.',
  regelTitel: 'Regel für: {name}',
  keineRegel: 'Für dieses Gehege gibt es keine Regelkarte.',
  waerterinFertig: 'Alles geschafft! Jetzt schnell zum Zootor.',
  waechter: 'Beeilt euch!'
};

// Alles, was sich ändert, steht in Z (Zustand). Es wird nichts davon gespeichert.
const Z = {
  gebaut: null, sichtbar: false, raf: 0, letzte: 0, zeit: 0, fehler: 0,
  W: 1600, H: 1000, w: 300, h: 300, dpr: 1, scale: 1, cam: { x: 0, y: 0 },
  status: null, sig: '', pollT: 0, neueMission: true, gewarnt: false, jubel: -1,
  P: null, polly: null, figs: [], G: [], raub: null, tor: null, brunnen: null, tafel: null,
  baeume: [], lampen: [], wege: [], flecken: [], sterne: [],
  blasen: [], fx: [], marker: null, randPfeil: null, fokus: null, zeiger: null, tasten: new Set(), ruhig: false
};
let box = null, canvas = null, ctx = null, srListe = null, srLive = null, regelBox = null, angemeldet = false;

/* ---- Töne: nur wenn in der App der Ton eingeschaltet ist (Knopf oben rechts) ---- */
const Sfx = {
  ac: null,
  an() { const b = document.getElementById('btnTon'); return !!b && b.getAttribute('aria-label') === 'Ton ausschalten'; },
  ton(f, d, o) {
    if (!this.an()) return;
    try {
      if (!this.ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ac = new AC(); }
      if (this.ac.state === 'suspended') this.ac.resume();
      o = o || {}; const ac = this.ac, t0 = ac.currentTime + (o.at || 0), osc = ac.createOscillator(), g = ac.createGain();
      osc.type = o.type || 'triangle'; osc.frequency.setValueAtTime(f, t0); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(o.vol || 0.12, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      osc.connect(g); g.connect(ac.destination); osc.start(t0); osc.stop(t0 + d + 0.05);
    } catch (e) {}
  },
  play(name) {
    if (name === 'tipp') this.ton(660, 0.07);
    else if (name === 'zu') { this.ton(300, 0.14, { type: 'sine' }); this.ton(240, 0.2, { type: 'sine', at: 0.12 }); }
    else if (name === 'plopp') this.ton(420, 0.12, { to: 840, type: 'sine' });
    else if (name === 'jubel') [523, 659, 784, 1047].forEach((f, i) => this.ton(f, 0.18, { at: i * 0.09 }));
  }
};

// Die App zeigt bei jedem unbehandelten Fehler eine Fehlermeldung. Deshalb fängt die Karte ihre Fehler selbst ab.
function sicher(fn) { return function (e) { try { return fn.call(this, e); } catch (err) { if (window.console) console.error('Zoo-Karte', err); } }; }
function hoere(ziel, name, fn) { ziel.addEventListener(name, sicher(fn)); }
function sage(text) { try { API.sage(text); } catch (e) {} }
function ansage(text) { if (srLive) { srLive.textContent = ''; srLive.textContent = text; } }
function blase(x, y, text, dauer, id) {
  if (id) Z.blasen = Z.blasen.filter(b => b.id !== id);
  Z.blasen.push({ x, y, text, t: dauer || 3.5, max: dauer || 3.5, id: id || null });
  if (Z.blasen.length > 4) Z.blasen.shift();
}
function funken(x, y, n, o) {
  if (Z.ruhig) return; o = o || {};
  for (let i = 0; i < n && Z.fx.length < 160; i++) {
    const a = rnd(0, TAU), sp = rnd(40, o.sp || 200);
    Z.fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 60), g: 260, life: rnd(0.5, 1.1), max: 1.1, size: rnd(5, 11), form: i % 3, rot: rnd(0, TAU), vr: rnd(-6, 6) });
  }
}

/* ============ 2. KARTE AUFBAUEN ============ */
function zahl(v, ersatz) { return typeof v === 'number' && isFinite(v) ? v : ersatz; }

function baue(welt) {
  const D = welt.karte, R = seeded(20261113);
  const W = Z.W = clamp(zahl(D.groesse && D.groesse.b, 1600), 800, 3000), H = Z.H = clamp(zahl(D.groesse && D.groesse.h, 1000), 600, 2400);
  Z.texte = Object.assign({}, TEXTE, D.texte || {});
  // Gehege (Reihenfolge = Raum 0 … 3)
  Z.G = welt.raeume.map((r, i) => {
    const d = (D.gehege && D.gehege[i]) || {}, x = zahl(d.x, i % 2 ? W - 300 : 300), y = zahl(d.y, i < 2 ? 300 : H - 300);
    return { nr: i, x, y, schild: d.schild || r.name, emoji: r.emoji, rect: { x0: x - 130, y0: y - 110, x1: x + 130, y1: y + 40 }, spot: { x, y: y + 74 }, wackel: 0 };
  });
  const tx = zahl(D.tor && D.tor.x, W / 2), ty = clamp(zahl(D.tor && D.tor.y, H - 50), H - 80, H - 30);
  Z.tor = { x: tx, y: ty, name: welt.ausgang.name, emoji: welt.ausgang.emoji, spot: { x: tx, y: ty - 48 }, wackel: 0 };
  Z.tafel = { x: tx + 160, y: ty - 62 };
  const rb = D.raubtierhaus || {}, rx = zahl(rb.x, W / 2), ry = zahl(rb.y, 200);
  Z.raub = { x: rx, y: ry, name: rb.schild || welt.zusatzraum.name, emoji: welt.zusatzraum.emoji, rect: { x0: rx - 150, y0: ry - 110, x1: rx + 150, y1: ry + 40 }, spot: { x: rx, y: ry + 74 } };
  const br = D.brunnen || {};
  Z.brunnen = { x: zahl(br.x, W / 2), y: zahl(br.y, H * 0.6), rx: 78, ry: 54 };
  Z.start = { x: zahl(D.start && D.start.x, tx), y: zahl(D.start && D.start.y, ty - 90) };

  // Wege (nur gemalt – laufen darf man überall, wo nichts steht)
  Z.wege = [[[tx, ty], [tx, Z.brunnen.y + 96]], [[tx, Z.brunnen.y - 96], [rx, Z.raub.spot.y - 10]]];
  for (const g of Z.G) Z.wege.push([[g.spot.x, g.spot.y - 14], [g.spot.x, g.spot.y + 28], [tx, g.spot.y + 28]]);

  // Figuren (höchstens 5, keine hält auf)
  Z.figs = []; let hatPolly = false;
  (Array.isArray(D.figuren) ? D.figuren : []).slice(0, 5).forEach((f, i) => {
    if (!f) return;
    if (f.art === 'polly') { hatPolly = true; return; }
    if (f.art === 'waechter') {
      const runde = (Array.isArray(f.runde) ? f.runde : []).filter(p => Array.isArray(p) && p.length >= 2).map(p => ({ x: +p[0], y: +p[1] }));
      if (runde.length) Z.figs.push({ id: 'waechter', art: 'waechter', name: f.name || 'Nachtwächter', runde, x: runde[0].x, y: runde[0].y, ziel: 1 % runde.length, blick: 1, winkel: 0, hop: 0 });
    } else if (f.art === 'waerterin') Z.figs.push({ id: 'waerterin', art: 'waerterin', name: f.name || 'Zoowärterin', x: zahl(f.x, tx - 110), y: zahl(f.y, H / 2), hop: 0 });
    else if (f.art === 'tier') Z.figs.push({ id: 'tier' + i, art: 'tier', name: f.name || 'Tier', emoji: f.emoji || '🦉', x: zahl(f.x, 200 + i * 200), y: zahl(f.y, H / 2), hop: 0 });
  });
  Z.hatPolly = hatPolly || !Array.isArray(D.figuren);

  // Laternen
  Z.lampen = [];
  for (const g of Z.G) Z.lampen.push({ x: g.spot.x - 152, y: g.spot.y - 20 }, { x: g.spot.x + 152, y: g.spot.y - 20 });
  Z.lampen.push({ x: tx - 120, y: ty - 40 }, { x: tx + 260, y: ty - 40 }, { x: rx - 185, y: ry + 62 }, { x: rx + 185, y: ry + 62 },
    { x: Z.brunnen.x - 130, y: Z.brunnen.y + 20 }, { x: Z.brunnen.x + 130, y: Z.brunnen.y + 20 });

  // Bäume und Büsche (fester Zufall: sieht jedes Mal gleich aus)
  Z.baeume = [];
  const wegAbstand = (x, y) => { let m = 1e9; for (const P of Z.wege) for (let i = 0; i < P.length - 1; i++) m = Math.min(m, segDist(x, y, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1])); return m; };
  const imRect = (r, x, y, p) => x > r.x0 - p && x < r.x1 + p && y > r.y0 - p && y < r.y1 + p;
  const platzFrei = (x, y) => {
    if (x < 90 || x > W - 90 || y < 150 || y > H - 120) return false;
    if (wegAbstand(x, y) < 72) return false;
    for (const g of Z.G) if (imRect(g.rect, x, y, 60) || dist(x, y, g.spot.x, g.spot.y) < 120 || (Math.abs(x - g.x) < 170 && y < g.rect.y0 && y > g.rect.y0 - 110)) return false;
    if (imRect(Z.raub.rect, x, y, 70) || dist(x, y, Z.brunnen.x, Z.brunnen.y) < 170 || dist(x, y, Z.start.x, Z.start.y) < 120 || dist(x, y, Z.tafel.x, Z.tafel.y) < 110) return false;
    for (const f of Z.figs) { if (f.runde) { for (let i = 0; i < f.runde.length; i++) { const a = f.runde[i], b = f.runde[(i + 1) % f.runde.length]; if (segDist(x, y, a.x, a.y, b.x, b.y) < 60) return false; } } else if (dist(x, y, f.x, f.y) < 100) return false; }
    for (const b of Z.baeume) if (dist(x, y, b.x, b.y) < 95) return false;
    return true;
  };
  for (let i = 0, n = 0; i < 700 && n < 22; i++) { const x = R() * W, y = R() * H; if (platzFrei(x, y)) { Z.baeume.push({ x, y, s: 0.85 + R() * 0.35, art: R() < 0.35 ? 1 : 0 }); n++; } }
  Z.flecken = []; for (let i = 0; i < 34; i++) Z.flecken.push({ x: R() * W, y: 100 + R() * (H - 160), rx: 60 + R() * 120, ry: 26 + R() * 46, hell: R() < 0.5 });
  Z.sterne = []; for (let i = 0; i < 46; i++) Z.sterne.push({ x: R() * W, y: 6 + R() * 52, r: 1 + R() * 1.6, ph: R() * 6 });

  // Lauf-Raster für die Wegsuche
  Z.cols = Math.ceil(W / ZELLE); Z.rows = Math.ceil(H / ZELLE);
  Z.grid = new Uint8Array(Z.cols * Z.rows);
  for (let j = 0; j < Z.rows; j++) for (let i = 0; i < Z.cols; i++) Z.grid[j * Z.cols + i] = festAn((i + 0.5) * ZELLE, (j + 0.5) * ZELLE) ? 1 : 0;
  Z.gs = new Float32Array(Z.grid.length); Z.came = new Int32Array(Z.grid.length); Z.st = new Uint8Array(Z.grid.length);
  Z.gebaut = welt.klasse + '|' + welt.name;
}
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; const t = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0; return Math.hypot(px - ax - dx * t, py - ay - dy * t); }

// Wo kann man NICHT laufen? (Mauern, Häuser, Brunnen, Bäume, Tafel)
function festAn(x, y) {
  const p = 16;
  if (x < 56 || x > Z.W - 56 || y < 98 || y > Z.tor.y - 26) return true;
  for (const g of Z.G) if (x > g.rect.x0 - p && x < g.rect.x1 + p && y > g.rect.y0 - p && y < g.rect.y1 + p) return true;
  const r = Z.raub.rect; if (x > r.x0 - p && x < r.x1 + p && y > r.y0 - p && y < r.y1 + p) return true;
  const b = Z.brunnen, ex = (x - b.x) / (b.rx + p), ey = (y - b.y) / (b.ry + p); if (ex * ex + ey * ey < 1) return true;
  if (Math.abs(x - Z.tafel.x) < 62 && Math.abs(y - Z.tafel.y + 8) < 26) return true;
  for (const t of Z.baeume) if (Math.abs(x - t.x) < 28 && Math.abs(y - t.y) < 28 && dist(x, y, t.x, t.y - 4) < 26) return true;
  return false;
}
function frei(x, y) { const i = Math.floor(x / ZELLE), j = Math.floor(y / ZELLE); return i >= 0 && j >= 0 && i < Z.cols && j < Z.rows && !Z.grid[j * Z.cols + i]; }
function naheFrei(x, y) {
  const ci = clamp(Math.floor(x / ZELLE), 0, Z.cols - 1), cj = clamp(Math.floor(y / ZELLE), 0, Z.rows - 1);
  if (!Z.grid[cj * Z.cols + ci]) return cj * Z.cols + ci;
  let best = -1, bd = 1e9;
  for (let r = 1; r <= 16 && best < 0; r++) for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
    if (i < 0 || j < 0 || i >= Z.cols || j >= Z.rows || Z.grid[j * Z.cols + i]) continue;
    const d = dist(x, y, (i + 0.5) * ZELLE, (j + 0.5) * ZELLE); if (d < bd) { bd = d; best = j * Z.cols + i; }
  }
  return best;
}
function sicht(ax, ay, bx, by) { const n = Math.ceil(dist(ax, ay, bx, by) / 7); for (let k = 1; k <= n; k++) if (!frei(lerp(ax, bx, k / n), lerp(ay, by, k / n))) return false; return true; }
/* Wegsuche (A*) – die Figur läuft so von selbst um Häuser, Bäume und den Brunnen herum */
function findeWeg(sx, sy, tx, ty) {
  const C = ZELLE, cols = Z.cols, rows = Z.rows, grid = Z.grid;
  const s = naheFrei(sx, sy), g = naheFrei(tx, ty); if (s < 0 || g < 0) return null;
  const cen = k => ({ x: (k % cols + 0.5) * C, y: (Math.floor(k / cols) + 0.5) * C });
  const goal = frei(tx, ty) ? { x: tx, y: ty } : cen(g);
  if (s === g) return [goal];
  const G = Z.gs, came = Z.came, st = Z.st; G.fill(1e9); st.fill(0);
  const hI = [], hF = [];
  const push = (i, f) => { let k = hI.length; hI.push(i); hF.push(f); while (k > 0) { const p = (k - 1) >> 1; if (hF[p] <= f) break; hI[k] = hI[p]; hF[k] = hF[p]; k = p; } hI[k] = i; hF[k] = f; };
  const pop = () => { const top = hI[0], li = hI.pop(), lf = hF.pop(), n = hI.length; if (n) { let k = 0; for (;;) { let ch = 2 * k + 1; if (ch >= n) break; if (ch + 1 < n && hF[ch + 1] < hF[ch]) ch++; if (hF[ch] >= lf) break; hI[k] = hI[ch]; hF[k] = hF[ch]; k = ch; } hI[k] = li; hF[k] = lf; } return top; };
  const gi = g % cols, gj = Math.floor(g / cols);
  const Hh = k => { const dx = Math.abs(k % cols - gi), dy = Math.abs(Math.floor(k / cols) - gj); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
  G[s] = 0; came[s] = -1; push(s, Hh(s));
  let found = false;
  while (hI.length) {
    const cur = pop(); if (st[cur] === 2) continue; st[cur] = 2;
    if (cur === g) { found = true; break; }
    const ci = cur % cols, cj = Math.floor(cur / cols);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
      const nk = nj * cols + ni; if (grid[nk] || st[nk] === 2) continue;
      if (di && dj && (grid[cj * cols + ni] || grid[nj * cols + ci])) continue;
      const ng = G[cur] + (di && dj ? 1.414 : 1);
      if (ng < G[nk]) { G[nk] = ng; came[nk] = cur; push(nk, ng + Hh(nk)); }
    }
  }
  if (!found) return null;
  const raw = []; for (let k = g; k !== -1; k = came[k]) raw.push(cen(k)); raw.reverse(); raw[raw.length - 1] = goal;
  const out = []; let ax = sx, ay = sy, i = 0;
  while (i < raw.length) { let j = i; for (let k = raw.length - 1; k > i; k--) if (sicht(ax, ay, raw[k].x, raw[k].y)) { j = k; break; } out.push(raw[j]); ax = raw[j].x; ay = raw[j].y; i = j + 1; }
  return out;
}
function wegLaenge(p, x, y) { let l = 0; for (const q of p) { l += dist(x, y, q.x, q.y); x = q.x; y = q.y; } return l; }

/* ============ 3. ZEICHNEN ============ */
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); }
function ell(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU); }
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function tri(c, x1, y1, x2, y2, x3, y3) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); }
function fs(c, fill, stroke, lw) { if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 3; c.stroke(); } }
function emoji(c, e, x, y, px) { c.font = px + 'px ' + EMOJI_FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText(e, x, y); }
function sternForm(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.closePath(); }
const puls = (t, f) => Z.ruhig ? 0.5 : 0.5 + 0.5 * Math.sin(t * (f || 4));
const schriftWelt = (px, min) => Math.max(px, (min || 15) / Z.scale);   // Schrift bleibt auf dem Handy lesbar

/* Zustands-Symbole als gezeichnete Formen (zusätzlich zu den Emojis): Schloss, Pfeil, Haken, Warndreieck */
function symbol(c, art, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s / 20, s / 20); c.lineJoin = 'round'; c.lineCap = 'round';
  if (art === 'schloss') { c.strokeStyle = '#000'; c.lineWidth = 5; c.beginPath(); c.arc(0, -5, 8, Math.PI, 0); c.stroke(); rr(c, -12, -5, 24, 20, 4); fs(c, '#fff', '#000', 3); c.fillStyle = '#000'; circ(c, 0, 4, 3.4); c.fill(); c.fillRect(-1.5, 4, 3, 7); }
  else if (art === 'pfeil') { tri(c, -9, -14, 15, 0, -9, 14); fs(c, '#ffd23f', '#000', 3.5); }
  else if (art === 'haken') { circ(c, 0, 0, 16); fs(c, '#fff', '#000', 3); c.strokeStyle = '#000'; c.lineWidth = 6; c.beginPath(); c.moveTo(-9, 1); c.lineTo(-2, 8); c.lineTo(10, -7); c.stroke(); }
  else if (art === 'warnung') { tri(c, 0, -17, 18, 14, -18, 14); fs(c, '#ffd23f', '#000', 3.5); c.fillStyle = '#000'; c.fillRect(-2.2, -7, 4.4, 11); circ(c, 0, 9, 2.6); c.fill(); }
  c.restore();
}
const SYMBOL = { gesperrt: 'schloss', offen: 'pfeil', begonnen: 'pfeil', geschafft: 'haken', unsicher: 'warnung' };
const ZEICHEN = { gesperrt: '🔒', offen: '▶', begonnen: '▶', geschafft: '✅', unsicher: '⚠️' };
const WORT = { gesperrt: 'gesperrt', offen: 'offen', begonnen: 'begonnen', geschafft: 'geschafft', unsicher: 'geschafft, Ziffer unsicher' };

function raumStatus(i) { const s = Z.status && Z.status.raeume && Z.status.raeume[i]; return s || { nr: i, zustand: 'gesperrt', richtig: 0, von: 0, ziffer: null, kandidaten: null }; }
function naechstes() { if (!Z.status) return -1; for (const r of Z.status.raeume) if (r.zustand === 'offen' || r.zustand === 'begonnen') return r.nr; return -1; }

function zeichneBoden(c, t) {
  const W = Z.W, H = Z.H, tor = Z.tor;
  c.fillStyle = '#12304a'; c.fillRect(0, 0, W, H);
  for (const p of Z.flecken) { c.fillStyle = p.hell ? 'rgba(60,120,130,0.20)' : 'rgba(5,15,40,0.22)'; ell(c, p.x, p.y, p.rx, p.ry); c.fill(); }
  // Nachthimmel hinter der Mauer
  const g = c.createLinearGradient(0, 0, 0, 70); g.addColorStop(0, '#050b1c'); g.addColorStop(1, '#13285e'); c.fillStyle = g; c.fillRect(0, 0, W, 70);
  c.fillStyle = '#fff'; for (const s of Z.sterne) { c.globalAlpha = 0.5 + 0.5 * puls(t + s.ph, 1.5); circ(c, s.x, s.y, s.r); c.fill(); } c.globalAlpha = 1;
  c.fillStyle = '#fff8d6'; circ(c, W - 150, 34, 22); c.fill(); c.fillStyle = '#0b1a40'; circ(c, W - 140, 28, 20); c.fill();
  // Wege
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const pass of [0, 1]) {
    c.strokeStyle = pass ? '#55628c' : '#2a3558'; c.lineWidth = pass ? 54 : 66;
    for (const P of Z.wege) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.stroke(); }
    const b = Z.brunnen; c.lineWidth = pass ? 40 : 52; ell(c, b.x, b.y, b.rx + 44, b.ry + 40); c.stroke();
  }
  c.fillStyle = 'rgba(255,255,255,0.10)'; for (const P of Z.wege) for (let i = 0; i < P.length - 1; i++) { const n = Math.floor(dist(P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]) / 46); for (let k = 1; k < n; k++) { circ(c, lerp(P[i][0], P[i + 1][0], k / n) + ((k * 37) % 30 - 15), lerp(P[i][1], P[i + 1][1], k / n) + ((k * 53) % 28 - 14), 4); c.fill(); } }
  // Mauern (oben, links, rechts, unten mit Tor-Öffnung)
  c.fillStyle = '#26345e'; c.strokeStyle = '#000'; c.lineWidth = 4;
  c.fillRect(0, 62, W, 26); c.strokeRect(-4, 62, W + 8, 26);
  c.fillRect(0, 62, 30, H); c.fillRect(W - 30, 62, 30, H);
  c.fillRect(0, tor.y - 8, tor.x - 78, H); c.strokeRect(-4, tor.y - 8, tor.x - 74, H);
  c.fillRect(tor.x + 78, tor.y - 8, W, H); c.strokeRect(tor.x + 78, tor.y - 8, W, H);
  c.fillStyle = '#1a4a4f'; for (let x = 20; x < W; x += 62) { circ(c, x + (x * 7) % 20, 66, 24 + (x * 13) % 10); c.fill(); }
  c.fillStyle = '#55628c'; c.fillRect(tor.x - 74, tor.y - 8, 148, H);
}
function zeichneLicht(c, t) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const l of Z.lampen) { const r = 150 + 6 * puls(t + l.x, 2.3); const g = c.createRadialGradient(l.x, l.y, 0, l.x, l.y, r); g.addColorStop(0, 'rgba(255,205,110,0.30)'); g.addColorStop(1, 'rgba(255,205,110,0)'); c.fillStyle = g; c.fillRect(l.x - r, l.y - r, r * 2, r * 2); }
  // Taschenlampe der Spielfigur
  const P = Z.P; c.translate(P.x, P.y - 8); c.rotate(P.winkel);
  const g2 = c.createRadialGradient(0, 0, 10, 0, 0, 210); g2.addColorStop(0, 'rgba(255,245,200,0.34)'); g2.addColorStop(1, 'rgba(255,245,200,0)');
  c.fillStyle = g2; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 210, -0.42, 0.42); c.closePath(); c.fill();
  c.restore();
}

function zeichneGehege(c, g, t) {
  const st = raumStatus(g.nr), z = st.zustand, zu = z === 'gesperrt', fertig = z === 'geschafft' || z === 'unsicher';
  const farben = ['#7b5230', '#2f6c96', '#3f7550', '#6a6790'], x = g.x + (g.wackel > 0 ? Math.sin(g.wackel * 40) * 5 * g.wackel : 0), y = g.y;
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 40, 140, 16); c.fill();
  rr(c, x - 130, y - 110, 260, 150, 16); fs(c, farben[g.nr % 4], '#000', 4);
  if (zu) { c.fillStyle = 'rgba(5,11,28,0.5)'; rr(c, x - 130, y - 110, 260, 150, 16); c.fill(); }
  rr(c, x - 140, y - 124, 280, 36, 14); fs(c, '#1b2646', '#000', 4);
  c.fillStyle = 'rgba(255,255,255,0.14)'; for (let i = 0; i < 7; i++) c.fillRect(x - 124 + i * 38, y - 118, 20, 8);
  // Fenster links: das Tier
  circ(c, x - 84, y - 38, 34); fs(c, zu ? '#22314f' : '#fff3c4', '#000', 4);
  c.globalAlpha = zu ? 0.5 : 1; emoji(c, g.emoji, x - 84, y - 36, 42); c.globalAlpha = 1;
  // Fenster rechts: Zustand als Form
  circ(c, x + 84, y - 38, 30); fs(c, '#0b1736', '#000', 4);
  symbol(c, SYMBOL[z] || 'schloss', x + 84, y - 38, 20);
  // Tür in der Mitte
  c.beginPath(); c.moveTo(x - 30, y + 40); c.lineTo(x - 30, y - 30); c.arc(x, y - 30, 30, Math.PI, 0); c.lineTo(x + 30, y + 40); c.closePath();
  fs(c, zu ? '#141d38' : fertig ? '#2a3b63' : '#ffd23f', '#000', 4);
  if (zu) { c.strokeStyle = '#9aa6c8'; c.lineWidth = 4; for (let i = -20; i <= 20; i += 10) { c.beginPath(); c.moveTo(x + i, y - 30 - Math.sqrt(900 - i * i) + 3); c.lineTo(x + i, y + 38); c.stroke(); } c.beginPath(); c.moveTo(x - 28, y - 4); c.lineTo(x + 28, y - 4); c.stroke(); }
  else if (!fertig) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.moveTo(x - 16, y + 36); c.lineTo(x - 16, y - 28); c.arc(x - 2, y - 28, 14, Math.PI, Math.PI * 1.5); c.lineTo(x - 2, y + 36); c.closePath(); c.fill(); }
  else { c.fillStyle = '#000'; circ(c, x + 16, y + 6, 4); c.fill(); }
}
function zeichneRaub(c, r, t) {
  const x = r.x, y = r.y;
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 40, 160, 18); c.fill();
  rr(c, x - 150, y - 110, 300, 150, 16); fs(c, '#5b3140', '#000', 4);
  rr(c, x - 160, y - 124, 320, 36, 14); fs(c, '#1b2646', '#000', 4);
  rr(c, x - 110, y - 70, 220, 92, 12); fs(c, '#161f3c', '#000', 4);
  emoji(c, r.emoji, x - 10, y - 20, 62);
  c.strokeStyle = '#9aa6c8'; c.lineWidth = 5; for (let i = -88; i <= 88; i += 22) { c.beginPath(); c.moveTo(x + i, y - 68); c.lineTo(x + i, y + 20); c.stroke(); }
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) { const u = Z.ruhig ? 0.5 : (t * 0.4 + i / 3) % 1; c.globalAlpha = 1 - u * 0.8; c.font = 'bold ' + (16 + i * 5) + 'px ' + TEXT_FONT; c.fillText('z', x + 44 + i * 20, y - 30 - i * 16 - u * 10); } c.globalAlpha = 1;
}
function zeichneBrunnen(c, b, t) {
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, b.x, b.y + 10, b.rx + 8, b.ry + 6); c.fill();
  ell(c, b.x, b.y, b.rx, b.ry); fs(c, '#7d87a8', '#000', 4);
  ell(c, b.x, b.y - 2, b.rx - 14, b.ry - 12); fs(c, '#1d4f86', '#000', 3);
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.beginPath(); c.arc(b.x - 20, b.y + (Z.ruhig ? 0 : Math.sin(t * 1.5) * 2), 14, Math.PI * 1.1, Math.PI * 1.7); c.stroke();
  c.fillStyle = '#fff8d6'; circ(c, b.x + 22, b.y - 8, 9); c.fill(); c.fillStyle = '#1d4f86'; circ(c, b.x + 26, b.y - 11, 8); c.fill();
}
function zeichneBaum(c, b, alpha) {
  c.fillStyle = 'rgba(0,0,0,0.28)'; ell(c, b.x, b.y, 30 * b.s, 9 * b.s); c.fill();
  c.save(); c.translate(b.x, b.y); c.scale(b.s, b.s);
  if (b.art === 1) { c.globalAlpha = alpha; c.fillStyle = '#1e5a55'; circ(c, -16, -12, 17); c.fill(); circ(c, 16, -12, 17); c.fill(); c.fillStyle = '#2a7268'; circ(c, 0, -22, 22); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, -22, 22, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
  else { rr(c, -8, -40, 16, 42, 5); fs(c, '#5a4636', '#000', 2.5); c.globalAlpha = alpha; c.fillStyle = '#1a4f52'; circ(c, -22, -56, 25); c.fill(); circ(c, 22, -56, 25); c.fill(); c.fillStyle = '#236660'; circ(c, 0, -76, 35); c.fill(); c.fillStyle = '#2f7d70'; circ(c, -10, -86, 12); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath(); c.arc(0, -76, 35, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  c.restore();
}
function zeichneLampe(c, l, t) {
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, l.x, l.y, 10, 4); c.fill();
  c.fillStyle = '#000'; c.fillRect(l.x - 3.5, l.y - 62, 7, 62);
  c.fillStyle = 'rgba(255,214,120,0.35)'; circ(c, l.x, l.y - 70, 22 + 2 * puls(t + l.x, 2.3)); c.fill();
  rr(c, l.x - 11, l.y - 84, 22, 26, 6); fs(c, '#ffe7a3', '#000', 3);
}
/* Menschen: Füße bei (0,0). o: jacke, hose, haut, hut ('muetze'|'hut'|'kappe'), rucksack, lampe, brett, gehen, groesse */
function zeichnePerson(c, x, y, t, o) {
  const s = o.groesse || 1, w = o.gehen && !Z.ruhig ? Math.sin(t * 14) : 0, lift = o.hop > 0 ? Math.sin((1 - clamp(o.hop, 0, 1)) * Math.PI) * 16 : 0;
  c.fillStyle = 'rgba(0,0,0,0.32)'; ell(c, x, y, 20 * s, 7 * s); c.fill();
  c.save(); c.translate(x, y - lift); c.scale(s * (o.blick < 0 ? -1 : 1), s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.rucksack) { rr(c, -19, -46, 16, 26, 6); fs(c, '#2b59c3', '#000', 2.5); }
  c.strokeStyle = '#000'; c.lineWidth = 10; c.beginPath(); c.moveTo(-6, -20); c.lineTo(-6 + w * 5, -3); c.moveTo(6, -20); c.lineTo(6 - w * 5, -3); c.stroke();
  c.strokeStyle = o.hose; c.lineWidth = 6; c.beginPath(); c.moveTo(-6, -20); c.lineTo(-6 + w * 5, -4); c.moveTo(6, -20); c.lineTo(6 - w * 5, -4); c.stroke();
  rr(c, -13, -50, 26, 32, 9); fs(c, o.jacke, '#000', 2.5);
  if (o.streifen) { c.fillStyle = o.streifen; c.fillRect(-12, -36, 24, 5); }
  // Arm mit Taschenlampe oder Klemmbrett
  c.strokeStyle = '#000'; c.lineWidth = 9; c.beginPath(); c.moveTo(8, -44); c.lineTo(20, -32 + w * 2); c.stroke();
  c.strokeStyle = o.jacke; c.lineWidth = 5; c.beginPath(); c.moveTo(8, -44); c.lineTo(20, -32 + w * 2); c.stroke();
  if (o.lampe) { rr(c, 17, -37 + w * 2, 15, 9, 3); fs(c, '#c9cfe0', '#000', 2); c.fillStyle = '#fff3a8'; c.fillRect(30, -36 + w * 2, 4, 7); }
  if (o.brett) { rr(c, 14, -42, 16, 20, 3); fs(c, '#fff', '#000', 2); c.fillStyle = '#000'; c.fillRect(17, -37, 10, 2); c.fillRect(17, -32, 10, 2); c.fillRect(17, -27, 7, 2); }
  circ(c, 0, -62, 13); fs(c, o.haut, '#000', 2.5);
  c.fillStyle = '#000'; circ(c, 4, -63, 1.9); c.fill(); circ(c, 10, -63, 1.6); c.fill();
  c.strokeStyle = '#000'; c.lineWidth = 1.8; c.beginPath(); c.arc(6, -58, 4, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
  if (o.hut === 'muetze') { c.beginPath(); c.arc(0, -64, 13.5, Math.PI, 0); c.closePath(); fs(c, '#3ddc97', '#000', 2.5); circ(c, 0, -79, 4); fs(c, '#fff', '#000', 2); }
  else if (o.hut === 'hut') { rr(c, -19, -70, 38, 6, 3); fs(c, '#c9a45c', '#000', 2.5); c.beginPath(); c.arc(0, -70, 11, Math.PI, 0); c.closePath(); fs(c, '#c9a45c', '#000', 2.5); }
  else if (o.hut === 'kappe') { c.beginPath(); c.arc(0, -66, 13.5, Math.PI, 0); c.closePath(); fs(c, '#1b2646', '#000', 2.5); rr(c, 2, -69, 18, 5, 2); fs(c, '#1b2646', '#000', 2); c.fillStyle = '#ffd23f'; circ(c, 3, -72, 2.5); c.fill(); }
  c.restore();
}
function zeichnePolly(c, p, t) {
  const fl = Z.ruhig ? 0.2 : Math.sin(t * 16) * 0.7;
  c.save(); c.translate(p.x, p.y); c.scale(p.blick < 0 ? -0.5 : 0.5, 0.5); c.lineJoin = 'round';
  c.save(); c.translate(-18, 8); c.rotate(-0.5 + fl); c.beginPath(); c.moveTo(0, -8); c.quadraticCurveTo(-46, -6, -40, 34); c.quadraticCurveTo(-14, 22, 4, 12); c.closePath(); fs(c, '#2b59c3', '#000', 5); c.restore();
  ell(c, 0, 22, 26, 32); fs(c, '#3ddc97', '#000', 5);
  tri(c, -12, -32, -18, -52, -2, -40); fs(c, '#ff9f1c', '#000', 4); tri(c, 0, -36, 2, -58, 12, -38); fs(c, '#ff9f1c', '#000', 4);
  circ(c, 4, -14, 25); fs(c, '#e63946', '#000', 5);
  circ(c, 12, -18, 8.5); fs(c, '#fff', '#000', 3.5); c.fillStyle = '#000'; circ(c, 14, -17, 3.8); c.fill();
  c.beginPath(); c.moveTo(22, -12); c.quadraticCurveTo(42, -10, 38, 10); c.quadraticCurveTo(30, 0, 20, 0); c.closePath(); fs(c, '#ffd23f', '#000', 4);
  c.restore();
}

/* Schild über einem Haus: heller Grund, dunkle Schrift (Kontrast über 12:1), Symbol + Text */
function zeichneSchild(c, x, y, text, o) {
  o = o || {}; const px = schriftWelt(24, 15);
  c.font = 'bold ' + px + 'px ' + TEXT_FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
  let w = c.measureText(text).width + px * 1.1; const h = px * 1.55, zw = o.ziffer != null ? px * 1.5 : 0; w += zw;
  x = clamp(x, w / 2 + 34, Z.W - w / 2 - 34);
  if (!o.ohnePfosten) { c.fillStyle = '#000'; c.fillRect(x - w * 0.3 - 3, y, 6, h * 0.8); c.fillRect(x + w * 0.3 - 3, y, 6, h * 0.8); }
  rr(c, x - w / 2, y - h / 2, w, h, 8); fs(c, o.dunkel ? '#dfe5f5' : '#fff8dc', '#000', 4);
  if (o.gestrichelt) { c.setLineDash([8, 6]); rr(c, x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12, 4); c.strokeStyle = '#14213d'; c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
  c.fillStyle = '#14213d'; c.fillText(text, x - zw / 2, y + 1);
  if (o.ziffer != null) { rr(c, x + w / 2 - zw - px * 0.2, y - h / 2 + 5, zw, h - 10, 5); fs(c, '#010d08', '#000', 2); c.fillStyle = '#ffd23f'; c.font = 'bold ' + px * 1.05 + 'px ' + MONO_FONT; c.fillText(String(o.ziffer), x + w / 2 - zw / 2 - px * 0.2, y + 1); }
  return { w, h };
}
function schildText(g) {
  const st = raumStatus(g.nr), z = st.zustand;
  if (z === 'unsicher') return { text: '⚠️ ' + g.schild + ': ' + (st.kandidaten || []).join(' · ') };
  if (z === 'geschafft') return { text: '✅ ' + g.schild, ziffer: st.ziffer };
  if (z === 'begonnen') return { text: '▶ ' + g.schild + '  🔑 ' + st.richtig + '/' + st.von };
  if (z === 'offen') return { text: '▶ ' + g.schild };
  return { text: '🔒 ' + g.schild, dunkel: true, gestrichelt: true };
}
function codeZeichen() { return [0, 1, 2, 3].map(i => { const s = raumStatus(i); return s.zustand === 'geschafft' && s.ziffer != null ? String(s.ziffer) : s.zustand === 'unsicher' ? '?' : '_'; }); }
function zeichneTor(c, t) {
  const tor = Z.tor, bereit = !!(Z.status && Z.status.torBereit), x = tor.x + (tor.wackel > 0 ? Math.sin(tor.wackel * 40) * 5 * tor.wackel : 0), y = tor.y;
  if (bereit) { c.fillStyle = 'rgba(255,214,120,' + (0.25 + 0.2 * puls(t)) + ')'; ell(c, x, y - 30, 120, 44); c.fill(); }
  rr(c, x - 92, y - 78, 26, 110, 6); fs(c, '#3a4a7a', '#000', 4); rr(c, x + 66, y - 78, 26, 110, 6); fs(c, '#3a4a7a', '#000', 4);
  circ(c, x - 79, y - 84, 12); fs(c, '#ffe7a3', '#000', 3); circ(c, x + 79, y - 84, 12); fs(c, '#ffe7a3', '#000', 3);
  c.strokeStyle = '#000'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 66, y + 28); c.lineTo(x - 66, y - 40); c.quadraticCurveTo(x, y - 76, x + 66, y - 40); c.lineTo(x + 66, y + 28); c.stroke();
  c.strokeStyle = bereit ? '#ffd23f' : '#9aa6c8'; c.lineWidth = 4;
  for (let i = -55; i <= 55; i += 11) { const top = y - 40 - 18 * (1 - (i / 66) * (i / 66)); c.beginPath(); c.moveTo(x + i, top + 4); c.lineTo(x + i, y + 26); c.stroke(); }
  c.beginPath(); c.moveTo(x - 64, y - 10); c.lineTo(x + 64, y - 10); c.stroke();
  circ(c, x, y - 10, 17); fs(c, '#0b1736', '#000', 3); symbol(c, bereit ? 'pfeil' : 'schloss', x, y - 10, 12);
}
function zeichneTafel(c) {
  const T = Z.tafel, z = codeZeichen(), px = schriftWelt(26, 17), bw = px * 0.95, w = bw * 4 + px * 0.9, h = px * 2.5;
  c.fillStyle = '#000'; c.fillRect(T.x - 4, T.y - 6, 8, 34);
  rr(c, T.x - w / 2, T.y - h, w, h, 8); fs(c, '#010d08', '#000', 4); c.strokeStyle = '#ffd23f'; c.lineWidth = 2; rr(c, T.x - w / 2 + 5, T.y - h + 5, w - 10, h - 10, 5); c.stroke();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold ' + px * 0.5 + 'px ' + TEXT_FONT; c.fillText('CODE', T.x, T.y - h + px * 0.62);
  c.font = 'bold ' + px + 'px ' + MONO_FONT; c.fillStyle = '#ffd23f';
  for (let i = 0; i < 4; i++) c.fillText(z[i], T.x + (i - 1.5) * bw, T.y - px * 0.82);
}

function zeichne(c, t) {
  const cam = Z.cam, vw = Z.w / Z.scale, vh = Z.h / Z.scale, k = Z.scale * Z.dpr, P = Z.P;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.fillStyle = '#050b1c'; c.fillRect(0, 0, canvas.width, canvas.height);
  c.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
  const sichtbar = (x, y, m) => x > cam.x - m && x < cam.x + vw + m && y > cam.y - m && y < cam.y + vh + m;
  zeichneBoden(c, t);
  zeichneLicht(c, t);
  const nx = naechstes(), bereit = !!(Z.status && Z.status.torBereit);
  const ziel = nx >= 0 ? Z.G[nx].spot : bereit ? Z.tor.spot : null;
  if (ziel) { c.strokeStyle = '#ffd23f'; c.lineWidth = 5; c.setLineDash([12, 8]); const r = 34 + 8 * puls(t); ell(c, ziel.x, ziel.y, r, r * 0.5); c.stroke(); c.setLineDash([]); }
  if (Z.marker) { const m = Z.marker, u = 1 - m.t / 0.6; c.strokeStyle = 'rgba(255,255,255,' + (1 - u) + ')'; c.lineWidth = 4; ell(c, m.x, m.y, 10 + u * 22, (10 + u * 22) * 0.5); c.stroke(); }

  // Alles, was steht, nach y sortiert (wer weiter unten steht, verdeckt)
  const items = [], add = (y, f) => items.push({ y, f });
  const verdeckt = b => P.y < b.y && b.y - P.y < 120 * b.s && Math.abs(P.x - b.x) < 46 * b.s;
  for (const b of Z.baeume) if (sichtbar(b.x, b.y, 140)) add(b.y, () => zeichneBaum(c, b, verdeckt(b) ? 0.4 : 1));
  for (const g of Z.G) if (sichtbar(g.x, g.y, 260)) add(g.y + 40, () => zeichneGehege(c, g, t));
  add(Z.raub.y + 40, () => zeichneRaub(c, Z.raub, t));
  add(Z.brunnen.y, () => zeichneBrunnen(c, Z.brunnen, t));
  for (const l of Z.lampen) if (sichtbar(l.x, l.y, 120)) add(l.y, () => zeichneLampe(c, l, t));
  add(Z.tafel.y, () => zeichneTafel(c));
  for (const f of Z.figs) add(f.y, () => {
    if (f.art === 'waerterin') zeichnePerson(c, f.x, f.y, t, { jacke: '#2e7d5b', hose: '#3a4a7a', haut: '#e8b98f', hut: 'hut', brett: true, blick: P.x < f.x ? -1 : 1, hop: f.hop, groesse: 1.08 });
    else if (f.art === 'waechter') {
      c.save(); c.globalCompositeOperation = 'lighter'; c.translate(f.x, f.y - 10); c.rotate(f.winkel + (Z.ruhig ? 0 : Math.sin(t * 0.9) * 0.3));
      const g = c.createRadialGradient(0, 0, 8, 0, 0, 170); g.addColorStop(0, 'rgba(190,220,255,0.30)'); g.addColorStop(1, 'rgba(190,220,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 170, -0.36, 0.36); c.closePath(); c.fill(); c.restore();
      zeichnePerson(c, f.x, f.y, t, { jacke: '#26345e', hose: '#1b2646', haut: '#c98f62', hut: 'kappe', lampe: true, streifen: '#ffd23f', blick: f.blick, gehen: f.geht, hop: f.hop, groesse: 1.12 });
    } else {
      const lift = f.hop > 0 ? Math.sin((1 - clamp(f.hop, 0, 1)) * Math.PI) * 14 : 0;
      c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, f.x, f.y, 20, 7); c.fill();
      rr(c, f.x - 16, f.y - 12, 32, 12, 4); fs(c, '#5a4636', '#000', 2.5);
      emoji(c, f.emoji, f.x, f.y - 34 - lift, 42);
    }
  });
  add(P.y + 0.1, () => zeichnePerson(c, P.x, P.y, t, { jacke: '#ffd23f', hose: '#2b59c3', haut: '#dba77c', hut: 'muetze', rucksack: true, lampe: true, blick: P.blick, gehen: P.geht, hop: P.hop }));
  items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
  zeichneTor(c, t);

  // Darüber: Schilder, Pfeil, Tastatur-Rahmen, kleine Tipp-Marken – damit nichts davon verdeckt wird
  for (const g of Z.G) {
    const s = schildText(g), sy = g.rect.y0 - 46, sz = zeichneSchild(c, g.x, sy, s.text, s);
    if (g.nr === nx) { const b = Z.ruhig ? 0 : Math.abs(Math.sin(t * 4)) * 14, ay = sy - sz.h / 2 - 16 - b, sc = Math.max(1, 0.75 / Z.scale); c.save(); c.translate(g.x, ay); c.scale(sc, sc); tri(c, -20, -26, 20, -26, 0, 4); fs(c, '#ffd23f', '#000', 4); c.restore(); }
  }
  zeichneSchild(c, Z.raub.x, Z.raub.rect.y0 - 46, Z.raub.emoji + ' ' + Z.raub.name + ' 💤', { dunkel: true });
  zeichneSchild(c, Z.tor.x - 210, Z.H - Math.max(26, 20 / Z.scale), (bereit ? '▶ ' : '🔒 ') + Z.tor.name, { dunkel: !bereit, gestrichelt: !bereit, ohnePfosten: true });
  for (const f of Z.figs) if (f.art !== 'waechter') { const m = f.art === 'waerterin' ? '📋' : '🐾', by = f.y - (f.art === 'waerterin' ? 104 : 76) - (Z.ruhig ? 0 : Math.sin(t * 3 + f.x) * 3), r = Math.max(15, 13 / Z.scale); c.beginPath(); c.arc(f.x, by, r, Math.PI * 0.62, Math.PI * 0.38); c.lineTo(f.x, by + r * 1.45); c.closePath(); fs(c, '#fff', '#000', 3); emoji(c, m, f.x, by + 1, r * 1.05); }
  if (Z.fokus) { const z = zielVon(Z.fokus); if (z) { c.strokeStyle = '#fff'; c.lineWidth = 6; c.setLineDash([14, 8]); rr(c, z.rahmen.x0, z.rahmen.y0, z.rahmen.x1 - z.rahmen.x0, z.rahmen.y1 - z.rahmen.y0, 14); c.stroke(); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke(); c.setLineDash([]); } }
  if (Z.hatPolly) zeichnePolly(c, Z.polly, t);
  for (const q of Z.fx) { c.save(); c.globalAlpha = clamp(q.life / q.max * 1.6, 0, 1); c.translate(q.x, q.y); c.rotate(q.rot); c.fillStyle = q.form === 0 ? '#ffd23f' : q.form === 1 ? '#fff' : '#9ecbff'; c.strokeStyle = '#000'; c.lineWidth = 1.5; if (q.form === 0) sternForm(c, 0, 0, q.size); else if (q.form === 1) { c.beginPath(); c.rect(-q.size / 2, -q.size / 3, q.size, q.size * 0.66); } else circ(c, 0, 0, q.size / 2); c.fill(); c.stroke(); c.restore(); }

  // Bildschirm-Ebene: Sprechblasen und Pfeil zum Ziel am Rand
  c.setTransform(Z.dpr, 0, 0, Z.dpr, 0, 0);
  Z.randPfeil = null;
  if (ziel) {
    const hx = (ziel.x - cam.x) * Z.scale, hy = (ziel.y - 80 - cam.y) * Z.scale;
    if (hx < 20 || hx > Z.w - 20 || hy < 20 || hy > Z.h - 20) {
      const ax = clamp(hx, 40, Z.w - 40), ay = clamp(hy, 40, Z.h - 40), a = Math.atan2(hy - ay, hx - ax), b = Z.ruhig ? 0 : Math.sin(t * 6) * 5;
      Z.randPfeil = { x: ax, y: ay, id: nx >= 0 ? 'g' + nx : 'tor' };   // den Pfeil am Rand kann man antippen: Die Figur läuft zum Ziel
      c.save(); c.translate(ax + Math.cos(a) * b, ay + Math.sin(a) * b); circ(c, 0, 0, 26); fs(c, '#0b1736', '#ffd23f', 4); emoji(c, nx >= 0 ? Z.G[nx].emoji : Z.tor.emoji, 0, 1, 24);
      c.rotate(a); tri(c, 30, -11, 46, 0, 30, 11); fs(c, '#ffd23f', '#000', 3); c.restore();
    }
  }
  for (const b of Z.blasen) zeichneBlase(c, b);
}
function zeichneBlase(c, b) {
  const px = 17, maxW = Math.min(280, Z.w - 24); c.font = 'bold ' + px + 'px ' + TEXT_FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
  const zeilen = []; let z = '';
  for (const wort of String(b.text).split(' ')) { const probe = z ? z + ' ' + wort : wort; if (z && c.measureText(probe).width > maxW - 24) { zeilen.push(z); z = wort; } else z = probe; }
  if (z) zeilen.push(z);
  let w = 0; for (const l of zeilen) w = Math.max(w, c.measureText(l).width); w += 26;
  const h = zeilen.length * px * 1.35 + 16, ax = (b.x - Z.cam.x) * Z.scale, ay = (b.y - Z.cam.y) * Z.scale;
  const x = clamp(ax, w / 2 + 6, Z.w - w / 2 - 6), y = clamp(ay - h / 2 - 14, h / 2 + 6, Z.h - h / 2 - 6);
  c.globalAlpha = clamp(Math.min(b.t * 3, (b.max - b.t) * 6), 0, 1);
  tri(c, x - 10, y + h / 2 - 2, x + 10, y + h / 2 - 2, clamp(ax, x - w / 2 + 14, x + w / 2 - 14), y + h / 2 + 12); fs(c, '#fff', '#000', 3);
  rr(c, x - w / 2, y - h / 2, w, h, 12); fs(c, '#fff', '#000', 3);
  c.fillStyle = '#fff'; c.fillRect(x - 8, y + h / 2 - 4, 16, 5);
  c.fillStyle = '#14213d'; zeilen.forEach((l, i) => c.fillText(l, x, y - h / 2 + 8 + px * 0.68 + i * px * 1.35));
  c.globalAlpha = 1;
}

/* ============ 4. ABLAUF ============ */
function neuStart() {
  Z.P = { x: Z.start.x, y: Z.start.y, blick: 1, winkel: -Math.PI / 2, geht: false, weg: null, tempo: GESCHW, ankunft: null, hop: 0 };
  if (!frei(Z.P.x, Z.P.y)) { const k = naheFrei(Z.P.x, Z.P.y); if (k >= 0) { Z.P.x = (k % Z.cols + 0.5) * ZELLE; Z.P.y = (Math.floor(k / Z.cols) + 0.5) * ZELLE; } }
  Z.polly = { x: Z.P.x - 50, y: Z.P.y - 110, blick: 1 };
  Z.blasen = []; Z.fx = []; Z.marker = null; Z.gewarnt = false; Z.jubel = -1; Z.neueMission = false;
  for (const f of Z.figs) if (f.runde) { f.x = f.runde[0].x; f.y = f.runde[0].y; f.ziel = 1 % f.runde.length; }
  kameraZu(1);
}
function kameraZu(k) {
  const vw = Z.w / Z.scale, vh = Z.h / Z.scale;
  const tx = vw >= Z.W ? (Z.W - vw) / 2 : clamp(Z.P.x - vw / 2, 0, Z.W - vw), ty = vh >= Z.H ? (Z.H - vh) / 2 : clamp(Z.P.y - vh / 2 - 30, 0, Z.H - vh);
  Z.cam.x = lerp(Z.cam.x, tx, k); Z.cam.y = lerp(Z.cam.y, ty, k);
}
function laufZu(x, y, ankunft) {
  const P = Z.P, weg = findeWeg(P.x, P.y, x, y);
  P.weg = weg; P.ankunft = weg ? ankunft || null : null;
  if (weg && weg.length) {
    P.tempo = Math.max(GESCHW, wegLaenge(weg, P.x, P.y) / MAX_LAUFZEIT);   // kein Lauf über ~5 Sekunden
    const e = weg[weg.length - 1]; Z.marker = { x: e.x, y: e.y, t: 0.6 };
  }
  return !!weg;
}
// Alles, was man antippen kann: Standplatz davor, Rahmen (für Tastatur-Fokus) und was dort passiert
function zielVon(id) {
  if (id[0] === 'g') { const g = Z.G[+id.slice(1)]; return g ? { spot: g.spot, schau: g, rahmen: { x0: g.rect.x0 - 14, y0: g.rect.y0 - 20, x1: g.rect.x1 + 14, y1: g.spot.y + 16 }, tun: () => amGehege(g.nr) } : null; }
  if (id === 'tor') return { spot: Z.tor.spot, schau: Z.tor, rahmen: { x0: Z.tor.x - 100, y0: Z.tor.y - 100, x1: Z.tafel.x + 80, y1: Z.tor.y + 30 }, tun: amTor };
  if (id === 'raub') return { spot: Z.raub.spot, schau: Z.raub, rahmen: { x0: Z.raub.rect.x0 - 14, y0: Z.raub.rect.y0 - 20, x1: Z.raub.rect.x1 + 14, y1: Z.raub.spot.y + 16 }, tun: () => sage(Z.texte.loewe) };
  const f = Z.figs.find(q => q.id === id); if (!f) return null;
  const seite = Z.P.x < f.x ? -1 : 1;
  return { spot: { x: f.x + seite * 52, y: f.y + 10 }, schau: f, rahmen: { x0: f.x - 40, y0: f.y - 110, x1: f.x + 40, y1: f.y + 14 }, tun: () => beiFigur(f) };
}
function geheZu(id) {
  const z = zielVon(id); if (!z) return false;
  const tun = () => { Z.P.blick = z.schau.x < Z.P.x - 4 ? -1 : 1; Z.P.winkel = Math.atan2(z.schau.y - 40 - Z.P.y, z.schau.x - Z.P.x); z.tun(); };
  if (dist(Z.P.x, Z.P.y, z.spot.x, z.spot.y) < 14) { Z.P.weg = null; tun(); return true; }
  if (!laufZu(z.spot.x, z.spot.y, tun)) { tun(); }
  return true;
}
function amGehege(i) {
  const frisch = API.status(); if (frisch) Z.status = frisch;
  const st = raumStatus(i), g = Z.G[i];
  if (st.zustand === 'gesperrt') { g.wackel = 1; Sfx.play('zu'); sage(Z.texte.gesperrt); return; }
  if (st.zustand === 'geschafft' || st.zustand === 'unsicher') { Sfx.play('tipp'); sage(Z.texte.schonGeschafft); return; }
  Sfx.play('plopp');
  if (!API.oeffneRaum(i)) { g.wackel = 1; sage(Z.texte.gesperrt); }
}
function amTor() {
  const frisch = API.status(); if (frisch) Z.status = frisch;
  if (Z.status && Z.status.torBereit) { Sfx.play('plopp'); API.zeigeTor(); }
  else { Z.tor.wackel = 1; Sfx.play('zu'); sage(Z.texte.torZu); }
}
function beiFigur(f) {
  f.hop = 1; Sfx.play('tipp');
  if (f.art === 'waerterin') {
    const nx = naechstes();
    if (nx < 0) { sage(Z.status && Z.status.torBereit ? Z.texte.waerterinFertig : Z.texte.torZu); return; }
    zeigeRegel(nx);
  } else if (f.art === 'tier') {
    let w = null; try { w = API.zufallsWort(); } catch (e) {}
    const text = w ? '🐾 ' + w.en + ' = ' + w.de : '🐾';
    blase(f.x, f.y - 84, text, 3.5, f.id); if (w) ansage(f.name + ': ' + w.en + ' heißt ' + w.de);
  } else if (f.art === 'waechter') blase(f.x, f.y - 100, '🔦 ' + Z.texte.waechter, 2.5, f.id);
}
function pollyTipp() {
  const nx = naechstes();
  if (nx >= 0) sage(fuelle(Z.texte.tipp, { name: Z.G[nx].schild })); else if (Z.status && Z.status.torBereit) sage(Z.texte.tippTor);
  funken(Z.polly.x, Z.polly.y, 6, { sp: 120 }); Sfx.play('tipp');
}
function jubeln(i) {
  const g = Z.G[i]; Z.jubel = -1; if (!g) return;
  Sfx.play('jubel'); funken(g.x, g.rect.y0 - 46, 26, { up: 120, sp: 260 }); funken(Z.tafel.x, Z.tafel.y - 40, 14, { up: 100 });
  Z.pollyJubel = 1.6; blase(Z.polly.x, Z.polly.y - 30, Z.texte.jubel, 2.6, 'polly');
}
function pruefeStatus() {
  const s = API.status(); if (!s) return;
  Z.status = s;
  const sig = s.raeume.map(r => r.zustand + r.richtig + (r.ziffer == null ? '' : r.ziffer) + (r.kandidaten || []).join('')).join('|') + s.torBereit;
  if (sig !== Z.sig) { Z.sig = sig; aktualisiereListe(); }
  // Nachtwächter: letzte zwei Minuten, genau einmal pro Mission
  const z = s.zeit;
  if (z && z.mitLimit && !z.pausiert && z.restSekunden != null && z.restSekunden <= 120 && z.restSekunden > 0 && !Z.gewarnt) {
    Z.gewarnt = true;
    const w = Z.figs.find(f => f.art === 'waechter');
    if (w) { w.hop = 1; blase(w.x, w.y - 100, '⏱ ' + Z.texte.waechter, 4, w.id); }
    if (z.restSekunden < 118) sage('zeitWarnung');   // bei genau 2:00 sagt das Spiel den Satz schon selbst
  }
}

function schritt(dt) {
  Z.zeit += dt; const P = Z.P;
  let geht = false;
  // Tastatur: Pfeile oder WASD
  const K = Z.tasten, kx = (K.has('ArrowRight') || K.has('KeyD') ? 1 : 0) - (K.has('ArrowLeft') || K.has('KeyA') ? 1 : 0), ky = (K.has('ArrowDown') || K.has('KeyS') ? 1 : 0) - (K.has('ArrowUp') || K.has('KeyW') ? 1 : 0);
  if ((kx || ky) && !regelOffen()) {
    P.weg = null; P.ankunft = null;
    const n = Math.hypot(kx, ky), sp = GESCHW * dt, nx = P.x + kx / n * sp, ny = P.y + ky / n * sp;
    if (frei(nx, P.y)) P.x = nx; if (frei(P.x, ny)) P.y = ny;
    if (kx) P.blick = kx; P.winkel = Math.atan2(ky, kx); geht = true;
  }
  if (P.weg && P.weg.length) {
    const wp = P.weg[0], d = dist(P.x, P.y, wp.x, wp.y), sp = P.tempo * dt;
    if (d <= sp) { P.x = wp.x; P.y = wp.y; P.weg.shift(); if (!P.weg.length) { const cb = P.ankunft; P.ankunft = null; P.weg = null; if (cb) cb(); } }
    else { if (Math.abs(wp.x - P.x) > 3) P.blick = wp.x > P.x ? 1 : -1; P.winkel = Math.atan2(wp.y - P.y, wp.x - P.x); P.x += (wp.x - P.x) / d * sp; P.y += (wp.y - P.y) / d * sp; }
    geht = true;
  }
  P.geht = geht; if (P.hop > 0) P.hop -= dt * 2;
  if (!Z.sichtbar) return;   // am Ziel hat sich ein Raum geöffnet → Karte ist schon ausgeblendet
  // Polly fliegt hinterher
  const po = Z.polly, jub = Z.pollyJubel > 0 ? Z.pollyJubel : 0; if (Z.pollyJubel > 0) Z.pollyJubel -= dt;
  const zx = P.x - P.blick * 46 + (jub && !Z.ruhig ? Math.cos(Z.zeit * 9) * 40 : 0), zy = P.y - 112 + (Z.ruhig ? 0 : Math.sin(Z.zeit * 2.4) * 6) + (jub && !Z.ruhig ? Math.sin(Z.zeit * 9) * 26 : 0);
  if (Math.abs(zx - po.x) > 6) po.blick = zx > po.x ? 1 : -1; else po.blick = P.blick;
  po.x = lerp(po.x, zx, Math.min(1, dt * 4)); po.y = lerp(po.y, zy, Math.min(1, dt * 4));
  // Nachtwächter dreht langsam seine Runde (bei „weniger Bewegung“ bleibt er stehen)
  for (const f of Z.figs) {
    if (f.hop > 0) f.hop -= dt * 2;
    if (f.art !== 'waechter') continue;
    f.geht = false; if (Z.ruhig || f.runde.length < 2) continue;
    const q = f.runde[f.ziel], d = dist(f.x, f.y, q.x, q.y), sp = 46 * dt;
    if (d <= sp) { f.x = q.x; f.y = q.y; f.ziel = (f.ziel + 1) % f.runde.length; }
    else { f.x += (q.x - f.x) / d * sp; f.y += (q.y - f.y) / d * sp; if (Math.abs(q.x - f.x) > 3) f.blick = q.x > f.x ? 1 : -1; const a = Math.atan2(q.y - f.y, q.x - f.x); let da = a - f.winkel; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; f.winkel += da * Math.min(1, dt * 3); f.geht = true; }
  }
  for (const g of Z.G) if (g.wackel > 0) g.wackel -= dt * 2.2;
  if (Z.tor.wackel > 0) Z.tor.wackel -= dt * 2.2;
  if (Z.marker && (Z.marker.t -= dt) <= 0) Z.marker = null;
  for (let i = Z.blasen.length - 1; i >= 0; i--) { const b = Z.blasen[i]; b.t -= dt; if (b.id === 'polly') { b.x = po.x; b.y = po.y - 30; } if (b.t <= 0) Z.blasen.splice(i, 1); }
  for (let i = Z.fx.length - 1; i >= 0; i--) { const q = Z.fx[i]; q.life -= dt; if (q.life <= 0) { Z.fx.splice(i, 1); continue; } q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt; }
  kameraZu(Z.ruhig ? 1 : Math.min(1, dt * 5));
  Z.pollT -= dt; if (Z.pollT <= 0) { Z.pollT = 0.5; pruefeStatus(); }
  if (Z.jubel >= 0 && !P.geht) jubeln(Z.jubel);
}
function bild(jetzt) {
  Z.raf = 0; if (!Z.sichtbar) return;
  const dt = Math.min(0.05, Math.max(0, (jetzt - Z.letzte) / 1000)); Z.letzte = jetzt;
  try { schritt(dt); if (Z.sichtbar) zeichne(ctx, Z.zeit); Z.fehler = 0; }
  catch (e) {
    if (window.console) console.error('Zoo-Karte', e);
    if (++Z.fehler >= 3) { notAus(); return; }   // Karte defekt → klassische Übersicht
  }
  if (Z.sichtbar && !Z.raf) Z.raf = requestAnimationFrame(bild);
}
function starteSchleife() { if (!Z.raf && Z.sichtbar && !document.hidden) { Z.letzte = performance.now(); Z.raf = requestAnimationFrame(bild); } }
function stoppeSchleife() { if (Z.raf) { cancelAnimationFrame(Z.raf); Z.raf = 0; } }
function notAus() { verbergen(); try { API.zeigeTor(); } catch (e) {} }

/* ============ 5. EINGABE ============ */
function zuWelt(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / Z.scale + Z.cam.x, y: (e.clientY - r.top) / Z.scale + Z.cam.y }; }
function tipp(x, y) {
  const m = Math.max(0, 24 / Z.scale);   // Trefferfläche mindestens 48 × 48 Bildschirm-Pixel
  for (const f of Z.figs) if (Math.abs(x - f.x) < Math.max(34, m) && y > f.y - Math.max(120, m * 2 + 60) && y < f.y + Math.max(14, m * 0.4)) { Sfx.play('tipp'); geheZu(f.id); return; }
  for (const g of Z.G) if (x > g.rect.x0 - 12 && x < g.rect.x1 + 12 && y > g.rect.y0 - 80 && y < g.spot.y + 18) { Sfx.play('tipp'); geheZu('g' + g.nr); return; }
  const r = Z.raub.rect; if (x > r.x0 && x < r.x1 && y > r.y0 - 70 && y < r.y1 + 10) { Sfx.play('tipp'); geheZu('raub'); return; }
  const t = Z.tor; if ((Math.abs(x - t.x) < 100 && y > t.y - 140) || (Math.abs(x - Z.tafel.x) < Math.max(70, m) && Math.abs(y - Z.tafel.y + 40) < Math.max(50, m))) { Sfx.play('tipp'); geheZu('tor'); return; }
  if (Z.hatPolly && dist(x, y, Z.polly.x, Z.polly.y) < Math.max(36, m)) { pollyTipp(); return; }   // Polly zuletzt, damit sie keine Tür verdeckt
  laufZu(x, y);
}
function regelOffen() { return !!regelBox && !regelBox.hidden; }
function verdrahteEingabe() {
  hoere(canvas, 'pointerdown', e => {
    if (e.button > 0) return;
    e.preventDefault(); if (regelOffen()) { schliesseRegel(); return; }
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const p = zuWelt(e); Z.zeiger = { id: e.pointerId, sx: e.clientX, sy: e.clientY, t: Z.zeit, frei: false };
    const rp = Z.randPfeil, cr = canvas.getBoundingClientRect();
    if (rp && dist(e.clientX - cr.left, e.clientY - cr.top, rp.x, rp.y) < 40) { Sfx.play('tipp'); geheZu(rp.id); return; }
    tipp(p.x, p.y); if (Z.zeiger) Z.zeiger.frei = !Z.P.ankunft;   // nur beim freien Laufen folgt die Figur dem Finger
  });
  hoere(canvas, 'pointermove', e => {
    // Finger gedrückt halten und ziehen: Die Figur läuft dem Finger nach
    const z = Z.zeiger; if (!z || z.id !== e.pointerId || !z.frei || Z.zeit - z.t < 0.22 || dist(e.clientX, e.clientY, z.sx, z.sy) < 30) return;
    z.t = Z.zeit; const p = zuWelt(e); laufZu(p.x, p.y);
  });
  const ende = e => { if (Z.zeiger && Z.zeiger.id === e.pointerId) Z.zeiger = null; };
  hoere(canvas, 'pointerup', ende); hoere(canvas, 'pointercancel', ende);
  hoere(canvas, 'contextmenu', e => e.preventDefault());
  const LAUF = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
  hoere(window, 'keydown', e => {
    if (!Z.sichtbar || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Escape' && regelOffen()) { schliesseRegel(); return; }
    const el = e.target, tag = el && el.tagName, inKarte = el && box.contains(el), aussen = !inKarte && tag && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag);
    if (aussen || regelOffen()) return;
    if (LAUF.includes(e.code)) { e.preventDefault(); Z.tasten.add(e.code); return; }
    if ((e.code === 'Enter' || e.code === 'Space') && tag !== 'BUTTON' && !e.repeat) {
      e.preventDefault();
      let best = null, bd = 190; const P = Z.P;
      for (const id of alleZiele()) { const z = zielVon(id); if (!z) continue; const d = dist(P.x, P.y, z.spot.x, z.spot.y); if (d < bd) { bd = d; best = id; } }
      if (best) geheZu(best);
    }
  });
  hoere(window, 'keyup', e => Z.tasten.delete(e.code));
  hoere(window, 'blur', () => { Z.tasten.clear(); Z.zeiger = null; });
  hoere(document, 'visibilitychange', () => { if (document.hidden) stoppeSchleife(); else starteSchleife(); });
  let warte = 0; const spaeter = () => { if (warte) return; warte = setTimeout(sicher(() => { warte = 0; groesse(); }), 60); };   // verzögert, damit keine Mess-Schleife entsteht
  hoere(window, 'resize', spaeter);
  hoere(window, 'orientationchange', () => setTimeout(sicher(groesse), 250));
  if (window.ResizeObserver) { const kopf = document.getElementById('kopf'); if (kopf) new ResizeObserver(spaeter).observe(kopf); }
  try { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); Z.ruhig = mq.matches; const f = () => { Z.ruhig = mq.matches; }; if (mq.addEventListener) hoere(mq, 'change', f); else if (mq.addListener) mq.addListener(f); } catch (e) {}
}
function alleZiele() { return Z.G.map(g => 'g' + g.nr).concat(['tor'], Z.figs.filter(f => f.art !== 'waechter').map(f => f.id)); }

/* Unsichtbare Knopfliste für Tastatur (Tab) und Screenreader, z. B. „Affenhaus, offen“ */
function aktualisiereListe() {
  if (!srListe || !Z.gebaut) return;
  const eintraege = [];
  for (const g of Z.G) {
    const st = raumStatus(g.nr); let text = g.schild + ', ' + (WORT[st.zustand] || st.zustand);
    if (st.zustand === 'geschafft' && st.ziffer != null) text += ', Ziffer ' + st.ziffer;
    if (st.zustand === 'unsicher') text += ': eine von ' + (st.kandidaten || []).join(', ');
    if (st.zustand === 'begonnen') text += ', ' + st.richtig + ' von ' + st.von;
    if (g.nr === naechstes()) text += ' – hier geht es weiter';
    eintraege.push({ id: 'g' + g.nr, text });
  }
  const bereit = !!(Z.status && Z.status.torBereit);
  eintraege.push({ id: 'tor', text: Z.tor.name + ', ' + (bereit ? 'bereit: Zahlenschloss öffnen' : 'noch gesperrt') + '. Code bisher: ' + codeZeichen().map(z => z === '_' ? 'offen' : z === '?' ? 'unsicher' : z).join(', ') });
  for (const f of Z.figs) if (f.art === 'waerterin') eintraege.push({ id: f.id, text: f.name + ': Regelkarte zeigen' }); else if (f.art === 'tier') eintraege.push({ id: f.id, text: f.name + ': ein englisches Wort hören' });
  const knoepfe = srListe.querySelectorAll('button');
  if (knoepfe.length !== eintraege.length) {
    srListe.textContent = '';
    for (const e of eintraege) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.ziel = e.id; b.textContent = e.text;
      hoere(b, 'focus', () => { Z.fokus = e.id; }); hoere(b, 'blur', () => { if (Z.fokus === e.id) Z.fokus = null; });
      hoere(b, 'click', () => { if (regelOffen()) schliesseRegel(); geheZu(e.id); });
      srListe.appendChild(b);
    }
  } else eintraege.forEach((e, i) => { if (knoepfe[i].textContent !== e.text) knoepfe[i].textContent = e.text; });
}

/* Regelkarte der Zoowärterin */
function zeigeRegel(nr) {
  let text = ''; try { text = API.regel(nr) || ''; } catch (e) {}
  regelBox.querySelector('.zk-regel-titel').textContent = '📋 ' + fuelle(Z.texte.regelTitel, { name: Z.G[nr].schild });
  regelBox.querySelector('.zk-regel-text').textContent = text || Z.texte.keineRegel;
  regelBox.hidden = false; Z.tasten.clear();
  try { regelBox.querySelector('button').focus({ preventScroll: true }); } catch (e) {}
}
function schliesseRegel() { if (!regelBox || regelBox.hidden) return; const hatte = regelBox.contains(document.activeElement); regelBox.hidden = true; if (hatte) { try { canvas.focus({ preventScroll: true }); } catch (e) {} } }

/* ============ 6. EINBETTUNG ============ */
const CSS = '.zk{position:relative;margin:0 0 12px;border:4px solid #000;border-radius:18px;overflow:hidden;background:#050b1c;box-shadow:0 8px 0 rgba(0,0,0,.45)}' +
  '.zk[hidden]{display:none}' +
  '.zk canvas{display:block;width:100%;height:100%;touch-action:none;outline:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;cursor:pointer}' +
  '.zk canvas:focus-visible{outline:4px solid #ffd23f;outline-offset:-6px}' +
  '.zk-sr{position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
  '.zk-regel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:92%;max-width:460px;max-height:92%;overflow:auto;padding:14px 16px;background:#fffbe0;color:#14213d;border:4px solid #000;border-radius:16px;box-shadow:0 6px 0 rgba(0,0,0,.45);font-size:1.05rem;line-height:1.45}' +
  '.zk-regel[hidden]{display:none}' +
  '.zk-regel-titel{margin:0 0 6px;font-size:1.15rem}' +
  '.zk-regel-text{margin:0 0 12px}' +
  '.zk-regel button{min-width:48px;min-height:48px;padding:8px 18px;font:inherit;font-weight:700;color:#14213d;background:#ffd23f;border:3px solid #000;border-radius:12px;cursor:pointer}';

function baueDom() {
  if (box) return;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  box = document.createElement('div'); box.className = 'zk'; box.id = 'zooKarte'; box.hidden = true;
  canvas = document.createElement('canvas'); canvas.tabIndex = 0; canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Zoo-Karte. Tippe auf einen Ort, dann läuft die Spielfigur hin. Mit der Tabulator-Taste erreichst du alle Orte als Knöpfe.');
  ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Zoo-Karte: Zeichenfläche nicht verfügbar');
  srListe = document.createElement('div'); srListe.className = 'zk-sr'; srListe.setAttribute('role', 'group'); srListe.setAttribute('aria-label', 'Orte auf der Zoo-Karte');
  srLive = document.createElement('div'); srLive.className = 'zk-sr'; srLive.setAttribute('role', 'status'); srLive.setAttribute('aria-live', 'polite');
  regelBox = document.createElement('div'); regelBox.className = 'zk-regel'; regelBox.hidden = true; regelBox.setAttribute('role', 'dialog'); regelBox.setAttribute('aria-label', 'Regelkarte');
  const h = document.createElement('h3'); h.className = 'zk-regel-titel'; const p = document.createElement('p'); p.className = 'zk-regel-text';
  const zu = document.createElement('button'); zu.type = 'button'; zu.textContent = 'Schließen'; hoere(zu, 'click', schliesseRegel);
  regelBox.append(h, p, zu);
  box.append(canvas, srListe, srLive, regelBox);
  const ueb = document.getElementById('uebersicht'), main = document.querySelector('main');
  if (ueb && ueb.parentNode) ueb.parentNode.insertBefore(box, ueb.nextSibling); else if (main) main.appendChild(box); else throw new Error('Zoo-Karte: Platz in der Seite nicht gefunden');
  verdrahteEingabe();
}
// Die Karte füllt den Platz unter der Kopfleiste – hochkant wie quer, Handy wie iPad
function groesse() {
  if (!box || box.hidden) return;
  const oben = box.getBoundingClientRect().top + (window.pageYOffset || 0);
  const fenster = window.innerHeight || 600;
  let h = clamp(Math.floor(fenster - oben - 24), 280, 1100);
  if (box.style.height !== h + 'px') box.style.height = h + 'px';
  const zuViel = document.documentElement.scrollHeight - fenster;   // Seite soll unter der Karte nicht scrollen müssen
  if (zuViel > 0 && h > 280) { h = Math.max(280, h - zuViel); box.style.height = h + 'px'; }
  const w = Math.max(200, canvas.clientWidth || box.clientWidth || 300), hh = Math.max(200, canvas.clientHeight || h);
  Z.dpr = Math.min(window.devicePixelRatio || 1, 2);   // höchstens 2×, damit ältere iPads flüssig bleiben
  const cw = Math.round(w * Z.dpr), ch = Math.round(hh * Z.dpr);
  if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  Z.w = w; Z.h = hh;
  Z.scale = Math.max(w / Z.W, hh / Z.H, 0.5);   // Karte füllt die Fläche; auf schmalen Geräten folgt die Kamera der Figur
  if (Z.P) { kameraZu(1); if (Z.sichtbar && !Z.raf) { try { zeichne(ctx, Z.zeit); } catch (e) {} } }
}

function zeigen(status) {
  const welt = API.welt();
  if (!welt || !welt.karte || !Array.isArray(welt.raeume)) { angemeldet = false; throw new Error('Zoo-Karte: Für diese Klasse gibt es keine Kartendaten (welt.karte).'); }
  baueDom();
  const schluessel = welt.klasse + '|' + welt.name;
  if (Z.gebaut !== schluessel) { baue(welt); Z.neueMission = true; srListe.textContent = ''; }
  Z.status = status || API.status(); Z.sig = '';
  box.hidden = false; Z.sichtbar = true; groesse();
  if (Z.neueMission || !Z.P) neuStart();
  Z.P.weg = null; Z.P.ankunft = null; Z.tasten.clear(); Z.zeiger = null; Z.pollT = 0;
  pruefeStatus(); aktualisiereListe(); kameraZu(1);
  zeichne(ctx, Z.zeit);
  starteSchleife();
}
function verbergen() {
  Z.sichtbar = false; stoppeSchleife();
  if (box) { box.hidden = true; if (regelBox) regelBox.hidden = true; }
  Z.tasten.clear(); Z.zeiger = null; Z.fokus = null; if (Z.P) { Z.P.weg = null; Z.P.ankunft = null; Z.P.geht = false; }
}
const KARTE = { zeigen, verbergen };
function anmelden() {
  if (angemeldet) return;
  let welt = null; try { welt = API.welt(); } catch (e) {}
  if (!welt || !welt.karte) return;
  angemeldet = true;
  if (!API.karteAnmelden(KARTE)) angemeldet = false;
}

API.on('bildschirm', sicher(e => {
  if (e && (e.id === 'intro' || e.id === 'setup')) Z.neueMission = true;   // neue Mission: Figur startet wieder am Tor
  if (angemeldet) return;
  if (e && e.id === 'uebersicht') setTimeout(sicher(anmelden), 0); else anmelden();
}));
API.on('ziffer', sicher(e => { if (e && typeof e.raum === 'number') Z.jubel = e.raum; }));
sicher(anmelden)();

// Nur zum Nachschauen in der Konsole (Entwicklerwerkzeuge). Ändert nichts am Spiel.
window.ZooKarte = Object.freeze({
  version: VERSION,
  speichert: 'nichts',
  sichtbar: () => Z.sichtbar,
  laeuft: () => !!Z.raf,
  zustand: () => ({ sichtbar: Z.sichtbar, schleife: !!Z.raf, figur: Z.P ? { x: Math.round(Z.P.x), y: Math.round(Z.P.y), geht: Z.P.geht } : null, massstab: Z.scale, flaeche: { b: Z.w, h: Z.h }, gewarnt: Z.gewarnt, ziele: Z.gebaut ? alleZiele() : [] }),
  geheZu: id => Z.sichtbar ? geheZu(String(id)) : false,
  laufzeit: (von, nach) => { const a = zielVon(von), b = zielVon(nach); if (!a || !b) return null; const w = findeWeg(a.spot.x, a.spot.y, b.spot.x, b.spot.y); if (!w) return null; const l = wegLaenge(w, a.spot.x, a.spot.y); return Math.round(l / Math.max(GESCHW, l / MAX_LAUFZEIT) * 10) / 10; },
  randPfeil: () => { if (!Z.randPfeil || !canvas) return null; const r = canvas.getBoundingClientRect(); return { x: r.left + Z.randPfeil.x, y: r.top + Z.randPfeil.y, id: Z.randPfeil.id }; },
  bildschirmPunkt: id => { const z = zielVon(id); if (!z || !canvas) return null; const r = canvas.getBoundingClientRect(); return { x: r.left + (z.schau.x - Z.cam.x) * Z.scale, y: r.top + (z.schau.y - 30 - Z.cam.y) * Z.scale }; }
});
})();
