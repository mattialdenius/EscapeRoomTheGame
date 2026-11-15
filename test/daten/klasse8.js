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
