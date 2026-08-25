import { DEFAULT_LEGAL_CONFIG_2026 } from "../config/dtTable2026";
import type { DtIncomeTier, LegalConfig } from "../types/config";
import type { CalculationInput } from "../types/input";
import type {
  CalculationResult,
  CalculationStepLog,
  ChildCalculationResult,
  ParentCalculationDetails,
} from "../types/output";
import { calculateAdjustedNetIncome } from "./incomeEngine";
import { round2, round4 } from "./rounding";

/**
 * Deterministic Wechselmodell (50:50) Child Support Engine
 *
 * Implements German Family Law jurisprudence:
 * - § 1606 Abs. 3 S. 1 BGB (mutual bar support obligation)
 * - BGH XII ZB 599/13 (quota formula based on income exceeding adequate retention)
 * - BGH XII ZB 565/15 (combined income tier determination, Mehrbedarf & quota-based direct expense sharing)
 * - BGH XII ZB 45/15 (Kindergeld 50% care share split equally [25% each] + 50% bar share distributed by liability quotas)
 * - BGH XII ZB 601/13 (strict restriction to symmetrical 50:50 models)
 */

/**
 * Isolated Kindergeld Equalization Claim under BGH XII ZB 45/15 ("Ein-Viertel-Regel")
 *
 * If no income is declared or no comprehensive support calculation is performed,
 * the non-receiving parent is entitled to an isolated cash claim of exactly 25%
 * of the state Kindergeld (the 50% care share split equally: 0.25 * KG).
 *
 * @param kindergeldPerChild State child benefit amount per child (e.g. 259 €)
 * @param childCount Number of children (default 1)
 */
