import type { ChangelogEntry } from "../types/changelog.ts";

export const APP_VERSION = "1.3.0";
export const APP_RELEASE_DATE = "2026-08-27";

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2026-08-27",
    title: "Flexible Zeitraum-Umschaltung (Monat / Jahr) & Monatsbasis als Standard",
    isCurrent: true,
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
