/* =====================================================================
   KARTEN-MOTOR („Entdecker-Modus“) für den Grammar Escape Room
   ---------------------------------------------------------------------
   Zweck:    Ersetzt die Übersicht mit den Kacheln durch eine begehbare
             Karte. Man tippt auf die Karte, die Spielfigur läuft hin,
             und am Raum öffnet sich der gewohnte Aufgabenraum.
             Die Karte zeichnet und steuert nur. Aufgaben, Zeit, Ziffern
             und Zahlenschloss bleiben in index.html (über EscapeAPI).
   Version:  karte 0.4  (passt zu App-Version 0.6.8, Testbereich)
   Aufbau:   Diese Datei ist der gemeinsame MOTOR für alle Welten:
             Kamera, Wegsuche, Eingabe, Figuren-Ablauf, Räume mit
             Zuständen, Ausgang mit Code-Tafel, Einbettung.
             Das AUSSEHEN einer Welt steht in einer eigenen Datei
             welt/stil-<name>.js (zoo, agenten, schiff, museum,
             detektiv, station). Welche Datei gilt, steht in den Daten:
             KN.welt.karte.stil. Die Stil-Datei wird von hier selbst
             nachgeladen, nur aus diesem Ordner. Fehlt sie, zeichnet der
             Motor ein neutrales Aussehen.
   Daten:    Positionen und Texte stehen in daten/klasseN.js unter
             KN.welt.karte. Hier im Code steht nichts Festes davon.
   Speichert nichts: kein localStorage, keine Cookies, kein Netzwerk
             (außer dem Nachladen der eigenen Stil-Datei), keine fremden
             Schriften oder Bilder. Alles wird gezeichnet.

   Änderungsliste:
     0.4  (15.11.2026)  Aus der Zoo-Karte wird ein Motor für alle Welten.
          Zoo-Aussehen herausgelöst nach stil-zoo.js (sieht aus wie
          vorher). Neu: Grundstil „neutral“, Stil-Dateien für Klasse 6–10,
          Begleitfiguren, die am Boden mitlaufen, allgemeine Hindernisse,
          Rollen-Namen für Figuren (begleiter, regel, zeit, wort).
          Die Jubel-Blase nach einer neuen Ziffer hängt jetzt unter der
          Spielfigur, damit Schild und Ziffer lesbar bleiben (alle Welten).
     0.3  (13.11.2026)  Wörter-Rucksack wieder entfernt. Die Tiere am Weg
          zeigen ein Wort, möglichst nicht zweimal dasselbe.
     0.2  (13.11.2026)  Lebendigere Figuren: Wächter ruft, Begleitfigur
          kommentiert, Zusatzraum reagiert aufs Antippen, Pfeil am
          Bildrand ist antippbar.
     0.1  (13.11.2026)  Erste Fassung als Zoo-Karte.

   Aufbau dieser Datei:
     1. Hilfen und Zustand
     2. Karte aufbauen (Geometrie, Hindernisse, Wegsuche)
     3. Zeichnen (Hilfen, Stil-Verwaltung, Grundstil, Ablauf des Bildes)
     4. Ablauf (Bewegung, Figuren, Hinweise)
     5. Eingabe (Finger, Maus, Tastatur, Knopfliste für Screenreader)
     6. Einbettung (Container, zeigen/verbergen, Anmeldung bei EscapeAPI)
   ===================================================================== */
(function () {
'use strict';
if (window.ZooKarte) return;
const API = window.EscapeAPI;
if (!API || typeof API.karteAnmelden !== 'function') { if (window.console) console.warn('Karte: EscapeAPI fehlt – es bleibt bei der klassischen Übersicht.'); return; }
// Ordner dieser Datei: Nur von hier werden die Stil-Dateien (stil-<name>.js) nachgeladen.
const ORDNER = (() => { try { const src = document.currentScript && document.currentScript.src; return src ? src.replace(/[^\/]*$/, '') : 'welt/'; } catch (e) { return 'welt/'; } })();

/* ============ 1. HILFEN UND ZUSTAND ============ */
const VERSION = '0.4';
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

// Ersatztexte, falls weder der Stil noch die Daten einen Text mitbringen (neutral, ohne Welt-Wörter)
const TEXTE = {
  gesperrt: 'Dieser Raum ist noch zu. Schafft zuerst den Raum mit dem Pfeil!',
  schonGeschafft: 'Hier habt ihr die Ziffer schon gefunden. Weiter geht’s!',
  torZu: 'Erst alle vier Räume schaffen!',
  zusatz: '',
  zusatzKurz: '',
  zusatzReaktion: [],
  jubel: 'Eine neue Ziffer!',
  tipp: 'Als Nächstes: {name}! Folgt dem Pfeil.',
  tippTor: 'Alle Ziffern gefunden! Auf zum Ausgang.',
  regelTitel: 'Regel für: {name}',
  keineRegel: 'Für diesen Raum gibt es keine Regelkarte.',
  waerterinFertig: 'Alles geschafft! Jetzt schnell zum Ausgang.',
  waechter: 'Beeilt euch!',
  waechterRuf: ['Wer ist da?'],
  pollyGeschafft: [],
  pollyWarten: ['Weiter geht’s: {name}!'],
  pollyZurueck: ['Nicht aufgeben! Gleich noch einmal.'],
  schliessen: 'Schließen'
};
const wahl = t => Array.isArray(t) ? (t.length ? t[Math.floor(Math.random() * t.length)] : '') : String(t || '');

// Alles, was sich ändert, steht in Z (Zustand). Es wird nichts davon gespeichert.
const Z = {
  gebaut: null, sichtbar: false, raf: 0, letzte: 0, zeit: 0, fehler: 0,
  W: 1600, H: 1000, w: 300, h: 300, dpr: 1, scale: 1, cam: { x: 0, y: 0 },
  status: null, sig: '', pollT: 0, neueMission: true, gewarnt: false, jubel: -1,
  P: null, polly: null, figs: [], G: [], raub: null, tor: null, brunnen: null, tafel: null,
  baeume: [], lampen: [], wege: [], flecken: [], sterne: [], hind: [], deko: [],
  blasen: [], fx: [], marker: null, randPfeil: null, letztesWort: '', orte: [], ruhe: 0, sagBald: null, loeweNr: 0, fokus: null, zeiger: null, tasten: new Set(), ruhig: false
};
let box = null, canvas = null, ctx = null, srListe = null, srLive = null, regelBox = null, angemeldet = false;
let S = null;   // der Stil (das Aussehen) der aktuellen Welt

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
    else if (name === 'huch') { this.ton(520, 0.09, { type: 'square', vol: 0.06 }); this.ton(780, 0.14, { type: 'square', vol: 0.06, at: 0.1 }); }
    else if (name === 'schnarch') { this.ton(110, 0.5, { to: 70, type: 'sawtooth', vol: 0.08 }); this.ton(180, 0.3, { to: 240, type: 'sine', vol: 0.05, at: 0.55 }); }
    else if (name === 'summ') { this.ton(220, 0.25, { to: 330, type: 'sawtooth', vol: 0.05 }); }
    else if (name === 'jubel') [523, 659, 784, 1047].forEach((f, i) => this.ton(f, 0.18, { at: i * 0.09 }));
  }
};

// Die App zeigt bei jedem unbehandelten Fehler eine Fehlermeldung. Deshalb fängt die Karte ihre Fehler selbst ab.
function sicher(fn) { return function (e) { try { return fn.call(this, e); } catch (err) { if (window.console) console.error('Karte', err); } }; }
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

// Welche Rolle hat eine Figur? (alte Zoo-Namen und neue, allgemeine Namen)
const ROLLE = { polly: 'begleiter', begleiter: 'begleiter', waerterin: 'waerterin', regel: 'waerterin', waechter: 'waechter', zeit: 'waechter', tier: 'tier', wort: 'tier' };
const stilName = D => (D && typeof D.stil === 'string' && D.stil) || (D && D.gehege ? 'zoo' : '');

