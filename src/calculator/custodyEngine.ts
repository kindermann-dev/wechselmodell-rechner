import { DEFAULT_LEGAL_CONFIG_2026 } from "../config/dtTable2026";
import { LEGAL_NOTICES } from "../config/legalTexts";
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
 * Deterministische Berechnungs-Engine für den Kindesunterhalt im 50:50-Wechselmodell
 *
 * Setzt die deutsche familienrechtliche Rechtsprechung strikt um:
 * - § 1606 Abs. 3 S. 1 BGB (gegenseitige Barunterhaltspflicht beider Eltern)
 * - BGH XII ZB 599/13 (Quotenberechnung über dem angemessenen Selbstbehalt)
 * - BGH XII ZB 565/15 (Bedarfsbemessung nach zusammengerechnetem Einkommen, Mehrbedarf & quotenmäßige Tragung von Direktkosten)
 * - BGH, Beschluss vom 20.04.2016 – Az. XII ZB 45/15 (Zweistufiges Kindergeld-Splitting: 50% Betreuungsanteil [je 25% fix] + 50% Baranteil nach Haftungsquoten)
 * - BGH XII ZB 234/13, XII ZB 599/13 & XII ZB 415/25 (strikte Beschränkung auf paritätische 50:50-Modelle; Abgrenzung zum erweiterten Umgang)
 */

/**
 * Gesetzlicher Hinweistext zum unterhaltsrechtlichen Subsidiaritätsprinzip (§ 1606 Abs. 3 S. 1 BGB)
 */
export const SUBSIDIARITY_NOTICE_TEXT = LEGAL_NOTICES.subsidiarity.text;

