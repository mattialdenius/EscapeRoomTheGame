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
