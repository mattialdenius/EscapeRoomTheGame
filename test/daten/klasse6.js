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

// ---------- KARTE (Entdecker-Modus) ----------
// Die Karte ersetzt die Übersicht mit den Kacheln (Datei welt/karte.js, Aussehen: welt/stil-schiff.js).
// So lest ihr die Zahlen: x = wie weit nach rechts (0 … 1600), y = wie weit nach unten (0 … 1000).
// Ein Raum braucht etwa 300 × 200 Platz. Der Punkt x/y ist die Mitte, die Tür ist unten in der Mitte.
// Kleine Schritte ändern (z. B. 50) und danach im Browser ansehen: …/test/index.html?welt=6
K6.welt.karte = {
  stil: "schiff",                          // Aussehen: Datei welt/stil-schiff.js
  groesse: { b: 1600, h: 1000 },           // Größe der ganzen Karte. Klein lassen: kurze Wege!
  start:   { x: 800, y: 850 },             // hier steht die Spielfigur am Anfang (vor dem Beiboot)

  // Die vier Räume. Reihenfolge = Reihenfolge der Räume oben (Kombüse zuerst).
  raeume: [
    { x: 330,  y: 300, schild: "Kombüse" },
    { x: 1270, y: 300, schild: "Kapitänskajüte" },
    { x: 330,  y: 690, schild: "Laderaum" },
    { x: 1270, y: 690, schild: "Ausguck" }
  ],
  zusatzraum: { x: 800, y: 205, schild: "Pulverkammer" },   // nur Kulisse, wird nach jedem Raum von selbst betreten
  tor:        { x: 800, y: 950 },                           // das Beiboot unten an der Reling

  // Figuren: höchstens 5. Keine hält auf, Antippen ist freiwillig.
  //   art: "begleiter" = Käpt'n Grammar, läuft hinterher
  //   art: "regel"     = zeigt die Regelkarte des nächsten Raums
  //   art: "zeit"      = dreht seine „runde“ (Punkte [x, y]) und warnt, wenn die Zeit knapp wird
  //   art: "wort"      = zeigt ein Wort aus der Wörterhilfe („emoji“ = Bild, „trick“ = drehen, rollen oder huepfen)
  figuren: [
    { art: "begleiter" },
    { art: "regel", name: "Schiffskoch", x: 690, y: 480 },
    { art: "zeit",  name: "Wache", runde: [[890, 460], [1100, 460], [1100, 660], [890, 660]] },
    { art: "wort",  emoji: "🦀", name: "Krabbe", trick: "rollen", x: 540,  y: 850 },
    { art: "wort",  emoji: "🐙", name: "Krake",  trick: "drehen", x: 1080, y: 865 }
  ],

  // Orte, an denen der Käpt'n einmal pro Mission etwas sagt, wenn die Spielfigur in die Nähe kommt.
  orte: [
    { x: 600, y: 600, radius: 100, text: "Das ist der Großmast. Hochklettern nur mit Erlaubnis vom Käpt'n. Also von mir!" },
    { x: 800, y: 330, radius: 120, text: "Finger weg von der Pulverkammer! Die kommt nach jedem Raum von ganz allein." },
    { x: 160, y: 520, radius: 120, text: "Backbord ist links, Steuerbord ist rechts. Merkt euch das, ihr Landratten!" }
  ],

  // Texte der Karte. {name} wird durch den Namen des Raums ersetzt.
  // Steht hier eine Liste [ "…", "…" ], wird jedes Mal ein Satz ausgewählt.
  texte: {
    gesperrt:        "Arrr, die Tür ist noch verriegelt! Schafft zuerst den Raum mit dem Pfeil.",
    schonGeschafft:  "Hier habt ihr die Ziffer schon erbeutet. Weiter, Matrosen!",
    torZu:           "Das Beiboot bleibt angekettet. Erst alle vier Räume schaffen!",
    zusatz:          "Die Pulverkammer! Da geht es nach jedem Raum von selbst hinein.",
    zusatzReaktion:  ["Zisch …", "Pssst … die Lunte!", "Zisch … knister …"],
    jubel:           "Arrr! Eine neue Ziffer!",
    tipp:            "Als Nächstes: {name}! Folgt dem gelben Pfeil.",
    tippTor:         "Alle Ziffern an Bord! Ab zum Beiboot.",
    regelTitel:      "Spickzettel für: {name}",
    keineRegel:      "Für diesen Raum habe ich keinen Spickzettel.",
    waerterinFertig: "Alles geschafft! Jetzt schnell zum Beiboot.",
    waechter:        "Beeilt euch, die Crew kommt bald zurück!",
    waechterRuf:     ["Wer schleicht da übers Deck?", "Halt! … Ach, ihr seid das.", "Hab ich da was gehört?"],
    pollyGeschafft:  ["Arrr! Die erste Ziffer!", "Halbe Fahrt! Zwei Ziffern!", "Nur noch ein Raum, Matrosen!", "Alle vier! Ab zum Beiboot!"],
    pollyWarten:     ["Nicht einschlafen, Landratten! Weiter: {name}!", "Der Wind steht gut. Auf zu: {name}!"],
    pollyZurueck:    ["Kein Grund zur Meuterei. Gleich noch einmal!", "Kurz durchatmen, dann wieder rein!"]
  }
};

