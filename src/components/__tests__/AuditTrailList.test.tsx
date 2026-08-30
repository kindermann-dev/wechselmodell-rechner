import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditTrailList } from "../AuditTrailList";
import { formatAuditTrailAsText } from "../../utils/auditTrailFormatter";
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

  describe("Kopieren-Button & Textformatierung", () => {
    it("rendert den Kopieren-Button links neben dem Vorheriger-Button", () => {
      const { container } = render(<AuditTrailList auditTrail={mockAuditTrail} />);

      const copyBtn = screen.getByRole("button", { name: /prüfprotokoll kopieren/i });
      const prevBtn = screen.getByRole("button", { name: /vorheriger prüfschritt/i });

      expect(copyBtn).toBeDefined();
      expect(copyBtn.textContent).toContain("Kopieren");
      expect((copyBtn as HTMLButtonElement).disabled).toBe(false);

      // Prüfe DOM-Reihenfolge: Kopieren-Button muss direkt vor dem Vorheriger-Button liegen
      const controls = container.querySelector(".audit-nav-controls");
      const buttons = controls?.querySelectorAll(".btn-audit-nav");
      expect(buttons?.[0]).toBe(copyBtn);
      expect(buttons?.[1]).toBe(prevBtn);
    });

    it("deaktiviert den Kopieren-Button bei leerem Prüfprotokoll", () => {
      render(<AuditTrailList auditTrail={[]} />);
      const copyBtn = screen.getByRole("button", { name: /prüfprotokoll kopieren/i });
      expect((copyBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it("formatiert das vollständige Prüfprotokoll sauber als Text", () => {
      const text = formatAuditTrailAsText(mockAuditTrail);
      expect(text).toContain("PRÜFPROTOKOLL: KINDESUNTERHALT WECHSELMODELL (50:50)");
      expect(text).toContain("[Stufe 1: Bereinigtes Nettoeinkommen Elternteil A]");
      expect(text).toContain("Formel:\nNetto_A = 3.000 €");
      expect(text).toContain(
        "Erläuterung & Rechenschritte:\nBereinigtes Nettoeinkommen von Elternteil A beträgt 3.000 €."
      );
      expect(text).toContain("[Stufe 2: Bereinigtes Nettoeinkommen Elternteil B]");
      expect(text).toContain("[Stufe 3: Kombiniertes Nettoeinkommen & DT-Einstufung]");
    });
  });

  describe("Desktop Hover Tooltip", () => {
    it("zeigt den Hover-Tooltip bei Desktop-Pointer-Hover an und blendet ihn bei mouseLeave aus", () => {
      // Mock matchMedia für Desktop mit Hover-Support
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("hover: hover") && query.includes("pointer: fine"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(<AuditTrailList auditTrail={mockAuditTrail} />);

      const step1El = container.querySelectorAll(".audit-item")[0];
      expect(step1El).toBeDefined();

      // MouseEnter auf Schritt 1
      fireEvent.mouseEnter(step1El);

      // Tooltip-Popover im Body gerendert
      const popover = document.body.querySelector(".audit-hover-popover");
      expect(popover).not.toBeNull();
      expect(popover?.textContent).toContain("Stufe 1: Bereinigtes Nettoeinkommen Elternteil A");
      expect(popover?.textContent).toContain("Netto_A = 3.000 €");
      expect(popover?.textContent).toContain(
        "Bereinigtes Nettoeinkommen von Elternteil A beträgt 3.000 €."
      );

      // MouseLeave blendet Tooltip wieder aus
      fireEvent.mouseLeave(step1El);
      expect(document.body.querySelector(".audit-hover-popover")).toBeNull();
    });
  });
});
