export type AgeGroup = "0-5" | "6-11" | "12-17" | "18+";

export interface DtIncomeTier {
  tierIndex: number; // 1 to 15
  minIncome: number; // e.g. 0 for tier 1
  maxIncome: number; // e.g. 2100 for tier 1, Infinity for highest
  rates: Record<AgeGroup, number>;
  percentage: number; // e.g. 100 for tier 1
}

export interface LegalConfig {
  year: number;
  table: DtIncomeTier[];
  kindergeldPerChild: number; // e.g. 250
  retentionRates: {
    necessaryEmployed: number; // Necessary Selbstbehalt (Notwendiger SB) for employed parents
    necessaryUnemployed: number; // Necessary Selbstbehalt (Notwendiger SB) for unemployed parents
    adequate: number; // Adequate Selbstbehalt (Angemessener SB) for Wechselmodell
  };
  occupationalExpenseFlatRate: {
    percentage: number; // 0.05 (5%)
    min: number; // e.g. 50
    max: number; // e.g. 150
  };
  maxPensionRate: number; // e.g. 0.04 (4% of gross)
}