// Bild der Begleitfigur oben links (Käpt'n Grammar). Nur die Formen, ohne <svg>-Hülle, Feld 120 × 130.
K6.welt.figurSvg =
  '<path d="M18 130 Q18 98 60 94 Q102 98 102 130 Z" fill="#7b1e2b" stroke="#000" stroke-width="4"/>' +
  '<path d="M50 96 L60 112 L70 96 Z" fill="#f4ead2" stroke="#000" stroke-width="3"/>' +
  '<circle cx="60" cy="62" r="29" fill="#d9a77f" stroke="#000" stroke-width="4"/>' +
  '<path d="M34 70 Q36 100 60 102 Q84 100 86 70 Q74 82 60 82 Q46 82 34 70 Z" fill="#5a3a22" stroke="#000" stroke-width="4"/>' +
  '<path d="M50 80 Q60 88 70 80" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>' +
  '<circle cx="72" cy="60" r="4" fill="#000"/>' +
  '<path d="M32 50 L88 62" stroke="#000" stroke-width="4"/><ellipse cx="49" cy="60" rx="9" ry="7" fill="#000"/>' +
  '<path d="M10 46 Q60 -6 110 46 Q60 30 10 46 Z" fill="#1b1b22" stroke="#000" stroke-width="4"/>' +
  '<path d="M26 40 Q60 22 94 40" fill="none" stroke="#ffd23f" stroke-width="4"/>' +
  '<circle cx="60" cy="24" r="6" fill="#f4ead2" stroke="#000" stroke-width="2.5"/>';
// ---------- Ende KARTE ----------

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

