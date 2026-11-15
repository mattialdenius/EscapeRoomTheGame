/* =====================================================================
   KLASSE 5  ·  Red Line 1  ·  alle Inhalte für Klasse 5
   ---------------------------------------------------------------------
   Diese Datei gehört zum Grammar Escape Room (index.html).
   Hier stehen NUR Inhalte: Welt, Themen, Satzbaukästen, Aufgaben.
   Ändert nur Texte zwischen Anführungszeichen "..." und Zahlen.
   Kommas zwischen den Einträgen und Klammern bitte stehen lassen.
   Beim Laden prüft das Spiel alles und meldet Fehler auf Deutsch.
   ===================================================================== */

const K5 = neueKlasse(5);   // bitte nicht ändern

// =====================================================================
// 1) DIE WELT (Schauplatz, Geschichte, Räume, Sätze der Begleitfigur)
// =====================================================================
K5.welt = {
  name: "Der Zoo bei Nacht", emoji: "🦁",
  figur: "Polly, der Papagei",
  intro: "Kraaah! Oh nein, ihr habt im Zoo die Zeit vergessen! Jetzt ist es dunkel und das große Zootor ist abgeschlossen. " +
         "Die frechen Tiere haben die Ziffern für das Torschloss in ihren Gehegen versteckt. Ich bin Polly und helfe euch. " +
         "Löst die Rätsel in allen vier Gehegen!",
  raeume: [
    { name: "Affenhaus",      emoji: "🐒" },
    { name: "Pinguinbecken",  emoji: "🐧" },
    { name: "Reptilienhaus",  emoji: "🦎" },
    { name: "Elefantenhaus",  emoji: "🐘" }
  ],
  zusatzraum: { name: "Raubtierhaus", emoji: "🦁", text: "Psst! Der Löwe schläft nur ganz kurz. Antwortet, bevor er aufwacht!" },
  ausgang:    { name: "Zootor", emoji: "🚪" },
  finale:     "Das Zootor ist offen! Ihr seid entkommen und die Tiere winken euch nach. Kraaah!",
  gescheitert:"Oh je, der Nachtwächter hat euch entdeckt! Diesmal hat es nicht geklappt. Versucht es gleich noch einmal!",
  gescheitertTor: "Alarm! Nach drei falschen Codes hat sich das Zootor verriegelt und der Nachtwächter ist unterwegs. Versucht es gleich noch einmal!",
  saetze: {
    start:            ["Auf geht's! Das erste Gehege ist offen. Tippt es an!"],
    richtig:          ["Super! Kraaah!", "Richtig! Die Affen klatschen.", "Toll gemacht!", "Spitze! Weiter so!", "Genau! Ich bin stolz auf euch."],
    falsch:           ["Hoppla! Lest die Erklärung und probiert es noch einmal.", "Fast! Schaut euch die Regel genau an.", "Kein Problem, aus Fehlern lernt man!"],
    loesung:          ["Das war knifflig. Schaut euch die Lösung an, gleich kommt eine neue Aufgabe."],
    raumGeschafft:    ["Gehege geschafft! Jetzt wartet noch das Raubtierhaus …", "Wow, alle Schlüsselteile gesammelt!"],
    zusatzStart:      ["Leise! Der Löwe schläft. Schnell und genau antworten!"],
    zusatzGeschafft:  ["Unglaublich! Der Löwe hat nichts gemerkt. Die Ziffer gehört euch!"],
    zusatzGescheitert:["Roooar! Der Löwe ist aufgewacht! Nicht schlimm: Eine der drei Ziffern stimmt."],
    zeitWarnung:      ["Beeilt euch, der Nachtwächter kommt bald!"],
    torFalsch:        ["Das Tor bleibt zu. Schaut auf die Lämpchen: Grün stimmt, Rot noch nicht!"],
    zwilling:         ["Hier ist eine ähnliche Aufgabe. Ihr schafft das!"],
    torBereit:        ["Alle Gehege sind geschafft! Stellt den Code am Zootor ein."]
  },

  // -------------------------------------------------------------------
  // ZOO-KARTE (Entdecker-Modus)  ·  gehört zur Datei welt/karte.js
  // Die Karte ersetzt die Übersicht mit den Kacheln. Die Kinder tippen
  // auf die Karte und die Spielfigur läuft hin.
  //
  // So lest ihr die Zahlen:
  //   x = wie weit nach rechts (0 = ganz links, 1600 = ganz rechts)
  //   y = wie weit nach unten  (0 = ganz oben,  1000 = ganz unten)
  // Größere Zahl bei x: weiter rechts. Größere Zahl bei y: weiter unten.
  // Bitte kleine Schritte (z. B. 50) ändern und danach im Browser ansehen.
  // Häuser brauchen Platz: etwa 300 breit und 200 hoch. Der Punkt x/y
  // liegt in der Mitte des Hauses, die Tür ist unten in der Mitte.
  // -------------------------------------------------------------------
  karte: {
    groesse: { b: 1600, h: 1000 },          // Größe der ganzen Karte. Klein lassen: kurze Wege!
    start:   { x: 800, y: 860 },            // hier steht die Spielfigur am Anfang (vor dem Zootor)

    // Die vier Gehege. Reihenfolge = Reihenfolge der Räume oben (Affenhaus zuerst).
    // „schild“ ist der Text auf dem Schild über dem Haus.
    gehege: [
      { x: 300,  y: 300, schild: "Affenhaus" },
      { x: 1300, y: 300, schild: "Pinguinbecken" },
      { x: 300,  y: 700, schild: "Reptilienhaus" },
      { x: 1300, y: 700, schild: "Elefantenhaus" }
    ],

    raubtierhaus: { x: 800, y: 200, schild: "Raubtierhaus" },   // nur Kulisse mit schlafendem Löwen
    tor:          { x: 800, y: 950 },                           // das Zootor unten in der Mauer
    brunnen:      { x: 800, y: 600 },                           // Brunnen in der Mitte (Schmuck)

    // Figuren auf der Karte: höchstens 5. Keine hält auf, Antippen ist freiwillig.
    //   art: "polly"      = fliegt der Spielfigur hinterher (braucht keinen Ort)
    //   art: "waerterin"  = zeigt beim Antippen die Regelkarte des nächsten Geheges
    //   art: "waechter"   = dreht langsam seine „runde“ (Liste von Punkten [x, y]) und warnt, wenn die Zeit knapp wird
    //   art: "tier"       = zeigt beim Antippen ein Wort aus der Wörterhilfe („emoji“ = Bild, „name“ = für Vorleseprogramme).
    //                       „trick“ = was das Tier dabei macht:
    //                       "drehen" (wackelt mit dem Kopf), "rollen" (rollt einmal herum) oder "huepfen".
    figuren: [
      { art: "polly" },
      { art: "waerterin", name: "Zoowärterin",  x: 690,  y: 500 },
      { art: "waechter",  name: "Nachtwächter", runde: [[900, 480], [1120, 480], [1120, 700], [900, 700]] },
      { art: "tier", emoji: "🦉", name: "Eule", trick: "drehen", x: 540,  y: 715 },
      { art: "tier", emoji: "🦔", name: "Igel", trick: "rollen", x: 1080, y: 880 }
    ],

    // Orte, an denen Polly einmal pro Mission etwas sagt, wenn die Spielfigur in die Nähe kommt.
    // radius = wie nah man sein muss. Neue Zeile kopieren, Zahlen und Text ändern.
    orte: [
      { x: 800, y: 600, radius: 150, text: "Schaut mal, der Mond schwimmt im Brunnen!" },
      { x: 800, y: 300, radius: 130, text: "Psst, ganz leise am Raubtierhaus!" },
      { x: 150, y: 520, radius: 120, text: "Huch, ist das dunkel hier hinten!" }
    ],

    // Texte der Karte. {name} wird automatisch durch den Namen des Geheges ersetzt.
    texte: {
      gesperrt:        "Dieses Gehege ist noch zu. Schafft zuerst das Gehege mit dem Pfeil!",
      schonGeschafft:  "Hier habt ihr die Ziffer schon gefunden. Weiter geht's!",
      torZu:           "Erst alle vier Gehege schaffen!",
      loewe:           "Psst! Der Löwe schläft. Er wacht erst auf, wenn ihr ein Gehege geschafft habt.",
      jubel:           "Kraaah! Eine neue Ziffer!",
      tipp:            "Als Nächstes: {name}! Folgt dem gelben Pfeil.",
      tippTor:         "Alle Ziffern gefunden! Lauft zum Zootor.",
      regelTitel:      "Regel für: {name}",
      keineRegel:      "Für dieses Gehege gibt es keine Regelkarte.",
      waerterinFertig: "Alles geschafft! Jetzt schnell zum Zootor.",
      waechter:        "Beeilt euch!",

      // Steht hier eine Liste [ "…", "…" ], wird jedes Mal ein Satz ausgewählt.
      waechterRuf:     ["Wer ist da?", "Halt! … Ach, ihr seid es.", "Nanu? Schon so spät!"],   // wenn sein Licht die Spielfigur trifft
      loeweSchnarcht:  ["Chrrr … chrrr …", "Chrrr … *blinzel* … chrrr", "Grrr-mpf … zzz"],     // nacheinander, wenn man den Löwen antippt
      pollyGeschafft:  ["Kraaah! Die erste Ziffer!", "Halbzeit! Zwei Ziffern!", "Nur noch ein Gehege!", "Alle vier! Auf zum Zootor!"],   // nach dem 1., 2., 3., 4. Gehege
      pollyWarten:     ["Kommt, weiter geht's: {name}!", "Wo bleibt ihr? Ich fliege schon mal vor!"],   // wenn 20 Sekunden nichts passiert
      pollyZurueck:    ["Nicht aufgeben! Gleich noch einmal.", "Kurze Pause? Dann wieder rein!"]          // wenn man ein Gehege verlässt, ohne es zu schaffen
    }
  }
};

// =====================================================================
// 2) DIE THEMEN (laut „Themenuebersicht“, Red Line 1)
//    id = Klasse-Grammatiknummer, regel = Text der Hilfekarte (kann leer sein)
// =====================================================================
K5.themen = [
  { id: "5-G1",  klasse: 5, unit: 1, titel: "Besitzangaben mit ’s", regel: "Ein Besitzer: ’s anhängen → Tom’s bike, my sister’s cat. Mehrere Besitzer, deren Wort schon auf -s endet: nur ’ → my parents’ house, my brothers’ room." },
  { id: "5-G2",  klasse: 5, unit: 1, titel: "Das Verb „to be“", regel: "I → am (I’m). He, she, it und eine Person → is (he’s). You, we, they und mehrere Personen → are (we’re)." },
  { id: "5-G3",  klasse: 5, unit: 1, titel: "Der Plural", regel: "Meist + s (cats). Nach s, x, sh, ch + es (dresses). Konsonant + y → ies (babies), aber Vokal + y → nur s (days). Viele Wörter auf -f → ves (shelves)." },
  { id: "5-G4",  klasse: 5, unit: 1, titel: "Fragen mit „to be“", regel: "In Fragen steht am/is/are vorne: Is Tom at home? Are you ready? Kurzantworten: Yes, he is. / No, he isn’t. / No, I’m not." },
  { id: "5-G5",  klasse: 5, unit: 2, titel: "Der Artikel: a, an und the", regel: "a vor Konsonanten-Laut (a red bag, a uniform), an vor Vokal-Laut (an orange bag, an e-mail). the, wenn klar ist, welches Ding gemeint ist (the board)." },
  { id: "5-G6",  klasse: 5, unit: 2, titel: "Der Imperativ", regel: "Befehl: Grundform des Verbs am Anfang → Open the window. Verbot: Don’t + Grundform → Don’t talk." },
  { id: "5-G7",  klasse: 5, unit: 2, titel: "Die Verneinung von „to be“", regel: "I’m not / I am not. He, she, it und eine Person → isn’t. You, we, they und mehrere Personen → aren’t." },
  { id: "5-G8",  klasse: 5, unit: 3, titel: "Die einfache Gegenwart: Aussagen",
    regel: "Bei he, she, it (und Namen wie Tom) bekommt das Verb ein -s: Tom plays. Nach -sh, -ch, -o hängst du -es an: watches, goes. Ausnahme: have → has. Bei I, you, we, they bleibt das Verb ohne -s: We play." },
  { id: "5-G9",  klasse: 5, unit: 3, titel: "Die einfache Gegenwart: Verneinung",
    regel: "I, you, we, they → don't + Verb: We don't play. He, she, it → doesn't + Verb OHNE -s: She doesn't play. Lange Form: do not / does not." },
  { id: "5-G10", klasse: 5, unit: 3, titel: "Die einfache Gegenwart: Fragen",
    regel: "Fragen mit I, you, we, they: Do + Person + Verb? → Do you play? Fragen mit he, she, it: Does + Person + Verb OHNE -s? → Does Tom play?" },
  { id: "5-G11", klasse: 5, unit: 4, titel: "Personalpronomen und Possessivbegleiter",
    regel: "Nach einem Verb und nach for, with, of: me, you, him, her, it, us, them → I know her. Wem gehört es? my, your, his, her, its, our, their → Lucy has a hat. Her hat is new." },
  { id: "5-G12", klasse: 5, unit: 4, titel: "Die Wortstellung im Satz",
    regel: "Reihenfolge: Subjekt – Verb – Objekt → Lucy likes cats. always, often, sometimes, never stehen VOR dem Verb → Lucy often sings. Aber NACH am, is, are → Lucy is always at home." },
  { id: "5-G13", klasse: 5, unit: 5, titel: "Die einfache Vergangenheit: Aussagen",
    regel: "Regelmäßig: Verb + -ed (walk → walked). Endet das Verb auf -e, nur -d (like → liked). Kurzer Vokal + Konsonant: verdoppeln (plan → planned). Unregelmäßige Formen lernen: go → went, see → saw, have → had, buy → bought … Die Form ist bei allen Personen gleich." },
  { id: "5-G14", klasse: 5, unit: 5, titel: "Die einfache Vergangenheit: Fragen",
    regel: "Did + Person + Grundform (ohne -ed)? → Did Lucy like the film? Kurzantworten: Yes, she did. / No, she didn’t." },
  { id: "5-G15", klasse: 5, unit: 6, titel: "Modale Hilfsverben: can/can’t, must und needn’t",
    regel: "can = kann, can’t = kann nicht. must = muss. needn’t = muss nicht, braucht nicht. Danach steht immer die Grundform ohne to → Lucy can sing. You needn’t run." },
  { id: "5-G16", klasse: 5, unit: 6, titel: "Die einfache Vergangenheit von „to be“",
    regel: "I, he, she, it → was. You, we, they → were. Verneinung: wasn’t / weren’t. Fragen: Was Lucy …? Were you …? Kurzantworten: Yes, I was. / No, they weren’t." },
  { id: "5-G17", klasse: 5, unit: 6, titel: "Die einfache Vergangenheit: Verneinung",
    regel: "didn’t + Grundform → Lucy didn’t walk. Nach didn’t steht NIE die Vergangenheitsform (nicht: didn’t walked, didn’t went)." }
];

