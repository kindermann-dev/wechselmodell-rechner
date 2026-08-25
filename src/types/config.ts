export type AgeGroup = "0-5" | "6-11" | "12-17" | "18+";

export interface DtIncomeTier {
  tierIndex: number; // 1 bis 15
  minIncome: number; // z. B. 0 für Stufe 1
  maxIncome: number; // z. B. 2100 für Stufe 1, Infinity für die höchste Stufe
  rates: Record<AgeGroup, number>;
  percentage: number; // z. B. 100 für Stufe 1
}

export interface LegalConfig {
  year: number;
  table: DtIncomeTier[];
  kindergeldPerChild: number; // z. B. 259 €
  retentionRates: {
    necessaryEmployed: number; // Notwendiger Selbstbehalt für Erwerbstätige
    necessaryUnemployed: number; // Notwendiger Selbstbehalt für Nichterwerbstätige
    adequate: number; // Angemessener Selbstbehalt im Wechselmodell
  };
  occupationalExpenseFlatRate: {
    percentage: number; // 0.05 (5 %)
    min: number; // z. B. 50 €
    max: number; // z. B. 150 €
  };
  maxPensionRate: number; // z. B. 0.04 (4 % des Bruttoeinkommens)
}
