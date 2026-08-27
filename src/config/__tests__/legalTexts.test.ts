import { describe, it, expect } from "vitest";
import { TOOLTIP_TEXTS, LEGAL_NOTICES } from "../legalTexts";

describe("legalTexts (SSoT für Tooltips & Rechtliche Hinweise)", () => {
  it("enthält vollständige Tooltip-Texte für den Header", () => {
    expect(TOOLTIP_TEXTS.header.asymmetricNotice.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.header.asymmetricNotice.explanation).toBeTruthy();
    expect(TOOLTIP_TEXTS.header.asymmetricNotice.legalNote).toBeTruthy();
    expect(TOOLTIP_TEXTS.header.asymmetricNotice.caseLaw).toBeTruthy();
  });

  it("enthält alle Tooltip-Definitionen für die Elternteil-Eingaben", () => {
    const parentKeys = [
      "buergergeld",
      "receivesKindergeld",
      "grossIncome",
      "netIncome",
      "annualBonus",
      "pkvGeneral",
      "pkvBasis",
      "pkvArbeitgeberzuschuss",
      "pension",
      "housingAdvantage",
      "occupationalExpenses",
      "debts",
      "warmRent",
      "householdPersons",
      "directExpenses",
    ] as const;

    for (const key of parentKeys) {
      const tooltip = TOOLTIP_TEXTS.parent[key];
      expect(tooltip).toBeDefined();
      expect(tooltip.title).toBeTruthy();
      expect(tooltip.explanation).toBeTruthy();
      expect(tooltip.legalNote).toBeTruthy();
    }
  });

  it("enthält alle Tooltip-Definitionen für die Kinder-Eingaben", () => {
    expect(TOOLTIP_TEXTS.children.general.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.children.kindergeld.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.children.kinderzuschlag.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.children.kinderzuschlag.caseLaw).toContain("BGH XII ZB 512/19");
    expect(TOOLTIP_TEXTS.children.ageGroup.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.children.pkvGeneral.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.children.pkvBeitrag.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.children.pkvZahler.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.children.specialNeeds.title).toBeTruthy();

    const dynamicWohnmehrbedarf = TOOLTIP_TEXTS.children.calculatedWohnmehrbedarf(600, 150, 450);
    expect(dynamicWohnmehrbedarf.title).toContain("Wohnmehrbedarf");
    expect(dynamicWohnmehrbedarf.legalNote).toContain("600.00");
    expect(dynamicWohnmehrbedarf.legalNote).toContain("450.00");
  });

  it("enthält alle Tooltip-Definitionen für Kennzahlen und DetailsTable", () => {
    expect(TOOLTIP_TEXTS.summary.combinedNet.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.summary.dtTier.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.summary.liabilityShareA.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.summary.liabilityShareB.title).toBeTruthy();

    expect(TOOLTIP_TEXTS.detailsTable.adjustedNet.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.detailsTable.liabilityIncome.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.detailsTable.primaryObligation.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.detailsTable.kindergeldAdjustment.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.detailsTable.directExpensesAdjustment.title).toBeTruthy();
    expect(TOOLTIP_TEXTS.detailsTable.remainingIncome.title).toBeTruthy();
  });

  it("enthält die gesetzlichen Hinweistexte zu Subsidiarität und Bürgergeld", () => {
    expect(LEGAL_NOTICES.subsidiarity.header).toContain("Subsidiaritätsprinzip");
    expect(LEGAL_NOTICES.subsidiarity.text).toContain("Kinderzuschlag (§ 6a BKGG)");
    expect(LEGAL_NOTICES.subsidiarity.text).toContain("Wohngeld");
    expect(LEGAL_NOTICES.subsidiarity.text).toContain("BGH XII ZB 512/19");
    expect(LEGAL_NOTICES.subsidiarity.legalBasis).toContain("§ 1606 Abs. 3 S. 1 BGB");

    expect(LEGAL_NOTICES.buergergeld.header).toBeTruthy();
    expect(LEGAL_NOTICES.buergergeld.statusBanner).toBeTruthy();
    expect(LEGAL_NOTICES.buergergeld.erwerbsobliegenheit).toContain("§ 1603 Abs. 2 BGB");
    expect(LEGAL_NOTICES.buergergeld.anspruchsuebergang).toContain("§ 33 SGB II");
  });
});
