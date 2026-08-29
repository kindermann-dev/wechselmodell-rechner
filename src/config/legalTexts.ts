/**
 * Single Source of Truth (SSoT) für alle unterhaltsrechtlichen Hinweistexte,
 * Tooltip-Erklärungen, Rechtsprechungszitate und Infoboxen im Wechselmodell-Rechner.
 */

export interface TooltipContent {
  title: string;
  explanation: string;
  legalNote?: string;
  caseLaw?: string;
}

/**
 * Konsolidierte Tooltip-Texte für alle Eingabefelder und Auswertungsbereiche.
 */
export const TOOLTIP_TEXTS = {
  // ---------------------------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------------------------
  header: {
    asymmetricNotice: {
      title: "Rechtliche Abgrenzung: Symmetrisches Wechselmodell",
      explanation:
        "Dieser Rechner ist ausschließlich auf das echte, paritätische Wechselmodell (50:50-Betreuung) ausgelegt.",
      legalNote:
        "Abgrenzung zum asymmetrischen Betreuungsmodell: Der BGH hat mit Beschlüssen vom 12.03.2014 (XII ZB 234/13, FamRZ 2014, 917), 05.11.2014 (XII ZB 599/13) und 15.04.2026 (XII ZB 415/25) klargestellt, dass bei asymmetrischer Betreuung (z. B. 40:60) keine wechselseitige Quotelung stattfindet. Es verbleibt beim Residenzmodell mit erweitertem Umgang (Entlastung ggf. durch Tabellenherabstufung und 10 % bis max. 15 % pauschalen Bedarfsabzug).",
      caseLaw:
        "BGH XII ZB 415/25 (15.04.2026); BGH XII ZB 234/13 (12.03.2014); BGH XII ZB 599/13 (05.11.2014); § 1606 Abs. 3 BGB",
    },
  },

  // ---------------------------------------------------------------------------
  // ELTERNTEIL-EINGABEN (ParentInputCard)
  // ---------------------------------------------------------------------------
  parent: {
    buergergeld: {
      title: "Bürgergeld-Bezug / Nicht erwerbstätig (§ 1603 Abs. 2 BGB, SGB II)",
      explanation:
        "Kennzeichnet, dass der Elternteil Bürgergeld (SGB II) bezieht oder derzeit kein Erwerbseinkommen erzielt.",
      legalNote:
        "Rechtsfolgen bei Bürgergeld: 1. Bereinigtes Nettoeinkommen = 0,00 € und Haftungsquote = 0 %. 2. Fiktive Einkünfte: Wegen der gesteigerten Erwerbsobliegenheit (§ 1603 Abs. 2 BGB) können Familiengerichte bei fehlenden Bewerbungsnachweisen fiktive Einkünfte anrechnen. 3. Anspruchsübergang (§ 33 SGB II): Unterhalts- und Kindergeldansprüche gehen bis zur Leistungshöhe auf das Jobcenter über. 4. Wohnkosten (KdU): Werden im Rahmen der Kosten der Unterkunft vom Jobcenter getragen.",
      caseLaw: "§ 1603 Abs. 2 BGB; § 33 SGB II; BGH XII ZB 45/15",
    },
    receivesKindergeld: {
      title: "Kindergeld-Bezugsberechtigung (BGH XII ZB 45/15 & XII ZB 565/15)",
      explanation:
        "Gibt an, an welchen Elternteil die Familienkasse das staatliche Kindergeld auszahlt.",
      legalNote:
        "Zweistufiges Kindergeld-Splitting nach BGH XII ZB 45/15 (Beschluss vom 20.04.2016) & § 1612b BGB: 50 % Betreuungsanteil (je 25 % fix pro Elternteil) und 50 % Baranteil (Aufteilung nach Haftungsquoten). Der beziehende Elternteil leistet an den anderen: ΔKG = 25 % KG + (Q_andere × 50 % KG).",
      caseLaw: "BGH XII ZB 45/15 (FamRZ 2016, 1053); BGH XII ZB 565/15 Rn. 32; § 1612b BGB",
    },
    grossIncome: {
      title: "Bruttoeinkommen",
      explanation:
        "Gesamtes Bruttoeinkommen inklusive Urlaubs-/Weihnachtsgeld, geldwerter Vorteile (z. B. Firmenwagen) und vermögenswirksamer Leistungen.",
      legalNote:
        "Dient als Berechnungsgrundlage für die Obergrenze der privaten Altersvorsorge (max. 4 % des Gesamtbruttoeinkommens). Bei Selbstständigen ist der 3-Jahres-Durchschnitt maßgebend.",
      caseLaw: "BGH XII ZR 149/01, Düsseldorfer Tabelle 2026 Anm. A.3",
    },
    netIncome: {
      title: "Nettoeinkommen (Basis)",
      explanation:
        "Summe der laufenden monatlichen Nettogehälter (ohne variable Sonderboni). Steuererstattungen sind dem Zuflussjahr hinzuzurechnen.",
      legalNote:
        "Steuerklassenwahl: Ab dem Folgejahr der Trennung besteht eine Rechtspflicht zum Wechsel in Steuerklasse I/II. Wer schuldhaft ungünstige Steuerklassen beibehält, muss sich fiktive Berechnungen anrechnen lassen.",
      caseLaw: "§ 1606 Abs. 3 BGB, BGH XII ZR 111/05",
    },
    annualBonus: {
      title: "Jahresboni & Einmalzahlungen",
      explanation:
        "Variable Vergütungen wie Jahresboni, Tantiemen, Provisionen, Überstundenvergütungen und Einkommensteuererstattungen der letzten 12 Monate.",
      legalNote:
        "Streitpunkt Überstunden & Boni: Regelmäßige Boni zählen voll zum Unterhaltseinkommen. Bei stark schwankenden Beträgen verlangt die Rechtsprechung einen 3-Jahres-Durchschnitt zur Glättung.",
      caseLaw: "BGH FamRZ 2014, 923; OLG Düsseldorf Leitlinien",
    },
    pkvGeneral: {
      title:
        "Private Kranken- und Pflegeversicherung (§ 10 Abs. 1 Nr. 3 EStG / Ziff. 10.4 OLG-Leitlinien)",
      explanation:
        "Abzugsfähig ist nur der Eigenanteil für die Basisabsicherung (ohne Wahlleistungen wie Chefarzt/Einbettzimmer) gemäß jährlicher Beitragsbescheinigung nach § 10 Abs. 1 Nr. 3 EStG (Ziff. 10.4 OLG-Leitlinien).",
      legalNote:
        "Einkommensbereinigung bei PKV: Der monatliche Eigenanteil (Basisbeitrag abzüglich steuerfreiem Arbeitgeberzuschuss oder Beihilfe) mindert das anrechenbare Nettoeinkommen. Komfort- und Wahltarife (z. B. Chefarztbehandlung, Einbettzimmer) sind unterhaltsrechtlich nicht abzugsfähig.",
      caseLaw: "§ 10 Abs. 1 Nr. 3 EStG; Ziff. 10.4 OLG-Leitlinien; BGH XII ZB 565/15",
    },
    pkvBasis: {
      title: "PKV-Basisbeitrag (inkl. Pflegepflichtversicherung)",
      explanation:
        "Monatlicher oder jährlicher Beitrag zur Basis-Krankenversicherung und gesetzlichen Pflegepflichtversicherung ohne Komforttarife.",
      legalNote:
        "Abzugsfähig ist nur der Eigenanteil für die Basisabsicherung (ohne Wahlleistungen wie Chefarzt/Einbettzimmer) gemäß jährlicher Beitragsbescheinigung nach § 10 Abs. 1 Nr. 3 EStG (Ziff. 10.4 OLG-Leitlinien).",
      caseLaw: "§ 10 Abs. 1 Nr. 3 EStG; Ziff. 10.4 OLG-Leitlinien",
    },
    pkvArbeitgeberzuschuss: {
      title: "Steuerfreier Arbeitgeberzuschuss / Beihilfe",
      explanation:
        "Steuerfreier Zuschuss des Arbeitgebers zur Kranken- und Pflegeversicherung nach § 257 SGB V bzw. Beihilfeleistungen.",
      legalNote:
        "Der Arbeitgeberzuschuss mindert den abzugsfähigen PKV-Aufwand, sodass nur der tatsächliche Eigenanteil unterhaltsmindernd wirkt.",
      caseLaw: "Ziff. 10.4 OLG-Leitlinien; § 257 SGB V",
    },
    pension: {
      title: "Zusätzliche Altersvorsorge",
      explanation:
        "Tatsächlich geleistete Beiträge zu privaten Rentenversicherungen, Riester-/Rürup-Verträgen oder betrieblicher Altersvorsorge (bAV).",
      legalNote:
        "Höchstgrenze 4 % des Bruttos: Kann nur abgezogen werden, wenn tatsächliche Zahlungen nachgewiesen werden (kein Pauschalabzug). Bei Unterschreitung des Mindestunterhalts (Mangelfall) kann der Abzug gerichtlich verwehrt werden.",
      caseLaw: "BGH XII ZR 149/01; BGH XII ZB 599/13",
    },
    housingAdvantage: {
      title: "Wohnvorteil (Eigenheim)",
      explanation:
        "Mietfreies Wohnen in einer eigenen Immobilie spart Mietkosten und wird dem Einkommen als fiktiver Ertrag hinzugerechnet.",
      legalNote:
        "Eigenheim nach BGH XII ZB 565/15 Rn. 25 & XII ZB 110/16: Zinsen und verbrauchsunabhängige Hauskosten sind abzugsfähig. Tilgung bis max. 4% Vorsorgequote. Achtung: Nicht doppelt als Wohnvorteil-Minderung UND als Schuld eintragen!",
      caseLaw: "BGH XII ZB 565/15 Rn. 25; BGH XII ZB 110/16",
    },
    occupationalExpenses: {
      title: "Berufsbedingte Aufwendungen",
      explanation:
        "Aufwendungen zur Sicherung und Erzielung des Erwerbseinkommens (Fahrtkosten, Arbeitsmittel, doppelte Haushaltsführung).",
      legalNote:
        "5%-Pauschale vs. Einzelnachweis: Die 5%-Pauschale (50–150 €/Monat) gilt nur bei Erwerbstätigkeit ohne Nachweispflicht. Wer höhere tatsächliche Fahrtkosten (0,42 €/km) nachweist, muss alle Aufwendungen darlegen; die Pauschale entfällt dann.",
      caseLaw: "Düsseldorfer Tabelle 2026 Anm. A.3; BGH XII ZB 599/13",
    },
    debts: {
      title: "Berücksichtigungsfähige Verbindlichkeiten",
      explanation:
        "Laufende Tilgungs- und Zinsleistungen für eheprägende, familiäre oder notwendige Kredite.",
      legalNote:
        "Streitpunkt Neue Konsumschulden: Verbindlichkeiten, die nach der Trennung für Konsumzwecke aufgenommen wurden, mindern den Unterhalt grundsätzlich nicht. Der Pflichtige hat eine Obliegenheit zur Streckung oder Umschuldung.",
      caseLaw: "BGH XII ZR 131/04; OLG Leitlinien",
    },
    warmRent: {
      title: "Tatsächliche Warmmiete des Haushalts (BGH XII ZB 565/15 Rn. 25)",
      explanation:
        "Monatliche Warmmiete inkl. Nebenkosten und Heizung (bzw. Zinsen/Nebenkosten bei Eigentum).",
      legalNote:
        "Realkosten-Vergleich nach BGH XII ZB 565/15 Rn. 25: Der auf das Kind entfallende Wohnbedarf wird nach der in der Rechtsprechung anerkannten Kopfzahl-Methode (Warmmiete / Personen) ermittelt. Übersteigen die summierten tatsächlichen Wohnkosten beider Haushalte den im Tabellenunterhalt kalkulierten 20%-Wohnkostenanteil, wird die Differenz als Wohnmehrbedarf des Kindes angesetzt und nach Haftungsquoten verteilt. Bei der Barunterhaltsermittlung bringt jeder Elternteil seine im eigenen Haushalt erbrachten Kindes-Wohnkosten bedarfsmindernd in Abzug.",
      caseLaw: "BGH XII ZB 565/15 Rn. 25 (BGHZ 213, 254); Wendl/Klinkhammer",
    },
    householdPersons: {
      title: "Haushaltsgröße (Kopfzahl-Methode)",
      explanation:
        "Gesamtzahl der ständig oder wechselnd im Haushalt lebenden Personen (Elternteil + alle Kinder + Partner).",
      legalNote:
        "Kopfzahl-Aufteilung nach BGH: Die Warmmiete wird gleichmäßig auf alle Haushaltsangehörigen aufgeteilt. Wohnen z. B. der Elternteil und 2 Kinder in der Wohnung, beträgt die Kopfzahl 3 (1/3 Warmmiete je Kind).",
      caseLaw: "BGH FamRZ 2011, 454; Wendl/Klinkhammer; BGH XII ZB 565/15 Rn. 25",
    },
    directExpenses: {
      title: "Direkte Kindesausgaben (Bargeld-Auslagen)",
      explanation:
        "Vom Elternteil zentral verauslagte Sachkosten für das Kind (z. B. Kleidung, Schulgeld, Monatskarte, Vereinsbeiträge, Krankenzusatzversicherung).",
      legalNote:
        "Abgrenzung & Quotenverrechnung nach BGH XII ZB 565/15 Rn. 28, 30: 1. Gewöhnliche Verpflegungs- und Wohnkosten der eigenen Betreuungswoche sind durch den 50%-Naturalunterhalt abgegolten und dürfen NICHT eingetragen werden. 2. Zentrale Sachausgaben und Anschaffungen für das Kind werden nach den Haftungsquoten (Q_A : Q_B) aufgeteilt. Der andere Elternteil übernimmt seinen prozentualen Quotenanteil im Rahmen der Spitzabrechnung.",
      caseLaw: "BGH XII ZB 565/15 Rn. 28–30 (BGHZ 213, 254)",
    },
  },

  // ---------------------------------------------------------------------------
  // KINDER-EINGABEN (ChildrenInputCard)
  // ---------------------------------------------------------------------------
  children: {
    general: {
      title: "Kinderbedarfe im Wechselmodell (BGH XII ZB 565/15)",
      explanation:
        "Jedes Kind hat einen einheitlichen Tabellenbedarf nach der Düsseldorfer Tabelle 2026, der auf dem zusammengerechneten Einkommen beider Eltern basiert und um konkrete Mehrbedarfe (insb. Wohnmehrbedarf) ergänzt wird.",
      legalNote:
        "Einheitlicher Kindesbedarf: Nach BGH XII ZB 565/15 Rn. 18 bestimmt das beiderseitige Einkommen den Regelbedarf. Bei zwei unterhaltsberechtigten Kindern greifen die normalen Tabellensätze ohne Herabstufung.",
      caseLaw: "BGH XII ZB 565/15 Rn. 18 (BGHZ 213, 254)",
    },
    kindergeld: {
      title: "Staatliches Kindergeld (§ 1612b BGB / EStG § 66)",
      explanation:
        "Gesetzlicher Kindergeldbetrag pro Kind und Monat. Seit dem 01.01.2026 beträgt das bundeseinheitliche Kindergeld 259 € pro Monat (2025: 255 €, bis 2024: 250 €).",
      legalNote:
        "Zweistufiges Kindergeld-Splitting (§ 1612b BGB, BGH, Beschluss vom 20.04.2016 – Az. XII ZB 45/15): Das staatliche Kindergeld wird aufgeteilt in 50 % Betreuungsanteil (je 25 % fix pro Elternteil) und 50 % Baranteil (Aufteilung nach Haftungsquoten). Der Auszahlungsempfänger leitet 25 % Festanteil zzgl. der Haftungsquote des anderen Elternteils am 50 %-Baranteil weiter.",
      caseLaw: "§ 1612b BGB; BGH XII ZB 45/15 (FamRZ 2016, 1053); BGH XII ZB 565/15 Rn. 32",
    },
    kinderzuschlag: {
      title: "Kinderzuschlag (§ 6a BKGG / BGH XII ZB 512/19)",
      explanation:
        "Tatsächlich zufließender staatlicher Kinderzuschlag nach § 6a BKGG für dieses Kind.",
      legalNote:
        "Der Kinderzuschlag gilt nach BGH XII ZB 512/19 in voller Höhe als eigenes Einkommen des Kindes und mindert den Bedarf vor der Quotenberechnung (Zuflussprinzip).",
      caseLaw: "BGH XII ZB 512/19 (28.10.2020); § 6a BKGG",
    },
    ageGroup: {
      title: "Altersstufe nach Düsseldorfer Tabelle 2026",
      explanation:
        "Die 4 Altersstufen der Düsseldorfer Tabelle: 0–5 Jahre, 6–11 Jahre, 12–17 Jahre und ab 18 Jahre (Volljährige).",
      legalNote:
        "Volljährige Kinder (ab 18): Minderjährige Kinder sind privilegiert. Bei Volljährigen haften beide Eltern barunterhaltspflichtig und das staatliche Kindergeld (259 €) wird in voller Höhe (100 %, kein Minderjährigen-Splitting) bedarfsmindernd abgezogen.",
      caseLaw: "§ 1606 Abs. 3 S. 1 BGB; Düsseldorfer Tabelle 2026",
    },
    calculatedWohnmehrbedarf: (
      actualHousing: number,
      table20Pct: number,
      wohnMehrbedarf: number
    ): TooltipContent => ({
      title: "Errechneter Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25)",
      explanation:
        "Automatisch ermittelte Wohnmehrkosten aus den Warmmieten beider Elternhaushalte nach der Pro-Kopf-Methode abzüglich des im Tabellenbedarf bereits enthaltenen 20%-Wohnkostenanteils.",
      legalNote: `Berechnung: Tatsächlicher Wohnbedarf (${actualHousing.toFixed(2)} €) minus 20% Tabellenanteil (${table20Pct.toFixed(2)} €) = ${wohnMehrbedarf.toFixed(2)} € / Monat. Übersteigende Mietkosten sind nach ständiger BGH-Rechtsprechung echter Kindesmehrbedarf.`,
      caseLaw: "BGH XII ZB 565/15 Rn. 25; Wendl/Dose § 1 Rn. 562",
    }),
    pkvGeneral: {
      title: "PKV des Kindes (Ziff. 10.4 OLG-Leitlinien)",
      explanation:
        "Beiträge zur privaten Kranken- und Pflegeversicherung des Kindes stellen unterhaltsrechtlichen Mehrbedarf dar und werden im Verhältnis der Haftungsquoten (Q_A : Q_B) getragen.",
      legalNote:
        "Spitzabrechnung: Der gezahlte Betrag wird den Direktkosten des verauslagenden Elternteils zugerechnet und in der abschließenden Abrechnung quotengerecht ausgeglichen.",
      caseLaw: "Ziff. 10.4 OLG-Leitlinien; § 1606 Abs. 3 S. 1 BGB; BGH XII ZB 565/15",
    },
    pkvBeitrag: {
      title: "Monatlicher PKV-Beitrag des Kindes",
      explanation:
        "Tatsächlicher monatlicher Zahlbeitrag für die Kranken- und Pflegepflichtversicherung des Kindes.",
      legalNote: "Stellt echten unterhaltsrechtlichen Mehrbedarf des Kindes dar.",
      caseLaw: "Ziff. 10.4 OLG-Leitlinien",
    },
    pkvZahler: {
      title: "Verauslagender Elternteil für Kindes-PKV",
      explanation: "Gibt an, wer die PKV-Beiträge an das Versicherungsunternehmen überweist.",
      legalNote:
        "Der verauslagte Betrag wird den Direktkosten des jeweiligen Elternteils zugerechnet, sodass der andere Elternteil seinen Quotenanteil im Rahmen der Spitzabrechnung erstattet.",
      caseLaw: "BGH XII ZB 565/15 Rn. 28-30",
    },
    specialNeeds: {
      title: "Sonstiger Mehrbedarf & Sonderbedarf",
      explanation:
        "Regelmäßige sonstige Mehrkosten (z. B. Fahrtkosten für den Kita-/Schultransfer, Kita-/Hortbeiträge, Nachhilfe, Therapien). Der Wohnmehrbedarf wird automatisch oben addiert.",
      legalNote:
        "Wohnmehrbedarf vs. Sonstiger Mehrbedarf (BGH XII ZB 565/15): 1. Wohnmehrkosten werden anhand der Warmmieten und Haushaltsgrößen pro Kopf ermittelt und automatisch addiert. 2. Hier tragen Sie bitte sonstige Mehrbedarfe ein (z. B. Fahrtkosten, Hortbeiträge, Sportverein über dem Tabellenanteil).",
      caseLaw: "BGH XII ZB 565/15 Rn. 24–27; BGHZ 213, 254",
    },
  },

  // ---------------------------------------------------------------------------
  // KENNZAHLEN & ZUSAMMENFASSUNG (CalculationSummary)
  // ---------------------------------------------------------------------------
  summary: {
    combinedNet: {
      title: "Kombiniertes bereinigtes Nettoeinkommen (BGH XII ZB 565/15)",
      explanation: "Summe der bereinigten Nettoeinkünfte beider Elternteile (N_adj,A + N_adj,B).",
      legalNote:
        "Zwingender BGH-Grundsatz (Rn. 18): Das zusammengerechnete Elterneinkommen bestimmt die DT-Einkommensgruppe. Eine Aufspaltung in zwei getrennte Berechnungen nach den Einzeleinkommen ist unzulässig, damit das Kind am gemeinsamen Lebensstandard beider Eltern teilhat.",
      caseLaw: "BGH XII ZB 565/15 Rn. 18 (BGHZ 213, 254)",
    },
    dtTier: {
      title: "Einkommensgruppe Düsseldorfer Tabelle 2026",
      explanation:
        "Die Tabelle umfasst 15 Einkommensgruppen (von bis 2.100 € bis 11.200 € bereinigtes Netto).",
      legalNote:
        "Bedarfssätze nach BGH XII ZB 565/15 Rn. 27: Bei höherem kombinierten Einkommen steigen die Bedarfssätze stufenweise von 100 % bis 200 %; darin sind anteilig auch höhere Beträge für Kultur, Hobbys und Freizeit enthalten.",
      caseLaw: "Düsseldorfer Tabelle 2026; BGH XII ZB 565/15",
    },
    liabilityShareA: {
      title: "Haftungsquote Elternteil A (BGH XII ZB 565/15)",
      explanation: "Anteil von Elternteil A am gesamten Barunterhaltsbedarf.",
      legalNote:
        "Quotelung nach BGH XII ZB 565/15 Rn. 29: Berechnet sich zwingend nach Abzug des angemessenen Selbstbehalts (1.750 €): Q_A = max(0, N_adj,A - 1.750 €) / (H_A + H_B). Eine Quotelung nach dem reinen Netto ohne Selbstbehalt ist rechtsfehlerhaft.",
      caseLaw: "BGH XII ZB 565/15 Rn. 29; BGH XII ZB 599/13",
    },
    liabilityShareB: {
      title: "Haftungsquote Elternteil B (BGH XII ZB 565/15)",
      explanation: "Anteil von Elternteil B am gesamten Barunterhaltsbedarf.",
      legalNote:
        "Quotelung nach BGH XII ZB 565/15 Rn. 29: Berechnet sich nach Abzug des angemessenen Selbstbehalts (1.750 €): Q_B = max(0, N_adj,B - 1.750 €) / (H_A + H_B). Beide Quoten ergeben in der Summe stets genau 100 %.",
      caseLaw: "BGH XII ZB 565/15 Rn. 29; BGH XII ZB 599/13",
    },
  },

  // ---------------------------------------------------------------------------
  // TABELLARISCHE ÜBERSICHT (DetailsTable)
  // ---------------------------------------------------------------------------
  detailsTable: {
    adjustedNet: {
      title: "Bereinigtes Nettoeinkommen",
      explanation:
        "Maßgebliches unterhaltsrechtliches Einkommen (1/12 des Jahres-Gesamtnettos inkl. Boni abzüglich aller zulässigen Abzüge).",
      legalNote:
        "Abzugspositionen: 5%-Berufspauschale, max. 4% zusätzliche Altersvorsorge, berücksichtigungsfähige Verbindlichkeiten, zzgl. Wohnvorteil.",
      caseLaw: "Düsseldorfer Tabelle 2026 Anm. A",
    },
    liabilityIncome: {
      title: "Haftungseinkommen über Selbstbehalt",
      explanation:
        "Einkommensanteil, der den angemessenen Selbstbehalt (SB_ang = 1.750 €) übersteigt.",
      legalNote:
        "Rechtsgrundsatz nach BGH XII ZB 565/15 Rn. 29 & XII ZB 599/13: Nur das Einkommen oberhalb von 1.750 € dient zur Quotenbildung. Unterschreitet ein Elternteil diese Grenze, haftet er rechnerisch mit 0 % (außer im Mangelfall).",
      caseLaw: "BGH XII ZB 565/15 Rn. 29; BGH XII ZB 599/13",
    },
    primaryObligation: {
      title: "Haftungsanteil am Barunterhalt (BGH XII ZB 565/15)",
      explanation:
        "Rechnerischer Barunterhaltsanteil vor Kindergeld- und Direktaufwandsverrechnung (Unterhaltsspitze).",
      legalNote:
        "Spitzabrechnung nach BGH XII ZB 565/15 Rn. 25, 30: Werden tatsächliche Wohnkosten erfasst, werden die direkten Kindes-Wohnkosten (Zahlungen an Vermieter / Dritte) vom Gesamtbedarf abgezogen. Vom verbleibenden Restbedarf für den laufenden Lebensunterhalt leistet jeder Elternteil 50 % als Naturalunterhalt. Vom Haftungsanteil werden dieser 50 %-Naturalunterhalt sowie die eigenen Kindes-Wohnkosten abgezogen.",
      caseLaw: "BGH XII ZB 565/15 Rn. 25, 30 (BGHZ 213, 254)",
    },
    kindergeldAdjustment: {
      title: "Kindergeld-Ausgleich im Innenverhältnis (BGH XII ZB 45/15 & XII ZB 565/15)",
      explanation:
        "Ausgleich des staatlichen Kindergeldes: 25% fixer Betreuungsanteil an den anderen Elternteil zuzüglich dessen Quotenanteil am 50%-Barunterhaltsanteil.",
      legalNote:
        "BGH, Beschluss vom 20.04.2016 – Az. XII ZB 45/15 & BGH XII ZB 565/15 Rn. 32: Das Kindergeld wird in 50 % Betreuungsanteil (je 25 % pro Elternteil einkommensunabhängig) und 50 % Baranteil (Minderung des Barbedarfs nach Haftungsquoten) aufgeteilt. Der Auszahlungsempfänger gleicht den Betreuungsanteil (25 %) und die quotenmäßige Barentlastung des anderen Elternteils aus.",
      caseLaw: "BGH XII ZB 45/15 (FamRZ 2016, 1053); BGH XII ZB 565/15 Rn. 32; § 1612b BGB",
    },
    directExpensesAdjustment: {
      title: "Quotenmäßige Verrechnung direkter Kindesausgaben (BGH XII ZB 565/15)",
      explanation:
        "Quotenmäßige Beteiligung an zentral verauslagten Sach- und Anschaffungskosten für das Kind (z. B. Hort, Schulessen, Kleidung).",
      legalNote:
        "Quotenmäßige Tragung nach BGH XII ZB 565/15 Rn. 28–30: Direktkosten, die ein Elternteil für das Kind aufwendet, sind von beiden Eltern nach ihren Haftungsquoten (Q_A : Q_B) zu tragen. Der andere Elternteil erstattet seinen Quotenanteil (z. B. + Q_A * D_B für Elternteil A).",
      caseLaw: "BGH XII ZB 565/15 Rn. 28–30",
    },
    remainingIncome: {
      title: "Verbleibendes Nettoeinkommen & Selbstbehalt",
      explanation:
        "Nettoeinkommen des Elternteils nach Durchführung der monatlichen Ausgleichszahlung.",
      legalNote:
        "Notwendiger Selbstbehalt: Dem barunterhaltspflichtigen Elternteil müssen nach Zahlung mindestens 1.450 € (erwerbstätig) bzw. 1.200 € (nichterwerbstätig) verbleiben. Andernfalls liegt ein Mangelfall vor.",
      caseLaw: "Düsseldorfer Tabelle 2026 Anm. B.I",
    },
  },
} as const;

