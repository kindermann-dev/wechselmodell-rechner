import { describe, it, expect } from "vitest";
import {
  DT_TABLE_2026,
  DEFAULT_LEGAL_CONFIG_2026,
  AGE_GROUP_LABELS,
  formatChildName,
} from "../dtTable2026";
import type { AgeGroup } from "../../types/config";

describe("dtTable2026 & formatChildName", () => {
  it("enthält 15 Einkommensgruppen in der DT_TABLE_2026", () => {
    expect(DT_TABLE_2026).toHaveLength(15);
    expect(DT_TABLE_2026[0].tierIndex).toBe(1);
    expect(DT_TABLE_2026[14].tierIndex).toBe(15);
    expect(DT_TABLE_2026[14].maxIncome).toBe(Infinity);
  });

  it("enthält vollständige und korrekte AGE_GROUP_LABELS", () => {
    expect(AGE_GROUP_LABELS["0-5"]).toBe("0–5 Jahre");
    expect(AGE_GROUP_LABELS["6-11"]).toBe("6–11 Jahre");
    expect(AGE_GROUP_LABELS["12-17"]).toBe("12–17 Jahre");
    expect(AGE_GROUP_LABELS["18+"]).toBe("ab 18 Jahre");
  });

  it("erzeugt standardisierte Kind-Namen im Format 'Kind X ([Altersgruppe])'", () => {
    expect(formatChildName(1, "0-5")).toBe("Kind 1 (0–5 Jahre)");
    expect(formatChildName(1, "6-11")).toBe("Kind 1 (6–11 Jahre)");
    expect(formatChildName(2, "12-17")).toBe("Kind 2 (12–17 Jahre)");
    expect(formatChildName(2, "18+")).toBe("Kind 2 (ab 18 Jahre)");
    expect(formatChildName(3, "0-5")).toBe("Kind 3 (0–5 Jahre)");
  });

  it("fällt bei unbekannter Altersgruppe auf den Raw-Key zurück", () => {
    expect(formatChildName(1, "unknown" as AgeGroup)).toBe("Kind 1 (unknown)");
  });

  it("besitzt valide Standard-Konfigurationswerte für 2026", () => {
    expect(DEFAULT_LEGAL_CONFIG_2026.year).toBe(2026);
    expect(DEFAULT_LEGAL_CONFIG_2026.kindergeldPerChild).toBe(259);
    expect(DEFAULT_LEGAL_CONFIG_2026.retentionRates.necessaryEmployed).toBe(1450);
    expect(DEFAULT_LEGAL_CONFIG_2026.retentionRates.necessaryUnemployed).toBe(1200);
    expect(DEFAULT_LEGAL_CONFIG_2026.retentionRates.adequate).toBe(1750);
    expect(DEFAULT_LEGAL_CONFIG_2026.occupationalExpenseFlatRate.percentage).toBe(0.05);
    expect(DEFAULT_LEGAL_CONFIG_2026.occupationalExpenseFlatRate.min).toBe(50);
    expect(DEFAULT_LEGAL_CONFIG_2026.occupationalExpenseFlatRate.max).toBe(150);
    expect(DEFAULT_LEGAL_CONFIG_2026.maxPensionRate).toBe(0.04);
  });
});
