import type { LegalConfig } from "../types/config";
import type { IncomeBreakdown } from "../types/input";
import { clamp, round2 } from "./rounding";

export interface IncomeCalculationBreakdown {
  rawNet: number;
  grossMonthly: number;
  grossAnnual: number;
  netAnnual: number;
  isEmployed: boolean;
  occupationalExpenses: number;
  cappedPension: number;
  allowableDebts: number;
  otherDeductions: number;
  housingAdvantage: number;
  deductionsTotal: number;
  adjustedNet: number;
  adjustedAnnualNet: number;
}

/**
 * Berechnet das bereinigte Nettoeinkommen eines Elternteils
 * unter strikter Beachtung der familienrechtlichen Leitlinien.
 *
 * Unterstützt die Jahresberechnung (Jahreseinkommen geteilt durch 12) zur Berücksichtigung
 * von Einmalzahlungen (Boni, Tantiemen, Sonderzahlungen, 13./14. Monatsgehalt, Steuererstattungen).
 *
 * Formel:
 * N_adj = N_net + Wohnvorteil - Berufsaufwand - Altersvorsorge(max 4%) - Schulden - Sonstige Abzüge
 */
export function calculateAdjustedNetIncome(
  income: IncomeBreakdown,
  config: LegalConfig
): IncomeCalculationBreakdown {
  // Monatsnetto ermitteln (entweder aus netAnnual oder netMonthly)
  let rawNet = 0;
  if (income.netAnnual !== undefined && income.netAnnual !== null) {
    const totalAnnualNet = Number(income.netAnnual) + Number(income.annualBonusNet || 0);
    rawNet = round2(totalAnnualNet / 12);
  } else if (income.netMonthly !== undefined && income.netMonthly !== null) {
    rawNet = round2(Number(income.netMonthly));
  }

  // Monatsbrutto ermitteln (entweder aus grossAnnual oder grossMonthly)
  let grossMonthly = 0;
  if (income.grossAnnual !== undefined && income.grossAnnual !== null) {
    const totalAnnualGross = Number(income.grossAnnual) + Number(income.annualBonusGross || 0);
    grossMonthly = round2(totalAnnualGross / 12);
  } else if (income.grossMonthly !== undefined && income.grossMonthly !== null) {
    grossMonthly = round2(Number(income.grossMonthly));
  }

  const isEmployed = Boolean(income.isEmployed);

  // 1. Berufsbedingte Aufwendungen
  let occupationalExpenses = 0;
  if (income.occupationalExpenses?.useFlatRate) {
    if (isEmployed && rawNet > 0) {
      const flatRatePercentage = config.occupationalExpenseFlatRate.percentage;
      const minFlat = config.occupationalExpenseFlatRate.min;
      const maxFlat = config.occupationalExpenseFlatRate.max;
      const flatAmount = rawNet * flatRatePercentage;
      occupationalExpenses = round2(clamp(flatAmount, minFlat, maxFlat));
    } else {
      occupationalExpenses = 0;
    }
  } else {
    if (income.occupationalExpenses?.customAnnualAmount !== undefined) {
      occupationalExpenses = round2(
        Math.max(0, Number(income.occupationalExpenses.customAnnualAmount) / 12)
      );
    } else {
      occupationalExpenses = round2(Math.max(0, income.occupationalExpenses?.customAmount || 0));
    }
  }

  // 2. Zusätzliche Altersvorsorge (gedeckelt auf max. 4 % des Bruttoeinkommens nach BGH XII ZR 149/01)
  const maxAllowedPension = round2(grossMonthly * config.maxPensionRate);
  let requestedPension = 0;
  if (income.privatePensionAnnual !== undefined) {
    requestedPension = round2(Math.max(0, Number(income.privatePensionAnnual) / 12));
  } else {
    requestedPension = round2(Math.max(0, income.privatePensionMonthly || 0));
  }
  const cappedPension = round2(Math.min(requestedPension, maxAllowedPension));

  // 3. Berücksichtigungsfähige Verbindlichkeiten & sonstige Abzüge (monatlich oder jährlich / 12)
  const allowableDebts =
    income.allowableDebtsAnnual !== undefined
      ? round2(Math.max(0, Number(income.allowableDebtsAnnual) / 12))
      : round2(Math.max(0, income.allowableDebtsMonthly || 0));

  const otherDeductions =
    income.otherDeductionsAnnual !== undefined
      ? round2(Math.max(0, Number(income.otherDeductionsAnnual) / 12))
      : round2(Math.max(0, income.otherDeductionsMonthly || 0));

  const housingAdvantage =
    income.housingAdvantageAnnual !== undefined
      ? round2(Math.max(0, Number(income.housingAdvantageAnnual) / 12))
      : round2(Math.max(0, income.housingAdvantageMonthly || 0));

  // Gesamtabzüge
  const deductionsTotal = round2(
    occupationalExpenses + cappedPension + allowableDebts + otherDeductions
  );

  // Bereinigtes Nettoeinkommen
  const adjustedNet = round2(rawNet + housingAdvantage - deductionsTotal);

  const grossAnnual = round2(grossMonthly * 12);
  const netAnnual = round2(rawNet * 12);
  const adjustedAnnualNet = round2(adjustedNet * 12);

  return {
    rawNet,
    grossMonthly,
    grossAnnual,
    netAnnual,
    isEmployed,
    occupationalExpenses,
    cappedPension,
    allowableDebts,
    otherDeductions,
    housingAdvantage,
    deductionsTotal,
    adjustedNet,
    adjustedAnnualNet,
  };
}

/**
 * Berechnet den Wechselmodell-Wohnmehrbedarf nach der deterministischen Formel des
 * OLG Dresden, Beschluss v. 29.10.2015 – 20 UF 851/15 (Rn. 21.5.2).
 *
 * Formel:
 * Wohn_comb = 20 % des Tabellenbedarfs aus kombiniertem Einkommen
 * Wohn_A = 20 % des Tabellenbedarfs aus Einkommen A * 0,90 (abzgl. 10 % variabler Kosten)
 * Wohn_B = 20 % des Tabellenbedarfs aus Einkommen B * 0,90 (abzgl. 10 % variabler Kosten)
 * Wohnmehrbedarf = max(0, (Wohn_A + Wohn_B) - Wohn_comb)
 */
export function calculateOlgDresdenWohnmehrbedarf(
  tableNeedCombined: number,
  tableNeedA: number,
  tableNeedB: number
): number {
  const wohnComb = round2(tableNeedCombined * 0.2);
  const wohnA = round2(tableNeedA * 0.2 * 0.9);
  const wohnB = round2(tableNeedB * 0.2 * 0.9);
  return round2(Math.max(0, wohnA + wohnB - wohnComb));
}
