import type { ChangelogEntry } from "../types/changelog.ts";

export const APP_VERSION = "1.1.0";
export const APP_RELEASE_DATE = "2026-08-25";

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "1.1.0",
    date: "2026-08-25",
    title: "Rechtliche Präzisierung & BGH-Kindergeld-Splitting",
    isCurrent: true,
    summary:
      "Vollständige Implementierung des zweistufigen Kindergeld-Splittings nach BGH XII ZB 45/15 und § 1612b BGB sowie Einführung des isolierten Kindergeldausgleichsanspruchs und des interaktiven Changelog-Modals.",
    categories: [
      {
        category: "legal",
        categoryLabel: "Rechtliche Konformität & BGH-Rechtsprechung",
        icon: "⚖️",
        items: [
          "BGH XII ZB 45/15 & § 1612b BGB: Trennung des Kindergeldes in 50 % Betreuungsanteil (je 25 % fix pro Elternteil) und 50 % Baranteil (Verrechnung nach Haftungsquoten).",
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
          "Erweiterung der Testsuite auf 56 Unit-Tests (100 % Erfolgsquote) zur Validierung aller Rechenschritte und UI-Komponenten.",
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
