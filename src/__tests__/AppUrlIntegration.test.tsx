import { render, screen, waitFor } from "@testing-library/react";
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