function baue(welt) {
  const D = welt.karte;
  S = stilFuer(stilName(D));
  const W = Z.W = clamp(zahl(D.groesse && D.groesse.b, 1600), 800, 3000), H = Z.H = clamp(zahl(D.groesse && D.groesse.h, 1000), 600, 2400);
  Z.texte = Object.assign({}, TEXTE, S.texte || {}, D.texte || {});
  const M = S.masse, rd = D.raeume || D.gehege || [];
  // Räume (Reihenfolge = Raum 0 … 3)
  Z.G = welt.raeume.map((r, i) => {
    const d = rd[i] || {}, x = zahl(d.x, i % 2 ? W - 300 : 300), y = zahl(d.y, i < 2 ? 300 : H - 300);
    return { nr: i, x, y, schild: d.schild || r.name, emoji: r.emoji, rect: { x0: x - M.raum.l, y0: y - M.raum.o, x1: x + M.raum.l, y1: y + M.raum.u }, spot: { x, y: y + M.raum.spot }, wackel: 0 };
  });
  const tx = zahl(D.tor && D.tor.x, W / 2), ty = clamp(zahl(D.tor && D.tor.y, H - 50), H - 80, H - 30);
  Z.tor = { x: tx, y: ty, name: welt.ausgang.name, emoji: welt.ausgang.emoji, spot: { x: tx, y: ty - 48 }, wackel: 0 };
  Z.tafel = { x: tx + M.tafel.dx, y: ty + M.tafel.dy };
  const rb = D.zusatzraum || D.raubtierhaus || {}, rx = zahl(rb.x, W / 2), ry = zahl(rb.y, 200);
  Z.raub = { x: rx, y: ry, name: rb.schild || welt.zusatzraum.name, emoji: welt.zusatzraum.emoji, rect: { x0: rx - M.zusatz.l, y0: ry - M.zusatz.o, x1: rx + M.zusatz.l, y1: ry + M.zusatz.u }, spot: { x: rx, y: ry + M.zusatz.spot }, wach: 0, wackel: 0 };
  Z.start = { x: zahl(D.start && D.start.x, tx), y: zahl(D.start && D.start.y, ty - 90) };
  Z.wege = []; Z.lampen = []; Z.baeume = []; Z.flecken = []; Z.sterne = []; Z.hind = []; Z.deko = []; Z.brunnen = null;

  // Figuren (höchstens 5, keine hält auf)
  Z.figs = []; let hatPolly = false;
  (Array.isArray(D.figuren) ? D.figuren : []).slice(0, 5).forEach((f, i) => {
    if (!f) return; const art = ROLLE[f.art]; if (!art) return;
    if (art === 'begleiter') { hatPolly = true; return; }
    if (art === 'waechter') {
      const runde = (Array.isArray(f.runde) ? f.runde : []).filter(p => Array.isArray(p) && p.length >= 2).map(p => ({ x: +p[0], y: +p[1] }));
      if (runde.length) Z.figs.push({ id: 'waechter', art, aussehen: f.aussehen || '', name: f.name || 'Wache', runde, x: runde[0].x, y: runde[0].y, ziel: 1 % runde.length, blick: 1, winkel: 0, kegel: 0, pause: 0, ruhe: 3, hop: 0 });
    } else if (art === 'waerterin') Z.figs.push({ id: 'waerterin', art, aussehen: f.aussehen || '', name: f.name || 'Hilfe', x: zahl(f.x, tx - 110), y: zahl(f.y, H / 2), hop: 0 });
    else Z.figs.push({ id: 'tier' + i, art, aussehen: f.aussehen || '', name: f.name || 'Figur', emoji: f.emoji || '💬', trick: f.trick || 'huepfen', trickT: 0, x: zahl(f.x, 200 + i * 200), y: zahl(f.y, H / 2), hop: 0 });
  });
  Z.hatPolly = hatPolly || !Array.isArray(D.figuren);
  Z.orte = (Array.isArray(D.orte) ? D.orte : []).filter(o => o && o.text).map(o => ({ x: zahl(o.x, 0), y: zahl(o.y, 0), r: zahl(o.radius, 120), text: o.text, gesagt: false }));

  // Wege, Lampen, Dekoration und Hindernisse: Das macht der Stil der Welt
  S.bau(welt, D);

  // Lauf-Raster für die Wegsuche
  Z.cols = Math.ceil(W / ZELLE); Z.rows = Math.ceil(H / ZELLE);
  Z.grid = new Uint8Array(Z.cols * Z.rows);
  for (let j = 0; j < Z.rows; j++) for (let i = 0; i < Z.cols; i++) Z.grid[j * Z.cols + i] = festAn((i + 0.5) * ZELLE, (j + 0.5) * ZELLE) ? 1 : 0;
  Z.gs = new Float32Array(Z.grid.length); Z.came = new Int32Array(Z.grid.length); Z.st = new Uint8Array(Z.grid.length);
}
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; const t = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0; return Math.hypot(px - ax - dx * t, py - ay - dy * t); }

