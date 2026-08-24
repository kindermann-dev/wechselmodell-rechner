import { describe, expect, it } from "vitest";
import { DEFAULT_LEGAL_CONFIG_2026 } from "../config/dtTable2026";
import type { CalculationInput } from "../types/input";
import { calculateBetreuungsunterhalt1615l } from "./betreuungsunterhaltEngine";
import { calculateWechselmodell } from "./custodyEngine";
import { calculateAdjustedNetIncome, calculateOlgDresdenWohnmehrbedarf } from "./incomeEngine";
import { round2 } from "./rounding";

describe("Wechselmodell Child Support Calculation Engine", () => {
  describe("Income Engine (Bereinigtes Netto)", () => {
    it("calculates occupational expenses flat rate correctly (min 50, 5%, max 150)", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;

      // Below min: 5% of 800 is 40 -> capped at min 50
      const resLow = calculateAdjustedNetIncome(
        {
          grossMonthly: 1200,
          netMonthly: 800,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: true },
          privatePensionMonthly: 0,
          allowableDebtsMonthly: 0,
          housingAdvantageMonthly: 0,
          otherDeductionsMonthly: 0,
        },
        config
      );
      expect(resLow.occupationalExpenses).toBe(50);
      expect(resLow.adjustedNet).toBe(750);

      // In between: 5% of 2000 is 100 -> exactly 100
      const resMid = calculateAdjustedNetIncome(
        {
          grossMonthly: 3000,
          netMonthly: 2000,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: true },
          privatePensionMonthly: 0,
          allowableDebtsMonthly: 0,
          housingAdvantageMonthly: 0,
          otherDeductionsMonthly: 0,
        },
        config
      );
      expect(resMid.occupationalExpenses).toBe(100);
      expect(resMid.adjustedNet).toBe(1900);

      // Above max: 5% of 4000 is 200 -> capped at max 150
      const resHigh = calculateAdjustedNetIncome(
        {
          grossMonthly: 6000,
          netMonthly: 4000,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: true },
          privatePensionMonthly: 0,
          allowableDebtsMonthly: 0,
          housingAdvantageMonthly: 0,
          otherDeductionsMonthly: 0,
        },
        config
      );
      expect(resHigh.occupationalExpenses).toBe(150);
      expect(resHigh.adjustedNet).toBe(3850);
    });

    it("does not apply occupational flat rate when unemployed", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      const res = calculateAdjustedNetIncome(
        {
          grossMonthly: 1500,
          netMonthly: 1500,
          isEmployed: false,
          occupationalExpenses: { useFlatRate: true },
          privatePensionMonthly: 0,
          allowableDebtsMonthly: 0,
          housingAdvantageMonthly: 0,
          otherDeductionsMonthly: 0,
        },
        config
      );
      expect(res.occupationalExpenses).toBe(0);
      expect(res.adjustedNet).toBe(1500);
    });

    it("caps private pension at 4% of gross income", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      // 4% of 5000 gross is 200. Private pension requested is 300 -> capped at 200.
      const res = calculateAdjustedNetIncome(
        {
          grossMonthly: 5000,
          netMonthly: 3200,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: false, customAmount: 0 },
          privatePensionMonthly: 300,
          allowableDebtsMonthly: 0,
          housingAdvantageMonthly: 0,
          otherDeductionsMonthly: 0,
        },
        config
      );
      expect(res.cappedPension).toBe(200);
      expect(res.adjustedNet).toBe(3000);
    });

    it("adds housing advantage and subtracts allowable debts", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      const res = calculateAdjustedNetIncome(
        {
          grossMonthly: 4000,
          netMonthly: 2500,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: false, customAmount: 100 },
          privatePensionMonthly: 0,
          allowableDebtsMonthly: 200,
          housingAdvantageMonthly: 400,
          otherDeductionsMonthly: 50,
        },
        config
      );
      // 2500 + 400 - (100 + 0 + 200 + 50) = 2900 - 350 = 2550
      expect(res.housingAdvantage).toBe(400);
      expect(res.deductionsTotal).toBe(350);
      expect(res.adjustedNet).toBe(2550);
    });

    it("processes annual income with bonuses and tax refunds into monthly equivalents", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      // Annual gross: 60.000 € (5.000 € / Mo.)
      // Annual regular net: 36.000 € (3.000 € / Mo.)
      // Annual bonus net: 6.000 € (500 € / Mo.) -> total annual net = 42.000 € -> 3.500 € / Mo.
      // Pension annual: 2.400 € (200 € / Mo.) -> capped at 4% of 5.000 = 200 €
      // Flat rate: 5% of 3.500 = 175 -> capped at 150 €
      const res = calculateAdjustedNetIncome(
        {
          grossAnnual: 60000,
          netAnnual: 36000,
          annualBonusNet: 6000,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: true },
          privatePensionAnnual: 2400,
          housingAdvantageAnnual: 0,
          allowableDebtsAnnual: 0,
        },
        config
      );

      expect(res.rawNet).toBe(3500); // (36000 + 6000) / 12
      expect(res.grossMonthly).toBe(5000); // 60000 / 12
      expect(res.occupationalExpenses).toBe(150); // Capped at max 150
      expect(res.cappedPension).toBe(200); // Capped at 4% of 5000
      expect(res.adjustedNet).toBe(3150); // 3500 - 150 - 200
      expect(res.adjustedAnnualNet).toBe(37800); // 3150 * 12
    });
  });

  describe("Core Custody Engine Scenarios", () => {
    // -------------------------------------------------------------------------
    // TEST 1: Symmetric Case (Equal Incomes)
    // N_A = N_B = 3000 € -> Q_A = 0.5, Q_B = 0.5. With equal expenses and KG to A, A pays half KG to B.
    // -------------------------------------------------------------------------
    it("Scenario 1 (Symmetric Case): equal incomes result in 50:50 quota and KG transfer", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Parent A",
          income: {
            grossMonthly: 4500,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Parent B",
          income: {
            grossMonthly: 4500,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Child 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 0,
              specialNeeds: 0,
            },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      };

      const result = calculateWechselmodell(input);

      // Equal adjusted net incomes
      expect(result.parentA.adjustedNet).toBe(3000);
      expect(result.parentB.adjustedNet).toBe(3000);

      // Quotas are exactly 50:50
      expect(result.parentA.liabilityShare).toBe(0.5);
      expect(result.parentB.liabilityShare).toBe(0.5);

      // Combined income: 6000 € (Tier 11: 5701 - 6400)
      expect(result.combinedAdjustedNet).toBe(6000);
      expect(result.appliedDtTier.tierIndex).toBe(11);

      // Primary equalized obligation is 0 for equal incomes
      expect(result.parentA.primaryObligation).toBe(0);
      expect(result.parentB.primaryObligation).toBe(0);

      // Kindergeld is 250 €, half is 125 €. Since Parent A received it, A must forward 125 € to B.
      expect(result.parentA.kindergeldAdjustment).toBe(125);
      expect(result.parentB.kindergeldAdjustment).toBe(-125);

      // Final settlement: Parent A pays 125 € to Parent B
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(125);
      expect(result.parentA.netPayment).toBe(125);
      expect(result.parentB.netPayment).toBe(-125);
    });

    // -------------------------------------------------------------------------
    // TEST 2: Asymmetric Incomes (BGH Reference)
    // Parent A: Net 4000 € (Adjusted 3800 €), receives Kindergeld.
    // Parent B: Net 2200 € (Adjusted 2050 €), does not receive Kindergeld.
    // 1 Child (Age 6-11).
    // Verify calculated quotas, correct tier selection from combined 5,850 €, and correct net payment from A to B.
    // -------------------------------------------------------------------------
    it("Scenario 2 (Asymmetric Incomes - BGH Reference): calculates correct quotas, DT tier and net payment", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Parent A",
          income: {
            grossMonthly: 5000,
            netMonthly: 4000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 200 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Parent B",
          income: {
            grossMonthly: 2800,
            netMonthly: 2200,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 150 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "child1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 0,
              specialNeeds: 0,
            },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          retentionRates: {
            necessaryEmployed: 1450,
            necessaryUnemployed: 1200,
            adequate: 1750,
          },
          kindergeldPerChild: 250,
        },
      };

      const result = calculateWechselmodell(input);

      // Verify adjusted net incomes
      expect(result.parentA.adjustedNet).toBe(3800);
      expect(result.parentB.adjustedNet).toBe(2050);

      // Combined income = 5850 € -> Tier 11 (5701 - 6400)
      expect(result.combinedAdjustedNet).toBe(5850);
      expect(result.appliedDtTier.tierIndex).toBe(11);

      // Liability income (SB_adequate = 1750 €):
      // H_A = 3800 - 1750 = 2050 €
      // H_B = 2050 - 1750 = 300 €
      // Total H = 2350 €
      expect(result.parentA.liabilityIncome).toBe(2050);
      expect(result.parentB.liabilityIncome).toBe(300);

      // Quotas:
      // Q_A = 2050 / 2350 = 0.87234... -> 0.8723 (87.23%)
      // Q_B = 300 / 2350 = 0.12765... -> 0.1277 (12.77%)
      expect(result.parentA.liabilityShare).toBeCloseTo(0.8723, 3);
      expect(result.parentB.liabilityShare).toBeCloseTo(0.1277, 3);

      // Child Bedarf for Age 6-11 in Tier 11: 938 €
      const childRes = result.childrenResults[0];
      expect(childRes.tabellenUnterhalt).toBe(938);
      expect(childRes.totalNeed).toBe(938);

      // Parent share of total need:
      // shareA = 938 * (2050/2350) = 818.26 €
      // shareB = 938 * (300/2350) = 119.74 €
      expect(childRes.shareParentA).toBe(818.26);
      expect(childRes.shareParentB).toBe(119.74);

      // Primary obligation before KG (relative to 50% in natura care = 469 €):
      // U_prim,A = 818.26 - 469.00 = 349.26 €
      // U_prim,B = 119.74 - 469.00 = -349.26 €
      expect(result.parentA.primaryObligation).toBe(349.26);
      expect(result.parentB.primaryObligation).toBe(-349.26);

      // Kindergeld: 250 € -> half = 125 €
      // Parent A receives KG -> +125 € adjustment
      expect(result.parentA.kindergeldAdjustment).toBe(125);
      expect(result.parentB.kindergeldAdjustment).toBe(-125);

      // Final payment Z_A = 349.26 + 125 = 474.26 €
      expect(result.parentA.netPayment).toBe(474.26);
      expect(result.parentB.netPayment).toBe(-474.26);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(474.26);

      // Remaining income verification
      expect(result.parentA.remainingIncome).toBe(round2(3800 - 474.26));
      expect(result.parentB.remainingIncome).toBe(round2(2050 + 474.26));
    });

    // -------------------------------------------------------------------------
    // TEST 3: One Parent Below Retention
    // Parent B below adequate SB (H_B = 0) -> Q_A = 1.0, Q_B = 0.0.
    // -------------------------------------------------------------------------
    it("Scenario 3 (One Parent Below Retention): Parent B below adequate retention results in Q_A = 1.0 and Q_B = 0.0", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Parent A",
          income: {
            grossMonthly: 4500,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Parent B",
          income: {
            grossMonthly: 1800,
            netMonthly: 1600, // Below adequate retention of 1750 €
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 0,
              specialNeeds: 0,
            },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      };

      const result = calculateWechselmodell(input);

      // Parent B adjusted net is 1600 € (< 1750 € adequate SB) -> H_B = 0
      expect(result.parentB.adjustedNet).toBe(1600);
      expect(result.parentB.liabilityIncome).toBe(0);

      // Parent A adjusted net is 3000 € -> H_A = 1250 €
      expect(result.parentA.liabilityIncome).toBe(1250);

      // Quotas: Q_A = 1.0, Q_B = 0.0
      expect(result.parentA.liabilityShare).toBe(1.0);
      expect(result.parentB.liabilityShare).toBe(0.0);

      // Combined income: 4600 € -> Tier 8 (4501 - 4900)
      expect(result.combinedAdjustedNet).toBe(4600);
      expect(result.appliedDtTier.tierIndex).toBe(8);

      // Base need for 6-11 in Tier 8: 804 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(804);
      expect(childRes.shareParentA).toBe(804);
      expect(childRes.shareParentB).toBe(0);

      // Primary obligation for A: 804 - 402 (50% in-kind) = 402 €
      expect(result.parentA.primaryObligation).toBe(402);
      expect(result.parentB.primaryObligation).toBe(-402);

      // Net settlement (with 125 € half KG to B): 402 + 125 = 527 €
      expect(result.parentA.netPayment).toBe(527);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(527);
    });

    // -------------------------------------------------------------------------
    // TEST 4: Direct Expenses Offset
    // Parent A pays 150 € in direct child costs -> payment to B is reduced by exactly 150 €.
    // -------------------------------------------------------------------------
    it("Scenario 4 (Direct Expenses Offset): direct expenses reduce payment 1:1", () => {
      // Base scenario identical to Scenario 2
      const baseInput: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Parent A",
          income: {
            grossMonthly: 5000,
            netMonthly: 4000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 200 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Parent B",
          income: {
            grossMonthly: 2800,
            netMonthly: 2200,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 150 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "child1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 0,
              specialNeeds: 0,
            },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      };

      calculateWechselmodell(baseInput);

      // Input with 150 € direct expenses covered by Parent A
      const offsetInput: CalculationInput = {
        ...baseInput,
        parentA: {
          ...baseInput.parentA,
          directExpensesCovered: 150,
        },
      };

      const offsetResult = calculateWechselmodell(offsetInput);

      // In accordance with BGH XII ZB 565/15:
      // Direct expenses of 150 € covered by Parent A are shared by liability quotas (Q_A : Q_B).
      // Parent B must reimburse their share Q_B * 150 €, reducing Parent A's payment.
      expect(offsetResult.settlement.amount).toBeCloseTo(455.11, 2);
      expect(offsetResult.parentA.netPayment).toBeCloseTo(455.11, 2);
      expect(offsetResult.parentA.directExpensesDeduction).toBeCloseTo(-19.15, 2);
    });

    // -------------------------------------------------------------------------
    // TEST 5: Mehrbedarf and Sonderbedarf Surcharges
    // -------------------------------------------------------------------------
    it("adds Mehrbedarf (Wechselmodell surcharge) and Sonderbedarf to child needs", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Parent A",
          income: {
            grossMonthly: 4000,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Parent B",
          income: {
            grossMonthly: 4000,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true, // Parent B receives KG
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Child 1",
            ageGroup: "0-5",
            additionalNeeds: {
              wechselmodellSurcharge: 100, // Housing / travel surcharge
              specialNeeds: 50, // Therapy / music lesson
            },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      };

      const result = calculateWechselmodell(input);
      const child = result.childrenResults[0];

      // Combined 6000 € -> Tier 11. Tier 11 rate for '0-5' is 817 €
      expect(child.tabellenUnterhalt).toBe(817);
      expect(child.additionalNeedsTotal).toBe(150);
      expect(child.totalNeed).toBe(967);

      // Quotas 50:50 -> share = 483.50 each
      expect(child.shareParentA).toBe(483.5);
      expect(child.shareParentB).toBe(483.5);

      // Since B receives Kindergeld, B must pay half KG (125 €) to A -> Z_A = -125 € (B pays A 125 €)
      expect(result.settlement.payer).toBe("parentB");
      expect(result.settlement.amount).toBe(125);
    });

    // -------------------------------------------------------------------------
    // TEST 6: Audit Trail Verification
    // -------------------------------------------------------------------------
    it("produces a comprehensive, sequential audit trail for every step", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Parent A",
          income: {
            grossMonthly: 4000,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
            privatePensionMonthly: 100,
            allowableDebtsMonthly: 50,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 50,
        },
        parentB: {
          id: "parentB",
          name: "Parent B",
          income: {
            grossMonthly: 3000,
            netMonthly: 2200,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 100,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Child 1",
            ageGroup: "12-17",
            additionalNeeds: {
              wechselmodellSurcharge: 50,
              specialNeeds: 0,
            },
          },
        ],
      };

      const result = calculateWechselmodell(input);

      expect(result.auditTrail.length).toBeGreaterThanOrEqual(7);

      // Verify all required steps are logged
      const labels = result.auditTrail.map((log) => log.label);
      expect(labels.some((l) => l.includes("Bereinigtes Nettoeinkommen"))).toBe(true);
      expect(
        labels.some((l) => l.includes("Kombiniertes Nettoeinkommen") || l.includes("DT-Einstufung"))
      ).toBe(true);
      expect(labels.some((l) => l.includes("Haftungsanteile"))).toBe(true);
      expect(labels.some((l) => l.includes("Bedarfsberechnung Kind"))).toBe(true);
      expect(labels.some((l) => l.includes("Kindergeld"))).toBe(true);
      expect(labels.some((l) => l.includes("Endabrechnung"))).toBe(true);

      // Check log formatting
      for (const log of result.auditTrail) {
        expect(log.stepNumber).toBeGreaterThan(0);
        expect(log.formula).toBeTruthy();
        expect(log.description).toBeTruthy();
        expect(log.value !== undefined).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE: OLG Dresden, Beschluss vom 29.10.2015 – 20 UF 851/15
  // Exact validation against the court's official judgment figures
  // ---------------------------------------------------------------------------
  describe("OLG Dresden, Beschluss v. 29.10.2015 – 20 UF 851/15", () => {
    // Shared parameters from the judgment
    const customConfig2013: typeof DEFAULT_LEGAL_CONFIG_2026 = {
      ...DEFAULT_LEGAL_CONFIG_2026,
      year: 2013,
      kindergeldPerChild: 184, // 184 € in 2012-2015 (half = 92 €)
      retentionRates: {
        necessaryEmployed: 1000,
        necessaryUnemployed: 800,
        adequate: 1200, // 1.200 € Selbstbehalt applied by OLG Dresden in 2013
      },
      table: [
        {
          tierIndex: 1,
          minIncome: 0,
          maxIncome: 10000,
          rates: {
            "0-5": 317,
            "6-11": 462,
            "12-17": 556,
            "18+": 600,
          },
          percentage: 100,
        },
      ],
    };

    const customConfig2015: typeof DEFAULT_LEGAL_CONFIG_2026 = {
      ...DEFAULT_LEGAL_CONFIG_2026,
      year: 2015,
      kindergeldPerChild: 184, // 184 € (half = 92 €)
      retentionRates: {
        necessaryEmployed: 1080,
        necessaryUnemployed: 880,
        adequate: 1300, // 1.300 € Selbstbehalt applied in 2015
      },
      table: [
        {
          tierIndex: 1,
          minIncome: 0,
          maxIncome: 10000,
          rates: {
            "0-5": 328,
            "6-11": 433,
            "12-17": 522,
            "18+": 610,
          },
          percentage: 100,
        },
      ],
    };

    it("reproduces exact 2013 (Sept-Dec) verdict for Child J (145.90 €)", () => {
      // Data from OLG Dresden page 15 (cc):
      // Father adjusted net: 2.928,90 € -> liability income H_V = 2.928,90 - 1.200 = 1.728,90 €
      // Mother adjusted net: 1.407,07 € -> liability income H_M = 1.407,07 - 1.200 = 207,07 €
      // Total need: 745,24 € (Regel 556 + Wohnen 39,24 + Fahrt 150)
      // Direct payments: Father paid 150 € (Fahrt), Mother paid 40 € (Essen)
      // Mother receives Kindergeld (184 €)
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            netMonthly: 2928.9,
            grossMonthly: 3564.14,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 150, // Fahrtkosten 150 €
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            netMonthly: 1407.07,
            grossMonthly: 1800,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true, // Mother receives KG from Familienkasse
          directExpensesCovered: 40, // Essensgeld 40 €
        },
        children: [
          {
            id: "child-j",
            name: "J. H.",
            ageGroup: "12-17",
            additionalNeeds: {
              wechselmodellSurcharge: 39.24, // Wohnmehrbedarf
              specialNeeds: 150, // Fahrtkosten
            },
          },
        ],
        config: customConfig2013,
      };

      const result = calculateWechselmodell(input);

      // Liability incomes
      expect(result.parentA.liabilityIncome).toBe(1728.9);
      expect(result.parentB.liabilityIncome).toBe(207.07);

      // Child need
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(745.24); // 556 + 189.24

      // Primary shares (court text: 665.52 €; exact mathematically rounded: 665.53 €)
      expect(childRes.shareParentA).toBeCloseTo(665.52, 1);
      expect(childRes.shareParentB).toBeCloseTo(79.71, 1);

      // Primary obligation before KG & direct costs:
      // U_prim,V = 665.53 - 0.5 * 745.24 = 292.91 € (court: 292.90 €)
      expect(result.parentA.primaryObligation).toBeCloseTo(292.9, 1);

      // Quota-based direct expense sharing (BGH XII ZB 565/15):
      // Q_A = 89.30%, Q_B = 10.70%
      // Father owes Mother: + 89.30% * 40 € = +35.72 €
      // Mother owes Father: + 10.70% * 150 € = +16.05 € (credit for Father: -16.05 €)
      // Net direct expense for Father: +35.72 - 16.05 = +19.68 €
      expect(result.parentA.directExpensesDeduction).toBeCloseTo(19.68, 2);
      expect(result.parentB.directExpensesDeduction).toBeCloseTo(-19.68, 2);

      // Kindergeld adjustment: Mother owes Father 92 € (half KG)
      expect(result.parentA.kindergeldAdjustment).toBe(-92.0);
      expect(result.parentB.kindergeldAdjustment).toBe(92.0);

      // Net settlement: 292.90 + 19.68 - 92.00 = 220.58 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(220.58, 1);
      expect(result.parentA.netPayment).toBeCloseTo(220.58, 1);
    });

    it("reproduces exact 2015 (Jan-Jun) verdict for Child J (166.22 €)", () => {
      // Data from OLG Dresden page 21:
      // Father adjusted net: 2.871,90 € -> H_V = 2.871,90 - 1.300 = 1.571,90 €
      // Mother adjusted net: 1.407,07 € -> H_M = 1.407,07 - 1.300 = 107,07 €
      // Total need: 718,04 € (Regel 522 + Wohnen 46,04 + Fahrt 150)
      // Direct expenses: Father 150 € (Fahrt), Mother 40 € (Essen)
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            netMonthly: 2871.9,
            grossMonthly: 3564.14,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 150,
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            netMonthly: 1407.07,
            grossMonthly: 1800,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 40,
        },
        children: [
          {
            id: "child-j",
            name: "J. H.",
            ageGroup: "12-17",
            additionalNeeds: {
              wechselmodellSurcharge: 46.04,
              specialNeeds: 150,
            },
          },
        ],
        config: customConfig2015,
      };

      const result = calculateWechselmodell(input);

      // Liability incomes
      expect(result.parentA.liabilityIncome).toBe(1571.9);
      expect(result.parentB.liabilityIncome).toBe(107.07);

      // Child need: 522 + 196.04 = 718.04 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(718.04);
      expect(childRes.shareParentA).toBeCloseTo(672.24, 1);
      expect(childRes.shareParentB).toBeCloseTo(45.79, 1);

      // Net settlement:
      // U_prim,V = 672.24 - 359.02 = 313.22 €
      // Quota direct expenses: + 93.62% * 40 - 6.38% * 150 = +27.88 €
      // Kindergeld: -92.00 €
      // Total: 313.22 + 27.88 - 92.00 = 249.10 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(249.1, 1);
      expect(result.parentA.netPayment).toBeCloseTo(249.1, 1);
    });

    it("reproduces 2015 (Jan-Jun) result for Child L with BGH quota sharing (261.55 €)", () => {
      // Data from OLG Dresden page 21-22:
      // Father adjusted net: 2.871,90 € -> H_V = 1.571,90 €
      // Mother adjusted net: 1.407,07 € -> H_M = 107,07 €
      // Total need: 662,18 € (Regel 433 + Wohnen 39,18 + Fahrt 150 + Hort 40)
      // Direct expenses: Father 160 € (Fahrt 150 + Tanz 10), Mother 80 € (Hort 40 + Essen 40)
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            netMonthly: 2871.9,
            grossMonthly: 3564.14,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 160, // Fahrt 150 + Tanz 10
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            netMonthly: 1407.07,
            grossMonthly: 1800,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 80, // Hort 40 + Essen 40
        },
        children: [
          {
            id: "child-l",
            name: "L. H.",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 39.18,
              specialNeeds: 190, // Fahrt 150 + Hort 40
            },
          },
        ],
        config: customConfig2015,
      };

      const result = calculateWechselmodell(input);

      // Child need: 433 + 229.18 = 662.18 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(662.18);
      expect(childRes.shareParentA).toBeCloseTo(619.95, 1);
      expect(childRes.shareParentB).toBeCloseTo(42.22, 1);

      // Final payment:
      // U_prim,V = 619.95 - 331.09 = 288.86 €
      // Quota direct expenses: + 93.62% * 80 - 6.38% * 160 = +64.69 €
      // Kindergeld: -92.00 €
      // Total: 288.86 + 64.69 - 92.00 = 261.55 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(261.55, 1);
      expect(result.parentA.netPayment).toBeCloseTo(261.55, 1);
    });

    it("calculates combined total for both children in 2015 with BGH quota sharing (510.65 €)", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            netMonthly: 2871.9,
            grossMonthly: 3564.14,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 310, // J: 150 + L: 160 = 310 €
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            netMonthly: 1407.07,
            grossMonthly: 1800,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true, // Mother receives KG for both children (2 * 184 = 368 €)
          directExpensesCovered: 120, // J: 40 + L: 80 = 120 €
        },
        children: [
          {
            id: "child-j",
            name: "J. H.",
            ageGroup: "12-17",
            additionalNeeds: {
              wechselmodellSurcharge: 46.04,
              specialNeeds: 150,
            },
          },
          {
            id: "child-l",
            name: "L. H.",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 39.18,
              specialNeeds: 190,
            },
          },
        ],
        config: customConfig2015,
      };

      const result = calculateWechselmodell(input);

      // Total sum for both children: 249.10 + 261.55 = 510.65 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(510.65, 1);
      expect(result.parentA.netPayment).toBeCloseTo(510.65, 1);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE: Deterministic Wohnmehrbedarf Method (OLG Dresden 20 UF 851/15)
  // ---------------------------------------------------------------------------
  describe("Wohnmehrbedarf Calculation Formula (OLG Dresden 20 UF 851/15 Rn. 21.5.2)", () => {
    it("calculates 2012 Child J Wohnmehrbedarf (38.60 €) exactly as in judgment", () => {
      // OLG Dresden page 9:
      // Tabellenbedarf combined: 554 € -> 20% = 110.80 €
      // Father alone: 466 € -> 20% * 0.90 = 83.88 €
      // Mother alone: 364 € -> 20% * 0.90 = 65.52 €
      // Mehrbedarf: 149.40 € - 110.80 € = 38.60 €
      const mehrbedarf = calculateOlgDresdenWohnmehrbedarf(554, 466, 364);
      expect(mehrbedarf).toBe(38.6);
    });

    it("calculates 2013 Child J Wohnmehrbedarf (39.24 €) exactly as in judgment", () => {
      // OLG Dresden page 9:
      // Tabellenbedarf combined: 648 € -> 20% = 129.60 €
      // Father alone: 512 € -> 20% * 0.90 = 92.16 €
      // Mother alone: 426 € -> 20% * 0.90 = 76.68 €
      // Mehrbedarf: 168.84 € - 129.60 € = 39.24 €
      const mehrbedarf = calculateOlgDresdenWohnmehrbedarf(648, 512, 426);
      expect(mehrbedarf).toBe(39.24);
    });

    it("calculates 2012 Child L Wohnmehrbedarf (35.74 €) from components (73.08 + 57.06 - 94.40)", () => {
      // OLG Dresden page 10:
      // Tabellenbedarf combined: 472 € -> 20% = 94.40 €
      // Father alone: 406 € -> 20% * 0.90 = 73.08 €
      // Mother alone: 317 € -> 20% * 0.90 = 57.06 €
      // Note: The court text wrote "33,74 € (73,08 € + 57,06 € - 94,40 €)" with a slight manual typo in the subtraction;
      // the exact mathematical result of (73.08 + 57.06 - 94.40) is exactly 35.74 €:
      const mehrbedarf = calculateOlgDresdenWohnmehrbedarf(472, 406, 317);
      expect(mehrbedarf).toBe(35.74);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE: Betreuungsunterhalt § 1615l BGB im Wechselmodell (BGH NJW 2026 S. 8)
  // ---------------------------------------------------------------------------
  describe("Betreuungsunterhalt § 1615l BGB im 50:50-Wechselmodell (BGH NJW 2026 S. 8)", () => {
    it("applies 50% employment obligation and preliminary child support deduction (Vorwegabzug)", () => {
      // Unmarried parents practicing 50:50 Wechselmodell for a 1-year-old child:
      // Mother prior full-time net: 3.000 €; now works 50% (earns 1.500 € net -> loss = 1.500 €)
      // Father full-time net: 4.500 €; now works 50% (earns 2.250 € net -> loss = 2.250 €)
      // Child support obligation of Father: 450 € (Vorwegabzug)
      // Available net Father after child support: 2.250 - 450 = 1.800 €
      // Self retention: 1.450 € -> margin = 350 €
      const res = calculateBetreuungsunterhalt1615l({
        parentA: {
          name: "Kindesvater",
          fullTimeNetIncome: 4500,
          actualPartTimeNetIncome: 2250,
          childSupportObligation: 450,
          selfRetention: 1450,
        },
        parentB: {
          name: "Kindesmutter",
          fullTimeNetIncome: 3000,
          actualPartTimeNetIncome: 1500,
          childSupportObligation: 0,
          selfRetention: 1450,
        },
        childAgeYears: 1.5,
      });

      expect(res.isEligibleFor1615l).toBe(true);
      expect(res.employmentObligationPercentage).toBe(50);
      expect(res.uncoveredLossParentA).toBe(2250);
      expect(res.uncoveredLossParentB).toBe(1500);
      expect(res.availableIncomeAAfterChildSupport).toBe(1800);
    });

    it("correctly concludes no § 1615l claim once the child reaches 3 years", () => {
      const res = calculateBetreuungsunterhalt1615l({
        parentA: {
          name: "Kindesvater",
          fullTimeNetIncome: 4000,
          actualPartTimeNetIncome: 2000,
          childSupportObligation: 400,
          selfRetention: 1450,
        },
        parentB: {
          name: "Kindesmutter",
          fullTimeNetIncome: 3000,
          actualPartTimeNetIncome: 1500,
          childSupportObligation: 0,
          selfRetention: 1450,
        },
        childAgeYears: 4, // Child is 4 years old (exceeds § 1615l basic 3-year threshold)
      });

      expect(res.isEligibleFor1615l).toBe(false);
      expect(res.employmentObligationPercentage).toBe(100);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE: BGH, Beschluss vom 11.01.2017 – XII ZB 565/15 (BGHZ 213, 254)
  // Leading decision on symmetrical 50:50 Wechselmodell calculation methodology
  // ---------------------------------------------------------------------------
  describe("BGH, Beschluss v. 11.01.2017 – XII ZB 565/15 (BGHZ 213, 254)", () => {
    it("implements core BGH tenets: combined income tier, adequate SB quota, and 50% KG clearing", () => {
      // BGH Rn. 18 (Bedarf aus beiderseitigem Einkommen), Rn. 29 (Quotelung über SB_ang), Rn. 32 (hälftiger Kindergeldausgleich)
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            grossAnnual: 60000,
            netAnnual: 42000, // 3.500 € net / month
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true }, // max 150 €
            privatePensionAnnual: 2400, // 200 € / month (<= 4% gross)
            housingAdvantageAnnual: 0,
            allowableDebtsAnnual: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 200, // Father pays 200 € directly for child (Fahrt/Sport)
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            grossAnnual: 30000,
            netAnnual: 24000, // 2.000 € net / month
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true }, // 100 €
            privatePensionAnnual: 0,
            housingAdvantageAnnual: 0,
            allowableDebtsAnnual: 0,
          },
          receivesKindergeld: true, // Mother receives Kindergeld (250 €)
          directExpensesCovered: 60, // Mother pays 60 € directly (Hort/Essen)
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 100, // Concrete Mehrbedarf (BGH Rn. 25)
              specialNeeds: 0,
            },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      };

      const result = calculateWechselmodell(input);

      // Father adjusted net: 3.500 - 150 - 200 = 3.150 €
      // Mother adjusted net: 2.000 - 100 = 1.900 €
      expect(result.parentA.adjustedNet).toBe(3150);
      expect(result.parentB.adjustedNet).toBe(1900);

      // Combined net: 3.150 + 1.900 = 5.050 € -> Tier 9 (4.901 - 5.300 €)
      expect(result.combinedAdjustedNet).toBe(5050);
      expect(result.appliedDtTier.tierIndex).toBe(9);

      // Quotas based on SB_ang (1.750 €):
      // H_A = 3.150 - 1.750 = 1.400 €
      // H_B = 1.900 - 1.750 = 150 €
      // Total H = 1.550 € -> Q_A = 1400/1550 = 90.32%, Q_B = 150/1550 = 9.68%
      expect(result.parentA.liabilityIncome).toBe(1400);
      expect(result.parentB.liabilityIncome).toBe(150);
      expect(result.parentA.liabilityShare).toBeCloseTo(0.9032, 3);
      expect(result.parentB.liabilityShare).toBeCloseTo(0.0968, 3);

      // Tabellenbedarf for 6-11 in Tier 9 is 849 € + 100 € Mehrbedarf = 949 €
      const child = result.childrenResults[0];
      expect(child.tabellenUnterhalt).toBe(849);
      expect(child.totalNeed).toBe(949);

      // Father share: 949 * (1400/1550) = 857.16 €
      // Primary obligation before KG: 857.16 - 474.50 (50% in-kind) = 382.66 €
      expect(result.parentA.primaryObligation).toBe(382.66);

      // Quota direct expense sharing (BGH XII ZB 565/15):
      // Q_A = 90.32%, Q_B = 9.68%
      // Father owes Mother: + 90.32% * 60 = +54.19 €
      // Mother owes Father: + 9.68% * 200 = +19.35 € (credit for Father: -19.35 €)
      // Net direct expense for Father: +54.19 - 19.35 = +34.84 €
      expect(result.parentA.directExpensesDeduction).toBeCloseTo(34.84, 2);
      expect(result.parentB.directExpensesDeduction).toBeCloseTo(-34.84, 2);

      // Kindergeld adjustment: Mother owes Father 125 €
      expect(result.parentA.kindergeldAdjustment).toBe(-125);
      expect(result.parentB.kindergeldAdjustment).toBe(125);

      // Final payment Z_A = 382.66 + 34.84 - 125.00 = 292.50 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(292.5, 1);
      expect(result.parentA.netPayment).toBeCloseTo(292.5, 1);
    });

    it("calculates exact quota-based direct expense reimbursement for user scenario (Q_A=83.33%, D_B=285€)", () => {
      // User scenario:
      // Total need: 2.054.00 € (e.g. 2 children)
      // Quotas: Q_A = 83.33% (5/6), Q_B = 16.67% (1/6)
      // Parent B pays D_B = 285.00 € directly in cash
      // Parent A pays D_A = 0.00 €
      // Kindergeld: 250 € (half = 125 €) or 500 € (half = 250 €)
      // Liability share A: 2.054 * (5/6) = 1.711.67 €
      // 50% Natural care A: 2.054 * 0.5 = 1.027.00 €
      // Primary bar obligation: 1.711.67 - 1.027.00 = 684.67 €
      // Quota direct expense: Q_A * D_B = 83.333% * 285.00 € = 237.50 €
      // Kindergeld adjustment: -125.00 € (for 1 child)
      // Net payment Z_A = 684.67 + 237.50 - 125.00 = 797.17 €
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            netMonthly: 4250, // 4.250 - 1.750 = 2.500 € H_A
            grossMonthly: 6000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Elternteil B",
          income: {
            netMonthly: 2250, // 2.250 - 1.750 = 500 € H_B (Total H = 3.000 € -> Q_A = 2500/3000 = 83.33%)
            grossMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true, // B receives Kindergeld
          directExpensesCovered: 285, // B pays 285 € directly (Hort/Essen/Anschaffung)
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "12-17",
            additionalNeeds: { wechselmodellSurcharge: 904, specialNeeds: 0 }, // Total need = 1150 (DT Gruppe 12) + 904 = 2054 €
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      };

      const result = calculateWechselmodell(input);

      expect(result.parentA.liabilityShare).toBeCloseTo(0.8333, 3);
      expect(result.parentB.liabilityShare).toBeCloseTo(0.1667, 3);

      const child = result.childrenResults[0];
      expect(child.totalNeed).toBe(2054);
      expect(child.shareParentA).toBeCloseTo(1711.67, 1);

      // Bar obligation after deducting 50% natural care (1.027 €):
      expect(result.parentA.primaryObligation).toBeCloseTo(684.67, 1);

      // Quota direct expense: A takes over exactly 83.33% of 285 € = 237.50 € (not 142.50 €!)
      expect(result.parentA.directExpensesDeduction).toBeCloseTo(237.5, 1);
      expect(result.parentB.directExpensesDeduction).toBeCloseTo(-237.5, 1);

      // Kindergeld: B owes half KG (125 €) to A
      expect(result.parentA.kindergeldAdjustment).toBe(-125);

      // Final payment: 684.67 + 237.50 - 125.00 = 797.17 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(797.17, 1);
      expect(result.parentA.netPayment).toBeCloseTo(797.17, 1);
    });

    it("verifies that no full bar support exemption occurs for either parent (§ 1606 Abs. 3 S. 2 BGB, BGH Rn. 13)", () => {
      // Both parents earn equal income (3.000 € net each)
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            netMonthly: 3000,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Elternteil B",
          income: {
            netMonthly: 3000,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "0-5",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);

      // Both parents have a 50% liability quota; neither is exempted
      expect(result.parentA.liabilityShare).toBe(0.5);
      expect(result.parentB.liabilityShare).toBe(0.5);
      // Equalized settlement transfers 129.50 € (half of 259 € 2026 default KG) from A to B
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(129.5);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE: Real Housing Cost Mehrbedarf (BGH XII ZB 565/15 Rn. 25 & Kopfzahl)
  // ---------------------------------------------------------------------------
  describe("Real Housing Cost Mehrbedarf (BGH XII ZB 565/15 Rn. 25 & Pro-Kopf-Methode)", () => {
    it("calculates per-child real housing Mehrbedarf comparing Warmmiete to 20% table portion", () => {
      // Parent A: Warmmiete = 1.200 €, Household = 2 persons -> child share = 600 €
      // Parent B: Warmmiete = 900 €, Household = 2 persons -> child share = 450 €
      // Total actual housing cost for child across both households = 600 + 450 = 1.050 €
      // Combined net = 3.150 + 1.900 = 5.050 € -> DT 2026 Tier 9
      // Child (Age 6-11) basic Tabellenunterhalt = 849 €
      // 20% table housing portion = 0.20 * 849 € = 169.80 €
      // Calculated real Wohnmehrbedarf = 1.050 € - 169.80 € = 880.20 €
      // Total child need = 849 + 880.20 = 1.729.20 €
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            netMonthly: 3150,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          housingCosts: {
            warmRentMonthly: 1200,
            householdPersons: 2,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            netMonthly: 1900,
            grossMonthly: 2800,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          housingCosts: {
            warmRentMonthly: 900,
            householdPersons: 2,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 0, // Manual extra is 0 -> computed from housing
              specialNeeds: 0,
            },
          },
        ],
      };

      const result = calculateWechselmodell(input);
      const child = result.childrenResults[0];

      expect(child.housingNeedCalculated).toBe(1050);
      expect(child.housingPortionInTable).toBe(169.8);
      expect(child.calculatedWohnmehrbedarf).toBe(880.2);
      expect(child.totalNeed).toBe(1729.2);

      // Verify that audit log records real housing step
      const housingLog = result.auditTrail.find((l) =>
        l.label.includes("Realkosten-Wohnmehrbedarf")
      );
      expect(housingLog).toBeDefined();
      expect(housingLog?.value).toBe(880.2);
    });

    it("correctly divides rent per capita when multiple children live in the household", () => {
      // 2 children living in household:
      // Parent A: Warmmiete = 1.500 €, Household = 3 persons (Parent A + 2 children) -> 500 € / child
      // Parent B: Warmmiete = 1.200 €, Household = 3 persons (Parent B + 2 children) -> 400 € / child
      // Total housing cost per child = 500 + 400 = 900 €
      // Child 1 (6-11, Tabellenbedarf 849 €): 900 - 169.80 (20%) = 730.20 € Wohnmehrbedarf
      // Child 2 (12-17, Tabellenbedarf 993 €): 900 - 198.60 (20%) = 701.40 € Wohnmehrbedarf
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            netMonthly: 3150,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          housingCosts: {
            warmRentMonthly: 1500,
            householdPersons: 3,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            netMonthly: 1900,
            grossMonthly: 2800,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          housingCosts: {
            warmRentMonthly: 1200,
            householdPersons: 3,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
          {
            id: "c2",
            name: "Kind 2",
            ageGroup: "12-17",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);
      const child1 = result.childrenResults[0];
      const child2 = result.childrenResults[1];

      expect(child1.housingNeedCalculated).toBe(900);
      expect(child1.housingPortionInTable).toBe(169.8);
      expect(child1.calculatedWohnmehrbedarf).toBe(730.2);
      expect(child1.totalNeed).toBe(1579.2);

      expect(child2.housingNeedCalculated).toBe(900);
      expect(child2.housingPortionInTable).toBe(198.6);
      expect(child2.calculatedWohnmehrbedarf).toBe(701.4);
      expect(child2.totalNeed).toBe(1694.4);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE: BGH, Beschluss v. 20.04.2016 – XII ZB 45/15 (Kindergeldausgleich) & Configurable Kindergeld
  // ---------------------------------------------------------------------------
  describe("BGH, Beschluss v. 20.04.2016 – XII ZB 45/15 (FamRZ 2016, 1053)", () => {
    it("verifies exact internal half-crediting of default 2026 Kindergeld (259 € -> 129.50 €)", () => {
      // Both parents have identical incomes (3.000 € net each)
      // Parent A receives 100% Kindergeld (default 2026: 259 €) from the state
      // Settlement must transfer exactly 129.50 € (50% KG) from Parent A to Parent B
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            netMonthly: 3000,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Elternteil B",
          income: {
            netMonthly: 3000,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);
      expect(result.parentA.kindergeldAdjustment).toBe(129.5);
      expect(result.parentB.kindergeldAdjustment).toBe(-129.5);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(129.5);
      expect(result.parentA.netPayment).toBe(129.5);
      expect(result.parentB.netPayment).toBe(-129.5);
    });

    it("verifies configurable Kindergeld for 2024 (250 €), 2025 (255 €) and custom amounts", () => {
      const baseInput: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            netMonthly: 3000,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Elternteil B",
          income: {
            netMonthly: 3000,
            grossMonthly: 4500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      // 1. 2024 Kindergeld (250 € -> 125.00 € half)
      const res2024 = calculateWechselmodell({
        ...baseInput,
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      });
      expect(res2024.parentA.kindergeldAdjustment).toBe(125);
      expect(res2024.settlement.amount).toBe(125);

      // 2. 2025 Kindergeld (255 € -> 127.50 € half)
      const res2025 = calculateWechselmodell({
        ...baseInput,
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 255,
        },
      });
      expect(res2025.parentA.kindergeldAdjustment).toBe(127.5);
      expect(res2025.settlement.amount).toBe(127.5);

      // 3. Custom amount (e.g. 300 € -> 150.00 € half)
      const resCustom = calculateWechselmodell({
        ...baseInput,
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 300,
        },
      });
      expect(resCustom.parentA.kindergeldAdjustment).toBe(150);
      expect(resCustom.settlement.amount).toBe(150);

      // 4. Multi-child with 2026 Kindergeld (2 children * 259 € = 518 € -> 259.00 € half)
      const res2Children = calculateWechselmodell({
        ...baseInput,
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
          {
            id: "c2",
            name: "Kind 2",
            ageGroup: "12-17",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 259,
        },
      });
      expect(res2Children.parentA.kindergeldAdjustment).toBe(259);
      expect(res2Children.settlement.amount).toBe(259);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE: BGH, Urteil v. 05.03.2003 – XII ZR 149/01 (4% Altersvorsorge)
  // ---------------------------------------------------------------------------
  describe("BGH, Urteil v. 05.03.2003 – XII ZR 149/01 (BGHZ 154, 247)", () => {
    it("strictly caps private retirement pension deduction at 4% of gross income", () => {
      // Gross = 5.000 € -> 4% cap = 200 € / month
      // If user requests 350 € private pension, only 200 € may be deducted
      const income = {
        grossMonthly: 5000,
        netMonthly: 3200,
        isEmployed: true,
        occupationalExpenses: { useFlatRate: false, customAmount: 0 },
        privatePensionMonthly: 350,
      };

      const breakdown = calculateAdjustedNetIncome(income, DEFAULT_LEGAL_CONFIG_2026);
      expect(breakdown.cappedPension).toBe(200);
      expect(breakdown.adjustedNet).toBe(3000); // 3200 - 200 = 3000 €
    });
  });
});
