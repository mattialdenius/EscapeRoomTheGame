/* =====================================================================
   KLASSE 9  ·  Red Line 5  ·  alle Inhalte für Klasse 9
   ---------------------------------------------------------------------
   NOCH IN ARBEIT: Die Welt (Geschichte, Räume, Figur) ist fertig, die Aufgaben fehlen noch.
   Solange Aufgaben fehlen, zeigt das Startmenü „Kommt bald!“.
   Vorschau der Welt mit den Aufgaben aus Klasse 5: Adresse mit ?welt=9
   Wie eine fertige Klasse aussieht: siehe klasse5.js und klasse-vorlage.js.
   ===================================================================== */

const K9 = neueKlasse(9);   // bitte nicht ändern

// 1) DIE WELT
K9.welt = {
  name: "Die Agentenzentrale", emoji: "🔐",
  figur: "Agent Nova",
  intro: "Nova here, on the radio. Bad news: our headquarters is in lockdown and you're inside. " +
         "The override code is split into four parts, hidden in four sections of the building. " +
         "Find them, enter the code at the exit, get out. No pressure. Well – a little pressure.",
  raeume: [
    { name: "Server Room",    emoji: "💾" },
    { name: "Gadget Lab",     emoji: "🧪" },
    { name: "Briefing Room",  emoji: "📋" },
    { name: "Garage",         emoji: "🏍️" }
  ],
  zusatzraum: { name: "Laser Room", emoji: "🚨", text: "Lasers are moving. Answer before they reach you." },
  ausgang:    { name: "Emergency Exit", emoji: "🚪" },
  finale:     "Lockdown over. You're out. Nova on the radio: “Clean job. I'll pretend I'm not impressed.”",
  gescheitert:"Security caught you. Mission failed – new attempt.",
  gescheitertTor: "Three wrong codes – full lockdown. Mission failed – new attempt.",
  saetze: {
    start:            ["First section is open. Go."],
    richtig:          ["Correct.", "Nice.", "Clean.", "Good.", "That works."],
    falsch:           ["Negative. Read the explanation and try again.", "Close. Check the rule.", "Even agents make mistakes. Again."],
    loesung:          ["That was a hard one. Check the answer – new task incoming."],
    raumGeschafft:    ["Section cleared. Next: the laser room …", "Code part secured."],
    zusatzStart:      ["Lasers on. Fast and accurate."],
    zusatzGeschafft:  ["Through the lasers. The digit is yours."],
    zusatzGescheitert:["Alarm triggered – but only briefly. One of these three digits is right."],
    zeitWarnung:      ["Security is on its way. Hurry."],
    torFalsch:        ["Access denied. Check the lights: green is right, red is not yet."],
    zwilling:         ["Similar task. You've got this."],
    torBereit:        ["All sections cleared. Enter the code at the exit."]
  }
};

