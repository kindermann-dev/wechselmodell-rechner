import type { AgeGroup, LegalConfig } from "./config";

export type EmploymentStatus = "erwerbstaetig" | "buergergeld";

export type PkvPayer =
  "elternteil1" | "elternteil2" | "getrennt" | "parentA" | "parentB" | "haelftig";

/**
 * Berechnungsmodus für den Wohnmehrbedarf im Wechselmodell:
 * - 'none': Kein Wohnmehrbedarf (Regelfall / Ohne Wohnaufschlag)
 * - 'pro-kopf': Methode 1: Pauschale Ermittlung aus Haushalts-Warmmieten geteilt durch Kopfzahl
 * - 'real-per-child': Methode 2: Konkrete Wohnkosten je Kind und Elternteil (z. B. nach Quadratmetern / Einzelnachweis)
 */
export type HousingCostMode = "none" | "pro-kopf" | "real-per-child";

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
    warmRentMonthly?: number; // Tatsächliche Warmmiete des Haushalts (€/Monat, Methode 1)
    householdPersons?: number; // Personenanzahl im Haushalt (Kopfzahl-Methode, inkl. Kinder, Methode 1)
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
  // Reale monatliche Wohnkosten des Kindes je Elternteil (Methode 2: Konkrete Wohnkosten / Quadratmeter-Methode)
  realHousingCostParentA?: number; // Monatliche reale Wohnkosten bei Elternteil A (€/Monat)
  realHousingCostParentB?: number; // Monatliche reale Wohnkosten bei Elternteil B (€/Monat)
}

export interface CalculationInput {
  parentA: ParentInput;
  parentB: ParentInput;
  children: ChildInput[];
  config?: LegalConfig; // Fallback auf Standard-Konfiguration 2026, falls nicht angegeben
  housingCostMode?: HousingCostMode; // Berechnungsmodus für den Wohnmehrbedarf ('none' | 'pro-kopf' | 'real-per-child')
}
