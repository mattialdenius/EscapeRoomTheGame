/* =====================================================================
   STIL „STATION“ (Klasse 10): Die Raumstation
   ---------------------------------------------------------------------
   Gehört zu welt/karte.js (Karten-Motor, karte 0.4). Der Motor lädt
   diese Datei selbst, wenn in den Daten  karte: { stil: "station", … }  steht.
   Aussehen: Raumstation, kühl und reduziert. Metallboden, Leuchtbahnen,
             Fenster ins All, vier Module mit runden Luken, Airlock
             (Kulisse), Rettungskapsel mit Code-Tafel, Tanks und Fracht.
             ARIA schwebt als Hologramm mit, Wartungsdrohne, Pflanzenroboter.
   Speichert nichts, lädt nichts nach.
   ===================================================================== */
(function () {
'use strict';
window.KartenStile = window.KartenStile || {};
window.KartenStile.station = function (K) {
const { Z, TAU, clamp, circ, ell, rr, tri, fs, emoji, puls, symbol, raumStatus, zeichnePerson, zeichneRoboter, zeichneWaende, lichtKegel, emojiFigur, tuer, streue, standardWege, MONO_FONT } = K;
const ORANGE = '#ff9f1c', EIS = '#bfe9ff';

return {
  zusatzTon: 'summ',
  schild: { hell: '#e8f1ff', zu: '#1c2533', text: '#0a1220', textZu: '#e3edf8', rand: '#000', pfosten: false },
  marke: { regel: '🌿', wort: '💬', zeit: '🛠️' },
  farben: { hinter: '#02040a', ziel: ORANGE, fx: [ORANGE, '#fff', EIS], raum: ['#c8d2e0', '#bcc7d8', '#d0d6de', '#b9c4d2'], dach: '#5a6578',
    tuer: '#eaf8ff', tuerZu: '#10161f', tuerFertig: '#3a4658', fenster: '#eaf8ff', fensterZu: '#2a3342', zustand: '#0a1220', gitter: ORANGE,
    tafel: '#050a12', tafelRand: ORANGE, tafelText: EIS, licht: '150,220,255', kegel: '150,220,255', sockel: '#3a4658' },

  bau() {
    Z.wege = standardWege();
    Z.lampen = []; for (const g of Z.G) Z.lampen.push({ x: g.spot.x, y: g.spot.y, r: 120, a: 0.16 });
    const R = K.seeded(20261010); Z.sterne = []; for (let i = 0; i < 60; i++) Z.sterne.push({ x: R() * Z.W, y: 6 + R() * 52, r: 0.8 + R() * 1.6, ph: R() * 6 });
    const arten = ['tank', 'fracht', 'pflanze', 'fracht', 'tank'];
    Z.deko = streue(12, 20261010, { abstand: 140 }).map((p, i) => ({ x: p.x, y: p.y, art: arten[i % arten.length] }));
    for (const d of Z.deko) Z.hind.push({ x: d.x, y: d.y - 8, r: 22 });
  },
  boden(c, t) {
    const W = Z.W, H = Z.H;
    c.fillStyle = '#1a2230'; c.fillRect(0, 0, W, H);
    // Bodenplatten mit Nieten
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 120) { c.moveTo(x, 0); c.lineTo(x, H); } for (let y = 0; y <= H; y += 120) { c.moveTo(0, y); c.lineTo(W, y); } c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.10)'; for (let x = 0; x <= W; x += 120) for (let y = 0; y <= H; y += 120) { circ(c, x + 10, y + 10, 2.5); c.fill(); circ(c, x + 110, y + 110, 2.5); c.fill(); }
    // Leuchtbahnen
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const pass of [0, 1, 2]) { c.strokeStyle = pass === 0 ? '#0c121b' : pass === 1 ? '#232d3d' : 'rgba(191,233,255,0.6)'; c.lineWidth = pass === 0 ? 66 : pass === 1 ? 54 : 4; if (pass === 2) c.setLineDash([4, 22]); for (const P of Z.wege) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.stroke(); } c.setLineDash([]); }
    zeichneWaende(c, '#2a3342', '#232d3d');
    // Fensterband oben: Sterne und die Erde
    rr(c, 60, 8, W - 120, 52, 20); fs(c, '#02040a', '#000', 4);
    c.save(); rr(c, 62, 10, W - 124, 48, 18); c.clip();
    c.fillStyle = '#fff'; for (const s of Z.sterne) { c.globalAlpha = 0.5 + 0.5 * puls(t + s.ph, 1.5); circ(c, s.x, s.y, s.r); c.fill(); } c.globalAlpha = 1;
    circ(c, W * 0.72, 150, 110); fs(c, '#2b6fb5', '#000', 3); c.fillStyle = '#3fae6a'; ell(c, W * 0.72 - 30, 66, 36, 14); c.fill(); ell(c, W * 0.72 + 44, 58, 22, 8); c.fill();
    c.restore();
    c.strokeStyle = '#000'; c.lineWidth = 4; for (let x = 260; x < W - 100; x += 200) { c.beginPath(); c.moveTo(x, 8); c.lineTo(x, 60); c.stroke(); }
  },
  deko(c, d, t) {
    const x = d.x, y = d.y;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y, 28, 9); c.fill();
    if (d.art === 'tank') { rr(c, x - 20, y - 70, 40, 72, 16); fs(c, '#8fa3c8', '#000', 3); c.fillStyle = ORANGE; c.fillRect(x - 18, y - 44, 36, 7); rr(c, x - 7, y - 80, 14, 12, 3); fs(c, '#3a4658', '#000', 2.5); }
    else if (d.art === 'fracht') { rr(c, x - 26, y - 40, 52, 42, 5); fs(c, '#5a6578', '#000', 3); c.strokeStyle = '#000'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 26, y - 19); c.lineTo(x + 26, y - 19); c.moveTo(x, y - 40); c.lineTo(x, y + 2); c.stroke(); rr(c, x - 20, y - 34, 14, 9, 2); fs(c, EIS, '#000', 1.5); }
    else { rr(c, x - 18, y - 26, 36, 28, 6); fs(c, '#e8f1ff', '#000', 3); emoji(c, '🌿', x, y - 42, 38); }
  },
  // Modul: helle Hülle, Streifen, runde Luke. Gesperrt: Warnstreifen in der Luke.
  raum(c, g) {
    const st = raumStatus(g.nr), z = st.zustand, zu = z === 'gesperrt', F = K.stil().farben, x = g.x + (g.wackel > 0 ? Math.sin(g.wackel * 40) * 5 * g.wackel : 0), y = g.y;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 40, 140, 14); c.fill();
    rr(c, x - 130, y - 110, 260, 150, 44); fs(c, F.raum[g.nr % 4], '#000', 4);
    c.save(); rr(c, x - 128, y - 108, 256, 146, 42); c.clip(); c.fillStyle = zu ? '#6b7a90' : ORANGE; c.fillRect(x - 130, y - 100, 260, 12); if (zu) { c.fillStyle = 'rgba(2,4,10,0.5)'; c.fillRect(x - 130, y - 110, 260, 150); } c.restore();
    rr(c, x - 130, y - 110, 260, 150, 44); c.strokeStyle = '#000'; c.lineWidth = 4; c.stroke();
    circ(c, x - 86, y - 30, 30); fs(c, zu ? F.fensterZu : '#0e2a3a', '#000', 4); c.globalAlpha = zu ? 0.5 : 1; emoji(c, g.emoji, x - 86, y - 28, 36); c.globalAlpha = 1;
    circ(c, x + 86, y - 30, 30); fs(c, F.zustand, '#000', 4); symbol(c, K.SYMBOL[z] || 'schloss', x + 86, y - 30, 20);
    tuer(c, x, y, z, { form: 'rund', breite: 30, sperre: 'streifen' });
    circ(c, x, y + 2, 38); c.strokeStyle = '#5a6578'; c.lineWidth = 5; c.stroke(); circ(c, x, y + 2, 41); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke();
  },
  zusatz(c, r, t) {
    const x = r.x + (r.wackel > 0 && !Z.ruhig ? Math.sin(r.wackel * 40) * 4 * r.wackel : 0), y = r.y, wach = r.wach > 0;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 40, 160, 16); c.fill();
    rr(c, x - 150, y - 110, 300, 150, 44); fs(c, '#5a6578', '#000', 4);
    circ(c, x, y - 36, 64); fs(c, '#02040a', '#000', 5);
    c.save(); circ(c, x, y - 36, 61); c.clip(); c.fillStyle = '#fff'; for (let i = 0; i < 22; i++) { const sx = x - 60 + ((i * 53 + (Z.ruhig ? 0 : t * (wach ? 90 : 14))) % 120), sy = y - 94 + (i * 37) % 116; circ(c, sx, sy, 1 + (i % 3) * 0.6); c.fill(); } c.restore();
    c.strokeStyle = ORANGE; c.lineWidth = 6; c.setLineDash([16, 12]); circ(c, x, y - 36, 72); c.stroke(); c.setLineDash([]);
    emoji(c, r.emoji, x, y - 34, 40);
  },
  // Rettungskapsel: runde Luke unten
  tor(c, t) {
    const tor = Z.tor, bereit = !!(Z.status && Z.status.torBereit), x = tor.x + (tor.wackel > 0 ? Math.sin(tor.wackel * 40) * 5 * tor.wackel : 0), y = tor.y;
    if (bereit) { c.fillStyle = 'rgba(191,233,255,' + (0.22 + 0.2 * puls(t)) + ')'; ell(c, x, y - 30, 120, 44); c.fill(); }
    rr(c, x - 78, y - 84, 156, 116, 40); fs(c, '#c8d2e0', '#000', 4);
    circ(c, x, y - 22, 48); fs(c, bereit ? '#eaf8ff' : '#10161f', '#000', 4);
    if (!bereit) { c.save(); circ(c, x, y - 22, 46); c.clip(); c.strokeStyle = ORANGE; c.lineWidth = 6; for (let i = -140; i < 140; i += 24) { c.beginPath(); c.moveTo(x + i, y + 30); c.lineTo(x + i + 60, y - 74); c.stroke(); } c.restore(); }
    circ(c, x, y - 22, 18); fs(c, '#0a1220', '#000', 3); symbol(c, bereit ? 'pfeil' : 'schloss', x, y - 22, 12);
  },
  figur(c, f, t, P) {
    if (f.art === 'waerterin') { zeichneRoboter(c, f.x, f.y, t, { farbe: '#7fb77e', kopf: '#a6d3a0', auge: '#fff', brett: true, antenne: false, blick: P.x < f.x ? -1 : 1, hop: f.hop, groesse: 1.1 }); emoji(c, '🌱', f.x, f.y - 84, 20); }
    else if (f.art === 'waechter') { lichtKegel(c, f.x, f.y - 40, f.kegel, 170, '150,220,255', 0.36); zeichneRoboter(c, f.x, f.y, t, { farbe: '#8fa3c8', kopf: '#c8d2e0', auge: ORANGE, schwebt: true, blick: f.blick, hop: f.hop, groesse: 1.05 }); }
    else emojiFigur(c, f, t, '#3a4658');
  },
  spieler(c, P, t) { zeichnePerson(c, P.x, P.y, t, { jacke: '#e5e7eb', hose: '#9aa6b8', haut: '#dba77c', hut: 'helm', streifen: ORANGE, rucksack: true, blick: P.blick, gehen: P.geht, hop: P.hop, groesse: 1.08 }); },
  // ARIA: schwebendes Hologramm mit müdem Blick
  begleiter(c, po, t) {
    const a = 0.75 + 0.2 * puls(t, 3);
    c.save(); c.translate(po.x, po.y);
    c.fillStyle = 'rgba(150,220,255,0.18)'; tri(c, -14, 44, 14, 44, 0, 10); c.fill();
    c.globalAlpha = a; circ(c, 0, 0, 22); fs(c, 'rgba(20,60,90,0.85)', EIS, 3); c.strokeStyle = EIS; c.lineWidth = 2; c.setLineDash([5, 5]); circ(c, 0, 0, 28); c.stroke(); c.setLineDash([]);
    // halb geschlossene Augen
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, -2); c.lineTo(-4, -2); c.moveTo(4, -2); c.lineTo(12, -2); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-8, -2, 4, 0, Math.PI); c.fill(); c.beginPath(); c.arc(8, -2, 4, 0, Math.PI); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, 10); c.lineTo(5, 10); c.stroke();
    c.restore();
  }
};
};
})();
