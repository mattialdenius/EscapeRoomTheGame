/* =====================================================================
   STIL „DETEKTIV“ (Klasse 8): Das Detektivbüro in London
   ---------------------------------------------------------------------
   Gehört zu welt/karte.js (Karten-Motor, karte 0.4). Der Motor lädt
   diese Datei selbst, wenn in den Daten  karte: { stil: "detektiv", … }  steht.
   Aussehen: Büro bei Nacht, dunkel und reduziert. Holzboden, Regen an
             den Fenstern, vier Büros mit Milchglas, Interview Room
             (Kulisse), Tresor mit Code-Tafel, Schreibtische mit Lampen.
             Inspector Morgan läuft mit.
   Speichert nichts, lädt nichts nach.
   ===================================================================== */
(function () {
'use strict';
window.KartenStile = window.KartenStile || {};
window.KartenStile.detektiv = function (K) {
const { Z, TAU, clamp, circ, ell, rr, tri, fs, emoji, puls, symbol, raumStatus, zeichnePerson, zeichneWaende, lichtKegel, emojiFigur, tuer, streue, standardWege, MONO_FONT } = K;
const MESSING = '#c9a45c';

return {
  begleiterAmBoden: true, spielerLicht: true, zusatzTon: 'tipp',
  schild: { hell: '#f3e9d2', zu: '#232733', text: '#1a1410', textZu: '#ece6d6', rand: '#000', pfosten: false },
  marke: { regel: '🗂️', wort: '💬', zeit: '🔦' },
  farben: { hinter: '#07080c', ziel: '#ffd23f', fx: [MESSING, '#fff', '#9ecbff'], raum: ['#3a2f28', '#33302c', '#3d3229', '#2f3238'], dach: '#17131c',
    tuer: '#fff0c2', tuerZu: '#0e0f14', tuerFertig: '#2a2622', fenster: '#dfe9ee', fensterZu: '#1c2026', zustand: '#0e0f14', gitter: '#f2c230',
    tafel: '#0e0f14', tafelRand: MESSING, tafelText: '#ffd23f', licht: '255,214,140', kegel: '255,235,190', sockel: '#2a2622' },
  leute: {
    begleiter: { jacke: '#8a7a5c', hose: '#1b1b22', haut: '#d9a77f', hut: 'fedora', hutFarbe: '#4a4033', mantel: true, groesse: 1.2 }
  },

  bau() {
    Z.wege = standardWege();
    const arten = ['tisch', 'akten', 'tisch', 'garderobe', 'akten'];
    Z.deko = streue(12, 20260808, { abstand: 140 }).map((p, i) => ({ x: p.x, y: p.y, art: arten[i % arten.length] }));
    for (const d of Z.deko) Z.hind.push({ x: d.x, y: d.y - 8, r: d.art === 'tisch' ? 30 : 22 });
    Z.lampen = Z.deko.filter(d => d.art === 'tisch').map(d => ({ x: d.x, y: d.y - 10, r: 120, a: 0.22 }));
    for (const g of Z.G) Z.lampen.push({ x: g.spot.x, y: g.spot.y, r: 110, a: 0.12 });
  },
  boden(c, t) {
    const W = Z.W, H = Z.H;
    c.fillStyle = '#2a2018'; c.fillRect(0, 0, W, H);
    // Fischgrät-Parkett
    c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 2; c.beginPath();
    for (let y = 0, k = 0; y < H + 40; y += 40, k++) for (let x = (k % 2) * 40 - 40; x < W; x += 80) { c.moveTo(x, y); c.lineTo(x + 40, y - 40); c.moveTo(x + 40, y - 40); c.lineTo(x + 80, y); }
    c.stroke();
    // dunkelgrüner Läufer
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const pass of [0, 1]) { c.strokeStyle = pass ? '#1f3a33' : '#0c1512'; c.lineWidth = pass ? 54 : 64; for (const P of Z.wege) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.stroke(); } }
    zeichneWaende(c, '#1b1f2a', '#1f3a33');
    // Fenster oben: Stadt bei Regen
    for (let x = 90, i = 0; x < W - 140; x += 200, i++) {
      rr(c, x, 10, 130, 50, 3); fs(c, '#16233a', '#000', 4);
      c.fillStyle = '#ffd98a'; for (let k = 0; k < 5; k++) c.fillRect(x + 12 + ((i * 31 + k * 23) % 104), 30 + ((k * 7 + i * 5) % 22), 5, 5);
      c.strokeStyle = 'rgba(200,225,255,0.55)'; c.lineWidth = 2; const v = Z.ruhig ? 0 : (t * 60 + i * 13) % 20;
      for (let k = 0; k < 7; k++) { const rx = x + 10 + k * 18, ry = 12 + (k * 9 + v) % 34; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 4, ry + 10); c.stroke(); }
      c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 65, 10); c.lineTo(x + 65, 60); c.stroke();
    }
  },
  deko(c, d) {
    const x = d.x, y = d.y;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y, 32, 9); c.fill();
    if (d.art === 'tisch') {
      rr(c, x - 36, y - 30, 72, 30, 4); fs(c, '#4a3528', '#000', 3);
      rr(c, x - 28, y - 38, 26, 8, 2); fs(c, '#f3e9d2', '#000', 2);
      c.fillStyle = '#000'; c.fillRect(x + 14, y - 46, 3, 16); tri(c, x + 4, y - 44, x + 28, y - 44, x + 22, y - 56); fs(c, '#1f6b4f', '#000', 2.5); c.fillStyle = '#fff3c4'; c.fillRect(x + 8, y - 44, 16, 3);
    } else if (d.art === 'akten') {
      rr(c, x - 22, y - 72, 44, 74, 3); fs(c, '#4d5563', '#000', 3);
      for (let i = 0; i < 3; i++) { rr(c, x - 17, y - 66 + i * 23, 34, 18, 2); fs(c, '#3a414d', '#000', 2); rr(c, x - 7, y - 60 + i * 23, 14, 5, 2); fs(c, MESSING, '#000', 1.5); }
    } else {
      c.fillStyle = '#000'; c.fillRect(x - 3, y - 84, 6, 84); c.fillRect(x - 16, y - 4, 32, 5);
      rr(c, x - 16, y - 74, 20, 40, 8); fs(c, '#8a7a5c', '#000', 2.5); rr(c, x + 2, y - 90, 22, 8, 3); fs(c, '#3b3b46', '#000', 2.5);
    }
  },
  // Büro: Holzwand, Milchglasfenster, Messingschild, Tür mit Glas. Gesperrt: Absperrband.
  raum(c, g) {
    const st = raumStatus(g.nr), z = st.zustand, zu = z === 'gesperrt', F = K.stil().farben, x = g.x + (g.wackel > 0 ? Math.sin(g.wackel * 40) * 5 * g.wackel : 0), y = g.y;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 40, 140, 14); c.fill();
    rr(c, x - 130, y - 110, 260, 150, 4); fs(c, F.raum[g.nr % 4], '#000', 4);
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; c.beginPath(); for (let i = -104; i <= 104; i += 26) { c.moveTo(x + i, y - 108); c.lineTo(x + i, y + 38); } c.stroke();
    if (zu) { c.fillStyle = 'rgba(7,8,12,0.5)'; rr(c, x - 130, y - 110, 260, 150, 4); c.fill(); }
    rr(c, x - 136, y - 120, 272, 18, 3); fs(c, '#17131c', '#000', 4);
    rr(c, x - 118, y - 80, 70, 78, 4); fs(c, zu ? F.fensterZu : F.fenster, '#000', 4); c.globalAlpha = zu ? 0.45 : 1; emoji(c, g.emoji, x - 83, y - 40, 38); c.globalAlpha = 1;
    rr(c, x + 48, y - 80, 70, 78, 4); fs(c, F.zustand, MESSING, 5); rr(c, x + 48, y - 80, 70, 78, 4); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke(); symbol(c, K.SYMBOL[z] || 'schloss', x + 83, y - 41, 21);
    tuer(c, x, y, z, { form: 'eckig', breite: 30, sperre: 'streifen' });
  },
  zusatz(c, r, t) {
    const x = r.x + (r.wackel > 0 && !Z.ruhig ? Math.sin(r.wackel * 40) * 4 * r.wackel : 0), y = r.y, wach = r.wach > 0;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 40, 160, 16); c.fill();
    rr(c, x - 150, y - 110, 300, 150, 4); fs(c, '#23262f', '#000', 4); rr(c, x - 156, y - 120, 312, 18, 3); fs(c, '#17131c', '#000', 4);
    // Einwegspiegel: dunkles Glas, Lampe pendelt, zwei Schatten am Tisch
    rr(c, x - 118, y - 84, 236, 104, 4); fs(c, '#0b0d12', '#000', 4);
    c.save(); c.beginPath(); c.rect(x - 116, y - 82, 232, 100); c.clip();
    const a = Z.ruhig ? 0 : Math.sin(t * (wach ? 5 : 1.6)) * (wach ? 0.5 : 0.22), lx = x + Math.sin(a) * 50, ly = y - 84 + Math.cos(a) * 50;
    c.fillStyle = 'rgba(255,230,160,0.20)'; tri(c, lx, ly, lx - 70, y + 24, lx + 70, y + 24); c.fill();
    c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 84); c.lineTo(lx, ly); c.stroke(); circ(c, lx, ly, 7); fs(c, '#fff3c4', '#000', 2);
    c.fillStyle = '#2a2f3a'; rr(c, x - 50, y - 6, 100, 12, 3); c.fill(); circ(c, x - 66, y - 16, 13); c.fill(); rr(c, x - 80, y - 4, 28, 26, 8); c.fill(); circ(c, x + 66, y - 16, 13); c.fill(); rr(c, x + 52, y - 4, 28, 26, 8); c.fill();
    c.restore(); emoji(c, r.emoji, x, y - 18, 26);
  },
  // Der Tresor mit den Beweisen
  tor(c, t) {
    const tor = Z.tor, bereit = !!(Z.status && Z.status.torBereit), x = tor.x + (tor.wackel > 0 ? Math.sin(tor.wackel * 40) * 5 * tor.wackel : 0), y = tor.y;
    if (bereit) { c.fillStyle = 'rgba(255,214,120,' + (0.22 + 0.2 * puls(t)) + ')'; ell(c, x, y - 30, 120, 44); c.fill(); }
    rr(c, x - 76, y - 88, 152, 120, 8); fs(c, '#4d5563', '#000', 4); rr(c, x - 62, y - 74, 124, 96, 5); fs(c, '#3a414d', '#000', 4);
    c.fillStyle = '#000'; c.fillRect(x - 70, y - 62, 8, 20); c.fillRect(x - 70, y - 12, 8, 20);
    circ(c, x, y - 28, 30); fs(c, '#c8ccd4', '#000', 4);
    c.save(); c.translate(x, y - 28); c.rotate(bereit && !Z.ruhig ? t * 2 : 0.5); c.strokeStyle = '#000'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.rotate(TAU / 6); c.beginPath(); c.moveTo(-24, 0); c.lineTo(24, 0); c.stroke(); } c.restore();
    circ(c, x, y - 28, 13); fs(c, '#0e0f14', '#000', 3); symbol(c, bereit ? 'pfeil' : 'schloss', x, y - 28, 9);
  },
  figur(c, f, t, P) {
    if (f.art === 'waerterin') zeichnePerson(c, f.x, f.y, t, { jacke: '#1e2a4a', hose: '#11131a', haut: '#e8b98f', hut: 'kappe', brett: true, streifen: '#c8ccd4', blick: P.x < f.x ? -1 : 1, hop: f.hop, groesse: 1.12 });
    else if (f.art === 'waechter') { lichtKegel(c, f.x, f.y - 10, f.kegel, 170, '255,235,190', 0.36); zeichnePerson(c, f.x, f.y, t, { jacke: '#1b2238', hose: '#11131a', haut: '#c98f62', hut: 'kappe', lampe: true, blick: f.blick, gehen: f.geht, hop: f.hop, groesse: 1.14 }); }
    else emojiFigur(c, f, t, '#2a2622');
  },
  spieler(c, P, t) { zeichnePerson(c, P.x, P.y, t, { jacke: '#56617a', hose: '#1b1b22', haut: '#dba77c', hut: 'haare', hutFarbe: '#2b1d16', mantel: true, lampe: true, blick: P.blick, gehen: P.geht, hop: P.hop, groesse: 1.08 }); }
};
};
})();
