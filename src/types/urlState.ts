import type { AgeGroup } from "./config";
import type { EmploymentStatus, HousingCostMode, PkvPayer, ChildInput } from "./input";

/**
 * Vollständiger Anwendungszustand aller Eingabefelder zur Berechnung des Wechselmodells.
 */
export interface AppInputState {
  scenario: string;
  housingCostMode?: HousingCostMode;
  kindergeldPerChild: number;
  parentA: {
    name: string;
    erwerbsstatus: EmploymentStatus;
    grossAnnual: number;
    netAnnual: number;
    annualBonusNet: number;
    isEmployed: boolean;
    useFlatRate: boolean;
    customAnnualExpense: number;
    pensionAnnual: number;
    istPrivatVersichert: boolean;
    pkvBeitragBasisAnnual: number;
    pkvArbeitgeberzuschussAnnual: number;
    housingAnnual: number;
    debtsAnnual: number;
    warmRentMonthly: number;
    householdPersons: number;
    directExpensesAnnual: number;
    receivesKindergeld: boolean;
  };
  parentB: {
    name: string;
    erwerbsstatus: EmploymentStatus;
    grossAnnual: number;
    netAnnual: number;
    annualBonusNet: number;
    isEmployed: boolean;
    useFlatRate: boolean;
    customAnnualExpense: number;
    pensionAnnual: number;
    istPrivatVersichert: boolean;
    pkvBeitragBasisAnnual: number;
    pkvArbeitgeberzuschussAnnual: number;
    housingAnnual: number;
    debtsAnnual: number;
    warmRentMonthly: number;
    householdPersons: number;
    directExpensesAnnual: number;
  };
  children: ChildInput[];
}

/**
 * Kompaktes Schema V1 für URL-Serialisierung mit minimaler Payload-Größe.
 */
export interface UrlStateV1 {
  v: 1; // Schema-Versionierung für Migrationsfähigkeit
  s?: string; // currentScenario
  hcm?: "none" | "pk" | "rpc"; // housingCostMode ('none' | 'pk' = 'pro-kopf' | 'rpc' = 'real-per-child')
  kg?: number; // kindergeldPerChild
  pA?: {
    n?: string; // Name
    es?: EmploymentStatus; // Erwerbsstatus
    ga?: number; // grossAnnual
    na?: number; // netAnnual
    bn?: number; // annualBonusNet
    emp?: boolean; // isEmployed
    fr?: boolean; // useFlatRate
    cae?: number; // customAnnualExpense
    pa?: number; // pensionAnnual
    pkv?: boolean; // istPrivatVersichert
    pkb?: number; // pkvBeitragBasisAnnual
    pka?: number; // pkvArbeitgeberzuschussAnnual
    ha?: number; // housingAnnual
    da?: number; // debtsAnnual
    wr?: number; // warmRentMonthly
    hp?: number; // householdPersons
    dea?: number; // directExpensesAnnual
    rkg?: boolean; // receivesKindergeld
  };
  pB?: {
    n?: string;
    es?: EmploymentStatus;
    ga?: number;
    na?: number;
    bn?: number;
    emp?: boolean;
    fr?: boolean;
    cae?: number;
    pa?: number;
    pkv?: boolean;
    pkb?: number;
    pka?: number;
    ha?: number;
    da?: number;
    wr?: number;
    hp?: number;
    dea?: number;
  };
  ch?: Array<{
    id?: string;
    n?: string;
    ag: AgeGroup;
    kz?: number;
    ws?: number;
    sn?: number;
    pkv?: boolean;
    pkb?: number;
    pkz?: PkvPayer;
    rca?: number; // realHousingCostParentA (Methode 2)
    rcb?: number; // realHousingCostParentB (Methode 2)
  }>;
}

export type SerializedUrlState = UrlStateV1;
