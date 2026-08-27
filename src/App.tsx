import { useMemo, useState, useEffect, useCallback } from "react";
import { calculateWechselmodell } from "./calculator/custodyEngine";
import { DEFAULT_LEGAL_CONFIG_2026 } from "./config/dtTable2026";
import { LEGAL_NOTICES } from "./config/legalTexts";
import {
  ActionBar,
  AuditTrailList,
  CalculationSummary,
  ChildrenInputCard,
  DetailsTable,
  FaqSection,
  Footer,
  Header,
  ParentInputCard,
  SettlementBanner,
  LegalModal,
  type LegalTab,
  ChangelogModal,
} from "./components";
import type { CalculationInput, ChildInput, EmploymentStatus } from "./types/input";

export default function App() {
  // Zustand für Impressum/Datenschutz-Modal & Deep-Linking
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);
  // Zustand für Changelog-Modal & Deep-Linking (#changelog)
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);

  // URL-Hash mit den Modal-Zuständen für Deep-Links synchronisieren
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#impressum") {
        setLegalModalTab("impressum");
        setIsChangelogOpen(false);
      } else if (hash === "#datenschutz") {
        setLegalModalTab("datenschutz");
        setIsChangelogOpen(false);
      } else if (hash === "#changelog" || hash === "#version" || hash === "#versions") {
        setLegalModalTab(null);
        setIsChangelogOpen(true);
      } else if (!hash || hash === "#") {
        setLegalModalTab(null);
        setIsChangelogOpen(false);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleOpenLegal = useCallback((tab: LegalTab) => {
    setIsChangelogOpen(false);
    setLegalModalTab(tab);
    window.location.hash = tab;
  }, []);

  const handleCloseLegal = useCallback(() => {
    setLegalModalTab(null);
    if (window.location.hash === "#impressum" || window.location.hash === "#datenschutz") {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const handleOpenChangelog = useCallback(() => {
    setLegalModalTab(null);
    setIsChangelogOpen(true);
    window.location.hash = "changelog";
  }, []);

  const handleCloseChangelog = useCallback(() => {
    setIsChangelogOpen(false);
    if (
      window.location.hash === "#changelog" ||
      window.location.hash === "#version" ||
      window.location.hash === "#versions"
    ) {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // Zustand der Navigations-Tabs
  const [activeInputTab, setActiveInputTab] = useState<"parentA" | "parentB" | "children">(
    "parentA"
  );
  const [activeResultTab, setActiveResultTab] = useState<"table" | "audit">("table");
  const [currentScenario, setCurrentScenario] = useState<string>("bgh-standard");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Jahres-Zustand Elternteil A
  const [parentAName, setParentAName] = useState("Elternteil A");
  const [parentAErwerbsstatus, setParentAErwerbsstatus] =
    useState<EmploymentStatus>("erwerbstaetig");
  const [parentAGrossAnnual, setParentAGrossAnnual] = useState<number>(48000);
  const [parentANetAnnual, setParentANetAnnual] = useState<number>(36000);
  const [parentABonusNet, setParentABonusNet] = useState<number>(0);
  const [parentAEmployed, setParentAEmployed] = useState<boolean>(true);
  const [parentAUseFlatRate, setParentAUseFlatRate] = useState<boolean>(true);
  const [parentACustomAnnualExpense, setParentACustomAnnualExpense] = useState<number>(0);
  const [parentAPensionAnnual, setParentAPensionAnnual] = useState<number>(1200);
  const [parentAIstPrivatVersichert, setParentAIstPrivatVersichert] = useState<boolean>(false);
  const [parentAPkvBeitragBasisAnnual, setParentAPkvBeitragBasisAnnual] = useState<number>(0);
  const [parentAPkvArbeitgeberzuschussAnnual, setParentAPkvArbeitgeberzuschussAnnual] =
    useState<number>(0);
  const [parentAHousingAnnual, setParentAHousingAnnual] = useState<number>(0);
  const [parentADebtsAnnual, setParentADebtsAnnual] = useState<number>(0);
  const [parentAWarmRent, setParentAWarmRent] = useState<number>(0);
  const [parentAHouseholdPersons, setParentAHouseholdPersons] = useState<number>(2);
  const [parentAExpensesAnnual, setParentAExpensesAnnual] = useState<number>(0);
  const [parentAReceivesKg, setParentAReceivesKg] = useState<boolean>(true);

  // Jahres-Zustand Elternteil B
  const [parentBName, setParentBName] = useState("Elternteil B");
  const [parentBErwerbsstatus, setParentBErwerbsstatus] =
    useState<EmploymentStatus>("erwerbstaetig");
  const [parentBGrossAnnual, setParentBGrossAnnual] = useState<number>(36000);
  const [parentBNetAnnual, setParentBNetAnnual] = useState<number>(26400);
  const [parentBBonusNet, setParentBBonusNet] = useState<number>(0);
  const [parentBEmployed, setParentBEmployed] = useState<boolean>(true);
  const [parentBUseFlatRate, setParentBUseFlatRate] = useState<boolean>(true);
  const [parentBCustomAnnualExpense, setParentBCustomAnnualExpense] = useState<number>(0);
  const [parentBPensionAnnual, setParentBPensionAnnual] = useState<number>(0);
  const [parentBIstPrivatVersichert, setParentBIstPrivatVersichert] = useState<boolean>(false);
  const [parentBPkvBeitragBasisAnnual, setParentBPkvBeitragBasisAnnual] = useState<number>(0);
  const [parentBPkvArbeitgeberzuschussAnnual, setParentBPkvArbeitgeberzuschussAnnual] =
    useState<number>(0);
  const [parentBHousingAnnual, setParentBHousingAnnual] = useState<number>(0);
  const [parentBDebtsAnnual, setParentBDebtsAnnual] = useState<number>(0);
  const [parentBWarmRent, setParentBWarmRent] = useState<number>(0);
  const [parentBHouseholdPersons, setParentBHouseholdPersons] = useState<number>(2);
  const [parentBExpensesAnnual, setParentBExpensesAnnual] = useState<number>(0);
  const [kindergeldPerChild, setKindergeldPerChild] = useState<number>(
    DEFAULT_LEGAL_CONFIG_2026.kindergeldPerChild
  );

  const [children, setChildren] = useState<ChildInput[]>([
    {
      id: "child-1",
      name: "Kind 1",
      ageGroup: "6-11",
      additionalNeeds: {
        wechselmodellSurcharge: 0,
        specialNeeds: 0,
      },
    },
  ]);

  const loadScenario = (scenarioId: string) => {
    setCurrentScenario(scenarioId);
    setKindergeldPerChild(DEFAULT_LEGAL_CONFIG_2026.kindergeldPerChild);

    if (scenarioId === "bgh-standard") {
      setParentAName("Elternteil A");
      setParentAErwerbsstatus("erwerbstaetig");
      setParentAGrossAnnual(48000);
      setParentANetAnnual(36000);
      setParentABonusNet(0);
      setParentAEmployed(true);
      setParentAUseFlatRate(true);
      setParentACustomAnnualExpense(0);
      setParentAPensionAnnual(1200);
      setParentAIstPrivatVersichert(false);
      setParentAPkvBeitragBasisAnnual(0);
      setParentAPkvArbeitgeberzuschussAnnual(0);
      setParentAHousingAnnual(0);
      setParentADebtsAnnual(0);
      setParentAWarmRent(0);
      setParentAHouseholdPersons(2);
      setParentAExpensesAnnual(0);
      setParentAReceivesKg(true);

      setParentBName("Elternteil B");
      setParentBErwerbsstatus("erwerbstaetig");
      setParentBGrossAnnual(36000);
      setParentBNetAnnual(26400);
      setParentBBonusNet(0);
      setParentBEmployed(true);
      setParentBUseFlatRate(true);
      setParentBCustomAnnualExpense(0);
      setParentBPensionAnnual(0);
      setParentBIstPrivatVersichert(false);
      setParentBPkvBeitragBasisAnnual(0);
      setParentBPkvArbeitgeberzuschussAnnual(0);
      setParentBHousingAnnual(0);
      setParentBDebtsAnnual(0);
      setParentBWarmRent(0);
      setParentBHouseholdPersons(2);
      setParentBExpensesAnnual(0);

      setChildren([
        {
          id: "child-1",
          name: "Kind 1",
          ageGroup: "6-11",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ]);
    } else if (scenarioId === "mehrkind-housing") {
      setParentAName("Elternteil A");
      setParentAErwerbsstatus("erwerbstaetig");
      setParentAGrossAnnual(60000);
      setParentANetAnnual(42000);
      setParentABonusNet(0);
      setParentAEmployed(true);
      setParentAUseFlatRate(true);
      setParentACustomAnnualExpense(0);
      setParentAPensionAnnual(1800);
      setParentAIstPrivatVersichert(false);
      setParentAPkvBeitragBasisAnnual(0);
      setParentAPkvArbeitgeberzuschussAnnual(0);
      setParentAHousingAnnual(0);
      setParentADebtsAnnual(0);
      setParentAWarmRent(1400);
      setParentAHouseholdPersons(3);
      setParentAExpensesAnnual(600);
      setParentAReceivesKg(true);

      setParentBName("Elternteil B");
      setParentBErwerbsstatus("erwerbstaetig");
      setParentBGrossAnnual(40000);
      setParentBNetAnnual(28000);
      setParentBBonusNet(0);
      setParentBEmployed(true);
      setParentBUseFlatRate(true);
      setParentBCustomAnnualExpense(0);
      setParentBPensionAnnual(0);
      setParentBIstPrivatVersichert(false);
      setParentBPkvBeitragBasisAnnual(0);
      setParentBPkvArbeitgeberzuschussAnnual(0);
      setParentBHousingAnnual(0);
      setParentBDebtsAnnual(0);
      setParentBWarmRent(1100);
      setParentBHouseholdPersons(3);
      setParentBExpensesAnnual(0);

      setChildren([
        {
          id: "child-1",
          name: "Kind 1 (Schulkind)",
          ageGroup: "6-11",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
        {
          id: "child-2",
          name: "Kind 2 (Teenager)",
          ageGroup: "12-17",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ]);
    } else if (scenarioId === "mangelfall") {
      setParentAName("Elternteil A");
      setParentAErwerbsstatus("erwerbstaetig");
      setParentAGrossAnnual(24000);
      setParentANetAnnual(18000);
      setParentABonusNet(0);
      setParentAEmployed(true);
      setParentAUseFlatRate(true);
      setParentACustomAnnualExpense(0);
      setParentAPensionAnnual(0);
      setParentAIstPrivatVersichert(false);
      setParentAPkvBeitragBasisAnnual(0);
      setParentAPkvArbeitgeberzuschussAnnual(0);
      setParentAHousingAnnual(0);
      setParentADebtsAnnual(0);
      setParentAWarmRent(650);
      setParentAHouseholdPersons(2);
      setParentAExpensesAnnual(0);
      setParentAReceivesKg(true);

      setParentBName("Elternteil B");
      setParentBErwerbsstatus("erwerbstaetig");
      setParentBGrossAnnual(20000);
      setParentBNetAnnual(15600);
      setParentBBonusNet(0);
      setParentBEmployed(true);
      setParentBUseFlatRate(true);
      setParentBCustomAnnualExpense(0);
      setParentBPensionAnnual(0);
      setParentBIstPrivatVersichert(false);
      setParentBPkvBeitragBasisAnnual(0);
      setParentBPkvArbeitgeberzuschussAnnual(0);
      setParentBHousingAnnual(0);
      setParentBDebtsAnnual(0);
      setParentBWarmRent(600);
      setParentBHouseholdPersons(2);
      setParentBExpensesAnnual(0);

      setChildren([
        {
          id: "child-1",
          name: "Kind 1 (Kleinkind)",
          ageGroup: "0-5",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ]);
    } else if (scenarioId === "high-income") {
      setParentAName("Elternteil A");
      setParentAErwerbsstatus("erwerbstaetig");
      setParentAGrossAnnual(120000);
      setParentANetAnnual(72000);
      setParentABonusNet(12000);
      setParentAEmployed(true);
      setParentAUseFlatRate(true);
      setParentACustomAnnualExpense(0);
      setParentAPensionAnnual(4800);
      setParentAIstPrivatVersichert(false);
      setParentAPkvBeitragBasisAnnual(0);
      setParentAPkvArbeitgeberzuschussAnnual(0);
      setParentAHousingAnnual(0);
      setParentADebtsAnnual(0);
      setParentAWarmRent(1800);
      setParentAHouseholdPersons(3);
      setParentAExpensesAnnual(2400);
      setParentAReceivesKg(true);

      setParentBName("Elternteil B");
      setParentBErwerbsstatus("erwerbstaetig");
      setParentBGrossAnnual(60000);
      setParentBNetAnnual(40000);
      setParentBBonusNet(0);
      setParentBEmployed(true);
      setParentBUseFlatRate(true);
      setParentBCustomAnnualExpense(0);
      setParentBPensionAnnual(1200);
      setParentBIstPrivatVersichert(false);
      setParentBPkvBeitragBasisAnnual(0);
      setParentBPkvArbeitgeberzuschussAnnual(0);
      setParentBHousingAnnual(0);
      setParentBDebtsAnnual(0);
      setParentBWarmRent(1300);
      setParentBHouseholdPersons(3);
      setParentBExpensesAnnual(0);

      setChildren([
        {
          id: "child-1",
          name: "Kind 1 (Jugendlich)",
          ageGroup: "12-17",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
        {
          id: "child-2",
          name: "Kind 2 (Volljährig)",
          ageGroup: "18+",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ]);
    } else if (scenarioId === "buergergeld") {
      setParentAName("Elternteil A (Erwerbstätig)");
      setParentAErwerbsstatus("erwerbstaetig");
      setParentAGrossAnnual(56000);
      setParentANetAnnual(42000);
      setParentABonusNet(0);
      setParentAEmployed(true);
      setParentAUseFlatRate(true);
      setParentACustomAnnualExpense(0);
      setParentAPensionAnnual(1400);
      setParentAIstPrivatVersichert(false);
      setParentAPkvBeitragBasisAnnual(0);
      setParentAPkvArbeitgeberzuschussAnnual(0);
      setParentAHousingAnnual(0);
      setParentADebtsAnnual(0);
      setParentAWarmRent(1200);
      setParentAHouseholdPersons(2);
      setParentAExpensesAnnual(0);
      setParentAReceivesKg(true);

      setParentBName("Elternteil B (Bürgergeld)");
      setParentBErwerbsstatus("buergergeld");
      setParentBGrossAnnual(0);
      setParentBNetAnnual(0);
      setParentBBonusNet(0);
      setParentBEmployed(false);
      setParentBUseFlatRate(true);
      setParentBCustomAnnualExpense(0);
      setParentBPensionAnnual(0);
      setParentBIstPrivatVersichert(false);
      setParentBPkvBeitragBasisAnnual(0);
      setParentBPkvArbeitgeberzuschussAnnual(0);
      setParentBHousingAnnual(0);
      setParentBDebtsAnnual(0);
      setParentBWarmRent(0);
      setParentBHouseholdPersons(2);
      setParentBExpensesAnnual(0);

      setChildren([
        {
          id: "child-1",
          name: "Kind 1",
          ageGroup: "6-11",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ]);
    }
  };

  const handleReset = () => {
    loadScenario("bgh-standard");
  };

  const handlePrint = () => {
    window.print();
  };

  const calculationInput: CalculationInput = useMemo(() => {
    return {
      parentA: {
        id: "parentA",
        name: parentAName,
        income: {
          erwerbsstatus: parentAErwerbsstatus,
          grossAnnual: Number(parentAGrossAnnual) || 0,
          netAnnual: Number(parentANetAnnual) || 0,
          annualBonusNet: Number(parentABonusNet) || 0,
          isEmployed: parentAEmployed && parentAErwerbsstatus !== "buergergeld",
          occupationalExpenses: {
            useFlatRate: parentAUseFlatRate,
            customAnnualAmount: Number(parentACustomAnnualExpense) || 0,
          },
          privatePensionAnnual: Number(parentAPensionAnnual) || 0,
          istPrivatVersichert: parentAIstPrivatVersichert && parentAErwerbsstatus !== "buergergeld",
          pkvBeitragBasisAnnual: Number(parentAPkvBeitragBasisAnnual) || 0,
          pkvArbeitgeberzuschussAnnual: Number(parentAPkvArbeitgeberzuschussAnnual) || 0,
          housingAdvantageAnnual: Number(parentAHousingAnnual) || 0,
          allowableDebtsAnnual: Number(parentADebtsAnnual) || 0,
          otherDeductionsAnnual: 0,
        },
        housingCosts: {
          warmRentMonthly: Number(parentAWarmRent) || 0,
          householdPersons: Number(parentAHouseholdPersons) || 1,
        },
        receivesKindergeld: parentAReceivesKg,
        directExpensesCovered: 0,
        directExpensesCoveredAnnual: Number(parentAExpensesAnnual) || 0,
      },
      parentB: {
        id: "parentB",
        name: parentBName,
        income: {
          erwerbsstatus: parentBErwerbsstatus,
          grossAnnual: Number(parentBGrossAnnual) || 0,
          netAnnual: Number(parentBNetAnnual) || 0,
          annualBonusNet: Number(parentBBonusNet) || 0,
          isEmployed: parentBEmployed && parentBErwerbsstatus !== "buergergeld",
          occupationalExpenses: {
            useFlatRate: parentBUseFlatRate,
            customAnnualAmount: Number(parentBCustomAnnualExpense) || 0,
          },
          privatePensionAnnual: Number(parentBPensionAnnual) || 0,
          istPrivatVersichert: parentBIstPrivatVersichert && parentBErwerbsstatus !== "buergergeld",
          pkvBeitragBasisAnnual: Number(parentBPkvBeitragBasisAnnual) || 0,
          pkvArbeitgeberzuschussAnnual: Number(parentBPkvArbeitgeberzuschussAnnual) || 0,
          housingAdvantageAnnual: Number(parentBHousingAnnual) || 0,
          allowableDebtsAnnual: Number(parentBDebtsAnnual) || 0,
          otherDeductionsAnnual: 0,
        },
        housingCosts: {
          warmRentMonthly: Number(parentBWarmRent) || 0,
          householdPersons: Number(parentBHouseholdPersons) || 1,
        },
        receivesKindergeld: !parentAReceivesKg,
        directExpensesCovered: 0,
        directExpensesCoveredAnnual: Number(parentBExpensesAnnual) || 0,
      },
      children,
      config: {
        ...DEFAULT_LEGAL_CONFIG_2026,
        kindergeldPerChild: Number(kindergeldPerChild) || 0,
      },
    };
  }, [
    parentAName,
    parentAErwerbsstatus,
    parentAGrossAnnual,
    parentANetAnnual,
    parentABonusNet,
    parentAEmployed,
    parentAUseFlatRate,
    parentACustomAnnualExpense,
    parentAPensionAnnual,
    parentAIstPrivatVersichert,
    parentAPkvBeitragBasisAnnual,
    parentAPkvArbeitgeberzuschussAnnual,
    parentAHousingAnnual,
    parentADebtsAnnual,
    parentAWarmRent,
    parentAHouseholdPersons,
    parentAExpensesAnnual,
    parentAReceivesKg,
    parentBName,
    parentBErwerbsstatus,
    parentBGrossAnnual,
    parentBNetAnnual,
    parentBBonusNet,
    parentBEmployed,
    parentBUseFlatRate,
    parentBCustomAnnualExpense,
    parentBPensionAnnual,
    parentBIstPrivatVersichert,
    parentBPkvBeitragBasisAnnual,
    parentBPkvArbeitgeberzuschussAnnual,
    parentBHousingAnnual,
    parentBDebtsAnnual,
    parentBWarmRent,
    parentBHouseholdPersons,
    parentBExpensesAnnual,
    kindergeldPerChild,
    children,
  ]);

  const result = useMemo(() => {
    return calculateWechselmodell(calculationInput);
  }, [calculationInput]);

  const handleCopySummary = () => {
    const payerText =
      result.settlement.payer === "balanced"
        ? "Keine Ausgleichszahlung erforderlich (vollständig ausgeglichen: 0,00 €)"
        : result.settlement.payer === "parentA"
          ? `${parentAName} zahlt an ${parentBName}`
          : `${parentBName} zahlt an ${parentAName}`;

    const childrenSummary = result.childrenResults
      .map(
        (c, i) =>
          `  - Kind ${i + 1} (Altersstufe ${c.ageGroup}): Tabellenbedarf ${c.tabellenUnterhalt.toFixed(2)} €${
            c.calculatedWohnmehrbedarf && c.calculatedWohnmehrbedarf > 0
              ? ` + Wohnmehrbedarf ${c.calculatedWohnmehrbedarf.toFixed(2)} €`
              : ""
          } = Gesamtbedarf ${c.totalNeed.toFixed(2)} € / Monat`
      )
      .join("\n");

    const text = `=====================================================
KINDESUNTERHALT WECHSELMODELL (50:50) - ERGEBNIS
=====================================================
👉 ZAHLUNGSANSPRUCH: ${result.settlement.amount.toFixed(2)} € / Monat
👉 AUSGLEICHSRICHTUNG: ${payerText}
=====================================================
Rechtsgrundlage: BGH XII ZB 565/15, BGH XII ZB 599/13, Düsseldorfer Tabelle 2026

📊 KURZÜBERSICHT:
• Monatlicher Ausgleichsbetrag: ${result.settlement.amount.toFixed(2)} €
• Kombiniertes Netto beider Eltern: ${result.combinedAdjustedNet.toFixed(2)} € (DT-Gruppe ${result.appliedDtTier.tierIndex}, ${result.appliedDtTier.percentage} %)
• Haftungsquoten: ${parentAName} (${(result.parentA.liabilityShare * 100).toFixed(2)} %) | ${parentBName} (${(result.parentB.liabilityShare * 100).toFixed(2)} %)
• Verbleibendes Netto ${parentAName}: ${result.parentA.remainingIncome.toFixed(2)} € / Monat
• Verbleibendes Netto ${parentBName}: ${result.parentB.remainingIncome.toFixed(2)} € / Monat

-----------------------------------------------------
1. EINKOMMEN & HAFTUNGSQUOTEN
- ${parentAName}:
  * Bereinigtes Netto: ${result.parentA.adjustedNet.toFixed(2)} € / Monat (${(result.parentA.adjustedNet * 12).toFixed(2)} € / Jahr)
  * Haftungseinkommen (> 1.750 € SB): ${result.parentA.liabilityIncome.toFixed(2)} €
  * Haftungsquote (Q_A): ${(result.parentA.liabilityShare * 100).toFixed(2)} %
- ${parentBName}:
  * Bereinigtes Netto: ${result.parentB.adjustedNet.toFixed(2)} € / Monat (${(result.parentB.adjustedNet * 12).toFixed(2)} € / Jahr)
  * Haftungseinkommen (> 1.750 € SB): ${result.parentB.liabilityIncome.toFixed(2)} €
  * Haftungsquote (Q_B): ${(result.parentB.liabilityShare * 100).toFixed(2)} %

2. KINDERBEDARFE & NATURALUNTERHALT (50 %)
${childrenSummary}

3. SPITZABRECHNUNG DER POSITIONEN
- Barunterhaltsspitze ${parentAName}: ${result.parentA.primaryObligation > 0 ? "+" : ""}${result.parentA.primaryObligation.toFixed(2)} €
- Kindergeld-Splitting (BGH XII ZB 45/15, ${kindergeldPerChild} € / Kind): ${result.parentA.kindergeldAdjustment > 0 ? "+" : ""}${result.parentA.kindergeldAdjustment.toFixed(2)} €
- Direktkosten-Verrechnung: ${result.parentA.directExpensesDeduction > 0 ? "+" : ""}${result.parentA.directExpensesDeduction.toFixed(2)} €
- Endgültiger Zahlbetrag: ${result.settlement.amount.toFixed(2)} € (${payerText})

4. VERBLEIBENDES NETTOEINKOMMEN
- ${parentAName}: ${result.parentA.remainingIncome.toFixed(2)} € / Monat
- ${parentBName}: ${result.parentB.remainingIncome.toFixed(2)} € / Monat
=====================================================`;

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const addChild = () => {
    setCurrentScenario("custom");
    const nextIdx = children.length + 1;
    setChildren((prev) => [
      ...prev,
      {
        id: `child-${Date.now()}`,
        name: `Kind ${nextIdx}`,
        ageGroup: "6-11",
        additionalNeeds: {
          wechselmodellSurcharge: 0,
          specialNeeds: 0,
        },
      },
    ]);
  };

  const removeChild = (id: string) => {
    setCurrentScenario("custom");
    setChildren((prev) => prev.filter((c) => c.id !== id));
  };

  const updateChild = (id: string, partial: Partial<ChildInput>) => {
    setCurrentScenario("custom");
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  return (
    <div className="container">
      <Header onOpenChangelog={handleOpenChangelog} />

      <ActionBar
        currentScenario={currentScenario}
        onSelectScenario={loadScenario}
        onCopySummary={handleCopySummary}
        isCopied={isCopied}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      <div className="layout-grid">
        {/* LINKE SPALTE: EINGABE-TABS & KONFIGURATION */}
        <div className="input-column">
          {/* Eingabe-Navigations-Tabs */}
          <nav className="tab-nav" aria-label="Eingabenavigation">
            <button
              type="button"
              className={`tab-btn ${activeInputTab === "parentA" ? "active" : ""}`}
              onClick={() => setActiveInputTab("parentA")}
              title={parentAName || "Elternteil A"}
            >
              <span className="tab-icon">👤</span>
              <span className="tab-label">{parentAName || "Elternteil A"}</span>
              {parentAReceivesKg && <span className="tab-badge">KG</span>}
            </button>
            <button
              type="button"
              className={`tab-btn tab-parent-b ${activeInputTab === "parentB" ? "active" : ""}`}
              onClick={() => setActiveInputTab("parentB")}
              title={parentBName || "Elternteil B"}
            >
              <span className="tab-icon">👤</span>
              <span className="tab-label">{parentBName || "Elternteil B"}</span>
              {!parentAReceivesKg && <span className="tab-badge">KG</span>}
            </button>
            <button
              type="button"
              className={`tab-btn ${activeInputTab === "children" ? "active" : ""}`}
              onClick={() => setActiveInputTab("children")}
              title="Kinder"
            >
              <span className="tab-icon">👶</span>
              <span className="tab-label">Kinder</span>
              <span className="tab-badge">{children.length}</span>
            </button>
          </nav>

          {/* Aktive Eingabekarten-Ansicht */}
          {activeInputTab === "parentA" && (
            <ParentInputCard
              parentKey="parentA"
              name={parentAName}
              setName={(v) => {
                setCurrentScenario("custom");
                setParentAName(v);
              }}
              erwerbsstatus={parentAErwerbsstatus}
              setErwerbsstatus={(v) => {
                setCurrentScenario("custom");
                setParentAErwerbsstatus(v);
              }}
              grossAnnual={parentAGrossAnnual}
              setGrossAnnual={(v) => {
                setCurrentScenario("custom");
                setParentAGrossAnnual(v);
              }}
              netAnnual={parentANetAnnual}
              setNetAnnual={(v) => {
                setCurrentScenario("custom");
                setParentANetAnnual(v);
              }}
              annualBonusNet={parentABonusNet}
              setAnnualBonusNet={(v) => {
                setCurrentScenario("custom");
                setParentABonusNet(v);
              }}
              isEmployed={parentAEmployed}
              setIsEmployed={(v) => {
                setCurrentScenario("custom");
                setParentAEmployed(v);
              }}
              useFlatRate={parentAUseFlatRate}
              setUseFlatRate={(v) => {
                setCurrentScenario("custom");
                setParentAUseFlatRate(v);
              }}
              customAnnualExpense={parentACustomAnnualExpense}
              setCustomAnnualExpense={(v) => {
                setCurrentScenario("custom");
                setParentACustomAnnualExpense(v);
              }}
              pensionAnnual={parentAPensionAnnual}
              setPensionAnnual={(v) => {
                setCurrentScenario("custom");
                setParentAPensionAnnual(v);
              }}
              istPrivatVersichert={parentAIstPrivatVersichert}
              setIstPrivatVersichert={(v) => {
                setCurrentScenario("custom");
                setParentAIstPrivatVersichert(v);
              }}
              pkvBeitragBasisAnnual={parentAPkvBeitragBasisAnnual}
              setPkvBeitragBasisAnnual={(v) => {
                setCurrentScenario("custom");
                setParentAPkvBeitragBasisAnnual(v);
              }}
              pkvArbeitgeberzuschussAnnual={parentAPkvArbeitgeberzuschussAnnual}
              setPkvArbeitgeberzuschussAnnual={(v) => {
                setCurrentScenario("custom");
                setParentAPkvArbeitgeberzuschussAnnual(v);
              }}
              housingAnnual={parentAHousingAnnual}
              setHousingAnnual={(v) => {
                setCurrentScenario("custom");
                setParentAHousingAnnual(v);
              }}
              debtsAnnual={parentADebtsAnnual}
              setDebtsAnnual={(v) => {
                setCurrentScenario("custom");
                setParentADebtsAnnual(v);
              }}
              warmRentMonthly={parentAWarmRent}
              setWarmRentMonthly={(v) => {
                setCurrentScenario("custom");
                setParentAWarmRent(v);
              }}
              householdPersons={parentAHouseholdPersons}
              setHouseholdPersons={(v) => {
                setCurrentScenario("custom");
                setParentAHouseholdPersons(v);
              }}
              directExpensesAnnual={parentAExpensesAnnual}
              setDirectExpensesAnnual={(v) => {
                setCurrentScenario("custom");
                setParentAExpensesAnnual(v);
              }}
              receivesKindergeld={parentAReceivesKg}
              onSelectKindergeld={() => {
                setCurrentScenario("custom");
                setParentAReceivesKg(true);
              }}
            />
          )}

          {activeInputTab === "parentB" && (
            <ParentInputCard
              parentKey="parentB"
              name={parentBName}
              setName={(v) => {
                setCurrentScenario("custom");
                setParentBName(v);
              }}
              erwerbsstatus={parentBErwerbsstatus}
              setErwerbsstatus={(v) => {
                setCurrentScenario("custom");
                setParentBErwerbsstatus(v);
              }}
              grossAnnual={parentBGrossAnnual}
              setGrossAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBGrossAnnual(v);
              }}
              netAnnual={parentBNetAnnual}
              setNetAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBNetAnnual(v);
              }}
              annualBonusNet={parentBBonusNet}
              setAnnualBonusNet={(v) => {
                setCurrentScenario("custom");
                setParentBBonusNet(v);
              }}
              isEmployed={parentBEmployed}
              setIsEmployed={(v) => {
                setCurrentScenario("custom");
                setParentBEmployed(v);
              }}
              useFlatRate={parentBUseFlatRate}
              setUseFlatRate={(v) => {
                setCurrentScenario("custom");
                setParentBUseFlatRate(v);
              }}
              customAnnualExpense={parentBCustomAnnualExpense}
              setCustomAnnualExpense={(v) => {
                setCurrentScenario("custom");
                setParentBCustomAnnualExpense(v);
              }}
              pensionAnnual={parentBPensionAnnual}
              setPensionAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBPensionAnnual(v);
              }}
              istPrivatVersichert={parentBIstPrivatVersichert}
              setIstPrivatVersichert={(v) => {
                setCurrentScenario("custom");
                setParentBIstPrivatVersichert(v);
              }}
              pkvBeitragBasisAnnual={parentBPkvBeitragBasisAnnual}
              setPkvBeitragBasisAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBPkvBeitragBasisAnnual(v);
              }}
              pkvArbeitgeberzuschussAnnual={parentBPkvArbeitgeberzuschussAnnual}
              setPkvArbeitgeberzuschussAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBPkvArbeitgeberzuschussAnnual(v);
              }}
              housingAnnual={parentBHousingAnnual}
              setHousingAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBHousingAnnual(v);
              }}
              debtsAnnual={parentBDebtsAnnual}
              setDebtsAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBDebtsAnnual(v);
              }}
              warmRentMonthly={parentBWarmRent}
              setWarmRentMonthly={(v) => {
                setCurrentScenario("custom");
                setParentBWarmRent(v);
              }}
              householdPersons={parentBHouseholdPersons}
              setHouseholdPersons={(v) => {
                setCurrentScenario("custom");
                setParentBHouseholdPersons(v);
              }}
              directExpensesAnnual={parentBExpensesAnnual}
              setDirectExpensesAnnual={(v) => {
                setCurrentScenario("custom");
                setParentBExpensesAnnual(v);
              }}
              receivesKindergeld={!parentAReceivesKg}
              onSelectKindergeld={() => {
                setCurrentScenario("custom");
                setParentAReceivesKg(false);
              }}
            />
          )}

          {activeInputTab === "children" && (
            <ChildrenInputCard
              childrenList={children}
              childrenResults={result.childrenResults}
              kindergeldPerChild={kindergeldPerChild}
              setKindergeldPerChild={(v) => {
                setCurrentScenario("custom");
                setKindergeldPerChild(v);
              }}
              parentAName={parentAName}
              parentBName={parentBName}
              onAddChild={addChild}
              onRemoveChild={removeChild}
              onUpdateChild={updateChild}
            />
          )}
        </div>

        {/* RECHTE SPALTE: ERGEBNISSE & BERICHTS-TABS */}
        <div className="results-column">
          <div className="card results-card">
            <div className="card-header">
              <span className="card-title">Ausgleichsberechnung</span>
            </div>

            {/* Sofortergebnisse */}
            <SettlementBanner
              settlement={result.settlement}
              parentAName={parentAName}
              parentBName={parentBName}
            />

            <CalculationSummary
              combinedAdjustedNet={result.combinedAdjustedNet}
              appliedDtTier={result.appliedDtTier}
              liabilityShareA={result.parentA.liabilityShare}
              liabilityShareB={result.parentB.liabilityShare}
            />

            {/* Rechtliche Hinweise zu Bürgergeld & Erwerbslosigkeit */}
            {result.buergergeldHinweise && result.buergergeldHinweise.length > 0 && (
              <div className="buergergeld-legal-box">
                <div className="buergergeld-legal-header">
                  <span>{LEGAL_NOTICES.buergergeld.header}</span>
                </div>
                <ul className="buergergeld-legal-list">
                  {result.buergergeldHinweise.map((hinweis, idx) => (
                    <li key={idx}>{hinweis}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hinweis zu nachrangigen Sozialleistungen (Subsidiaritätsprinzip) */}
            {result.subsidiarityNotice && (
              <div className="subsidiarity-legal-box">
                <div className="subsidiarity-legal-header">
                  <span>{LEGAL_NOTICES.subsidiarity.header}</span>
                </div>
                <p className="subsidiarity-legal-text">{result.subsidiarityNotice}</p>
              </div>
            )}

            {/* Ergebnis-Untertabs */}
            <nav className="tab-nav" style={{ marginTop: "8px" }} aria-label="Ergebnisnavigation">
              <button
                type="button"
                className={`tab-btn ${activeResultTab === "table" ? "active" : ""}`}
                onClick={() => setActiveResultTab("table")}
                title="Tabellarische Übersicht"
              >
                <span className="tab-icon">📊</span>
                <span className="tab-label">Tabellarische Übersicht</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeResultTab === "audit" ? "active" : ""}`}
                onClick={() => setActiveResultTab("audit")}
                title="Schrittweises Prüfprotokoll"
              >
                <span className="tab-icon">📜</span>
                <span className="tab-label">Schrittweises Prüfprotokoll</span>
                <span className="tab-badge">{result.auditTrail.length}</span>
              </button>
            </nav>

            <div className="results-tab-content">
              <div
                className={`results-tab-pane print-page-1 ${
                  activeResultTab === "table" ? "active" : "is-tab-hidden-screen"
                }`}
                role="tabpanel"
                aria-label="Tabellarische Übersicht"
              >
                <DetailsTable
                  parentAName={parentAName}
                  parentBName={parentBName}
                  parentA={result.parentA}
                  parentB={result.parentB}
                />
              </div>

              <div
                className={`results-tab-pane print-page-2 ${
                  activeResultTab === "audit" ? "active" : "is-tab-hidden-screen"
                }`}
                role="tabpanel"
                aria-label="Schrittweises Prüfprotokoll"
              >
                <AuditTrailList auditTrail={result.auditTrail} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FaqSection />

      <Footer onOpenLegal={handleOpenLegal} onOpenChangelog={handleOpenChangelog} />

      {/* Impressum & Datenschutz Modal */}
      <LegalModal
        isOpen={legalModalTab !== null}
        activeTab={legalModalTab || "impressum"}
        onClose={handleCloseLegal}
        onTabChange={handleOpenLegal}
      />

      {/* Versionshistorie & Changelog Modal */}
      <ChangelogModal isOpen={isChangelogOpen} onClose={handleCloseChangelog} />
    </div>
  );
}
