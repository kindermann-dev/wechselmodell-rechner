import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import App from "../App";
import { serializeStateToHash } from "../utils/urlSerialization";
import type { AppInputState } from "../types/urlState";

describe("App URL Hash Integration", () => {
  beforeEach(() => {
    window.location.hash = "";
    vi.restoreAllMocks();
  });

  it("sollte beim Start mit einem URL-Hash alle Parameter in die Felder laden", async () => {
    const customState: AppInputState = {
      scenario: "custom",
      kindergeldPerChild: 255,
      parentA: {
        name: "Mama Claudia",
        erwerbsstatus: "erwerbstaetig",
        grossAnnual: 60000,
        netAnnual: 40000,
        annualBonusNet: 2000,
        isEmployed: true,
        useFlatRate: true,
        customAnnualExpense: 0,
        pensionAnnual: 1500,
        istPrivatVersichert: false,
        pkvBeitragBasisAnnual: 0,
        pkvArbeitgeberzuschussAnnual: 0,
        housingAnnual: 0,
        debtsAnnual: 0,
        warmRentMonthly: 1200,
        householdPersons: 3,
        directExpensesAnnual: 500,
        receivesKindergeld: true,
      },
      parentB: {
        name: "Papa Thomas",
        erwerbsstatus: "erwerbstaetig",
        grossAnnual: 50000,
        netAnnual: 35000,
        annualBonusNet: 0,
        isEmployed: true,
        useFlatRate: true,
        customAnnualExpense: 0,
        pensionAnnual: 1000,
        istPrivatVersichert: false,
        pkvBeitragBasisAnnual: 0,
        pkvArbeitgeberzuschussAnnual: 0,
        housingAnnual: 0,
        debtsAnnual: 0,
        warmRentMonthly: 1000,
        householdPersons: 3,
        directExpensesAnnual: 0,
      },
      children: [
        {
          id: "c-test-1",
          name: "Sophie",
          ageGroup: "12-17",
          additionalNeeds: { wechselmodellSurcharge: 60, specialNeeds: 0 },
        },
      ],
    };

    const hash = await serializeStateToHash(customState);
    window.location.hash = hash;

    render(<App />);

    await waitFor(() => {
      // Prüfen, ob die importierten Namen in den Tabs / Titeln gerendert werden
      expect(screen.getAllByText("Mama Claudia").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Papa Thomas").length).toBeGreaterThan(0);
    });
  });

  it("sollte den Wohnmehrbedarf-Modus aus dem Hash übernehmen und die entsprechenden Optionen rendern", async () => {
    const realHousingState: AppInputState = {
      scenario: "custom",
      housingCostMode: "real-per-child",
      kindergeldPerChild: 259,
      parentA: {
        name: "Elternteil A",
        erwerbsstatus: "erwerbstaetig",
        grossAnnual: 48000,
        netAnnual: 36000,
        annualBonusNet: 0,
        isEmployed: true,
        useFlatRate: true,
        customAnnualExpense: 0,
        pensionAnnual: 0,
        istPrivatVersichert: false,
        pkvBeitragBasisAnnual: 0,
        pkvArbeitgeberzuschussAnnual: 0,
        housingAnnual: 0,
        debtsAnnual: 0,
        warmRentMonthly: 0,
        householdPersons: 2,
        directExpensesAnnual: 0,
        receivesKindergeld: true,
      },
      parentB: {
        name: "Elternteil B",
        erwerbsstatus: "erwerbstaetig",
        grossAnnual: 36000,
        netAnnual: 26400,
        annualBonusNet: 0,
        isEmployed: true,
        useFlatRate: true,
        customAnnualExpense: 0,
        pensionAnnual: 0,
        istPrivatVersichert: false,
        pkvBeitragBasisAnnual: 0,
        pkvArbeitgeberzuschussAnnual: 0,
        housingAnnual: 0,
        debtsAnnual: 0,
        warmRentMonthly: 0,
        householdPersons: 2,
        directExpensesAnnual: 0,
      },
      children: [
        {
          id: "c-test-1",
          name: "Kind 1",
          ageGroup: "6-11",
          realHousingCostParentA: 300,
          realHousingCostParentB: 200,
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ],
    };

    const hash = await serializeStateToHash(realHousingState);
    window.location.hash = hash;

    render(<App />);

    // Auf den Kinder-Tab wechseln
    await waitFor(() => {
      expect(screen.getByTitle("Kinder")).toBeDefined();
    });
    fireEvent.click(screen.getByTitle("Kinder"));

    await waitFor(() => {
      expect(screen.getByText(/Methode 2: Konkrete Wohnkosten pro Kind/i)).toBeDefined();
      expect(screen.getByText(/Gerichtsübliche Ermittlung nach Quadratmetern/i)).toBeDefined();
    });
  });

  it("sollte negative sonstige Mehrbedarfe (Bedarfsabzug) aus dem Hash in die Berechnung laden", async () => {
    const negativeState: AppInputState = {
      scenario: "custom",
      kindergeldPerChild: 259,
      parentA: {
        name: "Elternteil A",
        erwerbsstatus: "erwerbstaetig",
        grossAnnual: 48000,
        netAnnual: 36000,
        annualBonusNet: 0,
        isEmployed: true,
        useFlatRate: true,
        customAnnualExpense: 0,
        pensionAnnual: 0,
        istPrivatVersichert: false,
        pkvBeitragBasisAnnual: 0,
        pkvArbeitgeberzuschussAnnual: 0,
        housingAnnual: 0,
        debtsAnnual: 0,
        warmRentMonthly: 0,
        householdPersons: 2,
        directExpensesAnnual: 0,
        receivesKindergeld: true,
      },
      parentB: {
        name: "Elternteil B",
        erwerbsstatus: "erwerbstaetig",
        grossAnnual: 36000,
        netAnnual: 26400,
        annualBonusNet: 0,
        isEmployed: true,
        useFlatRate: true,
        customAnnualExpense: 0,
        pensionAnnual: 0,
        istPrivatVersichert: false,
        pkvBeitragBasisAnnual: 0,
        pkvArbeitgeberzuschussAnnual: 0,
        housingAnnual: 0,
        debtsAnnual: 0,
        warmRentMonthly: 0,
        householdPersons: 2,
        directExpensesAnnual: 0,
      },
      children: [
        {
          id: "c-test-negative",
          name: "Lukas",
          ageGroup: "6-11",
          additionalNeeds: { wechselmodellSurcharge: -75, specialNeeds: 0 },
        },
      ],
    };

    const hash = await serializeStateToHash(negativeState);
    window.location.hash = hash;

    render(<App />);

    // Auf den Kinder-Tab wechseln
    await waitFor(() => {
      expect(screen.getByTitle("Kinder")).toBeDefined();
    });
    fireEvent.click(screen.getByTitle("Kinder"));

    await waitFor(() => {
      // Eingabefeld für Sonst. Mehr-/Sonderbedarf sollte -75 anzeigen
      const inputEl = screen.getByDisplayValue("-75");
      expect(inputEl).toBeDefined();
    });
  });

  it("sollte die URL via history.replaceState synchronisieren", async () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    render(<App />);

    await waitFor(
      () => {
        expect(replaceStateSpy).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    const calls = replaceStateSpy.mock.calls;
    const lastCallUrl = calls[calls.length - 1][2] as string;
    expect(lastCallUrl).toContain("#v1=");
  });
});
