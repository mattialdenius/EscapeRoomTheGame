/* =====================================================================
   KLASSE 6  ·  Red Line 2  ·  alle Inhalte für Klasse 6
   ---------------------------------------------------------------------
   NOCH IN ARBEIT: Die Welt (Geschichte, Räume, Figur) ist fertig, die Aufgaben fehlen noch.
   Solange Aufgaben fehlen, zeigt das Startmenü „Kommt bald!“.
   Vorschau der Welt mit den Aufgaben aus Klasse 5: Adresse mit ?welt=6
   Wie eine fertige Klasse aussieht: siehe klasse5.js und klasse-vorlage.js.
   ===================================================================== */

const K6 = neueKlasse(6);   // bitte nicht ändern

// 1) DIE WELT
K6.welt = {
  name: "Das Piratenschiff", emoji: "🏴‍☠️",
  figur: "Käpt'n Grammar",
  intro: "Ahoi, ihr Landratten! Ihr habt euch als blinde Passagiere auf mein Schiff geschlichen – mutig! " +
         "Aber an Land kommt ihr nur mit dem Beiboot, und das hängt an einem Zahlenschloss. " +
         "Meine Crew hat die vier Ziffern auf dem Schiff versteckt. Löst die Rätsel in allen vier Räumen, dann lasse ich euch ziehen!",
  raeume: [
    { name: "Kombüse",          emoji: "🍲" },
    { name: "Kapitänskajüte",   emoji: "🧭" },
    { name: "Laderaum",         emoji: "📦" },
    { name: "Ausguck",          emoji: "🔭" }
  ],
  zusatzraum: { name: "Pulverkammer", emoji: "💣", text: "Vorsicht, die Lunte brennt! Antwortet, bevor es knallt!" },
  ausgang:    { name: "Beiboot", emoji: "🚣" },
  finale:     "Das Schloss springt auf! Ihr rudert im Beiboot davon. Käpt'n Grammar salutiert: „Gute Fahrt, ihr Grammatik-Piraten!“",
  gescheitert:"Arrr! Die Crew hat euch erwischt. Strafe: Deck schrubben! Versucht es gleich noch einmal.",
  gescheitertTor: "Dreimal der falsche Code – das Beiboot bleibt angekettet und die Crew wird misstrauisch. Versucht es gleich noch einmal!",
  saetze: {
    start:            ["Leinen los! Der erste Raum ist offen. Tippt ihn an!"],
    richtig:          ["Arrr, richtig!", "Ein echter Pirat!", "Volltreffer!", "Gut gemacht, Matrose!", "Das gibt eine Extraportion Zwieback!"],
    falsch:           ["Kielholen wäre übertrieben – lest die Erklärung und versucht es nochmal.", "Fast! Schaut euch die Regel genau an.", "Kein Grund zur Meuterei – nochmal!"],
    loesung:          ["Das war eine harte Nuss. Schaut euch die Lösung an, gleich kommt eine neue Aufgabe."],
    raumGeschafft:    ["Raum geschafft! Jetzt noch die Pulverkammer …", "Alle Schlüsselteile an Bord!"],
    zusatzStart:      ["Pssst … die Lunte brennt! Schnell und genau antworten!"],
    zusatzGeschafft:  ["Lunte ausgetreten! Die Ziffer gehört euch!"],
    zusatzGescheitert:["BUMM! Nur Rauch, keine Sorge. Eine der drei Ziffern stimmt."],
    zeitWarnung:      ["Beeilt euch, die Crew kommt gleich zurück an Bord!"],
    torFalsch:        ["Das Schloss klemmt. Schaut auf die Lämpchen: Grün stimmt, Rot noch nicht!"],
    zwilling:         ["Hier ist eine ähnliche Aufgabe. Ihr schafft das!"],
    torBereit:        ["Alle Räume geschafft! Stellt den Code am Beiboot ein."]
  }
};

// 2) DIE THEMEN (laut „Themenuebersicht“, Red Line 2)
K6.themen = [
  { id: "6-G1",  klasse: 6, unit: 1, titel: "Adjektive und Adverbien", regel: "" },
  { id: "6-G2",  klasse: 6, unit: 1, titel: "Possessivpronomen", regel: "" },
  { id: "6-G3",  klasse: 6, unit: 1, titel: "Die einfache Vergangenheit: Aussagen, Verneinung", regel: "" },
  { id: "6-G4",  klasse: 6, unit: 1, titel: "Die einfache Vergangenheit: Fragen, Kurzantworten", regel: "" },
  { id: "6-G5",  klasse: 6, unit: 2, titel: "Das Perfekt: Aussagen, Verneinung", regel: "" },
  { id: "6-G6",  klasse: 6, unit: 2, titel: "Das Perfekt: Fragen, Kurzantworten", regel: "" },
  { id: "6-G7",  klasse: 6, unit: 3, titel: "Steigerung von Adjektiven mit -er und more", regel: "" },
  { id: "6-G8",  klasse: 6, unit: 3, titel: "Steigerung von Adjektiven mit -est und most", regel: "" },
  { id: "6-G9",  klasse: 6, unit: 3, titel: "Some und any", regel: "" },
  { id: "6-G10", klasse: 6, unit: 4, titel: "Mengenangaben: much, many, lots of", regel: "" },
  { id: "6-G11", klasse: 6, unit: 4, titel: "Die einfache Gegenwart: Aussagen, Verneinung", regel: "" },
  { id: "6-G12", klasse: 6, unit: 4, titel: "Die einfache Gegenwart: Fragen, Kurzantworten", regel: "" },
  { id: "6-G13", klasse: 6, unit: 4, titel: "Die Zukunft mit will (spontane Entscheidungen)", regel: "" },
  { id: "6-G14", klasse: 6, unit: 5, titel: "Die Verlaufsform der Gegenwart: Aussagen", regel: "" },
  { id: "6-G15", klasse: 6, unit: 5, titel: "Die Verlaufsform der Gegenwart: Verneinung, Fragen, Kurzantworten", regel: "" },
  { id: "6-G16", klasse: 6, unit: 6, titel: "Bedingungssätze Typ I", regel: "" },
  { id: "6-G17", klasse: 6, unit: 6, titel: "Die Zukunft mit going to: Aussagen, Verneinung", regel: "" },
  { id: "6-G18", klasse: 6, unit: 6, titel: "Die Zukunft mit going to: Fragen, Kurzantworten", regel: "" },
  { id: "6-G19", klasse: 6, unit: 6, titel: "Die Zukunft mit will (Wünsche, Hoffnungen, Vorhersagen)", regel: "" }
];
