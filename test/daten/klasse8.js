/* =====================================================================
   KLASSE 8  ·  Red Line 4  ·  alle Inhalte für Klasse 8
   ---------------------------------------------------------------------
   NOCH IN ARBEIT: Die Welt (Geschichte, Räume, Figur) ist fertig, die Aufgaben fehlen noch.
   Solange Aufgaben fehlen, zeigt das Startmenü „Kommt bald!“.
   Vorschau der Welt mit den Aufgaben aus Klasse 5: Adresse mit ?welt=8
   Wie eine fertige Klasse aussieht: siehe klasse5.js und klasse-vorlage.js.
   ===================================================================== */

const K8 = neueKlasse(8);   // bitte nicht ändern

// 1) DIE WELT
K8.welt = {
  name: "Das Detektivbüro in London", emoji: "🕵️",
  figur: "Inspector Morgan",
  intro: "Good evening. Inspector Morgan, Scotland Yard. Someone stole the files of our biggest case – and locked you in our office. " +
         "The code for the safe with the evidence is hidden in four rooms. Solve the puzzles, open the safe, close the case. " +
         "And please don't touch my tea.",
  raeume: [
    { name: "Archive",        emoji: "🗄️" },
    { name: "Crime Lab",      emoji: "🔬" },
    { name: "Map Room",       emoji: "🗺️" },
    { name: "Rooftop",        emoji: "🌧️" }
  ],
  zusatzraum: { name: "Interview Room", emoji: "🎙️", text: "The suspect is getting nervous. Ask your questions – fast." },
  ausgang:    { name: "Evidence Safe", emoji: "🔐" },
  finale:     "The safe is open. Case closed. Inspector Morgan nods: “Not bad. Not bad at all.”",
  gescheitert:"Too late. The thief got away with the files. Let's try again.",
  gescheitertTor: "Three wrong codes – the safe is locked for tonight. Let's try again.",
  saetze: {
    start:            ["The first room is open. Tap it."],
    richtig:          ["Correct.", "Good work.", "That's it.", "Sharp.", "Nicely done."],
    falsch:           ["Not quite. Read the explanation and try again.", "Close. Check the rule.", "Happens to the best detectives. Again."],
    loesung:          ["Tricky one. Look at the answer – a new task is coming."],
    raumGeschafft:    ["Room done. Now the interview room …", "All clues collected."],
    zusatzStart:      ["The suspect is talking. Be quick – and precise."],
    zusatzGeschafft:  ["He told us everything. The digit is yours."],
    zusatzGescheitert:["He called his lawyer. One of these three digits is right."],
    zeitWarnung:      ["Hurry up – the thief is leaving London!"],
    torFalsch:        ["The safe stays shut. Check the lights: green is right, red is not yet."],
    zwilling:         ["Here's a similar one."],
    torBereit:        ["All rooms done. Enter the code at the safe."]
  }
};

