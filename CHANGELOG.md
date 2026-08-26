# Changelog

Alle wichtigen Änderungen und Versionen dieses Projekts werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/) und dieses Projekt folgt den Richtlinien der [Semantischen Versionierung](https://semver.org/lang/de/).

---

## [1.2.0] - 2026-08-26

> **SEO-Optimierung, Schema.org Rich Snippets & FAQ-Bereich**  
> Suchmaschinenoptimierung (SEO) mit Schema.org JSON-LD (WebApplication & FAQPage), barrierefreier FAQ-Sektion, OpenGraph-Social-Vorschau, sitemap.xml und robots.txt.

### 🚀 Neue Funktionen & Barrierefreiheit

- Barrierefreie FAQ-Sektion mit 6 zentralen familienrechtlichen Fragen und BGH-Zitaten zur Verbesserung der Nutzerführung und Auffindbarkeit.
- Social-Sharing-Optimierung: Hochauflösendes OpenGraph- und Twitter-Vorschaubanner (1200x630) für geteilte Links in Messengern und sozialen Netzwerken.

### 🔍 Suchmaschinenoptimierung & Crawler-Infrastruktur

- Schema.org strukturierte Daten (JSON-LD) für Google Rich Snippets (WebApplication und FAQPage).
- Bereitstellung von public/robots.txt, public/sitemap.xml, public/site.webmanifest und kanonischem Link zur Indexierungsbeschleunigung.

### 🔧 Wartung & Testsuite

- Erweiterung der Testsuite auf 60 Unit-Tests inklusive Komponenten-Tests für die FAQ-Sektion.

---

## [1.1.0] - 2026-08-25

> **Rechtliche Präzisierung & BGH-Kindergeld-Splitting**  
> Vollständige Implementierung des zweistufigen Kindergeld-Splittings nach BGH XII ZB 45/15 und § 1612b BGB sowie Einführung des isolierten Kindergeldausgleichsanspruchs und des interaktiven Changelog-Modals.

### ⚖️ Rechtliche Konformität & BGH-Rechtsprechung

- BGH, Beschluss vom 20.04.2016 – Az. XII ZB 45/15 & § 1612b BGB: Trennung des Kindergeldes in 50 % Betreuungsanteil (je 25 % fix pro Elternteil) und 50 % Baranteil (Verrechnung nach Haftungsquoten).
- Isolierter Ausgleichsanspruch („Ein-Viertel-Regel“): Berechnung des 25 %-Mindestausgleichs bei fehlender Gesamtabrechnung oder ohne Einkommensnachweise (Funktion calculateIsolatedKindergeldClaim).
- Verifikation und Vergleich gegen OLG Dresden (20 UF 851/15) zur Sicherstellung höchstrichterlicher Rechengenauigkeit.

### 🚀 Neue Funktionen & Erweiterungen

- Konfigurierbares staatliches Kindergeld: Standardwert für 2026 (259 €) mit Schnellwahlschaltflächen für 2025 (255 €) und 2024 (250 €) sowie benutzerdefinierter Eingabe.
- Interaktives Versions- & Changelog-Modal mit Zeitstrahl-Ansicht und Deep-Link-Unterstützung (#changelog).
- Erweiterte Ergebnis-Zusammenfassung für die Zwischenablage mit vollständiger Aufschlüsselung der Rechenschritte.

### 🔧 Wartung, Tests & Lokalisierung

- Erweiterung der Testsuite auf 56 Unit-Tests zur Validierung aller Rechenschritte und UI-Komponenten.
- Vollständige Lokalisierung aller Quellcode-Kommentare, Docstrings, CSS-Abschnitte und Testbeschreibungen auf Deutsch gemäß AGENTS.md.

---

## [1.0.0] - 2026-08-24

> **Initialer Release & Düsseldorfer Tabelle 2026**  
> Erste Version des Kindesunterhaltsrechners für das paritätische Wechselmodell (50:50) mit Düsseldorfer Tabelle 2026 und BGH-7-Schritte-Schema.

### 🚀 Kernfunktionen

- Deterministische 7-Schritte-Spitzabrechnung nach BGH XII ZB 565/15 und BGH XII ZB 599/13.
- Düsseldorfer Tabelle 2026 mit 15 Einkommensstufen und 4 Altersstufen.
- Vordefinierte Beispielszenarien: BGH-Standardfall, Mehrkind & Wohnmehrbedarf, Mangelfall und Spitzenverdiener.
- Gerichtsfestes Druck-Stylesheet für saubere Papierausdrucke und PDF-Speicherung.
- Audit-Trail mit detaillierter Erläuterung aller Formeln und BGH-Randnummern.

---

[1.2.0]: https://github.com/kindermann-dev/wechselmodell-rechner/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kindermann-dev/wechselmodell-rechner/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kindermann-dev/wechselmodell-rechner/releases/tag/v1.0.0
