import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditTrailList } from "../AuditTrailList";
import type { CalculationStepLog } from "../../types/output";

const mockAuditTrail: CalculationStepLog[] = [
  {
    stepNumber: 1,
    label: "Bereinigtes Nettoeinkommen Elternteil A",
    formula: "Netto_A = 3.000 €",
    description: "Bereinigtes Nettoeinkommen von Elternteil A beträgt 3.000 €.",
    value: 3000,
  },
  {
    stepNumber: 2,
    label: "Bereinigtes Nettoeinkommen Elternteil B",
    formula: "Netto_B = 2.000 €",
    description: "Bereinigtes Nettoeinkommen von Elternteil B beträgt 2.000 €.",
    value: 2000,
  },
  {
    stepNumber: 3,
    label: "Kombiniertes Nettoeinkommen & DT-Einstufung",
    formula: "Kombiniert = 5.000 €",
    description: "Einstufung in Einkommensgruppe 6 der Düsseldorfer Tabelle 2026.",
    value: 5000,
  },
];

describe("AuditTrailList - Interaktive Schritt-Navigation", () => {
  beforeEach(() => {
    // Mock scrollTo und scrollIntoView für Happy-DOM
    window.HTMLElement.prototype.scrollTo = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("rendert alle Prüfstufen und die Navigationselemente korrekt", () => {
    render(<AuditTrailList auditTrail={mockAuditTrail} />);

    // Überschrift und Zähler
    expect(screen.getByText(/Schrittweises Prüfprotokoll \(3\)/i)).toBeDefined();
    expect(screen.getByText("Schritt")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();

    // Alle Stufen-Titel sichtbar
    expect(screen.getByText("Stufe 1: Bereinigtes Nettoeinkommen Elternteil A")).toBeDefined();
    expect(screen.getByText("Stufe 2: Bereinigtes Nettoeinkommen Elternteil B")).toBeDefined();
    expect(screen.getByText("Stufe 3: Kombiniertes Nettoeinkommen & DT-Einstufung")).toBeDefined();

    // Formeln und Beschreibungen
    expect(screen.getByText("Netto_A = 3.000 €")).toBeDefined();
    expect(
      screen.getByText("Bereinigtes Nettoeinkommen von Elternteil A beträgt 3.000 €.")
    ).toBeDefined();
  });

  it("initialisiert mit Stufe 1 als aktiver Schritt und deaktiviertem Vorheriger-Button", () => {
    render(<AuditTrailList auditTrail={mockAuditTrail} />);

    const prevBtn = screen.getByRole("button", { name: /vorheriger prüfschritt/i });
    const nextBtn = screen.getByRole("button", { name: /nächster prüfschritt/i });

    expect((prevBtn as HTMLButtonElement).disabled).toBe(true);
    expect((nextBtn as HTMLButtonElement).disabled).toBe(false);

    // Erstes Item ist aktiv markiert
    const step1El = screen
      .getByText("Stufe 1: Bereinigtes Nettoeinkommen Elternteil A")
      .closest(".audit-item");
    expect(step1El?.classList.contains("audit-item-active")).toBe(true);
    expect(step1El?.getAttribute("aria-current")).toBe("step");
  });

  it("springt beim Klick auf 'Nächster' zum nächsten Schritt und aktualisiert Buttons und Zähler", () => {
    const { container } = render(<AuditTrailList auditTrail={mockAuditTrail} />);

    const prevBtn = screen.getByRole("button", { name: /vorheriger prüfschritt/i });
    const nextBtn = screen.getByRole("button", { name: /nächster prüfschritt/i });

    // Klick auf Nächster -> Stufe 2
    fireEvent.click(nextBtn);

    const step2El = screen
      .getByText("Stufe 2: Bereinigtes Nettoeinkommen Elternteil B")
      .closest(".audit-item");
    expect(step2El?.classList.contains("audit-item-active")).toBe(true);
    expect(step2El?.getAttribute("aria-current")).toBe("step");

    expect((prevBtn as HTMLButtonElement).disabled).toBe(false);
    expect((nextBtn as HTMLButtonElement).disabled).toBe(false);

    const counter = container.querySelector(".audit-nav-counter");
    expect(counter?.textContent).toContain("Schritt 2 / 3");

    // scrollTo wurde aufgerufen
    expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalled();
  });

  it("deaktiviert 'Nächster'-Button beim Erreichen des letzten Schritts", () => {
    render(<AuditTrailList auditTrail={mockAuditTrail} />);

    const prevBtn = screen.getByRole("button", { name: /vorheriger prüfschritt/i });
    const nextBtn = screen.getByRole("button", { name: /nächster prüfschritt/i });

    // Schritt 1 -> 2
    fireEvent.click(nextBtn);
    // Schritt 2 -> 3 (letzter Schritt)
    fireEvent.click(nextBtn);

    const step3El = screen
      .getByText("Stufe 3: Kombiniertes Nettoeinkommen & DT-Einstufung")
      .closest(".audit-item");
    expect(step3El?.classList.contains("audit-item-active")).toBe(true);
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
    expect((prevBtn as HTMLButtonElement).disabled).toBe(false);

    // Klick auf Vorheriger geht zurück zu Schritt 2
    fireEvent.click(prevBtn);
    expect(step3El?.classList.contains("audit-item-active")).toBe(false);
    const step2El = screen
      .getByText("Stufe 2: Bereinigtes Nettoeinkommen Elternteil B")
      .closest(".audit-item");
    expect(step2El?.classList.contains("audit-item-active")).toBe(true);
  });

  it("aktiviert die entsprechende Stufe bei direktem Klick auf ein Prüfprotokoll-Element", () => {
    render(<AuditTrailList auditTrail={mockAuditTrail} />);

    const step3El = screen
      .getByText("Stufe 3: Kombiniertes Nettoeinkommen & DT-Einstufung")
      .closest(".audit-item");
    expect(step3El).toBeDefined();

    fireEvent.click(step3El!);

    expect(step3El?.classList.contains("audit-item-active")).toBe(true);
    const nextBtn = screen.getByRole("button", { name: /nächster prüfschritt/i });
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("unterstützt Tastaturnavigation (Enter und Leertaste) auf den Stufen-Elementen", () => {
    render(<AuditTrailList auditTrail={mockAuditTrail} />);

    const step2El = screen
      .getByText("Stufe 2: Bereinigtes Nettoeinkommen Elternteil B")
      .closest(".audit-item");

    // Enter-Taste
    fireEvent.keyDown(step2El!, { key: "Enter" });
    expect(step2El?.classList.contains("audit-item-active")).toBe(true);

    const step3El = screen
      .getByText("Stufe 3: Kombiniertes Nettoeinkommen & DT-Einstufung")
      .closest(".audit-item");

    // Leertaste
    fireEvent.keyDown(step3El!, { key: " " });
    expect(step3El?.classList.contains("audit-item-active")).toBe(true);
  });

  it("behandelt leere Prüfprotokolle robust (0 Schritte, beide Buttons deaktiviert)", () => {
    const { container } = render(<AuditTrailList auditTrail={[]} />);

    const prevBtn = screen.getByRole("button", { name: /vorheriger prüfschritt/i });
    const nextBtn = screen.getByRole("button", { name: /nächster prüfschritt/i });

    expect((prevBtn as HTMLButtonElement).disabled).toBe(true);
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);

    const counter = container.querySelector(".audit-nav-counter");
    expect(counter?.textContent).toBe("0 / 0");
  });

  it("behandelt Protokolle mit genau einem Schritt korrekt", () => {
    const singleStep: CalculationStepLog[] = [
      {
        stepNumber: 1,
        label: "Einzelschritt",
        formula: "X = 1",
        description: "Nur ein Schritt.",
        value: 1,
      },
    ];

    const { container } = render(<AuditTrailList auditTrail={singleStep} />);

    const prevBtn = screen.getByRole("button", { name: /vorheriger prüfschritt/i });
    const nextBtn = screen.getByRole("button", { name: /nächster prüfschritt/i });

    expect((prevBtn as HTMLButtonElement).disabled).toBe(true);
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);

    const counter = container.querySelector(".audit-nav-counter");
    expect(counter?.textContent).toContain("Schritt 1 / 1");
  });
});