// =====================================================================
// 8) MINISPIELE
//    Belohnung nach einem geschafften Zusatzraum: Knopf „🎁 Minispiel?“. Höchstens 30 Sekunden, zählt NICHT für den Code.
//    Nur die Spiele, die unter „spiele“ stehen, werden in dieser Welt angeboten.
//    titel / anleitung / erfolg = Texte; ziel = so viele Punkte braucht man. Die Spieltechnik steht in spiele/minispiele.js.
// =====================================================================
K6.minispiele = {
  spiele: {
    obstkorb: {
      titel: "🪙 Schatzregen",
      anleitung: "Der Sturm schüttelt die Schatzkisten! Schiebt den Korb mit dem Finger und fangt den Schatz auf. Vorsicht vor Bomben und Fischgräten!",
      ziel: 12,
      erfolg: "Der Korb ist voll! Käpt'n Grammar zählt schon nach."
    },
    nachtflug: {
      titel: "🦜 Flug durch die Masten",
      anleitung: "Tippt, damit der Bordpapagei flattert! Fliegt zwischen den Segeln hindurch und sammelt Goldmünzen 🪙. Anstoßen ist nicht schlimm.",
      ziel: 8,
      erfolg: "Acht Münzen im Schnabel! Der Käpt'n ist stolz."
    },
    rutsche: {
      titel: "🐒 Schiffsaffe an Deck",
      anleitung: "Tippt, damit der Schiffsaffe springt! Hüpft über Fässer und Kisten und schnappt euch die Bananen 🍌.",
      ziel: 8,
      erfolg: "Satt und zufrieden! Der Affe salutiert."
    },
    taschenlampe: {
      titel: "🔦 Suche im Laderaum",
      anleitung: "Im dunklen Laderaum ist einiges versteckt – manches hinter Kisten. Fahrt mit dem Finger herum und haltet das Licht kurz darauf!",
      ziel: 6,
      erfolg: "Alles gefunden! Ihr habt Augen wie ein Ausguck."
    }
  },

  // ---------- Schatzregen (Technik: obstkorb) ----------
  obst: [
    { emoji: "🪙", en: "coin",     de: "Münze" },      { emoji: "💎", en: "diamond",  de: "Diamant" },
    { emoji: "👑", en: "crown",    de: "Krone" },      { emoji: "💍", en: "ring",     de: "Ring" },
    { emoji: "🗝️", en: "key",      de: "Schlüssel" },  { emoji: "🧭", en: "compass",  de: "Kompass" },
    { emoji: "🏆", en: "cup",      de: "Pokal" },      { emoji: "📿", en: "necklace", de: "Kette" },
    { emoji: "🔔", en: "bell",     de: "Glocke" },     { emoji: "🗺️", en: "map",      de: "Karte" }
  ],
  muell: ["💣", "🦴", "🥾", "🐟"],          // nicht fangen!
  autsch: ["Autsch! Eine Bombe!", "Igitt, eine Fischgräte!", "Wer wirft denn Stiefel über Bord?!", "Das ist kein Schatz!"],

  // ---------- Flug durch die Masten (Technik: nachtflug) ----------
  flug: { figur: "🦜", stern: "🪙", krone: "⛵", himmel: ["☁️", "·", "✨", "🌙", "·", "☁️"] },
  flugAutsch: ["Autsch! Ein Segel!", "Huch! Weiterflattern!", "Kraaah! Fast!", "Federn zerzaust – weiter!"],

  // ---------- Schiffsaffe an Deck (Technik: rutsche) ----------
  rutsche: { figur: "🐒", fisch: "🍌", hindernisse: ["🛢️", "📦", "⚓"], hintergrund: ["⛵", "☁️", "⛵", "☁️"] },
  rutscheAutsch: ["Rumms! Weiter!", "Gegen das Fass! Weiter!", "Autsch!", "Hoppla – Kopf hoch!"],

  // ---------- Suche im Laderaum (Technik: taschenlampe) ----------
  nachtTiere: [
    { emoji: "🐀", en: "rat",     de: "Ratte" },     { emoji: "🗝️", en: "key",    de: "Schlüssel" },
    { emoji: "🧭", en: "compass", de: "Kompass" },   { emoji: "🪙", en: "coin",   de: "Münze" },
    { emoji: "🦜", en: "parrot",  de: "Papagei" },   { emoji: "🐈", en: "cat",    de: "Katze" },
    { emoji: "🕯️", en: "candle",  de: "Kerze" },     { emoji: "🗺️", en: "map",    de: "Karte" },
    { emoji: "⚓", en: "anchor",  de: "Anker" },     { emoji: "🔔", en: "bell",   de: "Glocke" },
    { emoji: "🦀", en: "crab",    de: "Krabbe" },    { emoji: "👑", en: "crown",  de: "Krone" }
  ],
  kulisse: ["📦", "🛢️", "📦", "🧺", "🛢️", "📦", "🪜", "🧺", "📦", "🛢️"]
};
