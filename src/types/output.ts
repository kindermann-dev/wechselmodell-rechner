import type { AgeGroup, DtIncomeTier } from './config';

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
  selfRetentionApplied: number;
  liabilityIncome: number;
  liabilityShare: number;         // Quota (0.0000 to 1.0000)
  primaryObligation: number;      // Tabular share before deductions
  directExpensesDeduction: number;
  kindergeldAdjustment: number;   // Positive or negative offset based on recipient
  netPayment: number;             // > 0: owes payment, < 0: receives payment
  remainingIncome: number;        // adjustedNet - netPayment
  isBelowRetention: boolean;      // Mangelfall warning
}

export interface ChildCalculationResult {
  childId: string;
  ageGroup: AgeGroup;
  tabellenUnterhalt: number;
  housingNeedCalculated?: number;    // Actual housing need of the child (Warmmiete A / Pers A + Warmmiete B / Pers B)
  housingPortionInTable?: number;    // 20% housing portion included in Tabellenbedarf (20% * B_tab)
  calculatedWohnmehrbedarf?: number; // Real housing extra need (Realkosten-Wohnmehrbedarf) = max(0, actual housing need - 20% * B_tab)
  additionalNeedsTotal: number;
  totalNeed: number;
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
    payer: 'parentA' | 'parentB' | 'balanced';
    amount: number; // Absolute amount to be transferred
  };
  auditTrail: CalculationStepLog[];
}
