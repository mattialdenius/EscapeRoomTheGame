/* =====================================================================
   VORLAGE FÜR EINE NEUE KLASSE  ·  so ist eine Klassendatei aufgebaut
   ---------------------------------------------------------------------
   Diese Datei wird vom Spiel NICHT geladen. Sie ist eine Kopiervorlage.

   So legt ihr eine neue Klasse an (Beispiel Klasse 6):
     1. Datei kopieren und als  daten/klasse6.js  speichern
        (gibt es die Datei schon, nur die fehlenden Abschnitte ergänzen).
     2. Überall  K0  durch  K6  ersetzen und oben  neueKlasse(6)  schreiben.
     3. In daten/allgemein.js bei KLASSEN_DATEIEN prüfen, dass die Klasse
        mit ihrem Dateinamen eingetragen ist.
     4. Abschnitte ausfüllen. Ein vollständiges Beispiel ist daten/klasse5.js.

   Regeln (wie überall im Datenbereich):
     - Nur Texte zwischen Anführungszeichen "..." und Zahlen ändern.
     - Kommas zwischen den Einträgen und Klammern [ ] { } stehen lassen.
     - Beim Laden prüft das Spiel alles und meldet Fehler auf Deutsch,
       mit dem Namen der Datei und des Abschnitts.

   Wann gilt eine Klasse als „fertig“ (im Startmenü wählbar)?
     - Die Welt hat raeume, saetze, zusatzraum und ausgang  UND
     - mindestens ein Thema hat Aufgaben oder einen Generator.
     Sonst zeigt das Startmenü „Kommt bald!“.
   ===================================================================== */

const K0 = neueKlasse(0);   // ← Klassennummer eintragen, z. B. const K6 = neueKlasse(6);

// =====================================================================
// 1) DIE WELT (Schauplatz, Geschichte, Räume, Sätze der Begleitfigur)
//    Klasse 5–6 verspielt, ab Klasse 8 cooler und anspruchsvoller.
// =====================================================================
K0.welt = {
  name: "Name der Welt", emoji: "🏝️",
  figur: "Name der Begleitfigur",
  intro: "Kurze Rahmengeschichte: Warum müssen die Spieler entkommen? Wo sind die Ziffern versteckt?",
  raeume: [                                   // genau 4 Räume
    { name: "Raum 1", emoji: "🚪" },
    { name: "Raum 2", emoji: "🚪" },
    { name: "Raum 3", emoji: "🚪" },
    { name: "Raum 4", emoji: "🚪" }
  ],
  zusatzraum: { name: "Bonusraum", emoji: "⏱", text: "Kurzer, spannender Satz für die Bonusfrage." },
  ausgang:    { name: "Ausgang", emoji: "🚪" },
  finale:         "Text, wenn der Ausgang offen ist.",
  gescheitert:    "Text, wenn die Zeit abgelaufen ist.",
  gescheitertTor: "Text nach drei falschen Codes am Ausgang.",
  // Sätze der Begleitfigur: pro Anlass ein oder mehrere Sätze (das Spiel wählt zufällig)
  saetze: {
    start:             ["…"],
    richtig:           ["…", "…"],
    falsch:            ["…"],
    loesung:           ["…"],
    raumGeschafft:     ["…"],
    zusatzStart:       ["…"],
    zusatzGeschafft:   ["…"],
    zusatzGescheitert: ["…"],
    zeitWarnung:       ["…"],
    torFalsch:         ["…"],
    zwilling:          ["…"],
    torBereit:         ["…"]
  }
};

// =====================================================================
// 2) DIE THEMEN (laut „Themenuebersicht“)
//    id = Klasse-Grammatiknummer, klasse = diese Klasse,
//    regel = Text der Hilfekarte (Niveau leicht), darf leer "" sein
// =====================================================================
K0.themen = [
  { id: "0-G1", klasse: 0, unit: 1, titel: "Titel des Grammatikthemas", regel: "Kurze Regel mit Beispiel." }
];

