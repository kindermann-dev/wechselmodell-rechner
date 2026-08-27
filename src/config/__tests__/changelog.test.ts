import { describe, it, expect } from "vitest";
import { APP_VERSION, APP_RELEASE_DATE, CHANGELOG_ENTRIES } from "../changelog";
import {
  generateChangelogMarkdown,
  validateChangelogData,
  REPOSITORY_URL,
} from "../changelogMarkdown";

describe("Changelog-Konfiguration & Datenstruktur", () => {
  it("definiert eine gültige App-Versionsnummer und ein Veröffentlichungsdatum", () => {
    expect(APP_VERSION).toBe("1.6.0");
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(APP_RELEASE_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("enthält mindestens einen Changelog-Eintrag mit der aktuellen Version", () => {
    expect(CHANGELOG_ENTRIES.length).toBeGreaterThanOrEqual(2);
    const currentEntry = CHANGELOG_ENTRIES.find((e) => e.isCurrent);
    expect(currentEntry).toBeDefined();
    expect(currentEntry?.version).toBe(APP_VERSION);
  });

  it("besteht alle strukturellen und semantischen Datenvalidierungen", () => {
    const result = validateChangelogData(CHANGELOG_ENTRIES, APP_VERSION, APP_RELEASE_DATE);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("erkennt fehlerhafte oder inkonsistente Changelog-Daten zuverlässig", () => {
    const emptyResult = validateChangelogData([]);
    expect(emptyResult.valid).toBe(false);
    expect(emptyResult.errors.length).toBeGreaterThan(0);

    const wrongVersionResult = validateChangelogData(CHANGELOG_ENTRIES, "9.9.9", APP_RELEASE_DATE);
    expect(wrongVersionResult.valid).toBe(false);
    expect(wrongVersionResult.errors[0]).toContain("9.9.9");
  });

  it("generiert formatierten Keep-a-Changelog-Markdown-Text", () => {
    const md = generateChangelogMarkdown(CHANGELOG_ENTRIES, REPOSITORY_URL);

    expect(md).toContain("# Changelog");
    expect(md).toContain("## [1.1.0] - 2026-08-25");
    expect(md).toContain("## [1.0.0] - 2026-08-24");
    expect(md).toContain("### ⚖️ Rechtliche Konformität & BGH-Rechtsprechung");
    expect(md).toContain("### 🚀 Neue Funktionen & Erweiterungen");
    expect(md).toContain(`[1.1.0]: ${REPOSITORY_URL}/compare/v1.0.0...v1.1.0`);
    expect(md).toContain(`[1.0.0]: ${REPOSITORY_URL}/releases/tag/v1.0.0`);
  });
});