// Wo kann man NICHT laufen? (Ränder, Räume, Zusatzraum, Tafel, Hindernisse des Stils)
function festAn(x, y) {
  const p = 16, R = S.masse.grenzen;
  if (x < R.l || x > Z.W - R.r || y < R.o || y > Z.tor.y - R.u) return true;
  for (const g of Z.G) if (x > g.rect.x0 - p && x < g.rect.x1 + p && y > g.rect.y0 - p && y < g.rect.y1 + p) return true;
  const r = Z.raub.rect; if (x > r.x0 - p && x < r.x1 + p && y > r.y0 - p && y < r.y1 + p) return true;
  if (Math.abs(x - Z.tafel.x) < 62 && Math.abs(y - Z.tafel.y + 8) < 26) return true;
  for (const h of Z.hind) { if (h.r != null) { if (dist(x, y, h.x, h.y) < h.r + p) return true; } else if (x > h.x0 - p && x < h.x1 + p && y > h.y0 - p && y < h.y1 + p) return true; }
  return !!S.fest(x, y, p);
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

/* Menschen: Füße bei (0,0). o: jacke, hose, haut, hut ('muetze'|'hut'|'kappe'|'dreispitz'|'bandana'|'fedora'|'helm'|'haare'|'headset'|'kochmuetze'), hutFarbe, mantel, rucksack, lampe, brett, gehen, groesse */
function zeichnePerson(c, x, y, t, o) {
  const s = o.groesse || 1, w = o.gehen && !Z.ruhig ? Math.sin(t * 14) : 0, lift = o.hop > 0 ? Math.sin((1 - clamp(o.hop, 0, 1)) * Math.PI) * 16 : 0;
  c.fillStyle = 'rgba(0,0,0,0.32)'; ell(c, x, y, 20 * s, 7 * s); c.fill();
  c.save(); c.translate(x, y - lift); c.scale(s * (o.blick < 0 ? -1 : 1), s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.rucksack) { rr(c, -19, -46, 16, 26, 6); fs(c, '#2b59c3', '#000', 2.5); }
  c.strokeStyle = '#000'; c.lineWidth = 10; c.beginPath(); c.moveTo(-6, -20); c.lineTo(-6 + w * 5, -3); c.moveTo(6, -20); c.lineTo(6 - w * 5, -3); c.stroke();
  c.strokeStyle = o.hose; c.lineWidth = 6; c.beginPath(); c.moveTo(-6, -20); c.lineTo(-6 + w * 5, -4); c.moveTo(6, -20); c.lineTo(6 - w * 5, -4); c.stroke();
  if (o.mantel) { rr(c, -15, -50, 30, 44, 9); fs(c, o.jacke, '#000', 2.5); c.strokeStyle = '#000'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(2, -48); c.lineTo(2, -8); c.stroke(); } else { rr(c, -13, -50, 26, 32, 9); fs(c, o.jacke, '#000', 2.5); }
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
  else if (o.hut === 'dreispitz') { c.beginPath(); c.moveTo(-21, -68); c.quadraticCurveTo(0, -96, 21, -68); c.quadraticCurveTo(0, -78, -21, -68); c.closePath(); fs(c, o.hutFarbe || '#1b1b22', '#000', 2.5); c.fillStyle = '#ffd23f'; circ(c, 0, -78, 3); c.fill(); }
  else if (o.hut === 'bandana') { c.beginPath(); c.arc(0, -64, 13.5, Math.PI, 0); c.closePath(); fs(c, o.hutFarbe || '#e63946', '#000', 2.5); tri(c, -13, -66, -24, -60, -20, -72); fs(c, o.hutFarbe || '#e63946', '#000', 2); }
  else if (o.hut === 'fedora') { rr(c, -20, -71, 40, 6, 3); fs(c, o.hutFarbe || '#3b3b46', '#000', 2.5); rr(c, -11, -85, 22, 15, 5); fs(c, o.hutFarbe || '#3b3b46', '#000', 2.5); c.fillStyle = '#000'; c.fillRect(-11, -75, 22, 3); }
  else if (o.hut === 'haare') { c.beginPath(); c.arc(0, -64, 14, Math.PI * 0.95, Math.PI * 0.08); c.quadraticCurveTo(2, -70, -13, -58); c.closePath(); fs(c, o.hutFarbe || '#3b2a1e', '#000', 2.5); }
  else if (o.hut === 'headset') { c.beginPath(); c.arc(0, -64, 14, Math.PI * 0.95, Math.PI * 0.08); c.quadraticCurveTo(2, -70, -13, -58); c.closePath(); fs(c, o.hutFarbe || '#3b2a1e', '#000', 2.5); c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath(); c.arc(0, -63, 16, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); rr(c, -6, -66, 7, 10, 3); fs(c, '#222', '#000', 2); c.beginPath(); c.moveTo(-2, -57); c.lineTo(9, -53); c.stroke(); }
  else if (o.hut === 'kochmuetze') { rr(c, -11, -78, 22, 10, 3); fs(c, '#fff', '#000', 2.5); circ(c, -8, -82, 8); fs(c, '#fff', '#000', 2.5); circ(c, 8, -82, 8); fs(c, '#fff', '#000', 2.5); circ(c, 0, -86, 9); fs(c, '#fff', '#000', 2.5); c.fillStyle = '#fff'; c.fillRect(-10, -82, 20, 8); }
  if (o.hut === 'helm' || o.helm) { circ(c, 1, -63, 18); c.fillStyle = 'rgba(170,215,255,0.22)'; c.fill(); c.strokeStyle = '#000'; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.arc(1, -63, 13, Math.PI * 1.15, Math.PI * 1.45); c.stroke(); }
  c.restore();
}
/* Schild über einem Haus: heller Grund, dunkle Schrift (Kontrast über 12:1), Symbol + Text */
function zeichneSchild(c, x, y, text, o) {
  o = o || {}; const px = schriftWelt(24, 15);
  c.font = 'bold ' + px + 'px ' + TEXT_FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
  let w = c.measureText(text).width + px * 1.1; const h = px * 1.55, zw = o.ziffer != null ? px * 1.5 : 0; w += zw;
  x = clamp(x, w / 2 + 34, Z.W - w / 2 - 34);
  if (!o.ohnePfosten && S.schild.pfosten !== false) { c.fillStyle = '#000'; c.fillRect(x - w * 0.3 - 3, y, 6, h * 0.8); c.fillRect(x + w * 0.3 - 3, y, 6, h * 0.8); }
  const F = S.schild;
  rr(c, x - w / 2, y - h / 2, w, h, 8); fs(c, o.dunkel ? F.zu : F.hell, F.rand, 4);
  if (o.gestrichelt) { c.setLineDash([8, 6]); rr(c, x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12, 4); c.strokeStyle = o.dunkel ? F.textZu : F.text; c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
  c.fillStyle = o.dunkel ? F.textZu : F.text; c.fillText(text, x - zw / 2, y + 1);
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
/* ---------- Roboter (für mehrere Welten): Füße bei (x,y). o: farbe, auge, schwebt, antenne, blick, hop, groesse ---------- */
function zeichneRoboter(c, x, y, t, o) {
  const s = o.groesse || 1, schw = o.schwebt ? 16 + (Z.ruhig ? 0 : Math.sin(t * 3 + x) * 4) : 0, lift = (o.hop > 0 ? Math.sin((1 - clamp(o.hop, 0, 1)) * Math.PI) * 12 : 0) + schw;
  c.fillStyle = 'rgba(0,0,0,0.32)'; ell(c, x, y, (o.schwebt ? 15 : 20) * s, 6 * s); c.fill();
  c.save(); c.translate(x, y - lift); c.scale(s * (o.blick < 0 ? -1 : 1), s); c.lineJoin = 'round'; c.lineCap = 'round';
  if (o.schwebt) { c.fillStyle = 'rgba(' + (o.schub || '120,220,255') + ',0.55)'; tri(c, -8, -8, 8, -8, 0, 6 + (Z.ruhig ? 0 : Math.sin(t * 18) * 3)); c.fill(); }
  else { circ(c, -10, -6, 7); fs(c, '#222', '#000', 2.5); circ(c, 10, -6, 7); fs(c, '#222', '#000', 2.5); }
  rr(c, -16, -44, 32, 36, 8); fs(c, o.farbe || '#8fa3c8', '#000', 2.5);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-10, -26, 20, 4); c.fillRect(-10, -19, 20, 4);
  if (o.brett) { rr(c, 12, -40, 15, 19, 3); fs(c, '#fff', '#000', 2); c.fillStyle = '#000'; c.fillRect(15, -35, 9, 2); c.fillRect(15, -30, 9, 2); }
  rr(c, -13, -66, 26, 20, 7); fs(c, o.kopf || o.farbe || '#8fa3c8', '#000', 2.5);
  rr(c, -8, -61, 20, 9, 4); fs(c, '#0b1736', '#000', 2);
  c.fillStyle = o.auge || '#7df9ff'; const bl = (t % 3.3) < 0.12 && !Z.ruhig; if (bl) c.fillRect(-3, -57, 12, 2); else { circ(c, 0, -56.5, 2.6); c.fill(); circ(c, 8, -56.5, 2.6); c.fill(); }
  if (o.antenne !== false) { c.strokeStyle = '#000'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -66); c.lineTo(0, -76); c.stroke(); circ(c, 0, -78, 3.5); fs(c, o.auge || '#7df9ff', '#000', 2); }
  c.restore();
}

/* ============ STILE: das Aussehen der Welten ============
   Eine Stil-Datei meldet sich so an:  window.KartenStile.<name> = function (K) { return { … }; };
   K ist der Werkzeugkasten des Motors (Zeichen-Hilfen, Zustand Z, Grundstil K.basis).
   Was eine Stil-Datei nicht selbst mitbringt, übernimmt der Grundstil „neutral“ (BASIS). */
window.KartenStile = window.KartenStile || {};
const stilFehlt = {}, stilWartet = {};

function wegAbstand(x, y) { let m = 1e9; for (const P of Z.wege) for (let i = 0; i < P.length - 1; i++) m = Math.min(m, segDist(x, y, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1])); return m; }
// Einfache Wege: vom Ausgang gerade hoch zum Zusatzraum, dazu ein Abzweig zu jedem Raum (nur gemalt)
function standardWege() {
  const w = [[[Z.tor.x, Z.tor.y], [Z.tor.x, Z.raub.spot.y - 10], [Z.raub.x, Z.raub.spot.y - 10]]];
  for (const g of Z.G) w.push([[g.spot.x, g.spot.y - 14], [g.spot.x, g.spot.y + 28], [Z.tor.x, g.spot.y + 28]]);
  return w;
}
// Freie Plätze für Dekoration suchen (fester Zufall): nicht auf Wegen, nicht vor Türen, nicht bei Figuren
function streue(n, seed, o) {
  o = o || {}; const R = seeded(seed), out = [], rand = o.rand || 110, oben = o.oben || 180, unten = o.unten || 150, ab = o.abstand || 120, weg = o.weg == null ? 74 : o.weg;
  const imRect = (r, x, y, p) => x > r.x0 - p && x < r.x1 + p && y > r.y0 - p && y < r.y1 + p;
  for (let i = 0; i < 1200 && out.length < n; i++) {
    const x = rand + R() * (Z.W - 2 * rand), y = oben + R() * (Z.H - oben - unten), z = R(), z2 = R();
    if (weg && wegAbstand(x, y) < weg) continue;
    let ok = !imRect(Z.raub.rect, x, y, 80) && dist(x, y, Z.raub.spot.x, Z.raub.spot.y) > 120 && dist(x, y, Z.start.x, Z.start.y) > 130 && dist(x, y, Z.tafel.x, Z.tafel.y) > 120 && dist(x, y, Z.tor.spot.x, Z.tor.spot.y) > 130;
    for (const g of Z.G) if (imRect(g.rect, x, y, 70) || dist(x, y, g.spot.x, g.spot.y) < 130 || (Math.abs(x - g.x) < 180 && y < g.rect.y0 && y > g.rect.y0 - 110)) ok = false;
    for (const f of Z.figs) { if (f.runde) { for (let k = 0; k < f.runde.length; k++) { const a = f.runde[k], b = f.runde[(k + 1) % f.runde.length]; if (segDist(x, y, a.x, a.y, b.x, b.y) < 70) ok = false; } } else if (dist(x, y, f.x, f.y) < 110) ok = false; }
    for (const h of Z.hind) { if (h.r != null) { if (dist(x, y, h.x, h.y) < h.r + ab) ok = false; } else if (imRect(h, x, y, ab * 0.6)) ok = false; }
    for (const q of out) if (dist(x, y, q.x, q.y) < ab) ok = false;
    if (ok) out.push({ x, y, z, z2 });
  }
  return out;
}
/* Bausteine für Räume: Fenster mit dem Emoji des Raums, Fenster mit dem Zustand (Form!), Tür */
function fensterEmoji(c, g, x, y, zu, r) { const F = S.farben; circ(c, x, y, r || 34); fs(c, zu ? F.fensterZu : F.fenster, '#000', 4); c.globalAlpha = zu ? 0.5 : 1; emoji(c, g.emoji, x, y + 2, (r || 34) * 1.24); c.globalAlpha = 1; }
function fensterZustand(c, z, x, y, r) { circ(c, x, y, r || 30); fs(c, S.farben.zustand || '#0b1736', '#000', 4); symbol(c, SYMBOL[z] || 'schloss', x, y, (r || 30) * 0.67); }
// Tür: unten Mitte bei (x, y+40). form: 'bogen' | 'eckig' | 'rund'. Gesperrt = Gitter oder Warnstreifen, offen = hell, fertig = dunkel.
function tuer(c, x, y, z, o) {
  o = o || {}; const F = S.farben, zu = z === 'gesperrt', fertig = z === 'geschafft' || z === 'unsicher', b = o.breite || 30, form = o.form || 'bogen';
  const pfad = () => { c.beginPath(); if (form === 'rund') c.arc(x, y + 2, b + 8, 0, TAU); else if (form === 'eckig') c.rect(x - b, y - 54, b * 2, 94); else { c.moveTo(x - b, y + 40); c.lineTo(x - b, y - 30); c.arc(x, y - 30, b, Math.PI, 0); c.lineTo(x + b, y + 40); } c.closePath(); };
  pfad(); fs(c, zu ? F.tuerZu : fertig ? F.tuerFertig : F.tuer, '#000', 4);
  if (zu) {
    c.save(); pfad(); c.clip(); c.strokeStyle = F.gitter; c.lineWidth = 4;
    if (o.sperre === 'streifen') { for (let i = -120; i < 120; i += 18) { c.beginPath(); c.moveTo(x + i, y + 44); c.lineTo(x + i + 60, y - 64); c.stroke(); } }
    else { for (let i = -b + 10; i <= b - 10; i += 10) { c.beginPath(); c.moveTo(x + i, y - 64); c.lineTo(x + i, y + 44); c.stroke(); } c.beginPath(); c.moveTo(x - b - 8, y - 4); c.lineTo(x + b + 8, y - 4); c.stroke(); }
    c.restore();
  } else if (!fertig) { c.save(); pfad(); c.clip(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - b * 0.55, y - 70, b * 0.45, 120); c.restore(); }
  else { c.fillStyle = '#000'; circ(c, x + b * 0.5, y + 6, 4); c.fill(); }
}
function zeichneWege(c, randFarbe, farbe, b1, b2) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const pass of [0, 1]) { c.strokeStyle = pass ? farbe : randFarbe; c.lineWidth = pass ? (b2 || 54) : (b1 || 66); for (const P of Z.wege) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.stroke(); } }
}
// Wände am Rand: oben ein Band, links und rechts schmal, unten mit Öffnung für den Ausgang
function zeichneWaende(c, farbe, bodenTor) {
  const W = Z.W, H = Z.H, tor = Z.tor, o = S.masse.grenzen.o - 30;
  c.fillStyle = farbe; c.strokeStyle = '#000'; c.lineWidth = 4;
  c.fillRect(0, 0, W, o); c.strokeRect(-4, -4, W + 8, o + 4);
  c.fillRect(0, 0, 30, H); c.fillRect(W - 30, 0, 30, H);
  c.fillRect(0, tor.y - 8, tor.x - 78, H); c.strokeRect(-4, tor.y - 8, tor.x - 74, H);
  c.fillRect(tor.x + 78, tor.y - 8, W, H); c.strokeRect(tor.x + 78, tor.y - 8, W, H);
  if (bodenTor) { c.fillStyle = bodenTor; c.fillRect(tor.x - 74, tor.y - 8, 148, H); }
}
function lichtKegel(c, x, y, winkel, weite, rgb, breite) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.rotate(winkel);
  const g = c.createRadialGradient(0, 0, 8, 0, 0, weite); g.addColorStop(0, 'rgba(' + rgb + ',0.32)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, weite, -(breite || 0.4), breite || 0.4); c.closePath(); c.fill(); c.restore();
}
function lichtFleck(c, x, y, r, rgb, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + (a || 0.3) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
// Wort-Figur als Emoji auf einem Sockel, mit kleinem Trick beim Antippen
function emojiFigur(c, f, t, sockel) {
  const lift = f.hop > 0 ? Math.sin((1 - clamp(f.hop, 0, 1)) * Math.PI) * 14 : 0;
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, f.x, f.y, 20, 7); c.fill();
  rr(c, f.x - 16, f.y - 12, 32, 12, 4); fs(c, sockel || '#5a4636', '#000', 2.5);
  const u = clamp(f.trickT, 0, 1), dreh = Z.ruhig || u <= 0 ? 0 : f.trick === 'rollen' ? (1 - u) * TAU : f.trick === 'drehen' ? Math.sin(u * Math.PI * 3) * 0.55 : 0;
  c.save(); c.translate(f.x + (f.trick === 'rollen' && !Z.ruhig ? Math.sin(u * Math.PI) * 26 : 0), f.y - 34 - lift); c.rotate(dreh); emoji(c, f.emoji, 0, 0, 42); c.restore();
}

