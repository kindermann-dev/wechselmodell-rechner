import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PeriodToggle } from "../PeriodToggle";
import { PeriodNumericField } from "../PeriodNumericField";
import { ParentInputCard } from "../ParentInputCard";

describe("Perioden-Umschaltung & Eingabekomponenten (Monat / Jahr)", () => {
  describe("PeriodToggle", () => {
    it("rendert die Umschalt-Schaltflächen für Monat und Jahr", () => {
      const onChange = vi.fn();
      render(<PeriodToggle period="monthly" onChange={onChange} ariaLabel="Test Toggle" />);

      const monthBtn = screen.getByRole("button", { name: /monatliche eingabe/i });
      const yearBtn = screen.getByRole("button", { name: /jährliche eingabe/i });

      expect(monthBtn).toBeDefined();
      expect(yearBtn).toBeDefined();
      expect(monthBtn.getAttribute("aria-pressed")).toBe("true");
      expect(yearBtn.getAttribute("aria-pressed")).toBe("false");
    });

    it("löst onChange bei Klick auf die inaktive Schaltfläche aus", () => {
      const onChange = vi.fn();
      render(<PeriodToggle period="monthly" onChange={onChange} ariaLabel="Test Toggle" />);

      const yearBtn = screen.getByRole("button", { name: /jährliche eingabe/i });
      fireEvent.click(yearBtn);

      expect(onChange).toHaveBeenCalledWith("yearly");
    });

    it("deaktiviert Schaltflächen bei disabled=true", () => {
      const onChange = vi.fn();
      render(
        <PeriodToggle
          period="monthly"
          onChange={onChange}
          ariaLabel="Test Toggle"
          disabled={true}
        />
      );

      const monthBtn = screen.getByRole("button", { name: /monatliche eingabe/i });
      const yearBtn = screen.getByRole("button", { name: /jährliche eingabe/i });

      expect(monthBtn.hasAttribute("disabled")).toBe(true);
      expect(yearBtn.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("PeriodNumericField", () => {
    it("zeigt standardmäßig den Monatsbetrag aus dem übergebenen Jahreswert an", () => {
      const onAnnualChange = vi.fn();
      render(
        <PeriodNumericField
          label="Bruttoeinkommen"
          annualValue={48000}
          onAnnualValueChange={onAnnualChange}
        />
      );

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("4000");
      expect(screen.getByText(/Entspricht 48.000,00 € \/ Jahr/i)).toBeDefined();
    });

    it("rechnet Eingaben im Monatsmodus automatisch in den Jahreswert um", async () => {
      vi.useFakeTimers();
      const onAnnualChange = vi.fn();
      render(
        <PeriodNumericField
          label="Nettoeinkommen"
          annualValue={36000}
          onAnnualValueChange={onAnnualChange}
        />
      );

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "3500" } });

      // Debounce abwarten
      vi.advanceTimersByTime(250);
      expect(onAnnualChange).toHaveBeenCalledWith(42000);
      vi.useRealTimers();
    });

    it("schaltet nahtlos auf Jahresbasis um und zeigt den vollen Jahresbetrag an", () => {
      const onAnnualChange = vi.fn();
      render(
        <PeriodNumericField
          label="Bruttoeinkommen"
          annualValue={60000}
          onAnnualValueChange={onAnnualChange}
        />
      );

      const yearBtn = screen.getByRole("button", { name: /jährliche eingabe/i });
      fireEvent.click(yearBtn);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("60000");
      expect(screen.getByText(/Ø 5.000,00 € \/ Monat/i)).toBeDefined();
    });

    it("verarbeitet Eingaben im Jahresmodus direkt ohne 12-Multiplikation", () => {
      vi.useFakeTimers();
      const onAnnualChange = vi.fn();
      render(
        <PeriodNumericField
          label="Schulden"
          annualValue={1200}
          onAnnualValueChange={onAnnualChange}
        />
      );

      const yearBtn = screen.getByRole("button", { name: /jährliche eingabe/i });
      fireEvent.click(yearBtn);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "2400" } });

      vi.advanceTimersByTime(250);
      expect(onAnnualChange).toHaveBeenCalledWith(2400);
      vi.useRealTimers();
    });
  });

  describe("ParentInputCard Integration", () => {
    it("rendert alle Standard-Einkommensfelder initial im Monatsmodus", () => {
      render(
        <ParentInputCard
          parentKey="parentA"
          name="Elternteil A"
          setName={vi.fn()}
          grossAnnual={48000}
          setGrossAnnual={vi.fn()}
          netAnnual={36000}
          setNetAnnual={vi.fn()}
          annualBonusNet={6000}
          setAnnualBonusNet={vi.fn()}
          isEmployed={true}
          setIsEmployed={vi.fn()}
          useFlatRate={true}
          setUseFlatRate={vi.fn()}
          customAnnualExpense={0}
          setCustomAnnualExpense={vi.fn()}
          pensionAnnual={1200}
          setPensionAnnual={vi.fn()}
          housingAnnual={0}
          setHousingAnnual={vi.fn()}
          debtsAnnual={2400}
          setDebtsAnnual={vi.fn()}
          directExpensesAnnual={1800}
          setDirectExpensesAnnual={vi.fn()}
          warmRentMonthly={1000}
          setWarmRentMonthly={vi.fn()}
          householdPersons={2}
          setHouseholdPersons={vi.fn()}
          receivesKindergeld={true}
          onSelectKindergeld={vi.fn()}
        />
      );

      // Brutto 48.000 / 12 = 4.000
      expect(screen.getByText(/Entspricht 48.000,00 € \/ Jahr/i)).toBeDefined();
      // Netto 36.000 / 12 = 3.000
      expect(screen.getByText(/Entspricht 36.000,00 € \/ Jahr \(Basis ohne Boni\)/i)).toBeDefined();
      // Boni bleibt fest als Jahreswert 6.000
      expect(screen.getByText(/Gesamt-Netto: Ø 3.500,00 € \/ Monat/i)).toBeDefined();
      // Altersvorsorge 1.200 / 12 = 100
      expect(screen.getByText(/Entspricht 1.200,00 € \/ Jahr \(max. 4% Brutto\)/i)).toBeDefined();
      // Schulden 2.400 / 12 = 200
      expect(screen.getByText(/Entspricht 2.400,00 € \/ Jahr/i)).toBeDefined();
      // Direkte Kindesausgaben 1.800 / 12 = 150
      expect(screen.getByText(/Entspricht 1.800,00 € \/ Jahr/i)).toBeDefined();
    });

    it("deaktiviert und setzt Felder zurück beim Umschalten auf Bürgergeld", () => {
      const setErwerbsstatus = vi.fn();
      const setIsEmployed = vi.fn();
      const setGrossAnnual = vi.fn();
      const setNetAnnual = vi.fn();
      const setAnnualBonusNet = vi.fn();
      const setPensionAnnual = vi.fn();
      const setHousingAnnual = vi.fn();
      const setDebtsAnnual = vi.fn();
      const setWarmRentMonthly = vi.fn();

      const { rerender } = render(
        <ParentInputCard
          parentKey="parentB"
          name="Elternteil B"
          setName={vi.fn()}
          erwerbsstatus="erwerbstaetig"
          setErwerbsstatus={setErwerbsstatus}
          grossAnnual={36000}
          setGrossAnnual={setGrossAnnual}
          netAnnual={24000}
          setNetAnnual={setNetAnnual}
          annualBonusNet={0}
          setAnnualBonusNet={setAnnualBonusNet}
          isEmployed={true}
          setIsEmployed={setIsEmployed}
          useFlatRate={true}
          setUseFlatRate={vi.fn()}
          customAnnualExpense={0}
          setCustomAnnualExpense={vi.fn()}
          pensionAnnual={0}
          setPensionAnnual={setPensionAnnual}
          housingAnnual={0}
          setHousingAnnual={setHousingAnnual}
          debtsAnnual={0}
          setDebtsAnnual={setDebtsAnnual}
          directExpensesAnnual={0}
          setDirectExpensesAnnual={vi.fn()}
          warmRentMonthly={800}
          setWarmRentMonthly={setWarmRentMonthly}
          householdPersons={2}
          setHouseholdPersons={vi.fn()}
          receivesKindergeld={false}
          onSelectKindergeld={vi.fn()}
        />
      );

      // Checkbox für Bürgergeld suchen
      const buergergeldCheckbox = screen.getByRole("checkbox", {
        name: /bürgergeld-bezug \/ nicht erwerbstätig/i,
      });
      expect(buergergeldCheckbox).toBeDefined();
      expect(buergergeldCheckbox.getAttribute("checked")).toBeNull();

      // Klick auf Bürgergeld
      fireEvent.click(buergergeldCheckbox);

      expect(setErwerbsstatus).toHaveBeenCalledWith("buergergeld");
      expect(setIsEmployed).toHaveBeenCalledWith(false);
      expect(setGrossAnnual).toHaveBeenCalledWith(0);
      expect(setNetAnnual).toHaveBeenCalledWith(0);
      expect(setAnnualBonusNet).toHaveBeenCalledWith(0);
      expect(setPensionAnnual).toHaveBeenCalledWith(0);
      expect(setHousingAnnual).toHaveBeenCalledWith(0);
      expect(setDebtsAnnual).toHaveBeenCalledWith(0);
      expect(setWarmRentMonthly).toHaveBeenCalledWith(0);

      // Re-render mit erwerbsstatus="buergergeld"
      rerender(
        <ParentInputCard
          parentKey="parentB"
          name="Elternteil B"
          setName={vi.fn()}
          erwerbsstatus="buergergeld"
          setErwerbsstatus={setErwerbsstatus}
          grossAnnual={0}
          setGrossAnnual={setGrossAnnual}
          netAnnual={0}
          setNetAnnual={setNetAnnual}
          annualBonusNet={0}
          setAnnualBonusNet={setAnnualBonusNet}
          isEmployed={false}
          setIsEmployed={setIsEmployed}
          useFlatRate={true}
          setUseFlatRate={vi.fn()}
          customAnnualExpense={0}
          setCustomAnnualExpense={vi.fn()}
          pensionAnnual={0}
          setPensionAnnual={setPensionAnnual}
          housingAnnual={0}
          setHousingAnnual={setHousingAnnual}
          debtsAnnual={0}
          setDebtsAnnual={setDebtsAnnual}
          directExpensesAnnual={0}
          setDirectExpensesAnnual={vi.fn()}
          warmRentMonthly={0}
          setWarmRentMonthly={setWarmRentMonthly}
          householdPersons={2}
          setHouseholdPersons={vi.fn()}
          receivesKindergeld={false}
          onSelectKindergeld={vi.fn()}
        />
      );

      // Status-Banner sichtbar
      expect(screen.getByText(/Bürgergeld-Bezug aktiv:/i)).toBeDefined();

      // Alle Spinbuttons sind disabled
      const spinbuttons = screen.getAllByRole("spinbutton") as HTMLInputElement[];
      spinbuttons.forEach((input) => {
        expect(input.hasAttribute("disabled")).toBe(true);
      });
    });
  });
});