// =====================================================================
// 3) DER SATZBAUKASTEN (Generator) – freiwillig
//    Wortlisten, aus denen das Spiel automatisch viele Aufgaben baut.
//    Ein Baukasten pro Unit ("6-U1" = Klasse 6, Unit 1). Welche Listen nötig
//    sind, hängt von der „art“ ab (Beispiele für jede art: daten/klasse5.js).
//    Nur Wörter verwenden, die bis zur jeweiligen Unit bekannt sind!
// =====================================================================
K0.baukasten = {
};

// =====================================================================
// 4) WÖRTERHILFE – freiwillig
//    Deutsche Bedeutung für erschließbare Wörter (Antippen zeigt Deutsch).
// =====================================================================
K0.woerterhilfe = [
  // { en: "banana", de: "Banane" }
];

// =====================================================================
// 5) GENERATOREN – freiwillig
//    Welches Thema nutzt welchen Baukasten und welche Aufgaben-Art?
//    z. B.  "6-G1": { baukasten: "6-U1", art: "aussage" }
// =====================================================================
K0.generatoren = {
};

// =====================================================================
// 6) DIE AUFGABEN (handgeschriebener Pool)
//    Jede Aufgabe: thema, niveau ("gruen"/"gelb"/"rot"), form, Inhalt und erklaerung.
//    loesung: ALLE richtigen Varianten. Kurz- und Langform (doesn't / does not)
//    erkennt das Spiel automatisch als gleich.
//    Erklärungen: Klasse 5–7 auf Deutsch, ab Klasse 8 einfaches Englisch
//    mit deutschem Fachbegriff in Klammern. 1–2 Sätze plus Beispiel.
//    Ein Muster für jede Form:
// =====================================================================
K0.aufgaben = [
  { thema: "0-G1", niveau: "gruen", form: "quiz", frage: "My brother ___ to school by bus.", optionen: ["go", "goes"], loesung: "goes",
    erklaerung: "My brother = he. Bei he/she/it bekommt das Verb ein -s. Beispiel: Lily goes home." },
  { thema: "0-G1", niveau: "gruen", form: "zuordnen", kategorien: ["play", "plays"],
    woerter: [{ text: "I", ziel: "play" }, { text: "Sam", ziel: "plays" }, { text: "they", ziel: "play" }],
    erklaerung: "He, she, it und Namen → Verb mit -s. I, you, we, they → ohne -s." },
  { thema: "0-G1", niveau: "gelb", form: "luecke", frage: "Lily ___ (read) comics.", loesung: ["reads"],
    erklaerung: "Lily = she, also Verb + s. Beispiel: Tom plays football." },
  { thema: "0-G1", niveau: "gelb", form: "satzbau", loesung: ["My sister likes pizza."],   // weitere richtige Reihenfolgen mit Komma dahinter
    erklaerung: "Person – Verb – Rest. Beispiel: My brother plays football." },
  { thema: "0-G1", niveau: "rot", form: "fehler", satz: "Sam play football.", fehlerwort: "play", loesung: ["plays"],
    erklaerung: "Sam = he. Bei he/she/it braucht das Verb ein -s. Beispiel: Lily eats an apple." },
  { thema: "0-G1", niveau: "rot", form: "umformen", frage: "Start with „She …“:  I go to school.", loesung: ["She goes to school."],
    erklaerung: "Bei she bekommt das Verb ein -s (nach -o: -es). Beispiel: I watch TV. → Tom watches TV." }
];

// =====================================================================
// 7) DIE FRAGEN FÜR DEN ZUSATZRAUM
//    Kurze, knifflige Auswahlfragen (schnell lesbar). loesung muss genau so
//    in optionen stehen.
// =====================================================================
K0.zusatzfragen = [
  { thema: "0-G1", frage: "Which sentence is correct?", optionen: ["He haves a dog.", "He has a dog.", "He have a dog."], loesung: "He has a dog." }
];