// ---------- KARTE (Entdecker-Modus) ----------
// Die Karte ersetzt die Übersicht mit den Kacheln (Datei welt/karte.js, Aussehen: welt/stil-detektiv.js).
// So lest ihr die Zahlen: x = wie weit nach rechts (0 … 1600), y = wie weit nach unten (0 … 1000).
// Ein Raum braucht etwa 300 × 200 Platz. Der Punkt x/y ist die Mitte, die Tür ist unten in der Mitte.
// Kleine Schritte ändern (z. B. 50) und danach im Browser ansehen: …/test/index.html?welt=8
K8.welt.karte = {
  stil: "detektiv",                        // Aussehen: Datei welt/stil-detektiv.js
  groesse: { b: 1600, h: 1000 },           // Größe der ganzen Karte. Klein lassen: kurze Wege!
  start:   { x: 800, y: 850 },             // hier steht die Spielfigur am Anfang (vor dem Tresor)

  // Die vier Räume. Reihenfolge = Reihenfolge der Räume oben (Archive zuerst).
  raeume: [
    { x: 290,  y: 310, schild: "Archive" },
    { x: 1310, y: 310, schild: "Crime Lab" },
    { x: 410,  y: 700, schild: "Map Room" },
    { x: 1190, y: 700, schild: "Rooftop" }
  ],
  zusatzraum: { x: 800, y: 215, schild: "Interview Room" },   // nur Kulisse, wird nach jedem Raum von selbst betreten
  tor:        { x: 800, y: 950 },                             // der Tresor unten

  // Figuren: höchstens 5. Keine hält auf, Antippen ist freiwillig.
  //   art: "begleiter" = Inspector Morgan, läuft hinterher
  //   art: "regel"     = zeigt die Regelkarte des nächsten Raums
  //   art: "zeit"      = dreht seine „runde“ (Punkte [x, y]) und warnt, wenn die Zeit knapp wird
  //   art: "wort"      = zeigt ein Wort aus der Wörterhilfe („emoji“ = Bild, „trick“ = drehen, rollen oder huepfen)
  figuren: [
    { art: "begleiter" },
    { art: "regel", name: "Desk sergeant", x: 660, y: 520 },
    { art: "zeit",  name: "Night constable", runde: [[930, 470], [1150, 470], [1150, 560], [930, 560]] },
    { art: "wort",  emoji: "🐈", name: "Office cat", trick: "rollen", x: 560,  y: 850 },
    { art: "wort",  emoji: "☎️", name: "Telephone",  trick: "drehen", x: 1080, y: 865 }
  ],

  // Orte, an denen Inspector Morgan einmal pro Mission etwas sagt, wenn die Spielfigur in die Nähe kommt.
  orte: [
    { x: 800, y: 340, radius: 120, text: "The interview room. You'll be called in. Don't knock." },
    { x: 150, y: 520, radius: 120, text: "Nothing here but dust. I checked. Twice." },
    { x: 800, y: 620, radius: 100, text: "Mind the carpet. It's older than the Yard." }
  ],

  // Texte der Karte. {name} wird durch den Namen des Raums ersetzt.
  // Steht hier eine Liste [ "…", "…" ], wird jedes Mal ein Satz ausgewählt.
  texte: {
    gesperrt:        "Locked. Finish the room with the arrow first.",
    schonGeschafft:  "You already have that digit. Next room.",
    torZu:           "The safe stays shut. Four rooms first.",
    zusatz:          "The interview room opens after each room. Patience.",
    zusatzReaktion:  ["Muffled voices.", "Someone coughs.", "A chair scrapes."],
    jubel:           "A new digit. Noted.",
    tipp:            "Next: {name}. Follow the arrow.",
    tippTor:         "All four digits. To the safe.",
    regelTitel:      "Case notes: {name}",
    keineRegel:      "No case notes for this room.",
    waerterinFertig: "All rooms done. The safe is over there.",
    waechter:        "Hurry. The thief won't wait.",
    waechterRuf:     ["Who's there? … Oh. Carry on.", "Evening. Working late?", "Thought I heard something."],
    pollyGeschafft:  ["First digit. A start.", "Two digits. Halfway.", "One room left.", "All four. To the safe."],
    pollyWarten:     ["Still thinking? Next: {name}.", "The clock is running. {name}."],
    pollyZurueck:    ["Happens. Go back in.", "Take a moment. Then try again."],
    schliessen:      "Close"
  }
};

// Bild der Begleitfigur oben links (Inspector Morgan). Nur die Formen, ohne <svg>-Hülle, Feld 120 × 130.
K8.welt.figurSvg =
  '<path d="M16 130 Q16 98 60 94 Q104 98 104 130 Z" fill="#8a7a5c" stroke="#000" stroke-width="4"/>' +
  '<path d="M40 96 L60 118 L80 96 L70 92 L60 104 L50 92 Z" fill="#a8977a" stroke="#000" stroke-width="3"/>' +
  '<circle cx="60" cy="64" r="28" fill="#d9a77f" stroke="#000" stroke-width="4"/>' +
  '<circle cx="50" cy="64" r="3.5" fill="#000"/><circle cx="70" cy="64" r="3.5" fill="#000"/>' +
  '<path d="M44 76 Q52 70 60 76 Q68 70 76 76 Q68 82 60 78 Q52 82 44 76 Z" fill="#4a4033" stroke="#000" stroke-width="2.5"/>' +
  '<path d="M42 56 L56 58 M64 58 L78 56" stroke="#000" stroke-width="3" stroke-linecap="round"/>' +
  '<path d="M14 46 Q60 34 106 46 Q60 54 14 46 Z" fill="#4a4033" stroke="#000" stroke-width="4"/>' +
  '<path d="M32 42 Q34 12 60 12 Q86 12 88 42 Z" fill="#4a4033" stroke="#000" stroke-width="4"/>' +
  '<path d="M33 36 L87 36" stroke="#000" stroke-width="5"/>';