/* ---------- Grundstil „neutral“: schlichte Halle. Gilt, wenn eine Stil-Datei fehlt, und als Vorlage für alle Stile. ---------- */
const BASIS = {
  name: 'neutral', begleiterAmBoden: false, zusatzTon: 'tipp', spielerLicht: false, texte: {},
  masse: { raum: { l: 130, o: 110, u: 40, spot: 74 }, zusatz: { l: 150, o: 110, u: 40, spot: 74 }, tafel: { dx: 160, dy: -62 }, grenzen: { l: 56, r: 56, o: 98, u: 26 }, schild: 46 },
  schild: { hell: '#fff8dc', zu: '#dfe5f5', text: '#14213d', textZu: '#14213d', rand: '#000' },
  marke: { regel: '📋', wort: '💬', zeit: '🔦' },
  farben: { hinter: '#050b1c', ziel: '#ffd23f', fx: ['#ffd23f', '#fff', '#9ecbff'], boden: '#17223b', raster: 'rgba(255,255,255,0.05)', rasterWeite: 80, weg: '#34416b', wegRand: '#1d2747', wand: '#26345e',
    raum: ['#3d4f86'], dach: '#1b2646', tuer: '#ffd23f', tuerZu: '#141d38', tuerFertig: '#2a3b63', fenster: '#fff3c4', fensterZu: '#22314f', zustand: '#0b1736', gitter: '#9aa6c8',
    zusatz: '#4a3550', tafel: '#010d08', tafelRand: '#ffd23f', tafelText: '#ffd23f', licht: '255,205,110', kegel: '190,220,255', sockel: '#5a4636', torPfosten: '#3a4a7a', torLicht: '#ffe7a3' },
  leute: {
    spieler: { jacke: '#ffd23f', hose: '#2b59c3', haut: '#dba77c', hut: 'muetze', rucksack: true, lampe: true },
    regel: { jacke: '#2e7d5b', hose: '#3a4a7a', haut: '#e8b98f', hut: 'hut', brett: true, groesse: 1.08 },
    zeit: { jacke: '#26345e', hose: '#1b2646', haut: '#c98f62', hut: 'kappe', lampe: true, streifen: '#ffd23f', groesse: 1.12 },
    begleiter: { jacke: '#e63946', hose: '#1b2646', haut: '#e8b98f', hut: 'hut', groesse: 1.1 }
  },
  bau() { Z.wege = standardWege(); },
  fest() { return false; },
  boden(c) {
    const F = S.farben; c.fillStyle = F.boden; c.fillRect(0, 0, Z.W, Z.H);
    c.strokeStyle = F.raster; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= Z.W; x += F.rasterWeite) { c.moveTo(x, 0); c.lineTo(x, Z.H); } for (let y = 0; y <= Z.H; y += F.rasterWeite) { c.moveTo(0, y); c.lineTo(Z.W, y); } c.stroke();
    zeichneWege(c, F.wegRand, F.weg); zeichneWaende(c, F.wand, F.weg);
  },
  licht(c, t) {
    const F = S.farben; c.save(); c.globalCompositeOperation = 'lighter';
    for (const l of Z.lampen) lichtFleck(c, l.x, l.y, (l.r || 150) + 6 * puls(t + l.x, 2.3), l.rgb || F.licht, l.a);
    c.restore();
    if (S.spielerLicht) lichtKegel(c, Z.P.x, Z.P.y - 8, Z.P.winkel, 210, '255,245,200', 0.42);
  },
  dinge(c, t, add, sichtbar) { for (const d of Z.deko) if (sichtbar(d.x, d.y, 160)) add(d.y, () => S.deko(c, d, t)); },
  deko(c, d) { c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, d.x, d.y, 26, 8); c.fill(); rr(c, d.x - 22, d.y - 36, 44, 38, 5); fs(c, '#55628c', '#000', 3); c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.moveTo(d.x - 22, d.y - 36); c.lineTo(d.x + 22, d.y + 2); c.moveTo(d.x + 22, d.y - 36); c.lineTo(d.x - 22, d.y + 2); c.stroke(); },
  raum(c, g) {
    const st = raumStatus(g.nr), z = st.zustand, zu = z === 'gesperrt', F = S.farben, M = S.masse.raum, x = g.x + (g.wackel > 0 ? Math.sin(g.wackel * 40) * 5 * g.wackel : 0), y = g.y;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 40, M.l + 10, 16); c.fill();
    rr(c, x - M.l, y - M.o, M.l * 2, M.o + M.u, 16); fs(c, F.raum[g.nr % F.raum.length], '#000', 4);
    if (zu) { c.fillStyle = 'rgba(5,11,28,0.5)'; rr(c, x - M.l, y - M.o, M.l * 2, M.o + M.u, 16); c.fill(); }
    rr(c, x - M.l - 10, y - M.o - 14, M.l * 2 + 20, 36, 14); fs(c, F.dach, '#000', 4);
    fensterEmoji(c, g, x - 84, y - 38, zu); fensterZustand(c, z, x + 84, y - 38); tuer(c, x, y, z);
  },
  zusatz(c, r, t) {
    const F = S.farben, M = S.masse.zusatz, x = r.x + (r.wackel > 0 && !Z.ruhig ? Math.sin(r.wackel * 40) * 4 * r.wackel : 0), y = r.y;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 40, M.l + 10, 18); c.fill();
    rr(c, x - M.l, y - M.o, M.l * 2, M.o + M.u, 16); fs(c, F.zusatz, '#000', 4);
    rr(c, x - M.l - 10, y - M.o - 14, M.l * 2 + 20, 36, 14); fs(c, F.dach, '#000', 4);
    rr(c, x - 110, y - 70, 220, 92, 12); fs(c, '#161f3c', '#000', 4);
    emoji(c, r.emoji, x, y - 22, r.wach > 0 && !Z.ruhig ? 62 + Math.sin(r.wach * 9) * 7 : 62);
  },
  tafel(c) {
    const T = Z.tafel, F = S.farben, z = codeZeichen(), px = schriftWelt(26, 17), bw = px * 0.95, w = bw * 4 + px * 0.9, h = px * 2.5;
    c.fillStyle = '#000'; c.fillRect(T.x - 4, T.y - 6, 8, 34);
    rr(c, T.x - w / 2, T.y - h, w, h, 8); fs(c, F.tafel, '#000', 4); c.strokeStyle = F.tafelRand; c.lineWidth = 2; rr(c, T.x - w / 2 + 5, T.y - h + 5, w - 10, h - 10, 5); c.stroke();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold ' + px * 0.5 + 'px ' + TEXT_FONT; c.fillText('CODE', T.x, T.y - h + px * 0.62);
    c.font = 'bold ' + px + 'px ' + MONO_FONT; c.fillStyle = F.tafelText;
    for (let i = 0; i < 4; i++) c.fillText(z[i], T.x + (i - 1.5) * bw, T.y - px * 0.82);
  },
  tor(c, t) {
    const tor = Z.tor, F = S.farben, bereit = !!(Z.status && Z.status.torBereit), x = tor.x + (tor.wackel > 0 ? Math.sin(tor.wackel * 40) * 5 * tor.wackel : 0), y = tor.y;
    if (bereit) { c.fillStyle = 'rgba(' + F.licht + ',' + (0.25 + 0.2 * puls(t)) + ')'; ell(c, x, y - 30, 120, 44); c.fill(); }
    rr(c, x - 92, y - 78, 26, 110, 6); fs(c, F.torPfosten, '#000', 4); rr(c, x + 66, y - 78, 26, 110, 6); fs(c, F.torPfosten, '#000', 4);
    rr(c, x - 66, y - 64, 132, 96, 8); fs(c, bereit ? F.tuer : F.tuerZu, '#000', 4);
    if (!bereit) { c.strokeStyle = F.gitter; c.lineWidth = 4; for (let i = -55; i <= 55; i += 11) { c.beginPath(); c.moveTo(x + i, y - 60); c.lineTo(x + i, y + 28); c.stroke(); } }
    circ(c, x, y - 16, 19); fs(c, '#0b1736', '#000', 3); symbol(c, bereit ? 'pfeil' : 'schloss', x, y - 16, 13);
  },
  figur(c, f, t, P) {
    const L = S.leute, F = S.farben;
    if (f.art === 'waerterin') zeichnePerson(c, f.x, f.y, t, Object.assign({}, L.regel, { blick: P.x < f.x ? -1 : 1, hop: f.hop }));
    else if (f.art === 'waechter') { lichtKegel(c, f.x, f.y - 10, f.kegel, 170, F.kegel, 0.36); zeichnePerson(c, f.x, f.y, t, Object.assign({}, L.zeit, { blick: f.blick, gehen: f.geht, hop: f.hop })); }
    else emojiFigur(c, f, t, F.sockel);
  },
  spieler(c, P, t) { zeichnePerson(c, P.x, P.y, t, Object.assign({}, S.leute.spieler, { blick: P.blick, gehen: P.geht, hop: P.hop })); },
  begleiter(c, po, t) {
    if (S.begleiterAmBoden) { zeichnePerson(c, po.x, po.y, t, Object.assign({}, S.leute.begleiter, { blick: po.blick, gehen: po.geht, hop: po.hop })); return; }
    c.fillStyle = 'rgba(' + S.farben.licht + ',0.35)'; circ(c, po.x, po.y, 24 + 3 * puls(t, 3)); c.fill(); circ(c, po.x, po.y, 16); fs(c, '#0b1736', '#000', 3); emoji(c, S.begleiterEmoji || '💬', po.x, po.y + 1, 18);
  },
  zusatzSchild(r) { return r.emoji + ' ' + r.name; },
  torSchild() { return { x: Z.tor.x - 210, y: Z.H - Math.max(26, 20 / Z.scale), ohnePfosten: true }; },
  markeHoehe(f) { return f.art === 'waerterin' ? 104 : 76; }
};
// Werkzeugkasten für die Stil-Dateien
const K = { Z, API, VERSION, TAU, clamp, lerp, dist, rnd, seeded, segDist, zahl, circ, ell, rr, tri, fs, emoji, sternForm, puls, schriftWelt, symbol, SYMBOL, raumStatus, naechstes, codeZeichen,
  zeichnePerson, zeichneRoboter, zeichneSchild, zeichneWege, zeichneWaende, lichtKegel, lichtFleck, emojiFigur, fensterEmoji, fensterZustand, tuer, wegAbstand, standardWege, streue,
  EMOJI_FONT, TEXT_FONT, MONO_FONT, basis: BASIS, stil: () => S };

