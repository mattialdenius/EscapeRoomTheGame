/* =====================================================================
   KLASSE 7  ·  Red Line 3  ·  alle Inhalte für Klasse 7
   ---------------------------------------------------------------------
   NOCH IN ARBEIT: Die Welt (Geschichte, Räume, Figur) ist fertig, die Aufgaben fehlen noch.
   Solange Aufgaben fehlen, zeigt das Startmenü „Kommt bald!“.
   Vorschau der Welt mit den Aufgaben aus Klasse 5: Adresse mit ?welt=7
   Wie eine fertige Klasse aussieht: siehe klasse5.js und klasse-vorlage.js.
   ===================================================================== */

const K7 = neueKlasse(7);   // bitte nicht ändern

// 1) DIE WELT
K7.welt = {
  name: "Das Museum der Zeitreisen", emoji: "⏳",
  figur: "Professorin Tempora",
  intro: "Willkommen im Museum der Zeitreisen. Leider hat die Zeitmaschine einen Kurzschluss: Die Ausgangstür ist verriegelt " +
         "und der Code zum Neustart ist in vier Epochen verstreut. Ich bin Professorin Tempora und begleite euch über Funk. " +
         "Löst die Rätsel in allen vier Sälen – bevor das Museum öffnet und jemand merkt, was passiert ist.",
  raeume: [
    { name: "Saurier-Saal",     emoji: "🦖" },
    { name: "Ägypten-Saal",     emoji: "🏺" },
    { name: "Ritter-Saal",      emoji: "🏰" },
    { name: "Zukunfts-Labor",   emoji: "🤖" }
  ],
  zusatzraum: { name: "Zeitstrudel", emoji: "🌀", text: "Der Zeitstrudel zieht! Antwortet, bevor er euch in eine andere Epoche schleudert." },
  ausgang:    { name: "Zeitmaschine", emoji: "⏱️" },
  finale:     "Die Zeitmaschine springt an – und ihr landet pünktlich in der Gegenwart. Professorin Tempora: „Saubere Arbeit. Ich trage euch ins Gästebuch ein.“",
  gescheitert:"Zu spät – das Museum öffnet und der Hausmeister findet euch neben einer qualmenden Zeitmaschine. Neuer Versuch!",
  gescheitertTor: "Drei falsche Codes – die Zeitmaschine geht in den Notfallmodus. Neuer Versuch!",
  saetze: {
    start:            ["Der erste Saal ist offen. Tippt ihn an."],
    richtig:          ["Richtig.", "Sehr gut – das passt in jede Epoche.", "Korrekt!", "Stark.", "Genau so."],
    falsch:           ["Nicht ganz. Lest die Erklärung und versucht es noch einmal.", "Fast. Schaut euch die Regel genau an.", "Kein Problem – auch Zeitreisende verrechnen sich mal."],
    loesung:          ["Knifflig. Schaut euch die Lösung an, dann kommt eine neue Aufgabe."],
    raumGeschafft:    ["Saal geschafft! Jetzt noch der Zeitstrudel …", "Alle Teile gesammelt."],
    zusatzStart:      ["Achtung, Zeitstrudel! Schnell und genau antworten."],
    zusatzGeschafft:  ["Strudel gebändigt. Die Ziffer gehört euch."],
    zusatzGescheitert:["Der Strudel hat euch kurz erwischt. Eine der drei Ziffern stimmt."],
    zeitWarnung:      ["Beeilt euch, das Museum öffnet bald!"],
    torFalsch:        ["Die Zeitmaschine bleibt aus. Schaut auf die Lämpchen: Grün stimmt, Rot noch nicht."],
    zwilling:         ["Hier ist eine ähnliche Aufgabe."],
    torBereit:        ["Alle Säle geschafft! Gebt den Code an der Zeitmaschine ein."]
  }
};

// 2) DIE THEMEN (laut „Themenuebersicht“, Red Line 3)
K7.themen = [
  { id: "7-G1",  klasse: 7, unit: 1, titel: "Die einfache Gegenwart", regel: "" },
  { id: "7-G2",  klasse: 7, unit: 1, titel: "Die einfache Vergangenheit", regel: "" },
  { id: "7-G3",  klasse: 7, unit: 2, titel: "Reflexivpronomen und each other", regel: "" },
  { id: "7-G4",  klasse: 7, unit: 2, titel: "Adjektive und Adverbien", regel: "" },
  { id: "7-G5",  klasse: 7, unit: 2, titel: "Das Perfekt", regel: "" },
  { id: "7-G6",  klasse: 7, unit: 3, titel: "Relativsätze mit Relativpronomen", regel: "" },
  { id: "7-G7",  klasse: 7, unit: 3, titel: "Das Gerundium", regel: "" },
  { id: "7-G8",  klasse: 7, unit: 3, titel: "Die Zukunft mit will", regel: "" },
  { id: "7-G9",  klasse: 7, unit: 3, titel: "Bedingungssätze Typ I", regel: "" },
  { id: "7-G10", klasse: 7, unit: 4, titel: "Bedingungssätze Typ II", regel: "" },
  { id: "7-G11", klasse: 7, unit: 4, titel: "Steigerung und Vergleiche von Adjektiven", regel: "" },
  { id: "7-G12", klasse: 7, unit: 4, titel: "Some und any", regel: "" },
  { id: "7-G13", klasse: 7, unit: 4, titel: "Simple present und present progressive", regel: "" },
  { id: "7-G14", klasse: 7, unit: 5, titel: "Possessivpronomen", regel: "" },
  { id: "7-G15", klasse: 7, unit: 5, titel: "Modale Hilfsverben", regel: "" }
];