export function calculateIsolatedKindergeldClaim(
  kindergeldPerChild: number,
  childCount: number = 1
): { perChild: number; total: number; carePortionPercentage: number } {
  const perChild = round2(kindergeldPerChild * 0.25);
  const total = round2(perChild * childCount);
  return {
    perChild,
    total,
    carePortionPercentage: 25,
  };
}
export function calculateWechselmodell(input: CalculationInput): CalculationResult {
  const config: LegalConfig = input.config || DEFAULT_LEGAL_CONFIG_2026;
  const auditTrail: CalculationStepLog[] = [];
  let currentStep = 1;

  // ---------------------------------------------------------------------------
  // STEP 1: Adjusted Net Income for both parents (Bereinigtes Nettoeinkommen)
  // ---------------------------------------------------------------------------
  const incA = calculateAdjustedNetIncome(input.parentA.income, config);
  const incB = calculateAdjustedNetIncome(input.parentB.income, config);

  auditTrail.push({
    stepNumber: currentStep++,
    label: `Bereinigtes Nettoeinkommen: ${input.parentA.name || "Elternteil A"}`,
    formula: "N_adj = N_net + Wohnvorteil - Berufsaufwand - Altersvorsorge(max 4%) - Schulden",
    description: `Netto: ${incA.rawNet.toFixed(2)} € + Wohnvorteil: ${incA.housingAdvantage.toFixed(2)} € - Berufsaufwand: ${incA.occupationalExpenses.toFixed(2)} € - Altersvorsorge: ${incA.cappedPension.toFixed(2)} € - Schulden: ${incA.allowableDebts.toFixed(2)} € = ${incA.adjustedNet.toFixed(2)} €`,
    value: incA.adjustedNet,
  });

  auditTrail.push({
    stepNumber: currentStep++,
    label: `Bereinigtes Nettoeinkommen: ${input.parentB.name || "Elternteil B"}`,
    formula: "N_adj = N_net + Wohnvorteil - Berufsaufwand - Altersvorsorge(max 4%) - Schulden",
    description: `Netto: ${incB.rawNet.toFixed(2)} € + Wohnvorteil: ${incB.housingAdvantage.toFixed(2)} € - Berufsaufwand: ${incB.occupationalExpenses.toFixed(2)} € - Altersvorsorge: ${incB.cappedPension.toFixed(2)} € - Schulden: ${incB.allowableDebts.toFixed(2)} € = ${incB.adjustedNet.toFixed(2)} €`,
    value: incB.adjustedNet,
  });

  // ---------------------------------------------------------------------------
  // STEP 2: Combined Adjusted Net Income & DT Table Tier Selection
  // ---------------------------------------------------------------------------
  const combinedAdjustedNet = round2(incA.adjustedNet + incB.adjustedNet);

  // Find tier in Düsseldorfer Tabelle based on combined income
  let appliedDtTier: DtIncomeTier = config.table[0];
  for (const tier of config.table) {
    if (combinedAdjustedNet >= tier.minIncome) {
      appliedDtTier = tier;
    }
  }

  auditTrail.push({
    stepNumber: currentStep++,
    label: "Kombiniertes Nettoeinkommen & DT-Einstufung (BGH XII ZB 565/15)",
    formula: "N_comb = N_adj,A + N_adj,B -> Düsseldorfer Tabelle 2026",
    description: `Kombiniertes Netto: ${combinedAdjustedNet.toFixed(2)} € -> Einkommensgruppe ${appliedDtTier.tierIndex} (${appliedDtTier.minIncome} € bis ${appliedDtTier.maxIncome === Infinity ? "über 11.200" : appliedDtTier.maxIncome} €, ${appliedDtTier.percentage}%)`,
    value: appliedDtTier.tierIndex,
  });

  // ---------------------------------------------------------------------------
  // STEP 3: Liability Incomes & Quota Determination (Haftungsanteile)
  // ---------------------------------------------------------------------------
  const sbAdequate = config.retentionRates.adequate;
  const sbNotwA = incA.isEmployed
    ? config.retentionRates.necessaryEmployed
    : config.retentionRates.necessaryUnemployed;
  const sbNotwB = incB.isEmployed
    ? config.retentionRates.necessaryEmployed
    : config.retentionRates.necessaryUnemployed;

  const hA = round2(Math.max(0, incA.adjustedNet - sbAdequate));
  const hB = round2(Math.max(0, incB.adjustedNet - sbAdequate));
  const hTotal = round2(hA + hB);

  let qA = 0;
  let qB = 0;

  if (hTotal > 0) {
    qA = hA / hTotal;
    qB = hB / hTotal;
  } else {
    // If both parents are below adequate retention, check necessary retention (Mangelfall)
    const hNotwA = Math.max(0, incA.adjustedNet - sbNotwA);
    const hNotwB = Math.max(0, incB.adjustedNet - sbNotwB);
    const hNotwTot = hNotwA + hNotwB;
    if (hNotwTot > 0) {
      qA = hNotwA / hNotwTot;
      qB = hNotwB / hNotwTot;
    } else {
      qA = 0.5;
      qB = 0.5;
    }
  }

  const qARounded = round4(qA);
  const qBRounded = round4(qB);

  auditTrail.push({
    stepNumber: currentStep++,
    label: "Haftungsanteile (BGH XII ZB 599/13, BGH XII ZB 565/15)",
    formula: "H = max(0, N_adj - SB_ang); Q = H / H_ges",
    description: `H_A = max(0, ${incA.adjustedNet.toFixed(2)} € - ${sbAdequate} €) = ${hA.toFixed(2)} €; H_B = max(0, ${incB.adjustedNet.toFixed(2)} € - ${sbAdequate} €) = ${hB.toFixed(2)} €; Haftungsquoten: Q_A = ${(qARounded * 100).toFixed(2)} %, Q_B = ${(qBRounded * 100).toFixed(2)} %`,
    value: `Q_A: ${(qARounded * 100).toFixed(2)}% | Q_B: ${(qBRounded * 100).toFixed(2)}%`,
  });

  // ---------------------------------------------------------------------------
  // STEP 4: Child Needs Determination & Real Housing Mehrbedarf (BGH XII ZB 565/15 Rn. 25)
  // ---------------------------------------------------------------------------
  const childrenResults: ChildCalculationResult[] = [];
  let primaryObligationA = 0;
  let primaryObligationB = 0;
  let totalChildNeedAll = 0;
  let totalShareParentAAll = 0;
  let totalShareParentBAll = 0;

  // Actual per-child housing costs across both households (BGH XII ZB 565/15 Rn. 25 & Pro-Kopf-Methode)
  const warmRentA = Math.max(0, input.parentA.housingCosts?.warmRentMonthly || 0);
  const personsA = Math.max(1, input.parentA.housingCosts?.householdPersons || 1);
  const childHousingA = warmRentA > 0 ? round2(warmRentA / personsA) : 0;

  const warmRentB = Math.max(0, input.parentB.housingCosts?.warmRentMonthly || 0);
  const personsB = Math.max(1, input.parentB.housingCosts?.householdPersons || 1);
  const childHousingB = warmRentB > 0 ? round2(warmRentB / personsB) : 0;

  const actualChildHousingTotal = round2(childHousingA + childHousingB);

  for (const child of input.children) {
    const tabellenUnterhalt = appliedDtTier.rates[child.ageGroup] || 0;
    const housingPortionInTable = round2(tabellenUnterhalt * 0.2);

    let calculatedWohnmehrbedarf = 0;
    if (actualChildHousingTotal > 0) {
      calculatedWohnmehrbedarf = round2(
        Math.max(0, actualChildHousingTotal - housingPortionInTable)
      );

      auditTrail.push({
        stepNumber: currentStep++,
        label: `Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25): ${child.name || child.id}`,
        formula: "Wohnmehrbedarf = max(0, (Miete_A / Pers_A + Miete_B / Pers_B) - 20% * B_tab)",
        description: `Wohnkostenanteil Kind A (${warmRentA.toFixed(2)} € / ${personsA} Pers. = ${childHousingA.toFixed(2)} €) + B (${warmRentB.toFixed(2)} € / ${personsB} Pers. = ${childHousingB.toFixed(2)} €) = ${actualChildHousingTotal.toFixed(2)} € tatsächlicher Wohnaufwand. Abzüglich 20% Tabellenanteil (${housingPortionInTable.toFixed(2)} €) = ${calculatedWohnmehrbedarf.toFixed(2)} € Wohnmehrbedarf.`,
        value: calculatedWohnmehrbedarf,
      });
    }

    const manualWechselmodellSurcharge = round2(
      Math.max(0, child.additionalNeeds?.wechselmodellSurcharge || 0)
    );
    const specialNeeds = round2(Math.max(0, child.additionalNeeds?.specialNeeds || 0));
    const additionalNeedsTotal = round2(
      calculatedWohnmehrbedarf + manualWechselmodellSurcharge + specialNeeds
    );
    const totalNeed = round2(tabellenUnterhalt + additionalNeedsTotal);

    const shareParentA = round2(totalNeed * qA);
    const shareParentB = round2(totalNeed * qB);
    const naturalShare = round2(totalNeed * 0.5);

    // In a 50:50 Wechselmodell, each parent already provides 50% in natura at their own household.
    // The cash equalization share (Unterhaltsspitze) before KG and direct deductions is:
    // Obligation_A = shareParentA - 0.5 * totalNeed = totalNeed * (qA - 0.5)
    // Obligation_B = shareParentB - 0.5 * totalNeed = totalNeed * (qB - 0.5)
    const childObligationA = round2(shareParentA - naturalShare);
    const childObligationB = round2(shareParentB - naturalShare);

    primaryObligationA = round2(primaryObligationA + childObligationA);
    primaryObligationB = round2(primaryObligationB + childObligationB);
    totalChildNeedAll = round2(totalChildNeedAll + totalNeed);
    totalShareParentAAll = round2(totalShareParentAAll + shareParentA);
    totalShareParentBAll = round2(totalShareParentBAll + shareParentB);

    childrenResults.push({
      childId: child.id,
      ageGroup: child.ageGroup,
      tabellenUnterhalt,
      housingNeedCalculated: actualChildHousingTotal > 0 ? actualChildHousingTotal : undefined,
      housingPortionInTable: actualChildHousingTotal > 0 ? housingPortionInTable : undefined,
      calculatedWohnmehrbedarf: actualChildHousingTotal > 0 ? calculatedWohnmehrbedarf : undefined,
      additionalNeedsTotal,
      totalNeed,
      shareParentA,
      shareParentB,
    });

    auditTrail.push({
      stepNumber: currentStep++,
      label: `Bedarfsberechnung Kind (BGH XII ZB 565/15): ${child.name || child.id}`,
      formula:
        "B_ges = B_tab + Mehrbedarf; Anteil_A = B_ges * Q_A; U_prim,A = Anteil_A - (50% * B_ges)",
      description: `Altersstufe ${child.ageGroup}: Tabellenbedarf ${tabellenUnterhalt.toFixed(2)} € + Mehrbedarf ${additionalNeedsTotal.toFixed(2)} €${calculatedWohnmehrbedarf > 0 ? ` (inkl. ${calculatedWohnmehrbedarf.toFixed(2)} € Wohnmehrbedarf)` : ""} = Gesamtbedarf ${totalNeed.toFixed(2)} €. Haftungsanteil A (${(qARounded * 100).toFixed(2)}%): ${shareParentA.toFixed(2)} € abzüglich 50% Naturalunterhalt (${naturalShare.toFixed(2)} €) = Barunterhalt A: ${childObligationA.toFixed(2)} €; Barunterhalt B: ${childObligationB.toFixed(2)} €`,
      value: totalNeed,
    });
  }

  // ---------------------------------------------------------------------------
  // STEP 5: Kindergeld Equalization (BGH XII ZB 45/15 & BGH XII ZB 565/15 Rn. 32)
  // & Quota-Based Direct Expense Sharing (BGH XII ZB 565/15 Rn. 28-30)
  // ---------------------------------------------------------------------------
  const totalKindergeld = round2(input.children.length * config.kindergeldPerChild);
  const carePortionTotal = round2(totalKindergeld * 0.25); // 25% Betreuungsanteil per parent
  const barPortionTotal = round2(totalKindergeld * 0.5); // 50% Baranteil to reduce child cash need

  let kindergeldAdjustmentA = 0;
  let kindergeldAdjustmentB = 0;

  // Kindergeld Equalization pursuant to BGH XII ZB 45/15 & BGH XII ZB 565/15 Rn. 32:
  // 1. 50% Care portion (Betreuungsanteil = 25% of total KG per parent):
  //    The recipient parent must forward 25% of total KG directly to the non-recipient parent.
  // 2. 50% Cash portion (Barunterhaltsanteil = 50% of total KG):
  //    Reduces cash child support proportionally to liability quotas (Q_A : Q_B).
  //    The non-recipient parent's share of cash relief is Q_non_recipient * (50% of KG).
  //    Since the recipient holds the entire cash amount from the state, they must credit/forward:
  //    ΔKG_recipient_to_non_recipient = 25% KG + Q_non_recipient * (50% KG)
  if (input.parentA.receivesKindergeld && !input.parentB.receivesKindergeld) {
    kindergeldAdjustmentA = round2(carePortionTotal + qB * barPortionTotal);
    kindergeldAdjustmentB = round2(-kindergeldAdjustmentA);
  } else if (input.parentB.receivesKindergeld && !input.parentA.receivesKindergeld) {
    kindergeldAdjustmentB = round2(carePortionTotal + qA * barPortionTotal);
    kindergeldAdjustmentA = round2(-kindergeldAdjustmentB);
  }

  const directExpensesA = round2(
    input.parentA.directExpensesCoveredAnnual !== undefined
      ? Math.max(0, Number(input.parentA.directExpensesCoveredAnnual) / 12)
      : Math.max(0, input.parentA.directExpensesCovered || 0)
  );
  const directExpensesB = round2(
    input.parentB.directExpensesCoveredAnnual !== undefined
      ? Math.max(0, Number(input.parentB.directExpensesCoveredAnnual) / 12)
      : Math.max(0, input.parentB.directExpensesCovered || 0)
  );

  // According to BGH XII ZB 565/15:
  // Direct expenses (D_A, D_B) benefit the child and must be borne by both parents according to their liability quotas (Q_A : Q_B).
  // Parent A must bear Q_A of Parent B's expenses (+ Q_A * D_B).
  // Parent B must bear Q_B of Parent A's expenses (+ Q_B * D_A -> credit for A: - Q_B * D_A).
  const directExpenseAdjustmentA = round2(qA * directExpensesB - qB * directExpensesA);
  const directExpenseAdjustmentB = round2(-directExpenseAdjustmentA);

  const directExpensesShareAFromB = round2(qA * directExpensesB);
  const directExpensesShareBFromA = round2(qB * directExpensesA);

  const carePortionActive =
    input.parentA.receivesKindergeld !== input.parentB.receivesKindergeld ? carePortionTotal : 0;
  const barPortionActive = round2(Math.abs(kindergeldAdjustmentA) - carePortionActive);

  auditTrail.push({
    stepNumber: currentStep++,
    label: "Kindergeld- & Direktaufwandsverrechnung (BGH XII ZB 45/15 & XII ZB 565/15)",
    formula: "ΔKG_A = ±(25% * KG + Q_andere * 50% * KG); ΔD_A = Q_A * D_B - Q_B * D_A",
    description: `Kindergeld gesamt: ${totalKindergeld.toFixed(2)} € (Betreuungsanteil 25%: ${carePortionTotal.toFixed(2)} €, Baranteil 50%: ${barPortionTotal.toFixed(2)} €). Ausgleich KG A: ${kindergeldAdjustmentA > 0 ? "+" : ""}${kindergeldAdjustmentA.toFixed(2)} € (25% Betreuung: ${carePortionActive.toFixed(2)} € + Quoten-Baranteil: ${barPortionActive.toFixed(2)} €). Direktaufwand B: ${directExpensesB.toFixed(2)} € (A übernimmt ${(qARounded * 100).toFixed(2)}% = ${directExpensesShareAFromB.toFixed(2)} €); Direktaufwand A: ${directExpensesA.toFixed(2)} € (B übernimmt ${(qBRounded * 100).toFixed(2)}% = ${directExpensesShareBFromA.toFixed(2)} €). Netto-Direktkosten A: ${directExpenseAdjustmentA > 0 ? "+" : ""}${directExpenseAdjustmentA.toFixed(2)} €`,
    value: Math.abs(kindergeldAdjustmentA),
  });

  // ---------------------------------------------------------------------------
  // STEP 6: Net Settlement Calculation (Spitzabrechnung Z_A & Z_B)
  // ---------------------------------------------------------------------------
  // Comprehensive formula following BGH XII ZB 565/15:
  // Z_A = (Anteil_A - 50% * Gesamtbedarf) + (Q_A * D_B - Q_B * D_A) + ΔKG_A
  //     = U_prim,A + ΔD_A + ΔKG_A
  const netPaymentA = round2(primaryObligationA + directExpenseAdjustmentA + kindergeldAdjustmentA);
  const netPaymentB = round2(primaryObligationB + directExpenseAdjustmentB + kindergeldAdjustmentB);

  let payer: "parentA" | "parentB" | "balanced" = "balanced";
  let settlementAmount = 0;

  if (netPaymentA > 0.005) {
    payer = "parentA";
    settlementAmount = round2(netPaymentA);
  } else if (netPaymentA < -0.005) {
    payer = "parentB";
    settlementAmount = round2(Math.abs(netPaymentA));
  } else {
    payer = "balanced";
    settlementAmount = 0;
  }

  // Remaining income after settlement
  const remainingIncomeA = round2(incA.adjustedNet - netPaymentA);
  const remainingIncomeB = round2(incB.adjustedNet - netPaymentB);

  // ---------------------------------------------------------------------------
  // STEP 7: Retention Check (Selbstbehaltsprüfung) & Audit Log
  // ---------------------------------------------------------------------------
  const isBelowRetentionA = remainingIncomeA < sbNotwA || incA.adjustedNet < sbAdequate;
  const isBelowRetentionB = remainingIncomeB < sbNotwB || incB.adjustedNet < sbAdequate;

  const totalNaturalA = round2(totalChildNeedAll * 0.5);

  auditTrail.push({
    stepNumber: currentStep++,
    label: "Endabrechnung & Zahlbetrag (Spitzabrechnung)",
    formula:
      "Z_A = (Anteil_A - 50% Natural_A) + (Q_A * D_B - Q_B * D_A) + ΔKG_A; Verbleibendes Einkommen = N_adj - Z",
    description: `Haftungsanteil A (${totalShareParentAAll.toFixed(2)} €) abzüglich 50% Naturalunterhalt (${totalNaturalA.toFixed(2)} €) [= Barunterhaltsspitze ${primaryObligationA.toFixed(2)} €] + Direktkostenübernahme (${directExpenseAdjustmentA > 0 ? "+" : ""}${directExpenseAdjustmentA.toFixed(2)} €) + Kindergeld-Ausgleich (${kindergeldAdjustmentA > 0 ? "+" : ""}${kindergeldAdjustmentA.toFixed(2)} €) = Zahlbetrag A: ${netPaymentA.toFixed(2)} €. Ergebnis: ${
      payer === "balanced"
        ? "Vollständiger Ausgleich (0,00 €)"
        : payer === "parentA"
          ? `Elternteil A zahlt ${settlementAmount.toFixed(2)} € an Elternteil B`
          : `Elternteil B zahlt ${settlementAmount.toFixed(2)} € an Elternteil A`
    }. Verbleibendes Netto: A = ${remainingIncomeA.toFixed(2)} € (SB_notw: ${sbNotwA} €), B = ${remainingIncomeB.toFixed(2)} € (SB_notw: ${sbNotwB} €)`,
    value: settlementAmount,
  });

  const parentADetails: ParentCalculationDetails = {
    rawNet: incA.rawNet,
    adjustedNet: incA.adjustedNet,
    deductionsTotal: incA.deductionsTotal,
    selfRetentionApplied: sbAdequate,
    liabilityIncome: hA,
    liabilityShare: qARounded,
    primaryObligation: primaryObligationA,
    directExpensesDeduction: directExpenseAdjustmentA,
    kindergeldAdjustment: kindergeldAdjustmentA,
    netPayment: netPaymentA,
    remainingIncome: remainingIncomeA,
    isBelowRetention: isBelowRetentionA,
  };

  const parentBDetails: ParentCalculationDetails = {
    rawNet: incB.rawNet,
    adjustedNet: incB.adjustedNet,
    deductionsTotal: incB.deductionsTotal,
    selfRetentionApplied: sbAdequate,
    liabilityIncome: hB,
    liabilityShare: qBRounded,
    primaryObligation: primaryObligationB,
    directExpensesDeduction: directExpenseAdjustmentB,
    kindergeldAdjustment: kindergeldAdjustmentB,
    netPayment: netPaymentB,
    remainingIncome: remainingIncomeB,
    isBelowRetention: isBelowRetentionB,
  };

  return {
    combinedAdjustedNet,
    appliedDtTier,
    childrenResults,
    parentA: parentADetails,
    parentB: parentBDetails,
    settlement: {
      payer,
      amount: settlementAmount,
    },
    auditTrail,
  };
}
