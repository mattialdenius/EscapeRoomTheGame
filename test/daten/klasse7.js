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

// ---------- KARTE (Entdecker-Modus) ----------
// Die Karte ersetzt die Übersicht mit den Kacheln (Datei welt/karte.js, Aussehen: welt/stil-museum.js).
// So lest ihr die Zahlen: x = wie weit nach rechts (0 … 1600), y = wie weit nach unten (0 … 1000).
// Ein Saal braucht etwa 300 × 200 Platz. Der Punkt x/y ist die Mitte, der Eingang ist unten in der Mitte.
// Kleine Schritte ändern (z. B. 50) und danach im Browser ansehen: …/test/index.html?welt=7
K7.welt.karte = {
  stil: "museum",                          // Aussehen: Datei welt/stil-museum.js
  groesse: { b: 1600, h: 1000 },           // Größe der ganzen Karte. Klein lassen: kurze Wege!
  start:   { x: 800, y: 850 },             // hier steht die Spielfigur am Anfang (vor der Zeitmaschine)

  // Die vier Säle. Reihenfolge = Reihenfolge der Räume oben (Saurier-Saal zuerst).
  raeume: [
    { x: 300,  y: 310, schild: "Saurier-Saal" },
    { x: 1300, y: 310, schild: "Ägypten-Saal" },
    { x: 300,  y: 700, schild: "Ritter-Saal" },
    { x: 1300, y: 700, schild: "Zukunfts-Labor" }
  ],
  zusatzraum: { x: 800, y: 215, schild: "Zeitstrudel" },   // nur Kulisse, wird nach jedem Saal von selbst betreten
  tor:        { x: 800, y: 950 },                          // die Zeitmaschine unten

  // Figuren: höchstens 5. Keine hält auf, Antippen ist freiwillig.
  //   art: "begleiter" = Professorin Tempora (über Funk): eine fliegende Taschenuhr
  //   art: "regel"     = zeigt die Regelkarte des nächsten Saals
  //   art: "zeit"      = dreht seine „runde“ (Punkte [x, y]) und warnt, wenn die Zeit knapp wird
  //   art: "wort"      = zeigt ein Wort aus der Wörterhilfe („emoji“ = Bild, „trick“ = drehen, rollen oder huepfen)
  figuren: [
    { art: "begleiter" },
    { art: "regel", name: "Roboter-Guide", x: 670, y: 520 },
    { art: "zeit",  name: "Museumswärter", runde: [[930, 470], [1120, 470], [1120, 640], [930, 640]] },
    { art: "wort",  emoji: "🏺", name: "Sprechende Vase", trick: "drehen",  x: 540,  y: 850 },
    { art: "wort",  emoji: "🦕", name: "Saurier-Modell",  trick: "huepfen", x: 1080, y: 865 }
  ],

  // Orte, an denen Professorin Tempora einmal pro Mission etwas sagt, wenn die Spielfigur in die Nähe kommt.
  orte: [
    { x: 800, y: 340, radius: 120, text: "Der Zeitstrudel. Bitte nicht hineinfassen. Er meldet sich früh genug." },
    { x: 150, y: 520, radius: 120, text: "Hier hinten ist nur der Notausgang. Leider auch verriegelt." },
    { x: 800, y: 620, radius: 100, text: "Der rote Läufer führt zu allen Sälen. Praktisch, oder?" }
  ],

  // Texte der Karte. {name} wird durch den Namen des Saals ersetzt.
  // Steht hier eine Liste [ "…", "…" ], wird jedes Mal ein Satz ausgewählt.
  texte: {
    gesperrt:        "Dieser Saal ist noch verriegelt. Schafft zuerst den Saal mit dem Pfeil.",
    schonGeschafft:  "Diese Ziffer habt ihr schon. Weiter zum nächsten Saal.",
    torZu:           "Die Zeitmaschine startet erst, wenn alle vier Säle geschafft sind.",
    zusatz:          "Der Zeitstrudel öffnet sich nach jedem Saal von selbst.",
    zusatzReaktion:  ["Wusch …", "Die Zeiger drehen sich.", "Tick … tack … tick …"],
    jubel:           "Eine neue Ziffer. Sehr gut.",
    tipp:            "Als Nächstes: {name}. Folgt dem Pfeil.",
    tippTor:         "Alle Ziffern gefunden. Auf zur Zeitmaschine.",
    regelTitel:      "Infotafel: {name}",
    keineRegel:      "Zu diesem Saal habe ich keine Infotafel gespeichert.",
    waerterinFertig: "Alle Säle geschafft. Die Zeitmaschine wartet.",
    waechter:        "Das Museum öffnet bald. Beeilt euch.",
    waechterRuf:     ["Ist da jemand?", "Nanu, Besuch um diese Zeit?", "Hm. Wohl nur die Lüftung."],
    pollyGeschafft:  ["Die erste Ziffer. Guter Anfang.", "Zwei von vier. Halbzeit.", "Nur noch ein Saal.", "Alle vier. Auf zur Zeitmaschine!"],
    pollyWarten:     ["Die Zeit läuft. Weiter: {name}.", "Seid ihr noch da? Als Nächstes: {name}."],
    pollyZurueck:    ["Kein Problem. Gleich noch einmal.", "Kurz sammeln, dann wieder hinein."]
  }
};