function stilFuer(name) {
  const fab = name ? window.KartenStile[name] : null; let eigen = null;
  if (typeof fab === 'function') { try { eigen = fab(K); } catch (e) { if (window.console) console.error('Karte: Stil „' + name + '“ ist fehlerhaft – neutrales Aussehen.', e); eigen = null; } }
  const st = Object.assign({}, BASIS, eigen || {}); st.name = eigen ? name : 'neutral';
  const E = eigen || {};
  st.masse = Object.assign({}, BASIS.masse, E.masse || {}); for (const k of ['raum', 'zusatz', 'tafel', 'grenzen']) st.masse[k] = Object.assign({}, BASIS.masse[k], (E.masse && E.masse[k]) || {});
  st.schild = Object.assign({}, BASIS.schild, E.schild || {}); st.marke = Object.assign({}, BASIS.marke, E.marke || {}); st.farben = Object.assign({}, BASIS.farben, E.farben || {});
  st.leute = Object.assign({}, BASIS.leute, E.leute || {});
  return st;
}
// Stil-Datei nachladen: nur aus dem eigenen Ordner, nur einfache Namen. fertig(true/false) wird danach aufgerufen.
function ladeStil(name, fertig) {
  if (!name || !/^[a-z0-9-]{1,30}$/.test(name) || stilFehlt[name]) { fertig(false); return; }
  if (window.KartenStile[name]) { fertig(true); return; }
  if (stilWartet[name]) { stilWartet[name].push(fertig); return; }
  stilWartet[name] = [fertig];
  const ende = () => { const l = stilWartet[name] || []; delete stilWartet[name]; const ok = !!window.KartenStile[name]; if (!ok) { stilFehlt[name] = true; if (window.console) console.warn('Karte: welt/stil-' + name + '.js fehlt oder ist fehlerhaft – neutrales Aussehen.'); } l.forEach(f => sicher(f)(ok)); };
  const sk = document.createElement('script'); sk.src = ORDNER + 'stil-' + name + '.js?v=' + encodeURIComponent(API.version || VERSION);
  sk.onload = ende; sk.onerror = ende; document.head.appendChild(sk);
}

