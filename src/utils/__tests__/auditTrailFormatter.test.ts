import { describe, it, expect } from "vitest";
import { formatAuditTrailAsText } from "../auditTrailFormatter";
import type { CalculationStepLog } from "../../types/output";

describe("auditTrailFormatter", () => {
  it("formatiert leere Protokolle", () => {
    const text = formatAuditTrailAsText([]);
    expect(text).toContain("PRÜFPROTOKOLL: KINDESUNTERHALT WECHSELMODELL (50:50)");
  });

  it("formatiert ein Protokoll mit mehreren Schritten", () => {
    const logs: CalculationStepLog[] = [
      {
        stepNumber: 1,
        label: "Bereinigtes Nettoeinkommen",
        formula: "N_adj = 3.000 €",
        description: "Detail 1",
        value: 3000,
      },
      {
        stepNumber: 2,
        label: "Haftungsquoten",
        formula: "Q_A = 60%",
        description: "Detail 2",
        value: "60%",
      },
    ];

    const text = formatAuditTrailAsText(logs);
    expect(text).toContain("[Stufe 1: Bereinigtes Nettoeinkommen]");
    expect(text).toContain("Formel:\nN_adj = 3.000 €");
    expect(text).toContain("Erläuterung & Rechenschritte:\nDetail 1");
    expect(text).toContain("[Stufe 2: Haftungsquoten]");
    expect(text).toContain("Formel:\nQ_A = 60%");
    expect(text).toContain("Erläuterung & Rechenschritte:\nDetail 2");
  });
});
