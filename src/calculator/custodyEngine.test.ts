import { describe, expect, it } from "vitest";
import { DEFAULT_LEGAL_CONFIG_2026 } from "../config/dtTable2026";
import type { CalculationInput } from "../types/input";
import { calculateBetreuungsunterhalt1615l } from "./betreuungsunterhaltEngine";
import {
  calculateIsolatedKindergeldClaim,
  calculateWechselmodell,
  SUBSIDIARITY_NOTICE_TEXT,
} from "./custodyEngine";
import { calculateAdjustedNetIncome, calculateOlgDresdenWohnmehrbedarf } from "./incomeEngine";
import { round2 } from "./rounding";

describe("Wechselmodell Kindesunterhaltsrechner (Rechenkern)", () => {
  describe("Einkommensbereinigung (Bereinigtes Nettoeinkommen)", () => {
    it("berechnet berufsbedingte Aufwendungen mit 5%-Pauschale korrekt (min. 50 €, max. 150 €)", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;

      // Unter Untergrenze: 5 % von 800 € sind 40 € -> gedeckelt auf Mindestbetrag 50 €
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

      // Im Korridor: 5 % von 2.000 € sind 100 € -> genau 100 €
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

      // Über Obergrenze: 5 % von 4.000 € sind 200 € -> gedeckelt auf Höchstbetrag 150 €
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

    it("wendet keine Berufspauschale bei Erwerbslosigkeit an", () => {
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

    it("deckelt zusätzliche Altersvorsorge strikt bei 4 % des Bruttoeinkommens (BGH XII ZR 149/01)", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      // 4 % von 5.000 € Brutto sind 200 €. Gewünschte Vorsorge ist 300 € -> gedeckelt auf 200 €.
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

    it("addiert Wohnvorteil und zieht berücksichtigungsfähige Schulden ab", () => {
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

    it("rechnet Jahreseinkommen mit Boni und Steuerrückerstattung in Monatsäquivalente um", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      // Jahresbrutto: 60.000 € (5.000 € / Mo.)
      // Reguläres Jahresnetto: 36.000 € (3.000 € / Mo.)
      // Jahresbonus netto: 6.000 € (500 € / Mo.) -> Gesamt-Jahresnetto = 42.000 € -> 3.500 € / Mo.
      // Jahres-Altersvorsorge: 2.400 € (200 € / Mo.) -> gedeckelt auf 4 % von 5.000 = 200 €
      // Pauschale: 5 % von 3.500 = 175 € -> gedeckelt auf 150 €
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
      expect(res.occupationalExpenses).toBe(150); // Gedeckelt auf max. 150 €
      expect(res.cappedPension).toBe(200); // Gedeckelt auf 4 % von 5.000 €
      expect(res.adjustedNet).toBe(3150); // 3500 - 150 - 200
      expect(res.adjustedAnnualNet).toBe(37800); // 3150 * 12
    });

    it("Testfall 1 (Einkommensbereinigung Elternteil): zieht PKV-Eigenanteil (Basis minus AG-Zuschuss) nach § 10 Abs. 1 Nr. 3 EStG & Ziff. 10.4 OLG-Leitlinien ab", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      // Netto: 4.000 €, PKV-Basis: 700 €, AG-Zuschuss: 350 €, Werbungskosten (Pauschale): 150 €
      // -> Bereinigtes Netto = 4.000 - 150 - (700 - 350) = 3.500 €
      const res = calculateAdjustedNetIncome(
        {
          grossMonthly: 6000,
          netMonthly: 4000,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: true },
          istPrivatVersichert: true,
          pkvBeitragBasis: 700,
          pkvArbeitgeberzuschuss: 350,
          privatePensionMonthly: 0,
          allowableDebtsMonthly: 0,
          housingAdvantageMonthly: 0,
          otherDeductionsMonthly: 0,
        },
        config
      );

      expect(res.occupationalExpenses).toBe(150);
      expect(res.pkvEigenanteil).toBe(350); // 700 - 350
      expect(res.deductionsTotal).toBe(500); // 150 + 350
      expect(res.adjustedNet).toBe(3500); // 4000 - 500
    });

    it("berücksichtigt PKV-Eigenanteil auch bei Jahreswerten deterministisch", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      // Jahresnetto: 48.000 € (4.000 € / Mo.)
      // Jährliche PKV-Basis: 8.400 € (700 € / Mo.)
      // Jährlicher AG-Zuschuss: 4.200 € (350 € / Mo.)
      // Werbungskosten: 1.800 € / Jahr (150 € / Mo.)
      const res = calculateAdjustedNetIncome(
        {
          grossAnnual: 72000,
          netAnnual: 48000,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: false, customAnnualAmount: 1800 },
          istPrivatVersichert: true,
          pkvBeitragBasisAnnual: 8400,
          pkvArbeitgeberzuschussAnnual: 4200,
          privatePensionAnnual: 0,
          allowableDebtsAnnual: 0,
        },
        config
      );

      expect(res.occupationalExpenses).toBe(150);
      expect(res.pkvEigenanteil).toBe(350);
      expect(res.deductionsTotal).toBe(500);
      expect(res.adjustedNet).toBe(3500);
      expect(res.adjustedAnnualNet).toBe(42000);
    });

    it("deckelt PKV-Eigenanteil auf mindestens 0 €, wenn Zuschuss den Basisbeitrag übersteigt", () => {
      const config = DEFAULT_LEGAL_CONFIG_2026;
      const res = calculateAdjustedNetIncome(
        {
          grossMonthly: 4000,
          netMonthly: 3000,
          isEmployed: true,
          occupationalExpenses: { useFlatRate: false, customAmount: 100 },
          istPrivatVersichert: true,
          pkvBeitragBasis: 200,
          pkvArbeitgeberzuschuss: 250, // Zuschuss höher als Basisbeitrag
          privatePensionMonthly: 0,
          allowableDebtsMonthly: 0,
        },
        config
      );

      expect(res.pkvEigenanteil).toBe(0);
      expect(res.deductionsTotal).toBe(100);
      expect(res.adjustedNet).toBe(2900);
    });
  });

  describe("Wechselmodell-Berechnungsszenarien (7-Stufen-Algorithmus)", () => {
    // -------------------------------------------------------------------------
    // TEST 1: Symmetrischer Fall (Gleiche Einkommen)
    // N_A = N_B = 3000 € -> Q_A = 0.5, Q_B = 0.5. Bei gleichen Ausgaben und KG an A zahlt A halbes KG an B.
    // -------------------------------------------------------------------------
    it("Szenario 1 (Symmetrischer Fall): Gleiche Einkommen führen zu 50:50-Quote und 50%-Kindergeldtransfer (25% Betreuung + 25% Baranteil)", () => {
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

      // Gleiche bereinigte Nettoeinkommen
      expect(result.parentA.adjustedNet).toBe(3000);
      expect(result.parentB.adjustedNet).toBe(3000);

      // Haftungsquoten exakt 50:50
      expect(result.parentA.liabilityShare).toBe(0.5);
      expect(result.parentB.liabilityShare).toBe(0.5);

      // Kombiniertes Nettoeinkommen: 6.000 € (Stufe 11: 5.701 - 6.400 €)
      expect(result.combinedAdjustedNet).toBe(6000);
      expect(result.appliedDtTier.tierIndex).toBe(11);

      // Primäre Barunterhaltsspitze ist bei gleichen Einkommen 0 €
      expect(result.parentA.primaryObligation).toBe(0);
      expect(result.parentB.primaryObligation).toBe(0);

      // Kindergeld beträgt 250 €. Nach BGH XII ZB 45/15: 25 % Betreuung (62,50 €) + Q_B * 50 % Baranteil (50 % * 125 € = 62,50 €) = 125 €.
      // Da Elternteil A es bezieht, leitet A 125 € an B weiter.
      expect(result.parentA.kindergeldAdjustment).toBe(125);
      expect(result.parentB.kindergeldAdjustment).toBe(-125);

      // Endabrechnung: Elternteil A zahlt 125 € an Elternteil B
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(125);
      expect(result.parentA.netPayment).toBe(125);
      expect(result.parentB.netPayment).toBe(-125);
    });

    // -------------------------------------------------------------------------
    // TEST 2: Asymmetrische Einkommen (BGH-Referenz)
    // Elternteil A: Netto 4.000 € (Bereinigt 3.800 €), bezieht Kindergeld.
    // Elternteil B: Netto 2.200 € (Bereinigt 2.050 €), bezieht kein Kindergeld.
    // 1 Kind (6-11 Jahre).
    // Ermittlung von Quoten, DT-Gruppe aus 5.850 € kombiniertem Einkommen und Ausgleichszahlung von A an B.
    // -------------------------------------------------------------------------
    it("Szenario 2 (Asymmetrische Einkommen - BGH-Referenz): Berechnet Quoten, DT-Einstufung und Zahlbetrag korrekt", () => {
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

      // Bereinigte Nettoeinkommen prüfen
      expect(result.parentA.adjustedNet).toBe(3800);
      expect(result.parentB.adjustedNet).toBe(2050);

      // Kombiniertes Nettoeinkommen = 5.850 € -> Stufe 11 (5.701 - 6.400 €)
      expect(result.combinedAdjustedNet).toBe(5850);
      expect(result.appliedDtTier.tierIndex).toBe(11);

      // Haftungseinkommen (SB_ang = 1.750 €):
      // H_A = 3.800 - 1.750 = 2.050 €
      // H_B = 2.050 - 1.750 = 300 €
      // Gesamt-H = 2.350 €
      expect(result.parentA.liabilityIncome).toBe(2050);
      expect(result.parentB.liabilityIncome).toBe(300);

      // Haftungsquoten:
      // Q_A = 2050 / 2350 = 0.87234... -> 0.8723 (87.23%)
      // Q_B = 300 / 2350 = 0.12765... -> 0.1277 (12.77%)
      expect(result.parentA.liabilityShare).toBeCloseTo(0.8723, 3);
      expect(result.parentB.liabilityShare).toBeCloseTo(0.1277, 3);

      // Kindesbedarf für Altersstufe 6-11 in Stufe 11: 938 €
      const childRes = result.childrenResults[0];
      expect(childRes.tabellenUnterhalt).toBe(938);
      expect(childRes.totalNeed).toBe(938);

      // Anteil der Eltern am Gesamtbedarf:
      // shareA = 938 * (2050/2350) = 818.26 €
      // shareB = 938 * (300/2350) = 119.74 €
      expect(childRes.shareParentA).toBe(818.26);
      expect(childRes.shareParentB).toBe(119.74);

      // Primäre Barunterhaltsspitze vor KG (relativ zu 50% Naturalunterhalt = 469 €):
      // U_prim,A = 818.26 - 469.00 = 349.26 €
      // U_prim,B = 119.74 - 469.00 = -349.26 €
      expect(result.parentA.primaryObligation).toBe(349.26);
      expect(result.parentB.primaryObligation).toBe(-349.26);

      // Kindergeld: 250 € -> 25% Betreuungsanteil = 62.50 €, 50% Baranteil = 125.00 €
      // Gemäß BGH XII ZB 45/15:
      // Elternteil A leitet 25% Betreuungsanteil (62.50 €) + B's Baranteils-Entlastung (Q_B * 125.00 € = 15.96 €) = 78.46 € an B weiter
      expect(result.parentA.kindergeldAdjustment).toBeCloseTo(78.46, 2);
      expect(result.parentB.kindergeldAdjustment).toBeCloseTo(-78.46, 2);

      // Ausgleichszahlung Z_A = 349.26 + 78.46 = 427.72 €
      expect(result.parentA.netPayment).toBeCloseTo(427.72, 2);
      expect(result.parentB.netPayment).toBeCloseTo(-427.72, 2);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(427.72, 2);

      // Verbleibendes Einkommen prüfen
      expect(result.parentA.remainingIncome).toBe(round2(3800 - 427.72));
      expect(result.parentB.remainingIncome).toBe(round2(2050 + 427.72));
    });

    // -------------------------------------------------------------------------
    // TEST 3: Ein Elternteil unter Selbstbehalt
    // Elternteil B unter angemessenem SB (H_B = 0) -> Q_A = 1.0, Q_B = 0.0.
    // -------------------------------------------------------------------------
    it("Szenario 3 (Ein Elternteil unter Selbstbehalt): Elternteil B unter angemessenem Selbstbehalt führt zu Q_A = 1,0 und Q_B = 0,0", () => {
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
            netMonthly: 1600, // Unter angemessenem Selbstbehalt von 1.750 €
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

      // Elternteil B hat bereinigtes Netto von 1.600 € (< 1.750 € angemessener SB) -> H_B = 0
      expect(result.parentB.adjustedNet).toBe(1600);
      expect(result.parentB.liabilityIncome).toBe(0);

      // Elternteil A hat bereinigtes Netto von 3.000 € -> H_A = 1.250 €
      expect(result.parentA.liabilityIncome).toBe(1250);

      // Quoten: Q_A = 1.0, Q_B = 0.0
      expect(result.parentA.liabilityShare).toBe(1.0);
      expect(result.parentB.liabilityShare).toBe(0.0);

      // Kombiniertes Netto: 4.600 € -> Stufe 8 (4.501 - 4.900 €)
      expect(result.combinedAdjustedNet).toBe(4600);
      expect(result.appliedDtTier.tierIndex).toBe(8);

      // Grundbedarf für 6-11 in Stufe 8: 804 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(804);
      expect(childRes.shareParentA).toBe(804);
      expect(childRes.shareParentB).toBe(0);

      // Primäre Verpflichtung A: 804 - 402 (50% Naturalanteil) = 402 €
      expect(result.parentA.primaryObligation).toBe(402);
      expect(result.parentB.primaryObligation).toBe(-402);

      // Endabrechnung nach BGH XII ZB 45/15:
      // Elternteil B hat Anspruch auf 25% Betreuungsanteil (62.50 €) + Q_B * 125.00 € (0 €) = 62.50 €
      // Ausgleichszahlung Z_A = 402 + 62.50 = 464.50 €
      expect(result.parentA.kindergeldAdjustment).toBe(62.5);
      expect(result.parentB.kindergeldAdjustment).toBe(-62.5);
      expect(result.parentA.netPayment).toBe(464.5);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(464.5);
    });

    // -------------------------------------------------------------------------
    // TEST 4: Direktkosten-Verrechnung
    // Elternteil A verauslagt 150 € direkte Kindeskosten -> Zahlung an B mindert sich um Q_B * 150 €.
    // -------------------------------------------------------------------------
    it("Szenario 4 (Direktkostenverrechnung): Direktaufwendungen mindern die Ausgleichszahlung quotenmäßig", () => {
      // Basisszenario identisch zu Szenario 2
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

      // Eingabe mit 150 € Direktaufwand von Elternteil A
      const offsetInput: CalculationInput = {
        ...baseInput,
        parentA: {
          ...baseInput.parentA,
          directExpensesCovered: 150,
        },
      };

      const offsetResult = calculateWechselmodell(offsetInput);

      // Nach BGH XII ZB 565/15:
      // Direktaufwendungen von 150 € durch Elternteil A werden nach Haftungsquoten (Q_A : Q_B) geteilt.
      // Elternteil B muss seinen Quotenanteil Q_B * 150 € = 12.77% * 150 € = 19.15 € erstatten, was die Zahlung von A mindert.
      // Basis-Zahlung Z_A = 427.72 € - 19.15 € = 408.57 €
      expect(offsetResult.settlement.amount).toBeCloseTo(408.57, 2);
      expect(offsetResult.parentA.netPayment).toBeCloseTo(408.57, 2);
      expect(offsetResult.parentA.directExpensesDeduction).toBeCloseTo(-19.15, 2);
    });

    // -------------------------------------------------------------------------
    // TEST 5: Mehrbedarf- und Sonderbedarf-Zuschläge
    // -------------------------------------------------------------------------
    it("addiert Mehrbedarf (Wechselmodell-Zuschlag) und Sonderbedarf zum Kindesbedarf", () => {
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
          receivesKindergeld: true, // Elternteil B erhält Kindergeld
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "c1",
            name: "Child 1",
            ageGroup: "0-5",
            additionalNeeds: {
              wechselmodellSurcharge: 100, // Wohn-/Fahrtkosten-Mehrbedarf
              specialNeeds: 50, // Therapie / Musikschule
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

      // Kombiniert 6.000 € -> Stufe 11. Stufe 11 Satz für '0-5' ist 817 €
      expect(child.tabellenUnterhalt).toBe(817);
      expect(child.additionalNeedsTotal).toBe(150);
      expect(child.totalNeed).toBe(967);

      // Quoten 50:50 -> Anteil = je 483.50 €
      expect(child.shareParentA).toBe(483.5);
      expect(child.shareParentB).toBe(483.5);

      // Da B das Kindergeld bezieht und die Quoten 50:50 betragen, leitet B nach BGH XII ZB 45/15 (25% + 50% * 50% = 50%) 125 € an A weiter -> Z_A = -125 € (B zahlt A 125 €)
      expect(result.settlement.payer).toBe("parentB");
      expect(result.settlement.amount).toBe(125);
    });

    // -------------------------------------------------------------------------
    // TEST 6: Audit-Trail-Prüfung
    // -------------------------------------------------------------------------
    it("erstellt ein lückenloses, sequenzielles Rechenprotokoll für alle Schritte", () => {
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

      // Prüfen, dass alle erforderlichen Rechenschritte protokolliert sind
      const labels = result.auditTrail.map((log) => log.label);
      expect(labels.some((l) => l.includes("Bereinigtes Nettoeinkommen"))).toBe(true);
      expect(
        labels.some((l) => l.includes("Kombiniertes Nettoeinkommen") || l.includes("DT-Einstufung"))
      ).toBe(true);
      expect(labels.some((l) => l.includes("Haftungsanteile"))).toBe(true);
      expect(labels.some((l) => l.includes("Bedarfsberechnung Kind"))).toBe(true);
      expect(labels.some((l) => l.includes("Kindergeld"))).toBe(true);
      expect(labels.some((l) => l.includes("Endabrechnung"))).toBe(true);

      // Formatierung der Protokolleinträge validieren
      for (const log of result.auditTrail) {
        expect(log.stepNumber).toBeGreaterThan(0);
        expect(log.formula).toBeTruthy();
        expect(log.description).toBeTruthy();
        expect(log.value !== undefined).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: OLG Dresden, Beschluss vom 29.10.2015 – 20 UF 851/15
  // Exakte Validierung der Eingabewerte und Zwischenergebnisse aus dem Urteil
  // Hinweis: OLG Dresden entschied 2015 vor den BGH-Leitentscheidungen BGH XII ZB 45/15 (2016)
  // und BGH XII ZB 565/15 (2017). Die Eingabewerte, Haftungseinkommen, Quoten und Bedarfe
  // stimmen exakt mit dem Urteil überein; die Endabrechnung folgt dem verbindlichen BGH-Standard.
  // ---------------------------------------------------------------------------
  describe("OLG Dresden, Beschluss v. 29.10.2015 – 20 UF 851/15", () => {
    // 1. Konfiguration 2012 (Sep-Dez 2012, Urteil S. 13-14)
    const customConfig2012: typeof DEFAULT_LEGAL_CONFIG_2026 = {
      ...DEFAULT_LEGAL_CONFIG_2026,
      year: 2012,
      kindergeldPerChild: 184, // 184 € in 2012-2015 (hälftig = 92 €)
      retentionRates: {
        necessaryEmployed: 950,
        necessaryUnemployed: 770,
        adequate: 1150, // 1.150 € Selbstbehalt angewendet vom OLG Dresden in 2012 (Urteil S. 13)
      },
      table: [
        {
          tierIndex: 1,
          minIncome: 0,
          maxIncome: 10000,
          rates: {
            "0-5": 390, // Tabellenbedarf L. (Urteil S. 9: 390 €)
            "6-11": 462, // Tabellenbedarf J. (Urteil S. 9: 462 €)
            "12-17": 556,
            "18+": 600,
          },
          percentage: 100,
        },
      ],
    };

    // 2. Konfiguration 2013 (Urteil S. 14-18)
    const customConfig2013: typeof DEFAULT_LEGAL_CONFIG_2026 = {
      ...DEFAULT_LEGAL_CONFIG_2026,
      year: 2013,
      kindergeldPerChild: 184, // 184 € in 2012-2015 (hälftig = 92 €)
      retentionRates: {
        necessaryEmployed: 1000,
        necessaryUnemployed: 800,
        adequate: 1200, // 1.200 € Selbstbehalt angewendet vom OLG Dresden in 2013 (Urteil S. 14)
      },
      table: [
        {
          tierIndex: 1,
          minIncome: 0,
          maxIncome: 10000,
          rates: {
            "0-5": 317,
            "6-11": 462, // Tabellenbedarf L. ab Feb 2013 (Urteil S. 9: 462 €)
            "12-17": 556, // Tabellenbedarf J. ab Apr 2013 (Urteil S. 9: 556 €)
            "18+": 600,
          },
          percentage: 100,
        },
      ],
    };

    // 3. Konfiguration 2015 (Urteil S. 20-22)
    const customConfig2015: typeof DEFAULT_LEGAL_CONFIG_2026 = {
      ...DEFAULT_LEGAL_CONFIG_2026,
      year: 2015,
      kindergeldPerChild: 184, // 184 € (hälftig = 92 €)
      retentionRates: {
        necessaryEmployed: 1080,
        necessaryUnemployed: 880,
        adequate: 1300, // 1.300 € Selbstbehalt angewendet in 2015 (Urteil S. 20)
      },
      table: [
        {
          tierIndex: 1,
          minIncome: 0,
          maxIncome: 10000,
          rates: {
            "0-5": 328,
            "6-11": 433, // Tabellenbedarf L. 2015 (Urteil S. 9: 433 €)
            "12-17": 522, // Tabellenbedarf J. 2015 (Urteil S. 9: 522 €)
            "18+": 610,
          },
          percentage: 100,
        },
      ],
    };

    it("validates 2012 (Sep-Dez) verdict inputs and calculates BGH settlement for Child J", () => {
      // Daten aus OLG Dresden Seite 13:
      // Vater bereinigtes Netto: 3.171,90 € -> Haftungseinkommen H_V = 3.171,90 - 1.150 = 2.021,90 €
      // Mutter bereinigtes Netto (Teilzeit): 1.211,82 € -> Haftungseinkommen H_M = 1.211,82 - 1.150 = 61,82 €
      // Gesamt-Haftungseinkommen: 2.083,72 €
      // Gesamtbedarf J. (11 J.): 650,60 € (Regelbedarf 462,00 + Wohnen 38,60 + Fahrt 150,00)
      // Anteil Vater am Gesamtbedarf: 631,29 € (Urteil S. 13)
      // Anteil Mutter am Gesamtbedarf: 19,30 € (Urteil S. 13)
      // Direktleistungen: Vater 0 €, Mutter 180 € (Fahrt 150 + Essen 30)
      // Mutter bezieht Kindergeld (184 €)
      // OLG Dresden Urteilsbetrag 2012: (631,29 + 68,70) : 2 - 46,00 = 303,99 € mtl.
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            netMonthly: 3171.9,
            grossMonthly: 3564.14,
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
          name: "Kindesmutter",
          income: {
            netMonthly: 1211.82,
            grossMonthly: 1600,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 180, // Fahrt 150 € + Essen 30 €
        },
        children: [
          {
            id: "child-j",
            name: "J. H.",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 38.6, // Wohnmehrbedarf 2012 (Urteil S. 9)
              specialNeeds: 150, // Fahrtkosten
            },
          },
        ],
        config: customConfig2012,
      };

      const result = calculateWechselmodell(input);

      // Haftungseinkommen exakt wie im Urteil S. 13
      expect(result.parentA.liabilityIncome).toBe(2021.9);
      expect(result.parentB.liabilityIncome).toBe(61.82);

      // Gesamtbedarf J. exakt wie im Urteil S. 10/13: 650,60 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(650.6);

      // Anteile der Eltern am Gesamtbedarf (Urteil S. 13: 631,29 € / 19,30 €)
      expect(childRes.shareParentA).toBeCloseTo(631.29, 1);
      expect(childRes.shareParentB).toBeCloseTo(19.3, 1);

      // BGH-Spitzabrechnung (BGH XII ZB 45/15 & 565/15):
      // Primärpflicht Vater: 631,30 - 325,30 = 306,00 €
      // Direktkosten: Vater übernimmt 97,03 % von 180 € = +174,66 €
      // Kindergeld: Mutter leitet 46,00 € + 97,03 % * 92,00 € (89,27 €) = 135,27 € weiter (-135,27 €)
      // Netto-Zahlung Vater: 306,00 + 174,66 - 135,27 = 345,39 € (OLG Dresden nach alter Formel: 303,99 €)
      expect(result.parentA.primaryObligation).toBeCloseTo(306.0, 1);
      expect(result.parentA.directExpensesDeduction).toBeCloseTo(174.66, 1);
      expect(result.parentA.kindergeldAdjustment).toBeCloseTo(-135.27, 1);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(345.39, 1);
    });

    it("validates 2013 (Sept-Dec) verdict inputs and calculates BGH settlement for Child J (184.43 € vs. OLG 145.90 €)", () => {
      // Daten aus OLG Dresden Seite 15 (cc):
      // Vater bereinigtes Netto: 2.928,90 € -> Haftungseinkommen H_V = 2.928,90 - 1.200 = 1.728,90 €
      // Mutter bereinigtes Netto (fiktiv Vollzeit): 1.407,07 € -> Haftungseinkommen H_M = 1.407,07 - 1.200 = 207,07 €
      // Gesamt-Haftungseinkommen: 1.935,97 €
      // Gesamtbedarf J. (12 J.): 745,24 € (Regelbedarf 556 + Wohnen 39,24 + Fahrt 150)
      // Anteil Vater am Gesamtbedarf: 665,52 € (Urteil S. 15)
      // Anteil Mutter am Gesamtbedarf: 79,71 € (Urteil S. 15)
      // Direktzahlungen: Vater 150 € (Fahrt), Mutter 40 € (Essen)
      // Mutter bezieht Kindergeld (184 €)
      // OLG Dresden Urteilsbetrag 2013: (515,52 - 131,71) : 2 - 46,00 = 145,90 € mtl.
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
          directExpensesCovered: 150, // Fahrtkosten 150 € (ab Sep 2013 vom Vater übernommen)
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
          receivesKindergeld: true, // Mutter bezieht Kindergeld von Familienkasse
          directExpensesCovered: 40, // Essensgeld 40 €
        },
        children: [
          {
            id: "child-j",
            name: "J. H.",
            ageGroup: "12-17",
            additionalNeeds: {
              wechselmodellSurcharge: 39.24, // Wohnmehrbedarf 2013 (Urteil S. 9/15)
              specialNeeds: 150, // Fahrtkosten (Urteil S. 10/15)
            },
          },
        ],
        config: customConfig2013,
      };

      const result = calculateWechselmodell(input);

      // Haftungseinkommen exakt wie im Urteil S. 15
      expect(result.parentA.liabilityIncome).toBe(1728.9);
      expect(result.parentB.liabilityIncome).toBe(207.07);

      // Gesamtbedarf Kind J. exakt wie im Urteil S. 10/15: 745,24 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(745.24); // 556 + 189.24

      // Primäre Anteile am Bedarf exakt wie im Urteil S. 15 (665,52 € / 79,71 €)
      expect(childRes.shareParentA).toBeCloseTo(665.52, 1);
      expect(childRes.shareParentB).toBeCloseTo(79.71, 1);

      // Primäre Barunterhaltspflicht vor KG & Direktkosten:
      // U_prim,V = 665.53 - 0.5 * 745.24 = 292.91 € (Gericht: 292.90 €)
      expect(result.parentA.primaryObligation).toBeCloseTo(292.9, 1);

      // Quotenmäßige Direktkostenverrechnung (BGH XII ZB 565/15):
      // Q_A = 89.30%, Q_B = 10.70%
      // Vater schuldet Mutter: + 89.30% * 40 € = +35.72 €
      // Mutter schuldet Vater: + 10.70% * 150 € = +16.05 € (Gutschrift Vater: -16.05 €)
      // Netto-Direktkostenanteil Vater: +35.72 - 16.05 = +19.68 €
      expect(result.parentA.directExpensesDeduction).toBeCloseTo(19.68, 2);
      expect(result.parentB.directExpensesDeduction).toBeCloseTo(-19.68, 2);

      // Kindergeld-Ausgleich gemäß BGH XII ZB 45/15 & XII ZB 565/15 Rn. 32:
      // Mutter bezieht 184 € KG -> leitet 25% Betreuung (46.00 €) + Vaters Baranteil (89.30% * 92.00 € = 82.16 €) = 128.16 € weiter
      expect(result.parentA.kindergeldAdjustment).toBeCloseTo(-128.16, 2);
      expect(result.parentB.kindergeldAdjustment).toBeCloseTo(128.16, 2);

      // Endabrechnung BGH: 292.91 + 19.68 - 128.16 = 184.43 €
      // (OLG Dresden errechnete nach alter Halbierungs-Methode 145,90 €)
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(184.43, 1);
      expect(result.parentA.netPayment).toBeCloseTo(184.43, 1);
    });

    it("validates 2015 (Jan-Jun) verdict inputs and calculates BGH settlement for Child J (208.97 € vs. OLG 166.22 €)", () => {
      // Daten aus OLG Dresden Seite 20-21:
      // Vater bereinigtes Netto: 2.871,90 € -> H_V = 2.871,90 - 1.300 = 1.571,90 €
      // Mutter bereinigtes Netto: 1.407,07 € -> H_M = 1.407,07 - 1.300 = 107,07 €
      // Gesamt-Haftungseinkommen: 1.678,97 € -> Q_V = 93,62 %, Q_M = 6,38 %
      // Gesamtbedarf J. (14 J.): 718,04 € (Regelbedarf 522 + Wohnen 46,04 + Fahrt 150)
      // Anteil Vater am Gesamtbedarf: 672,24 € (Urteil S. 21)
      // Anteil Mutter am Gesamtbedarf: 45,79 € (Urteil S. 21)
      // Direktkosten: Vater 150 € (Fahrt), Mutter 40 € (Essen)
      // Mutter bezieht Kindergeld (184 €)
      // OLG Dresden Urteilsbetrag 2015: (522,24 - 97,79) : 2 - 46,00 = 166,22 € mtl. (Urteil S. 21)
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

      // Haftungseinkommen exakt wie im Urteil S. 20
      expect(result.parentA.liabilityIncome).toBe(1571.9);
      expect(result.parentB.liabilityIncome).toBe(107.07);

      // Gesamtbedarf Kind J. exakt wie im Urteil S. 11/21: 718,04 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(718.04);

      // Anteile am Gesamtbedarf exakt wie im Urteil S. 21 (672,24 € / 45,79 €)
      expect(childRes.shareParentA).toBeCloseTo(672.24, 1);
      expect(childRes.shareParentB).toBeCloseTo(45.79, 1);

      // BGH-Endabrechnung (BGH XII ZB 45/15):
      // U_prim,V = 672.24 - 359.02 = 313.22 €
      // Quotenmäßige Direktkosten: + 93.62% * 40 - 6.38% * 150 = +27.88 €
      // Kindergeld nach BGH XII ZB 45/15: -(46.00 + 93.62% * 92.00) = -132.13 €
      // Gesamt: 313.22 + 27.88 - 132.13 = 208.97 €
      // (OLG Dresden errechnete nach alter Methode 166,22 €)
      expect(result.parentA.kindergeldAdjustment).toBeCloseTo(-132.13, 2);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(208.97, 1);
      expect(result.parentA.netPayment).toBeCloseTo(208.97, 1);
    });

    it("validates 2015 (Jan-Jun) verdict inputs and calculates BGH settlement for Child L (221.42 € vs. OLG 156.86 €)", () => {
      // Daten aus OLG Dresden Seite 20-22:
      // Vater bereinigtes Netto: 2.871,90 € -> H_V = 1.571,90 €
      // Mutter bereinigtes Netto: 1.407,07 € -> H_M = 107,07 €
      // Gesamtbedarf L. (8 J.): 662,18 € (Regelbedarf 433 + Wohnen 39,18 + Fahrt 150 + Hort 40)
      // Anteil Vater am Gesamtbedarf: 619,95 € (Urteil S. 21)
      // Anteil Mutter am Gesamtbedarf: 42,22 € (Urteil S. 21)
      // Direktkosten: Vater 160 € (Fahrt 150 + Tanz 10), Mutter 80 € (Hort 40 + Essen 40)
      // OLG Dresden Urteilsbetrag 2015: (459,95 - 54,22) : 2 - 46,00 = 156,86 € mtl. (Urteil S. 21)
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

      // Gesamtbedarf Kind L. exakt wie im Urteil S. 11/21: 662,18 €
      const childRes = result.childrenResults[0];
      expect(childRes.totalNeed).toBe(662.18);

      // Anteile am Gesamtbedarf exakt wie im Urteil S. 21 (619,95 € / 42,22 €)
      expect(childRes.shareParentA).toBeCloseTo(619.95, 1);
      expect(childRes.shareParentB).toBeCloseTo(42.22, 1);

      // BGH-Endabrechnung:
      // U_prim,V = 619.95 - 331.09 = 288.86 €
      // Quotenmäßige Direktkosten: + 93.62% * 80 - 6.38% * 160 = +64.69 €
      // Kindergeld nach BGH XII ZB 45/15: -132.13 €
      // Gesamt: 288.86 + 64.69 - 132.13 = 221.42 €
      // (OLG Dresden errechnete nach alter Methode 156,86 €)
      expect(result.parentA.kindergeldAdjustment).toBeCloseTo(-132.13, 2);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(221.42, 1);
      expect(result.parentA.netPayment).toBeCloseTo(221.42, 1);
    });

    it("calculates combined total for both children in 2015 with BGH quota sharing (430.39 € vs. OLG 323.08 €)", () => {
      // Urteil S. 21-22:
      // Gesamter Unterhaltsbetrag für beide Kinder (J. + L.) im Jahr 2015:
      // OLG Dresden Summe: 166,22 € (J.) + 156,86 € (L.) = 323,08 € mtl.
      // BGH-Standard Summe: 208,97 € (J.) + 221,42 € (L.) = 430,39 € mtl.
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
          receivesKindergeld: true, // Mutter bezieht Kindergeld für beide Kinder (2 * 184 = 368 €)
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

      // Gesamtsumme für beide Kinder: 208.97 + 221.42 = 430.39 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(430.39, 1);
      expect(result.parentA.netPayment).toBeCloseTo(430.39, 1);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: Deterministische Wohnmehrbedarfs-Methode (OLG Dresden 20 UF 851/15)
  // ---------------------------------------------------------------------------
  describe("Wohnmehrbedarfs-Formel (OLG Dresden 20 UF 851/15 Rn. 21.5.2)", () => {
    it("berechnet 2012 Wohnmehrbedarf Kind J (38,60 €) exakt nach Urteilsformel", () => {
      // OLG Dresden Seite 9:
      // Tabellenbedarf kombiniert: 554 € -> 20% = 110.80 €
      // Vater allein: 466 € -> 20% * 0.90 = 83.88 €
      // Mutter allein: 364 € -> 20% * 0.90 = 65.52 €
      // Mehrbedarf: 149.40 € - 110.80 € = 38.60 €
      const mehrbedarf = calculateOlgDresdenWohnmehrbedarf(554, 466, 364);
      expect(mehrbedarf).toBe(38.6);
    });

    it("berechnet 2013 (Jan-März) Wohnmehrbedarf Kind J (33,38 €) exakt nach Urteilsformel", () => {
      // OLG Dresden Seite 9:
      // Tabellenbedarf kombiniert: 554 € -> 20% = 110.80 €
      // Vater allein: 437 € -> 20% * 0.90 = 78.66 €
      // Mutter allein: 364 € -> 20% * 0.90 = 65.52 €
      // Mehrbedarf: 144.18 € - 110.80 € = 33.38 €
      const mehrbedarf = calculateOlgDresdenWohnmehrbedarf(554, 437, 364);
      expect(mehrbedarf).toBe(33.38);
    });

    it("berechnet 2013 (ab April) Wohnmehrbedarf Kind J (39,24 €) exakt nach Urteilsformel", () => {
      // OLG Dresden Seite 9:
      // Tabellenbedarf kombiniert: 648 € -> 20% = 129.60 €
      // Vater allein: 512 € -> 20% * 0.90 = 92.16 €
      // Mutter allein: 426 € -> 20% * 0.90 = 76.68 €
      // Mehrbedarf: 168.84 € - 129.60 € = 39.24 €
      const mehrbedarf = calculateOlgDresdenWohnmehrbedarf(648, 512, 426);
      expect(mehrbedarf).toBe(39.24);
    });

    it("berechnet 2012 Wohnmehrbedarf Kind L (35,74 €) aus den Urteilskomponenten (73,08 + 57,06 - 94,40)", () => {
      // OLG Dresden Seite 10:
      // Tabellenbedarf kombiniert: 472 € -> 20% = 94.40 €
      // Vater allein: 406 € -> 20% * 0.90 = 73.08 €
      // Mutter allein: 317 € -> 20% * 0.90 = 57.06 €
      // Hinweis: Das Urteil enthielt mit "33,74 € (73,08 € + 57,06 € - 94,40 €)" einen leichten Rechen-Tippfehler in der Subtraktion;
      // das mathematisch exakte Ergebnis von (73,08 + 57,06 - 94,40) beträgt exakt 35,74 €:
      const mehrbedarf = calculateOlgDresdenWohnmehrbedarf(472, 406, 317);
      expect(mehrbedarf).toBe(35.74);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: Betreuungsunterhalt § 1615l BGB im Wechselmodell (BGH NJW 2026 S. 8)
  // ---------------------------------------------------------------------------
  describe("Betreuungsunterhalt § 1615l BGB im 50:50-Wechselmodell (BGH NJW 2026 S. 8)", () => {
    it("wendet 50 % Erwerbsobliegenheit und Vorwegabzug des Kindesunterhalts an", () => {
      // Unverheiratete Eltern im paritätischen 50:50-Wechselmodell für ein 1,5 Jahre altes Kleinkind:
      // Mutter früheres Vollzeit-Netto: 3.000 €; arbeitet jetzt 50% (verdient 1.500 € netto -> Verlust = 1.500 €)
      // Vater früheres Vollzeit-Netto: 4.500 €; arbeitet jetzt 50% (verdient 2.250 € netto -> Verlust = 2.250 €)
      // Kindesunterhaltspflicht des Vaters: 450 € (Vorwegabzug)
      // Verfügbares Netto Vater nach Vorwegabzug des Kindesunterhalts: 2.250 - 450 = 1.800 €
      // Selbstbehalt: 1.450 € -> Verteilungsmasse = 350 €
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

    it("schließt § 1615l-Anspruch nach Vollendung des 3. Lebensjahres korrekt aus", () => {
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
        childAgeYears: 4, // Kind ist 4 Jahre alt (überschreitet die 3-Jahres-Grenze nach § 1615l)
      });

      expect(res.isEligibleFor1615l).toBe(false);
      expect(res.employmentObligationPercentage).toBe(100);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: BGH, Beschluss vom 11.01.2017 – XII ZB 565/15 (BGHZ 213, 254)
  // Grundsatzentscheidung zur Berechnungsmethodik im 50:50-Wechselmodell
  // ---------------------------------------------------------------------------
  describe("BGH, Beschluss v. 11.01.2017 – XII ZB 565/15 (BGHZ 213, 254)", () => {
    it("setzt BGH-Grundsätze um: zusammengerechnetes Einkommen, SB_ang-Quotelung und Kindergeldausgleich", () => {
      // BGH Rn. 18 (Bedarf aus beiderseitigem Einkommen), Rn. 29 (Quotelung über SB_ang), Rn. 32 & BGH XII ZB 45/15 (Kindergeld-Splitting)
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Kindesvater",
          income: {
            grossAnnual: 60000,
            netAnnual: 42000, // 3.500 € netto / Monat
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true }, // max. 150 €
            privatePensionAnnual: 2400, // 200 € / Monat (<= 4% Brutto)
            housingAdvantageAnnual: 0,
            allowableDebtsAnnual: 0,
          },
          receivesKindergeld: false,
          directExpensesCovered: 200, // Vater zahlt 200 € direkt für das Kind (Fahrt/Sport)
        },
        parentB: {
          id: "parentB",
          name: "Kindesmutter",
          income: {
            grossAnnual: 30000,
            netAnnual: 24000, // 2.000 € netto / Monat
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true }, // 100 €
            privatePensionAnnual: 0,
            housingAdvantageAnnual: 0,
            allowableDebtsAnnual: 0,
          },
          receivesKindergeld: true, // Mutter bezieht Kindergeld (250 €)
          directExpensesCovered: 60, // Mutter zahlt 60 € direkt (Hort/Essen)
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 100, // Konkreter Mehrbedarf (BGH Rn. 25)
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

      // Vater bereinigtes Netto: 3.500 - 150 - 200 = 3.150 €
      // Mutter bereinigtes Netto: 2.000 - 100 = 1.900 €
      expect(result.parentA.adjustedNet).toBe(3150);
      expect(result.parentB.adjustedNet).toBe(1900);

      // Kombiniertes Netto: 3.150 + 1.900 = 5.050 € -> Stufe 9 (4.901 - 5.300 €)
      expect(result.combinedAdjustedNet).toBe(5050);
      expect(result.appliedDtTier.tierIndex).toBe(9);

      // Quotenberechnung über SB_ang (1.750 €):
      // H_A = 3.150 - 1.750 = 1.400 €
      // H_B = 1.900 - 1.750 = 150 €
      // Gesamt-H = 1.550 € -> Q_A = 1400/1550 = 90.32%, Q_B = 150/1550 = 9.68%
      expect(result.parentA.liabilityIncome).toBe(1400);
      expect(result.parentB.liabilityIncome).toBe(150);
      expect(result.parentA.liabilityShare).toBeCloseTo(0.9032, 3);
      expect(result.parentB.liabilityShare).toBeCloseTo(0.0968, 3);

      // Tabellenbedarf für 6-11 in Stufe 9 ist 849 € + 100 € Mehrbedarf = 949 €
      const child = result.childrenResults[0];
      expect(child.tabellenUnterhalt).toBe(849);
      expect(child.totalNeed).toBe(949);

      // Anteil Vater: 949 * (1400/1550) = 857.16 €
      // Primäre Barunterhaltspflicht vor KG: 857.16 - 474.50 (50% Naturalanteil) = 382.66 €
      expect(result.parentA.primaryObligation).toBe(382.66);

      // Quotenmäßige Direktkostenverrechnung (BGH XII ZB 565/15):
      // Q_A = 90.32%, Q_B = 9.68%
      // Vater schuldet Mutter: + 90.32% * 60 = +54.19 €
      // Mutter schuldet Vater: + 9.68% * 200 = +19.35 € (Gutschrift Vater: -19.35 €)
      // Netto-Direktkostenanteil Vater: +54.19 - 19.35 = +34.84 €
      expect(result.parentA.directExpensesDeduction).toBeCloseTo(34.84, 2);
      expect(result.parentB.directExpensesDeduction).toBeCloseTo(-34.84, 2);

      // Kindergeld-Ausgleich nach BGH XII ZB 45/15 & XII ZB 565/15 Rn. 32:
      // Mutter (B) bezieht 250 € KG -> B leitet 25% Betreuungsanteil (62.50 €) + A's Baranteils-Entlastung (90.32% * 125.00 € = 112.90 €) = 175.40 € an A weiter
      expect(result.parentA.kindergeldAdjustment).toBeCloseTo(-175.4, 1);
      expect(result.parentB.kindergeldAdjustment).toBeCloseTo(175.4, 1);

      // Ausgleichszahlung Z_A = 382.66 + 34.84 - 175.40 = 242.10 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(242.1, 1);
      expect(result.parentA.netPayment).toBeCloseTo(242.1, 1);
    });

    it("berechnet quotenmäßigen Direktkostenausgleich für Nutzerszenario exakt (Q_A = 83,33 %, D_B = 285 €)", () => {
      // Nutzerszenario:
      // Gesamtbedarf: 2.054,00 € (z. B. 2 Kinder)
      // Quoten: Q_A = 83,33 % (5/6), Q_B = 16,67 % (1/6)
      // Elternteil B verauslagt D_B = 285,00 € direkt in bar
      // Elternteil A verauslagt D_A = 0,00 €
      // Kindergeld: 250 € (25 % Betreuungsanteil = 62,50 €, 50 % Baranteil = 125,00 €)
      // Haftungsanteil A: 2.054 * (5/6) = 1.711,67 €
      // 50 % Naturalunterhalt A: 2.054 * 0,5 = 1.027,00 €
      // Primäre Barunterhaltspflicht: 1.711,67 - 1.027,00 = 684,67 €
      // Quotenmäßiger Direktaufwand: Q_A * D_B = 83,333 % * 285,00 € = 237,50 €
      // Kindergeld-Ausgleich (BGH XII ZB 45/15): B schuldet A 62,50 € + (5/6) * 125,00 € = 62,50 € + 104,17 € = 166,67 €
      // Ausgleichszahlung Z_A = 684,67 + 237,50 - 166,67 = 755,50 €
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
            netMonthly: 2250, // 2.250 - 1.750 = 500 € H_B (Gesamt-H = 3.000 € -> Q_A = 2500/3000 = 83.33%)
            grossMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true, // B bezieht Kindergeld
          directExpensesCovered: 285, // B zahlt 285 € direkt (Hort/Essen/Anschaffung)
        },
        children: [
          {
            id: "c1",
            name: "Kind 1",
            ageGroup: "12-17",
            additionalNeeds: { wechselmodellSurcharge: 904, specialNeeds: 0 }, // Gesamtbedarf = 1150 (DT Gruppe 12) + 904 = 2054 €
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

      // Barunterhaltspflicht nach Abzug von 50 % Naturalunterhalt (1.027 €):
      expect(result.parentA.primaryObligation).toBeCloseTo(684.67, 1);

      // Quotenmäßige Direktkosten: A übernimmt exakt 83.33% von 285 € = 237.50 € (nicht pauschal 142.50 €!)
      expect(result.parentA.directExpensesDeduction).toBeCloseTo(237.5, 1);
      expect(result.parentB.directExpensesDeduction).toBeCloseTo(-237.5, 1);

      // Kindergeld: B schuldet A (62.50 + 83.33% * 125 = 166.67 €)
      expect(result.parentA.kindergeldAdjustment).toBeCloseTo(-166.67, 2);

      // Ausgleichsbetrag: 684.67 + 237.50 - 166.67 = 755.50 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBeCloseTo(755.5, 1);
      expect(result.parentA.netPayment).toBeCloseTo(755.5, 1);
    });

    it("stellt sicher, dass keine vollständige Barunterhaltsbefreiung eintritt (§ 1606 Abs. 3 S. 2 BGB, BGH Rn. 13)", () => {
      // Beide Elternteile verdienen gleiches Einkommen (je 3.000 € netto)
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

      // Beide Elternteile haben eine Haftungsquote von 50 %; keiner ist befreit
      expect(result.parentA.liabilityShare).toBe(0.5);
      expect(result.parentB.liabilityShare).toBe(0.5);
      // Spitzabrechnung leitet 129,50 € (Hälfte des Standard-Kindergeldes 2026: 259 €) von A an B weiter
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(129.5);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25 & Kopfzahl)
  // ---------------------------------------------------------------------------
  describe("Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25 & Pro-Kopf-Methode)", () => {
    it("berechnet Realkosten-Wohnmehrbedarf je Kind durch Abgleich der Warmmieten mit 20%-Tabellenwohnanteil", () => {
      // Elternteil A: Warmmiete = 1.200 €, Haushalt = 2 Personen -> Kindesanteil = 600 €
      // Elternteil B: Warmmiete = 900 €, Haushalt = 2 Personen -> Kindesanteil = 450 €
      // Gesamter tatsächlicher Wohnaufwand für das Kind über beide Haushalte = 600 + 450 = 1.050 €
      // Kombiniertes Netto = 3.150 + 1.900 = 5.050 € -> DT 2026 Stufe 9
      // Kind (Altersstufe 6-11) Tabellen-Grundbedarf = 849 €
      // 20% im Tabellenbedarf enthaltener Wohnanteil = 0,20 * 849 € = 169,80 €
      // Errechneter Realkosten-Wohnmehrbedarf = 1.050 € - 169,80 € = 880,20 €
      // Gesamtbedarf Kind = 849 + 880,20 = 1.729,20 €
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
              wechselmodellSurcharge: 0, // Manuell 0 -> wird aus Wohnkosten ermittelt
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
      expect(child.childHousingA).toBe(600);
      expect(child.childHousingB).toBe(450);

      // Direkte Drittzahlungen (Wohnkosten 1.050 €) werden vom Bruttobedarf (1.729,20 €) abgezogen.
      // Restbedarf für den laufenden Lebensunterhalt = 679,20 € (50 % Naturalunterhalt je Elternteil: 339,60 €).
      // Haftungsanteil A (90,32 % von 1.729,20 €) = 1.561,86 €
      // Barunterhalt A = 1.561,86 € - 339,60 € (Natural) - 600,00 € (Wohnen) = 622,26 €
      expect(result.parentA.primaryObligation).toBe(622.26);
      expect(result.parentB.primaryObligation).toBe(-622.26);

      // Kindergeld-Ausgleich (259 € staatl. KG): B empfängt KG -> leistet Ausgleich an A (181,72 €)
      expect(result.parentA.kindergeldAdjustment).toBe(-181.72);
      expect(result.parentB.kindergeldAdjustment).toBe(181.72);

      // Endabrechnung: Zahlbetrag A = 622,26 € - 181,72 € = 440,54 € an B
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(440.54);

      // Protokollierung des Realkosten-Wohnmehrbedarfs und der Formeln prüfen
      const housingLog = result.auditTrail.find((l) =>
        l.label.includes("Realkosten-Wohnmehrbedarf")
      );
      expect(housingLog).toBeDefined();
      expect(housingLog?.value).toBe(880.2);

      const childLog = result.auditTrail.find((l) => l.label.includes("Bedarfsberechnung Kind"));
      expect(childLog).toBeDefined();
      expect(childLog?.formula).toContain("Rest_Lebensunterhalt = B_ges - Wohnen_ges");
      expect(childLog?.description).toContain("600.00 €");
      expect(childLog?.description).toContain("450.00 €");

      const settlementLog = result.auditTrail.find((l) =>
        l.label.includes("Endabrechnung & Zahlbetrag")
      );
      expect(settlementLog).toBeDefined();
      expect(settlementLog?.formula).toContain("Wohnen_Kind_A");
    });

    it("teilt Warmmiete nach der Pro-Kopf-Methode bei mehreren Kindern im Haushalt korrekt auf", () => {
      // 2 Kinder leben im Haushalt:
      // Elternteil A: Warmmiete = 1.500 €, Haushalt = 3 Personen (Elternteil A + 2 Kinder) -> 500 € / Kind
      // Elternteil B: Warmmiete = 1.200 €, Haushalt = 3 Personen (Elternteil B + 2 Kinder) -> 400 € / Kind
      // Gesamt-Wohnaufwand pro Kind = 500 + 400 = 900 €
      // Kind 1 (6-11, Tabellenbedarf 849 €): 900 - 169,80 (20%) = 730,20 € Wohnmehrbedarf
      // Kind 2 (12-17, Tabellenbedarf 993 €): 900 - 198,60 (20%) = 701,40 € Wohnmehrbedarf
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
      expect(child1.childHousingA).toBe(500);
      expect(child1.childHousingB).toBe(400);

      expect(child2.housingNeedCalculated).toBe(900);
      expect(child2.housingPortionInTable).toBe(198.6);
      expect(child2.calculatedWohnmehrbedarf).toBe(701.4);
      expect(child2.totalNeed).toBe(1694.4);
      expect(child2.childHousingA).toBe(500);
      expect(child2.childHousingB).toBe(400);

      // Kind 1: Haftungsanteil A = 1.426,37 €, Rest-Lebensunterhalt = 679,20 € (Natural: 339,60 €), Wohnen = 500 € -> Barunterhalt A = 586,77 €
      // Kind 2: Haftungsanteil A = 1.530,43 €, Rest-Lebensunterhalt = 794,40 € (Natural: 397,20 €), Wohnen = 500 € -> Barunterhalt A = 633,23 €
      // Gesamtprimärverpflichtung A = 586,77 + 633,23 = 1.220,00 €
      expect(result.parentA.primaryObligation).toBe(1220);
      expect(result.parentB.primaryObligation).toBe(-1220);

      // Kindergeld (2 Kinder = 518 €) Ausgleich B an A = 363,44 €
      expect(result.parentA.kindergeldAdjustment).toBe(-363.44);
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(856.56);
    });

    it("verhält sich unverändert, wenn keine Mieten eingegeben wurden (Standard-50:50-Naturalunterhalt)", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
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
          // Keine housingCosts angegeben
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Elternteil B",
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
          // Keine housingCosts angegeben
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
        ],
      };

      const result = calculateWechselmodell(input);
      const child = result.childrenResults[0];

      expect(child.housingNeedCalculated).toBeUndefined();
      expect(child.housingPortionInTable).toBeUndefined();
      expect(child.calculatedWohnmehrbedarf).toBeUndefined();
      expect(child.childHousingA).toBeUndefined();
      expect(child.childHousingB).toBeUndefined();
      expect(child.totalNeed).toBe(849);

      // Haftungsanteil A (90,32 % von 849 €) = 766,84 €
      // 50 % Naturalunterhalt = 424,50 €
      // Barunterhalt A = 766,84 € - 424,50 € = 342,34 €
      expect(result.parentA.primaryObligation).toBe(342.34);
      expect(result.parentB.primaryObligation).toBe(-342.34);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: BGH, Beschluss v. 20.04.2016 – XII ZB 45/15 (Kindergeldausgleich) & Konfigurierbares Kindergeld
  // ---------------------------------------------------------------------------
  describe("BGH, Beschluss v. 20.04.2016 – XII ZB 45/15 (FamRZ 2016, 1053)", () => {
    it("prüft Kindergeld-Splitting des Standard-Kindergeldes 2026 (259 € -> 129,50 € bei 50:50-Quote)", () => {
      // Beide Elternteile haben identische Einkommen (je 3.000 € netto -> Q_A = Q_B = 50 %)
      // Elternteil A bezieht 100% Kindergeld (Standard 2026: 259 €) von der Familienkasse
      // Nach BGH XII ZB 45/15 leitet A 25 % Betreuung (64,75 €) + Q_B * 50 % Baranteil (50 % * 129,50 € = 64,75 €) = 129,50 € an B weiter
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

    it("prüft konfigurierbares Kindergeld für 2024 (250 €), 2025 (255 €) und individuelle Beträge", () => {
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

      // 1. Kindergeld 2024 (250 € -> 125,00 € Hälfte)
      const res2024 = calculateWechselmodell({
        ...baseInput,
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 250,
        },
      });
      expect(res2024.parentA.kindergeldAdjustment).toBe(125);
      expect(res2024.settlement.amount).toBe(125);

      // 2. Kindergeld 2025 (255 € -> 127,50 € Hälfte)
      const res2025 = calculateWechselmodell({
        ...baseInput,
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 255,
        },
      });
      expect(res2025.parentA.kindergeldAdjustment).toBe(127.5);
      expect(res2025.settlement.amount).toBe(127.5);

      // 3. Benutzerdefinierter Betrag (z. B. 300 € -> 150,00 € Hälfte)
      const resCustom = calculateWechselmodell({
        ...baseInput,
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 300,
        },
      });
      expect(resCustom.parentA.kindergeldAdjustment).toBe(150);
      expect(resCustom.settlement.amount).toBe(150);

      // 4. Mehrkind-Berechnung mit Kindergeld 2026 (2 Kinder * 259 € = 518 € -> 259,00 € Hälfte)
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

    it("prüft isolierten Kindergeld-Ausgleichsanspruch (Ein-Viertel-Regel, BGH XII ZB 45/15)", () => {
      // Szenario 1: Isolierter Ausgleichsanspruch für Kindergeld 2026 (259 €) -> 25% = 64,75 €
      const isolated2026 = calculateIsolatedKindergeldClaim(259, 1);
      expect(isolated2026.perChild).toBe(64.75);
      expect(isolated2026.total).toBe(64.75);
      expect(isolated2026.carePortionPercentage).toBe(25);

      // Mehrkind-Ausgleichsanspruch (2 Kinder * 259 €) -> 2 * 64,75 € = 129,50 €
      const isolated2Children = calculateIsolatedKindergeldClaim(259, 2);
      expect(isolated2Children.perChild).toBe(64.75);
      expect(isolated2Children.total).toBe(129.5);

      // Kindergeld 2024 (250 €) -> 25% = 62,50 €
      const isolated2024 = calculateIsolatedKindergeldClaim(250, 1);
      expect(isolated2024.perChild).toBe(62.5);
      expect(isolated2024.total).toBe(62.5);
    });

    it("prüft asymmetrische Kindergeld-Quotenaufteilung (Szenario 3: Q_A = 70 %, Q_B = 30 %, KG = 259 €)", () => {
      // Setup exaktes 70:30-Quotenszenario:
      // SB_ang = 1.750 €
      // Elternteil A: Bereinigtes Netto = 3.850 € -> H_A = 3.850 - 1.750 = 2.100 €
      // Elternteil B: Bereinigtes Netto = 2.650 € -> H_B = 2.650 - 1.750 = 900 €
      // Gesamt-H = 3.000 € -> Q_A = 2100/3000 = 70,00 %, Q_B = 900/3000 = 30,00 %
      // 1 Kind (6-11 Jahre): Tabellenbedarf in Gruppe 12 (6.500 € kombiniert) = 983 €
      // Kindergeld = 259 € (geht an Elternteil A)
      //
      // Juristische Prüfung nach BGH XII ZB 45/15 & BGH XII ZB 565/15:
      // 1. Betreuungsanteil (25%): 64,75 € von A an B
      // 2. Baranteils-Entlastung für B: Q_B * (50% * 259 €) = 30% * 129,50 € = 38,85 € von A an B
      // Gesamter KG-Ausgleich von A an B: 64,75 € + 38,85 € = 103,60 €
      // Primäre Barunterhaltspflicht vor KG (relativ zu 50% Naturalanteil = 491,50 €):
      // U_prim,A = (70% - 50%) * 983 € = +20% * 983 € = +196,60 €
      // Ausgleichszahlung Z_A = 196,60 € + 103,60 € = 300,20 €
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            netMonthly: 3850,
            grossMonthly: 5500,
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
            netMonthly: 2650,
            grossMonthly: 3800,
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
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 259,
        },
      };

      const result = calculateWechselmodell(input);

      // Quoten prüfen
      expect(result.parentA.liabilityShare).toBeCloseTo(0.7, 4);
      expect(result.parentB.liabilityShare).toBeCloseTo(0.3, 4);

      // Primäre Barunterhaltspflicht vor KG prüfen: 20% * 983 € = 196.60 €
      expect(result.parentA.primaryObligation).toBe(196.6);
      expect(result.parentB.primaryObligation).toBe(-196.6);

      // Kindergeld-Ausgleich prüfen: 25% Betreuung (64.75 €) + 30% Baranteil (38.85 €) = 103.60 €
      expect(result.parentA.kindergeldAdjustment).toBe(103.6);
      expect(result.parentB.kindergeldAdjustment).toBe(-103.6);

      // Endabrechnung: 196.60 + 103.60 = 300.20 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(300.2);
      expect(result.parentA.netPayment).toBe(300.2);
      expect(result.parentB.netPayment).toBe(-300.2);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: BGH, Urteil v. 05.03.2003 – XII ZR 149/01 (4% Altersvorsorge)
  // ---------------------------------------------------------------------------
  describe("BGH, Urteil v. 05.03.2003 – XII ZR 149/01 (BGHZ 154, 247)", () => {
    it("deckelt zusätzliche Altersvorsorge strikt auf maximal 4 % des Bruttoeinkommens (BGH XII ZR 149/01)", () => {
      // Brutto = 5.000 € -> 4 % Deckelung = 200 € / Monat
      // Wenn der Nutzer 350 € private Vorsorge angibt, dürfen maximal 200 € abgezogen werden
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

  // ---------------------------------------------------------------------------
  // TEST-SUITE: Bürgergeld-Bezug / Nichterwerbstätigkeit (§ 1603 Abs. 2 BGB, § 33 SGB II)
  // ---------------------------------------------------------------------------
  describe("Bürgergeld-Bezug & Nichterwerbstätigkeit (§ 1603 Abs. 2 BGB & BGH XII ZB 45/15)", () => {
    it("berechnet Quote A = 100 % und Quote B = 0 % bei A (3.500 € netto) und B (Bürgergeld 0 €)", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Vater (Erwerbstätig)",
          income: {
            erwerbsstatus: "erwerbstaetig",
            netMonthly: 3500,
            grossMonthly: 5000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
          },
          receivesKindergeld: true,
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Mutter (Bürgergeld)",
          income: {
            erwerbsstatus: "buergergeld",
            netMonthly: 0,
            grossMonthly: 0,
            isEmployed: false,
            occupationalExpenses: { useFlatRate: true },
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 259,
        },
      };

      const result = calculateWechselmodell(input);

      // Bereinigte Nettoeinkommen
      expect(result.parentA.adjustedNet).toBe(3500);
      expect(result.parentB.adjustedNet).toBe(0);

      // Haftungseinkommen über angemessenem Selbstbehalt (1.750 €):
      // H_A = 3.500 - 1.750 = 1.750 €
      // H_B = 0 €
      expect(result.parentA.liabilityIncome).toBe(1750);
      expect(result.parentB.liabilityIncome).toBe(0);

      // Haftungsquoten: Q_A = 100 %, Q_B = 0 %
      expect(result.parentA.liabilityShare).toBe(1.0);
      expect(result.parentB.liabilityShare).toBe(0.0);

      // Rechtliche Hinweise & Flags vorhanden
      expect(result.hasBuergergeldRecipient).toBe(true);
      expect(result.buergergeldHinweise).toBeDefined();
      expect(result.buergergeldHinweise?.length).toBeGreaterThanOrEqual(2);
      expect(result.parentB.isBuergergeld).toBe(true);
      expect(result.parentA.isBuergergeld).toBe(false);
    });

    it("leistet einkommensunabhängigen Kindergeldausgleich (25 % Betreuungsanteil = 64,75 €) an Bürgergeld-Empfänger B", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Vater (Erwerbstätig)",
          income: {
            erwerbsstatus: "erwerbstaetig",
            netMonthly: 3500,
            grossMonthly: 5000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: false, customAmount: 0 },
          },
          receivesKindergeld: true, // Vater bezieht das Kindergeld von der Familienkasse
          directExpensesCovered: 0,
        },
        parentB: {
          id: "parentB",
          name: "Mutter (Bürgergeld)",
          income: {
            erwerbsstatus: "buergergeld",
            netMonthly: 0,
            grossMonthly: 0,
            isEmployed: false,
            occupationalExpenses: { useFlatRate: true },
          },
          receivesKindergeld: false,
          directExpensesCovered: 0,
        },
        children: [
          {
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
        config: {
          ...DEFAULT_LEGAL_CONFIG_2026,
          kindergeldPerChild: 259,
        },
      };

      const result = calculateWechselmodell(input);

      // DT 2026 Stufe 5 (3.201 - 3.600 €, 120 %) für Altersgruppe 6-11 = 670 €
      // Gesamtbedarf = 670 €
      // Anteil A (100 %) = 670 €
      // 50 % Naturalunterhalt = 335 €
      // Primäre Barunterhaltspflicht A = 670 - 335 = 335 €
      expect(result.parentA.primaryObligation).toBe(335);
      expect(result.parentB.primaryObligation).toBe(-335);

      // Kindergeld-Ausgleich (BGH XII ZB 45/15):
      // 25 % Betreuungsanteil = 64,75 €
      // Quoten-Baranteil = Q_B * 50% KG = 0 * 129,50 € = 0 €
      // Gesamter Ausgleichsanspruch von B gegen A = 64,75 €
      expect(result.parentA.kindergeldAdjustment).toBe(64.75);
      expect(result.parentB.kindergeldAdjustment).toBe(-64.75);

      // Endabrechnung (Spitzabrechnung): 335 € + 64,75 € = 399,75 €
      expect(result.settlement.payer).toBe("parentA");
      expect(result.settlement.amount).toBe(399.75);
    });

    it("setzt Einkommen und Abzüge bei Bürgergeld-Bezug vollständig auf 0,00 € in calculateAdjustedNetIncome", () => {
      const income = {
        erwerbsstatus: "buergergeld" as const,
        grossMonthly: 2000,
        netMonthly: 1500,
        isEmployed: false,
        occupationalExpenses: { useFlatRate: true },
        privatePensionMonthly: 50,
        allowableDebtsMonthly: 100,
        housingAdvantageMonthly: 200,
      };

      const breakdown = calculateAdjustedNetIncome(income, DEFAULT_LEGAL_CONFIG_2026);
      expect(breakdown.rawNet).toBe(0);
      expect(breakdown.grossMonthly).toBe(0);
      expect(breakdown.occupationalExpenses).toBe(0);
      expect(breakdown.cappedPension).toBe(0);
      expect(breakdown.allowableDebts).toBe(0);
      expect(breakdown.housingAdvantage).toBe(0);
      expect(breakdown.deductionsTotal).toBe(0);
      expect(breakdown.adjustedNet).toBe(0);
    });
  });

  describe("Private Krankenversicherung (PKV) für Eltern und Kinder (Ziff. 10.4 OLG-Leitlinien & § 10 Abs. 1 Nr. 3 EStG)", () => {
    it("Testfall 2 (PKV des Kindes als Direktaufwand): Quote A = 60 %, Quote B = 40 %, PKV Kind = 150 €, Zahler = Elternteil A -> B schuldet A 40 % von 150 € = 60 € im Direktkosten-Ausgleich", () => {
      // H_A = 3.250 - 1.750 = 1.500 € (60 %)
      // H_B = 2.750 - 1.750 = 1.000 € (40 %)
      // H_total = 2.500 € -> Q_A = 0.60, Q_B = 0.40
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 4500,
            netMonthly: 3250,
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
            grossMonthly: 3800,
            netMonthly: 2750,
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: {
              wechselmodellSurcharge: 0,
              specialNeeds: 0,
            },
            istPrivatVersichert: true,
            pkvBeitrag: 150,
            pkvZahler: "elternteil1", // Elternteil A zahlt voll
          },
        ],
      };

      const result = calculateWechselmodell(input);

      expect(result.parentA.liabilityShare).toBe(0.6);
      expect(result.parentB.liabilityShare).toBe(0.4);

      // Kindes-PKV Details
      const childRes = result.childrenResults[0];
      expect(childRes.pkvBeitrag).toBe(150);
      expect(childRes.pkvShareParentA).toBe(90); // 60 % von 150 €
      expect(childRes.pkvShareParentB).toBe(60); // 40 % von 150 €
      expect(childRes.pkvPayer).toBe("elternteil1");

      // Direktkosten-Verrechnung:
      // D_A = 150 €, D_B = 0 €
      // ΔD_A = Q_A * D_B - Q_B * D_A = 0.60 * 0 - 0.40 * 150 = -60 €
      // ΔD_B = +60 €
      // -> B schuldet A 60 € im Rahmen der Direktkosten-Verrechnung
      expect(result.parentA.directExpensesDeduction).toBe(-60);
      expect(result.parentB.directExpensesDeduction).toBe(60);
    });

    it("verrechnet PKV des Kindes korrekt, wenn Elternteil B der Zahler ist", () => {
      // Q_A = 0.60, Q_B = 0.40, PKV Kind = 150 €, Zahler = Elternteil B
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 4500,
            netMonthly: 3250,
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
            grossMonthly: 3800,
            netMonthly: 2750,
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
            istPrivatVersichert: true,
            pkvBeitrag: 150,
            pkvZahler: "elternteil2", // Elternteil B zahlt voll
          },
        ],
      };

      const result = calculateWechselmodell(input);

      // D_A = 0 €, D_B = 150 €
      // ΔD_A = Q_A * D_B - Q_B * D_A = 0.60 * 150 - 0.40 * 0 = +90 €
      // ΔD_B = -90 €
      // -> A schuldet B 90 €
      expect(result.parentA.directExpensesDeduction).toBe(90);
      expect(result.parentB.directExpensesDeduction).toBe(-90);
    });

    it("verrechnet PKV des Kindes korrekt, wenn beide Elternteile getrennt/hälftig zahlen", () => {
      // Q_A = 0.60, Q_B = 0.40, PKV Kind = 150 €, Zahler = getrennt (je 75 €)
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 4500,
            netMonthly: 3250,
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
            grossMonthly: 3800,
            netMonthly: 2750,
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
            istPrivatVersichert: true,
            pkvBeitrag: 150,
            pkvZahler: "getrennt", // Hälftig (je 75 €)
          },
        ],
      };

      const result = calculateWechselmodell(input);

      // D_A = 75 €, D_B = 75 €
      // Sollanteil A = 60 % von 150 € = 90 € (hat 75 € gezahlt -> schuldet 15 €)
      // Sollanteil B = 40 % von 150 € = 60 € (hat 75 € gezahlt -> bekommt 15 €)
      // ΔD_A = Q_A * D_B - Q_B * D_A = 0.60 * 75 - 0.40 * 75 = 45 - 30 = +15 €
      // ΔD_B = -15 €
      expect(result.parentA.directExpensesDeduction).toBe(15);
      expect(result.parentB.directExpensesDeduction).toBe(-15);
    });

    it("berücksichtigt Eltern-PKV-Eigenanteil und Kindes-PKV im Zusammenspiel vollumfänglich", () => {
      // Elternteil A: Netto 4.000 €, PKV Basis 700 €, AG-Zuschuss 350 €, Werbungskosten 150 €
      // -> Bereinigtes Netto A = 4.000 - 150 - 350 = 3.500 €
      // H_A = 3.500 - 1.750 = 1.750 €
      // Elternteil B: Netto 3.500 €, GKV, 5%-Pauschale (150 €)
      // -> Bereinigtes Netto B = 3.500 - 150 = 3.350 €
      // H_B = 3.350 - 1.750 = 1.600 €
      // H_ges = 3.350 € -> Q_A = 1750 / 3350 = 0.5224, Q_B = 1600 / 3350 = 0.4776
      // Kind 1: PKV 200 €, Zahler A
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A (PKV)",
          income: {
            grossMonthly: 6000,
            netMonthly: 4000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
            istPrivatVersichert: true,
            pkvBeitragBasis: 700,
            pkvArbeitgeberzuschuss: 350,
            privatePensionMonthly: 0,
            allowableDebtsMonthly: 0,
            housingAdvantageMonthly: 0,
            otherDeductionsMonthly: 0,
          },
          receivesKindergeld: true,
          directExpensesCovered: 50,
        },
        parentB: {
          id: "parentB",
          name: "Elternteil B (GKV)",
          income: {
            grossMonthly: 5000,
            netMonthly: 3500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
            istPrivatVersichert: false,
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
            id: "child-1",
            name: "Kind 1 (PKV)",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
            istPrivatVersichert: true,
            pkvBeitrag: 200,
            pkvZahler: "elternteil1",
          },
        ],
      };

      const result = calculateWechselmodell(input);

      expect(result.parentA.adjustedNet).toBe(3500);
      expect(result.parentA.pkvEigenanteil).toBe(350);
      expect(result.parentB.adjustedNet).toBe(3350);
      expect(result.parentB.pkvEigenanteil).toBe(0);

      // Gesamt-Direktkosten A: 50 € + 200 € = 250 €
      // D_B = 0 €
      // ΔD_A = Q_A * 0 - Q_B * 250 = - (1600/3350) * 250 = -119.40 €
      expect(result.parentA.directExpensesDeduction).toBe(-119.4);
      expect(result.parentB.directExpensesDeduction).toBe(119.4);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST-SUITE: Unterhaltsrechtliches Subsidiaritätsprinzip (§ 1606 Abs. 3 S. 1 BGB)
  // ---------------------------------------------------------------------------
  describe("Subsidiaritätsprinzip & Staatliche Sozialleistungen", () => {
    it("blendet den Hinweistext zu nachrangigen Leistungen bei geringem Einkommen / Mangelfall ein", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 2000,
            netMonthly: 1500,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            grossMonthly: 1800,
            netMonthly: 1300,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "0-5",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);

      expect(result.subsidiarityNotice).toBeDefined();
      expect(result.subsidiarityNotice).toBe(SUBSIDIARITY_NOTICE_TEXT);
      expect(result.subsidiarityNotice).toContain("Kinderzuschlag (§ 6a BKGG)");
      expect(result.subsidiarityNotice).toContain("Wohngeld");
      expect(result.subsidiarityNotice).toContain("BGH XII ZB 512/19");

      // Prüfen, dass der Hinweis auch im Audit-Protokoll erscheint
      const auditEntry = result.auditTrail.find(
        (l) =>
          l.label.includes("Nachrangige Sozialleistungen") ||
          l.label.includes("Subsidiaritätsprinzip")
      );
      expect(auditEntry).toBeDefined();
      expect(auditEntry?.description).toBe(SUBSIDIARITY_NOTICE_TEXT);
    });

    it("blendet den Hinweistext bei Bürgergeld-Bezug ein", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 4000,
            netMonthly: 2800,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            erwerbsstatus: "buergergeld",
            isEmployed: false,
            grossMonthly: 0,
            netMonthly: 0,
            occupationalExpenses: { useFlatRate: true },
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);
      expect(result.subsidiarityNotice).toBe(SUBSIDIARITY_NOTICE_TEXT);
    });

    it("blendet den Hinweistext bei komfortablem Einkommen beider Eltern (> Selbstbehalt) NICHT ein", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 6000,
            netMonthly: 4000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            grossMonthly: 4500,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);
      expect(result.subsidiarityNotice).toBeUndefined();

      const auditEntry = result.auditTrail.find(
        (l) =>
          l.label.includes("Nachrangige Sozialleistungen") ||
          l.label.includes("Subsidiaritätsprinzip")
      );
      expect(auditEntry).toBeUndefined();
    });

    it("stellt sicher, dass nachrangige Fürsorgeleistungen wie Wohngeld (WoGG) nicht den Tabellenbedarf mindern", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 4000,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            grossMonthly: 3000,
            netMonthly: 2200,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);

      // Bereinigtes Netto: A = 3000 - 150 = 2850, B = 2200 - 110 = 2090
      // Kombiniert: 4940 -> DT 2026 Gruppe 9 (849 € für 6-11 Jahre)
      // Tabellenbedarf Kind: 849 € (kein automatischer Abzug von Wohngeld oder unberechtigten Leistungen)
      expect(result.childrenResults[0].tabellenUnterhalt).toBe(849);
      expect(result.childrenResults[0].totalNeed).toBe(849);

      // Nur Kindergeld (259 €) wird zweistufig verrechnet:
      // Betreuungsanteil = 64.75 €, Baranteil = 129.50 €
      expect(result.parentA.kindergeldAdjustment).toBeGreaterThan(0);
      expect(result.settlement.amount).toBeGreaterThan(0);
    });

    it("zieht Kinderzuschlag (§ 6a BKGG) nach BGH XII ZB 512/19 zu 100 % vor der Quotenverteilung vom Gesamtbedarf ab", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 4000,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            grossMonthly: 3000,
            netMonthly: 2200,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "6-11",
            kinderzuschlag: 250, // 250 € Kinderzuschlag nach § 6a BKGG
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);

      // Bereinigtes Netto: A = 2.850 €, B = 2.090 € -> Kombiniert = 4.940 € (DT Gruppe 9)
      // Tabellenbedarf für 6-11 Jahre: 849 €
      const childResult = result.childrenResults[0];
      expect(childResult.tabellenUnterhalt).toBe(849);
      expect(childResult.totalNeed).toBe(849);
      expect(childResult.kinderzuschlag).toBe(250);

      // B_rest = 849 € - 250 € = 599 €
      expect(childResult.reducedNeed).toBe(599);

      // Haftungseinkommen:
      // H_A = 2850 - 1750 = 1100 €
      // H_B = 2090 - 1750 = 340 €
      // H_ges = 1440 €
      // Q_A = 1100 / 1440 = 0.763888... (~76.39 %)
      // Q_B = 340 / 1440 = 0.236111... (~23.61 %)
      const qA = 1100 / 1440;
      const qB = 340 / 1440;

      // Anteile auf Basis von B_rest (599 €):
      const expectedShareA = round2(599 * qA);
      const expectedShareB = round2(599 * qB);
      expect(childResult.shareParentA).toBe(expectedShareA);
      expect(childResult.shareParentB).toBe(expectedShareB);

      // Naturalunterhalt (50 % von 599 €) = 299.50 €
      const naturalShare = round2(599 * 0.5);
      expect(naturalShare).toBe(299.5);

      // Primäre Barunterhaltspflicht: Anteil minus 50 % Naturalunterhalt
      const expectedObligationA = round2(expectedShareA - naturalShare);
      expect(result.parentA.primaryObligation).toBe(expectedObligationA);

      // Audit Trail muss Abzugsschritt enthalten
      const kzStep = result.auditTrail.find((s) =>
        s.label.includes("- Anzurechnendes Einkommen Kind (Kinderzuschlag § 6a BKGG)")
      );
      expect(kzStep).toBeDefined();
      expect(kzStep?.description).toContain("BGH XII ZB 512/19");
      expect(kzStep?.description).toContain("250.00 €");
      expect(kzStep?.description).toContain("599.00 €");
    });

    it("setzt den Restbedarf auf 0 €, wenn der Kinderzuschlag den Gesamtbedarf übersteigt", () => {
      const input: CalculationInput = {
        parentA: {
          id: "parentA",
          name: "Elternteil A",
          income: {
            grossMonthly: 4000,
            netMonthly: 3000,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            grossMonthly: 3000,
            netMonthly: 2200,
            isEmployed: true,
            occupationalExpenses: { useFlatRate: true },
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
            id: "child-1",
            name: "Kind 1",
            ageGroup: "0-5",
            kinderzuschlag: 1000, // Kinderzuschlag übersteigt Tabellenbedarf (725 €)
            additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
          },
        ],
      };

      const result = calculateWechselmodell(input);
      const childResult = result.childrenResults[0];
      expect(childResult.totalNeed).toBe(739);
      expect(childResult.reducedNeed).toBe(0);
      expect(childResult.shareParentA).toBe(0);
      expect(childResult.shareParentB).toBe(0);
      expect(result.parentA.primaryObligation).toBe(0);
      expect(result.parentB.primaryObligation).toBe(0);
    });
  });
});
