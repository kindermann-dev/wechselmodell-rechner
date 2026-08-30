import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("Kindernamen-Vereinheitlichung und dynamische Altersgruppen-Synchronisation", () => {
  it("initialisiert Kind 1 im Standard-Fall als 'Kind 1 (6–11 Jahre)'", () => {
    render(<App />);

    // Zum Kinder-Tab navigieren
    const inputNav = screen.getByRole("navigation", { name: /eingabenavigation/i });
    const childrenTabBtn = within(inputNav).getByRole("button", { name: /kinder/i });
    fireEvent.click(childrenTabBtn);

    const childrenPanel = screen.getByRole("tabpanel", { name: /kinder/i });
    expect(within(childrenPanel).getByText("Kind 1 (6–11 Jahre)")).toBeDefined();
  });

  it("setzt in den Szenarien einheitliche Namen nach Altersgruppe und aktualisiert diese bei manueller Änderung", () => {
    render(<App />);

    const scenarioSelect = screen.getByRole("combobox", {
      name: /beispielszenario/i,
    });

    // 1. Spitzenverdiener-Szenario laden (1 Kind 12-17 J., 1 Kind 18+ J.)
    fireEvent.change(scenarioSelect, { target: { value: "high-income" } });

    const inputNav = screen.getByRole("navigation", { name: /eingabenavigation/i });
    const childrenTabBtn = within(inputNav).getByRole("button", { name: /kinder/i });
    fireEvent.click(childrenTabBtn);

    const childrenPanel = screen.getByRole("tabpanel", { name: /kinder/i });

    // Beide Kinder müssen die standardisierte Altersgruppenbezeichnung tragen
    expect(within(childrenPanel).getByText("Kind 1 (12–17 Jahre)")).toBeDefined();
    expect(within(childrenPanel).getByText("Kind 2 (ab 18 Jahre)")).toBeDefined();

    // 2. Kind 2 von "ab 18 Jahre" auf "0–5 Jahre" ändern
    const ageSelects = within(childrenPanel).getAllByRole("combobox") as HTMLSelectElement[];
    // Suchen wir gezielt das Select-Element mit aktuellem Wert "18+"
    const ageSelectKind2 = ageSelects.find((s) => s.value === "18+");
    expect(ageSelectKind2).toBeDefined();

    if (ageSelectKind2) {
      fireEvent.change(ageSelectKind2, { target: { value: "0-5" } });
    }

    // Der Header von Kind 2 muss sich sofort dynamisch auf "Kind 2 (0–5 Jahre)" ändern
    expect(within(childrenPanel).getByText("Kind 2 (0–5 Jahre)")).toBeDefined();
    expect(within(childrenPanel).queryByText("Kind 2 (ab 18 Jahre)")).toBeNull();
    expect(within(childrenPanel).queryByText("Kind 2 (Volljährig)")).toBeNull();

    // 3. Kind 1 von "12–17 Jahre" auf "6–11 Jahre" ändern
    const ageSelectKind1 = ageSelects.find((s) => s.value === "12-17");
    expect(ageSelectKind1).toBeDefined();

    if (ageSelectKind1) {
      fireEvent.change(ageSelectKind1, { target: { value: "6-11" } });
    }

    expect(within(childrenPanel).getByText("Kind 1 (6–11 Jahre)")).toBeDefined();
    expect(within(childrenPanel).queryByText("Kind 1 (12–17 Jahre)")).toBeNull();
    expect(within(childrenPanel).queryByText("Kind 1 (Jugendlich)")).toBeNull();
  });

  it("nummeriert Kinder beim Hinzufügen und Entfernen konsistent durch", () => {
    render(<App />);

    const inputNav = screen.getByRole("navigation", { name: /eingabenavigation/i });
    const childrenTabBtn = within(inputNav).getByRole("button", { name: /kinder/i });
    fireEvent.click(childrenTabBtn);

    const childrenPanel = screen.getByRole("tabpanel", { name: /kinder/i });

    // Initial: 1 Kind
    expect(within(childrenPanel).getByText("Kind 1 (6–11 Jahre)")).toBeDefined();

    // Zweites Kind hinzufügen
    const addBtn = within(childrenPanel).getByRole("button", {
      name: /\+ weiteres kind hinzufügen/i,
    });
    fireEvent.click(addBtn);

    expect(within(childrenPanel).getByText("Kind 1 (6–11 Jahre)")).toBeDefined();
    expect(within(childrenPanel).getByText("Kind 2 (6–11 Jahre)")).toBeDefined();

    // Drittes Kind hinzufügen
    fireEvent.click(addBtn);
    expect(within(childrenPanel).getByText("Kind 3 (6–11 Jahre)")).toBeDefined();

    // Erstes Kind entfernen -> verbleibende Kinder werden neu durchnummeriert
    const removeButtons = within(childrenPanel).getAllByRole("button", { name: /entfernen/i });
    expect(removeButtons).toHaveLength(3);
    fireEvent.click(removeButtons[0]);

    expect(within(childrenPanel).getByText("Kind 1 (6–11 Jahre)")).toBeDefined();
    expect(within(childrenPanel).getByText("Kind 2 (6–11 Jahre)")).toBeDefined();
    expect(within(childrenPanel).queryByText("Kind 3 (6–11 Jahre)")).toBeNull();
  });
});
