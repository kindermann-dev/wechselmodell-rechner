import type { AgeGroup, DtIncomeTier } from "./config";
import type { HousingCostMode, PkvPayer } from "./input";

export interface CalculationStepLog {
  stepNumber: number;
  label: string;
  formula: string;
  description: string;
  value: number | string;
}

export interface ParentCalculationDetails {
  rawNet: number;
  adjustedNet: number;
  deductionsTotal: number;
  pkvEigenanteil?: number; // Abzugsfähiger PKV-Eigenanteil (§ 10 Abs. 1 Nr. 3 EStG)
  selfRetentionApplied: number;
  liabilityIncome: number;
  liabilityShare: number; // Quote (0.0000 bis 1.0000)
  primaryObligation: number; // Tabellarischer Anteil vor Abzügen
  directExpensesDeduction: number;
  kindergeldAdjustment: number; // Positiver oder negativer Ausgleich abhängig vom Bezieher
  netPayment: number; // > 0: zahlt Ausgleich, < 0: empfängt Ausgleich
  remainingIncome: number; // adjustedNet - netPayment
  isBelowRetention: boolean; // Mangelfall-Warnung (Unterschreitung des Selbstbehalts)
  isBuergergeld?: boolean; // Bürgergeld-Bezug aktiv
}

export interface ChildCalculationResult {
  childId: string;
  ageGroup: AgeGroup;
  tabellenUnterhalt: number;
  housingCostMode?: HousingCostMode; // Aktiver Berechnungsmodus ('none' | 'pro-kopf' | 'real-per-child')
  housingNeedCalculated?: number; // Tatsächlicher Wohnbedarf des Kindes (Warmmiete A / Pers A + Warmmiete B / Pers B bzw. Summe realer Wohnkosten)
  housingPortionInTable?: number; // 20% im Tabellenbedarf enthaltener Wohnanteil (20 % * B_tab)
  calculatedWohnmehrbedarf?: number; // Realkosten-Wohnmehrbedarf = max(0, tatsächlicher Wohnbedarf - 20 % * B_tab)
  childHousingA?: number; // Tatsächlicher Wohnaufwand des Kindes bei Elternteil A
  childHousingB?: number; // Tatsächlicher Wohnaufwand des Kindes bei Elternteil B
  pkvBeitrag?: number; // Monatlicher PKV-Beitrag des Kindes (Mehrbedarf)
  pkvShareParentA?: number; // Quotenanteil Elternteil A
  pkvShareParentB?: number; // Quotenanteil Elternteil B
  pkvPayer?: PkvPayer; // Wer die PKV des Kindes verauslagt
  additionalNeedsTotal: number;
  totalNeed: number;
  kinderzuschlag?: number; // Monatlich angerechneter Kinderzuschlag nach § 6a BKGG (BGH XII ZB 512/19)
  reducedNeed?: number; // Verbleibender Restbedarf nach 100% Kinderzuschlag-Abzug (B_rest = max(0, B_ges - Kinderzuschlag))
  shareParentA: number;
  shareParentB: number;
}

export interface CalculationResult {
  combinedAdjustedNet: number;
  appliedDtTier: DtIncomeTier;
  childrenResults: ChildCalculationResult[];
  parentA: ParentCalculationDetails;
  parentB: ParentCalculationDetails;
  settlement: {
    payer: "parentA" | "parentB" | "balanced";
    amount: number; // Absoluter Ausgleichszahlungsbetrag
  };
  auditTrail: CalculationStepLog[];
  hasBuergergeldRecipient?: boolean;
  buergergeldHinweise?: string[];
  subsidiarityNotice?: string;
}