// ---------- KARTE (Entdecker-Modus) ----------
// Die Karte ersetzt die Übersicht mit den Kacheln (Datei welt/karte.js, Aussehen: welt/stil-agenten.js).
// So lest ihr die Zahlen: x = wie weit nach rechts (0 … 1600), y = wie weit nach unten (0 … 1000).
// Ein Raum braucht etwa 300 × 200 Platz. Der Punkt x/y ist die Mitte, die Tür ist unten in der Mitte.
// Kleine Schritte ändern (z. B. 50) und danach im Browser ansehen: …/test/index.html?welt=9
K9.welt.karte = {
  stil: "agenten",                         // Aussehen: Datei welt/stil-agenten.js
  groesse: { b: 1600, h: 1000 },           // Größe der ganzen Karte. Klein lassen: kurze Wege!
  start:   { x: 800, y: 850 },             // hier steht die Spielfigur am Anfang (vor dem Notausgang)

  // Die vier Sektionen. Reihenfolge = Reihenfolge der Räume oben.
  raeume: [
    { x: 290,  y: 310, schild: "Server Room" },
    { x: 1310, y: 310, schild: "Gadget Lab" },
    { x: 420,  y: 700, schild: "Briefing Room" },
    { x: 1180, y: 700, schild: "Garage" }
  ],
  zusatzraum: { x: 800, y: 210, schild: "Laser Room" },   // nur Kulisse, wird nach jedem Raum von selbst betreten
  tor:        { x: 800, y: 950 },                         // der Notausgang unten

  // Figuren: höchstens 5. Keine hält auf, Antippen ist freiwillig.
  //   art: "begleiter" = Agent Novas Funk-Drohne, fliegt mit
  //   art: "regel"     = zeigt die Regelkarte der nächsten Sektion
  //   art: "zeit"      = dreht seine „runde“ (Punkte [x, y]) und warnt, wenn die Zeit knapp wird
  //   art: "wort"      = zeigt ein Wort aus der Wörterhilfe („emoji“ = Bild)
  figuren: [
    { art: "begleiter" },
    { art: "regel", name: "Tech officer", x: 650, y: 520 },
    { art: "zeit",  name: "Guard bot", runde: [[940, 470], [1160, 470], [1160, 560], [940, 560]] },
    { art: "wort",  emoji: "💻", name: "Terminal", trick: "drehen",  x: 560,  y: 850 },
    { art: "wort",  emoji: "📻", name: "Radio",    trick: "huepfen", x: 1060, y: 860 }
  ],

  // Orte, an denen Nova einmal pro Mission etwas sagt, wenn die Spielfigur in die Nähe kommt.
  orte: [
    { x: 800, y: 330, radius: 130, text: "That's the laser room. Not yet." },
    { x: 150, y: 520, radius: 120, text: "Dead end. Even I can see that from here." },
    { x: 800, y: 600, radius: 110, text: "Main corridor. All sections branch off from here." }
  ],

  // Texte der Karte. {name} wird durch den Namen der Sektion ersetzt.
  // Steht hier eine Liste [ "…", "…" ], wird jedes Mal ein Satz ausgewählt.
  texte: {
    gesperrt:        "Locked. Clear the section with the arrow first.",
    schonGeschafft:  "Already cleared. You have that digit. Move on.",
    torZu:           "Not yet. Four sections first.",
    zusatz:          "The laser room opens after each section. Don't go looking for it.",
    zusatzReaktion:  ["Bzzzt.", "Still armed.", "Lasers humming."],
    jubel:           "Digit secured.",
    tipp:            "Next: {name}. Follow the arrow.",
    tippTor:         "All four digits. Head for the exit.",
    regelTitel:      "Briefing: {name}",
    keineRegel:      "No briefing for this section.",
    waerterinFertig: "All sections cleared. The exit is that way.",
    waechter:        "Keep moving.",
    waechterRuf:     ["Scanning … staff. Carry on.", "ID check … fine. Go."],
    pollyGeschafft:  ["One down.", "Halfway.", "One section left.", "That's all four. Exit. Now."],
    pollyWarten:     ["Still there? Next: {name}.", "The clock is ticking. {name}."],
    pollyZurueck:    ["Regroup. Then back in.", "Take a breath. Try again."],
    schliessen:      "Close"
  }
};

// Bild der Begleitfigur oben links (Agent Nova mit Headset). Nur die Formen, ohne <svg>-Hülle, Feld 120 × 130.
K9.welt.figurSvg =
  '<path d="M20 130 Q20 96 60 92 Q100 96 100 130 Z" fill="#1e293b" stroke="#000" stroke-width="4"/>' +
  '<path d="M50 94 L60 110 L70 94 Z" fill="#39e6ff" stroke="#000" stroke-width="3"/>' +
  '<circle cx="60" cy="58" r="30" fill="#dba77c" stroke="#000" stroke-width="4"/>' +
  '<path d="M30 60 Q26 22 60 22 Q94 22 90 60 Q82 40 60 40 Q40 40 30 60 Z" fill="#1b1b22" stroke="#000" stroke-width="4"/>' +
  '<circle cx="50" cy="60" r="4" fill="#000"/><circle cx="72" cy="60" r="4" fill="#000"/>' +
  '<path d="M52 75 Q62 80 71 72" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>' +
  '<path d="M27 60 Q27 16 60 16 Q93 16 93 60" fill="none" stroke="#000" stroke-width="5"/>' +
  '<rect x="20" y="52" width="13" height="22" rx="5" fill="#39e6ff" stroke="#000" stroke-width="3"/>' +
  '<path d="M27 74 Q28 88 46 86" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>' +
  '<circle cx="49" cy="86" r="4.5" fill="#39e6ff" stroke="#000" stroke-width="2"/>';
// ---------- Ende KARTE ----------

