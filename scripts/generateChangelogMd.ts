/**
 * Synchronisations- & Generator-Skript für CHANGELOG.md
 *
 * Liest die strukturierte TypeScript-Changelog-Konfiguration aus `src/config/changelog.ts`
 * (Single Source of Truth) und generiert daraus deterministisch die Datei `CHANGELOG.md`
 * im Standardformat von „Keep a Changelog“.
 *
 * Verwendung:
 *   - Generieren: `node --experimental-strip-types scripts/generateChangelogMd.ts`
 *   - Prüfen:     `node --experimental-strip-types scripts/generateChangelogMd.ts --check`
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APP_VERSION, APP_RELEASE_DATE, CHANGELOG_ENTRIES } from "../src/config/changelog.ts";
import {
  generateChangelogMarkdown,
  validateChangelogData,
} from "../src/config/changelogMarkdown.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const changelogMdPath = path.join(rootDir, "CHANGELOG.md");
const packageJsonPath = path.join(rootDir, "package.json");

/**
 * Validiert die Konsistenz zwischen package.json und changelog.ts
 */
export function validateChangelogConsistency(): { valid: boolean; errors: string[] } {
  const dataValidation = validateChangelogData(CHANGELOG_ENTRIES, APP_VERSION, APP_RELEASE_DATE);
  const errors = [...dataValidation.errors];

  try {
    const pkgRaw = fs.readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(pkgRaw) as { version?: string };

    if (pkg.version !== APP_VERSION) {
      errors.push(
        `Versionsabweichung: package.json hat Version "${pkg.version}", changelog.ts definiert APP_VERSION "${APP_VERSION}".`
      );
    }
  } catch (err) {
    errors.push(`Fehler beim Lesen der package.json: ${(err as Error).message}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Hauptausführung bei direktem CLI-Aufruf
const isMain =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "");

if (isMain) {
  const isCheckMode = process.argv.includes("--check");

  const consistency = validateChangelogConsistency();
  if (!consistency.valid) {
    console.error("❌ Konsistenzprüfung fehlgeschlagen:");
    for (const err of consistency.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const generatedContent = generateChangelogMarkdown(CHANGELOG_ENTRIES);

  if (isCheckMode) {
    if (!fs.existsSync(changelogMdPath)) {
      console.error(
        "❌ CHANGELOG.md existiert nicht. Bitte 'npm run changelog:generate' ausführen."
      );
      process.exit(1);
    }

    const currentContent = fs.readFileSync(changelogMdPath, "utf-8");
    if (currentContent.trim() !== generatedContent.trim()) {
      console.error(
        "❌ CHANGELOG.md ist nicht aktuell mit src/config/changelog.ts!\n" +
          "Bitte 'npm run changelog:generate' ausführen, um die Datei zu aktualisieren."
      );
      process.exit(1);
    }

    console.log("✅ CHANGELOG.md ist synchron mit src/config/changelog.ts und package.json.");
  } else {
    fs.writeFileSync(changelogMdPath, generatedContent, "utf-8");
    console.log("✅ CHANGELOG.md erfolgreich aus src/config/changelog.ts generiert.");
  }
}