// ---------- Ende KARTE ----------

// 2) DIE THEMEN (laut „Themenuebersicht“, Red Line 4)
K8.themen = [
  { id: "8-G1",  klasse: 8, unit: 1, titel: "Die einfache Vergangenheit", regel: "" },
  { id: "8-G2",  klasse: 8, unit: 1, titel: "Die Vorvergangenheit", regel: "" },
  { id: "8-G3",  klasse: 8, unit: 2, titel: "Modale Hilfsverben und ihre Ersatzformen", regel: "" },
  { id: "8-G4",  klasse: 8, unit: 2, titel: "Bedingungssätze Typ I", regel: "" },
  { id: "8-G5",  klasse: 8, unit: 2, titel: "Stützwort one/ones", regel: "" },
  { id: "8-G6",  klasse: 8, unit: 3, titel: "Bestätigungsfragen", regel: "" },
  { id: "8-G7",  klasse: 8, unit: 3, titel: "Fragen", regel: "" },
  { id: "8-G8",  klasse: 8, unit: 3, titel: "Bedingungssätze Typ II", regel: "" },
  { id: "8-G9",  klasse: 8, unit: 4, titel: "Simple present – present progressive", regel: "" },
  { id: "8-G10", klasse: 8, unit: 4, titel: "Adjektive und Adverbien", regel: "" },
  { id: "8-G11", klasse: 8, unit: 4, titel: "Das Perfekt", regel: "" },
  { id: "8-G12", klasse: 8, unit: 5, titel: "Das Passiv", regel: "" },
  { id: "8-G13", klasse: 8, unit: 5, titel: "Indirekte Rede (ohne Zeitverschiebung)", regel: "" },
  { id: "8-G14", klasse: 8, unit: 5, titel: "Indirekte Rede (mit Zeitverschiebung)", regel: "" }
];

// =====================================================================
// 8) MINISPIELE
//    Reward after a cleared bonus room: button „🎁 Minispiel?“. 30 seconds at most, does NOT count for the code.
//    Nur die Spiele, die unter „spiele“ stehen, werden in dieser Welt angeboten. Die Spieltechnik steht in spiele/minispiele.js.
//    titel / anleitung / erfolg = Texte (einfaches Englisch); ziel = so viele Punkte braucht man.
//    Beim Spiel codeknacker ist ziel zugleich die Länge des Codes (3 bis 5).
// =====================================================================
K8.minispiele = {
  spiele: {
    codeknacker: {
      titel: "🔐 Crack the safe",
      anleitung: "Find the four-digit code. Tap four digits. After each try you get a hint for every digit: ● right place, ◐ wrong place, ○ not in the code.",
      ziel: 4,
      erfolg: "Click. The safe is open. Morgan raises one eyebrow."
    },
    nachtflug: {
      titel: "🕊️ Rooftop flight",
      anleitung: "Tap to make the pigeon flap. Fly between the buildings and collect the clues 🔍. Bumping into things is fine.",
      ziel: 8,
      erfolg: "Eight clues. That pigeon deserves a badge."
    },
    rutsche: {
      titel: "🏃 Night chase",
      anleitung: "Tap to jump. Get over boxes and bins and pick up the clues 🔍.",
      ziel: 8,
      erfolg: "Eight clues and not one broken leg. Good run."
    }
  },
  codeknacker: { ziffern: 5, legende: "● right place · ◐ wrong place · ○ not in the code", start: "Tap four digits.", fertig: "Code cracked." },
  flug: { figur: "🕊️", stern: "🔍", krone: "🏢", himmel: ["🌧️", "·", "🌙", "·", "☁️", "·"] },
  flugAutsch: ["Ouch. A chimney.", "Keep flapping.", "Close one.", "Feathers everywhere. Go on."],
  rutsche: { figur: "🏃", fisch: "🔍", hindernisse: ["📦", "🗑️", "🚧"], hintergrund: ["🏢", "☁️", "🏢", "🌧️"] },
  rutscheAutsch: ["Crash. Keep going.", "Mind the bins.", "Ouch.", "Up you get."]
};
