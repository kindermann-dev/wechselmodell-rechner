import type { AgeGroup, LegalConfig } from './config';

export interface IncomeBreakdown {
  // Annual amounts (Jahreseinkommen including bonuses, holiday/Christmas pay, tax refunds)
  grossAnnual?: number;
  netAnnual?: number;
  annualBonusGross?: number;
  annualBonusNet?: number;

  // Monthly amounts (or automatically derived from annual / 12)
  grossMonthly?: number;
  netMonthly?: number;

  isEmployed: boolean;
  occupationalExpenses: {
    useFlatRate: boolean;
    customAmount?: number;
    customAnnualAmount?: number;
  };
  privatePensionMonthly?: number;
  privatePensionAnnual?: number;
  allowableDebtsMonthly?: number;
  allowableDebtsAnnual?: number;
  housingAdvantageMonthly?: number;
  housingAdvantageAnnual?: number;
  otherDeductionsMonthly?: number;
  otherDeductionsAnnual?: number;
}

export interface ParentInput {
  id: 'parentA' | 'parentB';
  name: string;
  income: IncomeBreakdown;
  receivesKindergeld: boolean;
  directExpensesCovered: number; // Monthly direct payments for child expenses
  directExpensesCoveredAnnual?: number; // Annual direct payments (will be converted / 12)
  housingCosts?: {
    warmRentMonthly?: number;  // Actual warm rent (Tatsächliche Warmmiete) of household (€/month)
    householdPersons?: number; // Number of persons in household (Kopfzahl-Methode, including children)
  };
}

export interface ChildInput {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  additionalNeeds: {
    wechselmodellSurcharge: number; // Mehrbedarf (housing/travel, typically ~20% of base)
    specialNeeds: number;           // Sonderbedarf (regular therapies, private school)
  };
}

export interface CalculationInput {
  parentA: ParentInput;
  parentB: ParentInput;
  children: ChildInput[];
  config?: LegalConfig; // Falls back to default 2026 config if omitted
}
