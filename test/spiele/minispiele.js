/* =====================================================================
   MINISPIELE für den Grammar Escape Room (Belohnung nach dem Zusatzraum)
   ---------------------------------------------------------------------
   Version:  minispiele 0.3 (passt zu App-Version 0.6.6, Testbereich)
   Inhalt:   fuettern (Fütterungszeit), taschenlampe (Taschenlampen-Suche),
             seeloewe (Robben-Jonglage), obstkorb (Obstkorb), schaukel (Affen-Schaukel),
             nachtflug (Pollys Nachtflug), rutsche (Pinguin-Rutsche) – beide mit dem
             gemeinsamen Baustein „laufband“ (beweglicher Hintergrund)
   Daten:    Texte, Ziele, Tiere und Futter stehen in daten/klasseX.js unter
             KX.minispiele. Hier steht nur die Spieltechnik.
   Rahmen:   index.html startet ein Spiel, zeigt die 30-Sekunden-Uhr, zählt
             die Punkte und zeigt die Erfolgsmeldung. Jedes Spiel bekommt
             eine leere Bühne (buehne) und Hilfen (ctx) und gibt eine
             Aufräum-Funktion zurück.
   Speichert nichts: kein localStorage, keine Cookies, kein Netzwerk.
   Bedienung: ein Finger (Ziehen oder Tippen), Maus, Tastatur (Pfeile, Enter).

   Änderungsliste:
     0.3 (14.11.2026)  Neu: Pollys Nachtflug und Pinguin-Rutsche mit beweglichem Hintergrund.
     0.2 (14.11.2026)  Taschenlampe schwerer (kleineres Licht, 6 Tiere, teils hinter
                       Büschen, Licht ½ Sekunde draufhalten). Neu: Obstkorb, Affen-Schaukel.
     0.1 (14.11.2026)  Erste Fassung mit drei Spielen.
   ===================================================================== */
