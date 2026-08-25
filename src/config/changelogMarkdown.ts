import type { ChangelogEntry } from "../types/changelog.ts";
import { APP_VERSION, APP_RELEASE_DATE, CHANGELOG_ENTRIES } from "./changelog.ts";

/**
 * Standard-Repository-URL für Versions- und Vergleichslinks
 */
export const REPOSITORY_URL = "https://github.com/kindermann-dev/wechselmodell-rechner";

/**
 * Erzeugt den vollständigen Markdown-Inhalt für CHANGELOG.md nach dem Standard von „Keep a Changelog“.
 *
 * @param entries Liste aller Changelog-Einträge
 * @param repoUrl Basis-URL des GitHub-Repositories
 * @returns Formatierter Markdown-String
 */
export function generateChangelogMarkdown(
  entries: ChangelogEntry[] = CHANGELOG_ENTRIES,
  repoUrl: string = REPOSITORY_URL
): string {
  const lines: string[] = [
    "# Changelog",
    "",
    "Alle wichtigen Änderungen und Versionen dieses Projekts werden in dieser Datei dokumentiert.",
    "",
    "Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/) und dieses Projekt folgt den Richtlinien der [Semantischen Versionierung](https://semver.org/lang/de/).",
    "",
  ];

  for (const entry of entries) {
    lines.push("---", "");
    lines.push(`## [${entry.version}] - ${entry.date}`);
    lines.push("");

    if (entry.title && entry.summary) {
      lines.push(`> **${entry.title}**  `);
      lines.push(`> ${entry.summary}`);
      lines.push("");
    } else if (entry.summary) {
      lines.push(`> ${entry.summary}`);
      lines.push("");
    }

    for (const group of entry.categories) {
      const header = group.icon
        ? `### ${group.icon} ${group.categoryLabel}`
        : `### ${group.categoryLabel}`;
      lines.push(header);
      lines.push("");
      for (const item of group.items) {
        lines.push(`- ${item}`);
      }
      lines.push("");
    }
  }

  lines.push("---", "");

  // Link-Definitionen am Ende der Datei (Keep a Changelog Standard)
  const versions = entries.map((e) => e.version);

  for (let i = 0; i < versions.length; i++) {
    const v = versions[i];
    const prevV = versions[i + 1];
    if (v && prevV) {
      lines.push(`[${v}]: ${repoUrl}/compare/v${prevV}...v${v}`);
    } else if (v) {
      lines.push(`[${v}]: ${repoUrl}/releases/tag/v${v}`);
    }
  }
  lines.push("");

  return lines.join("\n");
}

/**
 * Validiert die semantische und strukturelle Konsistenz der Changelog-Daten
 */
export function validateChangelogData(
  entries: ChangelogEntry[] = CHANGELOG_ENTRIES,
  expectedVersion: string = APP_VERSION,
  expectedReleaseDate: string = APP_RELEASE_DATE
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (entries.length === 0) {
    errors.push("CHANGELOG_ENTRIES enthält keine Einträge.");
    return { valid: false, errors };
  }

  const currentEntry = entries.find((e) => e.isCurrent);
  if (!currentEntry) {
    errors.push(`Kein Changelog-Eintrag mit "isCurrent: true" in CHANGELOG_ENTRIES gefunden.`);
  } else {
    if (currentEntry.version !== expectedVersion) {
      errors.push(
        `Der als aktuell markierte Changelog-Eintrag hat Version "${currentEntry.version}", erwartet wird "${expectedVersion}".`
      );
    }
    if (currentEntry.date !== expectedReleaseDate) {
      errors.push(
        `Das Datum des aktuellen Eintrags ("${currentEntry.date}") weicht von APP_RELEASE_DATE ("${expectedReleaseDate}") ab.`
      );
    }
  }

  const seenVersions = new Set<string>();
  for (const entry of entries) {
    if (seenVersions.has(entry.version)) {
      errors.push(`Doppelte Versionsnummer "${entry.version}" in CHANGELOG_ENTRIES gefunden.`);
    }
    seenVersions.add(entry.version);

    if (!entry.title || entry.title.trim().length === 0) {
      errors.push(`Eintrag für Version ${entry.version} hat keinen gültigen Titel.`);
    }
    if (!entry.summary || entry.summary.trim().length === 0) {
      errors.push(`Eintrag für Version ${entry.version} hat keine gültige Zusammenfassung.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      errors.push(`Eintrag für Version ${entry.version} hat ein ungültiges Datum "${entry.date}".`);
    }
    if (entry.categories.length === 0) {
      errors.push(`Eintrag für Version ${entry.version} hat keine Kategorien.`);
    }

    for (const cat of entry.categories) {
      if (!cat.categoryLabel || cat.categoryLabel.trim().length === 0) {
        errors.push(`Kategorie in Version ${entry.version} hat keine Bezeichnung.`);
      }
      if (cat.items.length === 0) {
        errors.push(
          `Kategorie "${cat.categoryLabel}" in Version ${entry.version} enthält keine Einträge.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