// Bild der Begleitfigur oben links (Professorin Tempora). Nur die Formen, ohne <svg>-Hülle, Feld 120 × 130.
K7.welt.figurSvg =
  '<path d="M18 130 Q18 98 60 94 Q102 98 102 130 Z" fill="#f4f4f6" stroke="#000" stroke-width="4"/>' +
  '<path d="M48 96 L60 116 L72 96 Z" fill="#7a1f2b" stroke="#000" stroke-width="3"/>' +
  '<circle cx="60" cy="26" r="13" fill="#b9bfc9" stroke="#000" stroke-width="4"/>' +
  '<circle cx="60" cy="62" r="29" fill="#e8b98f" stroke="#000" stroke-width="4"/>' +
  '<path d="M31 62 Q30 32 60 32 Q90 32 89 62 Q80 44 60 44 Q40 44 31 62 Z" fill="#b9bfc9" stroke="#000" stroke-width="4"/>' +
  '<circle cx="48" cy="64" r="10" fill="#fff" fill-opacity="0.5" stroke="#000" stroke-width="3"/><circle cx="72" cy="64" r="10" fill="#fff" fill-opacity="0.5" stroke="#000" stroke-width="3"/>' +
  '<path d="M58 64 L62 64" stroke="#000" stroke-width="3"/>' +
  '<circle cx="48" cy="64" r="3" fill="#000"/><circle cx="72" cy="64" r="3" fill="#000"/>' +
  '<path d="M52 80 Q60 85 68 80" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>' +
  '<circle cx="88" cy="112" r="10" fill="#d9b45a" stroke="#000" stroke-width="3"/><path d="M88 112 L88 106 M88 112 L92 114" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>';
// ---------- Ende KARTE ----------

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

// =====================================================================
// 8) MINISPIELE
//    Belohnung nach einem geschafften Zusatzraum: Knopf „🎁 Minispiel?“. Höchstens 30 Sekunden, zählt NICHT für den Code.
//    Nur die Spiele, die unter „spiele“ stehen, werden in dieser Welt angeboten.
//    titel / anleitung / erfolg = Texte; ziel = so viele Punkte braucht man. Die Spieltechnik steht in spiele/minispiele.js.
// =====================================================================
K7.minispiele = {
  spiele: {
    taschenlampe: {
      titel: "🔦 Nachts im Museum",
      anleitung: "Das Licht ist aus. Fahrt mit dem Finger durch den Saal und haltet die Taschenlampe kurz auf ein Ausstellungsstück – manche stehen hinter Säulen.",
      ziel: 6,
      erfolg: "Alle Stücke gefunden. Die Sammlung ist vollständig."
    },
    rutsche: {
      titel: "🦖 Saurier-Sprint",
      anleitung: "Tippt, damit der Saurier springt. Hüpft über Knochen und Felsen und sammelt die Eier 🥚.",
      ziel: 8,
      erfolg: "Acht Eier gerettet. Die Urzeit dankt."
    },
    nachtflug: {
      titel: "🦇 Flug durch die Säulenhalle",
      anleitung: "Tippt, damit die Fledermaus flattert. Fliegt zwischen den Säulen hindurch und sammelt Sanduhren ⏳. Anstoßen kostet nur etwas Zeit.",
      ziel: 8,
      erfolg: "Acht Sanduhren. Zeit gewonnen."
    }
  },

  // ---------- Nachts im Museum (Technik: taschenlampe) ----------
  nachtTiere: [
    { emoji: "🏺", en: "vase",     de: "Vase" },        { emoji: "👑", en: "crown",    de: "Krone" },
    { emoji: "🦴", en: "bone",     de: "Knochen" },     { emoji: "⚔️", en: "swords",   de: "Schwerter" },
    { emoji: "🛡️", en: "shield",   de: "Schild" },      { emoji: "💎", en: "diamond",  de: "Diamant" },
    { emoji: "📜", en: "scroll",   de: "Schriftrolle" },{ emoji: "🗿", en: "statue",   de: "Statue" },
    { emoji: "🪙", en: "coin",     de: "Münze" },       { emoji: "🔭", en: "telescope", de: "Fernrohr" },
    { emoji: "🤖", en: "robot",    de: "Roboter" },     { emoji: "🕰️", en: "clock",    de: "Uhr" }
  ],
  kulisse: ["🏛️", "🪑", "🏛️", "🖼️", "🏛️", "🪴", "🖼️", "🏛️", "🪑", "🏛️"],

  // ---------- Saurier-Sprint (Technik: rutsche) ----------
  rutsche: { figur: "🦖", fisch: "🥚", hindernisse: ["🦴", "🪨", "🌵"], hintergrund: ["🌋", "☁️", "🌴", "☁️"] },
  rutscheAutsch: ["Rumms. Weiter.", "Gestolpert. Weiter!", "Autsch.", "Kopf hoch, weiter."],

  // ---------- Flug durch die Säulenhalle (Technik: nachtflug) ----------
  flug: { figur: "🦇", stern: "⏳", krone: "🏛️", himmel: ["✨", "·", "🖼️", "·", "✨", "·"] },
  flugAutsch: ["Autsch, eine Säule.", "Weiterflattern!", "Knapp daneben.", "Kurz getaumelt – weiter."]
};
