/* =====================================================================
   STIL „SCHIFF“ (Klasse 6): Das Piratenschiff
   ---------------------------------------------------------------------
   Gehört zu welt/karte.js (Karten-Motor, karte 0.4). Der Motor lädt
   diese Datei selbst, wenn in den Daten  karte: { stil: "schiff", … }  steht.
   Aussehen: Holzdeck auf dem Meer bei Abendlicht, farbig und verspielt.
             Vier Kajüten, Pulverkammer (Kulisse), Beiboot mit Code-Tafel,
             Käpt'n Grammar läuft mit, Schiffskoch, Wache, Masten, Fässer.
   Speichert nichts, lädt nichts nach.
   ===================================================================== */
(function () {
'use strict';
window.KartenStile = window.KartenStile || {};
window.KartenStile.schiff = function (K) {
const { Z, TAU, clamp, circ, ell, rr, tri, fs, emoji, puls, symbol, raumStatus, zeichnePerson, lichtKegel, emojiFigur, fensterEmoji, fensterZustand, tuer, streue, standardWege } = K;

return {
  begleiterAmBoden: true, zusatzTon: 'zu',
  marke: { regel: '📜', wort: '💬', zeit: '🔦' },
  farben: { hinter: '#0b3558', ziel: '#ffd23f', fx: ['#ffd23f', '#fff', '#ff9f1c'], raum: ['#b5763f', '#9c6a3a', '#a87945', '#8f5f38'], dach: '#7b1e2b',
    tuer: '#ffe08a', tuerZu: '#2a1a10', tuerFertig: '#5a3a22', fenster: '#fff3c4', fensterZu: '#3a2a1c', zustand: '#2a1a10', gitter: '#b9bfc9',
    tafel: '#2a1a10', tafelRand: '#ffd23f', tafelText: '#ffd23f', licht: '255,200,110', kegel: '255,220,150', sockel: '#5a3a22' },
  leute: {
    begleiter: { jacke: '#7b1e2b', hose: '#1b1b22', haut: '#d9a77f', hut: 'dreispitz', mantel: true, groesse: 1.22 }
  },

  bau() {
    Z.wege = standardWege();
    Z.lampen = []; for (const g of Z.G) Z.lampen.push({ x: g.spot.x - 150, y: g.spot.y - 20, r: 130 }, { x: g.spot.x + 150, y: g.spot.y - 20, r: 130 });
    // Zwei Masten (da läuft man außen herum), dazu Fässer, Kisten und Taurollen
    Z.masten = [{ x: Z.W / 2 - 200, y: Z.H * 0.56 }, { x: Z.W / 2 + 200, y: Z.H * 0.56 }];
    for (const m of Z.masten) Z.hind.push({ x: m.x, y: m.y, r: 30 });
    const arten = ['fass', 'kiste', 'tau', 'fass', 'kanone'];
    Z.deko = streue(12, 20260606, { abstand: 130 }).map((p, i) => ({ x: p.x, y: p.y, art: arten[i % arten.length], z: p.z }));
    for (const d of Z.deko) Z.hind.push({ x: d.x, y: d.y - 8, r: 22 });
  },
  boden(c, t) {
    const W = Z.W, H = Z.H, tor = Z.tor;
    // Meer mit Wellen
    c.fillStyle = '#1565a8'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let y = 14; y < H; y += 46) for (let x = (y * 7) % 90 - 60; x < W + 60; x += 150) { const dx = Z.ruhig ? 0 : Math.sin(t * 0.8 + y) * 10; c.beginPath(); c.arc(x + dx, y, 16, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    // Schiffsrumpf und Deck
    rr(c, 14, 44, W - 28, H - 20, 150); fs(c, '#5a3a22', '#000', 5);
    c.save(); rr(c, 30, 62, W - 60, H - 40, 132); c.clip();
    c.fillStyle = '#c08a52'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(90,58,34,0.55)'; c.lineWidth = 2; c.beginPath(); for (let y = 62; y < H; y += 36) { c.moveTo(0, y); c.lineTo(W, y); } c.stroke();
    c.fillStyle = 'rgba(90,58,34,0.6)'; for (let y = 62, k = 0; y < H; y += 36, k++) for (let x = (k % 2) * 110 + 40; x < W; x += 220) { c.fillRect(x, y, 2, 36); circ(c, x - 8, y + 18, 2.2); c.fill(); circ(c, x + 8, y + 18, 2.2); c.fill(); }
    // abgelaufene Planken als Wege
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = 'rgba(255,236,190,0.28)'; c.lineWidth = 56;
    for (const P of Z.wege) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.stroke(); }
    c.restore();
    // Reling unten mit Lücke fürs Beiboot
    c.strokeStyle = '#000'; c.lineWidth = 14; c.beginPath(); c.moveTo(150, tor.y + 2); c.lineTo(tor.x - 86, tor.y + 2); c.moveTo(tor.x + 86, tor.y + 2); c.lineTo(W - 150, tor.y + 2); c.stroke();
    c.strokeStyle = '#7b4a26'; c.lineWidth = 8; c.beginPath(); c.moveTo(150, tor.y + 2); c.lineTo(tor.x - 86, tor.y + 2); c.moveTo(tor.x + 86, tor.y + 2); c.lineTo(W - 150, tor.y + 2); c.stroke();
  },
  dinge(c, t, add, sichtbar) {
    for (const d of Z.deko) if (sichtbar(d.x, d.y, 160)) add(d.y, () => this.deko(c, d, t));
    for (const m of Z.masten) add(m.y, () => {
      c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, m.x + 60, m.y + 14, 120, 26); c.fill();
      circ(c, m.x, m.y - 6, 30); fs(c, '#7b4a26', '#000', 4); circ(c, m.x, m.y - 6, 17); fs(c, '#5a3a22', '#000', 3);
      c.strokeStyle = '#000'; c.lineWidth = 8; c.beginPath(); c.moveTo(m.x - 96, m.y - 6); c.lineTo(m.x + 96, m.y - 6); c.stroke(); c.strokeStyle = '#e8dcc0'; c.lineWidth = 4; c.stroke();
    });
    for (const l of Z.lampen) if (sichtbar(l.x, l.y, 120)) add(l.y, () => { c.fillStyle = '#000'; c.fillRect(l.x - 3, l.y - 56, 6, 56); c.fillStyle = 'rgba(255,214,120,0.4)'; circ(c, l.x, l.y - 64, 20 + 2 * puls(t + l.x, 2.3)); c.fill(); rr(c, l.x - 10, l.y - 78, 20, 24, 5); fs(c, '#ffe7a3', '#000', 3); });
  },
  deko(c, d) {
    const x = d.x, y = d.y;
    c.fillStyle = 'rgba(0,0,0,0.28)'; ell(c, x, y, 28, 9); c.fill();
    if (d.art === 'fass') { rr(c, x - 20, y - 48, 40, 50, 12); fs(c, '#8a5a33', '#000', 3); c.strokeStyle = '#3a3a44'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 20, y - 36); c.lineTo(x + 20, y - 36); c.moveTo(x - 20, y - 12); c.lineTo(x + 20, y - 12); c.stroke(); }
    else if (d.art === 'kiste') { rr(c, x - 24, y - 40, 48, 42, 4); fs(c, '#a8703f', '#000', 3); c.strokeStyle = '#000'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 24, y - 40); c.lineTo(x + 24, y + 2); c.moveTo(x + 24, y - 40); c.lineTo(x - 24, y + 2); c.stroke(); }
    else if (d.art === 'tau') { for (let i = 0; i < 3; i++) { ell(c, x, y - 8 - i * 8, 22 - i * 2, 9); fs(c, '#d9c08a', '#000', 2.5); } }
    else { rr(c, x - 30, y - 26, 52, 22, 10); fs(c, '#2a2a33', '#000', 3); circ(c, x - 16, y - 4, 10); fs(c, '#7b4a26', '#000', 3); circ(c, x + 10, y - 4, 10); fs(c, '#7b4a26', '#000', 3); circ(c, x + 24, y - 15, 7); fs(c, '#000'); }
  },
  raum(c, g) {
    const st = raumStatus(g.nr), z = st.zustand, zu = z === 'gesperrt', F = K.stil().farben, x = g.x + (g.wackel > 0 ? Math.sin(g.wackel * 40) * 5 * g.wackel : 0), y = g.y;
    c.fillStyle = 'rgba(0,0,0,0.28)'; ell(c, x, y + 40, 140, 16); c.fill();
    rr(c, x - 130, y - 110, 260, 150, 10); fs(c, F.raum[g.nr % 4], '#000', 4);
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2; c.beginPath(); for (let i = 1; i < 5; i++) { c.moveTo(x - 128, y - 110 + i * 30); c.lineTo(x + 128, y - 110 + i * 30); } c.stroke();
    if (zu) { c.fillStyle = 'rgba(20,10,5,0.5)'; rr(c, x - 130, y - 110, 260, 150, 10); c.fill(); }
    // gestreiftes Dach
    rr(c, x - 140, y - 126, 280, 38, 10); fs(c, F.dach, '#000', 4);
    c.save(); rr(c, x - 138, y - 124, 276, 34, 8); c.clip(); c.fillStyle = '#f4ead2'; for (let i = -140; i < 140; i += 44) c.fillRect(x + i, y - 126, 22, 40); c.restore();
    rr(c, x - 140, y - 126, 280, 38, 10); c.strokeStyle = '#000'; c.lineWidth = 4; c.stroke();
    fensterEmoji(c, g, x - 84, y - 36, zu); fensterZustand(c, z, x + 84, y - 36); tuer(c, x, y, z);
  },
  zusatz(c, r, t) {
    const x = r.x + (r.wackel > 0 && !Z.ruhig ? Math.sin(r.wackel * 40) * 4 * r.wackel : 0), y = r.y, wach = r.wach > 0;
    c.fillStyle = 'rgba(0,0,0,0.28)'; ell(c, x, y + 40, 160, 18); c.fill();
    rr(c, x - 150, y - 110, 300, 150, 10); fs(c, '#5a3a22', '#000', 4);
    rr(c, x - 160, y - 124, 320, 34, 10); fs(c, '#2a1a10', '#000', 4);
    rr(c, x - 112, y - 76, 224, 100, 10); fs(c, '#1b120b', '#000', 4);
    for (const dx of [-70, 70]) { rr(c, x + dx - 22, y - 34, 44, 54, 12); fs(c, '#8a5a33', '#000', 3); c.strokeStyle = '#3a3a44'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + dx - 22, y - 20); c.lineTo(x + dx + 22, y - 20); c.moveTo(x + dx - 22, y + 4); c.lineTo(x + dx + 22, y + 4); c.stroke(); }
    emoji(c, r.emoji, x, y - 18, wach && !Z.ruhig ? 58 + Math.sin(r.wach * 12) * 8 : 54);
    // Funke an der Lunte: Stern, der flackert
    const s = 6 + (Z.ruhig ? 2 : Math.abs(Math.sin(t * 9)) * (wach ? 9 : 5)); c.fillStyle = '#fff'; K.sternForm(c, x + 22, y - 50, s + 3); c.fill(); c.fillStyle = '#ff9f1c'; K.sternForm(c, x + 22, y - 50, s); c.fill();
  },
  // Das Beiboot hängt unten an der Reling
  tor(c, t) {
    const tor = Z.tor, bereit = !!(Z.status && Z.status.torBereit), x = tor.x + (tor.wackel > 0 ? Math.sin(tor.wackel * 40) * 5 * tor.wackel : 0), y = tor.y + (Z.ruhig ? 0 : Math.sin(t * 1.4) * 2);
    if (bereit) { c.fillStyle = 'rgba(255,214,120,' + (0.25 + 0.2 * puls(t)) + ')'; ell(c, x, y - 26, 120, 44); c.fill(); }
    c.fillStyle = '#000'; c.fillRect(x - 78, y - 60, 8, 70); c.fillRect(x + 70, y - 60, 8, 70);
    ell(c, x, y + 6, 70, 34); fs(c, '#8a5a33', '#000', 4); ell(c, x, y + 2, 54, 22); fs(c, '#5a3a22', '#000', 3);
    c.strokeStyle = '#000'; c.lineWidth = 7; c.beginPath(); c.moveTo(x - 46, y + 2); c.lineTo(x + 46, y + 2); c.stroke(); c.strokeStyle = '#c08a52'; c.lineWidth = 4; c.stroke();
    if (!bereit) { c.strokeStyle = '#b9bfc9'; c.lineWidth = 5; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(x - 74, y - 40); c.lineTo(x - 20, y - 6); c.moveTo(x + 74, y - 40); c.lineTo(x + 20, y - 6); c.stroke(); c.setLineDash([]); }
    circ(c, x, y - 12, 18); fs(c, '#2a1a10', '#000', 3); symbol(c, bereit ? 'pfeil' : 'schloss', x, y - 12, 12);
  },
  figur(c, f, t, P) {
    if (f.art === 'waerterin') zeichnePerson(c, f.x, f.y, t, { jacke: '#f1f1f1', hose: '#3a3a44', haut: '#e8b98f', hut: 'kochmuetze', brett: true, blick: P.x < f.x ? -1 : 1, hop: f.hop, groesse: 1.12 });
    else if (f.art === 'waechter') { lichtKegel(c, f.x, f.y - 10, f.kegel, 170, '255,220,150', 0.36); zeichnePerson(c, f.x, f.y, t, { jacke: '#264653', hose: '#1b1b22', haut: '#c98f62', hut: 'bandana', hutFarbe: '#2b59c3', lampe: true, streifen: '#f4ead2', blick: f.blick, gehen: f.geht, hop: f.hop, groesse: 1.12 }); }
    else emojiFigur(c, f, t, '#5a3a22');
  },
  spieler(c, P, t) { zeichnePerson(c, P.x, P.y, t, { jacke: '#2a9d8f', hose: '#3a3a44', haut: '#dba77c', hut: 'bandana', hutFarbe: '#e63946', streifen: '#f4ead2', rucksack: true, blick: P.blick, gehen: P.geht, hop: P.hop }); }
};
};
})();
