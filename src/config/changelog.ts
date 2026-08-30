import type { ChangelogEntry } from "../types/changelog.ts";

export const APP_VERSION = "1.10.0";
export const APP_RELEASE_DATE = "2026-08-30";

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "1.10.0",
    date: "2026-08-30",
    title: "BGH-Kontrollbetrachtung, cent-genaue Quoten, Prüfprotokoll-Export & Desktop-Hover",
    isCurrent: true,
    summary:
      "Umfassendes Update für maximale juristische Präzision und Bedienkomfort: Kontrollbetrachtung zum Abgleich der Barunterhaltspflicht mit dem Einzeleinkommensbedarf (BGH XII ZB 565/15 Rn. 21), cent-genaue Quotenermittlung ohne Zwischenrundungen, 1-Klick-Export des vollständigen Prüfprotokolls in die Zwischenablage sowie ein vollflächiger Desktop-Hover-Tooltip zur bequemen Ansicht langer Prüfschritte ohne Scrollen.",
    categories: [
      {
        category: "legal",
        categoryLabel: "Rechtsprechung & Berechnungspräzision",
        icon: "⚖️",
        items: [
          "BGH-Kontrollbetrachtung & Einzeleinkommensabgleich (BGH XII ZB 565/15 Rn. 21; Leitlinien Nds Ziff. 12.1): Plausibilisierung der errechneten Unterhaltspflicht gegen den fiktiven Tabellenbedarf bei Alleinhaftung nach eigenem Einkommen (U_prim,i ≤ B_tab,i) inklusive transparenter Ausweisung im Prüfprotokoll.",
          "Cent-genaue Quotenermittlung: Die Haftungsquoten (Q_A, Q_B) werden intern vollständig ungerundet geführt, um Rundungsdifferenzen bei Bedarfsanteilen, PKV, Kindergeld und Direktaufwendungen auszuschließen.",
          "Präzisierung des Kindergeld-Splittings (BGH XII ZB 45/15): Formelmäßige Bereinigung und transparente Ausweisung des Entlastungsanspruchs des Nicht-Beziehers mit seiner eigenen Haftungsquote.",
          "Transparenz bei der Berufspauschale: Explizite Kennzeichnung der 150-€-Kappungsgrenze der 5 %-Pauschale für berufsbedingte Aufwendungen (DT 2026 Anm. A.3) im Prüfprotokoll.",
        ],
      },
      {
        category: "feature",
        categoryLabel: "Prüfprotokoll & Benutzeroberfläche",
        icon: "📋",
        items: [
          "Vollständiger Prüfprotokoll-Export: Neue Schaltfläche 'Kopieren' in der Navigationsleiste des Prüfprotokolls kopiert die vollständige 7-Stufen-Prüfung inklusive aller Formeln und Detailrechnungen als formatierten Text in die Zwischenablage.",
          "Desktop-Hover-Tooltip für Prüfschritte: Beim Überfahren eines Schritts mit der Maus auf Desktop-Geräten wird der gesamte Inhalt als schwebendes, vollflächiges Overlay angezeigt, sodass auch bei langen Schritten kein Scrollen erforderlich ist.",
          "Intelligente Viewport-Ausrichtung: Der Hover-Tooltip passt seine vertikale Position automatisch an den Bildschirmrand an und schließt sich bei Scroll-Aktivitäten sofort.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 145 automatisierte Tests zur vollständigen Absicherung der Kontrollrechnung, der ungerundeten Quoten, des Prüfprotokoll-Textformatiers und des Desktop-Hover-Tooltips.",
        ],
      },
    ],
  },
  {
    version: "1.9.2",
    date: "2026-08-30",
    title: "Vereinheitlichte dynamische Bezeichnung der Kinder nach Altersstufen",
    isCurrent: false,
    summary:
      "Die Bezeichnung der Kinder folgt ab sofort dem einheitlichen Standard 'Kind X ([Altersgruppe])' (z. B. 'Kind 1 (6–11 Jahre)', 'Kind 2 (ab 18 Jahre)'). In den vordefinierten Szenarien werden keine abweichenden Namen mehr statisch gesetzt. Ändert der Nutzer im Formular die Altersgruppe eines Kindes, passt sich der Name automatisch und dynamisch in der gesamten Benutzeroberfläche, im Prüfprotokoll und im Export an.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Benutzeroberfläche & Szenarien",
        icon: "✨",
        items: [
          "Dynamische Namensanpassung: Bei manueller Änderung der Altersstufe (0–5 Jahre, 6–11 Jahre, 12–17 Jahre, ab 18 Jahre) aktualisiert sich die Kind-Bezeichnung sofort im Eingabefeld, Prüfprotokoll und Berechnungsbericht.",
          "Standardisierung der Szenarien: Alle Beispielszenarien nutzen die einheitliche Benennung ohne statische Sondernamen wie 'Schulkind' oder 'Volljährig'.",
          "Konsistente Durchnummerierung: Beim Hinzufügen oder Entfernen von Kindern bleiben Bezeichnungen und Nummerierungen nahtlos synchron.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 135 automatisierte Tests zur Sicherstellung der dynamischen Kind-Namensgenerierung und Szenarien-Konsistenz.",
        ],
      },
    ],
  },
  {
    version: "1.9.1",
    date: "2026-08-29",
    title: "Präzisierung & Transparenz des Prüfprotokolls",
    isCurrent: false,
    summary:
      "Umfassende sprachliche und rechnerische Klarstellung im Prüfprotokoll: Einheitliche Verwendung des Begriffs 'Gesamtbedarf des Kindes (B_ges)', transparente Erläuterung der Kindes-Wohnkosten als direkte Mietzahlungen an Vermieter, konkrete Ausweisung aller Zahlenwerte in den Rechenschritten sowie lückenlose Mehrkind-Summierung bei Kindergeld und primärer Barunterhaltspflicht in der Endabrechnung.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Prüfprotokoll & Benutzeroberfläche",
        icon: "🔍",
        items: [
          "Transparente Mehrkind-Summierung: In der Endabrechnung (Spitzabrechnung) und beim Kindergeld-Splitting werden die Unterhaltspflichten aller Kinder einzeln mit Namen aufgeführt und als konkreter Rechenschritt summiert.",
          "Vollständige Zahlenwert-Ausweisung: Alle Abzugs- und Zwischenrechnungen (z. B. Netto-Bereinigung, Quotenanteile, 50 %-Naturalunterhalt, Zahlbetragsermittlung) zeigen jetzt die vollständige mathematische Gleichung mit den konkreten Zahlenwerten.",
          "Verständliche Erläuterung der Kindes-Wohnkosten: Klare Herleitung der tatsächlichen Wohnkosten beider Elternhaushalte und transparente Begründung des Abzugs vor Ermittlung des 50 %-Naturalunterhalts für den laufenden Lebensunterhalt.",
        ],
      },
      {
        category: "legal",
        categoryLabel: "Rechtliche Terminologie & Konsistenz",
        icon: "⚖️",
        items: [
          "Harmonisierte Begrifflichkeiten: Durchgängige und einheitliche Verwendung von 'Gesamtbedarf des Kindes (B_ges)' sowie 'Primäre Barunterhaltspflicht (U_prim)' in allen Schritten.",
          "Klarstellung von 'Drittzahlungen': Präzisierung des Begriffs zu 'direkte Kindes-Wohnkosten (Mietzahlungen an Dritte / Vermieter)'.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 127 automatisierte Tests zur Überprüfung der Mehrkind-Summierungen, Zahlenwert-Transparenz und terminologischen Konsistenz im Audit Trail.",
        ],
      },
    ],
  },
  {
    version: "1.9.0",
    date: "2026-08-28",
    title: "Berechnungen speichern, teilen und per Link weitergeben",
    isCurrent: false,
    summary:
      "Eingegebene Berechnungen können ab sofort ganz einfach über einen Link gespeichert, als Lesezeichen abgelegt oder mit dem anderen Elternteil bzw. Anwälten geteilt werden. Beim Öffnen des Links werden sämtliche Angaben beider Elternteile und der Kinder automatisch in die Eingabefelder eingetragen. Über den neuen Button 'Link kopieren' lässt sich der Link mit einem Klick auf dem Smartphone oder Computer in die Zwischenablage kopieren.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Bedienung",
        icon: "🚀",
        items: [
          "Berechnungen teilen & weitergeben: Alle eingegebenen Angaben für beide Elternteile und alle Kinder können jetzt als persönlicher Link versendet oder abgespeichert werden.",
          "Schaltfläche 'Link kopieren': Mit einem Klick auf den neuen Aktions-Button wird der Link direkt in die Zwischenablage kopiert – inklusive optischer Bestätigung ('✓ Link kopiert!').",
          "Automatisches Ausfüllen beim Öffnen: Beim Aufrufen eines geteilten Links werden alle Formularfelder sofort befüllt und das Ergebnis unmittelbar berechnet.",
          "Automatisches Merken bei Seiten-Neuladen: Ihre Eingaben bleiben auch beim Aktualisieren der Seite (F5) oder beim Setzen eines Lesezeichens im Browser stets erhalten.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 126 automatisierte Tests zur lückenlosen Absicherung der Link-Erstellung, des automatischen Ladens und der Zwischenablage-Funktionen auf allen Geräten.",
        ],
      },
    ],
  },
  {
    version: "1.8.0",
    date: "2026-08-28",
    title: "Konkretisierung des Realkosten-Wohnmehrbedarfs (BGH XII ZB 565/15) & FAQ-Erweiterung",
    isCurrent: false,
    summary:
      "Vollständige unterhaltsrechtliche Präzisierung der Realkosten-Wohnmehrbedarfs-Berechnung nach BGH XII ZB 565/15 Rn. 35 (sowie Wendl/Dose/Klinkhammer, § 2): Liegen tatsächliche Wohnkosten vor, werden die direkten Drittzahlungen (Kindes-Mietkosten beider Haushalte) vom Bruttobedarf abgezogen. Vom verbleibenden Restbedarf für den laufenden Lebensunterhalt erbringt jeder Elternteil exakt 50 % als Naturalunterhalt während seiner Betreuungszeit. Vom individuellen Haftungsanteil werden dieser 50 %-Naturalunterhalt sowie die eigene direkte Kindesmiete als Eigenleistung abgezogen. Ergänzend wurde die FAQ-Sektion um eine umfassende Erläuterung zur BGH-Rechtsprechung und zur 20 %-Tabellenpauschale erweitert.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Benutzeroberfläche",
        icon: "🚀",
        items: [
          "Interaktive Schritt-Navigation im Prüfprotokoll: Neue Vorheriger- und Nächster-Schritt-Schaltflächen zur gezielten Einzelschritt-Navigation ohne manuelles Scrollen sowohl auf Desktop- als auch auf Mobilgeräten inklusive aktiver Stufen-Hervorhebung und Zähleranzeige.",
          "Detailliertes Prüfprotokoll bei Wohnmehrbedarf: Schrittweise Ausweisung des Abzugs direkter Drittzahlungen (Wohnkosten), des Restbedarfs für den laufenden Lebensunterhalt und des 50 %-Naturalunterhalts in den Stufen 'Bedarfsberechnung Kind' und 'Endabrechnung & Zahlbetrag'.",
          "Strukturierte Audit-Trail-Darstellung: Vollständige Herleitung aller Zwischensummen mit mehrzeiligen Abschnitten, Aufzählungspunkten und sauberer Zeilenumbruch-Formatierung für maximale Nachvollziehbarkeit jedes Rechenschritts.",
          "Erweiterte FAQ zum Wohnmehrbedarf: Neuer interaktiver FAQ-Beitrag zur BGH-Rechtsprechung (BGH XII ZB 565/15 Rn. 35; Wendl/Dose/Klinkhammer, § 2) und Erläuterung, warum die 20 %-Tabellenpauschale lediglich das Residenzmodell abbildet und reale Mehrkosten im 50:50-Wechselmodell als Mehrbedarf anzuerkennen sind.",
        ],
      },
      {
        category: "legal",
        categoryLabel: "Rechtsprechung & Rechenkern",
        icon: "⚖️",
        items: [
          "BGH XII ZB 565/15 Rn. 35 & Wendl/Dose/Klinkhammer, § 2 (Eigenleistungsabzug bei Realkosten-Wohnmehrbedarf): Abzug direkter Drittzahlungen (Wohnkosten) vom Bruttobedarf zur Ermittlung des Restbedarfs für den laufenden Lebensunterhalt mit hälftiger Naturalerbringung und Anrechnung der eigenen Kindesmiete.",
          "Harmonisierung des Naturalunterhalts: Exakte 50:50-Verteilung des Restbedarfs für den laufenden Lebensunterhalt kombiniert mit der Anrechnung der realen Wohnraumgewährung im jeweiligen Elternhaushalt.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 109 Tests zur lückenlosen Absicherung der Wohnmehrbedarfs-Formeln, Mehrkind-Konstellationen, Audit-Trail-Navigation und Komponenten-Interaktionen.",
        ],
      },
    ],
  },
  {
    version: "1.7.1",
    date: "2026-08-27",
    title: "Behebung der Tabellen- & Prüfprotokoll-Sichtbarkeit in der Mobilansicht",
    isCurrent: false,
    summary: "Korrektur der Mobilansicht.",
    categories: [
      {
        category: "fix",
        categoryLabel: "Fehlerbehebungen & Stabilität",
        icon: "🐛",
        items: [
          "Die Detail-Tabelle und das Prüfprotokoll waren durch einen Fehler in der Mobilansicht nicht mehr sichtbar.",
        ],
      },
    ],
  },
  {
    version: "1.7.0",
    date: "2026-08-27",
    title: "Kinderzuschlag-Anrechnung (BGH XII ZB 512/19) & Subsidiaritätsprüfung",
    isCurrent: false,
    summary:
      "Vollständige Umsetzung der Rechtsprechung des Bundesgerichtshofs (BGH, Beschluss vom 28.10.2020 - Az. XII ZB 512/19): Tatsächlich zufließender staatlicher Kinderzuschlag nach § 6a BKGG gilt in voller Höhe (100 %) als bedarfsdeckendes Kindeseinkommen und mindert den Gesamtbedarf des Kindes vor der Quotenberechnung (Zuflussprinzip). Ergänzend wurden das unterhaltsrechtliche Subsidiaritätsprinzip (§ 1606 Abs. 3 S. 1 BGB) bei nachrangigen Fürsorgeleistungen wie Wohngeld.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Benutzeroberfläche",
        icon: "🚀",
        items: [
          "Kinderzuschlag-Eingabefeld je Kind: Erfassung des tatsächlich monatlich bezogenen Kinderzuschlags (§ 6a BKGG) mit Live-Berechnung des verbleibenden Restbedarfs (B_rest = max(0, B_ges - Kinderzuschlag)) in der Bedarfsübersicht.",
          "Kontextuelle Infobox zu nachrangigen Leistungen: Automatische Einblendung eines rechtlichen Hinweises im Auswertungsbereich, wenn das bereinigte Netto eines Elternteils nahe oder unter dem Selbstbehalt (1.750 € bzw. 1.450 €) liegt.",
          "FAQ-Erweiterung zu Sozialleistungen: Neuer interaktiver FAQ-Eintrag zur BGH-Differenzierung von Kinderzuschlag (§ 6a BKGG / BGH XII ZB 512/19), Wohngeld (WoGG) und Unterhaltsvorschuss (UVG).",
        ],
      },
      {
        category: "legal",
        categoryLabel: "Rechtsprechung & Rechenkern",
        icon: "⚖️",
        items: [
          "BGH XII ZB 512/19 (100 % Bedarfsanrechnung vor Quotenverteilung): Der Kinderzuschlag mindert als Kindeseinkommen den Gesamtbedarf vor der Ermittlung der Haftungsanteile und vor Abzug des 50 %igen Naturalunterhalts.",
          "Subsidiaritätsprinzip (§ 1606 Abs. 3 S. 1 BGB): Zivilrechtlicher Kindesunterhalt geht staatlichen Fürsorgeleistungen (wie Wohngeld) grundsätzlich vor; Aufnahme der Prüfung in das schrittweise Prüfprotokoll.",
          "Prüfprotokoll-Schritt: Detaillierte Ausweisung des Abzugsschritts '- Anzurechnendes Einkommen Kind (Kinderzuschlag § 6a BKGG)' mit mathematischer Formel und BGH-Fundstelle.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Zentralisierung aller Hinweistexte (legalTexts.ts): Konsolidierung aller Tooltips, rechtlichen Erläuterungen und Infobox-Inhalte in einer zentralen Single Source of Truth (SSoT) zur vereinfachten Wartung.",
          "Erweiterung der Testsuite auf 96 Tests inklusive Verifikation der 100 %igen Bedarfsdeckung des Kinderzuschlags, des Subsidiaritätsprinzips und der konsolidierten Hinweistexte.",
        ],
      },
    ],
  },
  {
    version: "1.6.0",
    date: "2026-08-27",
    title: "Private Kranken- und Pflegeversicherung (PKV/PPV) für Eltern und Kinder",
    isCurrent: false,
    summary:
      "Vollständige Integration der Beiträge zur privaten Kranken- und Pflegeversicherung (PKV/PPV) für Elternteile (Einkommensbereinigung der Basisabsicherung abzüglich Arbeitgeberzuschuss/Beihilfe nach § 10 Abs. 1 Nr. 3 EStG & Ziff. 10.4 OLG-Leitlinien) und für Kinder (Mehrbedarf mit Verteilung nach Haftungsquoten und Erfassung in der Direktkosten-Spitzabrechnung).",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Benutzeroberfläche",
        icon: "🚀",
        items: [
          "PKV-Einkommensmaske Eltern: Checkbox 'Privat krankenversichert (PKV)' mit Eingabefeldern für Monats-/Jahresbasisbetrag (Basisabsicherung inkl. Pflegepflichtversicherung) und steuerfreien Arbeitgeberzuschuss bzw. Beihilfe.",
          "Automatischer PKV-Eigenanteil: Automatische Berechnung und Ausweisung des abzugsfähigen PKV-Eigenanteils (Basis minus Zuschuss) in Eingabemaske und Prüfprotokoll.",
          "PKV-Bedarfsmaske Kind: Checkbox 'Kind ist privat krankenversichert' mit Eingabefeld für den monatlichen PKV-Beitrag des Kindes und Auswahl des verauslagenden Elternteils (Elternteil A, Elternteil B oder hälftig).",
          "Erweiterte FAQ & Rechtsinformationen: Neue FAQ-Sektion zur steuer- und unterhaltsrechtlichen Behandlung von PKV-Beiträgen nach § 10 Abs. 1 Nr. 3 EStG und Ziff. 10.4 OLG-Leitlinien.",
        ],
      },
      {
        category: "legal",
        categoryLabel: "Rechtsprechung & Rechenkern",
        icon: "⚖️",
        items: [
          "Einkommensbereinigung (§ 10 Abs. 1 Nr. 3 EStG / Ziff. 10.4 OLG-Leitlinien): Abzug des tatsächlichen Eigenanteils für die Basisabsicherung (ohne nicht abzugsfähige Wahlleistungen) bei der Ermittlung des bereinigten Nettoeinkommens.",
          "Kindes-PKV als Mehrbedarf: Gesetzliche Einstufung der kindlichen PKV als unterhaltsrechtlicher Mehrbedarf mit Verteilung nach den ermittelten Haftungsquoten (Q_A : Q_B).",
          "Direktkosten-Spitzabrechnung: Nahtlose Verrechnung der vom zahlenden Elternteil verauslagten Kindes-PKV im Rahmen der Spitzabrechnung nach BGH XII ZB 565/15.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 84 Tests inklusive exakter Verifikation der BGH- und OLG-Leitfallberechnungen für Eltern- und Kindes-PKV.",
        ],
      },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-08-27",
    title: "Mehrseitige Druckansicht mit Prüfprotokoll auf Folgeseite",
    isCurrent: false,
    summary:
      "Erweiterung der Druckfunktion zur Erstellung eines mehrseitigen, gerichtsfesten Dokuments: Seite 1 enthält das Abrechnungsergebnis und die tabellarische Übersicht, während Seite 2 nahtlos das vollständige 7-Stufen-Prüfprotokoll nach BGH-Rechtsprechung mit Formeln und Erläuterungen abbildet.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Benutzeroberfläche",
        icon: "🚀",
        items: [
          "Mehrseitige Druckausgabe: Beim Drucken (oder PDF-Export) werden unabhängig vom aktuell gewählten Bildschirm-Tab sowohl die tabellarische Ergebnisübersicht (Seite 1) als auch das schrittweise Prüfprotokoll (Seite 2) gerendert.",
          "Druck-Kopfzeile für Prüfprotokoll: Eindeutige Kennzeichnung des Prüfprotokolls mit Verweis auf die zugrundeliegenden BGH-Beschlüsse und die Düsseldorfer Tabelle 2026.",
          "Optimierte Drucktypografie: Feste Seitenumbruch-Vermeidung innerhalb einzelner Prüfschritte (break-inside: avoid) für sauberes Schriftbild.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Automatisierte Integrationstests zur Verifikation der DOM-Präsenz beider Ergebnisbereiche, korrekter Druck-CSS-Klassen und Umschaltlogik der Tabs.",
        ],
      },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-08-27",
    title: "Option Bürgergeld / Nicht erwerbstätig, Quotenberechnung & rechtliche Hinweise",
    isCurrent: false,
    summary:
      "Vollständige Integration der Option 'Bürgergeld-Bezug / Nicht erwerbstätig' mit automatischer Null-Bereinigung, 0 %-Haftungsquote, einkommensunabhängigem Kindergeld-Betreuungsanteil (25 %) und fundierten Hinweisen zur gesteigerten Erwerbsobliegenheit.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Benutzeroberfläche",
        icon: "🚀",
        items: [
          "Bürgergeld-Option im Formular: Checkbox 'Bürgergeld-Bezug / Nicht erwerbstätig' für beide Elternteile mit sofortiger Null-Setzung und Deaktivierung aller Einkommens- und Abzugsfelder.",
          "Unterkunftskosten & KdU: Automatische Deaktivierung der Warmmiete bei Bürgergeld mit transparentem Hinweis auf Übernahme der Kosten der Unterkunft durch das Jobcenter.",
          "Rechtliche Hinweismeldungen: Automatische Einblendung fundierter Hinweise zur gesteigerten Erwerbsobliegenheit (§ 1603 Abs. 2 BGB, fiktives Einkommen) und zum gesetzlichen Anspruchsübergang auf das Jobcenter (§ 33 SGB II).",
          "Neues Preset-Szenario: Vordefiniertes Szenario 'Bürgergeld-Bezug / Nicht erwerbstätig (42k € / 0 €, 1 Kind)' zur schnellen Demonstration.",
        ],
      },
      {
        category: "legal",
        categoryLabel: "Rechtsprechung & Rechenkern",
        icon: "⚖️",
        items: [
          "Quotenberechnung: Strikt 0 % Haftungsquote für den Bürgergeld-Empfänger und 100 % für den leistungsfähigen Elternteil.",
          "Kindergeld-Ausgleich (BGH XII ZB 45/15): Garantierte Auszahlung des einkommensunabhängigen Betreuungsanteils von 25 % (64,75 €) an den Bürgergeld-Empfänger bei Kindergeldbezug durch den anderen Elternteil.",
          "Selbstbehalt im Mangelfall: Berücksichtigung des notwendigen Selbstbehalts für Nichterwerbstätige (1.200 € statt 1.450 €).",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Testsuite & Qualitätssicherung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 72 Tests zur lückenlosen Absicherung aller Bürgergeld-Szenarien, Quoten, Kindergeldausgleiche und Formularvalidierungen.",
        ],
      },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-08-27",
    title: "Flexible Zeitraum-Umschaltung (Monat / Jahr) & Monatsbasis als Standard",
    isCurrent: false,
    summary:
      "Vollständige Umstellung der Standard-Eingabewerte auf benutzerfreundliche Monatsbasis mit kompakter, eleganter Umschaltung zwischen '€ / Monat' und '€ / Jahr' bei deterministischer Jahresrechnung im Rechenkern.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Benutzeroberfläche",
        icon: "🚀",
        items: [
          "Monatsbasis als Standard: Bruttoeinkommen, Nettoeinkommen, Altersvorsorge, berücksichtigungsfähige Schulden, direkte Kindesausgaben und Wohnvorteil starten intuitiv im Monatsmodus.",
          "Kompakter Zeitraum-Umschalter: Nahtlose Umschaltung zwischen '€ / Mo' und '€ / Jahr' pro Feld.",
          "Automatische Äquivalenzanzeige: Dynamischer Hinweistext unter jedem Feld zeigt in Echtzeit das Jahres- bzw. Monatsäquivalent an.",
          "Konsistente Ausrichtung: Bündige Eingabefelder und rechtsbündig ausgerichtete Hilfe-Buttons.",
          "Fixe Höhen-Harmonisierung: Die Ergebnisspalte schließt auf Desktop bündig mit der Eingabespalte ab und behält beim Wechsel zwischen Tabellarischer Übersicht und Prüfprotokoll eine absolut stabile Höhe.",
          "Mobile Optimierung: Vollständig responsives Layout ohne horizontales Scrollen auf Smartphones.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Komponenten & Testsuite",
        icon: "🔧",
        items: [
          "Wiederverwendbare Komponenten PeriodToggle und PeriodNumericField mit vollständiger Barrierefreiheit (aria-pressed, barrierefreie Labels).",
          "Erweiterung der Testsuite auf 68 Unit- und Integrationstests zur lückenlosen Absicherung der Zeitraum-Umschaltung und Rechengenauigkeit.",
        ],
      },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-08-26",
    title: "SEO-Optimierung, Schema.org Rich Snippets & FAQ-Bereich",
    isCurrent: false,
    summary:
      "Suchmaschinenoptimierung (SEO) mit Schema.org JSON-LD (WebApplication & FAQPage), barrierefreier FAQ-Sektion, OpenGraph-Social-Vorschau, sitemap.xml und robots.txt.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Barrierefreiheit",
        icon: "🚀",
        items: [
          "Barrierefreie FAQ-Sektion mit 6 zentralen familienrechtlichen Fragen und BGH-Zitaten zur Verbesserung der Nutzerführung und Auffindbarkeit.",
          "Social-Sharing-Optimierung: Hochauflösendes OpenGraph- und Twitter-Vorschaubanner (1200x630) für geteilte Links in Messengern und sozialen Netzwerken.",
        ],
      },
      {
        category: "performance",
        categoryLabel: "Suchmaschinenoptimierung & Crawler-Infrastruktur",
        icon: "🔍",
        items: [
          "Schema.org strukturierte Daten (JSON-LD) für Google Rich Snippets (WebApplication und FAQPage).",
          "Bereitstellung von public/robots.txt, public/sitemap.xml, public/site.webmanifest und kanonischem Link zur Indexierungsbeschleunigung.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Wartung & Testsuite",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 60 Unit-Tests inklusive Komponenten-Tests für die FAQ-Sektion.",
        ],
      },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-08-25",
    title: "Rechtliche Präzisierung & BGH-Kindergeld-Splitting",
    isCurrent: false,
    summary:
      "Vollständige Implementierung des zweistufigen Kindergeld-Splittings nach BGH XII ZB 45/15 und § 1612b BGB sowie Einführung des isolierten Kindergeldausgleichsanspruchs und des interaktiven Changelog-Modals.",
    categories: [
      {
        category: "legal",
        categoryLabel: "Rechtliche Konformität & BGH-Rechtsprechung",
        icon: "⚖️",
        items: [
          "BGH, Beschluss vom 20.04.2016 – Az. XII ZB 45/15 & § 1612b BGB: Trennung des Kindergeldes in 50 % Betreuungsanteil (je 25 % fix pro Elternteil) und 50 % Baranteil (Verrechnung nach Haftungsquoten).",
          "Isolierter Ausgleichsanspruch („Ein-Viertel-Regel“): Berechnung des 25 %-Mindestausgleichs bei fehlender Gesamtabrechnung oder ohne Einkommensnachweise (Funktion calculateIsolatedKindergeldClaim).",
          "Verifikation und Vergleich gegen OLG Dresden (20 UF 851/15) zur Sicherstellung höchstrichterlicher Rechengenauigkeit.",
        ],
      },
      {
        category: "feature",
        categoryLabel: "Neue Funktionen & Erweiterungen",
        icon: "🚀",
        items: [
          "Konfigurierbares staatliches Kindergeld: Standardwert für 2026 (259 €) mit Schnellwahlschaltflächen für 2025 (255 €) und 2024 (250 €) sowie benutzerdefinierter Eingabe.",
          "Interaktives Versions- & Changelog-Modal mit Zeitstrahl-Ansicht und Deep-Link-Unterstützung (#changelog).",
          "Erweiterte Ergebnis-Zusammenfassung für die Zwischenablage mit vollständiger Aufschlüsselung der Rechenschritte.",
        ],
      },
      {
        category: "maintenance",
        categoryLabel: "Wartung, Tests & Lokalisierung",
        icon: "🔧",
        items: [
          "Erweiterung der Testsuite auf 56 Unit-Tests zur Validierung aller Rechenschritte und UI-Komponenten.",
          "Vollständige Lokalisierung aller Quellcode-Kommentare, Docstrings, CSS-Abschnitte und Testbeschreibungen auf Deutsch gemäß AGENTS.md.",
        ],
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-08-24",
    title: "Initialer Release & Düsseldorfer Tabelle 2026",
    isCurrent: false,
    summary:
      "Erste Version des Kindesunterhaltsrechners für das paritätische Wechselmodell (50:50) mit Düsseldorfer Tabelle 2026 und BGH-7-Schritte-Schema.",
    categories: [
      {
        category: "feature",
        categoryLabel: "Kernfunktionen",
        icon: "🚀",
        items: [
          "Deterministische 7-Schritte-Spitzabrechnung nach BGH XII ZB 565/15 und BGH XII ZB 599/13.",
          "Düsseldorfer Tabelle 2026 mit 15 Einkommensstufen und 4 Altersstufen.",
          "Vordefinierte Beispielszenarien: BGH-Standardfall, Mehrkind & Wohnmehrbedarf, Mangelfall und Spitzenverdiener.",
          "Gerichtsfestes Druck-Stylesheet für saubere Papierausdrucke und PDF-Speicherung.",
          "Audit-Trail mit detaillierter Erläuterung aller Formeln und BGH-Randnummern.",
        ],
      },
    ],
  },
];
