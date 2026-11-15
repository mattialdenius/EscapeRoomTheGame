/* =====================================================================
   STIL „AGENTEN“ (Klasse 9): Die Agentenzentrale
   ---------------------------------------------------------------------
   Gehört zu welt/karte.js (Karten-Motor, karte 0.4). Der Motor lädt
   diese Datei selbst, wenn in den Daten  karte: { stil: "agenten", … }  steht.
   Aussehen: dunkle Zentrale im Lockdown, klare Formen, Neonlinien.
             Vier Sektionen mit Schiebetüren, Laser Room (Kulisse),
             Notausgang mit Code-Tafel, Technikerin, Wachroboter,
             Funk-Drohne von Agent Nova.
   Speichert nichts, lädt nichts nach.
   ===================================================================== */
(function () {
'use strict';
window.KartenStile = window.KartenStile || {};
window.KartenStile.agenten = function (K) {
const { Z, TAU, clamp, circ, ell, rr, tri, fs, emoji, puls, symbol, raumStatus, zeichnePerson, zeichneRoboter, zeichneWaende, lichtKegel, emojiFigur, fensterEmoji, fensterZustand, tuer, streue, standardWege, basis, TEXT_FONT, MONO_FONT } = K;
const NEON = '#39e6ff';

return {
  spielerLicht: true, zusatzTon: 'summ', begleiterEmoji: '📡',
  schild: { hell: '#e8f6ff', zu: '#1a2433', text: '#06131f', textZu: '#e3edf8', rand: '#000', pfosten: false },
  marke: { regel: '💡', wort: '💬', zeit: '📡' },
  farben: { hinter: '#04070d', ziel: NEON, fx: [NEON, '#fff', '#ffd23f'], boden: '#0d131f', wand: '#1a2433', weg: '#141d2c', wegRand: '#0a0f18',
    raum: ['#222f44', '#27324a', '#1f2d3d', '#2a3040'], dach: '#0a0f18', tuer: '#c9f7ff', tuerZu: '#0a0f18', tuerFertig: '#1a2a3a', fenster: '#c9f7ff', fensterZu: '#141c29', zustand: '#06131f', gitter: '#f2c230',
    zusatz: '#2a1622', tafel: '#02080d', tafelRand: NEON, tafelText: NEON, licht: '57,230,255', kegel: '255,120,120', sockel: '#2a3447', torPfosten: '#2a3447' },

  bau() {
    Z.wege = standardWege();
    Z.lampen = []; for (const g of Z.G) Z.lampen.push({ x: g.spot.x, y: g.spot.y, r: 120, a: 0.16 });
    Z.lampen.push({ x: Z.tor.x, y: Z.tor.y - 50, r: 150, a: 0.14 });
    // Server-Schränke, Pulte und Kisten: stehen fest, die Wegsuche läuft außen herum
    const arten = ['rack', 'pult', 'kiste', 'pult', 'rack'];
    Z.deko = streue(13, 20261509, { abstand: 135 }).map((p, i) => ({ x: p.x, y: p.y, art: arten[i % arten.length], z: p.z }));
    for (const d of Z.deko) Z.hind.push({ x: d.x, y: d.y - 8, r: 22 });
  },
  boden(c, t) {
    const W = Z.W, H = Z.H;
    c.fillStyle = '#0d131f'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(57,230,255,0.06)'; c.lineWidth = 2; c.beginPath();
    for (let x = 0; x <= W; x += 100) { c.moveTo(x, 0); c.lineTo(x, H); } for (let y = 0; y <= H; y += 100) { c.moveTo(0, y); c.lineTo(W, y); } c.stroke();
    // Laufbahnen: dunkle Spur mit Neon-Mittellinie
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const pass of [0, 1, 2]) {
      c.strokeStyle = pass === 0 ? '#070b12' : pass === 1 ? '#172133' : 'rgba(57,230,255,0.55)'; c.lineWidth = pass === 0 ? 68 : pass === 1 ? 56 : 3;
      if (pass === 2) c.setLineDash([18, 14]);
      for (const P of Z.wege) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.stroke(); }
      c.setLineDash([]);
    }
    zeichneWaende(c, '#1a2433', '#172133');
    // Wandband oben: Monitore
    for (let x = 70; x < W - 60; x += 150) { rr(c, x, 18, 96, 36, 5); fs(c, '#06131f', '#000', 3); c.fillStyle = 'rgba(57,230,255,' + (0.35 + 0.25 * puls(t + x, 1.3)) + ')'; c.fillRect(x + 8, 26, 50 + (x * 7) % 30, 4); c.fillRect(x + 8, 36, 30 + (x * 3) % 40, 4); c.fillRect(x + 8, 46, 60, 2); }
    // Warnstreifen vor dem Notausgang
    c.save(); c.beginPath(); c.rect(Z.tor.x - 150, Z.tor.y - 22, 300, 12); c.clip(); c.fillStyle = '#f2c230'; c.fillRect(Z.tor.x - 150, Z.tor.y - 22, 300, 12); c.strokeStyle = '#000'; c.lineWidth = 7; for (let x = -170; x < 170; x += 22) { c.beginPath(); c.moveTo(Z.tor.x + x, Z.tor.y - 8); c.lineTo(Z.tor.x + x + 14, Z.tor.y - 24); c.stroke(); } c.restore();
  },
  deko(c, d, t) {
    const x = d.x, y = d.y;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y, 30, 9); c.fill();
    if (d.art === 'rack') {
      rr(c, x - 22, y - 78, 44, 80, 5); fs(c, '#1c2738', '#000', 3);
      for (let i = 0; i < 5; i++) { c.fillStyle = '#06131f'; c.fillRect(x - 16, y - 70 + i * 14, 32, 9); c.fillStyle = (Math.floor(t * 2 + i + d.z * 9) % 3 === 0 && !Z.ruhig) ? '#fff' : NEON; c.fillRect(x - 13 + ((i * 7) % 20), y - 67 + i * 14, 5, 3); }
    } else if (d.art === 'pult') {
      rr(c, x - 30, y - 30, 60, 30, 5); fs(c, '#27324a', '#000', 3);
      rr(c, x - 18, y - 60, 36, 26, 4); fs(c, '#06131f', '#000', 3); c.fillStyle = 'rgba(57,230,255,0.7)'; c.fillRect(x - 13, y - 54, 20, 3); c.fillRect(x - 13, y - 48, 26, 3); c.fillRect(x - 13, y - 42, 12, 3);
    } else {
      rr(c, x - 24, y - 40, 48, 42, 4); fs(c, '#3a3f4d', '#000', 3); c.strokeStyle = '#000'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 24, y - 20); c.lineTo(x + 24, y - 20); c.stroke();
      rr(c, x - 9, y - 26, 18, 12, 2); fs(c, '#f2c230', '#000', 2);
    }
  },
  raum(c, g) {
    const st = raumStatus(g.nr), z = st.zustand, zu = z === 'gesperrt', F = K.stil().farben, x = g.x + (g.wackel > 0 ? Math.sin(g.wackel * 40) * 5 * g.wackel : 0), y = g.y;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 40, 140, 14); c.fill();
    rr(c, x - 130, y - 110, 260, 150, 6); fs(c, F.raum[g.nr % 4], '#000', 4);
    if (zu) { c.fillStyle = 'rgba(4,7,13,0.55)'; rr(c, x - 130, y - 110, 260, 150, 6); c.fill(); }
    // Neonleiste oben: durchgezogen = zugänglich, gestrichelt = gesperrt (Form, nicht nur Farbe)
    rr(c, x - 136, y - 122, 272, 22, 4); fs(c, '#0a0f18', '#000', 4);
    c.strokeStyle = zu ? '#6b7a90' : NEON; c.lineWidth = 4; if (zu) c.setLineDash([10, 10]); c.beginPath(); c.moveTo(x - 124, y - 111); c.lineTo(x + 124, y - 111); c.stroke(); c.setLineDash([]);
    // links: Anzeige mit dem Zeichen der Sektion, rechts: Zustand
    rr(c, x - 120, y - 76, 72, 72, 8); fs(c, zu ? F.fensterZu : '#0e2a3a', '#000', 4); c.globalAlpha = zu ? 0.5 : 1; emoji(c, g.emoji, x - 84, y - 38, 40); c.globalAlpha = 1;
    rr(c, x + 48, y - 76, 72, 72, 8); fs(c, F.zustand, '#000', 4); symbol(c, K.SYMBOL[z] || 'schloss', x + 84, y - 40, 21);
    tuer(c, x, y, z, { form: 'eckig', breite: 32, sperre: 'streifen' });
    c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 54); c.lineTo(x, y + 40); c.stroke();   // Schiebetür: Mittelfuge
  },
  zusatz(c, r, t) {
    const x = r.x + (r.wackel > 0 && !Z.ruhig ? Math.sin(r.wackel * 40) * 4 * r.wackel : 0), y = r.y, wach = r.wach > 0;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 40, 160, 16); c.fill();
    rr(c, x - 150, y - 110, 300, 150, 6); fs(c, '#2a1622', '#000', 4);
    rr(c, x - 156, y - 122, 312, 22, 4); fs(c, '#0a0f18', '#000', 4);
    rr(c, x - 120, y - 84, 240, 106, 6); fs(c, '#0a0508', '#000', 4);
    // Laser: gekreuzte Strahlen, die langsam wandern (bei „Bewegung reduzieren“ stehen sie)
    c.save(); c.beginPath(); c.rect(x - 118, y - 82, 236, 102); c.clip(); c.lineCap = 'round';
    const v = Z.ruhig ? 0 : (t * (wach ? 60 : 18)) % 48;
    for (let i = -6; i < 8; i++) {
      for (const pass of [0, 1]) { c.strokeStyle = pass ? '#fff' : '#ff4d6d'; c.lineWidth = pass ? 1.5 : (wach ? 6 : 4); c.beginPath(); c.moveTo(x - 140 + i * 48 + v, y - 90); c.lineTo(x - 60 + i * 48 + v, y + 28); c.stroke(); c.beginPath(); c.moveTo(x + 140 - i * 48 - v, y - 90); c.lineTo(x + 60 - i * 48 - v, y + 28); c.stroke(); }
    }
    c.restore();
    emoji(c, r.emoji, x, y - 32, 40);
  },
  tor(c, t) {
    const tor = Z.tor, bereit = !!(Z.status && Z.status.torBereit), x = tor.x + (tor.wackel > 0 ? Math.sin(tor.wackel * 40) * 5 * tor.wackel : 0), y = tor.y;
    if (bereit) { c.fillStyle = 'rgba(57,230,255,' + (0.22 + 0.2 * puls(t)) + ')'; ell(c, x, y - 30, 120, 44); c.fill(); }
    rr(c, x - 80, y - 84, 160, 116, 6); fs(c, '#2a3447', '#000', 4);
    rr(c, x - 64, y - 60, 62, 92, 3); fs(c, bereit ? '#c9f7ff' : '#0a0f18', '#000', 4); rr(c, x + 2, y - 60, 62, 92, 3); fs(c, bereit ? '#c9f7ff' : '#0a0f18', '#000', 4);
    if (!bereit) { c.save(); c.beginPath(); c.rect(x - 64, y - 60, 128, 92); c.clip(); c.strokeStyle = '#f2c230'; c.lineWidth = 5; for (let i = -160; i < 160; i += 22) { c.beginPath(); c.moveTo(x + i, y + 36); c.lineTo(x + i + 70, y - 64); c.stroke(); } c.restore(); }
    rr(c, x - 34, y - 82, 68, 20, 4); fs(c, '#06131f', '#000', 3); c.fillStyle = bereit ? '#fff' : '#9fb0c6'; c.font = 'bold 14px ' + MONO_FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', x, y - 71);
    circ(c, x, y - 12, 18); fs(c, '#06131f', '#000', 3); symbol(c, bereit ? 'pfeil' : 'schloss', x, y - 12, 12);
  },
  figur(c, f, t, P) {
    if (f.art === 'waerterin') zeichnePerson(c, f.x, f.y, t, { jacke: '#0f766e', hose: '#111827', haut: '#d9a77f', hut: 'headset', hutFarbe: '#2b1d16', brett: true, blick: P.x < f.x ? -1 : 1, hop: f.hop, groesse: 1.1 });
    else if (f.art === 'waechter') { lichtKegel(c, f.x, f.y - 30, f.kegel, 170, '255,110,110', 0.36); zeichneRoboter(c, f.x, f.y, t, { farbe: '#566278', kopf: '#3b4658', auge: '#ff6b6b', blick: f.blick, hop: f.hop, groesse: 1.15 }); }
    else emojiFigur(c, f, t, '#2a3447');
  },
  spieler(c, P, t) { zeichnePerson(c, P.x, P.y, t, { jacke: '#1e293b', hose: '#0b1220', haut: '#dba77c', hut: 'haare', hutFarbe: '#1b1b22', streifen: NEON, lampe: true, blick: P.blick, gehen: P.geht, hop: P.hop, groesse: 1.08 }); },
  // Agent Nova ist nur über Funk dabei: eine kleine Funk-Drohne fliegt mit
  begleiter(c, po, t) {
    const fl = Z.ruhig ? 0 : Math.sin(t * 30) * 3, spricht = Z.blasen.some(b => b.id === 'polly');
    c.save(); c.translate(po.x, po.y);
    c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath(); c.moveTo(-20, -8); c.lineTo(20, -8); c.stroke();
    c.fillStyle = 'rgba(200,240,255,0.55)'; ell(c, -20, -10, 12 + fl, 3); c.fill(); ell(c, 20, -10, 12 - fl, 3); c.fill();
    rr(c, -14, -8, 28, 18, 8); fs(c, '#1e293b', '#000', 3);
    circ(c, 0, 1, 5); fs(c, NEON, '#000', 2);
    if (spricht || puls(t, 2) > 0.8) { c.strokeStyle = NEON; c.lineWidth = 2.5; for (let i = 1; i <= 2; i++) { c.beginPath(); c.arc(0, 1, 12 + i * 8, -Math.PI * 0.9, -Math.PI * 0.6); c.stroke(); c.beginPath(); c.arc(0, 1, 12 + i * 8, -Math.PI * 0.4, -Math.PI * 0.1); c.stroke(); } }
    c.restore();
  }
};
};
})();
