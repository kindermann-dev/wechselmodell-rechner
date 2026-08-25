import { round2 } from "./rounding";

export interface BetreuungsunterhaltInput {
  parentA: {
    name: string;
    fullTimeNetIncome: number; // Vollzeit-Nettoeinkommen ohne Kinderbetreuung
    actualPartTimeNetIncome: number; // Tatsächliches oder fiktives 50%-Teilzeit-Nettoeinkommen
    childSupportObligation: number; // Kindesunterhaltsverpflichtung (Vorwegabzug nach BGHZ 213, 254)
    selfRetention: number; // Selbstbehalt (z. B. 1.750 € oder 1.450 €)
  };
  parentB: {
    name: string;
    fullTimeNetIncome: number;
    actualPartTimeNetIncome: number;
    childSupportObligation: number;
    selfRetention: number;
  };
  childAgeYears: number; // Kindesalter in Jahren (relevant für § 1615l: bis zum 3. Lebensjahr)
}

export interface BetreuungsunterhaltResult {
  isEligibleFor1615l: boolean; // Kind unter 3 Jahren
  employmentObligationPercentage: number; // 50% Erwerbsobliegenheit im 50:50-Wechselmodell
  uncoveredLossParentA: number; // Betreuungsbedingter Einkommensverlust für Elternteil A
  uncoveredLossParentB: number; // Betreuungsbedingter Einkommensverlust für Elternteil B
  availableIncomeAAfterChildSupport: number; // Verfügbares Einkommen Elternteil A nach Vorwegabzug des Kindesunterhalts
  availableIncomeBAfterChildSupport: number; // Verfügbares Einkommen Elternteil B nach Vorwegabzug des Kindesunterhalts
  settlement: {
    payer: "parentA" | "parentB" | "balanced";
    amount: number;
  };
}

/**
 * Berechnet den Betreuungsunterhalt nach § 1615l BGB für nicht miteinander verheiratete
 * Eltern im paritätischen 50:50-Wechselmodell.
 *
 * Setzt die Leitentscheidungen des BGH (NJW 2026 S. 8 / OLG Koblenz 13 UF 397/24) um:
 * 1. Beide Elternteile können im 50:50-Modell Anspruchsinhaber nach § 1615l BGB sein.
 * 2. 50 % Erwerbsobliegenheit für jeden Elternteil (hälftige Vollzeittätigkeit).
 * 3. Kindesunterhalt wird vorab in Abzug gebracht (Vorwegabzug, Rn. 19).
 * 4. Der Anspruch bemisst sich nach dem betreuungsbedingten Einkommensausfall.
 */
export function calculateBetreuungsunterhalt1615l(
  input: BetreuungsunterhaltInput
): BetreuungsunterhaltResult {
  const isEligibleFor1615l = input.childAgeYears < 3;
  const employmentObligationPercentage = isEligibleFor1615l ? 50 : 100;

  // 1. Unverdeckter Einkommensverlust durch 50% Kinderbetreuung
  const lossA = round2(
    Math.max(0, input.parentA.fullTimeNetIncome - input.parentA.actualPartTimeNetIncome)
  );
  const lossB = round2(
    Math.max(0, input.parentB.fullTimeNetIncome - input.parentB.actualPartTimeNetIncome)
  );

  // 2. Verfügbares Einkommen nach Vorwegabzug des Kindesunterhalts (BGHZ 213, 254 Rn. 19)
  const availableA = round2(
    Math.max(0, input.parentA.actualPartTimeNetIncome - input.parentA.childSupportObligation)
  );
  const availableB = round2(
    Math.max(0, input.parentB.actualPartTimeNetIncome - input.parentB.childSupportObligation)
  );

  // 3. Verteilungsmasse über Selbstbehalt
  const marginA = round2(Math.max(0, availableA - input.parentA.selfRetention));
  const marginB = round2(Math.max(0, availableB - input.parentB.selfRetention));

  let payer: "parentA" | "parentB" | "balanced" = "balanced";
  let amount = 0;

  if (lossB > lossA && marginA > 0) {
    // Elternteil B hat höheren Betreuungsverlust, Elternteil A gleicht Differenz bis zur Leistungsgrenze aus
    const netLossDifference = round2((lossB - lossA) / 2);
    amount = round2(Math.min(netLossDifference, marginA));
    if (amount > 0) {
      payer = "parentA";
    }
  } else if (lossA > lossB && marginB > 0) {
    // Elternteil A hat höheren Betreuungsverlust, Elternteil B gleicht Differenz aus
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