function zeichne(c, t) {
  const cam = Z.cam, vw = Z.w / Z.scale, vh = Z.h / Z.scale, k = Z.scale * Z.dpr, P = Z.P, F = S.farben;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.fillStyle = F.hinter; c.fillRect(0, 0, canvas.width, canvas.height);
  c.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
  const sichtbar = (x, y, m) => x > cam.x - m && x < cam.x + vw + m && y > cam.y - m && y < cam.y + vh + m;
  S.boden(c, t);
  S.licht(c, t);
  const nx = naechstes(), bereit = !!(Z.status && Z.status.torBereit);
  const ziel = nx >= 0 ? Z.G[nx].spot : bereit ? Z.tor.spot : null;
  if (ziel) { c.strokeStyle = F.ziel; c.lineWidth = 5; c.setLineDash([12, 8]); const r = 34 + 8 * puls(t); ell(c, ziel.x, ziel.y, r, r * 0.5); c.stroke(); c.setLineDash([]); }
  if (Z.marker) { const m = Z.marker, u = 1 - m.t / 0.6; c.strokeStyle = 'rgba(255,255,255,' + (1 - u) + ')'; c.lineWidth = 4; ell(c, m.x, m.y, 10 + u * 22, (10 + u * 22) * 0.5); c.stroke(); }

  // Alles, was steht, nach y sortiert (wer weiter unten steht, verdeckt)
  const items = [], add = (y, f) => items.push({ y, f });
  S.dinge(c, t, add, sichtbar, P);
  for (const g of Z.G) if (sichtbar(g.x, g.y, 260)) add(g.y + 40, () => S.raum(c, g, t));
  add(Z.raub.y + 40, () => S.zusatz(c, Z.raub, t));
  add(Z.tafel.y, () => S.tafel(c, t));
  for (const f of Z.figs) add(f.y, () => S.figur(c, f, t, P));
  if (Z.hatPolly && S.begleiterAmBoden) add(Z.polly.y, () => S.begleiter(c, Z.polly, t));
  add(P.y + 0.1, () => S.spieler(c, P, t));
  items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
  S.tor(c, t);

  // Darüber: Schilder, Pfeil, Tastatur-Rahmen, kleine Tipp-Marken – damit nichts davon verdeckt wird
  for (const g of Z.G) {
    const s = schildText(g), sy = g.rect.y0 - S.masse.schild, sz = zeichneSchild(c, g.x, sy, s.text, s);
    if (g.nr === nx) { const b = Z.ruhig ? 0 : Math.abs(Math.sin(t * 4)) * 14, ay = sy - sz.h / 2 - 16 - b, sc = Math.max(1, 0.75 / Z.scale); c.save(); c.translate(g.x, ay); c.scale(sc, sc); tri(c, -20, -26, 20, -26, 0, 4); fs(c, F.ziel, '#000', 4); c.restore(); }
  }
  zeichneSchild(c, Z.raub.x, Z.raub.rect.y0 - S.masse.schild, S.zusatzSchild(Z.raub), { dunkel: true });
  const ts = S.torSchild();
  zeichneSchild(c, ts.x, ts.y, (bereit ? '▶ ' : '🔒 ') + Z.tor.name, { dunkel: !bereit, gestrichelt: !bereit, ohnePfosten: ts.ohnePfosten });
  for (const f of Z.figs) if (f.art !== 'waechter') { const m = f.art === 'waerterin' ? S.marke.regel : S.marke.wort, by = f.y - S.markeHoehe(f) - (Z.ruhig ? 0 : Math.sin(t * 3 + f.x) * 3), r = Math.max(15, 13 / Z.scale); c.beginPath(); c.arc(f.x, by, r, Math.PI * 0.62, Math.PI * 0.38); c.lineTo(f.x, by + r * 1.45); c.closePath(); fs(c, '#fff', '#000', 3); emoji(c, m, f.x, by + 1, r * 1.05); }
  if (Z.fokus) { const z = zielVon(Z.fokus); if (z) { c.strokeStyle = '#fff'; c.lineWidth = 6; c.setLineDash([14, 8]); rr(c, z.rahmen.x0, z.rahmen.y0, z.rahmen.x1 - z.rahmen.x0, z.rahmen.y1 - z.rahmen.y0, 14); c.stroke(); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke(); c.setLineDash([]); } }
  if (Z.hatPolly && !S.begleiterAmBoden) S.begleiter(c, Z.polly, t);
  for (const q of Z.fx) { c.save(); c.globalAlpha = clamp(q.life / q.max * 1.6, 0, 1); c.translate(q.x, q.y); c.rotate(q.rot); c.fillStyle = F.fx[q.form] || '#fff'; c.strokeStyle = '#000'; c.lineWidth = 1.5; if (q.form === 0) sternForm(c, 0, 0, q.size); else if (q.form === 1) { c.beginPath(); c.rect(-q.size / 2, -q.size / 3, q.size, q.size * 0.66); } else circ(c, 0, 0, q.size / 2); c.fill(); c.stroke(); c.restore(); }

  // Bildschirm-Ebene: Sprechblasen und Pfeil zum Ziel am Rand
  c.setTransform(Z.dpr, 0, 0, Z.dpr, 0, 0);
  Z.randPfeil = null;
  if (ziel) {
    const hx = (ziel.x - cam.x) * Z.scale, hy = (ziel.y - 80 - cam.y) * Z.scale;
    if (hx < 20 || hx > Z.w - 20 || hy < 20 || hy > Z.h - 20) {
      const ax = clamp(hx, 40, Z.w - 40), ay = clamp(hy, 40, Z.h - 40), a = Math.atan2(hy - ay, hx - ax), b = Z.ruhig ? 0 : Math.sin(t * 6) * 5;
      Z.randPfeil = { x: ax, y: ay, id: nx >= 0 ? 'g' + nx : 'tor' };   // den Pfeil am Rand kann man antippen: Die Figur läuft zum Ziel
      c.save(); c.translate(ax + Math.cos(a) * b, ay + Math.sin(a) * b); circ(c, 0, 0, 26); fs(c, '#0b1736', F.ziel, 4); emoji(c, nx >= 0 ? Z.G[nx].emoji : Z.tor.emoji, 0, 1, 24);
      c.rotate(a); tri(c, 30, -11, 46, 0, 30, 11); fs(c, F.ziel, '#000', 3); c.restore();
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
  const x = clamp(ax, w / 2 + 6, Z.w - w / 2 - 6), u = b.unten ? -1 : 1, y = clamp(ay - u * (h / 2 + 14), h / 2 + 6, Z.h - h / 2 - 6);   // unten: Blase hängt unter der Figur (verdeckt das Schild nicht)
  c.globalAlpha = clamp(Math.min(b.t * 3, (b.max - b.t) * 6), 0, 1);
  tri(c, x - 10, y + u * (h / 2 - 2), x + 10, y + u * (h / 2 - 2), clamp(ax, x - w / 2 + 14, x + w / 2 - 14), y + u * (h / 2 + 12)); fs(c, '#fff', '#000', 3);
  rr(c, x - w / 2, y - h / 2, w, h, 12); fs(c, '#fff', '#000', 3);
  c.fillStyle = '#fff'; c.fillRect(x - 8, y + u * (h / 2 - 1.5) - 2.5, 16, 5);
  c.fillStyle = '#14213d'; zeilen.forEach((l, i) => c.fillText(l, x, y - h / 2 + 8 + px * 0.68 + i * px * 1.35));
  c.globalAlpha = 1;
}

/* ============ 4. ABLAUF ============ */
function neuStart() {
  Z.P = { x: Z.start.x, y: Z.start.y, blick: 1, winkel: -Math.PI / 2, geht: false, weg: null, tempo: GESCHW, ankunft: null, hop: 0 };
  if (!frei(Z.P.x, Z.P.y)) { const k = naheFrei(Z.P.x, Z.P.y); if (k >= 0) { Z.P.x = (k % Z.cols + 0.5) * ZELLE; Z.P.y = (Math.floor(k / Z.cols) + 0.5) * ZELLE; } }
  Z.polly = S.begleiterAmBoden ? { x: Z.P.x - 56, y: Z.P.y + 4, blick: 1, geht: false } : { x: Z.P.x - 50, y: Z.P.y - 110, blick: 1 };
  Z.blasen = []; Z.fx = []; Z.marker = null; Z.gewarnt = false; Z.jubel = -1; Z.neueMission = false;
  Z.letztesWort = ''; Z.ruhe = 0; Z.sagBald = null; Z.loeweNr = 0; Z.sig = ''; for (const o of Z.orte) o.gesagt = false;
  for (const f of Z.figs) if (f.runde) { f.x = f.runde[0].x; f.y = f.runde[0].y; f.ziel = 1 % f.runde.length; f.pause = 0; f.ruhe = 3; }
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
  if (id === 'raub') return { spot: Z.raub.spot, schau: Z.raub, rahmen: { x0: Z.raub.rect.x0 - 14, y0: Z.raub.rect.y0 - 20, x1: Z.raub.rect.x1 + 14, y1: Z.raub.spot.y + 16 }, tun: amLoewe };
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
// Zusatzraum (im Zoo: Raubtierhaus) ist nur Kulisse. Antippen: kleine Reaktion und ein Hinweis.
function amLoewe() {
  const r = Z.raub, roh = Z.texte.zusatzReaktion || Z.texte.loeweSchnarcht, liste = Array.isArray(roh) ? roh : [roh];
  r.wach = 2.4; r.wackel = 1; Sfx.play(S.zusatzTon || 'tipp');
  const text = liste[Z.loeweNr++ % liste.length] || '';
  if (text) blase(r.x + 40, r.y - 96, r.emoji + ' ' + text, 2.8, 'loewe');
  const hinweis = Z.texte.zusatz || Z.texte.loewe; if (hinweis) sage(hinweis);
}
function pollyKopf() { return S.begleiterAmBoden ? Z.polly.y - 96 : Z.polly.y - 30; }
function pollySagt(text, dauer) { if (!Z.hatPolly || !text) return; blase(Z.polly.x, pollyKopf(), text, dauer || 3, 'polly'); ansage(text); }
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
    let w = null;
    for (let i = 0; i < 8; i++) { try { w = API.zufallsWort(); } catch (e) { w = null; } if (!w || w.en !== Z.letztesWort) break; }   // möglichst nicht zweimal hintereinander dasselbe Wort
    if (w) Z.letztesWort = w.en;
    f.trickT = 1;
    const wz = S.marke.wort, text = w ? wz + ' ' + w.en + ' = ' + w.de : wz;
    blase(f.x, f.y - 84, text, 3.5, f.id); if (w) ansage(f.name + ': ' + w.en + ' heißt ' + w.de);
  } else if (f.art === 'waechter') blase(f.x, f.y - 100, S.marke.zeit + ' ' + wahl(Z.texte.waechter), 2.5, f.id);
}
function pollyTipp() {
  const nx = naechstes();
  if (nx >= 0) sage(fuelle(Z.texte.tipp, { name: Z.G[nx].schild })); else if (Z.status && Z.status.torBereit) sage(Z.texte.tippTor);
  funken(Z.polly.x, pollyKopf() + 30, 6, { sp: 120 }); Sfx.play('tipp');
}
function jubeln(i) {
  const g = Z.G[i]; Z.jubel = -1; if (!g) return;
  Sfx.play('jubel'); funken(g.x, g.rect.y0 - 46, 26, { up: 120, sp: 260 }); funken(Z.tafel.x, Z.tafel.y - 40, 14, { up: 100 });
  const n = Z.status ? Z.status.raeume.filter(r => r.zustand === 'geschafft' || r.zustand === 'unsicher').length : 0, liste = Z.texte.pollyGeschafft;
  Z.pollyJubel = 1.6; Z.ruhe = 0; pollySagt((Array.isArray(liste) && liste[n - 1]) || Z.texte.jubel, 3);
  const jb = Z.blasen.find(b => b.id === 'polly'); if (jb) jb.unten = true;   // Jubel-Blase unter die Figur: Schild und neue Ziffer bleiben lesbar
}
function pruefeStatus() {
  const s = API.status(); if (!s) return;
  Z.status = s;
  const sig = s.raeume.map(r => r.zustand + r.richtig + (r.ziffer == null ? '' : r.ziffer) + (r.kandidaten || []).join('')).join('|') + s.torBereit;
  if (sig !== Z.sig || Z.sig === '') { Z.sig = sig; aktualisiereListe(); }
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
  const boden = !!S.begleiterAmBoden;   // manche Begleitfiguren laufen mit (Käpt'n), andere fliegen oder schweben (Polly)
  const zx = boden ? P.x - P.blick * 58 : P.x - P.blick * 46 + (jub && !Z.ruhig ? Math.cos(Z.zeit * 9) * 40 : 0), zy = boden ? P.y + 4 : P.y - 112 + (Z.ruhig ? 0 : Math.sin(Z.zeit * 2.4) * 6) + (jub && !Z.ruhig ? Math.sin(Z.zeit * 9) * 26 : 0);
  po.geht = boden && dist(po.x, po.y, zx, zy) > 8; if (boden && jub) po.hop = 1; if (po.hop > 0) po.hop -= dt * 2.4;
  if (Math.abs(zx - po.x) > 6) po.blick = zx > po.x ? 1 : -1; else po.blick = P.blick;
  po.x = lerp(po.x, zx, Math.min(1, dt * 4)); po.y = lerp(po.y, zy, Math.min(1, dt * 4));
  // Nachtwächter dreht langsam seine Runde (bei „weniger Bewegung“ bleibt er stehen)
  for (const f of Z.figs) {
    if (f.hop > 0) f.hop -= dt * 2;
    if (f.art !== 'waechter') continue;
    f.geht = false; f.kegel = f.winkel + (Z.ruhig ? 0 : Math.sin(Z.zeit * 0.9) * 0.3);
    // Trifft sein Licht die Spielfigur, ruft er kurz – er fängt niemanden und hält niemanden auf
    if (f.ruhe > 0) f.ruhe -= dt;
    const dP = dist(P.x, P.y, f.x, f.y);
    if (f.ruhe <= 0 && dP > 30 && dP < 165 && !regelOffen()) {
      let da = Math.atan2(P.y - f.y, P.x - f.x) - f.kegel; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      if (Math.abs(da) < 0.36) { f.ruhe = 16; f.pause = 1.8; f.hop = 1; Sfx.play('huch'); blase(f.x, f.y - 100, '❗ ' + wahl(Z.texte.waechterRuf), 2.6, f.id); Z.pollyJubel = Math.max(Z.pollyJubel || 0, 0.7); }
    }
    if (f.pause > 0) { f.pause -= dt; continue; }
    if (Z.ruhig || f.runde.length < 2) continue;
    const q = f.runde[f.ziel], d = dist(f.x, f.y, q.x, q.y), sp = 46 * dt;
    if (d <= sp) { f.x = q.x; f.y = q.y; f.ziel = (f.ziel + 1) % f.runde.length; }
    else { f.x += (q.x - f.x) / d * sp; f.y += (q.y - f.y) / d * sp; if (Math.abs(q.x - f.x) > 3) f.blick = q.x > f.x ? 1 : -1; const a = Math.atan2(q.y - f.y, q.x - f.x); let da = a - f.winkel; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; f.winkel += da * Math.min(1, dt * 3); f.geht = true; }
  }
  for (const f of Z.figs) if (f.trickT > 0) f.trickT -= dt * 0.9;
  if (Z.raub.wach > 0) Z.raub.wach -= dt; if (Z.raub.wackel > 0) Z.raub.wackel -= dt * 2.2;
  // Polly kommentiert: nach der Rückkehr aus einem Gehege, an besonderen Orten und wenn lange nichts passiert
  const pollyFrei = !Z.blasen.some(b => b.id === 'polly') && Z.jubel < 0 && !regelOffen();
  if (Z.sagBald && pollyFrei) { pollySagt(Z.sagBald, 3); Z.sagBald = null; }
  else if (pollyFrei) for (const o of Z.orte) if (!o.gesagt && dist(P.x, P.y, o.x, o.y) < o.r) { o.gesagt = true; pollySagt(o.text, 3.2); break; }
  if (P.geht || Z.tasten.size) Z.ruhe = 0; else Z.ruhe += dt;
  if (Z.ruhe > 20 && pollyFrei) {
    Z.ruhe = -20; const nx = naechstes(), name = nx >= 0 ? Z.G[nx].schild : Z.status && Z.status.torBereit ? Z.tor.name : '';
    if (name) { pollySagt(fuelle(wahl(Z.texte.pollyWarten), { name }), 3.2); funken(po.x, po.y, 6, { sp: 120 }); }
  }
  for (const g of Z.G) if (g.wackel > 0) g.wackel -= dt * 2.2;
  if (Z.tor.wackel > 0) Z.tor.wackel -= dt * 2.2;
  if (Z.marker && (Z.marker.t -= dt) <= 0) Z.marker = null;
  for (let i = Z.blasen.length - 1; i >= 0; i--) { const b = Z.blasen[i]; b.t -= dt; if (b.id === 'polly') { b.x = po.x; b.y = b.unten ? Z.P.y + 14 : pollyKopf(); } if (b.t <= 0) Z.blasen.splice(i, 1); }
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
  if (Z.hatPolly && dist(x, y, Z.polly.x, S.begleiterAmBoden ? Z.polly.y - 40 : Z.polly.y) < Math.max(36, m)) { pollyTipp(); return; }   // Polly zuletzt, damit sie keine Tür verdeckt
  laufZu(x, y);
}
function regelOffen() { return !!regelBox && !regelBox.hidden; }
function verdrahteEingabe() {
  hoere(canvas, 'pointerdown', e => {
    if (e.button > 0) return;
    e.preventDefault(); if (regelOffen()) { schliesseRegel(); return; }
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const p = zuWelt(e); Z.zeiger = { id: e.pointerId, sx: e.clientX, sy: e.clientY, t: Z.zeit, frei: false };
    const rp = Z.randPfeil, cr = canvas.getBoundingClientRect(); Z.ruhe = 0;
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
  for (const f of Z.figs) if (f.art === 'waerterin') eintraege.push({ id: f.id, text: f.name + ': Regelkarte zeigen' }); else if (f.art === 'tier') eintraege.push({ id: f.id, text: f.name + ': ein englisches Wort zeigen' });
  eintraege.push({ id: 'raub', text: Z.raub.name + ': ' + (Z.texte.zusatzKurz || 'kommt nach jedem Raum von selbst') });
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
  zeigeKarte('📋 ' + fuelle(Z.texte.regelTitel, { name: Z.G[nr].schild }), text || Z.texte.keineRegel);
}
function zeigeKarte(titel, text) {
  regelBox.querySelector('.zk-regel-titel').textContent = titel;
  regelBox.querySelector('.zk-regel-text').textContent = text;
  const zuKnopf = regelBox.querySelector('.zk-zu'); if (zuKnopf) zuKnopf.textContent = Z.texte.schliessen || 'Schließen';
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
  '.zk-regel-text{margin:0 0 12px;white-space:pre-line}' +
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
  regelBox = document.createElement('div'); regelBox.className = 'zk-regel'; regelBox.hidden = true; regelBox.setAttribute('role', 'dialog'); regelBox.setAttribute('aria-label', 'Kärtchen');
  const h = document.createElement('h3'); h.className = 'zk-regel-titel'; const p = document.createElement('p'); p.className = 'zk-regel-text';
  const zu = document.createElement('button'); zu.type = 'button'; zu.className = 'zk-zu'; zu.textContent = 'Schließen'; hoere(zu, 'click', schliesseRegel);
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
  if (!welt || !welt.karte || !Array.isArray(welt.raeume)) { angemeldet = false; throw new Error('Karte: Für diese Klasse gibt es keine Kartendaten (welt.karte).'); }
  baueDom();
  const name = stilName(welt.karte), da = !!(name && window.KartenStile[name]);
  const schluessel = welt.klasse + '|' + welt.name + '|' + (da ? name : '');
  if (Z.gebaut !== schluessel) { baue(welt); Z.gebaut = schluessel; Z.neueMission = true; srListe.textContent = ''; }
  // Ist die Stil-Datei noch unterwegs, gibt es bis dahin das neutrale Aussehen. Danach wird neu gezeichnet.
  if (name && !da && !stilFehlt[name]) ladeStil(name, ok => { if (ok && Z.sichtbar) zeigen(API.status()); });
  Z.status = status || API.status(); Z.sig = '';
  box.hidden = false; Z.sichtbar = true; groesse();
  if (Z.neueMission || !Z.P) neuStart();
  Z.P.weg = null; Z.P.ankunft = null; Z.tasten.clear(); Z.zeiger = null; Z.pollT = 0;
  pruefeStatus(); aktualisiereListe(); kameraZu(1);
  if (Z.zurueck) { Z.zurueck = false; const nx = naechstes(); if (nx >= 0 && Z.jubel < 0) Z.sagBald = wahl(Z.texte.pollyZurueck); }
  Z.ruhe = 0;
  zeichne(ctx, Z.zeit);
  starteSchleife();
}
function verbergen() {
  Z.sichtbar = false; stoppeSchleife();
  if (box) { box.hidden = true; if (regelBox) regelBox.hidden = true; }
  Z.tasten.clear(); Z.zeiger = null; Z.fokus = null; if (Z.P) { Z.P.weg = null; Z.P.ankunft = null; Z.P.geht = false; }
}
const KARTE = { zeigen, verbergen };
// Anmelden bei der App. Vorher wird die Stil-Datei der gewählten Welt geholt (fehlt sie: neutrales Aussehen).
function anmelden() {
  let welt = null; try { welt = API.welt(); } catch (e) {}
  if (!welt || !welt.karte) return;
  ladeStil(stilName(welt.karte), () => { if (angemeldet) return; angemeldet = true; if (!API.karteAnmelden(KARTE)) angemeldet = false; });
}

API.on('bildschirm', sicher(e => {
  if (e && (e.id === 'intro' || e.id === 'setup')) Z.neueMission = true;   // neue Mission: Figur startet wieder am Ausgang
  if (e && e.id === 'uebersicht' && !angemeldet) setTimeout(sicher(anmelden), 0); else anmelden();   // holt bei Bedarf auch den Stil einer neu gewählten Welt
}));
API.on('zurueck', sicher(e => { Z.zurueck = !!(e && e.von === 'raum'); }));
API.on('ziffer', sicher(e => { if (e && typeof e.raum === 'number') Z.jubel = e.raum; }));
sicher(anmelden)();

// Nur zum Nachschauen in der Konsole (Entwicklerwerkzeuge). Ändert nichts am Spiel.
const DEBUG = Object.freeze({
  version: VERSION,
  stil: () => S ? S.name : null,
  stile: () => Object.keys(window.KartenStile || {}),
  speichert: 'nichts',
  sichtbar: () => Z.sichtbar,
  laeuft: () => !!Z.raf,
  zustand: () => ({ sichtbar: Z.sichtbar, schleife: !!Z.raf, figur: Z.P ? { x: Math.round(Z.P.x), y: Math.round(Z.P.y), geht: Z.P.geht } : null, massstab: Z.scale, flaeche: { b: Z.w, h: Z.h }, gewarnt: Z.gewarnt, ruhe: Math.round(Z.ruhe), figuren: Z.figs.map(f => ({ id: f.id, x: Math.round(f.x), y: Math.round(f.y) })), blasen: Z.blasen.map(b => b.id + ':' + b.text), ziele: Z.gebaut ? alleZiele() : [] }),
  geheZu: id => Z.sichtbar ? geheZu(String(id)) : false,
  laufzeit: (von, nach) => { const a = zielVon(von), b = zielVon(nach); if (!a || !b) return null; const w = findeWeg(a.spot.x, a.spot.y, b.spot.x, b.spot.y); if (!w) return null; const l = wegLaenge(w, a.spot.x, a.spot.y); return Math.round(l / Math.max(GESCHW, l / MAX_LAUFZEIT) * 10) / 10; },
  randPfeil: () => { if (!Z.randPfeil || !canvas) return null; const r = canvas.getBoundingClientRect(); return { x: r.left + Z.randPfeil.x, y: r.top + Z.randPfeil.y, id: Z.randPfeil.id }; },
  bildschirmPunkt: id => { const z = zielVon(id); if (!z || !canvas) return null; const r = canvas.getBoundingClientRect(); return { x: r.left + (z.schau.x - Z.cam.x) * Z.scale, y: r.top + (z.schau.y - 30 - Z.cam.y) * Z.scale }; }
});
window.ZooKarte = DEBUG; window.WeltKarte = DEBUG;   // zwei Namen für dasselbe (ZooKarte = alter Name)
})();
