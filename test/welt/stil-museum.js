/* =====================================================================
   STIL „MUSEUM“ (Klasse 7): Das Museum der Zeitreisen
   ---------------------------------------------------------------------
   Gehört zu welt/karte.js (Karten-Motor, karte 0.4). Der Motor lädt
   diese Datei selbst, wenn in den Daten  karte: { stil: "museum", … }  steht.
   Aussehen: Museum bei Nacht, sachlich. Steinboden, roter Läufer,
             vier Säle mit Säulen, Zeitstrudel (Kulisse), Zeitmaschine
             mit Code-Tafel, Vitrinen, Museumswärter, Roboter-Guide.
             Professorin Tempora begleitet über Funk: eine fliegende Uhr.
   Speichert nichts, lädt nichts nach.
   ===================================================================== */
(function () {
'use strict';
window.KartenStile = window.KartenStile || {};
window.KartenStile.museum = function (K) {
const { Z, TAU, clamp, circ, ell, rr, tri, fs, emoji, puls, symbol, raumStatus, zeichnePerson, zeichneRoboter, zeichneWaende, lichtKegel, emojiFigur, fensterEmoji, fensterZustand, tuer, streue, standardWege } = K;
const GOLD = '#d9b45a';

return {
  spielerLicht: true, zusatzTon: 'summ',
  marke: { regel: '📖', wort: '💬', zeit: '🔦' },
  farben: { hinter: '#0c0a12', ziel: '#ffd23f', fx: [GOLD, '#fff', '#9ecbff'], raum: ['#cbbd9f', '#d6c59c', '#bfb7a6', '#c3c9d4'], dach: '#8c7a5b',
    tuer: '#ffe9b0', tuerZu: '#17131c', tuerFertig: '#4a4252', fenster: '#fff3c4', fensterZu: '#3b3542', zustand: '#17131c', gitter: GOLD,
    tafel: '#17131c', tafelRand: GOLD, tafelText: '#ffd23f', licht: '255,220,150', kegel: '255,235,190', sockel: '#6e6578' },

  bau() {
    Z.wege = standardWege();
    Z.lampen = []; for (const g of Z.G) Z.lampen.push({ x: g.spot.x, y: g.spot.y - 10, r: 130, a: 0.2 });
    const arten = ['vitrine', 'statue', 'vitrine', 'bank', 'vitrine'], stuecke = ['🏺', '👑', '🦴', '⚔️', '💎', '🗿', '📜', '🪙'];
    Z.deko = streue(12, 20260707, { abstand: 140 }).map((p, i) => ({ x: p.x, y: p.y, art: arten[i % arten.length], emoji: stuecke[i % stuecke.length] }));
    for (const d of Z.deko) Z.hind.push({ x: d.x, y: d.y - 8, r: d.art === 'bank' ? 30 : 24 });
  },
  boden(c, t) {
    const W = Z.W, H = Z.H;
    c.fillStyle = '#262231'; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,0.045)'; for (let y = 0, k = 0; y < H; y += 60, k++) for (let x = (k % 2) * 60; x < W; x += 120) c.fillRect(x, y, 60, 60);
    // roter Läufer mit goldenem Rand
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const pass of [0, 1, 2]) { c.strokeStyle = pass === 0 ? '#000' : pass === 1 ? GOLD : '#7a1f2b'; c.lineWidth = pass === 0 ? 66 : pass === 1 ? 58 : 46; for (const P of Z.wege) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.stroke(); } }
    zeichneWaende(c, '#3a3048', '#7a1f2b');
    // Wandband oben: Bilderrahmen
    for (let x = 80, i = 0; x < W - 100; x += 170, i++) { rr(c, x, 14, 100, 44, 3); fs(c, GOLD, '#000', 3); c.fillStyle = ['#2b59c3', '#2e7d5b', '#7b1e2b', '#3a3048'][i % 4]; c.fillRect(x + 8, 21, 84, 30); c.fillStyle = 'rgba(255,255,255,0.5)'; circ(c, x + 30 + (i * 13) % 40, 34, 7); c.fill(); }
  },
  deko(c, d) {
    const x = d.x, y = d.y;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y, 30, 9); c.fill();
    if (d.art === 'vitrine') { rr(c, x - 22, y - 26, 44, 28, 4); fs(c, '#6e6578', '#000', 3); rr(c, x - 20, y - 70, 40, 46, 5); fs(c, 'rgba(190,225,255,0.22)', '#000', 3); emoji(c, d.emoji, x, y - 46, 26); c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 13, y - 62); c.lineTo(x - 13, y - 44); c.stroke(); }
    else if (d.art === 'statue') { rr(c, x - 22, y - 22, 44, 24, 3); fs(c, '#9a93a6', '#000', 3); emoji(c, '🗿', x, y - 48, 46); }
    else { rr(c, x - 34, y - 22, 68, 14, 5); fs(c, '#7a1f2b', '#000', 3); c.fillStyle = '#000'; c.fillRect(x - 28, y - 9, 6, 10); c.fillRect(x + 22, y - 9, 6, 10); }
  },
  // Saal: Stein, zwei Säulen, Giebel
  raum(c, g) {
    const st = raumStatus(g.nr), z = st.zustand, zu = z === 'gesperrt', F = K.stil().farben, x = g.x + (g.wackel > 0 ? Math.sin(g.wackel * 40) * 5 * g.wackel : 0), y = g.y;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 40, 140, 16); c.fill();
    rr(c, x - 130, y - 100, 260, 140, 4); fs(c, F.raum[g.nr % 4], '#000', 4);
    if (zu) { c.fillStyle = 'rgba(12,10,18,0.5)'; rr(c, x - 130, y - 100, 260, 140, 4); c.fill(); }
    tri(c, x - 144, y - 100, x + 144, y - 100, x, y - 136); fs(c, F.dach, '#000', 4);
    rr(c, x - 140, y - 106, 280, 16, 3); fs(c, '#e9dfc6', '#000', 4);
    for (const dx of [-124, 104]) { rr(c, x + dx, y - 90, 20, 130, 4); fs(c, '#efe6cf', '#000', 3); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + dx + 7, y - 86); c.lineTo(x + dx + 7, y + 36); c.moveTo(x + dx + 13, y - 86); c.lineTo(x + dx + 13, y + 36); c.stroke(); }
    fensterEmoji(c, g, x - 66, y - 36, zu, 30); fensterZustand(c, z, x + 66, y - 36, 27); tuer(c, x, y, z, { breite: 26 });
  },
  zusatz(c, r, t) {
    const x = r.x + (r.wackel > 0 && !Z.ruhig ? Math.sin(r.wackel * 40) * 4 * r.wackel : 0), y = r.y, wach = r.wach > 0;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 40, 160, 18); c.fill();
    rr(c, x - 150, y - 110, 300, 150, 6); fs(c, '#2f2740', '#000', 4);
    circ(c, x, y - 36, 66); fs(c, '#0c0a12', GOLD, 6); circ(c, x, y - 36, 66); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke();
    // Strudel: Spiralbögen, die sich drehen
    c.save(); c.translate(x, y - 36); c.rotate(Z.ruhig ? 0.4 : t * (wach ? 4 : 0.9)); c.lineCap = 'round';
    for (let i = 0; i < 4; i++) { c.rotate(TAU / 4); c.strokeStyle = i % 2 ? '#9ecbff' : '#fff'; c.lineWidth = i % 2 ? 6 : 3; if (i % 2) c.setLineDash([10, 8]); c.beginPath(); c.arc(14, 0, 40, Math.PI * 0.1, Math.PI * 1.1); c.stroke(); c.setLineDash([]); }
    c.restore(); emoji(c, r.emoji, x, y - 34, 34);
  },
  // Die Zeitmaschine steht unten: Messingkapsel mit Uhr
  tor(c, t) {
    const tor = Z.tor, bereit = !!(Z.status && Z.status.torBereit), x = tor.x + (tor.wackel > 0 ? Math.sin(tor.wackel * 40) * 5 * tor.wackel : 0), y = tor.y;
    if (bereit) { c.fillStyle = 'rgba(255,214,120,' + (0.25 + 0.2 * puls(t)) + ')'; ell(c, x, y - 30, 130, 48); c.fill(); }
    rr(c, x - 74, y - 86, 148, 118, 30); fs(c, '#a8823a', '#000', 4); rr(c, x - 60, y - 72, 120, 90, 22); fs(c, bereit ? '#ffe9b0' : '#17131c', '#000', 4);
    circ(c, x, y - 28, 30); fs(c, '#f4ead2', '#000', 4);
    c.strokeStyle = '#000'; c.lineWidth = 3; c.lineCap = 'round'; const a = bereit && !Z.ruhig ? t * 3 : -1.1; c.beginPath(); c.moveTo(x, y - 28); c.lineTo(x + Math.cos(a) * 20, y - 28 + Math.sin(a) * 20); c.moveTo(x, y - 28); c.lineTo(x + Math.cos(a * 0.3 + 2) * 13, y - 28 + Math.sin(a * 0.3 + 2) * 13); c.stroke();
    circ(c, x, y + 14, 15); fs(c, '#17131c', '#000', 3); symbol(c, bereit ? 'pfeil' : 'schloss', x, y + 14, 10);
  },
  figur(c, f, t, P) {
    if (f.art === 'waerterin') zeichneRoboter(c, f.x, f.y, t, { farbe: '#c9a45c', kopf: '#e3c98a', auge: '#7df9ff', brett: true, blick: P.x < f.x ? -1 : 1, hop: f.hop, groesse: 1.1 });
    else if (f.art === 'waechter') { lichtKegel(c, f.x, f.y - 10, f.kegel, 170, '255,235,190', 0.36); zeichnePerson(c, f.x, f.y, t, { jacke: '#3a3048', hose: '#1b1b22', haut: '#c98f62', hut: 'kappe', lampe: true, streifen: GOLD, blick: f.blick, gehen: f.geht, hop: f.hop, groesse: 1.14 }); }
    else emojiFigur(c, f, t, '#6e6578');
  },
  spieler(c, P, t) { zeichnePerson(c, P.x, P.y, t, { jacke: '#3b82f6', hose: '#1f2937', haut: '#dba77c', hut: 'haare', hutFarbe: '#5a3a22', rucksack: true, lampe: true, blick: P.blick, gehen: P.geht, hop: P.hop, groesse: 1.04 }); },
  // Professorin Tempora ist über Funk dabei: eine fliegende Taschenuhr
  begleiter(c, po, t) {
    const fl = Z.ruhig ? 0.2 : Math.sin(t * 14) * 0.5;
    c.save(); c.translate(po.x, po.y);
    for (const s of [-1, 1]) { c.save(); c.scale(s, 1); c.rotate(-0.3 - fl); c.beginPath(); c.moveTo(12, -4); c.quadraticCurveTo(40, -22, 44, 0); c.quadraticCurveTo(28, -2, 12, 6); c.closePath(); fs(c, '#f4ead2', '#000', 2.5); c.restore(); }
    circ(c, 0, 0, 17); fs(c, GOLD, '#000', 3); circ(c, 0, 0, 12); fs(c, '#fff', '#000', 2); rr(c, -4, -24, 8, 8, 2); fs(c, GOLD, '#000', 2);
    c.strokeStyle = '#000'; c.lineWidth = 2.2; c.lineCap = 'round'; const a = Z.ruhig ? 1 : t * 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); c.moveTo(0, 0); c.lineTo(0, -6); c.stroke();
    c.restore();
  }
};
};
})();
