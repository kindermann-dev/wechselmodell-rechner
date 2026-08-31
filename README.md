# Wechselmodell Kindesunterhaltsrechner (50:50)

[![CI Test Suite](https://github.com/kindermann-dev/wechselmodell-rechner/actions/workflows/ci.yml/badge.svg)](https://github.com/kindermann-dev/wechselmodell-rechner/actions/workflows/ci.yml)
[![Publish to GitHub Pages](https://github.com/kindermann-dev/wechselmodell-rechner/actions/workflows/publish.yml/badge.svg)](https://github.com/kindermann-dev/wechselmodell-rechner/actions/workflows/publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

Open-Source-Rechner zur Ermittlung von Unterhaltsquoten, Wohnmehrbedarf und Kindergeldausgleich im 50:50-Wechselmodell nach aktuellen BGH-Urteilen (Düsseldorfer Tabelle 2026).

## Rechtliche Grundlagen & Systematik

Im paritätischen Wechselmodell betreuen beide Elternteile das Kind zu gleichen Teilen (~15 Tage pro Monat). Da beide Elternteile Naturalunterhalt leisten, sind **beide Elternteile im Verhältnis ihrer finanziellen Leistungsfähigkeit barunterhaltspflichtig** (§ 1606 Abs. 3 S. 1 BGB). Die Freistellungsklausel des Residenzmodells (§ 1606 Abs. 3 S. 2 BGB) greift nicht.

### Das 7-Schritte-Berechnungsschema des BGH (XII ZB 565/15)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Bereinigtes Netto beider Eltern (N_adj,A / N_adj,B)                 │
│    (inkl. Boni, 5% Berufsaufwand, max. 4% Altersvorsorge, Schulden)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 2. Kombiniertes Nettoeinkommen & Düsseldorfer Tabelle                  │
│    N_comb = N_adj,A + N_adj,B ──► Bestimmung der Einkommensgruppe      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 3. Haftungseinkommen & Quotenbildung (BGH XII ZB 599/13)               │
│    H_A = max(0, N_adj,A - 1.750 €); H_B = max(0, N_adj,B - 1.750 €)    │
│    Q_A = H_A / (H_A + H_B); Q_B = H_B / (H_A + H_B)                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 4. Bedarfsermittlung & Barunterhaltsspitze (abzgl. 50% Natural)        │
│    B_ges = B_tab + Wohnmehrbedarf + Sonst. Mehrbedarf                  │
│    U_prim,A = B_ges * Q_A - 0,5 * B_ges                                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 5. Quotenmäßige Direktkosten- & Kindergeldverrechnung                  │
│    ΔD_A = Q_A * D_B - Q_B * D_A                                        │
│    ΔKG_Nicht-Bezieher = -(0,25 * KG + Q_eigen * 0,50 * KG)             │
│    ΔKG_Bezieher = +(0,25 * KG + Q_Nicht-Bezieher * 0,50 * KG)          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 6. Spitzabrechnung (Zahlbetrag Z_A)                                    │
│    Z_A = U_prim,A + ΔD_A + ΔKG_A  (Z_B = -Z_A)                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 7. Selbstbehaltskontrolle                                              │
│    Prüfung auf Unterschreitung des notwendigen Selbstbehalts           │
└────────────────────────────────────────────────────────────────────────┘
```

## Rechtliche Besonderheiten im Detail

### 1. Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 35 & Berechnungsmethoden)

- **Problem**: Im Wechselmodell halten beide Elternteile ein voll ausgestattetes Kinderzimmer vor, wodurch reale Mehrkosten entstehen können (_BGH XII ZB 565/15 Rn. 35_).
- **Berechnungsmethoden**:
  1. **Kein Wohnmehrbedarf**: Der Tabellenbedarf nach Düsseldorfer Tabelle deckt Wohnkosten pauschal ab.
  2. **Methode 1 (Pauschal nach Haushaltsgröße / Kopfzahl)**: Warmmiete geteilt durch Haushaltsgröße je Elternteil (vereinfachte Methode).
  3. **Methode 2 (Konkrete Wohnkosten pro Kind / Quadratmeter-Methode)**: Gerichtlich anerkannte Methode über Quadratmetermiete $\times$ Kindeswohnfläche.
- **20 %-Tabellenabzug**: Der Tabellenbedarf nach Düsseldorfer Tabelle enthält statistisch bereits einen pauschalen Wohnkostenanteil von $20\ \%$ ($0{,}20 \times B_{\text{tab}}$).
- **Wohnmehrbedarf**: Der übersteigende Betrag wird als Kindesmehrbedarf zugeschlagen und nach Haftungsquoten verteilt:
  $$\text{Wohnmehrbedarf} = \max\left(0,\ \text{Tatsächlicher Wohnbedarf} - 0{,}20 \times B_{\text{tab}}\right)$$

### 2. Quotenmäßige Aufteilung direkter Kindesausgaben (BGH XII ZB 565/15 Rn. 28–30)

- Sachkosten und Anschaffungen für das Kind (z. B. Hortgebühren, Schulessen, Kleidung, Schulbedarf), die ein Elternteil zentral verauslagt, sind **im Verhältnis der Haftungsquoten ($Q_A : Q_B$)** zu teilen.
- Netto-Ausgleich für Elternteil A:
  $$\Delta D_A = Q_A \cdot D_B - Q_B \cdot D_A$$

### 3. Zweistufiges Kindergeld-Splitting (BGH, Beschluss vom 20. April 2016 – Az. XII ZB 45/15 & § 1612b BGB)

- Nach dem Grundsatzbeschluss des **Bundesgerichtshofs (BGH XII ZB 45/15)** wird das staatliche Kindergeld (2026: 259 € pro Monat und Kind) im paritätischen Wechselmodell zweistufig aufgeteilt:
  1. **50 % Betreuungsanteil**: Steht beiden Elternteilen zu gleichen Teilen zu (**je 25 % fix und einkommensunabhängig** als Ausgleich für die erbrachte Betreuungsleistung).
  2. **50 % Barunterhaltsanteil**: Mindert den kindlichen Barbedarf und wird **im Verhältnis der individuellen Haftungsquoten ($Q_A : Q_B$)** verrechnet.
- Der Elternteil, der das Kindergeld von der Familienkasse ausbezahlt bekommt, leistet daher an den anderen Elternteil:
  $$\Delta KG_{\text{Bezieher}} = 0{,}25 \cdot KG + Q_{\text{anderer}} \cdot 0{,}50 \cdot KG$$
- **Isolierter Mindestausgleich („Ein-Viertel-Regel“)**: Liegen keine Einkommensnachweise vor oder wird keine Gesamtunterhaltsabrechnung durchgeführt, hat der nicht-beziehende Elternteil einen sofortigen Zahlungsanspruch auf **mindestens 25 % des Kindergeldes** ($0{,}25 \times 259\ € = 64{,}75\ €$ je Kind im Jahr 2026).

### 4. Abgrenzung zur asymmetrischen Betreuung (BGH XII ZB 415/25, XII ZB 234/13, XII ZB 599/13)

- Das Wechselmodell gilt nur bei **paritätischer 50:50-Betreuung**.
- Asymmetrische Betreuungsmodelle (z. B. 40:60 oder 30:70) gelten rechtlich als **Residenzmodell mit erweitertem Umgang** (§ 1606 Abs. 3 S. 2 BGB, § 1629 Abs. 2 S. 2 BGB).
- Der Mitbetreuende schuldet vollen Barunterhalt, kann jedoch durch:
  1. Eine **Herabstufung um eine Einkommensgruppe** in der Düsseldorfer Tabelle sowie
  2. Einen **pauschalen Bedarfsabzug von 10 % (maximal 15 %)** für ersparte Aufwendungen entlastet werden.

## Genutzte Rechtsprechungen

| Aktenzeichen / Gericht       | Fundstelle       | Kernaussage für die Berechnungs-Architektur                                                                                                                                                                           |
| :--------------------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BGH XII ZB 565/15**        | BGHZ 213, 254    | **Leitentscheidung Wechselmodell:** 7-Schritte-Berechnung, Bedarfsbemessung nach beiderseitigem Einkommen, Realkosten-Wohnmehrbedarf (Rn. 35), Quotenaufteilung von Direktkosten (Rn. 28–30), Naturalunterhaltsabzug. |
| **BGH XII ZB 599/13**        | FamRZ 2015, 236  | **Haftungsquoten (05.11.2014):** Quotelung erfolgt strikt anhand des bereinigten Nettoeinkommens abzüglich des _angemessenen_ Selbstbehalts ($1.750\ €$).                                                             |
| **BGH XII ZB 45/15**         | FamRZ 2016, 1053 | **Kindergeld-Splitting (20.04.2016):** Zweistufige Verrechnung in 50 % Betreuungsanteil (je 25 % fix) und 50 % Baranteil (nach Haftungsquoten) sowie isolierter 25 %-Ausgleichsanspruch („Ein-Viertel-Regel“).        |
| **BGH XII ZB 234/13**        | FamRZ 2014, 917  | **Abgrenzung zum erweiterten Umgang (12.03.2014):** Asymmetrische Betreuung (z. B. 40:60) bleibt Residenzmodell; Entlastung nur über Tabellenherabstufung & Bedarfsabzug (10–15 %).                                   |
| **BGH XII ZB 415/25**        | FamRZ 2026       | **Erweiterter Umgang & Bedarfsabzug (15.04.2026):** Bestätigung der 10–15 % Bedarfsabzugsgrenzen und Abgrenzung zum echten 50:50-Wechselmodell (§ 1606 Abs. 3 BGB, § 1629 Abs. 2 S. 2 BGB).                           |
| **BGH XII ZR 149/01**        | BGHZ 154, 247    | **Altersvorsorge:** Zusätzliche private Altersvorsorge ist auf maximal $4\ \%$ des Gesamt-Bruttoeinkommens gedeckelt.                                                                                                 |
| **OLG Dresden 20 UF 851/15** | FamRZ 2016, 1275 | **Historische Spitzabrechnung:** Detaillierte Prüfung von Kindesmehrbedarf und Verrechnungslogik im Innenverhältnis.                                                                                                  |

## 💻 Technologie-Stack & Architektur

- **Frontend-Framework**: React 19 & TypeScript
- **Build-Tool**: Vite 8
- **Styling**: Maßgeschneidertes CSS-Designsystem (Design Tokens, HSL-Farbpalette, Responsive Grid & Print Styles)
- **Testing**: Vitest 4 (Happy-DOM, 60 umfassende Unit-Tests zur Validierung gegen historische BGH- und OLG-Urteile, Rechtskomponenten und Versionsverwaltung)
- **Codequalität & Tooling**: Oxlint, Stylelint, HTMLHint, Prettier, Husky, Lint-Staged
- **CI/CD**: GitHub Actions (Automatische Lint-, Test-, Build- & Audit-Validierung + GitHub Pages Deployment)

### Projektstruktur

```
src/
├── types/
│   ├── config.ts              # Altersstufen, DT-Tabellenstufen
│   ├── input.ts               # Input-Modelle (Eltern, Einkommen, Warmmiete, Kinder)
│   ├── output.ts              # Berechnungsergebnisse, Quoten, Audit-Log-Einträge
│   ├── legal.ts               # Typdefinitionen für Impressum & Datenschutz
│   └── changelog.ts           # Typdefinitionen für Versionsverwaltung & Changelog
├── config/
│   ├── dtTable2026.ts         # Düsseldorfer Tabelle 2026 (15 Einkommensstufen) & Standardparameter
│   ├── scenarios.ts           # Vorkonfigurierte Beispielszenarien
│   ├── changelog.ts           # Strukturierte Versionshistorie & Metadaten
│   ├── legalConfig.ts         # Base64-Dekodierung & CI/CD-Injektion
│   └── __tests__/             # Tests für Konfigurationen & Changelog
├── calculator/
│   ├── rounding.ts            # Währungs- & Rundungsutilities (round2, round4, clamp)
│   ├── incomeEngine.ts        # Bereinigtes Nettoeinkommen (Pauschale 5%, Altersvorsorge max. 4%)
│   ├── custodyEngine.ts       # Kern-Rechenalgorithmus für die 7-Schritte-Spitzabrechnung
│   ├── betreuungsunterhaltEngine.ts # Betreuungsunterhalt § 1615l BGB bei Kleinkindern (< 3 J.)
│   └── custodyEngine.test.ts  # Vitest Unit-Tests mit exakten BGH-Referenzfällen
├── components/
│   ├── Header.tsx             # Titel, Beschreibung, Versionsbadge und BGH-Badges
│   ├── ActionBar.tsx          # Szenario-Auswahl, Kopieren, Drucken, Zurücksetzen
│   ├── ParentInputCard.tsx    # Eingabeformular je Elternteil (Einkommen, Vorsorge, Berufsaufwand, Schulden)
│   ├── ChildrenInputCard.tsx  # Kinder-Verwaltung, Altersstufen & Wohnmehrbedarf-Liveanzeige
│   ├── SettlementBanner.tsx   # Prominentes Zahlbetrags-Ergebnisbanner
│   ├── CalculationSummary.tsx # KPI-Metriken (Kombiniertes Netto, Quoten, DT-Stufe)
│   ├── DetailsTable.tsx       # Tabellarische Übersicht aller Berechnungspositionen
│   ├── AuditTrailList.tsx     # Schrittweises Prüfprotokoll mit Formeln & BGH-Randnummern
│   ├── Tooltip.tsx            # Rechtliche Popover-Tooltips (tabIndex-optimiert)
│   ├── NumericInput.tsx       # Entprellte, string-gepufferte Zahleneingabekomponente
│   ├── FaqSection.tsx         # Barrierefreie FAQ-Sektion & SEO-Content mit BGH-Zitaten
│   ├── Footer.tsx             # Rechtshinweis, Versions-Link, Impressum/Datenschutz-Trigger
│   ├── changelog/             # Interaktives Versions- & Changelog-Modal
│   │   ├── ChangelogModal.tsx
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── legal/                 # Impressum & Datenschutzerklärung Modal & ObfuscatedContact
│   │   ├── LegalModal.tsx
│   │   ├── ObfuscatedContact.tsx
│   │   ├── ImpressumContent.tsx
│   │   ├── PrivacyPolicyContent.tsx
│   │   └── __tests__/
│   └── index.ts               # Komponenten-Exporte
├── scripts/
│   └── generateChangelogMd.ts # SSoT Generator für CHANGELOG.md aus changelog.ts
├── public/
│   ├── favicon.svg            # Vektor-App-Icon
│   ├── og-image.svg           # 1200x630 OpenGraph & Twitter Social-Vorschau-Banner
│   ├── robots.txt             # Crawler-Wegweiser für Suchmaschinen
│   ├── sitemap.xml            # XML-Sitemap mit kanonischer URL
│   └── site.webmanifest       # Web-App-Manifest für PWA- & Mobile-Installationen
├── App.tsx                    # Hauptanwendung mit Deep-Linking (#impressum, #datenschutz, #changelog)
├── main.tsx                   # React Einstiegspunkt
├── vite-env.d.ts              # Globale Typdefinitionen für __LEGAL_CONFIG_B64__
└── index.css                  # UI Design System, Themes, Modal, FAQ & Print-Styles
CHANGELOG.md                   # Vollständiges Änderungsprotokoll (automatisch generiert via SSoT)
```

## Installation & Lokale Ausführung

### Voraussetzungen

- Node.js (Version 24 oder neuer)
- npm

### Installation

```bash
git clone https://github.com/kindermann-dev/wechselmodell-rechner.git
cd wechselmodell-rechner
npm install
```

### Entwicklungsbefehle

- `npm run dev`: Startet die lokale Entwicklungsumgebung mit Hot Module Replacement (Vite).
- `npm run build`: Führt die TypeScript-Typprüfung durch und erstellt das optimierte Produktions-Bundle (`tsc -b && vite build`).
- `npm run preview`: Startet einen lokalen Vorschau-Server für das erstellte Produktions-Bundle.
- `npm run changelog:generate`: Generiert `CHANGELOG.md` deterministisch aus `src/config/changelog.ts` (Single Source of Truth).
- `npm run changelog:check`: Prüft die Konsistenz zwischen `src/config/changelog.ts`, `package.json` und `CHANGELOG.md`.
- `npm run test` / `npm run test:ci`: Führt alle Unit- und Integrationstests im Headless-Modus aus (Vitest).
- `npm run test:watch`: Startet den Vitest-Test-Runner im interaktiven Beobachtungsmodus.
- `npm run lint`: Prüft den gesamten Code mit Oxlint (JS/TS), Stylelint (CSS) und HTMLHint (HTML).
- `npm run lint:fix`: Behebt automatisch reparierbare Linter-Fehler in JS/TS und CSS.
- `npm run format`: Formatiert alle Quellcode-, Stylesheet- und Markdown-Dateien mit Prettier.
- `npm run format:check`: Prüft, ob alle Dateien den Prettier-Formatierungsregeln entsprechen.
- `npm run release:check`: Führt den vollständigen Verifikations- und QA-Durchlauf aus (Changelog-Check + Linting + Testing + Build + Audit).
- `npm run analyze`: Erstellt das Produktions-Bundle im Analyse-Modus zur Visualisierung der Chunk- und Asset-Größen.
- `npm run audit`: Prüft alle Abhängigkeiten auf bekannte Sicherheitslücken (`npm audit`).
- `npm run audit:fix`: Behebt bekannte Sicherheitslücken in Abhängigkeiten automatisch (`npm audit fix`).
- `npm run clean`: Bereinigt Build-Artefakte und Test-Coverage (`dist/`, `coverage/`).
- `npm run prepare`: Initialisiert die lokalen Git-Hooks via Husky.

## Deployment auf GitHub Pages & Impressum-Konfiguration

Die Veröffentlichung erfolgt vollautomatisch über GitHub Actions Workflow [`.github/workflows/publish.yml`](.github/workflows/publish.yml):

1. **GitHub Pages aktivieren**: Im GitHub-Repository unter `Settings -> Pages -> Build and deployment` die Source auf **GitHub Actions** stellen.
2. **Impressums- und Datenschutzdaten hinterlegen (Optional)**:
   In GitHub unter `Settings -> Secrets and variables -> Actions` können folgende Repository Secrets hinterlegt werden (siehe [`.env.example`](.env.example)):
   - `LEGAL_NAME`, `LEGAL_STREET`, `LEGAL_CITY`, `LEGAL_COUNTRY`
   - `LEGAL_PHONE`, `LEGAL_EMAIL`, `PRIVACY_EMAIL`
   - `LEGAL_EDITORIAL_NAME`, `LEGAL_EDITORIAL_STREET`, etc.
     _(Werden keine Secrets hinterlegt, werden neutrale Musterdaten verwendet)._
3. **Automatischer Build & Release**:
   Bei jedem Push auf `main` führt GitHub Actions `npm run release:check` aus, kodiert alle Kontaktdaten sicher in Base64 zur Scraper-Abwehr und deployt das `dist/`-Artefakt auf GitHub Pages.

## Mitwirken / Contributing

Beiträge von Entwicklern und Fachanwälten für Familienrecht sind herzlich willkommen! Verbesserungsvorschläge, Bugreports und Pull Requests können direkt über GitHub Issues und Pull Requests eingereicht werden.

## Rechtlicher & Finanzieller Disclaimer

> [!IMPORTANT]
> **Haftungsausschluss / Keine Rechtsberatung**:  
> Diese Software und die darin enthaltenen Berechnungsmodelle dienen ausschließlich Informations-, Orientierungs- und wissenschaftlichen Anschauungszwecken. Sie stellen **keine Rechtsberatung** im Sinne des Rechtsdienstleistungsgesetzes (RDG) und **keine Steuer- oder Finanzberatung** dar.
>
> Die familienrechtliche Unterhaltsberechnung im Einzelfall unterliegt dem richterlichen Ermessen der Familiengerichte sowie den jeweiligen Leitlinien der zuständigen Oberlandesgerichte. Für verbindliche Unterhaltsberechnungen, Elternvereinbarungen oder gerichtliche Verfahren wenden Sie sich bitte an eine qualifizierte Rechtsanwältin oder einen Fachanwalt für Familienrecht. Für die Richtigkeit, Vollständigkeit und Aktualität der Ergebnisse wird keine Haftung übernommen.

## Entwicklung & Methodik

Dieses Projekt entstand in einer hybriden Arbeitsweise (_AI-assisted Development_):

- **Architektur, Domänenlogik & Reviews:** Manuell konzipiert, entwickelt und anhand manueller Berechnungen verifiziert.
- **Implementierungs-Support:** Große Sprachmodelle (LLMs) wurden als interaktiver Sparringspartner und für Code-Scaffolding (insbesondere der UI-Elemente) genutzt.

## Lizenz

Dieses Projekt ist unter der [MIT-Lizenz](LICENSE) lizenziert.
