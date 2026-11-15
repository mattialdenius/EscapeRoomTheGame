/* =====================================================================
   STIL „ZOO“ (Klasse 5): das Aussehen der Zoo-Karte
   ---------------------------------------------------------------------
   Gehört zu welt/karte.js (Karten-Motor, karte 0.4). Der Motor lädt
   diese Datei selbst, wenn in den Daten  karte: { stil: "zoo", … }  steht.
   Inhalt:   Zoo bei Nacht – Boden, Wege, Laternen, Bäume, Brunnen,
             Gehege, Raubtierhaus, Zootor, Code-Tafel, Polly, Menschen
             und Tiere. Die Zeichenfunktionen sind unverändert aus der
             Zoo-Karte 0.3 übernommen: Die Karte sieht aus wie vorher.
   Speichert nichts, lädt nichts nach.
   ===================================================================== */
(function () {
'use strict';
window.KartenStile = window.KartenStile || {};
window.KartenStile.zoo = function (K) {
const { Z, TAU, clamp, lerp, dist, seeded, segDist, zahl, circ, ell, rr, tri, fs, emoji, puls, schriftWelt, symbol, SYMBOL, raumStatus, codeZeichen, zeichnePerson, TEXT_FONT, MONO_FONT } = K;

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
  const wach = r.wach > 0, x = r.x + (r.wackel > 0 && !Z.ruhig ? Math.sin(r.wackel * 40) * 4 * r.wackel : 0), y = r.y;
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 40, 160, 18); c.fill();
  rr(c, x - 150, y - 110, 300, 150, 16); fs(c, '#5b3140', '#000', 4);
  rr(c, x - 160, y - 124, 320, 36, 14); fs(c, '#1b2646', '#000', 4);
  rr(c, x - 110, y - 70, 220, 92, 12); fs(c, '#161f3c', '#000', 4);
  emoji(c, r.emoji, x - 10, y - 20, wach && !Z.ruhig ? 62 + Math.sin(r.wach * 9) * 7 : 62);
  c.strokeStyle = '#9aa6c8'; c.lineWidth = 5; for (let i = -88; i <= 88; i += 22) { c.beginPath(); c.moveTo(x + i, y - 68); c.lineTo(x + i, y + 20); c.stroke(); }
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) { const u = Z.ruhig ? 0.5 : (t * (r.wach > 0 ? 1.3 : 0.4) + i / 3) % 1; c.globalAlpha = 1 - u * 0.8; c.font = 'bold ' + (16 + i * 5) * (wach ? 1.5 : 1) + 'px ' + TEXT_FONT; c.fillText(wach ? 'Z' : 'z', x + 44 + i * 20, y - 30 - i * 16 - u * 10); } c.globalAlpha = 1;
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

return {
  zusatzTon: 'schnarch', spielerLicht: true,
  marke: { regel: '📋', wort: '🐾', zeit: '🔦' },
  // Ersatztexte des Zoos (gelten nur, wenn in daten/klasse5.js ein Text fehlt)
  texte: {
    gesperrt: 'Dieses Gehege ist noch zu. Schafft zuerst das Gehege mit dem Pfeil!',
    schonGeschafft: 'Hier habt ihr die Ziffer schon gefunden. Weiter geht’s!',
    torZu: 'Erst alle vier Gehege schaffen!',
    loewe: 'Psst! Der Löwe schläft.',
    zusatzKurz: 'Der Löwe schläft',
    jubel: 'Kraaah! Eine neue Ziffer!',
    tipp: 'Als Nächstes: {name}! Folgt dem Pfeil.',
    tippTor: 'Alle Ziffern gefunden! Lauft zum Zootor.',
    regelTitel: 'Regel für: {name}',
    keineRegel: 'Für dieses Gehege gibt es keine Regelkarte.',
    waerterinFertig: 'Alles geschafft! Jetzt schnell zum Zootor.',
    waechter: 'Beeilt euch!',
    waechterRuf: ['Wer ist da?', 'Halt! … Ach, ihr seid es.', 'Nanu? Schon so spät!'],
    loeweSchnarcht: ['Chrrr … chrrr …', 'Chrrr … *blinzel* … chrrr', 'Grrr-mpf … zzz'],
    pollyGeschafft: ['Kraaah! Die erste Ziffer!', 'Halbzeit! Zwei Ziffern!', 'Nur noch ein Gehege!', 'Alle vier! Auf zum Zootor!'],
    pollyWarten: ['Kommt, weiter geht’s: {name}!', 'Wo bleibt ihr? Ich fliege schon mal vor!'],
    pollyZurueck: ['Nicht aufgeben! Gleich noch einmal.', 'Kurze Pause? Dann wieder rein!']
  },
  // Wege, Laternen, Brunnen, Bäume (fester Zufall: sieht jedes Mal gleich aus)
  bau(welt, D) {
    const R = seeded(20261113), W = Z.W, H = Z.H, tx = Z.tor.x, ty = Z.tor.y, rx = Z.raub.x, ry = Z.raub.y;
    const br = D.brunnen || {};
    Z.brunnen = { x: zahl(br.x, W / 2), y: zahl(br.y, H * 0.6), rx: 78, ry: 54 };
    Z.wege = [[[tx, ty], [tx, Z.brunnen.y + 96]], [[tx, Z.brunnen.y - 96], [rx, Z.raub.spot.y - 10]]];
    for (const g of Z.G) Z.wege.push([[g.spot.x, g.spot.y - 14], [g.spot.x, g.spot.y + 28], [tx, g.spot.y + 28]]);
    Z.lampen = [];
    for (const g of Z.G) Z.lampen.push({ x: g.spot.x - 152, y: g.spot.y - 20 }, { x: g.spot.x + 152, y: g.spot.y - 20 });
    Z.lampen.push({ x: tx - 120, y: ty - 40 }, { x: tx + 260, y: ty - 40 }, { x: rx - 185, y: ry + 62 }, { x: rx + 185, y: ry + 62 },
      { x: Z.brunnen.x - 130, y: Z.brunnen.y + 20 }, { x: Z.brunnen.x + 130, y: Z.brunnen.y + 20 });
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
  },
  // Brunnen und Bäume: Da kann man nicht durchlaufen
  fest(x, y, p) {
    const b = Z.brunnen, ex = (x - b.x) / (b.rx + p), ey = (y - b.y) / (b.ry + p); if (ex * ex + ey * ey < 1) return true;
    for (const t of Z.baeume) if (Math.abs(x - t.x) < 28 && Math.abs(y - t.y) < 28 && dist(x, y, t.x, t.y - 4) < 26) return true;
    return false;
  },
  boden: zeichneBoden, licht: zeichneLicht, raum: zeichneGehege, zusatz: zeichneRaub, tafel: zeichneTafel, tor: zeichneTor, begleiter: zeichnePolly,
  dinge(c, t, add, sichtbar, P) {
    const verdeckt = b => P.y < b.y && b.y - P.y < 120 * b.s && Math.abs(P.x - b.x) < 46 * b.s;
    for (const b of Z.baeume) if (sichtbar(b.x, b.y, 140)) add(b.y, () => zeichneBaum(c, b, verdeckt(b) ? 0.4 : 1));
    add(Z.brunnen.y, () => zeichneBrunnen(c, Z.brunnen, t));
    for (const l of Z.lampen) if (sichtbar(l.x, l.y, 120)) add(l.y, () => zeichneLampe(c, l, t));
  },
  figur(c, f, t, P) {
    if (f.art === 'waerterin') zeichnePerson(c, f.x, f.y, t, { jacke: '#2e7d5b', hose: '#3a4a7a', haut: '#e8b98f', hut: 'hut', brett: true, blick: P.x < f.x ? -1 : 1, hop: f.hop, groesse: 1.08 });
    else if (f.art === 'waechter') {
      c.save(); c.globalCompositeOperation = 'lighter'; c.translate(f.x, f.y - 10); c.rotate(f.kegel);
      const g = c.createRadialGradient(0, 0, 8, 0, 0, 170); g.addColorStop(0, 'rgba(190,220,255,0.30)'); g.addColorStop(1, 'rgba(190,220,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 170, -0.36, 0.36); c.closePath(); c.fill(); c.restore();
      zeichnePerson(c, f.x, f.y, t, { jacke: '#26345e', hose: '#1b2646', haut: '#c98f62', hut: 'kappe', lampe: true, streifen: '#ffd23f', blick: f.blick, gehen: f.geht, hop: f.hop, groesse: 1.12 });
    } else {
      const lift = f.hop > 0 ? Math.sin((1 - clamp(f.hop, 0, 1)) * Math.PI) * 14 : 0;
      c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, f.x, f.y, 20, 7); c.fill();
      rr(c, f.x - 16, f.y - 12, 32, 12, 4); fs(c, '#5a4636', '#000', 2.5);
      const u = clamp(f.trickT, 0, 1), dreh = Z.ruhig || u <= 0 ? 0 : f.trick === 'rollen' ? (1 - u) * TAU : f.trick === 'drehen' ? Math.sin(u * Math.PI * 3) * 0.55 : 0;
      c.save(); c.translate(f.x + (f.trick === 'rollen' && !Z.ruhig ? Math.sin(u * Math.PI) * 26 : 0), f.y - 34 - lift); c.rotate(dreh); emoji(c, f.emoji, 0, 0, 42); c.restore();
    }
  },
  spieler(c, P, t) { zeichnePerson(c, P.x, P.y, t, { jacke: '#ffd23f', hose: '#2b59c3', haut: '#dba77c', hut: 'muetze', rucksack: true, lampe: true, blick: P.blick, gehen: P.geht, hop: P.hop }); },
  zusatzSchild(r) { return r.emoji + ' ' + r.name + ' 💤'; }
};
};
})();
