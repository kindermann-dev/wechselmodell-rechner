import { round2 } from "./rounding";

export interface BetreuungsunterhaltInput {
  parentA: {
    name: string;
    fullTimeNetIncome: number; // Full-time net income without childcare
    actualPartTimeNetIncome: number; // Actual or imputed 50% part-time net income
    childSupportObligation: number; // Child support obligation (Vorwegabzug after BGHZ 213, 254)
    selfRetention: number; // Selbstbehalt (e.g. 1.750 € or 1.450 €)
  };
  parentB: {
    name: string;
    fullTimeNetIncome: number;
    actualPartTimeNetIncome: number;
    childSupportObligation: number;
    selfRetention: number;
  };
  childAgeYears: number; // Child age in years (relevant for § 1615l: up to 3rd year of life)
}

export interface BetreuungsunterhaltResult {
  isEligibleFor1615l: boolean; // Child under 3 years old
  employmentObligationPercentage: number; // 50% Erwerbsobliegenheit in a 50:50 Wechselmodell
  uncoveredLossParentA: number; // Childcare-related income loss for Parent A
  uncoveredLossParentB: number; // Childcare-related income loss for Parent B
  availableIncomeAAfterChildSupport: number; // Parent A available income after Vorwegabzug of child support
  availableIncomeBAfterChildSupport: number; // Parent B available income after Vorwegabzug of child support
  settlement: {
    payer: "parentA" | "parentB" | "balanced";
    amount: number;
  };
}

/**
 * Calculates spousal/maternal/paternal childcare support according to § 1615l BGB
 * for unmarried parents in a symmetrical 50:50 alternating custody model (Wechselmodell).
 *
 * Implements legal principles from BGH (NJW 2026 S. 8 / OLG Koblenz 13 UF 397/24):
 * 1. Both parents are eligible for § 1615l BGB support in a 50:50 model.
 * 2. 50% employment obligation for each parent (half of full-time).
 * 3. Child support is deducted preliminary (Vorwegabzug, Rn. 19).
 * 4. Claim is based on the uncompensated childcare-related income loss.
 */
export function calculateBetreuungsunterhalt1615l(
  input: BetreuungsunterhaltInput
): BetreuungsunterhaltResult {
  const isEligibleFor1615l = input.childAgeYears < 3;
  const employmentObligationPercentage = isEligibleFor1615l ? 50 : 100;

  // 1. Uncovered income loss caused by 50% childcare
  const lossA = round2(
    Math.max(0, input.parentA.fullTimeNetIncome - input.parentA.actualPartTimeNetIncome)
  );
  const lossB = round2(
    Math.max(0, input.parentB.fullTimeNetIncome - input.parentB.actualPartTimeNetIncome)
  );

  // 2. Available income after Vorwegabzug of Kindesunterhalt (BGHZ 213, 254 Rn. 19)
  const availableA = round2(
    Math.max(0, input.parentA.actualPartTimeNetIncome - input.parentA.childSupportObligation)
  );
  const availableB = round2(
    Math.max(0, input.parentB.actualPartTimeNetIncome - input.parentB.childSupportObligation)
  );

  // 3. Margin above self-retention
  const marginA = round2(Math.max(0, availableA - input.parentA.selfRetention));
  const marginB = round2(Math.max(0, availableB - input.parentB.selfRetention));

  let payer: "parentA" | "parentB" | "balanced" = "balanced";
  let amount = 0;

  if (lossB > lossA && marginA > 0) {
    // Parent B has greater childcare loss, Parent A pays up to loss difference or available margin
    const netLossDifference = round2((lossB - lossA) / 2);
    amount = round2(Math.min(netLossDifference, marginA));
    if (amount > 0) {
      payer = "parentA";
    }
  } else if (lossA > lossB && marginB > 0) {
    // Parent A has greater childcare loss, Parent B pays
    const netLossDifference = round2((lossA - lossB) / 2);
    amount = round2(Math.min(netLossDifference, marginB));
    if (amount > 0) {
      payer = "parentB";
    }
  }

  return {
    isEligibleFor1615l,
    employmentObligationPercentage,
    uncoveredLossParentA: lossA,
    uncoveredLossParentB: lossB,
    availableIncomeAAfterChildSupport: availableA,
    availableIncomeBAfterChildSupport: availableB,
    settlement: {
      payer,
      amount,
    },
  };
}