(function(){
"use strict";

// ---------- Hilfen ----------
const wuerfle = l => l[Math.floor(Math.random() * l.length)];
const mischen = l => { const a = l.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const el = (tag, klasse, text) => { const e = document.createElement(tag); if(klasse) e.className = klasse; if(text != null) e.textContent = text; return e; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fuelle = (t, werte) => String(t).replace(/\{(\w+)\}/g, (m, k) => werte[k] != null ? werte[k] : m);

// ---------- Aussehen (einmal einfügen) ----------
if(!document.getElementById("minispielStil")){
  const st = el("style"); st.id = "minispielStil";
  st.textContent = `
  .ms-buehne{position:relative;overflow:hidden;border:4px solid #000;border-radius:16px;background:#13285e;color:#fff;
    height:min(60vh,480px);min-height:340px;touch-action:none;user-select:none;-webkit-user-select:none}
  .ms-buehne:focus-visible{outline:4px solid #000;box-shadow:0 0 0 8px #ffd23f}
  /* Fütterungszeit */
  .ms-fu{display:flex;flex-direction:column;align-items:center;justify-content:space-between;height:100%;padding:3.4rem .8rem .8rem;box-sizing:border-box;gap:.5rem}
  .ms-futter{background:#fff;color:#000;border:4px solid #000;border-radius:18px;padding:.4rem 1rem;text-align:center;cursor:grab;
    box-shadow:0 5px 0 #000;min-width:9rem;touch-action:none;position:relative;z-index:3}
  .ms-futter .e{font-size:3.2rem;line-height:1.1;display:block}
  .ms-futter b{font-size:1.25rem}
  .ms-futter small{display:block;color:#444;font-size:.85rem}
  .ms-futter.zieht{cursor:grabbing;box-shadow:0 10px 0 #000;transition:none}
  .ms-futter.zurueck{transition:transform .25s}
  .ms-tiere{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;width:100%}
  .ms-tier{min-height:7.5rem;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0b1736;color:#fff;
    border:4px solid #ffd23f;border-radius:16px;padding:.3rem;font-size:1rem;box-shadow:0 5px 0 #000}
  .ms-tier .e{font-size:3rem;line-height:1.1}
  .ms-tier b{font-size:1.15rem}
  .ms-tier small{color:#cfd8ff}
  .ms-tier.ziel{background:#2b59c3;transform:scale(1.05)}
  .ms-tier.satt{border-style:solid;border-color:#fff;background:#0b3d2a}
  .ms-tier.nein{border-style:dashed;opacity:.55}
  .ms-tier:disabled{cursor:default}
  .ms-blase{min-height:3.2em;max-width:36rem;background:#fff;color:#000;border:3px solid #000;border-radius:14px;padding:.4rem .7rem;
    font-size:1.05rem;text-align:center;visibility:hidden}
  .ms-blase.an{visibility:visible}
  /* Taschenlampe */
  .ms-ta-ding{position:absolute;transform:translate(-50%,-50%);font-size:2.4rem;line-height:1;pointer-events:none}
  .ms-ta-tier{position:absolute;transform:translate(-50%,-50%);font-size:2.3rem;line-height:1;pointer-events:none;text-align:center;z-index:1}
  .ms-ta-tier.gefunden{z-index:3}
  .ms-ta-tier.gefunden::before{content:"";position:absolute;left:50%;top:.6em;width:2.4em;height:2.4em;transform:translate(-50%,-50%);
    border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px #000}
  .ms-ta-tier .schild{display:none;position:absolute;left:50%;top:100%;transform:translateX(-50%);white-space:nowrap;margin-top:.5rem;
    background:#fff;color:#000;border:2px solid #000;border-radius:10px;padding:.1rem .4rem;font-size:.85rem;font-weight:bold}
  .ms-ta-tier.gefunden .schild{display:block}
  .ms-ta-tier.links .schild{left:-.6em;transform:none}
  .ms-ta-tier.rechts .schild{left:auto;right:-.6em;transform:none}
  .ms-ta-dunkel{position:absolute;inset:0;z-index:2;pointer-events:none}
  /* Robben-Jonglage */
  .ms-ro-ball,.ms-ro-robbe{position:absolute;left:0;top:0;line-height:1;pointer-events:none;will-change:transform}
  .ms-ro-ball{font-size:2.6rem}
  .ms-ro-robbe{font-size:4.2rem}
  .ms-ro-boden{position:absolute;left:0;right:0;bottom:0;height:14px;background:repeating-linear-gradient(90deg,#9ad1ff 0 18px,#5aa7e6 18px 36px);border-top:3px solid #000}
  .ms-ro-meldung{position:absolute;left:50%;top:30%;transform:translateX(-50%);background:#fff;color:#000;border:3px solid #000;border-radius:12px;
    padding:.3rem .7rem;font-weight:bold;display:none;z-index:4}
  .ms-ro-meldung.an{display:block}
  /* Laufband, Nachtflug, Rutsche */
  .ms-lb-teil{position:absolute;left:0;top:0;line-height:1;pointer-events:none;will-change:transform}
  .ms-lb-teil.hell{color:#fff;opacity:.75}
  .ms-lb-teil.fern{opacity:.28;filter:grayscale(.6)}   /* Hintergrund klar blasser als Hindernisse */
  .ms-nf-polly,.ms-ru-pingu{position:absolute;left:0;top:0;line-height:1;pointer-events:none;will-change:transform;z-index:3}
  .ms-nf-polly{font-size:2.7rem}
  .ms-ru-pingu{font-size:3rem}
  .ms-nf-polly.geschuetzt,.ms-ru-pingu.geschuetzt{opacity:.5}
  .ms-nf-baum{position:absolute;left:0;top:0;width:54px;box-sizing:border-box;background:#5a3a1c;border:3px solid #000;border-radius:6px;will-change:transform}
  .ms-nf-baum .krone{position:absolute;left:50%;transform:translateX(-50%);font-size:3rem;line-height:1}
  .ms-nf-baum.oben .krone{bottom:-1.4rem}
  .ms-nf-baum.unten .krone{top:-1.6rem}
  .ms-nf-stern{position:absolute;left:0;top:0;font-size:2rem;line-height:1;pointer-events:none;will-change:transform;z-index:2}
  .ms-ru-boden{position:absolute;left:0;right:0;bottom:0;height:56px;border-top:3px solid #000;
    background:repeating-linear-gradient(90deg,#e6f6ff 0 40px,#c3e6fb 40px 80px)}
  .ms-ru-ding{position:absolute;left:0;top:0;font-size:2.3rem;line-height:1;pointer-events:none;will-change:transform;z-index:2}
  .ms-ta-tier.spur::after{content:"";position:absolute;left:50%;top:.6em;width:2.2em;height:2.2em;transform:translate(-50%,-50%);border:3px dashed #ffd23f;border-radius:50%}
  .ms-ta-versteck{z-index:1;font-size:2.6rem}
  .ms-ta-versteck.weg{opacity:.35}
  /* Obstkorb */
  .ms-ok-boden{position:absolute;left:0;right:0;bottom:0;height:16px;background:#2e6b3a;border-top:3px solid #000}
  .ms-ok-korb{position:absolute;left:0;top:0;font-size:3.6rem;line-height:1;pointer-events:none;will-change:transform}
  .ms-ok-korb.gesperrt{opacity:.55}
  .ms-ok-korb.wackelt{filter:grayscale(1)}
  .ms-ok-ding{position:absolute;left:0;top:0;font-size:2.4rem;line-height:1;pointer-events:none;will-change:transform}
  .ms-ok-ding.muell{filter:grayscale(.6)}
  /* Affen-Schaukel */
  .ms-sc-welt{position:absolute;inset:0;will-change:transform}
  .ms-sc-liane{position:absolute;width:6px;margin-left:-3px;background:#3d7a35;border:2px solid #000;border-radius:3px;transform-origin:50% 0}
  .ms-sc-liane::before{content:"";position:absolute;left:50%;top:-14px;width:34px;height:14px;margin-left:-17px;background:#2a5a25;border:2px solid #000;border-radius:8px}
  .ms-sc-liane span{position:absolute;left:-10px;top:40%;font-size:1.2rem}
  .ms-sc-liane.naechste{background:#ffd23f}
  .ms-sc-affe{position:absolute;left:0;top:0;font-size:2.8rem;line-height:1;pointer-events:none;will-change:transform}
  .ms-sc-ring{position:absolute;left:50%;top:50%;width:3.6rem;height:3.6rem;transform:translate(-50%,-50%);border:4px solid #fff;outline:3px solid #000;border-radius:50%;display:none}
  .ms-sc-ring.an{display:block}
  .ms-sc-netz{position:absolute;left:0;right:0;bottom:0;height:26px;border-top:3px solid #000;
    background:repeating-linear-gradient(45deg,#c9b38a 0 3px,transparent 3px 12px),repeating-linear-gradient(-45deg,#c9b38a 0 3px,transparent 3px 12px),#3b2a14}
  `;
  document.head.appendChild(st);
}

// =====================================================================
// 1) FÜTTERUNGSZEIT – Futter zum richtigen Tier ziehen (oder Tier antippen)
// =====================================================================
function fuettern(buehne, ctx){
  const D = ctx.daten, tiere = D.tiere || [], futter = D.futter || [];
  const tierVon = id => tiere.find(t => t.id === id);
  const wrap = el("div", "ms-fu"), karte = el("div", "ms-futter"), blase = el("p", "ms-blase"), reihe = el("div", "ms-tiere");
  blase.setAttribute("role", "status");
  wrap.append(karte, blase, reihe); buehne.appendChild(wrap);
  let F = null, gesperrt = false, zuletzt = [], timer = null;

  function neueRunde(){
    // Futter wählen, das zuletzt nicht dran war; richtiges Tier aus „haupt“, zwei falsche aus den übrigen
    let f, richtig, falsch;
    for(let i = 0; i < 40; i++){
      f = wuerfle(futter); if(zuletzt.includes(f.en)) continue;
      const passt = new Set(f.haupt.concat(f.auch || []));
      const kandidat = f.haupt.map(tierVon).filter(Boolean);
      const andere = tiere.filter(t => !passt.has(t.id));
      if(kandidat.length && andere.length >= 2){ richtig = wuerfle(kandidat); falsch = mischen(andere).slice(0, 2); break; }
    }
    if(!richtig) return;
    zuletzt = zuletzt.concat(f.en).slice(-4); F = f; gesperrt = false;
    karte.replaceChildren(el("span", "e", f.emoji), el("b", null, f.en), el("small", null, f.de));
    karte.setAttribute("aria-label", "Futter: " + f.en + " (" + f.de + ")");
    karte.style.transform = "";
    reihe.replaceChildren();
    mischen([richtig].concat(falsch)).forEach(t => {
      const b = el("button", "ms-tier"); b.type = "button"; b.dataset.id = t.id;
      b.append(el("span", "e", t.emoji), el("b", null, t.en), el("small", null, t.de));
      b.setAttribute("aria-label", t.en + " (" + t.de + ") füttern");
      b.addEventListener("click", () => waehle(t, b));
      reihe.appendChild(b);
    });
  }
  function waehle(t, knopf){
    if(gesperrt || !ctx.laeuft() || !F) return;
    const passt = F.haupt.includes(t.id) || (F.auch || []).includes(t.id);
    if(passt){
      gesperrt = true; knopf.classList.add("satt"); knopf.querySelector("b").textContent = wuerfle(D.lob || ["😋 Yum!"]);
      blase.textContent = "✓ " + t.de + ": " + F.de + " – genau richtig!"; blase.classList.add("an");
      ctx.ton("richtig"); ctx.punkt();
      timer = setTimeout(() => { if(ctx.laeuft()) neueRunde(); }, ctx.reduziert ? 450 : 650);
    } else {
      knopf.classList.add("nein"); knopf.disabled = true;
      blase.textContent = "✗ " + fuelle(t.witz || "„{futter}? Nein danke!“", { futter: F.de }); blase.classList.add("an");
      ctx.ton("falsch");
    }
  }
  // Ziehen mit dem Finger (Pointer Events), Loslassen über einem Tier = füttern
  let zug = null;
  const tierUnter = (x, y) => { karte.style.visibility = "hidden"; const e = document.elementFromPoint(x, y); karte.style.visibility = ""; return e && e.closest && e.closest(".ms-tier"); };
  karte.addEventListener("pointerdown", e => {
    if(gesperrt) return; e.preventDefault();
    try { karte.setPointerCapture(e.pointerId); } catch(err){}
    zug = { id: e.pointerId, x: e.clientX, y: e.clientY }; karte.classList.add("zieht"); karte.classList.remove("zurueck");
  });
  karte.addEventListener("pointermove", e => {
    if(!zug || e.pointerId !== zug.id) return;
    karte.style.transform = "translate(" + (e.clientX - zug.x) + "px," + (e.clientY - zug.y) + "px)";
    reihe.querySelectorAll(".ms-tier").forEach(b => b.classList.remove("ziel"));
    const t = tierUnter(e.clientX, e.clientY); if(t && !t.disabled) t.classList.add("ziel");
  });
  const loslassen = e => {
    if(!zug || e.pointerId !== zug.id) return;
    const t = tierUnter(e.clientX, e.clientY); zug = null;
    karte.classList.remove("zieht"); karte.classList.add("zurueck"); karte.style.transform = "";
    reihe.querySelectorAll(".ms-tier").forEach(b => b.classList.remove("ziel"));
    if(t && !t.disabled){ const tier = tierVon(t.dataset.id); if(tier) waehle(tier, t); }
  };
  karte.addEventListener("pointerup", loslassen); karte.addEventListener("pointercancel", loslassen);
  neueRunde();
  return () => { clearTimeout(timer); };
}

// =====================================================================
// 2) TASCHENLAMPEN-SUCHE – im Dunkeln Tiere anleuchten (Licht kurz draufhalten)
// =====================================================================
function taschenlampe(buehne, ctx){
  const D = ctx.daten, ziel = ctx.ziel, HALTEN = 0.5;   // so lange (Sekunden) muss das Licht auf dem Tier bleiben
  const dunkel = el("div", "ms-ta-dunkel"); buehne.appendChild(dunkel);
  buehne.tabIndex = 0; buehne.setAttribute("aria-label", "Dunkler Zoo. Mit dem Finger oder den Pfeiltasten leuchten.");
  const W = () => buehne.clientWidth, H = () => buehne.clientHeight;
  const plaetze = [];
  const frei = (x, y, d) => plaetze.every(p => Math.hypot(p.x - x, p.y - y) > d);
  function platz(d){ for(let i = 0; i < 200; i++){ const x = 0.1 + Math.random() * 0.8, y = 0.2 + Math.random() * 0.68; if(frei(x, y, d)){ plaetze.push({ x, y }); return { x, y }; } } const p = { x: Math.random() * .8 + .1, y: Math.random() * .68 + .2 }; plaetze.push(p); return p; }
  const kulisse = D.kulisse || ["🌳"];
  const tiere = mischen(D.nachtTiere || []).slice(0, ziel).map((t, i) => {
    const p = platz(0.2), d = el("div", "ms-ta-tier"); d.append(document.createTextNode(t.emoji), el("span", "schild", "✓ " + t.en + " = " + t.de));
    if(p.x < 0.3) d.classList.add("links"); else if(p.x > 0.7) d.classList.add("rechts");   // Namensschild am Rand nach innen rücken
    d.style.left = p.x * 100 + "%"; d.style.top = p.y * 100 + "%"; buehne.insertBefore(d, dunkel);
    if(i % 2 === 0){   // jedes zweite Tier steckt halb hinter einem Busch
      const v = el("div", "ms-ta-ding ms-ta-versteck", wuerfle(["🌿", "🌳", "🪨", "🌾"]));
      v.style.left = (p.x * 100 + (Math.random() < .5 ? -2.5 : 2.5)) + "%"; v.style.top = (p.y * 100 + 3) + "%"; buehne.insertBefore(v, dunkel);
      return { t, p, d, v, zeit: 0, gefunden: false };
    }
    return { t, p, d, zeit: 0, gefunden: false };
  });
  kulisse.forEach(k => { const p = platz(0.1), d = el("div", "ms-ta-ding", k); d.style.left = p.x * 100 + "%"; d.style.top = p.y * 100 + "%"; buehne.insertBefore(d, buehne.firstChild); });
  let lx = W() / 2, ly = H() / 2, raf = 0, t0 = 0;
  const radius = () => Math.max(48, Math.min(W(), H()) * 0.115);
  function schritt(t){
    const dt = Math.min(0.05, (t - (t0 || t)) / 1000); t0 = t;
    if(!ctx.laeuft()){ raf = 0; return; }
    const r = radius();
    dunkel.style.background = "radial-gradient(circle at " + lx + "px " + ly + "px, rgba(255,240,180,.10) 0, rgba(255,240,180,.06) " + (r * 0.7) + "px, rgba(3,6,18,.99) " + r + "px)";
    tiere.forEach(o => {
      if(o.gefunden) return;
      const imLicht = Math.hypot(o.p.x * W() - lx, o.p.y * H() - ly) < r * 0.6;
      o.zeit = imLicht ? o.zeit + dt : Math.max(0, o.zeit - dt * 2);
      o.d.classList.toggle("spur", imLicht);
      if(o.zeit >= HALTEN){
        o.gefunden = true; o.d.classList.remove("spur"); o.d.classList.add("gefunden"); if(o.v) o.v.classList.add("weg");
        ctx.ton("richtig"); ctx.sage("🔦 Gefunden: " + o.t.en + " = " + o.t.de); ctx.punkt();
      }
    });
    raf = requestAnimationFrame(schritt);
  }
  const setze = e => { const r = buehne.getBoundingClientRect(); lx = clamp(e.clientX - r.left, 0, r.width); ly = clamp(e.clientY - r.top, 0, r.height); };
  const unten = e => { if(!ctx.laeuft()) return; e.preventDefault(); try { buehne.setPointerCapture(e.pointerId); } catch(err){} setze(e); };
  const bewegt = e => { if(!ctx.laeuft()) return; if(e.pointerType === "mouse" || e.buttons || e.pressure > 0) setze(e); };
  const taste = e => {
    const s = 22, m = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
    if(!m || !ctx.laeuft()) return; e.preventDefault(); lx = clamp(lx + m[0], 0, W()); ly = clamp(ly + m[1], 0, H());
  };
  buehne.addEventListener("pointerdown", unten); buehne.addEventListener("pointermove", bewegt); buehne.addEventListener("keydown", taste);
  raf = requestAnimationFrame(schritt); setTimeout(() => { try { buehne.focus({ preventScroll: true }); } catch(e){} }, 50);
  return () => { cancelAnimationFrame(raf); buehne.removeEventListener("pointerdown", unten); buehne.removeEventListener("pointermove", bewegt); buehne.removeEventListener("keydown", taste); buehne.removeAttribute("tabindex"); };
}

// =====================================================================
// 3) ROBBEN-JONGLAGE – Robbe unter den Ball schieben, Ball springt auf der Nase
// =====================================================================
function seeloewe(buehne, ctx){
  const D = ctx.daten;
  const ball = el("div", "ms-ro-ball", D.ball || "🏐"), robbe = el("div", "ms-ro-robbe", D.robbe || "🦭"), boden = el("div", "ms-ro-boden"), meldung = el("div", "ms-ro-meldung");
  buehne.append(boden, robbe, ball, meldung);
  buehne.tabIndex = 0; buehne.setAttribute("aria-label", "Robben-Jonglage. Robbe mit dem Finger oder den Pfeiltasten bewegen.");
  const W = () => buehne.clientWidth, H = () => buehne.clientHeight;
  const g = ctx.reduziert ? 520 : 820;            // Schwerkraft (Pixel pro Sekunde²) – bei „Bewegung reduzieren“ langsamer
  const RB = 22, RW = 70;                         // Ball-Radius, halbe Robbenbreite (Trefferzone)
  let rx = W() / 2, bx, by, vx, vy, pause = 0, raf = 0, t0 = 0, zielX = rx;
  const nase = () => H() - 14 - 62;               // Höhe der Robbennase
  function neuerBall(){ bx = clamp(rx + (Math.random() - .5) * 80, RB, W() - RB); by = 70; vx = (Math.random() - .5) * 60; vy = 0; }
  neuerBall();
  function schritt(t){
    const dt = Math.min(0.033, (t - (t0 || t)) / 1000); t0 = t;
    if(!ctx.laeuft()){ raf = 0; return; }
    rx += (zielX - rx) * Math.min(1, dt * 14);    // Robbe folgt dem Finger weich
    rx = clamp(rx, RW * .6, W() - RW * .6);
    if(pause > 0){ pause -= dt; if(pause <= 0){ meldung.classList.remove("an"); neuerBall(); } }
    else {
      vy += g * dt; bx += vx * dt; by += vy * dt;
      if(bx < RB){ bx = RB; vx = Math.abs(vx); } if(bx > W() - RB){ bx = W() - RB; vx = -Math.abs(vx); }
      if(vy > 0 && by + RB >= nase() && by + RB <= nase() + 30 && Math.abs(bx - rx) < RW){
        by = nase() - RB; const h = H() * 0.62; vy = -Math.sqrt(2 * g * h);
        vx = clamp((bx - rx) * 4 + (Math.random() - .5) * 70, -260, 260);
        ctx.ton("richtig"); ctx.punkt();
      }
      if(by - RB > H()){ meldung.textContent = "💦 " + wuerfle(D.platsch || ["Platsch!"]); meldung.classList.add("an"); pause = ctx.reduziert ? 1 : 0.7; ctx.ton("falsch"); }
    }
    ball.style.transform = "translate(" + (bx - RB) + "px," + (by - RB) + "px)";
    robbe.style.transform = "translate(" + (rx - 36) + "px," + (H() - 14 - 70) + "px)";
    raf = requestAnimationFrame(schritt);
  }
  const setze = e => { const r = buehne.getBoundingClientRect(); zielX = clamp(e.clientX - r.left, 0, r.width); };
  const unten = e => { if(!ctx.laeuft()) return; e.preventDefault(); try { buehne.setPointerCapture(e.pointerId); } catch(err){} setze(e); };
  const bewegt = e => { if(ctx.laeuft()) setze(e); };
  const taste = e => { const m = { ArrowLeft: -40, ArrowRight: 40 }[e.key]; if(!m || !ctx.laeuft()) return; e.preventDefault(); zielX = clamp(zielX + m, 0, W()); };
  buehne.addEventListener("pointerdown", unten); buehne.addEventListener("pointermove", bewegt); buehne.addEventListener("keydown", taste);
  raf = requestAnimationFrame(schritt); setTimeout(() => { try { buehne.focus({ preventScroll: true }); } catch(e){} }, 50);
  return () => { cancelAnimationFrame(raf); buehne.removeEventListener("pointerdown", unten); buehne.removeEventListener("pointermove", bewegt); buehne.removeEventListener("keydown", taste); buehne.removeAttribute("tabindex"); };
}


// =====================================================================
// 4) OBSTKORB – Korb mit dem Finger schieben, Obst fangen, Müll ausweichen
// =====================================================================
function obstkorb(buehne, ctx){
  const D = ctx.daten, obst = D.obst || [{ emoji: "🍎", en: "apple", de: "Apfel" }], muell = D.muell || ["🪨"];
  const korb = el("div", "ms-ok-korb", "🧺"), meldung = el("div", "ms-ro-meldung"), boden = el("div", "ms-ok-boden");
  buehne.append(boden, korb, meldung);
  buehne.tabIndex = 0; buehne.setAttribute("aria-label", "Obstkorb. Korb mit dem Finger oder den Pfeiltasten bewegen.");
  const W = () => buehne.clientWidth, H = () => buehne.clientHeight;
  const KB = 46;                                   // halbe Korbbreite (Fangzone)
  const korbY = () => H() - 74;                    // Höhe des Korbrands
  let kx = W() / 2, zielX = kx, dinge = [], raf = 0, t0 = 0, neu = 0.3, gesperrt = 0, gefangen = 0, mtimer = null;
  const tempo = () => (ctx.reduziert ? 120 : 165) + gefangen * (ctx.reduziert ? 4 : 7);   // fällt langsam schneller
  function zeige(text){ meldung.textContent = text; meldung.classList.add("an"); clearTimeout(mtimer); mtimer = setTimeout(() => meldung.classList.remove("an"), 900); }
  function neuesDing(){
    const istObst = Math.random() < 0.72, o = istObst ? wuerfle(obst) : null;
    const d = el("div", "ms-ok-ding", istObst ? o.emoji : wuerfle(muell));
    if(!istObst) d.classList.add("muell");
    buehne.insertBefore(d, meldung);
    dinge.push({ d, o, x: 24 + Math.random() * (W() - 48), y: -30, v: tempo() * (0.85 + Math.random() * 0.3) });
  }
  function schritt(t){
    const dt = Math.min(0.033, (t - (t0 || t)) / 1000); t0 = t;
    if(!ctx.laeuft()){ raf = 0; return; }
    kx += (zielX - kx) * Math.min(1, dt * 16); kx = clamp(kx, KB, W() - KB);
    if(gesperrt > 0) gesperrt -= dt;
    neu -= dt; if(neu <= 0){ neuesDing(); neu = (ctx.reduziert ? 1.0 : 0.75) * (0.8 + Math.random() * 0.4); }
    for(let i = dinge.length - 1; i >= 0; i--){
      const g = dinge[i]; g.y += g.v * dt;
      if(g.y >= korbY() - 10 && g.y <= korbY() + 22 && Math.abs(g.x - kx) < KB && gesperrt <= 0){
        g.d.remove(); dinge.splice(i, 1);
        if(g.o){ gefangen++; ctx.ton("richtig"); zeige("✓ " + g.o.emoji + " " + g.o.en + " = " + g.o.de); ctx.punkt(); }
        else { ctx.ton("falsch"); zeige("✗ " + wuerfle(D.autsch || ["Autsch!"])); gesperrt = 0.7; korb.classList.add("wackelt"); setTimeout(() => korb.classList.remove("wackelt"), 700); }
        continue;
      }
      if(g.y > H() + 30){ g.d.remove(); dinge.splice(i, 1); continue; }
      g.d.style.transform = "translate(" + (g.x - 20) + "px," + (g.y - 20) + "px)";
    }
    korb.style.transform = "translate(" + (kx - 32) + "px," + (korbY() - 18) + "px)";
    korb.classList.toggle("gesperrt", gesperrt > 0);
    raf = requestAnimationFrame(schritt);
  }
  const setze = e => { const r = buehne.getBoundingClientRect(); zielX = clamp(e.clientX - r.left, 0, r.width); };
  const unten = e => { if(!ctx.laeuft()) return; e.preventDefault(); try { buehne.setPointerCapture(e.pointerId); } catch(err){} setze(e); };
  const bewegt = e => { if(ctx.laeuft()) setze(e); };
  const taste = e => { const m = { ArrowLeft: -45, ArrowRight: 45 }[e.key]; if(!m || !ctx.laeuft()) return; e.preventDefault(); zielX = clamp(zielX + m, 0, W()); };
  buehne.addEventListener("pointerdown", unten); buehne.addEventListener("pointermove", bewegt); buehne.addEventListener("keydown", taste);
  raf = requestAnimationFrame(schritt); setTimeout(() => { try { buehne.focus({ preventScroll: true }); } catch(e){} }, 50);
  return () => { cancelAnimationFrame(raf); clearTimeout(mtimer); buehne.removeEventListener("pointerdown", unten); buehne.removeEventListener("pointermove", bewegt); buehne.removeEventListener("keydown", taste); buehne.removeAttribute("tabindex"); };
}

// =====================================================================
// 5) AFFEN-SCHAUKEL – im richtigen Moment tippen, dann springt der Affe zur nächsten Liane
//    Der richtige Moment ist großzügig (Ring ⭕ um den Affen), damit es auch mit
//    leicht verzögertem Touch klappt. Daneben = Netz, ohne Strafe.
// =====================================================================
function schaukel(buehne, ctx){
  const D = ctx.daten;
  const welt = el("div", "ms-sc-welt"), affe = el("div", "ms-sc-affe", D.affe || "🐒"), ring = el("div", "ms-sc-ring"), netz = el("div", "ms-sc-netz"), meldung = el("div", "ms-ro-meldung");
  buehne.append(welt, netz, meldung); welt.append(affe); affe.appendChild(ring);
  buehne.tabIndex = 0; buehne.setAttribute("aria-label", "Affen-Schaukel. Tippen oder Leertaste, wenn der Ring erscheint.");
  const W = () => buehne.clientWidth, H = () => buehne.clientHeight;
  const ABSTAND = () => Math.min(W() * 0.55, 260), L = () => Math.min(H() * 0.48, 230), OBEN = 54;
  const A = 0.62, PERIODE = ctx.reduziert ? 2.3 : 1.7, w = 2 * Math.PI / PERIODE;
  let lianen = [], nr = 0, phase = -Math.PI / 2, zustand = "schwingt", flug = null, kamera = 0, kamZiel = 0, raf = 0, t0 = 0, mtimer = null;
  function liane(i){ const d = el("div", "ms-sc-liane"); d.innerHTML = "<span>🍃</span>"; welt.insertBefore(d, affe); lianen[i] = d; return d; }
  for(let i = 0; i < 3; i++) liane(i);
  const anker = i => ({ x: W() * 0.28 + i * ABSTAND(), y: OBEN });
  const winkel = () => A * Math.sin(phase), drehung = () => A * w * Math.cos(phase);
  const ende = (i, th) => { const a = anker(i); return { x: a.x + Math.sin(th) * L(), y: a.y + Math.cos(th) * L() }; };
  const imFenster = () => { const th = winkel(), v = drehung(); return (v > 0 && th > 0.12) || (v <= 0 && th > A * 0.7); };   // Vorwärtsschwung bis kurz nach dem höchsten Punkt
  function zeige(text){ meldung.textContent = text; meldung.classList.add("an"); clearTimeout(mtimer); mtimer = setTimeout(() => meldung.classList.remove("an"), 1000); }
  function springen(){
    if(!ctx.laeuft() || zustand !== "schwingt") return;
    const start = ende(nr, winkel());
    if(imFenster()){
      if(!lianen[nr + 2]) liane(nr + 2);
      const ziel = { x: anker(nr + 1).x + Math.sin(-0.35) * L(), y: OBEN + Math.cos(-0.35) * L() };
      flug = { art: "sprung", t: 0, dauer: 0.5, start, ziel }; zustand = "fliegt";
    } else {
      flug = { art: "fall", t: 0, dauer: 0.6, start, ziel: { x: start.x + drehung() * 40, y: H() - 34 } }; zustand = "fliegt";
      ctx.ton("falsch"); zeige("🕸️ " + wuerfle(D.netz || ["Ins Netz! Nochmal!"]));
    }
  }
  function schritt(t){
    const dt = Math.min(0.033, (t - (t0 || t)) / 1000); t0 = t;
    if(!ctx.laeuft()){ raf = 0; return; }
    let pos;
    if(zustand === "schwingt"){ phase += w * dt; pos = ende(nr, winkel()); }
    else {
      flug.t += dt; const u = Math.min(1, flug.t / flug.dauer);
      if(flug.art === "sprung"){
        pos = { x: flug.start.x + (flug.ziel.x - flug.start.x) * u, y: flug.start.y + (flug.ziel.y - flug.start.y) * u - Math.sin(u * Math.PI) * 70 };
        if(u >= 1){ nr++; phase = Math.asin(-0.35 / A); zustand = "schwingt"; kamZiel = nr * ABSTAND(); ctx.ton("richtig"); ctx.punkt(); }
      } else {
        pos = { x: flug.start.x + (flug.ziel.x - flug.start.x) * u, y: flug.start.y + (flug.ziel.y - flug.start.y) * u * u };
        if(flug.t >= flug.dauer + 0.5){ phase = -Math.PI / 2; zustand = "schwingt"; }
      }
    }
    kamera += (kamZiel - kamera) * Math.min(1, dt * 6);
    welt.style.transform = "translateX(" + (-kamera) + "px)";
    // Lianen zeichnen: die aktuelle schwingt mit dem Affen, die anderen hängen still
    lianen.forEach((d, i) => {
      if(!d) return; const a = anker(i), th = (i === nr && zustand === "schwingt") ? winkel() : 0;
      d.style.left = a.x + "px"; d.style.top = a.y + "px"; d.style.height = L() + "px"; d.style.transform = "rotate(" + (-th) + "rad)";
      d.classList.toggle("naechste", i === nr + 1);
    });
    affe.style.transform = "translate(" + (pos.x - 26) + "px," + (pos.y - 20) + "px)";
    ring.classList.toggle("an", zustand === "schwingt" && imFenster());
    raf = requestAnimationFrame(schritt);
  }
  const tipp = e => { if(!ctx.laeuft()) return; e.preventDefault(); springen(); };
  const taste = e => { if(e.key === " " || e.key === "Enter"){ e.preventDefault(); springen(); } };
  buehne.addEventListener("pointerdown", tipp); buehne.addEventListener("keydown", taste);
  raf = requestAnimationFrame(schritt); setTimeout(() => { try { buehne.focus({ preventScroll: true }); } catch(e){} }, 50);
  return () => { cancelAnimationFrame(raf); clearTimeout(mtimer); buehne.removeEventListener("pointerdown", tipp); buehne.removeEventListener("keydown", taste); buehne.removeAttribute("tabindex"); };
}

// =====================================================================
// GEMEINSAMER BAUSTEIN: Laufband – Hintergrund, der nach links wandert (Nachtflug, Rutsche)
//   ebenen: [{ zeichen: [...], anzahl, y: [von, bis] (Anteil der Höhe), faktor (Tempo-Anteil), groesse, klasse }]
//   ruhig = true (Bewegung reduzieren): der Hintergrund bleibt stehen
// =====================================================================
function laufband(buehne, ebenen, ruhig){
  const W = () => buehne.clientWidth, H = () => buehne.clientHeight, teile = [];
  ebenen.forEach(eb => { for(let i = 0; i < eb.anzahl; i++){
    const d = el("div", "ms-lb-teil " + (eb.klasse || ""), wuerfle(eb.zeichen)); d.style.fontSize = eb.groesse || "1rem";
    buehne.insertBefore(d, buehne.firstChild);
    teile.push({ d, eb, x: Math.random() * (W() + 60), y: eb.y[0] + Math.random() * (eb.y[1] - eb.y[0]) });
  } });
  const setze = t => { t.d.style.transform = "translate(" + t.x + "px," + (t.y * H()) + "px)"; };
  teile.forEach(setze);
  return { schritt(dt, tempo){ if(ruhig) return; teile.forEach(t => {
    t.x -= tempo * t.eb.faktor * dt;
    if(t.x < -70){ t.x = W() + Math.random() * 60; t.y = t.eb.y[0] + Math.random() * (t.eb.y[1] - t.eb.y[0]); t.d.textContent = wuerfle(t.eb.zeichen); }
    setze(t); }); } };
}
const rechteckTrifft = (cx, cy, r, x1, y1, x2, y2) => { const nx = clamp(cx, x1, x2), ny = clamp(cy, y1, y2); return Math.hypot(cx - nx, cy - ny) < r; };

// =====================================================================
// 6) POLLYS NACHTFLUG – tippen = flattern; zwischen Bäumen hindurch, Sterne sammeln.
//    Anstoßen beendet nichts: Polly taumelt kurz und ist 1 Sekunde „unverwundbar“.
// =====================================================================
function nachtflug(buehne, ctx){
  const D = ctx.daten, F = D.flug || {};
  const W = () => buehne.clientWidth, H = () => buehne.clientHeight;
  const band = laufband(buehne, [{ zeichen: F.himmel || ["✨"], anzahl: 14, y: [0.06, 0.92], faktor: 0.25, groesse: "1.1rem", klasse: "hell" }], ctx.reduziert);
  const polly = el("div", "ms-nf-polly", F.figur || "🦜"), meldung = el("div", "ms-ro-meldung");
  buehne.append(polly, meldung);
  buehne.tabIndex = 0; buehne.setAttribute("aria-label", "Pollys Nachtflug. Tippen oder Leertaste zum Flattern.");
  const tempo = () => clamp(W() * 0.42, 120, 220) * (ctx.reduziert ? 0.7 : 1);   // Tempo passt zur Breite → im Hochformat gleich viel Vorlauf
  const g = ctx.reduziert ? 520 : 680, FLAP = ctx.reduziert ? -240 : -270, RP = 18, BB = 54;
  let px = W() * 0.25, py = H() * 0.45, vy = 0, schutz = 0, baeume = [], sterne = [], raf = 0, t0 = 0, erster = 1.0, mtimer = null;
  function zeige(text){ meldung.textContent = text; meldung.classList.add("an"); clearTimeout(mtimer); mtimer = setTimeout(() => meldung.classList.remove("an"), 900); }
  function stern(x, y){ const d = el("div", "ms-nf-stern", F.stern || "⭐"); buehne.insertBefore(d, polly); sterne.push({ d, x, y }); }
  function neuerBaum(){
    const luecke = clamp(H() * 0.42, 150, 230), mitte = luecke / 2 + 40 + Math.random() * (H() - luecke - 90);
    const oben = el("div", "ms-nf-baum oben"), unten = el("div", "ms-nf-baum unten");
    oben.append(el("span", "krone", F.krone || "🌳")); unten.append(el("span", "krone", F.krone || "🌳"));
    buehne.insertBefore(oben, polly); buehne.insertBefore(unten, polly);
    const b = { x: W() + 10, mitte, luecke, oben, unten }; baeume.push(b);
    stern(b.x + BB / 2, mitte);
    if(Math.random() < 0.5) stern(b.x + BB / 2 + tempo() * 0.95, 60 + Math.random() * (H() - 140));   // Bonusstern zwischen den Bäumen
  }
  function flattern(){ if(!ctx.laeuft()) return; vy = FLAP; polly.classList.add("flap"); setTimeout(() => polly.classList.remove("flap"), 120); }
  function schritt(t){
    const dt = Math.min(0.033, (t - (t0 || t)) / 1000); t0 = t;
    if(!ctx.laeuft()){ raf = 0; return; }
    const v = tempo(); band.schritt(dt, v);
    vy += g * dt; py += vy * dt;
    if(py < RP){ py = RP; vy = 0; }
    if(py > H() - RP - 6){ py = H() - RP - 6; vy = FLAP * 0.7; }   // Boden federt sanft zurück
    if(schutz > 0) schutz -= dt;
    erster -= dt;
    const abstand = clamp(v * 1.9, 200, 420);
    if(erster <= 0 && (!baeume.length || baeume[baeume.length - 1].x < W() - abstand)) neuerBaum();
    for(let i = baeume.length - 1; i >= 0; i--){
      const b = baeume[i]; b.x -= v * dt;
      const obenEnde = b.mitte - b.luecke / 2, untenAnfang = b.mitte + b.luecke / 2;
      b.oben.style.transform = "translate(" + b.x + "px,0)"; b.oben.style.height = obenEnde + "px";
      b.unten.style.transform = "translate(" + b.x + "px," + untenAnfang + "px)"; b.unten.style.height = (H() - untenAnfang) + "px";
      if(schutz <= 0 && (rechteckTrifft(px, py, RP - 3, b.x, 0, b.x + BB, obenEnde) || rechteckTrifft(px, py, RP - 3, b.x, untenAnfang, b.x + BB, H()))){
        schutz = 1.0; vy = 60; ctx.ton("falsch"); zeige("🪶 " + wuerfle(D.flugAutsch || ["Autsch!"]));
      }
      if(b.x < -BB - 10){ b.oben.remove(); b.unten.remove(); baeume.splice(i, 1); }
    }
    for(let i = sterne.length - 1; i >= 0; i--){
      const s = sterne[i]; s.x -= v * dt;
      if(Math.hypot(s.x - px, s.y - py) < 30){ s.d.remove(); sterne.splice(i, 1); ctx.ton("richtig"); ctx.punkt(); continue; }
      if(s.x < -40){ s.d.remove(); sterne.splice(i, 1); continue; }
      s.d.style.transform = "translate(" + (s.x - 16) + "px," + (s.y - 16) + "px)";
    }
    polly.style.transform = "translate(" + (px - 22) + "px," + (py - 22) + "px) rotate(" + clamp(vy / 12, -25, 35) + "deg)";
    polly.classList.toggle("geschuetzt", schutz > 0);
    raf = requestAnimationFrame(schritt);
  }
  const tipp = e => { if(!ctx.laeuft()) return; e.preventDefault(); flattern(); };
  const taste = e => { if(e.key === " " || e.key === "Enter" || e.key === "ArrowUp"){ e.preventDefault(); flattern(); } };
  buehne.addEventListener("pointerdown", tipp); buehne.addEventListener("keydown", taste);
  raf = requestAnimationFrame(schritt); setTimeout(() => { try { buehne.focus({ preventScroll: true }); } catch(e){} }, 50);
  return () => { cancelAnimationFrame(raf); clearTimeout(mtimer); buehne.removeEventListener("pointerdown", tipp); buehne.removeEventListener("keydown", taste); buehne.removeAttribute("tabindex"); };
}

// =====================================================================
// 7) PINGUIN-RUTSCHE – tippen = springen; über Hindernisse, Fische schnappen.
//    Ein Tipp kurz vor der Landung wird gemerkt (springt sofort wieder ab).
//    Anstoßen: kurz langsamer, 1 Sekunde Schutz, keine Strafe.
// =====================================================================
function rutsche(buehne, ctx){
  const D = ctx.daten, R = D.rutsche || {};
  const W = () => buehne.clientWidth, H = () => buehne.clientHeight;
  const band = laufband(buehne, [
    { zeichen: (R.hintergrund || ["🏔️"]).filter(z => z !== "❄️" && z !== "☁️"), anzahl: 4, y: [0.70, 0.72], faktor: 0.15, groesse: "4.5rem", klasse: "fern" },
    { zeichen: ["☁️"], anzahl: 3, y: [0.08, 0.3], faktor: 0.25, groesse: "2.6rem", klasse: "fern" },
    { zeichen: ["❄️", "·", "❄️"], anzahl: 10, y: [0.05, 0.6], faktor: 0.45, groesse: "1rem", klasse: "hell" }], ctx.reduziert);
  const boden = el("div", "ms-ru-boden"), pingu = el("div", "ms-ru-pingu", R.figur || "🐧"), meldung = el("div", "ms-ro-meldung");
  buehne.append(boden, pingu, meldung);
  buehne.tabIndex = 0; buehne.setAttribute("aria-label", "Pinguin-Rutsche. Tippen oder Leertaste zum Springen.");
  const BH = 56, bodenY = () => H() - BH;                       // Oberkante des Eises
  const g = ctx.reduziert ? 1150 : 1500, sprungH = () => clamp(H() * 0.3, 105, 150);
  const grundTempo = () => clamp(W() * 0.45, 140, 240) * (ctx.reduziert ? 0.7 : 1);
  let px = W() * 0.22, py = 0, vy = 0, amBoden = true, vorgemerkt = 0, schutz = 0, bremse = 0, dinge = [], raf = 0, t0 = 0, naechstes = 0.9, bodenVersatz = 0, mtimer = null;
  function zeige(text){ meldung.textContent = text; meldung.classList.add("an"); clearTimeout(mtimer); mtimer = setTimeout(() => meldung.classList.remove("an"), 900); }
  function ding(art, hoch){
    const d = el("div", "ms-ru-ding " + art, art === "fisch" ? (R.fisch || "🐟") : wuerfle(R.hindernisse || ["🧊"]));
    buehne.insertBefore(d, pingu); dinge.push({ d, art, x: W() + 30, h: hoch || 0 });   // h = Höhe über dem Eis
  }
  function neuesDing(){
    if(Math.random() < 0.6){ ding("hindernis"); if(Math.random() < 0.5) ding("fisch", sprungH() * 0.85); }   // oft schwebt ein Fisch über dem Hindernis
    else ding("fisch", Math.random() < 0.4 ? 0 : sprungH() * (0.5 + Math.random() * 0.4));
  }
  function springen(){
    if(!ctx.laeuft()) return;
    if(amBoden){ vy = -Math.sqrt(2 * g * sprungH()); amBoden = false; pingu.classList.add("sprung"); }
    else vorgemerkt = 0.15;                                      // kurz vor der Landung gedrückt → gleich wieder springen
  }
  function schritt(t){
    const dt = Math.min(0.033, (t - (t0 || t)) / 1000); t0 = t;
    if(!ctx.laeuft()){ raf = 0; return; }
    if(bremse > 0) bremse -= dt; if(schutz > 0) schutz -= dt; if(vorgemerkt > 0) vorgemerkt -= dt;
    const v = grundTempo() * (bremse > 0 ? 0.5 : 1);
    band.schritt(dt, v);
    if(!ctx.reduziert){ bodenVersatz = (bodenVersatz + v * dt) % 80; boden.style.backgroundPosition = (-bodenVersatz) + "px 0"; }
    if(!amBoden){ vy += g * dt; py += vy * dt; if(py >= 0){ py = 0; vy = 0; amBoden = true; pingu.classList.remove("sprung"); if(vorgemerkt > 0){ vorgemerkt = 0; springen(); } } }
    naechstes -= dt; if(naechstes <= 0){ neuesDing(); naechstes = (ctx.reduziert ? 1.35 : 1.05) * (0.8 + Math.random() * 0.5); }
    const fy = bodenY() + py;                                    // Füße des Pinguins
    for(let i = dinge.length - 1; i >= 0; i--){
      const o = dinge[i]; o.x -= v * dt;
      const oy = bodenY() - o.h;                                 // Unterkante des Dings
      if(o.art === "fisch"){
        if(Math.hypot(o.x - px, (oy - 16) - (fy - 24)) < 36){ o.d.remove(); dinge.splice(i, 1); ctx.ton("richtig"); ctx.punkt(); continue; }
      } else if(schutz <= 0 && Math.abs(o.x - px) < 28 && fy > oy - 30){
        schutz = 1.0; bremse = 0.8; ctx.ton("falsch"); zeige("💥 " + wuerfle(D.rutscheAutsch || ["Rumms!"]));
      }
      if(o.x < -50){ o.d.remove(); dinge.splice(i, 1); continue; }
      o.d.style.transform = "translate(" + (o.x - 18) + "px," + (oy - 36) + "px)";
    }
    pingu.style.transform = "translate(" + (px - 24) + "px," + (fy - 50) + "px) rotate(" + (amBoden ? -8 : clamp(vy / 25, -20, 20)) + "deg)";
    pingu.classList.toggle("geschuetzt", schutz > 0);
    raf = requestAnimationFrame(schritt);
  }
  const tipp = e => { if(!ctx.laeuft()) return; e.preventDefault(); springen(); };
  const taste = e => { if(e.key === " " || e.key === "Enter" || e.key === "ArrowUp"){ e.preventDefault(); springen(); } };
  buehne.addEventListener("pointerdown", tipp); buehne.addEventListener("keydown", taste);
  raf = requestAnimationFrame(schritt); setTimeout(() => { try { buehne.focus({ preventScroll: true }); } catch(e){} }, 50);
  return () => { cancelAnimationFrame(raf); clearTimeout(mtimer); buehne.removeEventListener("pointerdown", tipp); buehne.removeEventListener("keydown", taste); buehne.removeAttribute("tabindex"); };
}

window.MINISPIELE = Object.freeze({ fuettern, taschenlampe, seeloewe, obstkorb, schaukel, nachtflug, rutsche });
})();
