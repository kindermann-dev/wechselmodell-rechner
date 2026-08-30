import type { CalculationStepLog } from "../types/output";

/**
 * Formatiert das vollständige Prüfprotokoll als sauberen, strukturierten Text
 * für die Zwischenablage.
 */
export function formatAuditTrailAsText(auditTrail: CalculationStepLog[]): string {
  const header = `PRÜFPROTOKOLL: KINDESUNTERHALT WECHSELMODELL (50:50)
Rechtsgrundlagen: Düsseldorfer Tabelle 2026 / BGH XII ZB 565/15, XII ZB 599/13 & XII ZB 45/15
================================================================================`;

  const stepsText = auditTrail
    .map((log) => {
      const parts = [
        `[Stufe ${log.stepNumber}: ${log.label}]`,
        `Formel:\n${log.formula}`,
        `Erläuterung & Rechenschritte:\n${log.description}`,
      ];
      return parts.join("\n\n");
    })
    .join(
      "\n\n--------------------------------------------------------------------------------\n\n"
    );

  return `${header}\n\n${stepsText}\n\n================================================================================`;
}