/**
 * Isolierter Kindergeldausgleichsanspruch nach BGH, Beschluss v. 20.04.2016 – Az. XII ZB 45/15 („Ein-Viertel-Regel“)
 *
 * Liegen keine Einkommensnachweise vor oder wird keine unterhaltsrechtliche Gesamtabrechnung
 * durchgeführt, steht dem nicht-beziehenden Elternteil ein isolierter Auskehrungsanspruch
 * in Höhe von exakt 25 % des staatlichen Kindergeldes zu (fixer Betreuungsanteil: 0,25 * KG).
 *
 * @param kindergeldPerChild Staatlicher Kindergeldsatz pro Kind (z. B. 259 €)
 * @param childCount Anzahl der Kinder (Standard: 1)
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

  const isBuergergeldA = input.parentA.income.erwerbsstatus === "buergergeld";
  const isBuergergeldB = input.parentB.income.erwerbsstatus === "buergergeld";
  const hasBuergergeldRecipient = isBuergergeldA || isBuergergeldB;

  const buergergeldHinweise: string[] = [];
  if (hasBuergergeldRecipient) {
    buergergeldHinweise.push(LEGAL_NOTICES.buergergeld.erwerbsobliegenheit);
    buergergeldHinweise.push(LEGAL_NOTICES.buergergeld.anspruchsuebergang);
  }

  // ---------------------------------------------------------------------------
  // SCHRITT 1: Bereinigtes Nettoeinkommen beider Elternteile
  // ---------------------------------------------------------------------------
  const incA = calculateAdjustedNetIncome(input.parentA.income, config);
  const incB = calculateAdjustedNetIncome(input.parentB.income, config);

  const formatParentIncomeDesc = (
    inc: ReturnType<typeof calculateAdjustedNetIncome>,
    isBuergergeld: boolean
  ) => {
    if (isBuergergeld) {
      return `• Status: Bürgergeld-Bezug / Nicht erwerbstätig\n• Bereinigtes monatliches Nettoeinkommen (N_adj): 0,00 €`;
    }
    const lines: string[] = [
      `• Basis-Nettoeinkommen: ${inc.rawNet.toFixed(2)} € / Monat`,
      `• Abzüge & Hinzurechnungen:`,
      `  + Wohnvorteil: ${inc.housingAdvantage.toFixed(2)} €`,
      `  - Berufsbedingte Aufwendungen: ${inc.occupationalExpenses.toFixed(2)} €${inc.isEmployed ? " (5 %-Pauschale nach DT Anm. A.3)" : ""}`,
      `  - Zusätzliche Altersvorsorge: ${inc.cappedPension.toFixed(2)} € (max. 4 % vom Brutto)`,
      `  - Berücksichtigungsfähige Schulden: ${inc.allowableDebts.toFixed(2)} €`,
    ];
    if (inc.pkvEigenanteil > 0) {
      lines.push(
        `  - PKV-Eigenanteil (§ 10 Abs. 1 Nr. 3 EStG): ${inc.pkvEigenanteil.toFixed(2)} €`
      );
    }
    lines.push(`= Bereinigtes monatliches Nettoeinkommen (N_adj): ${inc.adjustedNet.toFixed(2)} €`);
    return lines.join("\n");
  };

  auditTrail.push({
    stepNumber: currentStep++,
    label: `Bereinigtes Nettoeinkommen: ${input.parentA.name || "Elternteil A"}${isBuergergeldA ? " (Bürgergeld)" : ""}`,
    formula: isBuergergeldA
      ? "N_adj = 0,00 € (Bürgergeld-Bezug / Nicht erwerbstätig)"
      : "N_adj = N_net + Wohnvorteil - Berufsaufwand - Altersvorsorge(max 4%) - Schulden - PKV-Eigenanteil",
    description: formatParentIncomeDesc(incA, isBuergergeldA),
    value: incA.adjustedNet,
  });

  auditTrail.push({
    stepNumber: currentStep++,
    label: `Bereinigtes Nettoeinkommen: ${input.parentB.name || "Elternteil B"}${isBuergergeldB ? " (Bürgergeld)" : ""}`,
    formula: isBuergergeldB
      ? "N_adj = 0,00 € (Bürgergeld-Bezug / Nicht erwerbstätig)"
      : "N_adj = N_net + Wohnvorteil - Berufsaufwand - Altersvorsorge(max 4%) - Schulden - PKV-Eigenanteil",
    description: formatParentIncomeDesc(incB, isBuergergeldB),
    value: incB.adjustedNet,
  });

  // ---------------------------------------------------------------------------
  // SCHRITT 2: Zusammengerechnetes Nettoeinkommen & DT-Einstufung
  // ---------------------------------------------------------------------------
  const combinedAdjustedNet = round2(incA.adjustedNet + incB.adjustedNet);

  // Einkommensgruppe in der Düsseldorfer Tabelle anhand des Gesamteinkommens ermitteln
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
    description: `• Bereinigtes Netto ${input.parentA.name || "Elternteil A"}: ${incA.adjustedNet.toFixed(2)} €\n• Bereinigtes Netto ${input.parentB.name || "Elternteil B"}: ${incB.adjustedNet.toFixed(2)} €\n= Kombiniertes Gesamteinkommen (N_comb): ${combinedAdjustedNet.toFixed(2)} €\n-> Einstufung nach Düsseldorfer Tabelle 2026:\n   Einkommensgruppe ${appliedDtTier.tierIndex} (${appliedDtTier.minIncome} € bis ${appliedDtTier.maxIncome === Infinity ? "über 11.200" : appliedDtTier.maxIncome} €, ${appliedDtTier.percentage} % des Mindestbedarfs)`,
    value: appliedDtTier.tierIndex,
  });

  // ---------------------------------------------------------------------------
  // SCHRITT 3: Haftungseinkommen & Quotenermittlung (Haftungsanteile)
  // ---------------------------------------------------------------------------
  const sbAdequate = config.retentionRates.adequate;
  const sbNotwA =
    isBuergergeldA || !incA.isEmployed
      ? config.retentionRates.necessaryUnemployed
      : config.retentionRates.necessaryEmployed;
  const sbNotwB =
    isBuergergeldB || !incB.isEmployed
      ? config.retentionRates.necessaryUnemployed
      : config.retentionRates.necessaryEmployed;

  const hA = isBuergergeldA ? 0 : round2(Math.max(0, incA.adjustedNet - sbAdequate));
  const hB = isBuergergeldB ? 0 : round2(Math.max(0, incB.adjustedNet - sbAdequate));
  const hTotal = round2(hA + hB);

  let qA = 0;
  let qB = 0;

  if (hTotal > 0) {
    qA = hA / hTotal;
    qB = hB / hTotal;
  } else {
    // Falls beide Elternteile unter dem angemessenen Selbstbehalt liegen: Prüfung des notwendigen Selbstbehalts (Mangelfall)
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
    label: "Haftungsanteile & Quotenermittlung (BGH XII ZB 599/13, BGH XII ZB 565/15)",
    formula: "H = max(0, N_adj - SB_ang); Q_A = H_A / H_ges; Q_B = H_B / H_ges",
    description: `• Angemessener Selbstbehalt (SB_ang): ${sbAdequate.toFixed(2)} €\n• Haftungseinkommen ${input.parentA.name || "Elternteil A"}: max(0, ${incA.adjustedNet.toFixed(2)} € - ${sbAdequate.toFixed(2)} €) = ${hA.toFixed(2)} €\n• Haftungseinkommen ${input.parentB.name || "Elternteil B"}: max(0, ${incB.adjustedNet.toFixed(2)} € - ${sbAdequate.toFixed(2)} €) = ${hB.toFixed(2)} €\n= Gesamthaftungseinkommen (H_ges): ${hTotal.toFixed(2)} €\n-> Haftungsquoten:\n   • Quote ${input.parentA.name || "Elternteil A"} (Q_A): ${(qARounded * 100).toFixed(2)} %\n   • Quote ${input.parentB.name || "Elternteil B"} (Q_B): ${(qBRounded * 100).toFixed(2)} %`,
    value: `Q_A: ${(qARounded * 100).toFixed(2)}% | Q_B: ${(qBRounded * 100).toFixed(2)}%`,
  });

  // ---------------------------------------------------------------------------
  // SCHRITT 4: Bedarfsermittlung & Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25)
  // ---------------------------------------------------------------------------
  const childrenResults: ChildCalculationResult[] = [];
  let primaryObligationA = 0;
  let primaryObligationB = 0;
  let totalChildNeedAll = 0;
  let totalShareParentAAll = 0;
  let totalShareParentBAll = 0;
  let totalNaturalAAll = 0;
  let totalChildHousingAAll = 0;
  let totalChildHousingBAll = 0;

  // Tatsächliche Pro-Kind-Wohnkosten beider Haushalte (BGH XII ZB 565/15 Rn. 25 & Pro-Kopf-Methode)
  const warmRentA = Math.max(0, input.parentA.housingCosts?.warmRentMonthly || 0);
  const personsA = Math.max(1, input.parentA.housingCosts?.householdPersons || 1);
  const childHousingA = warmRentA > 0 ? round2(warmRentA / personsA) : 0;

  const warmRentB = Math.max(0, input.parentB.housingCosts?.warmRentMonthly || 0);
  const personsB = Math.max(1, input.parentB.housingCosts?.householdPersons || 1);
  const childHousingB = warmRentB > 0 ? round2(warmRentB / personsB) : 0;

  const actualChildHousingTotal = round2(childHousingA + childHousingB);
  const hasHousingCosts = actualChildHousingTotal > 0;

  for (const child of input.children) {
    const tabellenUnterhalt = appliedDtTier.rates[child.ageGroup] || 0;
    const housingPortionInTable = round2(tabellenUnterhalt * 0.2);

    let calculatedWohnmehrbedarf = 0;
    if (hasHousingCosts) {
      calculatedWohnmehrbedarf = round2(
        Math.max(0, actualChildHousingTotal - housingPortionInTable)
      );

      auditTrail.push({
        stepNumber: currentStep++,
        label: `Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 35): ${child.name || child.id}`,
        formula:
          "Wohnen_Kind = (Miete_A / Pers_A) + (Miete_B / Pers_B); Wohnmehrbedarf = max(0, Wohnen_Kind - 20% * B_tab)",
        description: `1. Tatsächlicher Pro-Kopf-Wohnaufwand für das Kind in beiden Haushalten:\n   • Haushalt ${input.parentA.name || "A"}: ${warmRentA.toFixed(2)} € Warmmiete / ${personsA} Person${personsA > 1 ? "en" : ""} = ${childHousingA.toFixed(2)} € / Monat\n   • Haushalt ${input.parentB.name || "B"}: ${warmRentB.toFixed(2)} € Warmmiete / ${personsB} Person${personsB > 1 ? "en" : ""} = ${childHousingB.toFixed(2)} € / Monat\n   = Tatsächliche Wohnkosten für das Kind gesamt: ${actualChildHousingTotal.toFixed(2)} € / Monat\n\n2. Im Tabellenbedarf enthaltener 20 %-Wohnkostenanteil (Residenzmodell-Pauschale):\n   • 20 % von ${tabellenUnterhalt.toFixed(2)} € (Tabellenbedarf Altersstufe ${child.ageGroup}) = ${housingPortionInTable.toFixed(2)} €\n\n3. Unterhaltsrechtlicher Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 35; Wendl/Dose/Klinkhammer, § 2):\n   • ${actualChildHousingTotal.toFixed(2)} € tatsächlicher Wohnaufwand - ${housingPortionInTable.toFixed(2)} € Tabellenanteil = ${calculatedWohnmehrbedarf.toFixed(2)} € / Monat`,
        value: calculatedWohnmehrbedarf,
      });
    }

    const manualWechselmodellSurcharge = round2(
      Math.max(0, child.additionalNeeds?.wechselmodellSurcharge || 0)
    );
    const specialNeeds = round2(Math.max(0, child.additionalNeeds?.specialNeeds || 0));
    const isChildPrivatVersichert = Boolean(child.istPrivatVersichert);
    const pkvBeitrag = isChildPrivatVersichert ? round2(Math.max(0, child.pkvBeitrag || 0)) : 0;
    const pkvShareParentA = round2(pkvBeitrag * qA);
    const pkvShareParentB = round2(pkvBeitrag * qB);
    const pkvPayer = child.pkvZahler || "elternteil1";

    const additionalNeedsTotal = round2(
      calculatedWohnmehrbedarf + manualWechselmodellSurcharge + specialNeeds
    );
    const totalNeed = round2(tabellenUnterhalt + additionalNeedsTotal);

    // BGH XII ZB 512/19: Kinderzuschlag (§ 6a BKGG) als 100 % bedarfsdeckendes Kindeseinkommen
    const rawKinderzuschlag = Math.max(0, Number(child.kinderzuschlag) || 0);
    const kinderzuschlag = round2(rawKinderzuschlag);
    const reducedNeed = round2(Math.max(0, totalNeed - kinderzuschlag));

    const shareParentA = round2(reducedNeed * qA);
    const shareParentB = round2(reducedNeed * qB);

    let naturalShare = 0;
    let childObligationA = 0;
    let childObligationB = 0;
    let restLebensunterhalt = totalNeed;

    if (hasHousingCosts && calculatedWohnmehrbedarf > 0) {
      // Realkosten-Wohnmehrbedarf nach BGH XII ZB 565/15 Rn. 25:
      // 1. Die direkten Drittzahlungen (wie die auf das Kind entfallenden Mietkosten) werden vom Bruttobedarf abgezogen.
      //    Es verbleibt der Restbedarf für den laufenden Lebensunterhalt (Rest_Lebensunterhalt = B_ges - Wohnkosten_gesamt = 80 % * B_tab).
      // 2. Davon trägt jeder Elternteil exakt die Hälfte als Naturalunterhalt während seiner Betreuungszeit:
      //    Naturalunterhalt = 50 % * Rest_Lebensunterhalt = 50 % * (B_ges - Wohnkosten_gesamt).
      // 3. Vom Haftungsanteil (Anteil_A = B_ges * Q_A) werden der 50 %-Naturalunterhalt sowie die eigene direkte Mietzahlung für das Kind (childHousingA) abgezogen:
      //    U_prim,A = Anteil_A - Naturalunterhalt - childHousingA
      //    U_prim,B = Anteil_B - Naturalunterhalt - childHousingB (= -U_prim,A)
      restLebensunterhalt = round2(
        Math.max(0, (kinderzuschlag > 0 ? reducedNeed : totalNeed) - actualChildHousingTotal)
      );
      naturalShare = round2(restLebensunterhalt * 0.5);

      childObligationA = round2(shareParentA - naturalShare - childHousingA);
      childObligationB = round2(shareParentB - naturalShare - childHousingB);
    } else {
      // Wenn keine Mieten eingegeben wurden oder kein Wohnmehrbedarf vorliegt:
      // Jeder Elternteil erbringt 50 % des (Rest-)Bedarfs als Naturalunterhalt im eigenen Haushalt.
      naturalShare = round2(reducedNeed * 0.5);
      childObligationA = round2(shareParentA - naturalShare);
      childObligationB = round2(shareParentB - naturalShare);
    }

    primaryObligationA = round2(primaryObligationA + childObligationA);
    primaryObligationB = round2(primaryObligationB + childObligationB);
    totalChildNeedAll = round2(totalChildNeedAll + totalNeed);
    totalShareParentAAll = round2(totalShareParentAAll + shareParentA);
    totalShareParentBAll = round2(totalShareParentBAll + shareParentB);
    totalNaturalAAll = round2(totalNaturalAAll + naturalShare);
    if (hasHousingCosts && calculatedWohnmehrbedarf > 0) {
      totalChildHousingAAll = round2(totalChildHousingAAll + childHousingA);
      totalChildHousingBAll = round2(totalChildHousingBAll + childHousingB);
    }

    childrenResults.push({
      childId: child.id,
      ageGroup: child.ageGroup,
      tabellenUnterhalt,
      housingNeedCalculated: actualChildHousingTotal > 0 ? actualChildHousingTotal : undefined,
      housingPortionInTable: actualChildHousingTotal > 0 ? housingPortionInTable : undefined,
      calculatedWohnmehrbedarf: actualChildHousingTotal > 0 ? calculatedWohnmehrbedarf : undefined,
      childHousingA: actualChildHousingTotal > 0 ? childHousingA : undefined,
      childHousingB: actualChildHousingTotal > 0 ? childHousingB : undefined,
      pkvBeitrag: isChildPrivatVersichert && pkvBeitrag > 0 ? pkvBeitrag : undefined,
      pkvShareParentA: isChildPrivatVersichert && pkvBeitrag > 0 ? pkvShareParentA : undefined,
      pkvShareParentB: isChildPrivatVersichert && pkvBeitrag > 0 ? pkvShareParentB : undefined,
      pkvPayer: isChildPrivatVersichert && pkvBeitrag > 0 ? pkvPayer : undefined,
      additionalNeedsTotal,
      totalNeed,
      kinderzuschlag: kinderzuschlag > 0 ? kinderzuschlag : undefined,
      reducedNeed: kinderzuschlag > 0 ? reducedNeed : undefined,
      shareParentA,
      shareParentB,
    });

    if (kinderzuschlag > 0) {
      auditTrail.push({
        stepNumber: currentStep++,
        label: `- Anzurechnendes Einkommen Kind (Kinderzuschlag § 6a BKGG): ${child.name || child.id}`,
        formula: "B_rest = max(0, B_ges - Kinderzuschlag)",
        description: `• Gesamtbedarf des Kindes vor Anrechnung: ${totalNeed.toFixed(2)} €\n• Anzurechnender Kinderzuschlag nach § 6a BKGG: - ${kinderzuschlag.toFixed(2)} €\n-> BGH XII ZB 512/19 (28.10.2020): Der Kinderzuschlag gilt zu 100 % als bedarfsdeckendes Kindeseinkommen.\n= Verbleibender Restbedarf nach Anrechnung (B_rest): ${reducedNeed.toFixed(2)} €`,
        value: reducedNeed,
      });
    }

    if (hasHousingCosts && calculatedWohnmehrbedarf > 0) {
      const extraNeeds = manualWechselmodellSurcharge + specialNeeds;
      auditTrail.push({
        stepNumber: currentStep++,
        label: `Bedarfsberechnung Kind (BGH XII ZB 565/15): ${child.name || child.id}`,
        formula:
          kinderzuschlag > 0
            ? "Rest_Lebensunterhalt = B_rest - Wohnen_ges; Natural = 50% * Rest_Lebensunterhalt; U_prim,A = Anteil_A - Natural - Wohnen_Kind_A"
            : "Rest_Lebensunterhalt = B_ges - Wohnen_ges; Natural = 50% * Rest_Lebensunterhalt; U_prim,A = Anteil_A - Natural - Wohnen_Kind_A",
        description: `1. Gesamtbedarf des Kindes:\n   • Tabellenbedarf (Gruppe ${appliedDtTier.tierIndex}, Altersstufe ${child.ageGroup}): ${tabellenUnterhalt.toFixed(2)} €\n   • Realkosten-Wohnmehrbedarf: + ${calculatedWohnmehrbedarf.toFixed(2)} €${extraNeeds > 0 ? `\n   • Sonstiger Mehrbedarf: + ${extraNeeds.toFixed(2)} €` : ""}\n   = Bruttogesamtbedarf (B_ges): ${totalNeed.toFixed(2)} €${kinderzuschlag > 0 ? `\n   (nach 100% Kinderzuschlag-Abzug verbleibender Restbedarf: ${reducedNeed.toFixed(2)} €)` : ""}\n\n2. Restbedarf für den laufenden Lebensunterhalt & Naturalunterhalt:\n   • Bruttobedarf abzüglich direkter Drittzahlungen (Kindes-Wohnkosten ${actualChildHousingTotal.toFixed(2)} €): ${restLebensunterhalt.toFixed(2)} €\n   • 50 %-Naturalunterhalt je Elternteil während der Betreuung: ${naturalShare.toFixed(2)} €\n\n3. Quotenmäßige Haftungsanteile & Barunterhaltsspitzen:\n   • ${input.parentA.name || "Elternteil A"} (Haftungsquote ${(qARounded * 100).toFixed(2)} %):\n     - Anteil am Gesamtbedarf: ${shareParentA.toFixed(2)} €\n     - Abzug 50 %-Naturalunterhalt: - ${naturalShare.toFixed(2)} €\n     - Abzug eigener Kindes-Wohnaufwand A: - ${childHousingA.toFixed(2)} €\n     = Primäre Barunterhaltspflicht A (U_prim,A): ${childObligationA.toFixed(2)} €\n   • ${input.parentB.name || "Elternteil B"} (Haftungsquote ${(qBRounded * 100).toFixed(2)} %):\n     - Anteil am Gesamtbedarf: ${shareParentB.toFixed(2)} €\n     - Abzug 50 %-Naturalunterhalt: - ${naturalShare.toFixed(2)} €\n     - Abzug eigener Kindes-Wohnaufwand B: - ${childHousingB.toFixed(2)} €\n     = Primäre Barunterhaltspflicht B (U_prim,B): ${childObligationB.toFixed(2)} €`,
        value: kinderzuschlag > 0 ? reducedNeed : totalNeed,
      });
    } else {
      auditTrail.push({
        stepNumber: currentStep++,
        label: `Bedarfsberechnung Kind (BGH XII ZB 565/15): ${child.name || child.id}`,
        formula:
          kinderzuschlag > 0
            ? "Anteil_A = B_rest * Q_A; U_prim,A = Anteil_A - (50% * B_rest)"
            : "B_ges = B_tab + Mehrbedarf; Anteil_A = B_ges * Q_A; U_prim,A = Anteil_A - (50% * B_ges)",
        description: `1. Gesamtbedarf des Kindes:\n   • Tabellenbedarf (Gruppe ${appliedDtTier.tierIndex}, Altersstufe ${child.ageGroup}): ${tabellenUnterhalt.toFixed(2)} €${additionalNeedsTotal > 0 ? `\n   • Mehrbedarf: + ${additionalNeedsTotal.toFixed(2)} €` : ""}\n   = Gesamtbedarf (B_ges): ${totalNeed.toFixed(2)} €${kinderzuschlag > 0 ? `\n   (nach 100% Kinderzuschlag-Abzug verbleibender Restbedarf: ${reducedNeed.toFixed(2)} €)` : ""}\n\n2. Naturalunterhalt während der Betreuungszeit:\n   • 50 % des Bedarfs je Elternteil: ${naturalShare.toFixed(2)} €\n\n3. Quotenmäßige Haftungsanteile & Barunterhaltsspitzen:\n   • ${input.parentA.name || "Elternteil A"} (Haftungsquote ${(qARounded * 100).toFixed(2)} %):\n     - Anteil am Gesamtbedarf: ${shareParentA.toFixed(2)} €\n     - Abzug 50 %-Naturalunterhalt: - ${naturalShare.toFixed(2)} €\n     = Primäre Barunterhaltspflicht A (U_prim,A): ${childObligationA.toFixed(2)} €\n   • ${input.parentB.name || "Elternteil B"} (Haftungsquote ${(qBRounded * 100).toFixed(2)} %):\n     - Anteil am Gesamtbedarf: ${shareParentB.toFixed(2)} €\n     - Abzug 50 %-Naturalunterhalt: - ${naturalShare.toFixed(2)} €\n     = Primäre Barunterhaltspflicht B (U_prim,B): ${childObligationB.toFixed(2)} €`,
        value: kinderzuschlag > 0 ? reducedNeed : totalNeed,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // SCHRITT 5: Kindergeld-Ausgleich (BGH XII ZB 45/15 & BGH XII ZB 565/15 Rn. 32)
  // & Quotenmäßige Verrechnung von Direktaufwendungen (BGH XII ZB 565/15 Rn. 28-30)
  // ---------------------------------------------------------------------------
  const totalKindergeld = round2(input.children.length * config.kindergeldPerChild);
  const carePortionTotal = round2(totalKindergeld * 0.25); // 25 % Betreuungsanteil pro Elternteil
  const barPortionTotal = round2(totalKindergeld * 0.5); // 50 % Baranteil zur Minderung des kindlichen Barbedarfs

  let kindergeldAdjustmentA = 0;
  let kindergeldAdjustmentB = 0;

  // Kindergeld-Ausgleich nach BGH XII ZB 45/15 & BGH XII ZB 565/15 Rn. 32:
  // 1. 50 % Betreuungsanteil (je 25 % des Gesamtkindergeldes pro Elternteil):
  //    Der Bezieher leitet 25 % des Gesamtkindergeldes direkt an den Nicht-Bezieher weiter.
  // 2. 50 % Barunterhaltsanteil (50 % des Gesamtkindergeldes):
  //    Mindert den kindlichen Barbedarf entsprechend den Haftungsquoten (Q_A : Q_B).
  //    Der Entlastungsanspruch des Nicht-Beziehers beträgt Q_Nicht-Bezieher * (50 % des KG).
  //    Da der Bezieher das staatliche Kindergeld voll vereinnahmt, schuldet er im Ausgleich:
  //    ΔKG_Bezieher_an_Nicht-Bezieher = 25 % KG + Q_Nicht-Bezieher * (50 % KG)
  if (input.parentA.receivesKindergeld && !input.parentB.receivesKindergeld) {
    kindergeldAdjustmentA = round2(carePortionTotal + qB * barPortionTotal);
    kindergeldAdjustmentB = round2(-kindergeldAdjustmentA);
  } else if (input.parentB.receivesKindergeld && !input.parentA.receivesKindergeld) {
    kindergeldAdjustmentB = round2(carePortionTotal + qA * barPortionTotal);
    kindergeldAdjustmentA = round2(-kindergeldAdjustmentB);
  }

  // Direktkosten aus PKV-Beiträgen der Kinder ermitteln (Ziff. 10.4 OLG-Leitlinien)
  let childPkvDirectExpensesA = 0;
  let childPkvDirectExpensesB = 0;

  for (const child of input.children) {
    if (child.istPrivatVersichert && child.pkvBeitrag && child.pkvBeitrag > 0) {
      const pkvAmount = round2(child.pkvBeitrag);
      const payer = child.pkvZahler || "elternteil1";
      if (payer === "elternteil1" || payer === "parentA") {
        childPkvDirectExpensesA = round2(childPkvDirectExpensesA + pkvAmount);
      } else if (payer === "elternteil2" || payer === "parentB") {
        childPkvDirectExpensesB = round2(childPkvDirectExpensesB + pkvAmount);
      } else if (payer === "getrennt" || payer === "haelftig") {
        const half = round2(pkvAmount / 2);
        childPkvDirectExpensesA = round2(childPkvDirectExpensesA + half);
        childPkvDirectExpensesB = round2(childPkvDirectExpensesB + (pkvAmount - half));
      }
    }
  }

  const baseDirectExpensesA = round2(
    input.parentA.directExpensesCoveredAnnual !== undefined
      ? Math.max(0, Number(input.parentA.directExpensesCoveredAnnual) / 12)
      : Math.max(0, input.parentA.directExpensesCovered || 0)
  );
  const baseDirectExpensesB = round2(
    input.parentB.directExpensesCoveredAnnual !== undefined
      ? Math.max(0, Number(input.parentB.directExpensesCoveredAnnual) / 12)
      : Math.max(0, input.parentB.directExpensesCovered || 0)
  );

  const directExpensesA = round2(baseDirectExpensesA + childPkvDirectExpensesA);
  const directExpensesB = round2(baseDirectExpensesB + childPkvDirectExpensesB);

  // Nach BGH XII ZB 565/15 Rn. 28-30:
  // Direktaufwendungen (D_A, D_B) für das Kind sind von beiden Elternteilen nach ihren Haftungsquoten (Q_A : Q_B) zu tragen.
  // Elternteil A trägt Q_A der Aufwendungen von B (+ Q_A * D_B).
  // Elternteil B trägt Q_B der Aufwendungen von A (+ Q_B * D_A -> Entlastung für A: - Q_B * D_A).
  const directExpenseAdjustmentA = round2(qA * directExpensesB - qB * directExpensesA);
  const directExpenseAdjustmentB = round2(-directExpenseAdjustmentA);

  const directExpensesShareAFromB = round2(qA * directExpensesB);
  const directExpensesShareBFromA = round2(qB * directExpensesA);

  const kgRecipientName =
    input.parentA.receivesKindergeld && !input.parentB.receivesKindergeld
      ? input.parentA.name || "Elternteil A"
      : input.parentB.receivesKindergeld && !input.parentA.receivesKindergeld
        ? input.parentB.name || "Elternteil B"
        : "Beide Elternteile / unklar";

  const pkvHintText =
    childPkvDirectExpensesA > 0 || childPkvDirectExpensesB > 0
      ? `\n   (inkl. verauslagter PKV-Beiträge Kind: ${input.parentA.name || "A"} ${childPkvDirectExpensesA.toFixed(2)} €, ${input.parentB.name || "B"} ${childPkvDirectExpensesB.toFixed(2)} €)`
      : "";

  auditTrail.push({
    stepNumber: currentStep++,
    label: "Kindergeld- & Direktaufwandsverrechnung (BGH XII ZB 45/15 & XII ZB 565/15)",
    formula: "ΔKG_A = ±(25% * KG + Q_andere * 50% * KG); ΔD_A = Q_A * D_B - Q_B * D_A",
    description: `1. Kindergeld-Splitting nach BGH XII ZB 45/15 (Gesamtkindergeld: ${totalKindergeld.toFixed(2)} € für ${input.children.length} Kind${input.children.length > 1 ? "er" : ""}):\n   • Kindergeldbezieher: ${kgRecipientName}\n   • 25 % fixer Betreuungsanteil: ${carePortionTotal.toFixed(2)} €\n   • 50 % Baranteil (${barPortionTotal.toFixed(2)} € nach Haftungsquoten):\n     - Anspruch ${input.parentA.name || "Elternteil A"}: ${(qARounded * 100).toFixed(2)} % = ${round2(qA * barPortionTotal).toFixed(2)} €\n     - Anspruch ${input.parentB.name || "Elternteil B"}: ${(qBRounded * 100).toFixed(2)} % = ${round2(qB * barPortionTotal).toFixed(2)} €\n   = Kindergeld-Ausgleich A (ΔKG_A): ${kindergeldAdjustmentA > 0 ? "+" : ""}${kindergeldAdjustmentA.toFixed(2)} €\n\n2. Quotenmäßige Verrechnung verauslagter Direktkosten (BGH XII ZB 565/15 Rn. 28–30):\n   • Von ${input.parentA.name || "Elternteil A"} verauslagt: ${directExpensesA.toFixed(2)} € (${input.parentB.name || "B"} erstattet ${(qBRounded * 100).toFixed(2)} % = ${directExpensesShareBFromA.toFixed(2)} €)\n   • Von ${input.parentB.name || "Elternteil B"} verauslagt: ${directExpensesB.toFixed(2)} € (${input.parentA.name || "A"} erstattet ${(qARounded * 100).toFixed(2)} % = ${directExpensesShareAFromB.toFixed(2)} €)\n   = Direktkosten-Ausgleich A (ΔD_A): ${directExpenseAdjustmentA > 0 ? "+" : ""}${directExpenseAdjustmentA.toFixed(2)} €${pkvHintText}`,
    value: Math.abs(kindergeldAdjustmentA),
  });

  // ---------------------------------------------------------------------------
  // SCHRITT 6: Endabrechnung & Zahlbetrag (Spitzabrechnung Z_A & Z_B)
  // ---------------------------------------------------------------------------
  // Gesamtabrechnungsformel nach BGH XII ZB 565/15:
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

  // Verbleibendes Einkommen nach Ausgleichszahlung
  const remainingIncomeA = round2(incA.adjustedNet - netPaymentA);
  const remainingIncomeB = round2(incB.adjustedNet - netPaymentB);

  // ---------------------------------------------------------------------------
  // SCHRITT 7: Selbstbehaltsprüfung & Audit-Protokoll
  // ---------------------------------------------------------------------------
  const isBelowRetentionA = remainingIncomeA < sbNotwA || incA.adjustedNet < sbAdequate;
  const isBelowRetentionB = remainingIncomeB < sbNotwB || incB.adjustedNet < sbAdequate;

  const hasHousingDeductions = hasHousingCosts && totalChildHousingAAll > 0;

  const settlementOutcomeText =
    payer === "balanced"
      ? "Vollständiger Ausgleich (0,00 €)"
      : payer === "parentA"
        ? `${input.parentA.name || "Elternteil A"} zahlt monatlich ${settlementAmount.toFixed(2)} € an ${input.parentB.name || "Elternteil B"}`
        : `${input.parentB.name || "Elternteil B"} zahlt monatlich ${settlementAmount.toFixed(2)} € an ${input.parentA.name || "Elternteil A"}`;

  auditTrail.push({
    stepNumber: currentStep++,
    label: "Endabrechnung & Zahlbetrag (Spitzabrechnung)",
    formula: hasHousingDeductions
      ? "Z_A = (Anteil_A - Natural_A - Wohnen_Kind_A) + (Q_A * D_B - Q_B * D_A) + ΔKG_A; Verbleibendes Einkommen = N_adj - Z"
      : "Z_A = (Anteil_A - 50% Natural_A) + (Q_A * D_B - Q_B * D_A) + ΔKG_A; Verbleibendes Einkommen = N_adj - Z",
    description: `1. Spitzabrechnung für ${input.parentA.name || "Elternteil A"}:\n   • Primäre Barunterhaltsspitze (U_prim,A): ${primaryObligationA > 0 ? "+" : ""}${primaryObligationA.toFixed(2)} €\n   • Direktkosten-Ausgleich (ΔD_A): ${directExpenseAdjustmentA > 0 ? "+" : ""}${directExpenseAdjustmentA.toFixed(2)} €\n   • Kindergeld-Ausgleich (ΔKG_A): ${kindergeldAdjustmentA > 0 ? "+" : ""}${kindergeldAdjustmentA.toFixed(2)} €\n   = Rechnerischer monatlicher Zahlbetrag: ${netPaymentA.toFixed(2)} €\n\n2. Endergebnis der Ausgleichszahlung:\n   -> ${settlementOutcomeText}\n\n3. Selbstbehalts- und Kontrollprüfung (Verbleibendes Nettoeinkommen):\n   • ${input.parentA.name || "Elternteil A"}: ${incA.adjustedNet.toFixed(2)} € ${netPaymentA >= 0 ? `- ${netPaymentA.toFixed(2)} €` : `+ ${Math.abs(netPaymentA).toFixed(2)} €`} = ${remainingIncomeA.toFixed(2)} € (Notwendiger Selbstbehalt: ${sbNotwA.toFixed(2)} € ${remainingIncomeA >= sbNotwA ? "gewahrt" : "unterschritten"})\n   • ${input.parentB.name || "Elternteil B"}: ${incB.adjustedNet.toFixed(2)} € ${netPaymentB >= 0 ? `- ${netPaymentB.toFixed(2)} €` : `+ ${Math.abs(netPaymentB).toFixed(2)} €`} = ${remainingIncomeB.toFixed(2)} € (Notwendiger Selbstbehalt: ${sbNotwB.toFixed(2)} € ${remainingIncomeB >= sbNotwB ? "gewahrt" : "unterschritten"})`,
    value: settlementAmount,
  });

  const hasLowIncome =
    incA.adjustedNet <= sbAdequate + 100 ||
    incB.adjustedNet <= sbAdequate + 100 ||
    remainingIncomeA <= sbNotwA + 100 ||
    remainingIncomeB <= sbNotwB + 100 ||
    isBelowRetentionA ||
    isBelowRetentionB ||
    hasBuergergeldRecipient;

  const subsidiarityNotice = hasLowIncome ? SUBSIDIARITY_NOTICE_TEXT : undefined;

  if (hasBuergergeldRecipient) {
    auditTrail.push({
      stepNumber: currentStep++,
      label: "Rechtliche Hinweise: Bürgergeld / Erwerbslosigkeit (§ 1603 Abs. 2 BGB & § 33 SGB II)",
      formula: "§ 1603 Abs. 2 BGB (Erwerbsobliegenheit) & § 33 SGB II (Anspruchsübergang)",
      description: `${isBuergergeldA ? `${input.parentA.name || "Elternteil A"}: Bürgergeld-Bezug. ` : ""}${isBuergergeldB ? `${input.parentB.name || "Elternteil B"}: Bürgergeld-Bezug. ` : ""}${LEGAL_NOTICES.buergergeld.erwerbsobliegenheit} ${LEGAL_NOTICES.buergergeld.anspruchsuebergang}`,
      value: "§ 1603 II BGB / § 33 SGB II",
    });
  }

  if (subsidiarityNotice) {
    auditTrail.push({
      stepNumber: currentStep++,
      label: "Rechtlicher Hinweis: Nachrangige Sozialleistungen (Subsidiaritätsprinzip)",
      formula: "§ 1606 Abs. 3 S. 1 BGB, § 6a BKGG, WoGG",
      description: subsidiarityNotice,
      value: "Subsidiaritätsprinzip",
    });
  }

  const parentADetails: ParentCalculationDetails = {
    rawNet: incA.rawNet,
    adjustedNet: incA.adjustedNet,
    deductionsTotal: incA.deductionsTotal,
    pkvEigenanteil: incA.pkvEigenanteil,
    selfRetentionApplied: sbAdequate,
    liabilityIncome: hA,
    liabilityShare: qARounded,
    primaryObligation: primaryObligationA,
    directExpensesDeduction: directExpenseAdjustmentA,
    kindergeldAdjustment: kindergeldAdjustmentA,
    netPayment: netPaymentA,
    remainingIncome: remainingIncomeA,
    isBelowRetention: isBelowRetentionA,
    isBuergergeld: isBuergergeldA,
  };

  const parentBDetails: ParentCalculationDetails = {
    rawNet: incB.rawNet,
    adjustedNet: incB.adjustedNet,
    deductionsTotal: incB.deductionsTotal,
    pkvEigenanteil: incB.pkvEigenanteil,
    selfRetentionApplied: sbAdequate,
    liabilityIncome: hB,
    liabilityShare: qBRounded,
    primaryObligation: primaryObligationB,
    directExpensesDeduction: directExpenseAdjustmentB,
    kindergeldAdjustment: kindergeldAdjustmentB,
    netPayment: netPaymentB,
    remainingIncome: remainingIncomeB,
    isBelowRetention: isBelowRetentionB,
    isBuergergeld: isBuergergeldB,
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
    hasBuergergeldRecipient,
    buergergeldHinweise: buergergeldHinweise.length > 0 ? buergergeldHinweise : undefined,
    subsidiarityNotice,
  };
}
