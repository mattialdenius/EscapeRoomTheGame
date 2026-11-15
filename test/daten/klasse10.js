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

// ---------- KARTE (Entdecker-Modus) ----------
// Die Karte ersetzt die Übersicht mit den Kacheln (Datei welt/karte.js, Aussehen: welt/stil-station.js).
// So lest ihr die Zahlen: x = wie weit nach rechts (0 … 1600), y = wie weit nach unten (0 … 1000).
// Ein Modul braucht etwa 300 × 200 Platz. Der Punkt x/y ist die Mitte, die Luke ist unten in der Mitte.
// Kleine Schritte ändern (z. B. 50) und danach im Browser ansehen: …/test/index.html?welt=10
K10.welt.karte = {
  stil: "station",                         // Aussehen: Datei welt/stil-station.js
  groesse: { b: 1600, h: 1000 },           // Größe der ganzen Karte. Klein lassen: kurze Wege!
  start:   { x: 800, y: 850 },             // hier steht die Spielfigur am Anfang (vor der Rettungskapsel)

  // Die vier Module. Reihenfolge = Reihenfolge der Räume oben (Greenhouse zuerst).
  raeume: [
    { x: 320,  y: 310, schild: "Greenhouse" },
    { x: 1280, y: 310, schild: "Engine Room" },
    { x: 400,  y: 700, schild: "Observation Deck" },
    { x: 1200, y: 700, schild: "Robot Bay" }
  ],
  zusatzraum: { x: 800, y: 215, schild: "Airlock" },   // nur Kulisse, wird nach jedem Modul von selbst betreten
  tor:        { x: 800, y: 950 },                      // die Rettungskapsel unten

  // Figuren: höchstens 5. Keine hält auf, Antippen ist freiwillig.
  //   art: "begleiter" = ARIA, schwebt als Hologramm mit
  //   art: "regel"     = zeigt die Regelkarte des nächsten Moduls
  //   art: "zeit"      = dreht seine „runde“ (Punkte [x, y]) und warnt, wenn die Zeit knapp wird
  //   art: "wort"      = zeigt ein Wort aus der Wörterhilfe („emoji“ = Bild, „trick“ = drehen, rollen oder huepfen)
  figuren: [
    { art: "begleiter" },
    { art: "regel", name: "Plant bot", x: 660, y: 520 },
    { art: "zeit",  name: "Maintenance drone", runde: [[930, 470], [1150, 470], [1150, 560], [930, 560]] },
    { art: "wort",  emoji: "🛰️", name: "Model satellite", trick: "drehen",  x: 560,  y: 850 },
    { art: "wort",  emoji: "📟", name: "Old pager",       trick: "huepfen", x: 1080, y: 865 }
  ],

  // Orte, an denen ARIA einmal pro Mission etwas sagt, wenn die Spielfigur in die Nähe kommt.
  orte: [
    { x: 800, y: 340, radius: 120, text: "That is the airlock. It opens when it wants to. Like me." },
    { x: 150, y: 520, radius: 120, text: "There is nothing over there. I would know. I am the station." },
    { x: 800, y: 620, radius: 100, text: "Main corridor. You are welcome to keep walking." }
  ],

  // Texte der Karte. {name} wird durch den Namen des Moduls ersetzt.
  // Steht hier eine Liste [ "…", "…" ], wird jedes Mal ein Satz ausgewählt.
  texte: {
    gesperrt:        "Locked. Finish the module with the arrow first. I don't make the rules. Well, I do.",
    schonGeschafft:  "You already have that digit. Moving on.",
    torZu:           "The escape pod needs four digits. You don't have four digits.",
    zusatz:          "The airlock opens after each module. No need to stare at it.",
    zusatzReaktion:  ["Hiss.", "Pressure stable. For now.", "Sssss …"],
    jubel:           "A digit. How exciting.",
    tipp:            "Next: {name}. Follow the arrow.",
    tippTor:         "All four digits. The escape pod is waiting.",
    regelTitel:      "Data sheet: {name}",
    keineRegel:      "No data sheet for this module.",
    waerterinFertig: "All modules done. The escape pod is that way.",
    waechter:        "Oxygen is limited. Just saying.",
    waechterRuf:     ["Scan … human. Fine.", "Unknown object … oh. It's you.", "Beep. Carry on."],
    pollyGeschafft:  ["One digit. Three to go.", "Two digits. Half done.", "One module left.", "All four. Escape pod. Go."],
    pollyWarten:     ["Are you resting? I was resting. Next: {name}.", "Time passes. Even in space. {name}."],
    pollyZurueck:    ["Recalculating. Try again.", "Take a breath. While there is air."],
    schliessen:      "Close"
  }
};

// Bild der Begleitfigur oben links (ARIA, die Bord-KI). Nur die Formen, ohne <svg>-Hülle, Feld 120 × 130.
K10.welt.figurSvg =
  '<path d="M38 128 L60 96 L82 128 Z" fill="#96dcff" fill-opacity="0.35" stroke="#000" stroke-width="3"/>' +
  '<circle cx="60" cy="60" r="44" fill="none" stroke="#bfe9ff" stroke-width="3" stroke-dasharray="8 7"/>' +
  '<circle cx="60" cy="60" r="34" fill="#143c5a" stroke="#000" stroke-width="4"/>' +
  '<circle cx="60" cy="60" r="34" fill="none" stroke="#bfe9ff" stroke-width="2"/>' +
  '<path d="M38 56 L54 56 M66 56 L82 56" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
  '<path d="M39 57 A7 7 0 0 0 53 57 Z" fill="#fff"/><path d="M67 57 A7 7 0 0 0 81 57 Z" fill="#fff"/>' +
  '<path d="M52 78 L68 78" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>' +
  '<path d="M96 22 L104 14 M100 30 L110 28" stroke="#ff9f1c" stroke-width="3" stroke-linecap="round"/>';
// ---------- Ende KARTE ----------

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
