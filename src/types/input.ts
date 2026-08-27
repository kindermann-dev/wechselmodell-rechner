import type { AgeGroup, LegalConfig } from "./config";

export type EmploymentStatus = "erwerbstaetig" | "buergergeld";

export type PkvPayer =
  "elternteil1" | "elternteil2" | "getrennt" | "parentA" | "parentB" | "haelftig";

export interface IncomeBreakdown {
  // Erwerbsstatus
  erwerbsstatus?: EmploymentStatus;
  isEmployed: boolean;

  // Jahresbeträge (Jahreseinkommen inkl. Boni, Urlaubs-/Weihnachtsgeld, Steuererstattungen)
  grossAnnual?: number;
  netAnnual?: number;
  annualBonusGross?: number;
  annualBonusNet?: number;

  // Monatsbeträge (oder automatisch abgeleitet aus Jahresbetrag / 12)
  grossMonthly?: number;
  netMonthly?: number;
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

  // Private Kranken- und Pflegeversicherung (PKV/PPV) Elternteil (§ 10 Abs. 1 Nr. 3 EStG / Ziff. 10.4 OLG-Leitlinien)
  istPrivatVersichert?: boolean;
  pkvBeitragBasis?: number; // Monatsbeitrag für die Basisabsicherung inkl. Pflegepflichtversicherung
  pkvBeitragBasisAnnual?: number; // Jährlicher Basisbeitrag
  pkvArbeitgeberzuschuss?: number; // Steuerfreier Zuschuss des Arbeitgebers oder Beihilfe (€/Monat)
  pkvArbeitgeberzuschussAnnual?: number; // Jährlicher Arbeitgeberzuschuss
}

export interface ParentInput {
  id: "parentA" | "parentB";
  name: string;
  income: IncomeBreakdown;
  receivesKindergeld: boolean;
  directExpensesCovered: number; // Monatliche Direktzahlungen für Kindesaufwendungen
  directExpensesCoveredAnnual?: number; // Jährliche Direktzahlungen (wird durch 12 geteilt)
  housingCosts?: {
    warmRentMonthly?: number; // Tatsächliche Warmmiete des Haushalts (€/Monat)
    householdPersons?: number; // Personenanzahl im Haushalt (Kopfzahl-Methode, inkl. Kinder)
  };
}

export interface ChildInput {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  kinderzuschlag?: number; // Monatlich real zufließender Kinderzuschlag nach § 6a BKGG (BGH XII ZB 512/19)
  additionalNeeds: {
    wechselmodellSurcharge: number; // Mehrbedarf (Wohn-/Fahrtkosten, typischerweise ~20 % des Grundbedarfs)
    specialNeeds: number; // Sonderbedarf (regelmäßige Therapien, Privatschule etc.)
  };
  // Private Kranken- und Pflegeversicherung (PKV) des Kindes (Mehrbedarf nach Ziff. 10.4 OLG-Leitlinien)
  istPrivatVersichert?: boolean;
  pkvBeitrag?: number; // Monatlicher PKV-Beitrag des Kindes (Mehrbedarf)
  pkvZahler?: PkvPayer; // 'elternteil1' | 'elternteil2' | 'getrennt' (Default: 'elternteil1')
}

export interface CalculationInput {
  parentA: ParentInput;
  parentB: ParentInput;
  children: ChildInput[];
  config?: LegalConfig; // Fallback auf Standard-Konfiguration 2026, falls nicht angegeben
}