// 2) DIE THEMEN (laut „Themenuebersicht“, Red Line 5)
K9.themen = [
  { id: "9-G1",  klasse: 9, unit: 1, titel: "Modale Hilfsverben und ihre Ersatzformen", regel: "" },
  { id: "9-G2",  klasse: 9, unit: 1, titel: "Steigerung und Vergleich von Adjektiven und Adverbien", regel: "" },
  { id: "9-G3",  klasse: 9, unit: 2, titel: "Relativsätze mit und ohne Relativpronomen", regel: "" },
  { id: "9-G4",  klasse: 9, unit: 2, titel: "Die Verlaufsform der Vergangenheit", regel: "" },
  { id: "9-G5",  klasse: 9, unit: 3, titel: "Das Partizip Präsens", regel: "" },
  { id: "9-G6",  klasse: 9, unit: 3, titel: "Die Vorvergangenheit", regel: "" },
  { id: "9-G7",  klasse: 9, unit: 3, titel: "Das Passiv (einfache Vergangenheit)", regel: "" },
  { id: "9-G8",  klasse: 9, unit: 4, titel: "Indirekte Rede I (Zeitverschiebung → simple past)", regel: "" },
  { id: "9-G9",  klasse: 9, unit: 4, titel: "Indirekte Rede II (Zeitverschiebung → past perfect)", regel: "" },
  { id: "9-G10", klasse: 9, unit: 4, titel: "Zukunftszeiten (will und going to)", regel: "" },
  { id: "9-G11", klasse: 9, unit: 4, titel: "Zukunftszeiten (simple present und present progressive)", regel: "" }
];

// =====================================================================
// 8) MINISPIELE
//    Reward after a cleared bonus room: button „🎁 Minispiel?“. 30 seconds at most, does NOT count for the code.
//    Nur die Spiele, die unter „spiele“ stehen, werden in dieser Welt angeboten. Die Spieltechnik steht in spiele/minispiele.js.
//    titel / anleitung / erfolg = Texte (einfaches Englisch); ziel = so viele Punkte braucht man.
//    Beim Spiel codeknacker ist ziel zugleich die Länge des Codes (3 bis 5).
// =====================================================================
K9.minispiele = {
  spiele: {
    codeknacker: {
      titel: "💾 Crack the code",
      anleitung: "Find the four-digit code. Tap four digits. After each try you get a hint for every digit: ● right place, ◐ wrong place, ○ not in the code.",
      ziel: 4,
      erfolg: "Access granted. Nova: “Took you long enough.”"
    },
    lasergitter: {
      titel: "🚨 Laser corridor",
      anleitung: "The laser switches on and off. Tap when it says OFF to run through. Tap at the wrong moment and you lose a second, nothing more.",
      ziel: 6,
      erfolg: "Six gates, zero alarms. Clean."
    },
    rutsche: {
      titel: "🏍️ Garage run",
      anleitung: "Tap to jump. Get the bike over barriers and crates and collect the data disks 💾.",
      ziel: 8,
      erfolg: "Eight disks. Please don't scratch the bike."
    },
    nachtflug: {
      titel: "🛸 Drone flight",
      anleitung: "Tap to keep the drone in the air. Fly between the towers and collect the signals 📡. Bumping into things is fine.",
      ziel: 8,
      erfolg: "Eight signals. The drone is still in one piece."
    }
  },
  codeknacker: { ziffern: 5, legende: "● right place · ◐ wrong place · ○ not in the code", start: "Tap four digits.", fertig: "Code cracked." },
  lasergitter: { figur: "🕵️", ziel: "🚪", an: "ON", aus: "OFF", hinweis: "Tap when the laser is OFF.", autsch: ["Zap. Wait for OFF.", "Too early.", "Patience, agent."] },
  rutsche: { figur: "🏍️", fisch: "💾", hindernisse: ["🚧", "📦", "🛢️"], hintergrund: ["🏢", "☁️", "🏢", "☁️"] },
  rutscheAutsch: ["Crash. Keep going.", "Mind the barrier.", "Ouch.", "Back on the bike."],
  flug: { figur: "🛸", stern: "📡", krone: "🏢", himmel: ["✨", "·", "🌙", "·", "✨", "·"] },
  flugAutsch: ["Bump. Still flying.", "Careful.", "Close one.", "Rotor check … fine."]
};