/**
 * Konsolidierte Hinweistexte für rechtliche Infoboxen und Statusbanner.
 */
export const LEGAL_NOTICES = {
  // Subsidiaritätsprinzip & Kindeseinkommen (§ 1606 Abs. 3 S. 1 BGB & BGH XII ZB 512/19)
  subsidiarity: {
    header: "ℹ️ Hinweis zu nachrangigen Leistungen (Subsidiaritätsprinzip)",
    text: "Der zivilrechtliche Kindesunterhalt geht staatlichen Fürsorgeleistungen (wie Wohngeld / WoGG) grundsätzlich vor. Fließt dem Kind tatsächlich ein Kinderzuschlag (§ 6a BKGG) zu, gilt dieser nach BGH XII ZB 512/19 als bedarfsdeckendes Kindeseinkommen und mindert den Bedarf vor der Quotenberechnung.",
    legalBasis: "§ 1606 Abs. 3 S. 1 BGB, § 6a BKGG, WoGG, BGH XII ZB 512/19",
  },

  // Bürgergeld & Erwerbslosigkeit (§ 1603 Abs. 2 BGB & § 33 SGB II)
  buergergeld: {
    header: "⚖️ Rechtliche Hinweise: Bürgergeld / Erwerbslosigkeit",
    statusBanner:
      "Bürgergeld-Bezug aktiv: Einkommen, Abzüge und Unterkunftskosten (KdU) sind auf 0,00 € gesetzt. Die Haftungsquote beträgt 0 %.",
    erwerbsobliegenheit:
      "Hinweis zur gesteigerten Erwerbsobliegenheit (§ 1603 Abs. 2 BGB): Gegenüber minderjährigen Kindern besteht eine gesetzliche Verpflichtung zur Vollzeitarbeit. Familiengerichte können bei fehlendem Nachweis intensiver Bewerbungsbemühungen fiktive Einkünfte anrechnen.",
    anspruchsuebergang:
      "Anspruchsübergang (§ 33 SGB II): Unterhalts- und Kindergeldansprüche können kraft Gesetzes auf das Jobcenter übergehen, soweit Bürgergeldleistungen bezogen werden.",
    legalBasis: "§ 1603 Abs. 2 BGB, § 33 SGB II",
  },
} as const;
