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
│    ΔKG_A = ± (Kindergeld / 2)                                          │
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

### 1. Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25 & Kopfzahl-Methode)

- **Problem**: Im Wechselmodell halten beide Elternteile ein voll ausgestattetes Kinderzimmer vor.
- **Kopfzahl-Methode**: Die monatliche Warmmiete (inkl. Nebenkosten & Heizung) jedes Haushalts wird durch die Anzahl der Personen im Haushalt geteilt:
  $$\text{Wohnanteil Kind} = \frac{\text{Warmmiete}_A}{\text{Personen}_A} + \frac{\text{Warmmiete}_B}{\text{Personen}_B}$$
- **20 %-Tabellenabzug**: Der Tabellenbedarf nach Düsseldorfer Tabelle enthält statistisch bereits einen pauschalen Wohnkostenanteil von $20\ \%$ ($0{,}20 \times B_{\text{tab}}$).
- **Wohnmehrbedarf**: Der übersteigende Betrag wird automatisch als Kindesmehrbedarf zugeschlagen:
  $$\text{Wohnmehrbedarf} = \max\left(0,\ \text{Tatsächlicher Wohnbedarf} - 0{,}20 \times B_{\text{tab}}\right)$$

### 2. Quotenmäßige Aufteilung direkter Kindesausgaben (BGH XII ZB 565/15 Rn. 28–30)

- Sachkosten und Anschaffungen für das Kind (z. B. Hortgebühren, Schulessen, Kleidung, Schulbedarf), die ein Elternteil zentral verauslagt, sind **im Verhältnis der Haftungsquoten ($Q_A : Q_B$)** zu teilen.
- Netto-Ausgleich für Elternteil A:
  $$\Delta D_A = Q_A \cdot D_B - Q_B \cdot D_A$$

### 3. Hälftiger Kindergeldausgleich (BGH XII ZB 565/15 Rn. 32 & § 1612b BGB)

- Das staatliche Kindergeld mindert nach § 1612b BGB den Barbedarf zur Hälfte.
- Der Auszahlungsempfänger muss dem anderen Elternteil die auf die Betreuung entfallende andere Hälfte (z. B. 259 € im Jahr 2026) im Rahmen der Spitzabrechnung schuldrechtlich gutschreiben.

## Genutzte Rechtsprechungen

| Aktenzeichen / Gericht       | Fundstelle       | Kernaussage für die Berechnungs-Architektur                                                                                                                                                                           |
| :--------------------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BGH XII ZB 565/15**        | BGHZ 213, 254    | **Leitentscheidung Wechselmodell:** 7-Schritte-Berechnung, Bedarfsbemessung nach beiderseitigem Einkommen, Realkosten-Wohnmehrbedarf (Rn. 25), Quotenaufteilung von Direktkosten (Rn. 28–30), Naturalunterhaltsabzug. |
| **BGH XII ZB 599/13**        | FamRZ 2015, 236  | **Haftungsquoten:** Quotelung erfolgt strikt anhand des bereinigten Nettoeinkommens abzüglich des _angemessenen_ Selbstbehalts ($1.750\ €$).                                                                          |
| **BGH XII ZB 45/15**         | FamRZ 2016, 1053 | **Kindergeld:** Hälftiger interner Ausgleichsanspruch zwischen den Eltern im paritätischen Wechselmodell.                                                                                                             |
| **BGH XII ZB 601/13**        | FamRZ 2014, 917  | **Abgrenzung & Paritätsgrenze:** Ein Wechselmodell liegt nur bei echter 50:50-Betreuung vor. Eine 40:60-Betreuung löst keine Quotenberechnung aus; es verbleibt beim Residenzmodell (ggf. mit Tabellen-Herabstufung). |
| **BGH XII ZR 149/01**        | BGHZ 154, 247    | **Altersvorsorge:** Zusätzliche private Altersvorsorge ist auf maximal $4\ \%$ des Gesamt-Bruttoeinkommens gedeckelt.                                                                                                 |
| **OLG Dresden 20 UF 851/15** | FamRZ 2016, 1275 | **Historische Spitzabrechnung:** Detaillierte Prüfung von Kindesmehrbedarf und Verrechnungslogik im Innenverhältnis.                                                                                                  |

## 💻 Technologie-Stack & Architektur

- **Frontend-Framework**: React 19 & TypeScript
- **Build-Tool**: Vite 8
- **Styling**: Maßgeschneidertes CSS-Designsystem (Design Tokens, HSL-Farbpalette, Responsive Grid & Print Styles)
- **Testing**: Vitest 4 (Happy-DOM, 54 umfassende Unit-Tests zur Validierung gegen historische BGH- und OLG-Urteile, Rechtskomponenten und Versionsverwaltung)
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
│   ├── ParentInputCard.tsx    # Eingabeformular je Elternteil (Einkommen, Miete, Kopfzahl)
│   ├── ChildrenInputCard.tsx  # Kinder-Verwaltung, Altersstufen & Wohnmehrbedarf-Liveanzeige
│   ├── SettlementBanner.tsx   # Prominentes Zahlbetrags-Ergebnisbanner
│   ├── CalculationSummary.tsx # KPI-Metriken (Kombiniertes Netto, Quoten, DT-Stufe)
│   ├── DetailsTable.tsx       # Detaillierte Gegenüberstellung aller Berechnungspositionen
│   ├── AuditTrailList.tsx     # Detaillierter Audit-Log mit Formeln & BGH-Randnummern
│   ├── Tooltip.tsx            # Rechtliche Popover-Tooltips (tabIndex-optimiert)
│   ├── NumericInput.tsx       # Entprellte, string-gepufferte Zahleneingabekomponente
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
├── App.tsx                    # Hauptanwendung mit Deep-Linking (#impressum, #datenschutz, #changelog)
├── main.tsx                   # React Einstiegspunkt
├── vite-env.d.ts              # Globale Typdefinitionen für __LEGAL_CONFIG_B64__
└── index.css                  # UI Design System, Themes, Modal & Print-Styles
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