// =====================================================================
// 3) DER SATZBAUKASTEN (Generator)
//    Aus diesen Wortlisten baut das Spiel automatisch viele Aufgaben.
//    Nur Wörter eintragen, die bis zur jeweiligen Unit bekannt sind!
//    Ein Baukasten pro Unit ("5-U1" = Klasse 5, Unit 1). Welche Listen
//    ein Baukasten braucht, hängt von der „art“ in GENERATOREN ab (siehe unten).
//    Listen mit „Extra“ am Ende (z. B. nomenExtra) enthalten ERSCHLIESSBARE Wörter
//    (Internationalismen wie banana, hotel). Sie werden nur benutzt, wenn
//    EINSTELLUNGEN.internationalismenAktiv = true ist. Ihre deutsche Bedeutung
//    steht in der WOERTERHILFE (Abschnitt 4).
// =====================================================================
K5.baukasten = {
  // ---------- Klasse 5, Unit 1 (Wortschatz nur aus Unit 1) ----------
  "5-U1": {
    // Personen für „to be“: be = am/is/are, pron = Pronomen für Kurzantworten, kind = passt zu Altersangaben (eleven)
    personen: [
      { text: "I",            be: "am",  pron: "I",    kind: true  }, { text: "you",          be: "are", pron: "you",  kind: true },
      { text: "he",           be: "is",  pron: "he",   kind: true  }, { text: "she",          be: "is",  pron: "she",  kind: true },
      { text: "we",           be: "are", pron: "we",   kind: true  }, { text: "they",         be: "are", pron: "they", kind: true },
      { text: "Tom",          be: "is",  pron: "he",   kind: true  }, { text: "Emma",         be: "is",  pron: "she",  kind: true },
      { text: "Sam",          be: "is",  pron: "he",   kind: true  }, { text: "Lily",         be: "is",  pron: "she",  kind: true },
      { text: "my sister",    be: "is",  pron: "she",  kind: true  }, { text: "my brother",   be: "is",  pron: "he",   kind: true },
      { text: "my dad",       be: "is",  pron: "he",   kind: false }, { text: "my mum",       be: "is",  pron: "she",  kind: false },
      { text: "my parents",   be: "are", pron: "they", kind: false }, { text: "my friends",   be: "are", pron: "they", kind: true },
      { text: "Tom and Emma", be: "are", pron: "they", kind: true  }, { text: "Ben",          be: "is",  pron: "he",   kind: true },
      { text: "Mia",          be: "is",  pron: "she",  kind: true  }, { text: "Ali",          be: "is",  pron: "he",   kind: true },
      { text: "Lena",         be: "is",  pron: "she",  kind: true  }, { text: "Sam and Lily", be: "are", pron: "they", kind: true }
    ],
    // Dinge und Tiere als Satzanfang (be = is/are, pron = it/they für Kurzantworten)
    dingSubjekte: [
      { text: "the cat", be: "is", pron: "it" }, { text: "the dog", be: "is", pron: "it" }, { text: "the guinea pig", be: "is", pron: "it" },
      { text: "the book", be: "is", pron: "it" }, { text: "my mobile", be: "is", pron: "it" }, { text: "the alarm clock", be: "is", pron: "it" },
      { text: "my cap", be: "is", pron: "it" }, { text: "my T-shirt", be: "is", pron: "it" }, { text: "the box", be: "is", pron: "it" },
      { text: "my shoes", be: "are", pron: "they" }, { text: "my books", be: "are", pron: "they" }, { text: "the cats", be: "are", pron: "they" },
      { text: "my trainers", be: "are", pron: "they" }, { text: "the posters", be: "are", pron: "they" }, { text: "my scarves", be: "are", pron: "they" }
    ],
    dingSubjekteExtra: [
      { text: "the ball", be: "is", pron: "it" }, { text: "the banana", be: "is", pron: "it" }, { text: "the radio", be: "is", pron: "it" },
      { text: "the hamster", be: "is", pron: "it" }, { text: "the balls", be: "are", pron: "they" }, { text: "the bananas", be: "are", pron: "they" }
    ],
    // Ortsangaben für Dinge und Tiere
    orte: ["under the bed", "on the table", "in the box", "next to the lamp", "in the wardrobe", "on the shelf", "on the chair",
           "in the garden", "in the tree house", "under the table", "on the carpet", "next to the door", "in the kitchen", "in my bedroom"],
    orteExtra: ["on the sofa", "next to the radio"],
    // Satzenden nach am/is/are; nurKind: true = nur für Kinder (Altersangaben)
    ergaenzungen: [
      { text: "from England" }, { text: "from Germany" }, { text: "at home" }, { text: "in the garden" },
      { text: "in the kitchen" }, { text: "in the park" }, { text: "cool" }, { text: "nice" }, { text: "crazy" },
      { text: "funny" }, { text: "busy" }, { text: "ready" }, { text: "eleven", nurKind: true }, { text: "twelve", nurKind: true },
      { text: "in the bathroom" }, { text: "in the living room" }, { text: "in the tree house" }, { text: "new here" }
    ],
    // Besitzer für ’s / ’ (plural: true = mehrere Besitzer, Wort endet auf -s)
    besitzer: [
      { text: "Tom" }, { text: "Emma" }, { text: "Sam" }, { text: "Lily" }, { text: "Ben" }, { text: "Mia" }, { text: "Ali" }, { text: "Lena" },
      { text: "my sister" }, { text: "my brother" }, { text: "my dad" }, { text: "my mum" }, { text: "my aunt" },
      { text: "my uncle" }, { text: "my cousin" }, { text: "my friend" },
      { text: "my parents", plural: true }, { text: "my two brothers", plural: true },
      { text: "my two sisters", plural: true }, { text: "my two cousins", plural: true }
    ],
    dinge:  ["bike", "cat", "dog", "guinea pig", "room", "bedroom", "house", "tree house", "cap", "hat", "T-shirt", "poster",
             "computer", "mobile", "lamp", "bed", "wardrobe", "book", "chair", "shirt", "skirt", "dress", "alarm clock", "photo"],
    dingeExtra: ["ball", "radio", "hamster", "sofa", "pony", "video"],
    // Orte für Sätze wie „Tom's cat is in the garden.“
    besitzOrte: ["in the garden", "in the kitchen", "under the bed", "on the table", "in the tree house", "next to the door"],
    farben: ["red", "green", "blue", "yellow", "black", "grey", "brown", "white", "orange", "purple", "pink"],
    // Plural: regel = s, es (nach s, x, sh, ch), ies (Konsonant + y), ys (Vokal + y), ves (f → ves), os (o → os)
    nomen: [
      { sg: "bat", pl: "bats", regel: "s" }, { sg: "shoe", pl: "shoes", regel: "s" }, { sg: "hat", pl: "hats", regel: "s" },
      { sg: "shirt", pl: "shirts", regel: "s" }, { sg: "skirt", pl: "skirts", regel: "s" }, { sg: "cap", pl: "caps", regel: "s" },
      { sg: "park", pl: "parks", regel: "s" }, { sg: "dog", pl: "dogs", regel: "s" }, { sg: "bike", pl: "bikes", regel: "s" },
      { sg: "pet", pl: "pets", regel: "s" }, { sg: "cat", pl: "cats", regel: "s" }, { sg: "sister", pl: "sisters", regel: "s" },
      { sg: "brother", pl: "brothers", regel: "s" }, { sg: "table", pl: "tables", regel: "s" }, { sg: "chair", pl: "chairs", regel: "s" },
      { sg: "poster", pl: "posters", regel: "s" }, { sg: "book", pl: "books", regel: "s" }, { sg: "bed", pl: "beds", regel: "s" },
      { sg: "trainer", pl: "trainers", regel: "s" }, { sg: "lamp", pl: "lamps", regel: "s" }, { sg: "room", pl: "rooms", regel: "s" },
      { sg: "tree", pl: "trees", regel: "s" }, { sg: "window", pl: "windows", regel: "s" }, { sg: "door", pl: "doors", regel: "s" },
      { sg: "friend", pl: "friends", regel: "s" }, { sg: "game", pl: "games", regel: "s" }, { sg: "animal", pl: "animals", regel: "s" },
      { sg: "computer", pl: "computers", regel: "s" }, { sg: "T-shirt", pl: "T-shirts", regel: "s" }, { sg: "garden", pl: "gardens", regel: "s" },
      { sg: "dress", pl: "dresses", regel: "es" }, { sg: "box", pl: "boxes", regel: "es" }, { sg: "bus", pl: "buses", regel: "es" },
      { sg: "family", pl: "families", regel: "ies" }, { sg: "boy", pl: "boys", regel: "ys" },
      { sg: "shelf", pl: "shelves", regel: "ves" }, { sg: "scarf", pl: "scarves", regel: "ves" }, { sg: "photo", pl: "photos", regel: "os" }
    ],
    nomenExtra: [
      { sg: "ball", pl: "balls", regel: "s" }, { sg: "hand", pl: "hands", regel: "s" }, { sg: "film", pl: "films", regel: "s" },
      { sg: "hamster", pl: "hamsters", regel: "s" }, { sg: "elephant", pl: "elephants", regel: "s" }, { sg: "tiger", pl: "tigers", regel: "s" },
      { sg: "zebra", pl: "zebras", regel: "s" }, { sg: "giraffe", pl: "giraffes", regel: "s" }, { sg: "kangaroo", pl: "kangaroos", regel: "s" },
      { sg: "hotel", pl: "hotels", regel: "s" }, { sg: "sofa", pl: "sofas", regel: "s" }, { sg: "taxi", pl: "taxis", regel: "s" },
      { sg: "banana", pl: "bananas", regel: "s" }, { sg: "pizza", pl: "pizzas", regel: "s" },
      { sg: "radio", pl: "radios", regel: "os" }, { sg: "video", pl: "videos", regel: "os" },
      { sg: "baby", pl: "babies", regel: "ies" }, { sg: "hobby", pl: "hobbies", regel: "ies" }, { sg: "party", pl: "parties", regel: "ies" },
      { sg: "pony", pl: "ponies", regel: "ies" }, { sg: "cowboy", pl: "cowboys", regel: "ys" },
      { sg: "glass", pl: "glasses", regel: "es" }, { sg: "class", pl: "classes", regel: "es" }, { sg: "sandwich", pl: "sandwiches", regel: "es" },
      { sg: "wolf", pl: "wolves", regel: "ves" }, { sg: "tomato", pl: "tomatoes", regel: "oes" }
    ],
    // Beispiele für die Erklärung, falls es nur EIN Wort mit dieser Regel gibt (dürfen bekannte Lehnwörter sein)
    pluralBeispiele: { ies: "baby → babies", ys: "day → days", os: "video → videos", oes: "potato → potatoes" },
    erklaerungen: {
      besitz: {
        einzahl:  "Ein Besitzer: Du hängst ’s an (Name oder Wort). Beispiel: {BEISPIEL}",
        mehrzahl: "Mehrere Besitzer und das Wort endet schon auf -s: Dann kommt nur ein Apostroph ’ dahinter. Beispiel: {BEISPIEL}",
        zuordnen: "Ein Besitzer → ’s. Mehrere Besitzer, deren Wort schon auf -s endet → nur ’."
      },
      tobe: {
        am:  "Bei I steht immer am. Beispiel: {BEISPIEL}",
        is:  "Bei he, she, it und bei EINER Person (Tom, my sister) steht is. Beispiel: {BEISPIEL}",
        are: "Bei you, we, they und bei MEHREREN Personen (my parents) steht are. Beispiel: {BEISPIEL}",
        kurz: "Kurzformen: I am → I'm, you are → you're, he is → he's, she is → she's, we are → we're, they are → they're. Beispiel: {BEISPIEL}",
        zuordnen: "I → am. He, she, it und eine Person → is. You, we, they und mehrere Personen → are."
      },
      tobefrage: {
        frage:     "Bei Fragen steht am/is/are ganz vorne, vor der Person. Beispiel: {BEISPIEL}",
        kurzJa:    "Kurzantwort mit Ja: Yes + Pronomen + am/is/are. Beispiel: {BEISPIEL}",
        kurzNein:  "Kurzantwort mit Nein: No + Pronomen + not (I'm not, he isn't, they aren't). Beispiel: {BEISPIEL}",
        zuordnen:  "He, she, it und eine Person → Is …? You, they und mehrere Personen → Are …?"
      },
      plural: {
        s:   "Meistens hängst du einfach -s an. Beispiel: {BEISPIEL}",
        es:  "Nach s, x, sh und ch hängst du -es an. Beispiel: {BEISPIEL}",
        ies: "Konsonant + y: Das y wird zu -ies. Beispiel: {BEISPIEL}",
        ys:  "Vokal (a, e, o, u) + y: Du hängst nur -s an. Beispiel: {BEISPIEL}",
        ves: "Bei vielen Wörtern auf -f wird f zu -ves. Beispiel: {BEISPIEL}",
        os:  "Manche Wörter auf -o bekommen nur -s. Beispiel: {BEISPIEL}",
        oes: "Manche Wörter auf -o bekommen -es. Beispiel: {BEISPIEL}",
        zuordnen: "+ s: die meisten Wörter (auch Vokal + y, z. B. day → days). + es: nach s, x, sh, ch (und bei manchen Wörtern auf -o). y → ies: nach Konsonant + y. f → ves: viele Wörter auf -f."
      }
    }
  },

  // ---------- Klasse 5, Unit 2 (Wortschatz aus Unit 1 und 2) ----------
  "5-U2": {
    personen: [
      { text: "I",            be: "am",  pron: "I",    kind: true  }, { text: "you",          be: "are", pron: "you",  kind: true },
      { text: "he",           be: "is",  pron: "he",   kind: true  }, { text: "she",          be: "is",  pron: "she",  kind: true },
      { text: "we",           be: "are", pron: "we",   kind: true  }, { text: "they",         be: "are", pron: "they", kind: true },
      { text: "Tom",          be: "is",  pron: "he",   kind: true  }, { text: "Emma",         be: "is",  pron: "she",  kind: true },
      { text: "Sam",          be: "is",  pron: "he",   kind: true  }, { text: "Lily",         be: "is",  pron: "she",  kind: true },
      { text: "my sister",    be: "is",  pron: "she",  kind: true  }, { text: "my brother",   be: "is",  pron: "he",   kind: true },
      { text: "my dad",       be: "is",  pron: "he",   kind: false }, { text: "our teacher",  be: "is",  pron: "she",  kind: false },
      { text: "my parents",   be: "are", pron: "they", kind: false }, { text: "my friends",   be: "are", pron: "they", kind: true },
      { text: "Tom and Emma", be: "are", pron: "they", kind: true  }, { text: "Ben",          be: "is",  pron: "he",   kind: true },
      { text: "Mia",          be: "is",  pron: "she",  kind: true  }, { text: "my teachers",  be: "are", pron: "they", kind: false }
    ],
    dingSubjekte: [
      { text: "my ruler", be: "is", pron: "it" }, { text: "the pen", be: "is", pron: "it" }, { text: "my bag", be: "is", pron: "it" },
      { text: "my exercise book", be: "is", pron: "it" }, { text: "the calculator", be: "is", pron: "it" }, { text: "the glue", be: "is", pron: "it" },
      { text: "my pencils", be: "are", pron: "they" }, { text: "the felt-tips", be: "are", pron: "they" }, { text: "my books", be: "are", pron: "they" },
      { text: "the cat", be: "is", pron: "it" }, { text: "my shoes", be: "are", pron: "they" }
    ],
    dingSubjekteExtra: [ { text: "the banana", be: "is", pron: "it" }, { text: "my sandwich", be: "is", pron: "it" }, { text: "the balls", be: "are", pron: "they" } ],
    orte: ["in my bag", "in the pencil case", "on the table", "under the chair", "in the classroom", "next to the board", "in the cafeteria",
           "on the shelf", "under the bed", "in the playground"],
    ergaenzungen: [
      { text: "from England" }, { text: "at home" }, { text: "in the garden" }, { text: "ready" }, { text: "busy" },
      { text: "at school" }, { text: "in the classroom" }, { text: "in the cafeteria" }, { text: "in the playground" },
      { text: "good at Maths" }, { text: "good at English" }, { text: "at the talent show" }, { text: "twelve", nurKind: true },
      { text: "good at Art" }, { text: "good at Science" }, { text: "in the music room" }
    ],
    namen: ["Tom", "Emma", "Sam", "Lily", "Ben", "Mia", "Ali", "Lena"],
    // a/an: Es zählt der LAUT des nächsten Wortes
    artikelwoerter: [
      { text: "animal", art: "an" }, { text: "e-mail", art: "an" }, { text: "alarm clock", art: "an" }, { text: "eraser", art: "an" },
      { text: "exercise book", art: "an" }, { text: "orange cap", art: "an" }, { text: "orange pen", art: "an" },
      { text: "interesting book", art: "an" }, { text: "easy question", art: "an" }, { text: "English teacher", art: "an" },
      { text: "Indian restaurant", art: "an" }, { text: "Art lesson", art: "an" }, { text: "IT lesson", art: "an" },
      { text: "uniform", art: "a" }, { text: "red pen", art: "a" }, { text: "new bag", art: "a" }, { text: "pencil case", art: "a" },
      { text: "ruler", art: "a" }, { text: "boring lesson", art: "a" }, { text: "difficult question", art: "a" },
      { text: "German teacher", art: "a" }, { text: "Maths teacher", art: "a" }, { text: "funny joke", art: "a" },
      { text: "good singer", art: "a" }, { text: "computer", art: "a" }, { text: "cool cap", art: "a" },
      { text: "yellow eraser", art: "a" }, { text: "calculator", art: "a" },
      { text: "uncle", art: "an" }, { text: "aunt", art: "an" }, { text: "orange T-shirt", art: "an" },
      { text: "interesting e-mail", art: "an" }, { text: "Art teacher", art: "an" },
      { text: "new e-mail", art: "a" }, { text: "bike", art: "a" }, { text: "friend", art: "a" }, { text: "garden", art: "a" },
      { text: "school uniform", art: "a" }, { text: "German book", art: "a" }, { text: "red eraser", art: "a" }, { text: "favourite subject", art: "a" },
      { text: "History lesson", art: "a" }, { text: "PE lesson", art: "a" }
    ],
    artikelwoerterExtra: [
      { text: "apple", art: "an" }, { text: "elephant", art: "an" }, { text: "insect", art: "an" }, { text: "octopus", art: "an" },
      { text: "igloo", art: "an" },
      { text: "hotel", art: "a" }, { text: "banana", art: "a" }, { text: "pizza", art: "a" }, { text: "zebra", art: "a" },
      { text: "giraffe", art: "a" }, { text: "hamster", art: "a" }, { text: "sofa", art: "a" }, { text: "radio", art: "a" },
      { text: "ball", art: "a" }, { text: "pony", art: "a" }, { text: "sandwich", art: "a" }, { text: "taxi", art: "a" }
    ],
    // Befehle (Imperativ): grund = Grundform, rest = Rest des Satzes
    //   verbot: false = klingt als Verbot („Don't …“) unsinnig → nur als Befehl
    //   befehl: false = klingt nur als Verbot sinnvoll → nur mit „Don't …“
    befehle: [
      { grund: "open",   rest: "your exercise book" }, { grund: "open",  rest: "the window" },
      { grund: "close",  rest: "the door" },           { grund: "close", rest: "the window" },
      { grund: "sit",    rest: "down" },               { grund: "put",   rest: "your hands up" },
      { grund: "take",   rest: "out your pencil case" }, { grund: "talk", rest: "to your partner" },
      { grund: "listen", rest: "to the song", verbot: false },   { grund: "read",  rest: "the question", verbot: false },
      { grund: "write",  rest: "the answer", verbot: false },    { grund: "look",  rest: "at the board", verbot: false },
      { grund: "spell",  rest: "your name", verbot: false },     { grund: "sing",  rest: "the song", verbot: false },
      { grund: "draw",   rest: "a picture", verbot: false },
      { grund: "eat",    rest: "in the classroom", befehl: false }, { grund: "talk", rest: "in the lesson", befehl: false },
      { grund: "sit",    rest: "on the table", befehl: false },
      { grund: "come",   rest: "in" }, { grund: "look", rest: "at the photo" }, { grund: "play", rest: "football" }, { grund: "play", rest: "music" },
      { grund: "put",    rest: "your book in your bag" }, { grund: "take", rest: "out your ruler" }, { grund: "look", rest: "at me" },
      { grund: "open",   rest: "the door" },
      { grund: "meet",   rest: "my family", verbot: false }, { grund: "go", rest: "to the toilet", verbot: false },
      { grund: "do",     rest: "sport", verbot: false }, { grund: "do", rest: "experiments", verbot: false },
      { grund: "eat",    rest: "your lunch", verbot: false }, { grund: "show", rest: "me your exercise book", verbot: false },
      { grund: "find",   rest: "your pencil case", verbot: false }, { grund: "dance", rest: "with me", verbot: false },
      { grund: "play",   rest: "football in the classroom", befehl: false }, { grund: "eat", rest: "chewing gum in the lesson", befehl: false },
      { grund: "draw",   rest: "on the table", befehl: false }, { grund: "sing", rest: "in the cafeteria", befehl: false }
    ],
    befehleExtra: [
      { grund: "eat", rest: "your banana", verbot: false }, { grund: "look", rest: "at the elephant" }, { grund: "play", rest: "with the ball" },
      { grund: "drink", rest: "your cola in the classroom", befehl: false }
    ],
    erklaerungen: {
      tobeneg: {
        am:  "Bei I: I'm not oder I am not. Beispiel: {BEISPIEL}",
        is:  "Bei he, she, it und EINER Person: isn't (= is not). Beispiel: {BEISPIEL}",
        are: "Bei you, we, they und MEHREREN Personen: aren't (= are not). Beispiel: {BEISPIEL}",
        zuordnen: "I → am not. He, she, it und eine Person → isn't. You, we, they und mehrere Personen → aren't."
      },
      aan: {
        an: "Vor einem Vokal-LAUT (a, e, i, o, u gesprochen) steht an. Es zählt das Wort direkt dahinter. Beispiel: {BEISPIEL}",
        a:  "Vor einem Konsonanten-LAUT steht a. Es zählt das Wort direkt dahinter. Achtung: Wörter, die man mit „ju…“ ausspricht, bekommen auch a. Beispiel: {BEISPIEL}",
        zuordnen: "an vor einem Vokal-Laut (an apple), a vor einem Konsonanten-Laut (a ball). Es zählt das Wort direkt nach a/an!"
      },
      imperativ: {
        positiv: "Befehle beginnen mit der Grundform des Verbs – ohne Person, ohne -s. Beispiel: {BEISPIEL}",
        negativ: "Verbote beginnen mit Don't + Grundform. Beispiel: {BEISPIEL}"
      }
    }
  },

  // ---------- Klasse 5, Unit 3 ----------
  // er: true = Person steht für he/she/it (Verb bekommt -s); grund = Grundform, s = Form mit -s,
  // rest = Rest des Satzes, zeit = passende Zeitangaben (werden manchmal angehängt, dürfen leer [] sein)
  "5-U3": {
    personen: [
      { text: "I",          er: false }, { text: "you",        er: false },
      { text: "we",         er: false }, { text: "they",       er: false },
      { text: "my friends", er: false }, { text: "my parents", er: false },
      { text: "he",         er: true  }, { text: "she",        er: true  },
      { text: "Tom",        er: true  }, { text: "Emma",       er: true  },
      { text: "Sam",        er: true  }, { text: "Lily",       er: true  },
      { text: "my sister",  er: true  }, { text: "my brother", er: true  },
      { text: "Ben",        er: true  }, { text: "Mia",        er: true  },
      { text: "our zookeeper", er: true }, { text: "Tom and Emma", er: false }
    ],
    verben: [
      { grund: "play",  s: "plays",   rest: "football",          zeit: ["after school", "on Wednesdays"] },
      { grund: "play",  s: "plays",   rest: "basketball",        zeit: ["at the weekend", "after school"] },
      { grund: "play",  s: "plays",   rest: "computer games",    zeit: ["in the evening"] },
      { grund: "like",  s: "likes",   rest: "animals",           zeit: [] },
      { grund: "love",  s: "loves",   rest: "music",             zeit: [] },
      { grund: "watch", s: "watches", rest: "TV",                zeit: ["in the evening", "after school"] },
      { grund: "watch", s: "watches", rest: "movies",            zeit: ["at the weekend"] },
      { grund: "read",  s: "reads",   rest: "books",             zeit: ["in bed", "at the weekend"] },
      { grund: "go",    s: "goes",    rest: "to school",         zeit: ["every morning"] },
      { grund: "go",    s: "goes",    rest: "to the cinema",     zeit: ["at the weekend", "every month"] },
      { grund: "go",    s: "goes",    rest: "to bed",            zeit: ["at nine o'clock", "early"] },
      { grund: "live",  s: "lives",   rest: "in Germany",        zeit: [] },
      { grund: "have",  s: "has",     rest: "a cat",             zeit: [] },
      { grund: "have",  s: "has",     rest: "breakfast",         zeit: ["at seven o'clock", "every morning"] },
      { grund: "eat",   s: "eats",    rest: "bananas",           zeit: ["every day"] },
      { grund: "help",  s: "helps",   rest: "at home",           zeit: ["at the weekend"] },
      { grund: "ride",  s: "rides",   rest: "a bike",            zeit: ["after school", "every day"] },
      { grund: "get",   s: "gets",    rest: "up early",          zeit: ["every day"] },
      { grund: "feed",  s: "feeds",   rest: "the animals",       zeit: ["every morning"] },
      { grund: "clean", s: "cleans",  rest: "the cage",          zeit: ["on Wednesdays"] },
      { grund: "work",  s: "works",   rest: "at the zoo",        zeit: ["every day"] },
      { grund: "take",  s: "takes",   rest: "the dog for a walk", zeit: ["in the evening", "after school"] },
      { grund: "want",  s: "wants",   rest: "a pet",             zeit: [] },
      { grund: "run",   s: "runs",    rest: "in the park",       zeit: ["after school"] }
    ],
    verbenExtra: [
      { grund: "like",  s: "likes",   rest: "pizza",             zeit: [] },
      { grund: "play",  s: "plays",   rest: "with the ball",     zeit: ["in the garden"] }
    ],
    // {P} = Person, {BEISPIEL} = richtiger Beispielsatz, {GRUND}/{S} = Verbformen
    erklaerungen: {
      aussage: {
        er:       "„{P}“ steht für he, she oder it. Dann bekommt das Verb ein -s (bei -sh, -ch, -o: -es; have → has). Beispiel: {BEISPIEL}",
        nichtEr:  "Bei „{P}“ (I, you, we, they) bekommt das Verb kein -s. Beispiel: {BEISPIEL}",
        zuordnen: "He, she, it und Namen → Verb mit -s: {S}. I, you, we, they → ohne -s: {GRUND}."
      },
      verneinung: {
        er:       "Bei he, she, it verneinst du mit doesn't. Das Verb danach hat KEIN -s. Beispiel: {BEISPIEL}",
        nichtEr:  "Bei I, you, we, they verneinst du mit don't + Verb. Beispiel: {BEISPIEL}",
        zuordnen: "I, you, we, they → don't. He, she, it und Namen → doesn't."
      },
      frage: {
        er:       "Fragen mit he, she, it beginnen mit Does. Das Verb hat dann KEIN -s. Beispiel: {BEISPIEL}",
        nichtEr:  "Fragen mit I, you, we, they beginnen mit Do. Beispiel: {BEISPIEL}",
        zuordnen: "I, you, we, they → Do. He, she, it und Namen → Does."
      }
    }
  },

  // ---------- Klasse 5, Unit 4 ----------
  // bezug: Wer ist gemeint? sub = Subjektform, obj = Objektform, poss = Possessivbegleiter
  //        person: true = Mensch (für Sätze, die nur zu Menschen passen); nurPron: true = nicht bei „Use his/her …“
  // Satzrahmen: {X}/{x} = Bezugswort (groß/klein), {BE} = am/is/are, {HAT} = have/has, {D} = Ding, {F} = Farbe,
  //             {FAM} = Familienmitglied, {NAME} = Name, ___ = Lücke; fuer = für welche Subjektformen der Rahmen passt
  "5-U4": {
    bezug: [
      { text: "I",            sub: "I",    obj: "me",   poss: "my",    person: true, nurPron: true },
      { text: "you",          sub: "you",  obj: "you",  poss: "your",  person: true, nurPron: true },
      { text: "Tom",          sub: "he",   obj: "him",  poss: "his",   person: true },
      { text: "Ben",          sub: "he",   obj: "him",  poss: "his",   person: true },
      { text: "my brother",   sub: "he",   obj: "him",  poss: "his",   person: true },
      { text: "my dad",       sub: "he",   obj: "him",  poss: "his",   person: true },
      { text: "Emma",         sub: "she",  obj: "her",  poss: "her",   person: true },
      { text: "Lily",         sub: "she",  obj: "her",  poss: "her",   person: true },
      { text: "my sister",    sub: "she",  obj: "her",  poss: "her",   person: true },
      { text: "my mum",       sub: "she",  obj: "her",  poss: "her",   person: true },
      { text: "the cat",      sub: "it",   obj: "it",   poss: "its" },
      { text: "the dog",      sub: "it",   obj: "it",   poss: "its" },
      { text: "the parrot",   sub: "it",   obj: "it",   poss: "its" },
      { text: "Tom and I",    sub: "we",   obj: "us",   poss: "our",   person: true },
      { text: "my sister and I", sub: "we", obj: "us",  poss: "our",   person: true },
      { text: "my parents",   sub: "they", obj: "them", poss: "their", person: true },
      { text: "my friends",   sub: "they", obj: "them", poss: "their", person: true },
      { text: "Tom and Emma", sub: "they", obj: "them", poss: "their", person: true },
      { text: "Sam",          sub: "he",   obj: "him",  poss: "his",   person: true },
      { text: "Mia",          sub: "she",  obj: "her",  poss: "her",   person: true },
      { text: "my grandfather", sub: "he", obj: "him",  poss: "his",   person: true },
      { text: "my grandmother", sub: "she", obj: "her", poss: "her",   person: true },
      { text: "the pig",      sub: "it",   obj: "it",   poss: "its" }
    ],
    // erschließbare Wörter (nur wenn internationalismenAktiv)
    bezugExtra: [
      { text: "the hamster",  sub: "it",   obj: "it",   poss: "its" },
      { text: "the pony",     sub: "it",   obj: "it",   poss: "its" }
    ],
    objRahmen: [
      { text: "{X} {BE} in the garden. Please take a photo of ___.", fuer: ["he", "she", "it", "we", "they"] },
      { text: "{X} {HAT} a party today. This cake is for ___.",      fuer: ["he", "she", "we", "they"], nurPerson: true },
      { text: "Where {BE} {x}? I can't find ___.",                   fuer: ["he", "she", "it", "they"] },
      { text: "I like {x}. I often play with ___.",                  fuer: ["he", "she", "it", "they"] },
      { text: "I can't find my pen. Can you help ___?",              fuer: ["I"] },
      { text: "Hi {NAME}! This card is for ___.",                    fuer: ["you"] },
      { text: "{X} {BE} in the kitchen. Can you give this cake to ___?", fuer: ["he", "she", "we", "they"], nurPerson: true },
      { text: "{X} {BE} at the door. Please open the door for ___.",  fuer: ["he", "she", "it", "we", "they"] },
      { text: "Where {BE} {x}? I want to talk to ___.",               fuer: ["he", "she", "they"], nurPerson: true },
      { text: "{X} {BE} very nice. I often sit next to ___ at school.", fuer: ["he", "she", "they"], nurPerson: true },
      { text: "Mum, please give the ball to ___! I want to play.",    fuer: ["I"] },
      { text: "{NAME}, I have a present for ___!",                    fuer: ["you"] },
      { text: "{NAME}, can I sit next to ___?",                       fuer: ["you"] }
    ],
    possRahmen: [
      { text: "{X} {HAT} a {D}. ___ {D} is {F}.",       fuer: ["I", "you", "he", "she", "it", "we", "they"] },
      { text: "{X} {BE} at home. ___ {FAM} is there too.", fuer: ["I", "you", "he", "she", "we", "they"], nurPerson: true },
      { text: "{X} {BE} in ___ room.",                  fuer: ["I", "you", "he", "she", "we", "they"], nurPerson: true },
      { text: "{X} {HAT} a new {D}. ___ new {D} is {F}.", fuer: ["I", "you", "he", "she", "it", "we", "they"] },
      { text: "{X} {BE} with ___ {FAM}.",               fuer: ["I", "you", "he", "she", "we", "they"], nurPerson: true },
      { text: "{X} {BE} in ___ bed.",                   fuer: ["it"] }
    ],
    // für „Use him, her, it or them“: {x} wird durch das Bezugswort ersetzt
    objNomen: ["I like {x}.", "Please take a photo of {x}.", "This present is for {x}.", "Can you help {x}?", "I often play with {x}.",
               "Look at {x}!", "Please give the ball to {x}.", "I want to sit next to {x}.", "Please open the door for {x}."],
    dinge:     ["bike", "bag", "cap", "T-shirt", "computer", "pencil case", "bed", "ruler", "scarf", "hat"],
    dingeExtra: ["guitar", "camera", "jacket"],
    tierDinge: ["ball", "bed"],
    gemeinsameDinge: ["computer", "bike"],   // für we / they (gehört allen zusammen)
    gemeinsameDingeExtra: ["sofa", "camera"],
    farben:    ["red", "blue", "green", "yellow", "black", "white", "brown", "pink", "purple", "grey"],
    familie:   ["mum", "dad", "sister", "brother", "aunt", "uncle", "cousin", "grandmother", "grandfather"],
    namen:     ["Sam", "Mia", "Ben", "Lily"],

    // Wortstellung: Personen (er: true = he/she/it), Verben mit Rest des Satzes, Ergänzungen nach am/is/are
    personen: [
      { text: "I", er: false }, { text: "you", er: false }, { text: "we", er: false }, { text: "they", er: false },
      { text: "my friends", er: false }, { text: "my parents", er: false },
      { text: "he", er: true }, { text: "she", er: true }, { text: "Tom", er: true }, { text: "Emma", er: true },
      { text: "my sister", er: true }, { text: "my brother", er: true }, { text: "Ben", er: true }, { text: "Lily", er: true }
    ],
    wsVerben: [
      { grund: "play",   s: "plays",   rest: "football" },     { grund: "play",  s: "plays",   rest: "tennis" },
      { grund: "watch",  s: "watches", rest: "TV" },           { grund: "read",  s: "reads",   rest: "books" },
      { grund: "eat",    s: "eats",    rest: "pizza" },        { grund: "eat",   s: "eats",    rest: "chocolate" },
      { grund: "drink",  s: "drinks",  rest: "milk" },         { grund: "go",    s: "goes",    rest: "to bed early" },
      { grund: "help",   s: "helps",   rest: "at home" },      { grund: "wear",  s: "wears",   rest: "jeans" },
      { grund: "make",   s: "makes",   rest: "a cake" },       { grund: "ride",  s: "rides",   rest: "a bike" },
      { grund: "sing",   s: "sings",   rest: "songs" },        { grund: "have",  s: "has",     rest: "breakfast" },
      { grund: "take",   s: "takes",   rest: "the dog for a walk" }, { grund: "forget", s: "forgets", rest: "birthdays" },
      { grund: "go",     s: "goes",    rest: "to the cinema" },
      { grund: "play",   s: "plays",   rest: "computer games" }, { grund: "go",    s: "goes",    rest: "shopping" },
      { grund: "have",   s: "has",     rest: "lunch at school" }, { grund: "read", s: "reads",   rest: "stories" },
      { grund: "give",   s: "gives",   rest: "presents" },       { grund: "walk",  s: "walks",   rest: "to school" }
    ],
    wsVerbenExtra: [
      { grund: "play",   s: "plays",   rest: "the guitar" },     { grund: "eat",   s: "eats",    rest: "spaghetti" },
      { grund: "drink",  s: "drinks",  rest: "cola" },           { grund: "watch", s: "watches", rest: "videos" }
    ],
    wsBe: ["at home", "busy", "ready", "at school", "in the garden", "scared", "nice", "funny", "at the zoo", "in the kitchen"],
    adverbien: ["always", "often", "sometimes", "never"],
    erklaerungen: {
      pronomen: {
        obj:      "Nach einem Verb und nach for, with, of steht die Objektform: I → me, you → you, he → him, she → her, it → it, we → us, they → them. Beispiel: {BEISPIEL}",
        poss:     "Wem gehört es? I → my, you → your, he → his, she → her, it → its, we → our, they → their. Beispiel: {BEISPIEL}",
        zuordnen: "Junge/Mann → him / his. Mädchen/Frau → her / her. Tier oder Ding → it / its. Mehrere → them / their."
      },
      wortstellung: {
        verb:     "always, often, sometimes und never stehen VOR dem Verb. Beispiel: {BEISPIEL}",
        be:       "Bei am, is, are steht das Häufigkeitswort DAHINTER. Beispiel: {BEISPIEL}",
        zuordnen: "Die Reihenfolge ist Subjekt – Verb – Objekt. Häufigkeitswörter (always, often, sometimes, never) stehen vor dem Verb, aber nach am, is, are."
      }
    }
  },

  // ---------- Klasse 5, Unit 5 ----------
  // poss = passender Possessivbegleiter (für {POSS}), pron = Personalpronomen (für Kurzantworten)
  // grund / s / past = Verbformen; unreg: true = unregelmäßig; falsch = typische falsche Formen (für „Fehler finden“)
  // nurKind: true = passt nur zu Kindern (Hausaufgaben, Schule); einzeln: true = nicht bei mehreren Personen (broke his arm)
  // zeit = passende Zeitangaben (fehlt sie, werden die zeitenPast genommen)
  "5-U5": {
    personen: [
      { text: "I",          er: false, poss: "my",    pron: "I",    kind: true }, { text: "you",        er: false, poss: "your",  pron: "you",  kind: true },
      { text: "we",         er: false, poss: "our",   pron: "we",   kind: true }, { text: "they",       er: false, poss: "their", pron: "they", kind: true },
      { text: "my parents", er: false, poss: "their", pron: "they" },             { text: "my friends", er: false, poss: "their", pron: "they", kind: true },
      { text: "Tom and Emma", er: false, poss: "their", pron: "they", kind: true },
      { text: "he",         er: true,  poss: "his",   pron: "he",   kind: true }, { text: "she",        er: true,  poss: "her",   pron: "she",  kind: true },
      { text: "Tom",        er: true,  poss: "his",   pron: "he",   kind: true }, { text: "Emma",       er: true,  poss: "her",   pron: "she",  kind: true },
      { text: "Ben",        er: true,  poss: "his",   pron: "he",   kind: true }, { text: "Lily",       er: true,  poss: "her",   pron: "she",  kind: true },
      { text: "my brother", er: true,  poss: "his",   pron: "he",   kind: true }, { text: "my sister",  er: true,  poss: "her",   pron: "she",  kind: true }
    ],
    verbenPast: [
      { grund: "play",   s: "plays",    past: "played",   rest: "football" },
      { grund: "play",   s: "plays",    past: "played",   rest: "tennis" },
      { grund: "watch",  s: "watches",  past: "watched",  rest: "a film" },
      { grund: "help",   s: "helps",    past: "helped",   rest: "{POSS} mum", nurKind: true },
      { grund: "clean",  s: "cleans",   past: "cleaned",  rest: "{POSS} room" },
      { grund: "walk",   s: "walks",    past: "walked",   rest: "to school", nurKind: true, zeit: ["yesterday", "last week", "last month"] },
      { grund: "talk",   s: "talks",    past: "talked",   rest: "to {POSS} teacher", nurKind: true, zeit: ["yesterday", "last week"] },
      { grund: "dance",  s: "dances",   past: "danced",   rest: "at the party", zeit: ["yesterday", "last Saturday", "last night"] },
      { grund: "listen", s: "listens",  past: "listened", rest: "to music" },
      { grund: "plan",   s: "plans",    past: "planned",  rest: "a party", falsch: ["planed"] },
      { grund: "invite", s: "invites",  past: "invited",  rest: "{POSS} grandmother" },
      { grund: "ask",    s: "asks",     past: "asked",    rest: "a question" },
      { grund: "celebrate", s: "celebrates", past: "celebrated", rest: "Christmas", zeit: ["last year"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "to the cinema", unreg: true, falsch: ["goed"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "to the seaside", unreg: true, falsch: ["goed"], zeit: ["last week", "last month", "last Saturday"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "shopping", unreg: true, falsch: ["goed"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a shark", unreg: true, zeit: ["last week", "last month", "yesterday"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a ship", unreg: true },
      { grund: "have",   s: "has",      past: "had",      rest: "pizza", unreg: true, falsch: ["haved"] },
      { grund: "have",   s: "has",      past: "had",      rest: "a picnic", unreg: true, falsch: ["haved"] },
      { grund: "buy",    s: "buys",     past: "bought",   rest: "new trainers", unreg: true, falsch: ["buyed"] },
      { grund: "win",    s: "wins",     past: "won",      rest: "the game", unreg: true, falsch: ["winned"] },
      { grund: "do",     s: "does",     past: "did",      rest: "{POSS} homework", unreg: true, nurKind: true },
      { grund: "tell",   s: "tells",    past: "told",     rest: "a funny story", unreg: true, falsch: ["telled"] },
      { grund: "get",    s: "gets",     past: "got",      rest: "lost", unreg: true },
      { grund: "forget", s: "forgets",  past: "forgot",   rest: "{POSS} bag", unreg: true, einzeln: true },
      { grund: "send",   s: "sends",    past: "sent",     rest: "a postcard", unreg: true, falsch: ["sended"] },
      { grund: "send",   s: "sends",    past: "sent",     rest: "a photo", unreg: true, falsch: ["sended"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "to a party", unreg: true, falsch: ["goed"], zeit: ["last Saturday", "last week", "last night"] },
      { grund: "have",   s: "has",      past: "had",      rest: "lunch at school", unreg: true, falsch: ["haved"], nurKind: true, zeit: ["yesterday", "last week"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a lion", unreg: true },
      { grund: "tell",   s: "tells",    past: "told",     rest: "a joke", unreg: true, falsch: ["telled"] },
      { grund: "play",   s: "plays",    past: "played",   rest: "computer games" },
      { grund: "go",     s: "goes",     past: "went",     rest: "to the museum", unreg: true, falsch: ["goed"] },
      { grund: "walk",   s: "walks",    past: "walked",   rest: "to the station" }
    ],
    // erschließbare Wörter (nur wenn internationalismenAktiv)
    verbenPastExtra: [
      { grund: "play",   s: "plays",    past: "played",   rest: "the guitar" },
      { grund: "watch",  s: "watches",  past: "watched",  rest: "a video" },
      { grund: "listen", s: "listens",  past: "listened", rest: "to the radio" },
      { grund: "buy",    s: "buys",     past: "bought",   rest: "a camera", unreg: true, falsch: ["buyed"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a kangaroo", unreg: true },
      { grund: "have",   s: "has",      past: "had",      rest: "spaghetti", unreg: true, falsch: ["haved"] }
    ],
    zeitenPast: ["yesterday", "last week", "last Saturday", "last month", "last night"],
    erklaerungen: {
      pastaussage: {
        reg:      "In der Vergangenheit bekommt ein regelmäßiges Verb -ed (bei -e nur -d; plan → planned). Die Form ist bei allen Personen gleich. Beispiel: {BEISPIEL}",
        unreg:    "Dieses Verb ist unregelmäßig: Die Vergangenheitsform hat kein -ed, du musst sie lernen. Beispiel: {BEISPIEL}",
        zuordnen: "Regelmäßige Verben bekommen -ed (walk → walked). Unregelmäßige Verben haben eine eigene Form (go → went, see → saw)."
      },
      pastfrage: {
        frage:    "Fragen in der Vergangenheit: Did + Person + Grundform (ohne -ed). Beispiel: {BEISPIEL}",
        kurzJa:   "Kurzantwort mit Ja: Yes, + Person (I, he, she, we, they) + did. Beispiel: {BEISPIEL}",
        kurzNein: "Kurzantwort mit Nein: No, + Person (I, he, she, we, they) + didn't. Beispiel: {BEISPIEL}",
        zuordnen: "Richtig ist: Did + Person + Grundform. Nach Did steht nie die Vergangenheitsform und nie ein -s."
      },
    }
  },

  // ---------- Klasse 5, Unit 6 ----------
  // personen: be = am/is/are (daraus wird was/were), kind: true = passt auch zu Schul-Situationen
  "5-U6": {
    personen: [
      { text: "I",          er: false, be: "am",  poss: "my",    pron: "I",    kind: true }, { text: "you",        er: false, be: "are", poss: "your",  pron: "you",  kind: true },
      { text: "we",         er: false, be: "are", poss: "our",   pron: "we",   kind: true }, { text: "they",       er: false, be: "are", poss: "their", pron: "they", kind: true },
      { text: "my parents", er: false, be: "are", poss: "their", pron: "they" },             { text: "my friends", er: false, be: "are", poss: "their", pron: "they", kind: true },
      { text: "Tom and Emma", er: false, be: "are", poss: "their", pron: "they", kind: true },
      { text: "he",         er: true,  be: "is",  poss: "his",   pron: "he",   kind: true }, { text: "she",        er: true,  be: "is",  poss: "her",   pron: "she",  kind: true },
      { text: "Tom",        er: true,  be: "is",  poss: "his",   pron: "he",   kind: true }, { text: "Emma",       er: true,  be: "is",  poss: "her",   pron: "she",  kind: true },
      { text: "Ben",        er: true,  be: "is",  poss: "his",   pron: "he",   kind: true }, { text: "Lily",       er: true,  be: "is",  poss: "her",   pron: "she",  kind: true },
      { text: "my brother", er: true,  be: "is",  poss: "his",   pron: "he",   kind: true }, { text: "my sister",  er: true,  be: "is",  poss: "her",   pron: "she",  kind: true },
      { text: "my dad",     er: true,  be: "is",  poss: "his",   pron: "he" },               { text: "my mum",     er: true,  be: "is",  poss: "her",   pron: "she" }
    ],
    verbenPast: [
      { grund: "play",   s: "plays",    past: "played",   rest: "football" },
      { grund: "play",   s: "plays",    past: "played",   rest: "tennis" },
      { grund: "watch",  s: "watches",  past: "watched",  rest: "a film" },
      { grund: "help",   s: "helps",    past: "helped",   rest: "{POSS} mum", nurKind: true },
      { grund: "clean",  s: "cleans",   past: "cleaned",  rest: "{POSS} room" },
      { grund: "walk",   s: "walks",    past: "walked",   rest: "to school", nurKind: true, zeit: ["yesterday", "last week", "last month"] },
      { grund: "talk",   s: "talks",    past: "talked",   rest: "to {POSS} teacher", nurKind: true, zeit: ["yesterday", "last week"] },
      { grund: "dance",  s: "dances",   past: "danced",   rest: "at the party", zeit: ["yesterday", "last Saturday", "last night"] },
      { grund: "listen", s: "listens",  past: "listened", rest: "to music" },
      { grund: "plan",   s: "plans",    past: "planned",  rest: "a party", falsch: ["planed"] },
      { grund: "invite", s: "invites",  past: "invited",  rest: "{POSS} grandmother" },
      { grund: "ask",    s: "asks",     past: "asked",    rest: "a question" },
      { grund: "celebrate", s: "celebrates", past: "celebrated", rest: "Christmas", zeit: ["last year"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "to the cinema", unreg: true, falsch: ["goed"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "to the seaside", unreg: true, falsch: ["goed"], zeit: ["last week", "last month", "last Saturday"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "shopping", unreg: true, falsch: ["goed"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a shark", unreg: true, zeit: ["last week", "last month", "yesterday"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a ship", unreg: true },
      { grund: "have",   s: "has",      past: "had",      rest: "pizza", unreg: true, falsch: ["haved"] },
      { grund: "have",   s: "has",      past: "had",      rest: "a picnic", unreg: true, falsch: ["haved"] },
      { grund: "buy",    s: "buys",     past: "bought",   rest: "new trainers", unreg: true, falsch: ["buyed"] },
      { grund: "win",    s: "wins",     past: "won",      rest: "the game", unreg: true, falsch: ["winned"] },
      { grund: "do",     s: "does",     past: "did",      rest: "{POSS} homework", unreg: true, nurKind: true },
      { grund: "tell",   s: "tells",    past: "told",     rest: "a funny story", unreg: true, falsch: ["telled"] },
      { grund: "get",    s: "gets",     past: "got",      rest: "lost", unreg: true },
      { grund: "forget", s: "forgets",  past: "forgot",   rest: "{POSS} bag", unreg: true, einzeln: true },
      { grund: "send",   s: "sends",    past: "sent",     rest: "a postcard", unreg: true, falsch: ["sended"] },
      { grund: "send",   s: "sends",    past: "sent",     rest: "a photo", unreg: true, falsch: ["sended"] },
      { grund: "go",     s: "goes",     past: "went",     rest: "to a party", unreg: true, falsch: ["goed"], zeit: ["last Saturday", "last week", "last night"] },
      { grund: "have",   s: "has",      past: "had",      rest: "lunch at school", unreg: true, falsch: ["haved"], nurKind: true, zeit: ["yesterday", "last week"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a lion", unreg: true },
      { grund: "tell",   s: "tells",    past: "told",     rest: "a joke", unreg: true, falsch: ["telled"] },
      { grund: "play",   s: "plays",    past: "played",   rest: "computer games" },
      { grund: "go",     s: "goes",     past: "went",     rest: "to the museum", unreg: true, falsch: ["goed"] },
      { grund: "walk",   s: "walks",    past: "walked",   rest: "to the station" },
      { grund: "meet",   s: "meets",    past: "met",      rest: "{POSS} friends", unreg: true, falsch: ["meeted"], einzeln: true },
      { grund: "come",   s: "comes",    past: "came",     rest: "to the party", unreg: true, falsch: ["comed"], zeit: ["yesterday", "last Saturday", "last night"] },
      { grund: "feed",   s: "feeds",    past: "fed",      rest: "the chickens", unreg: true, falsch: ["feeded"] },
      { grund: "wear",   s: "wears",    past: "wore",     rest: "a helmet", unreg: true, falsch: ["weared"] },
      { grund: "break",  s: "breaks",   past: "broke",    rest: "{POSS} arm", unreg: true, einzeln: true, falsch: ["breaked"], zeit: ["last week", "last month", "last year"] },
      { grund: "hear",   s: "hears",    past: "heard",    rest: "a noise", unreg: true, falsch: ["heared"], zeit: ["last night", "yesterday"] },
      { grund: "eat",    s: "eats",     past: "ate",      rest: "a sandwich", unreg: true, falsch: ["eated"] },
      { grund: "fall",   s: "falls",    past: "fell",     rest: "into the river", unreg: true, falsch: ["falled"] },
      { grund: "say",    s: "says",     past: "said",     rest: "hello", unreg: true, falsch: ["sayed"] },
      { grund: "phone",  s: "phones",   past: "phoned",   rest: "{POSS} grandmother" },
      { grund: "arrive", s: "arrives",  past: "arrived",  rest: "at the farm" },
      { grund: "laugh",  s: "laughs",   past: "laughed",  rest: "a lot" },
      { grund: "stop",   s: "stops",    past: "stopped",  rest: "the tractor", falsch: ["stoped"] },
      { grund: "answer", s: "answers",  past: "answered", rest: "the question" }
    ],
    // erschließbare Wörter (nur wenn internationalismenAktiv)
    verbenPastExtra: [
      { grund: "play",   s: "plays",    past: "played",   rest: "the guitar" },
      { grund: "watch",  s: "watches",  past: "watched",  rest: "a video" },
      { grund: "listen", s: "listens",  past: "listened", rest: "to the radio" },
      { grund: "buy",    s: "buys",     past: "bought",   rest: "a camera", unreg: true, falsch: ["buyed"] },
      { grund: "see",    s: "sees",     past: "saw",      rest: "a kangaroo", unreg: true },
      { grund: "have",   s: "has",      past: "had",      rest: "spaghetti", unreg: true, falsch: ["haved"] },
      { grund: "eat",    s: "eats",     past: "ate",      rest: "a banana", unreg: true, falsch: ["eated"] },
      { grund: "feed",   s: "feeds",    past: "fed",      rest: "the zebras", unreg: true, falsch: ["feeded"] },
      { grund: "wear",   s: "wears",    past: "wore",     rest: "a jacket", unreg: true, falsch: ["weared"] }
    ],
    zeitenPast: ["yesterday", "last week", "last Saturday", "last month", "last night"],

    // can / can't: Tiere (wer = wer, rest = was, modal = richtige Antwort)
    tierFaehigkeiten: [
      { wer: "fish",      rest: "swim",       modal: "can" },   { wer: "fish",     rest: "walk", modal: "can't" },
      { wer: "penguins",  rest: "fly",        modal: "can't" }, { wer: "penguins", rest: "swim", modal: "can" },
      { wer: "birds",     rest: "fly",        modal: "can" },   { wer: "snakes",   rest: "walk", modal: "can't" },
      { wer: "parrots",   rest: "talk",       modal: "can" },   { wer: "elephants", rest: "fly", modal: "can't" },
      { wer: "horses",    rest: "run",        modal: "can" },   { wer: "cats",     rest: "read", modal: "can't" },
      { wer: "dogs",      rest: "talk",       modal: "can't" }, { wer: "giraffes", rest: "eat leaves", modal: "can" },
      { wer: "lions",     rest: "fly",        modal: "can't" }, { wer: "sheep",    rest: "fly",  modal: "can't" },
      { wer: "parrots",   rest: "fly",        modal: "can" },   { wer: "cats",     rest: "run",  modal: "can" },
      { wer: "horses",    rest: "fly",        modal: "can't" }, { wer: "fish",     rest: "talk", modal: "can't" },
      { wer: "monkeys",   rest: "read",       modal: "can't" }, { wer: "pigs",     rest: "fly",  modal: "can't" },
      { wer: "chickens",  rest: "talk",       modal: "can't" }, { wer: "penguins", rest: "walk", modal: "can" },
      { wer: "lions",     rest: "run",        modal: "can" },   { wer: "snakes",   rest: "sing", modal: "can't" }
    ],
    tierFaehigkeitenExtra: [
      { wer: "dolphins",  rest: "swim",       modal: "can" },   { wer: "crocodiles", rest: "swim", modal: "can" },
      { wer: "zebras",    rest: "fly",        modal: "can't" }, { wer: "kangaroos",  rest: "read", modal: "can't" },
      { wer: "gorillas",  rest: "talk",       modal: "can't" }, { wer: "tigers",     rest: "run",  modal: "can" },
      { wer: "hamsters",  rest: "fly",        modal: "can't" }, { wer: "pandas",     rest: "fly",  modal: "can't" }
    ],
    // can → can't (für „Make the sentence negative“)
    personFaehigkeiten: ["swim", "play tennis", "ride a horse", "ride a bike", "dance", "sing", "play the drums", "play chess", "play basketball", "play football"],
    personFaehigkeitenExtra: ["play the guitar", "ride a pony"],
    // must / needn't: vor = Situation, rest = was man (nicht) tun muss; nurKind: true = nur für Kinder (Schule …)
    situationen: [
      { vor: "It's Saturday.",          rest: "go to school",       modal: "needn't", nurKind: true },
      { vor: "It's Sunday.",            rest: "get up early",       modal: "needn't" },
      { vor: "It's sunny and warm.",    rest: "wear a coat",        modal: "needn't" },
      { vor: "It's cold and windy.",    rest: "wear a coat",        modal: "must" },
      { vor: "The kitchen is clean.",   rest: "clean the kitchen",  modal: "needn't" },
      { vor: "The kitchen is dirty.",   rest: "clean the kitchen",  modal: "must" },
      { vor: "It's dark.",              rest: "take a torch",       modal: "must" },
      { vor: "We have lots of bread.",  rest: "buy bread",          modal: "needn't" },
      { vor: "There's no milk.",        rest: "buy milk",           modal: "must" },
      { vor: "The dog is friendly.",    rest: "be scared",          modal: "needn't" },
      { vor: "The dog is hungry.",      rest: "feed the dog",       modal: "must" },
      { vor: "Be careful on the horse!", rest: "wear a helmet",     modal: "must" },
      { vor: "It's eight o'clock.",     rest: "go to school now",   modal: "must", nurKind: true },
      { vor: "The room is a mess.",     rest: "clean the room",     modal: "must" },
      { vor: "The cat is hungry.",      rest: "feed the cat",       modal: "must" },
      { vor: "The horses are hungry.",  rest: "feed the horses",    modal: "must" },
      { vor: "The bike is dirty.",      rest: "clean the bike",     modal: "must" },
      { vor: "The bike is clean.",      rest: "clean the bike",     modal: "needn't" },
      { vor: "We have lots of eggs.",   rest: "buy eggs",           modal: "needn't" },
      { vor: "Dinner is ready.",        rest: "come to the kitchen now", modal: "must" },
      { vor: "It's sunny.",             rest: "take a torch",       modal: "needn't" },
      { vor: "It's hot.",               rest: "wear a coat",        modal: "needn't" },
      { vor: "The snake is friendly.",  rest: "be scared",          modal: "needn't" }
    ],

    // was / were: Dinge mit Vorsatz (vor) und passenden Ergänzungen (erg)
    dingSubjekte: [
      { text: "the film",    be: "is",  vor: "We went to the cinema yesterday.",   erg: ["exciting", "boring", "funny", "awful"] },
      { text: "the waves",   be: "are", vor: "We went to the seaside last week.",  erg: ["big"] },
      { text: "the sea",     be: "is",  vor: "We went to the seaside last week.",  erg: ["cold"] },
      { text: "the museum",  be: "is",  vor: "We went to the museum last Saturday.", erg: ["interesting", "boring"] },
      { text: "the animals", be: "are", vor: "We went to the zoo yesterday.",      erg: ["funny", "hungry"] },
      { text: "the people",  be: "are", vor: "We went to a farm last week.",       erg: ["friendly", "nice"] },
      { text: "the chips",   be: "are", vor: "We had fish and chips yesterday.",   erg: ["great", "cold"] },
      { text: "the trip",    be: "is",  vor: "We went on a school trip last month.", erg: ["great", "exciting", "fun"] },
      { text: "the party",   be: "is",  vor: "We went to a party last Saturday.", erg: ["great", "fun", "boring"] },
      { text: "the beach",   be: "is",  vor: "We went to the seaside last week.",  erg: ["beautiful"] },
      { text: "the market",  be: "is",  vor: "We went to town yesterday.",         erg: ["busy"] },
      { text: "the horses",  be: "are", vor: "We went to a farm last week.",       erg: ["hungry", "friendly"] }
    ],
    dingSubjekteExtra: [
      { text: "the pizza",   be: "is",  vor: "We had pizza last night.",           erg: ["great", "cold"] },
      { text: "the zebras",  be: "are", vor: "We went to the zoo yesterday.",      erg: ["funny"] }
    ],
    ergaenzungen: ["at home", "at school", "at the seaside", "at the zoo", "in the park", "at the cinema", "at the party",
                   "tired", "hungry", "sick", "happy", "busy", "at the museum", "in the garden", "in the kitchen", "on the farm",
                   "at the market", "in town", "at the station"],
    erklaerungen: {
      pastaussage: {
        reg:      "In der Vergangenheit bekommt ein regelmäßiges Verb -ed (bei -e nur -d; plan → planned). Die Form ist bei allen Personen gleich. Beispiel: {BEISPIEL}",
        unreg:    "Dieses Verb ist unregelmäßig: Die Vergangenheitsform hat kein -ed, du musst sie lernen. Beispiel: {BEISPIEL}",
        zuordnen: "Regelmäßige Verben bekommen -ed (walk → walked). Unregelmäßige Verben haben eine eigene Form (go → went, see → saw)."
      },

      pastneg: {
        neg:      "Verneinung in der Vergangenheit: didn't + Grundform (ohne -ed). Die Form ist bei allen Personen gleich. Beispiel: {BEISPIEL}",
        zuordnen: "Richtig ist: didn't + Grundform. Nach didn't steht nie die Vergangenheitsform (went, played) und nie ein -s."
      },
      modal: {
        can:      "can = kann, can't = kann nicht. Danach steht die Grundform. Beispiel: {BEISPIEL}",
        must:     "must = muss. needn't = muss nicht / braucht nicht. Überlege: Ist es nötig oder nicht? Beispiel: {BEISPIEL}",
        zuordnen: "can = kann, can't = kann nicht. Überlege, was das Tier wirklich kann."
      },
      waswere: {
        was:      "I, he, she, it und eine Person oder ein Ding → was. Beispiel: {BEISPIEL}",
        were:     "You, we, they und mehrere Personen oder Dinge → were. Beispiel: {BEISPIEL}",
        frage:    "In Fragen steht was oder were vorne. Beispiel: {BEISPIEL}",
        neg:      "Verneinung: wasn't (I, he, she, it) oder weren't (you, we, they). Beispiel: {BEISPIEL}",
        kurzJa:   "Kurzantwort mit Ja: Yes, + Person + was/were. Beispiel: {BEISPIEL}",
        kurzNein: "Kurzantwort mit Nein: No, + Person + wasn't/weren't. Beispiel: {BEISPIEL}",
        zuordnen: "I, he, she, it und eine Person/ein Ding → was. You, we, they und mehrere → were."
      }
    }
  }
};

// =====================================================================
// 4) WÖRTERHILFE: deutsche Bedeutung für erschließbare Wörter
//     Steht ein Wort hier, ist es in den Aufgaben gepunktet unterstrichen;
//     Antippen zeigt die Bedeutung. Mehrzahl-Formen erkennt das Spiel selbst.
// =====================================================================
K5.woerterhilfe = [
  { en: "fly", de: "fliegen" }, { en: "swim", de: "schwimmen" },
  { en: "guitar", de: "Gitarre" }, { en: "camera", de: "Kamera" }, { en: "jacket", de: "Jacke" }, { en: "spaghetti", de: "Spaghetti" },
  { en: "dolphin", de: "Delfin" }, { en: "crocodile", de: "Krokodil" }, { en: "gorilla", de: "Gorilla" }, { en: "gorillas", de: "Gorillas" }, { en: "dolphins", de: "Delfine" }, { en: "panda", de: "Panda" },
  { en: "ball", de: "Ball" }, { en: "hand", de: "Hand" }, { en: "film", de: "Film" }, { en: "hamster", de: "Hamster" },
  { en: "elephant", de: "Elefant" }, { en: "tiger", de: "Tiger" }, { en: "zebra", de: "Zebra" }, { en: "giraffe", de: "Giraffe" },
  { en: "kangaroo", de: "Känguru" }, { en: "hotel", de: "Hotel" }, { en: "sofa", de: "Sofa" }, { en: "taxi", de: "Taxi" },
  { en: "banana", de: "Banane" }, { en: "pizza", de: "Pizza" }, { en: "radio", de: "Radio" }, { en: "video", de: "Video" },
  { en: "baby", de: "Baby" }, { en: "hobby", de: "Hobby" }, { en: "party", de: "Party" }, { en: "pony", de: "Pony" },
  { en: "cowboy", de: "Cowboy" }, { en: "glass", de: "Glas" }, { en: "class", de: "Klasse" }, { en: "sandwich", de: "Sandwich" },
  { en: "wolf", de: "Wolf" }, { en: "tomato", de: "Tomate" }, { en: "apple", de: "Apfel" }, { en: "insect", de: "Insekt" },
  { en: "octopus", de: "Krake" }, { en: "igloo", de: "Iglu" }, { en: "cola", de: "Cola" }, { en: "milk", de: "Milch" }
];

// =====================================================================
// 5) GENERATOREN: Welches Thema nutzt welchen Baukasten und welche Aufgaben-Art?
//   besitz (’s), tobe (am/is/are), tobefrage (Fragen + Kurzantworten), tobeneg (Verneinung),
//   plural, aan (a/an), imperativ, aussage / verneinung / frage (simple present),
//   pronomen (me/him … und my/his …), wortstellung (always, often …), pastaussage / pastfrage / pastneg (simple past),
//   modal (can/can't, must/needn't), waswere (was/were)
// =====================================================================
K5.generatoren = {
  "5-G1":  { baukasten: "5-U1", art: "besitz" },
  "5-G2":  { baukasten: "5-U1", art: "tobe" },
  "5-G3":  { baukasten: "5-U1", art: "plural" },
  "5-G4":  { baukasten: "5-U1", art: "tobefrage" },
  "5-G5":  { baukasten: "5-U2", art: "aan" },
  "5-G6":  { baukasten: "5-U2", art: "imperativ" },
  "5-G7":  { baukasten: "5-U2", art: "tobeneg" },
  "5-G8":  { baukasten: "5-U3", art: "aussage" },
  "5-G9":  { baukasten: "5-U3", art: "verneinung" },
  "5-G10": { baukasten: "5-U3", art: "frage" },
  "5-G11": { baukasten: "5-U4", art: "pronomen" },
  "5-G12": { baukasten: "5-U4", art: "wortstellung" },
  "5-G13": { baukasten: "5-U5", art: "pastaussage" },
  "5-G14": { baukasten: "5-U5", art: "pastfrage" },
  "5-G15": { baukasten: "5-U6", art: "modal" },
  "5-G16": { baukasten: "5-U6", art: "waswere" },
  "5-G17": { baukasten: "5-U6", art: "pastneg" }
};

// =====================================================================
// 6) DIE AUFGABEN (handgeschriebener Pool)
//    Jede Aufgabe: thema, niveau ("gruen"/"gelb"/"rot"), form und Inhalt.
//    loesung: ALLE richtigen Varianten. Kurz- und Langform (doesn't / does not)
//    erkennt das Spiel automatisch als gleich.
//    Formen:
//      quiz:     frage, optionen [...], loesung "..."
//      zuordnen: kategorien [...], woerter [{ text, ziel }]   (ziel = eine der kategorien)
//      luecke:   frage mit ___ als Lücke, loesung [...]  (bei 2 Lücken: [[...],[...]])
//      satzbau:  loesung ["richtiger Satz.", "weitere richtige Reihenfolge."]
//      fehler:   satz, fehlerwort, loesung [...]
//      umformen: frage, loesung [...]
// =====================================================================
K5.aufgaben = [
  // ---------- 5-G1  Besitz mit ’s / ’ ----------
  { thema: "5-G1", niveau: "gruen", form: "quiz", frage: "It's ___ (Lily) guinea pig.", optionen: ["Lily's", "Lilys", "Lilys'"], loesung: "Lily's",
    erklaerung: "Ein Besitzer: Du hängst ’s an den Namen. Beispiel: This is Sam's bike." },
  { thema: "5-G1", niveau: "gelb", form: "luecke", frage: "This is ___ (my brothers) room.", loesung: ["my brothers'"],
    erklaerung: "My brothers = mehrere Brüder, das Wort endet schon auf -s. Dann kommt nur ein Apostroph ’ dahinter. Beispiel: my parents' garden." },
  { thema: "5-G1", niveau: "rot", form: "fehler", satz: "This is Emmas new bike.", fehlerwort: "Emmas", loesung: ["Emma's"],
    erklaerung: "Ein Besitzer: Name + ’s. Beispiel: This is Tom's cat." },

  // ---------- 5-G2  to be ----------
  { thema: "5-G2", niveau: "gruen", form: "quiz", frage: "My cat and my dog ___ in the garden.", optionen: ["am", "is", "are"], loesung: "are",
    erklaerung: "Zwei Tiere = they. Bei they steht are. Beispiel: Tom and Emma are at home." },
  { thema: "5-G2", niveau: "rot", form: "umformen", frage: "Start with „My parents …“:  My dad is from England.", loesung: ["My parents are from England."],
    erklaerung: "My parents = mehrere Personen → are. Beispiel: My friends are in the park." },

  // ---------- 5-G3  Plural ----------
  { thema: "5-G3", niveau: "rot", form: "fehler", satz: "I have three scarfs.", fehlerwort: "scarfs", loesung: ["scarves"],
    erklaerung: "Bei vielen Wörtern auf -f wird f zu -ves. Beispiel: one shelf – two shelves." },

  // ---------- 5-G4  Fragen mit to be ----------
  { thema: "5-G4", niveau: "gruen", form: "quiz", frage: "Where ___ you from?", optionen: ["am", "is", "are"], loesung: "are",
    erklaerung: "Bei you steht are – auch in Fragen mit Fragewort. Beispiel: How old are your parents?" },
  { thema: "5-G4", niveau: "gelb", form: "luecke", frage: "How old ___ your sister?", loesung: ["is"],
    erklaerung: "Your sister = she → is. Beispiel: How old is Tom?" },
  { thema: "5-G4", niveau: "gelb", form: "luecke", frage: "Where ___ my shoes?", loesung: ["are"],
    erklaerung: "My shoes = mehrere Dinge → are. Beispiel: Where are my books?" },
  { thema: "5-G4", niveau: "gelb", form: "satzbau", loesung: ["Where are you from?"],
    erklaerung: "Fragen mit Fragewort: Fragewort – am/is/are – Person …? Beispiel: How old is your brother?" },
  { thema: "5-G4", niveau: "rot", form: "fehler", satz: "How old are your brother?", fehlerwort: "are", loesung: ["is"],
    erklaerung: "Your brother = he → is. Beispiel: How old is your sister?" },

  // ---------- 5-G5  a / an / the ----------
  { thema: "5-G5", niveau: "gruen", form: "quiz", frage: "Look at ___ board, please.", optionen: ["a", "an", "the"], loesung: "the",
    erklaerung: "In der Klasse gibt es nur ein Board, jeder weiß, welches gemeint ist. Dann steht the. Beispiel: Close the door, please." },
  { thema: "5-G5", niveau: "gruen", form: "quiz", frage: "Where is ___ cafeteria?", optionen: ["a", "an", "the"], loesung: "the",
    erklaerung: "Gemeint ist die Cafeteria der Schule – ein ganz bestimmter Ort. Dann steht the. Beispiel: Where is the playground?" },
  { thema: "5-G5", niveau: "gelb", form: "luecke", frage: "I have ___ new pen. ___ pen is blue.", loesung: [["a"], ["The"]],
    erklaerung: "Wenn du etwas zum ersten Mal nennst: a/an. Danach weiß man, welches gemeint ist: the. Beispiel: I have a cat. The cat is black." },
  { thema: "5-G5", niveau: "gelb", form: "luecke", frage: "There's ___ e-mail for you. ___ e-mail is from Emma.", loesung: [["an"], ["The"]],
    erklaerung: "Zuerst a/an (an vor Vokal-Laut), danach the. Beispiel: I have an eraser. The eraser is yellow." },
  { thema: "5-G5", niveau: "rot", form: "fehler", satz: "Please look at a board.", fehlerwort: "a", loesung: ["the"],
    erklaerung: "Es gibt nur ein Board in der Klasse – ein bestimmtes Ding → the. Beispiel: Please close the door." },

  // ---------- 5-G6  Imperativ ----------
  { thema: "5-G6", niveau: "gruen", form: "quiz", frage: "Please ___ your hands up.", optionen: ["put", "puts", "to put"], loesung: "put",
    erklaerung: "Befehle stehen in der Grundform, ohne -s und ohne to. Beispiel: Please open the window." },
  { thema: "5-G6", niveau: "gelb", form: "satzbau", loesung: ["Don't eat in the classroom."],
    erklaerung: "Verbote: Don't + Grundform + Rest. Beispiel: Don't talk in the lesson." },
  { thema: "5-G6", niveau: "rot", form: "fehler", satz: "Please not talk in the lesson.", fehlerwort: "not", loesung: ["don't", "do not"],
    erklaerung: "Verbote beginnen mit Don't, nicht mit not. Beispiel: Don't sit on the table." },

  // ---------- 5-G7  Verneinung von to be ----------
  { thema: "5-G7", niveau: "gruen", form: "quiz", frage: "My friends ___ in the cafeteria.", optionen: ["am not", "isn't", "aren't"], loesung: "aren't",
    erklaerung: "My friends = mehrere Personen → aren't. Beispiel: Tom and Emma aren't at school." },
  { thema: "5-G7", niveau: "gelb", form: "luecke", frage: "Lily ___ (be / not) good at Maths.", loesung: ["isn't", "is not"],
    erklaerung: "Lily = she → isn't. Beispiel: Tom isn't in the classroom." },
  { thema: "5-G7", niveau: "rot", form: "umformen", frage: "Make the sentence negative:  I'm ready.", loesung: ["I'm not ready.", "I am not ready."],
    erklaerung: "Bei I: I'm not oder I am not. Beispiel: I'm not at school." },

  // ---------- 5-G8  Simple present: Aussagen ----------
  { thema: "5-G8", niveau: "gruen", form: "quiz", frage: "My brother ___ to school.", optionen: ["go", "goes"], loesung: "goes",
    erklaerung: "My brother = he. Bei he/she/it bekommt das Verb ein -s, bei go sogar -es. Beispiel: Lily goes home." },
  { thema: "5-G8", niveau: "gruen", form: "quiz", frage: "We ___ football after school.", optionen: ["play", "plays"], loesung: "play",
    erklaerung: "Bei we (und I, you, they) bekommt das Verb kein -s. Beispiel: They like apples." },
  { thema: "5-G8", niveau: "gruen", form: "quiz", frage: "Emma ___ a cat.", optionen: ["have", "has"], loesung: "has",
    erklaerung: "Emma = she. Bei he/she/it wird have zu has. Beispiel: My brother has a bike." },
  { thema: "5-G8", niveau: "gruen", form: "zuordnen", kategorien: ["watch TV", "watches TV"],
    woerter: [{ text: "I", ziel: "watch TV" }, { text: "Sam", ziel: "watches TV" }, { text: "my friends", ziel: "watch TV" }, { text: "they", ziel: "watch TV" }],
    erklaerung: "He, she, it und Namen → Verb mit -s: Emma reads books. I, you, we, they → ohne -s: We read books." },
  { thema: "5-G8", niveau: "gelb", form: "luecke", frage: "Lily ___ (read) books in bed.", loesung: ["reads"],
    erklaerung: "Lily = she, also Verb + s. Beispiel: Tom plays football." },
  { thema: "5-G8", niveau: "gelb", form: "luecke", frage: "My parents ___ (live) in London.", loesung: ["live"],
    erklaerung: "My parents = they. Bei they bekommt das Verb kein -s. Beispiel: My friends like pizza." },
  { thema: "5-G8", niveau: "gelb", form: "luecke", frage: "Tom ___ (watch) TV in the evening.", loesung: ["watches"],
    erklaerung: "Tom = he, also Verb + s. Nach -ch und -sh hängst du -es an. Beispiel: My mum washes the car." },
  { thema: "5-G8", niveau: "gelb", form: "satzbau", loesung: ["My sister likes pizza."],
    erklaerung: "Im Aussagesatz gilt: Person – Verb – Rest. Beispiel: My brother plays football." },
  { thema: "5-G8", niveau: "gelb", form: "satzbau", loesung: ["We play football every Friday.", "Every Friday we play football."],
    erklaerung: "Person – Verb – Rest. Die Zeitangabe steht am Ende oder ganz am Anfang. Beispiel: Emma reads books every evening." },
  { thema: "5-G8", niveau: "rot", form: "fehler", satz: "Sam play football every day.", fehlerwort: "play", loesung: ["plays"],
    erklaerung: "Sam = he. Bei he/she/it braucht das Verb ein -s. Beispiel: Lily eats an apple." },
  { thema: "5-G8", niveau: "rot", form: "fehler", satz: "They likes pizza.", fehlerwort: "likes", loesung: ["like"],
    erklaerung: "Bei they bekommt das Verb kein -s. Beispiel: My parents watch TV." },
  { thema: "5-G8", niveau: "rot", form: "fehler", satz: "My dad watchs TV in the evening.", fehlerwort: "watchs", loesung: ["watches"],
    erklaerung: "Nach -ch und -sh hängst du -es an, nicht nur -s. Beispiel: My mum washes the car." },
  { thema: "5-G8", niveau: "rot", form: "umformen", frage: "Start with „She …“:  I go to school.", loesung: ["She goes to school."],
    erklaerung: "Bei she bekommt das Verb ein -s (nach -o, -ch, -sh: -es). Beispiel: I watch TV. → Tom watches TV." },
  { thema: "5-G8", niveau: "rot", form: "umformen", frage: "Start with „Tom …“:  We have a dog.", loesung: ["Tom has a dog."],
    erklaerung: "Bei he/she/it wird have zu has. Beispiel: I have a bike. → Emma has a bike." },

  // ---------- 5-G9  Simple present: Verneinung ----------
  { thema: "5-G9", niveau: "gruen", form: "quiz", frage: "Emma ___ like apples.", optionen: ["don't", "doesn't", "isn't"], loesung: "doesn't",
    erklaerung: "Emma = she. Bei he/she/it verneinst du mit doesn't. Beispiel: Tom doesn't play tennis." },
  { thema: "5-G9", niveau: "gruen", form: "quiz", frage: "I ___ play tennis.", optionen: ["don't", "doesn't", "am not"], loesung: "don't",
    erklaerung: "Bei I (und you, we, they) verneinst du mit don't. Beispiel: We don't like milk." },
  { thema: "5-G9", niveau: "gruen", form: "zuordnen", kategorien: ["don't", "doesn't"],
    woerter: [{ text: "we", ziel: "don't" }, { text: "my mum", ziel: "doesn't" }, { text: "my brother", ziel: "doesn't" }, { text: "Tom", ziel: "doesn't" }],
    erklaerung: "I, you, we, they → don't: We don't swim. He, she, it und Namen → doesn't: Lily doesn't swim." },
  { thema: "5-G9", niveau: "gelb", form: "luecke", frage: "My cat ___ (not / like) milk.", loesung: ["doesn't like", "does not like"],
    erklaerung: "My cat = it → doesn't + Verb ohne -s. Beispiel: My dog doesn't eat apples." },
  { thema: "5-G9", niveau: "gelb", form: "luecke", frage: "We ___ (not / watch) TV in the morning.", loesung: ["don't watch", "do not watch"],
    erklaerung: "Bei we verneinst du mit don't + Verb. Beispiel: They don't play tennis." },
  { thema: "5-G9", niveau: "gelb", form: "satzbau", loesung: ["Tom doesn't like football."],
    erklaerung: "Person – doesn't/don't – Verb – Rest. Beispiel: My sister doesn't read books." },
  { thema: "5-G9", niveau: "gelb", form: "satzbau", loesung: ["My friends don't go to my school."],
    erklaerung: "Person – don't – Verb – Rest. Beispiel: We don't live in London." },
  { thema: "5-G9", niveau: "rot", form: "fehler", satz: "She don't like cats.", fehlerwort: "don't", loesung: ["doesn't", "does not"],
    erklaerung: "Bei she (he, it) heißt es doesn't. Beispiel: My brother doesn't play football." },
  { thema: "5-G9", niveau: "rot", form: "fehler", satz: "He doesn't plays tennis.", fehlerwort: "plays", loesung: ["play"],
    erklaerung: "Nach doesn't steht das Verb OHNE -s. Beispiel: Emma doesn't like pizza." },
  { thema: "5-G9", niveau: "rot", form: "umformen", frage: "Make the sentence negative:  Lily reads books.", loesung: ["Lily doesn't read books."],
    erklaerung: "Bei he/she/it: doesn't + Verb ohne -s. Beispiel: Tom plays football. → Tom doesn't play football." },
  { thema: "5-G9", niveau: "rot", form: "umformen", frage: "Make the sentence negative:  We live in London.", loesung: ["We don't live in London."],
    erklaerung: "Bei I, you, we, they: don't + Verb. Beispiel: They like milk. → They don't like milk." },

  // ---------- 5-G10  Simple present: Fragen ----------
  { thema: "5-G10", niveau: "gruen", form: "quiz", frage: "___ your sister like pizza?", optionen: ["Do", "Does", "Is"], loesung: "Does",
    erklaerung: "Your sister = she. Fragen mit he/she/it beginnen mit Does. Beispiel: Does Tom play football?" },
  { thema: "5-G10", niveau: "gruen", form: "quiz", frage: "___ you play football?", optionen: ["Do", "Does", "Are"], loesung: "Do",
    erklaerung: "Fragen mit you (I, we, they) beginnen mit Do. Beispiel: Do they like apples?" },
  { thema: "5-G10", niveau: "gruen", form: "zuordnen", kategorien: ["Do …?", "Does …?"],
    woerter: [{ text: "you", ziel: "Do …?" }, { text: "my friends", ziel: "Do …?" }, { text: "we", ziel: "Do …?" }, { text: "your parents", ziel: "Do …?" }],
    erklaerung: "I, you, we, they → Do: Do they swim? He, she, it und Namen → Does: Does Sam swim?" },
  { thema: "5-G10", niveau: "gelb", form: "luecke", frage: "___ Tom ___ (have) a dog?", loesung: [["Does"], ["have"]],
    erklaerung: "Tom = he → Does + Person + Grundform (ohne -s). Beispiel: Does Lily like cats?" },
  { thema: "5-G10", niveau: "gelb", form: "luecke", frage: "___ your friends ___ (go) to school?", loesung: [["Do"], ["go"]],
    erklaerung: "Your friends = they → Do + Person + Verb. Beispiel: Do your parents watch TV?" },
  { thema: "5-G10", niveau: "gelb", form: "satzbau", loesung: ["Does Sam watch TV?"],
    erklaerung: "Fragen: Do/Does – Person – Verb – Rest? Beispiel: Does Emma play tennis?" },
  { thema: "5-G10", niveau: "gelb", form: "satzbau", loesung: ["Do you like apples?"],
    erklaerung: "Fragen: Do/Does – Person – Verb – Rest? Beispiel: Do they live in London?" },
  { thema: "5-G10", niveau: "rot", form: "fehler", satz: "Does Emma likes pizza?", fehlerwort: "likes", loesung: ["like"],
    erklaerung: "Nach Does steht das Verb OHNE -s. Beispiel: Does Tom play football?" },
  { thema: "5-G10", niveau: "rot", form: "fehler", satz: "Do your brother play football?", fehlerwort: "Do", loesung: ["Does"],
    erklaerung: "Your brother = he → die Frage beginnt mit Does. Beispiel: Does your sister like cats?" },
  { thema: "5-G10", niveau: "rot", form: "umformen", frage: "Ask a question:  Sam has a cat.", loesung: ["Does Sam have a cat?"],
    erklaerung: "Bei he/she/it: Does + Person + Grundform – has wird wieder zu have! Beispiel: Emma has a bike. → Does Emma have a bike?" },
  { thema: "5-G10", niveau: "rot", form: "umformen", frage: "Ask a question:  They live in London.", loesung: ["Do they live in London?"],
    erklaerung: "Bei I, you, we, they: Do + Person + Verb. Beispiel: We like pizza. → Do we like pizza?" },
  // ---------- 5-G11  Personalpronomen und Possessivbegleiter ----------
  { thema: "5-G11", niveau: "gruen", form: "quiz", frage: "This is my brother. ___ name is Sam.", optionen: ["His", "He", "Him"], loesung: "His",
    erklaerung: "Wem gehört es? Junge/Mann → his. Beispiel: That's Ben. His bike is red." },
  { thema: "5-G11", niveau: "gruen", form: "quiz", frage: "Look at the parrot! ___ cage is green.", optionen: ["Its", "It's", "It"], loesung: "Its",
    erklaerung: "Bei Tieren und Dingen heißt der Besitz its (ohne Apostroph!). it's = it is. Beispiel: The dog has a ball. Its ball is blue." },
  { thema: "5-G11", niveau: "gelb", form: "luecke", frage: "Mum, can you help ___ (we)? We can't find the cinema.", loesung: ["us"],
    erklaerung: "Nach einem Verb steht die Objektform: we → us. Beispiel: Our teacher often helps us." },
  { thema: "5-G11", niveau: "gelb", form: "luecke", frage: "Tom and Emma have a new dog. ___ (they) dog is very cute.", loesung: ["Their"],
    erklaerung: "Wem gehört es? they → their. Beispiel: My parents have a cat. Their cat is black." },
  { thema: "5-G11", niveau: "rot", form: "fehler", satz: "Emma and Lily are my friends. I like they very much.", fehlerwort: "they", loesung: ["them"],
    erklaerung: "Nach einem Verb steht die Objektform: they → them. Beispiel: My cousins are funny. I like them." },
  { thema: "5-G11", niveau: "rot", form: "umformen", frage: "Use him, her, it or them:  I give the present to my sister.", loesung: ["I give the present to her."],
    erklaerung: "my sister → she → her (Objektform nach to). Beispiel: I give the card to my dad. → I give the card to him." },

  // ---------- 5-G12  Wortstellung ----------
  { thema: "5-G12", niveau: "gruen", form: "quiz", frage: "Which sentence is right?", optionen: ["We often go to the cinema.", "We go often to the cinema.", "Often go we to the cinema."], loesung: "We often go to the cinema.",
    erklaerung: "Häufigkeitswörter (always, often, sometimes, never) stehen vor dem Verb. Beispiel: My parents never watch TV." },
  { thema: "5-G12", niveau: "gruen", form: "zuordnen", kategorien: ["right ✓", "wrong ✗"],
    woerter: [{ text: "I never eat fish.", ziel: "right ✓" }, { text: "Ben is always busy.", ziel: "right ✓" }, { text: "She plays often tennis.", ziel: "wrong ✗" }, { text: "We always are ready.", ziel: "wrong ✗" }],
    erklaerung: "always, often, sometimes, never stehen vor dem Verb (I never eat …), aber nach am, is, are (Ben is always …)." },
  { thema: "5-G12", niveau: "gelb", form: "luecke", frage: "My dad ___ (make / always) the birthday cake.", loesung: ["always makes"],
    erklaerung: "Das Häufigkeitswort steht vor dem Verb. Bei he/she/it bekommt das Verb ein -s. Beispiel: My mum often sings songs." },
  { thema: "5-G12", niveau: "gelb", form: "satzbau", loesung: ["Tom never forgets my birthday."],
    erklaerung: "Subjekt – never – Verb – Objekt. Beispiel: My sister never drinks milk." },
  { thema: "5-G12", niveau: "rot", form: "umformen", frage: "Put „often“ in the sentence:  My parents are busy.", loesung: ["My parents are often busy."],
    erklaerung: "Bei am, is, are steht das Häufigkeitswort dahinter. Beispiel: My friends are always at home." },
  { thema: "5-G12", niveau: "rot", form: "umformen", frage: "Put „never“ in the sentence:  I eat chocolate cake.", loesung: ["I never eat chocolate cake."],
    erklaerung: "never steht vor dem Verb. Beispiel: We never drink coke." },

  // ---------- 5-G13  Simple past: Aussagen ----------
  { thema: "5-G13", niveau: "gruen", form: "quiz", frage: "Last Saturday we ___ a picnic in the park.", optionen: ["had", "have", "has"], loesung: "had",
    erklaerung: "„Last Saturday“ zeigt: Es ist vorbei. have ist unregelmäßig: have → had. Beispiel: Yesterday I had pizza for lunch." },
  { thema: "5-G13", niveau: "gruen", form: "zuordnen", kategorien: ["+ ed", "unregelmäßig"],
    woerter: [{ text: "celebrate", ziel: "+ ed" }, { text: "buy", ziel: "unregelmäßig" }, { text: "walk", ziel: "+ ed" }, { text: "send", ziel: "unregelmäßig" }],
    erklaerung: "Regelmäßig: + ed (play → played). Unregelmäßig: eigene Form, die du lernst (go → went, see → saw)." },
  { thema: "5-G13", niveau: "gelb", form: "luecke", frage: "Last week Ben ___ (plan) a trip to the seaside.", loesung: ["planned"],
    erklaerung: "Kurzer Vokal + ein Konsonant am Ende: Konsonant verdoppeln, dann -ed. Beispiel: Emma planned a party." },
  { thema: "5-G13", niveau: "gelb", form: "luecke", frage: "Mia ___ (buy) a postcard and ___ (send) it to her grandmother.", loesung: [["bought"], ["sent"]],
    erklaerung: "buy und send sind unregelmäßig: buy → bought, send → sent. Beispiel: Yesterday I bought new trainers." },
  { thema: "5-G13", niveau: "rot", form: "fehler", satz: "Yesterday we goed to the market.", fehlerwort: "goed", loesung: ["went"],
    erklaerung: "go ist unregelmäßig: go → went (nicht goed). Beispiel: Last week I went to the zoo." },
  { thema: "5-G13", niveau: "rot", form: "umformen", frage: "Write it in the past. Use „yesterday“:  We have fish and chips.", loesung: ["We had fish and chips yesterday.", "Yesterday we had fish and chips."],
    erklaerung: "have → had (unregelmäßig). Beispiel: They have a party. → They had a party last week." },

  // ---------- 5-G14  Simple past: Fragen ----------
  { thema: "5-G14", niveau: "gruen", form: "quiz", frage: "___ you see the ship yesterday?", optionen: ["Did", "Do", "Are"], loesung: "Did",
    erklaerung: "Fragen in der Vergangenheit beginnen mit Did. Beispiel: Did they go to the beach?" },
  { thema: "5-G14", niveau: "gruen", form: "quiz", frage: "Did Emma ___ a postcard?", optionen: ["send", "sent", "sends"], loesung: "send",
    erklaerung: "Nach Did steht die Grundform. Beispiel: Did Tom buy a present?" },
  { thema: "5-G14", niveau: "gelb", form: "luecke", frage: "Did you like the trip? – Yes, I ___.", loesung: ["did"],
    erklaerung: "Kurzantwort: Yes, I did. / No, I didn't. Beispiel: Did Ben win? – Yes, he did." },
  { thema: "5-G14", niveau: "gelb", form: "satzbau", loesung: ["Did your parents go to the museum?"],
    erklaerung: "Did + Person + Grundform + Rest? Beispiel: Did your sister see the shark?" },
  { thema: "5-G14", niveau: "rot", form: "fehler", satz: "Did Tom bought a new bike?", fehlerwort: "bought", loesung: ["buy"],
    erklaerung: "Nach Did steht die Grundform, nicht die Vergangenheitsform. Beispiel: Did you see the film?" },
  { thema: "5-G14", niveau: "rot", form: "umformen", frage: "Ask a question:  Lily got lost in town.", loesung: ["Did Lily get lost in town?"],
    erklaerung: "Did + Person + Grundform: got → get. Beispiel: Ben went to the zoo. → Did Ben go to the zoo?" },

  // ---------- 5-G15  can / can't, must / needn't ----------
  { thema: "5-G15", niveau: "gruen", form: "quiz", frage: "It's Sunday. We ___ go to school.", optionen: ["needn't", "must"], loesung: "needn't",
    erklaerung: "needn't = muss nicht. Am Sonntag ist keine Schule. Beispiel: It's warm. You needn't wear a coat." },
  { thema: "5-G15", niveau: "gruen", form: "quiz", frage: "Parrots ___ talk.", optionen: ["can", "can't"], loesung: "can",
    erklaerung: "can = kann. Beispiel: Fish can swim." },
  { thema: "5-G15", niveau: "gelb", form: "luecke", frage: "I'm sick. I ___ (can / can't) come to your party.", loesung: ["can't", "cannot", "can not"],
    erklaerung: "can't = kann nicht. Beispiel: It’s dark. I can’t see the way." },
  { thema: "5-G15", niveau: "gelb", form: "satzbau", loesung: ["You must wear a helmet."],
    erklaerung: "Person + must + Grundform. Beispiel: We must feed the dog." },
  { thema: "5-G15", niveau: "rot", form: "fehler", satz: "It's warm and sunny. You must wear a coat.", fehlerwort: "must", loesung: ["needn't", "need not"],
    erklaerung: "Bei warmem Wetter ist ein Mantel nicht nötig → needn't. Beispiel: The kitchen is clean. You needn't clean it." },
  { thema: "5-G15", niveau: "rot", form: "umformen", frage: "Make the sentence negative:  My brother can play chess.", loesung: ["My brother can't play chess.", "My brother cannot play chess.", "My brother can not play chess."],
    erklaerung: "Verneinung von can: can't (cannot). Beispiel: My sister can't swim." },

  // ---------- 5-G16  was / were ----------
  { thema: "5-G16", niveau: "gruen", form: "quiz", frage: "Where ___ you yesterday?", optionen: ["were", "was", "are"], loesung: "were",
    erklaerung: "you → were. Beispiel: Were your friends at the party?" },
  { thema: "5-G16", niveau: "gruen", form: "zuordnen", kategorien: ["was", "were"],
    woerter: [{ text: "I", ziel: "was" }, { text: "you", ziel: "were" }, { text: "the film", ziel: "was" }, { text: "my parents", ziel: "were" }, { text: "the waves", ziel: "were" }],
    erklaerung: "I, he, she, it und eine Person/ein Ding → was. You, we, they und mehrere → were." },
  { thema: "5-G16", niveau: "gelb", form: "luecke", frage: "___ the museum interesting? – No, it ___.", loesung: [["Was"], ["wasn't"]],
    erklaerung: "the museum = it → was. Kurzantwort: No, it wasn't. Beispiel: Was the film good? – Yes, it was." },
  { thema: "5-G16", niveau: "gelb", form: "luecke", frage: "We ___ (be) at the seaside last week. The sea ___ (be) cold.", loesung: [["were"], ["was"]],
    erklaerung: "we → were, the sea (= it) → was. Beispiel: They were at the zoo. The lion was hungry." },
  { thema: "5-G16", niveau: "rot", form: "fehler", satz: "My friends was at the party last Saturday.", fehlerwort: "was", loesung: ["were"],
    erklaerung: "my friends = they → were. Beispiel: My cousins were at home yesterday." },
  { thema: "5-G16", niveau: "rot", form: "umformen", frage: "Ask a question:  You were tired yesterday.", loesung: ["Were you tired yesterday?"],
    erklaerung: "In Fragen steht were vorne. Beispiel: They were at school. → Were they at school?" },

  // ---------- 5-G17  Simple past: Verneinung ----------
  { thema: "5-G17", niveau: "gruen", form: "quiz", frage: "We ___ go to the cinema last night.", optionen: ["didn't", "don't", "weren't"], loesung: "didn't",
    erklaerung: "Verneinung in der Vergangenheit: didn't + Grundform. Beispiel: I didn't play football yesterday." },
  { thema: "5-G17", niveau: "gruen", form: "quiz", frage: "Emma didn't ___ the dog yesterday.", optionen: ["feed", "fed", "feeds"], loesung: "feed",
    erklaerung: "Nach didn't steht die Grundform. Beispiel: Tom didn't eat his sandwich." },
  { thema: "5-G17", niveau: "gelb", form: "luecke", frage: "Last week Ben ___ (not / wear) his helmet.", loesung: ["didn't wear"],
    erklaerung: "didn't + Grundform. Beispiel: My sister didn't wear her coat." },
  { thema: "5-G17", niveau: "gelb", form: "satzbau", loesung: ["I didn't hear the doorbell."],
    erklaerung: "Person + didn't + Grundform + Rest. Beispiel: We didn't see the ship." },
  { thema: "5-G17", niveau: "rot", form: "fehler", satz: "My sister didn't ate her sandwich.", fehlerwort: "ate", loesung: ["eat"],
    erklaerung: "Nach didn't steht nie die Vergangenheitsform, sondern die Grundform. Beispiel: Tom didn't go to school." },
  { thema: "5-G17", niveau: "rot", form: "umformen", frage: "Make the sentence negative:  We met our friends in the park.", loesung: ["We didn't meet our friends in the park."],
    erklaerung: "didn't + Grundform: met → meet. Beispiel: They saw a shark. → They didn't see a shark." }
];

// =====================================================================
// 7) DIE FRAGEN FÜR DEN ZUSATZRAUM
//    Kurze, knifflige Auswahlfragen zum Thema (müssen schnell lesbar sein).
// =====================================================================
K5.zusatzfragen = [
  { thema: "5-G1", frage: "Tom has a bike. Which is correct?", optionen: ["Tom's bike", "Toms bike", "Toms' bike"], loesung: "Tom's bike" },
  { thema: "5-G1", frage: "My parents have a house. Which is correct?", optionen: ["my parents' house", "my parent's house", "my parents's house"], loesung: "my parents' house" },
  { thema: "5-G1", frage: "My two sisters have a room. Which is correct?", optionen: ["my two sisters' room", "my two sister's room", "my two sisters room"], loesung: "my two sisters' room" },
  { thema: "5-G2", frage: "Which sentence is correct?", optionen: ["My parents is at home.", "My parents are at home.", "My parents am at home."], loesung: "My parents are at home." },
  { thema: "5-G2", frage: "Which word is wrong?  „I is from Germany.“", optionen: ["I", "is", "from", "Germany"], loesung: "is" },
  { thema: "5-G2", frage: "Which sentence is correct?", optionen: ["Emma are eleven.", "Emma am eleven.", "Emma is eleven."], loesung: "Emma is eleven." },
  { thema: "5-G3", frage: "Which plural is correct?", optionen: ["shelfs", "shelves", "shelfes"], loesung: "shelves" },
  { thema: "5-G3", frage: "Which plural is correct?", optionen: ["boies", "boys", "boyes"], loesung: "boys" },
  { thema: "5-G3", frage: "Which plural is correct?", optionen: ["familys", "families", "familyes"], loesung: "families" },
  { thema: "5-G3", frage: "Which plural is correct?", optionen: ["boxs", "boxies", "boxes"], loesung: "boxes" },
  { thema: "5-G4", frage: "Which question is correct?", optionen: ["Is your parents at home?", "Are your parents at home?", "Am your parents at home?"], loesung: "Are your parents at home?" },
  { thema: "5-G4", frage: "„Is Emma ready?“ – „Yes, …“", optionen: ["she is.", "she's.", "she are."], loesung: "she is." },
  { thema: "5-G4", frage: "„Are you from England?“ – „No, …“", optionen: ["I'm not.", "I amn't.", "I isn't."], loesung: "I'm not." },
  { thema: "5-G5", frage: "Which is correct?", optionen: ["a orange cap", "an orange cap"], loesung: "an orange cap" },
  { thema: "5-G5", frage: "Which is correct?", optionen: ["an uniform", "a uniform"], loesung: "a uniform" },
  { thema: "5-G5", frage: "Which is correct?", optionen: ["an yellow bag", "a yellow bag"], loesung: "a yellow bag" },
  { thema: "5-G5", frage: "Which is correct?", optionen: ["a e-mail", "an e-mail"], loesung: "an e-mail" },
  { thema: "5-G6", frage: "Which sentence is correct?", optionen: ["Opens the window, please.", "Open the window, please.", "To open the window, please."], loesung: "Open the window, please." },
  { thema: "5-G6", frage: "Which sentence is correct?", optionen: ["Not talk in the lesson!", "No talk in the lesson!", "Don't talk in the lesson!"], loesung: "Don't talk in the lesson!" },
  { thema: "5-G6", frage: "Which sentence is correct?", optionen: ["Don't sits down!", "Don't sit down!", "Don't to sit down!"], loesung: "Don't sit down!" },
  { thema: "5-G7", frage: "Which sentence is correct?", optionen: ["Tom aren't at school.", "Tom isn't at school.", "Tom amn't at school."], loesung: "Tom isn't at school." },
  { thema: "5-G7", frage: "Which sentence is correct?", optionen: ["I'm not ready.", "I isn't ready.", "I aren't ready."], loesung: "I'm not ready." },
  { thema: "5-G7", frage: "Which word is wrong?  „We isn't in the classroom.“", optionen: ["We", "isn't", "in", "classroom"], loesung: "isn't" },
  { thema: "5-G8", frage: "Which sentence is correct?", optionen: ["My sister watchs TV.", "My sister watches TV.", "My sister watch TV."], loesung: "My sister watches TV." },
  { thema: "5-G8", frage: "Which word is wrong?  „Tom and Emma plays football.“", optionen: ["Tom", "and", "plays", "football"], loesung: "plays" },
  { thema: "5-G8", frage: "Which sentence is correct?", optionen: ["He haves a dog.", "He has a dog.", "He have a dog."], loesung: "He has a dog." },
  { thema: "5-G9", frage: "Which sentence is correct?", optionen: ["He doesn't likes cats.", "He don't like cats.", "He doesn't like cats."], loesung: "He doesn't like cats." },
  { thema: "5-G9", frage: "Which word is wrong?  „My friends doesn't play tennis.“", optionen: ["friends", "doesn't", "play", "tennis"], loesung: "doesn't" },
  { thema: "5-G9", frage: "Which sentence is correct?", optionen: ["I doesn't eat apples.", "I don't eat apples.", "I not eat apples."], loesung: "I don't eat apples." },
  { thema: "5-G10", frage: "Which question is correct?", optionen: ["Does she plays football?", "Does she play football?", "Do she play football?"], loesung: "Does she play football?" },
  { thema: "5-G10", frage: "Which word is wrong?  „Do Sam have a dog?“", optionen: ["Do", "Sam", "have", "dog"], loesung: "Do" },
  { thema: "5-G10", frage: "Which question is correct?", optionen: ["Do they lives in London?", "Does they live in London?", "Do they live in London?"], loesung: "Do they live in London?" },
  { thema: "5-G11", frage: "Which word is right?  „Look at the dog. ___ ball is red.“", optionen: ["Its", "It's", "It"], loesung: "Its" },
  { thema: "5-G11", frage: "Which sentence is correct?", optionen: ["I like him.", "I like he.", "I like his."], loesung: "I like him." },
  { thema: "5-G11", frage: "Which word fits?  „My parents are nice. I like ___.“", optionen: ["them", "they", "their"], loesung: "them" },
  { thema: "5-G12", frage: "Which sentence is correct?", optionen: ["Tom always plays football.", "Tom plays always football.", "Always Tom plays football."], loesung: "Tom always plays football." },
  { thema: "5-G12", frage: "Which sentence is correct?", optionen: ["We are often at home.", "We often are at home.", "We are at often home."], loesung: "We are often at home." },
  { thema: "5-G12", frage: "Which sentence is correct?", optionen: ["My dad never drinks milk.", "My dad drinks never milk.", "Never my dad drinks milk."], loesung: "My dad never drinks milk." },
  { thema: "5-G13", frage: "Which form is right?  „Yesterday we ___ a shark.“", optionen: ["saw", "see", "seed"], loesung: "saw" },
  { thema: "5-G13", frage: "Which word is wrong?  „Last week Tom plays tennis.“", optionen: ["Last", "week", "plays", "tennis"], loesung: "plays" },
  { thema: "5-G13", frage: "Which form is right?  plan → …", optionen: ["planned", "planed", "plans"], loesung: "planned" },
  { thema: "5-G14", frage: "Which question is correct?", optionen: ["Did you go to the zoo?", "Did you went to the zoo?", "Do you went to the zoo?"], loesung: "Did you go to the zoo?" },
  { thema: "5-G14", frage: "Which word is wrong?  „Did Emma sent a postcard?“", optionen: ["Did", "Emma", "sent", "postcard"], loesung: "sent" },
  { thema: "5-G14", frage: "Did you see the film? – Yes, I ___.", optionen: ["did", "saw", "do"], loesung: "did" },
  { thema: "5-G15", frage: "It's Saturday. You ___ go to school.", optionen: ["needn't", "must"], loesung: "needn't" },
  { thema: "5-G15", frage: "Which sentence is correct?", optionen: ["Penguins can't fly.", "Penguins can fly.", "Penguins can't flies."], loesung: "Penguins can't fly." },
  { thema: "5-G15", frage: "Which word is wrong?  „You must to wear a helmet.“", optionen: ["must", "to", "wear", "helmet"], loesung: "to" },
  { thema: "5-G16", frage: "Which word fits?  „___ you at home yesterday?“", optionen: ["Were", "Was", "Did"], loesung: "Were" },
  { thema: "5-G16", frage: "Which sentence is correct?", optionen: ["The waves were big.", "The waves was big.", "The waves is big."], loesung: "The waves were big." },
  { thema: "5-G16", frage: "Which word fits?  „I ___ tired last night.“", optionen: ["was", "were", "am"], loesung: "was" },
  { thema: "5-G17", frage: "Which sentence is correct?", optionen: ["I didn't go to school.", "I didn't went to school.", "I don't went to school."], loesung: "I didn't go to school." },
  { thema: "5-G17", frage: "Which word is wrong?  „Tom didn't saw the shark.“", optionen: ["Tom", "didn't", "saw", "shark"], loesung: "saw" },
  { thema: "5-G17", frage: "Which word fits?  „We ___ hear the doorbell last night.“", optionen: ["didn't", "don't", "weren't"], loesung: "didn't" }
];

// =====================================================================
// 8) MINISPIELE (Belohnung nach einem geschafften Raubtierhaus)
//    Nach einer richtigen Bonusfrage erscheint der Knopf „🎁 Minispiel?“.
//    Die Kinder entscheiden selbst. Das Spiel dauert höchstens 30 Sekunden
//    (Einstellung minispielSekunden in daten/allgemein.js) und zählt NICHT für den Code.
//    titel / anleitung / erfolg = Texte; ziel = so viele Punkte braucht man für den Erfolg.
//    Neue Tiere oder neues Futter: einfach eine Zeile kopieren und ändern.
// =====================================================================
K5.minispiele = {
  spiele: {
    fuettern: {
      titel: "🍽️ Fütterungszeit",
      anleitung: "Die Tiere haben Hunger! Zieht das Futter zum richtigen Tier – oder tippt das Tier an.",
      ziel: 6,
      erfolg: "Alle satt und zufrieden! Die Zoowärterin ist beeindruckt."
    },
    taschenlampe: {
      titel: "🔦 Taschenlampen-Suche",
      anleitung: "Im Dunkeln verstecken sich Tiere – manche hinter Büschen. Fahrt mit dem Finger herum und haltet das Licht kurz auf ein Tier!",
      ziel: 6,
      erfolg: "Alle gefunden! Ihr habt Augen wie eine Eule."
    },
    seeloewe: {
      titel: "🦭 Robben-Jonglage",
      anleitung: "Haltet den Ball in der Luft! Schiebt die Robbe mit dem Finger unter den Ball.",
      ziel: 10,
      erfolg: "Applaus! Die Robbe klatscht mit den Flossen. 👏"
    },
    obstkorb: {
      titel: "🧺 Obstkorb",
      anleitung: "Obst fällt vom Baum! Schiebt den Korb mit dem Finger und fangt es auf. Vorsicht vor Steinen und alten Stiefeln!",
      ziel: 12,
      erfolg: "Der Korb ist voll! Die Affen sagen danke."
    },
    schaukel: {
      titel: "🐒 Affen-Schaukel",
      anleitung: "Der Affe schwingt an der Liane. Tippt, sobald der Ring ⭕ um ihn erscheint – dann springt er zur nächsten Liane!",
      ziel: 6,
      erfolg: "Was für ein Sprung-Profi! Die Affenbande nimmt euch auf."
    },
    nachtflug: {
      titel: "🦜 Pollys Nachtflug",
      anleitung: "Tippt, damit Polly flattert! Fliegt zwischen den Bäumen hindurch und sammelt Sterne ⭐. Anstoßen ist nicht schlimm – Polly taumelt nur kurz.",
      ziel: 8,
      erfolg: "Polly hat den halben Himmel eingesammelt – 8 Sterne!"
    },
    rutsche: {
      titel: "🐧 Pinguin-Rutsche",
      anleitung: "Tippt, damit der Pinguin springt! Hüpft über Eisblöcke und Schneemänner und schnappt euch die Fische 🐟.",
      ziel: 8,
      erfolg: "Satt und glücklich! Der Pinguin macht vor Freude einen Bauchplatscher."
    }
  },

  // ---------- Fütterungszeit ----------
  // tiere: id, emoji, en (englisch), de (deutsch), witz = was das Tier bei falschem Futter macht ({futter} = Name des Futters)
  tiere: [
    { id: "affe",     emoji: "🐒", en: "monkey",      de: "Affe",         witz: "Der Affe hält sich die Nase zu: „{futter}? Wo ist meine Banane?!“" },
    { id: "pinguin",  emoji: "🐧", en: "penguin",     de: "Pinguin",      witz: "Der Pinguin watschelt beleidigt weg: „{futter}? Ich will Fisch!“" },
    { id: "loewe",    emoji: "🦁", en: "lion",        de: "Löwe",         witz: "Der Löwe gähnt riesig: „{futter}? Ich bin doch kein Kaninchen!“" },
    { id: "tiger",    emoji: "🐯", en: "tiger",       de: "Tiger",        witz: "Der Tiger faucht: „{futter}? Wo ist das Steak?!“" },
    { id: "panda",    emoji: "🐼", en: "panda",       de: "Panda",        witz: "Der Panda kaut einfach weiter: „{futter}? Bambus oder gar nichts!“" },
    { id: "koala",    emoji: "🐨", en: "koala",       de: "Koala",        witz: "Der Koala schläft einfach wieder ein. 💤 {futter} sind ihm zu anstrengend." },
    { id: "eichhorn", emoji: "🐿️", en: "squirrel",    de: "Eichhörnchen", witz: "Das Eichhörnchen vergräbt die {futter} … und vergisst sofort, wo." },
    { id: "hase",     emoji: "🐇", en: "rabbit",      de: "Kaninchen",    witz: "Das Kaninchen rümpft die Nase: „{futter}? Habt ihr keine Karotten?“" },
    { id: "maus",     emoji: "🐭", en: "mouse",       de: "Maus",         witz: "Die Maus piepst empört: „{futter}? Wo ist der Käse?!“" },
    { id: "hund",     emoji: "🐶", en: "dog",         de: "Hund",         witz: "Der Hund schaut euch mit großen Augen an … und versteckt die {futter} unterm Sofa." },
    { id: "baer",     emoji: "🐻", en: "bear",        de: "Bär",          witz: "Der Bär brummt: „{futter}? Ohne Honig läuft hier gar nichts.“" },
    { id: "frosch",   emoji: "🐸", en: "frog",        de: "Frosch",       witz: "Der Frosch schießt die Zunge raus … und spuckt die {futter} wieder aus. Quaaak!" },
    { id: "huhn",     emoji: "🐔", en: "chicken",     de: "Huhn",         witz: "Das Huhn gackert: „{futter}? Dafür lege ich euch bestimmt kein Ei!“" },
    { id: "giraffe",  emoji: "🦒", en: "giraffe",     de: "Giraffe",      witz: "Die Giraffe schaut von ganz oben herab: „{futter}? Da unten? Viel zu weit weg!“" },
    { id: "elefant",  emoji: "🐘", en: "elephant",    de: "Elefant",      witz: "Der Elefant spritzt euch mit dem Rüssel nass. 💦 Das war wohl ein Nein." },
    { id: "krokodil", emoji: "🐊", en: "crocodile",   de: "Krokodil",     witz: "Das Krokodil lächelt breit … zu breit. Lieber schnell etwas anderes geben!" },
    { id: "robbe",    emoji: "🦭", en: "seal",        de: "Robbe",        witz: "Die Robbe klatscht mit den Flossen: Applaus für den Versuch – aber {futter}? Nein!" },
    { id: "pferd",    emoji: "🐴", en: "horse",       de: "Pferd",        witz: "Das Pferd schnaubt und dreht euch den Po zu." },
    { id: "papagei",  emoji: "🦜", en: "parrot",      de: "Papagei",      witz: "Der Papagei krächzt: „{futter}! {futter}! Igitt! Igitt!“" },
    { id: "raupe",    emoji: "🐛", en: "caterpillar", de: "Raupe",        witz: "Die Raupe ist so beleidigt, dass sie sich in einen Kokon einwickelt." },
    { id: "biene",    emoji: "🐝", en: "bee",         de: "Biene",        witz: "Die Biene summt: „{futter}? Da ist doch gar kein Nektar drin!“" },
    { id: "igel",     emoji: "🦔", en: "hedgehog",    de: "Igel",         witz: "Der Igel rollt sich zu einer stacheligen Kugel ein. Gespräch beendet." },
    { id: "hai",      emoji: "🦈", en: "shark",       de: "Hai",          witz: "Der Hai schwimmt eine Runde und schaut euch an: „Echt jetzt? {futter}?“" },
    { id: "kuh",      emoji: "🐄", en: "cow",         de: "Kuh",          witz: "Die Kuh muht so laut, dass Polly fast vom Ast fällt: „Muuuh-nein!“" }
  ],
  // futter: haupt = Tiere, die eindeutig passen (eins davon ist die richtige Lösung)
  //         auch  = Tiere, die das auch fressen würden – sie werden NIE als falsche Auswahl gezeigt (sonst wäre es unfair)
  futter: [
    { emoji: "🍌", en: "bananas",         de: "Bananen",            haupt: ["affe"],              auch: ["elefant", "papagei", "pferd", "baer"] },
    { emoji: "🐟", en: "fish",            de: "Fisch",              haupt: ["pinguin", "robbe"],  auch: ["baer", "krokodil", "hai", "tiger"] },
    { emoji: "🍖", en: "meat",            de: "Fleisch",            haupt: ["loewe", "tiger"],    auch: ["krokodil", "hund", "hai", "baer"] },
    { emoji: "🎋", en: "bamboo",          de: "Bambus",             haupt: ["panda"],             auch: [] },
    { emoji: "🌿", en: "eucalyptus",      de: "Eukalyptus",         haupt: ["koala"],             auch: [] },
    { emoji: "🌰", en: "nuts",            de: "Nüsse",              haupt: ["eichhorn"],          auch: ["affe", "papagei", "maus", "baer"] },
    { emoji: "🥕", en: "carrots",         de: "Karotten",           haupt: ["hase"],              auch: ["pferd", "elefant", "affe", "kuh", "maus", "baer", "papagei"] },
    { emoji: "🧀", en: "cheese",          de: "Käse",               haupt: ["maus"],              auch: ["hund", "baer"] },
    { emoji: "🦴", en: "a bone",          de: "Knochen",            haupt: ["hund"],              auch: ["loewe", "tiger", "krokodil", "hai", "baer"] },
    { emoji: "🍯", en: "honey",           de: "Honig",              haupt: ["baer"],              auch: ["biene", "affe"] },
    { emoji: "🪰", en: "flies",           de: "Fliegen",            haupt: ["frosch"],            auch: ["igel", "huhn"] },
    { emoji: "🌽", en: "corn",            de: "Mais",               haupt: ["huhn"],              auch: ["kuh", "pferd", "maus", "eichhorn", "papagei", "baer", "affe", "elefant", "hase"] },
    { emoji: "🍃", en: "leaves",          de: "Blätter",            haupt: ["giraffe"],           auch: ["raupe", "koala", "elefant", "affe", "panda", "hase", "kuh", "pferd"] },
    { emoji: "🌾", en: "hay",             de: "Heu",                haupt: ["kuh", "pferd"],      auch: ["hase", "elefant", "giraffe"] },
    { emoji: "🌻", en: "sunflower seeds", de: "Sonnenblumenkerne",  haupt: ["papagei"],           auch: ["eichhorn", "maus", "huhn", "hase"] },
    { emoji: "🌸", en: "flowers",         de: "Blumen",             haupt: ["biene"],             auch: ["kuh", "raupe", "hase", "pferd"] },
    { emoji: "🪲", en: "beetles",         de: "Käfer",              haupt: ["igel"],              auch: ["frosch", "huhn", "maus", "affe"] },
    { emoji: "🍎", en: "apples",          de: "Äpfel",              haupt: ["pferd"],             auch: ["elefant", "affe", "baer", "kuh", "hase", "eichhorn", "maus", "papagei", "giraffe"] },
    { emoji: "🌱", en: "grass",           de: "Gras",               haupt: ["kuh"],               auch: ["pferd", "hase", "elefant", "giraffe", "panda"] },
    { emoji: "🍉", en: "watermelon",      de: "Wassermelone",       haupt: ["elefant"],           auch: ["affe", "papagei", "pferd", "baer", "hase", "kuh", "huhn", "giraffe"] },
    { emoji: "🦐", en: "shrimps",         de: "Krabben",            haupt: ["robbe"],             auch: ["pinguin", "hai", "krokodil", "baer", "huhn"] }
  ],
  lob: ["😋 Yum!", "😋 Lecker!", "😋 Mmmh!", "😋 Danke!", "😋 Perfekt!"],

  // ---------- Taschenlampen-Suche ----------
  nachtTiere: [
    { emoji: "🦉", en: "owl",      de: "Eule" },        { emoji: "🦇", en: "bat",      de: "Fledermaus" },
    { emoji: "🦊", en: "fox",      de: "Fuchs" },       { emoji: "🦔", en: "hedgehog", de: "Igel" },
    { emoji: "🦝", en: "raccoon",  de: "Waschbär" },    { emoji: "🐸", en: "frog",     de: "Frosch" },
    { emoji: "🐌", en: "snail",    de: "Schnecke" },    { emoji: "🐿️", en: "squirrel", de: "Eichhörnchen" },
    { emoji: "🐍", en: "snake",    de: "Schlange" },    { emoji: "🐢", en: "tortoise", de: "Schildkröte" },
    { emoji: "🐭", en: "mouse",    de: "Maus" },        { emoji: "🦎", en: "lizard",   de: "Eidechse" },
    { emoji: "🐈", en: "cat",      de: "Katze" },       { emoji: "🦡", en: "badger",   de: "Dachs" }
  ],
  kulisse: ["🌳", "🌲", "🪨", "🌿", "🌳", "🪵", "🌲", "🍄", "🌾", "🌳"],

  // ---------- Robben-Jonglage ----------
  robbe: "🦭", ball: "🏐",
  platsch: ["Platsch! Nochmal!", "Ups! Neuer Ball!", "Daneben – weiter geht's!"],

  // ---------- Obstkorb ----------
  obst: [
    { emoji: "🍎", en: "apple",      de: "Apfel" },       { emoji: "🍌", en: "banana",    de: "Banane" },
    { emoji: "🍐", en: "pear",       de: "Birne" },       { emoji: "🍊", en: "orange",    de: "Orange" },
    { emoji: "🍓", en: "strawberry", de: "Erdbeere" },    { emoji: "🍇", en: "grapes",    de: "Weintrauben" },
    { emoji: "🍒", en: "cherries",   de: "Kirschen" },    { emoji: "🍑", en: "peach",     de: "Pfirsich" },
    { emoji: "🍍", en: "pineapple",  de: "Ananas" },      { emoji: "🥝", en: "kiwi",      de: "Kiwi" },
    { emoji: "🍋", en: "lemon",      de: "Zitrone" },     { emoji: "🍉", en: "watermelon", de: "Wassermelone" },
    { emoji: "🥭", en: "mango",      de: "Mango" },       { emoji: "🫐", en: "blueberries", de: "Heidelbeeren" }
  ],
  muell: ["🪨", "🥾", "🧦", "🥫"],          // nicht fangen!
  autsch: ["Autsch! Ein Stein!", "Igitt, ein alter Stiefel!", "Wer wirft denn Socken vom Baum?!", "Eine Dose? Das ist kein Obst!"],

  // ---------- Affen-Schaukel ----------
  affe: "🐒",
  netz: ["Ins Netz! Nochmal!", "Hoppla! Gleich nochmal!", "Fast! Wartet auf den Ring ⭕."],

  // ---------- Pollys Nachtflug ----------
  flug: { figur: "🦜", stern: "⭐", krone: "🌳", himmel: ["✨", "·", "✨", "🌙", "·", "✨"] },
  flugAutsch: ["Autsch! Ein Ast!", "Huch! Weiterflattern!", "Kraaah! Fast!", "Federn zerzaust – weiter!"],

  // ---------- Pinguin-Rutsche ----------
  rutsche: { figur: "🐧", fisch: "🐟", hindernisse: ["🧊", "⛄", "🪨"], hintergrund: ["🏔️", "❄️", "🏔️", "☁️"] },
  rutscheAutsch: ["Rumms! Weiterrutschen!", "Bauchlandung! Weiter!", "Autsch, kalt!", "Hoppla – Kopf hoch!"]
};
