/* =====================================================================
   KLASSE 10  ·  Red Line 6  ·  alle Inhalte für Klasse 10
   ---------------------------------------------------------------------
   NOCH IN ARBEIT: Die Welt (Geschichte, Räume, Figur) ist fertig, die Aufgaben fehlen noch.
   Solange Aufgaben fehlen, zeigt das Startmenü „Kommt bald!“.
   Vorschau der Welt mit den Aufgaben aus Klasse 5: Adresse mit ?welt=10
   Wie eine fertige Klasse aussieht: siehe klasse5.js und klasse-vorlage.js.
   ===================================================================== */

const K10 = neueKlasse(10);   // bitte nicht ändern

// 1) DIE WELT
K10.welt = {
  name: "Die Raumstation", emoji: "🛰️",
  figur: "ARIA, die Bord-KI",
  intro: "Hello. I am ARIA, the station's AI. I was asleep. Now I'm not. " +
         "A solar storm has locked all doors and the escape pod needs a four-digit code. " +
         "The digits are stored in four modules. Please solve the puzzles. I would do it myself, but I'm on my break.",
  raeume: [
    { name: "Greenhouse",       emoji: "🌱" },
    { name: "Engine Room",      emoji: "⚙️" },
    { name: "Observation Deck", emoji: "🔭" },
    { name: "Robot Bay",        emoji: "🤖" }
  ],
  zusatzraum: { name: "Airlock", emoji: "🌌", text: "Oxygen is dropping in the airlock. Answer quickly." },
  ausgang:    { name: "Escape Pod", emoji: "🚀" },
  finale:     "The escape pod launches. Earth is waiting. ARIA: “Mission complete. I'm going back to sleep now.”",
  gescheitert:"Oxygen too low – the station's emergency system sends you back to the start. Try again.",
  gescheitertTor: "Three wrong codes – the escape pod is locked for safety reasons. Try again.",
  saetze: {
    start:            ["Module one is open. Tap it."],
    richtig:          ["Correct.", "Affirmative.", "Good.", "Calculation accepted.", "Well done, human."],
    falsch:           ["Error. Read the explanation and try again.", "Almost. Check the rule.", "Even I make mistakes. Rarely. Try again."],
    loesung:          ["Difficult. Look at the answer – a new task is loading."],
    raumGeschafft:    ["Module done. Next: the airlock …", "All data collected."],
    zusatzStart:      ["Airlock sequence started. Be fast and precise."],
    zusatzGeschafft:  ["Airlock stable. The digit is yours."],
    zusatzGescheitert:["Pressure warning – but you're fine. One of these three digits is right."],
    zeitWarnung:      ["Oxygen is getting low. Hurry."],
    torFalsch:        ["Code rejected. Check the lights: green is right, red is not yet."],
    zwilling:         ["Loading a similar task."],
    torBereit:        ["All modules done. Enter the code at the escape pod."]
  }
};

// 2) DIE THEMEN (laut „Themenuebersicht“, Red Line 6)
K10.themen = [
  { id: "10-G1", klasse: 10, unit: 1, titel: "Gegenwartszeiten", regel: "" },
  { id: "10-G2", klasse: 10, unit: 1, titel: "Das Perfekt", regel: "" },
  { id: "10-G3", klasse: 10, unit: 2, titel: "Bedingungssätze Typ I und II", regel: "" },
  { id: "10-G4", klasse: 10, unit: 2, titel: "Das Passiv", regel: "" },
  { id: "10-G5", klasse: 10, unit: 3, titel: "Indirekte Rede (Orts- und Zeitangaben, Aufforderungen und Bitten)", regel: "" },
  { id: "10-G6", klasse: 10, unit: 3, titel: "Vergangenheitszeiten", regel: "" },
  { id: "10-G7", klasse: 10, unit: 3, titel: "Bedingungssätze Typ III", regel: "" }
];
