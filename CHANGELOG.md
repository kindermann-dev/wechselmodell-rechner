# Changelog

Alle wichtigen Änderungen und Versionen dieses Projekts werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/) und dieses Projekt folgt den Richtlinien der [Semantischen Versionierung](https://semver.org/lang/de/).

---

## [1.5.0] - 2026-08-27

> **Mehrseitige Druckansicht mit Prüfprotokoll auf Folgeseite**  
> Erweiterung der Druckfunktion zur Erstellung eines mehrseitigen, gerichtsfesten Dokuments: Seite 1 enthält das Abrechnungsergebnis und die tabellarische Übersicht, während Seite 2 nahtlos das vollständige 7-Stufen-Prüfprotokoll nach BGH-Rechtsprechung mit Formeln und Erläuterungen abbildet.

### 🚀 Neue Funktionen & Benutzeroberfläche

- Mehrseitige Druckausgabe: Beim Drucken (oder PDF-Export) werden unabhängig vom aktuell gewählten Bildschirm-Tab sowohl die tabellarische Ergebnisübersicht (Seite 1) als auch das schrittweise Prüfprotokoll (Seite 2) gerendert.
- Druck-Kopfzeile für Prüfprotokoll: Eindeutige Kennzeichnung des Prüfprotokolls mit Verweis auf die zugrundeliegenden BGH-Beschlüsse und die Düsseldorfer Tabelle 2026.
- Optimierte Drucktypografie: Feste Seitenumbruch-Vermeidung innerhalb einzelner Prüfschritte (break-inside: avoid) für sauberes Schriftbild.

### 🔧 Testsuite & Qualitätssicherung

- Automatisierte Integrationstests zur Verifikation der DOM-Präsenz beider Ergebnisbereiche, korrekter Druck-CSS-Klassen und Umschaltlogik der Tabs.

---

## [1.4.0] - 2026-08-27

> **Option Bürgergeld / Nicht erwerbstätig, Quotenberechnung & rechtliche Hinweise**  
> Vollständige Integration der Option 'Bürgergeld-Bezug / Nicht erwerbstätig' mit automatischer Null-Bereinigung, 0 %-Haftungsquote, einkommensunabhängigem Kindergeld-Betreuungsanteil (25 %) und fundierten Hinweisen zur gesteigerten Erwerbsobliegenheit.

### 🚀 Neue Funktionen & Benutzeroberfläche

- Bürgergeld-Option im Formular: Checkbox 'Bürgergeld-Bezug / Nicht erwerbstätig' für beide Elternteile mit sofortiger Null-Setzung und Deaktivierung aller Einkommens- und Abzugsfelder.
- Unterkunftskosten & KdU: Automatische Deaktivierung der Warmmiete bei Bürgergeld mit transparentem Hinweis auf Übernahme der Kosten der Unterkunft durch das Jobcenter.
- Rechtliche Hinweismeldungen: Automatische Einblendung fundierter Hinweise zur gesteigerten Erwerbsobliegenheit (§ 1603 Abs. 2 BGB, fiktives Einkommen) und zum gesetzlichen Anspruchsübergang auf das Jobcenter (§ 33 SGB II).
- Neues Preset-Szenario: Vordefiniertes Szenario 'Bürgergeld-Bezug / Nicht erwerbstätig (42k € / 0 €, 1 Kind)' zur schnellen Demonstration.

### ⚖️ Rechtsprechung & Rechenkern

- Quotenberechnung: Strikt 0 % Haftungsquote für den Bürgergeld-Empfänger und 100 % für den leistungsfähigen Elternteil.
- Kindergeld-Ausgleich (BGH XII ZB 45/15): Garantierte Auszahlung des einkommensunabhängigen Betreuungsanteils von 25 % (64,75 €) an den Bürgergeld-Empfänger bei Kindergeldbezug durch den anderen Elternteil.
- Selbstbehalt im Mangelfall: Berücksichtigung des notwendigen Selbstbehalts für Nichterwerbstätige (1.200 € statt 1.450 €).

### 🔧 Testsuite & Qualitätssicherung

- Erweiterung der Testsuite auf 72 Tests zur lückenlosen Absicherung aller Bürgergeld-Szenarien, Quoten, Kindergeldausgleiche und Formularvalidierungen.

---

## [1.3.0] - 2026-08-27

> **Flexible Zeitraum-Umschaltung (Monat / Jahr) & Monatsbasis als Standard**  
> Vollständige Umstellung der Standard-Eingabewerte auf benutzerfreundliche Monatsbasis mit kompakter, eleganter Umschaltung zwischen '€ / Monat' und '€ / Jahr' bei deterministischer Jahresrechnung im Rechenkern.

### 🚀 Neue Funktionen & Benutzeroberfläche

- Monatsbasis als Standard: Bruttoeinkommen, Nettoeinkommen, Altersvorsorge, berücksichtigungsfähige Schulden, direkte Kindesausgaben und Wohnvorteil starten intuitiv im Monatsmodus.
- Kompakter Zeitraum-Umschalter: Nahtlose Umschaltung zwischen '€ / Mo' und '€ / Jahr' pro Feld.
- Automatische Äquivalenzanzeige: Dynamischer Hinweistext unter jedem Feld zeigt in Echtzeit das Jahres- bzw. Monatsäquivalent an.
- Konsistente Ausrichtung: Bündige Eingabefelder und rechtsbündig ausgerichtete Hilfe-Buttons.
- Fixe Höhen-Harmonisierung: Die Ergebnisspalte schließt auf Desktop bündig mit der Eingabespalte ab und behält beim Wechsel zwischen Tabellarischer Übersicht und Prüfprotokoll eine absolut stabile Höhe.
- Mobile Optimierung: Vollständig responsives Layout ohne horizontales Scrollen auf Smartphones.

### 🔧 Komponenten & Testsuite

- Wiederverwendbare Komponenten PeriodToggle und PeriodNumericField mit vollständiger Barrierefreiheit (aria-pressed, barrierefreie Labels).
- Erweiterung der Testsuite auf 68 Unit- und Integrationstests zur lückenlosen Absicherung der Zeitraum-Umschaltung und Rechengenauigkeit.

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

[1.5.0]: https://github.com/kindermann-dev/wechselmodell-rechner/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/kindermann-dev/wechselmodell-rechner/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/kindermann-dev/wechselmodell-rechner/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/kindermann-dev/wechselmodell-rechner/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kindermann-dev/wechselmodell-rechner/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kindermann-dev/wechselmodell-rechner/releases/tag/v1.0.0
