import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../App";

describe("Mehrseitige Druckansicht & Ergebnis-Tab-Rendering", () => {
  it("rendert im DOM stets beide Ergebnisbereiche (Tabelle und Prüfprotokoll) für den Ausdruck", () => {
    render(<App />);

    // Beide Tab-Panels müssen im DOM existieren
    const tablePanel = screen.getByRole("tabpanel", { name: /tabellarische übersicht/i });
    const auditPanel = screen.getByRole("tabpanel", { name: /schrittweises prüfprotokoll/i });

    expect(tablePanel).toBeDefined();
    expect(auditPanel).toBeDefined();

    // Druck-Klassen für 2-Seiten-Ausgabe müssen vorhanden sein
    expect(tablePanel.classList.contains("print-page-1")).toBe(true);
    expect(auditPanel.classList.contains("print-page-2")).toBe(true);
  });

  it("steuert die Bildschirm-Sichtbarkeit über is-tab-hidden-screen beim Tab-Wechsel", () => {
    render(<App />);

    const tablePanel = screen.getByRole("tabpanel", { name: /tabellarische übersicht/i });
    const auditPanel = screen.getByRole("tabpanel", { name: /schrittweises prüfprotokoll/i });

    // Standardmäßig: Tabelle aktiv, Prüfprotokoll für Screen versteckt (aber für Print im DOM)
    expect(tablePanel.classList.contains("active")).toBe(true);
    expect(tablePanel.classList.contains("is-tab-hidden-screen")).toBe(false);
    expect(auditPanel.classList.contains("is-tab-hidden-screen")).toBe(true);

    // Klick auf Tab 'Schrittweises Prüfprotokoll'
    const auditTabBtn = screen.getByRole("button", { name: /schrittweises prüfprotokoll/i });
    fireEvent.click(auditTabBtn);

    // Jetzt: Prüfprotokoll aktiv, Tabelle für Screen versteckt
    expect(auditPanel.classList.contains("active")).toBe(true);
    expect(auditPanel.classList.contains("is-tab-hidden-screen")).toBe(false);
    expect(tablePanel.classList.contains("is-tab-hidden-screen")).toBe(true);
  });

  it("enthält auf Seite 2 im Prüfprotokoll alle 7 Prüfstufen und die BGH-Referenzen", () => {
    render(<App />);

    const auditPanel = screen.getByRole("tabpanel", { name: /schrittweises prüfprotokoll/i });

    // Prüfung der Stufen im DOM
    expect(auditPanel.textContent).toContain("Stufe 1: Bereinigtes Nettoeinkommen");
    expect(auditPanel.textContent).toContain("Stufe 2: Bereinigtes Nettoeinkommen");
    expect(auditPanel.textContent).toContain(
      "Stufe 3: Kombiniertes Nettoeinkommen & DT-Einstufung"
    );
    expect(auditPanel.textContent).toContain("Stufe 4: Haftungsanteile");
    expect(auditPanel.textContent).toContain("Stufe 5: Bedarfsberechnung Kind");
    expect(auditPanel.textContent).toContain("Stufe 6: Kindergeld- & Direktaufwandsverrechnung");
    expect(auditPanel.textContent).toContain(
      "Stufe 7: Endabrechnung & Zahlbetrag (Spitzabrechnung)"
    );

    // Druck-Untertitel vorhanden
    expect(auditPanel.textContent).toContain("BGH XII ZB 565/15");
  });

  it("ordnet den Versions-Badge-Button und rechtlichen Tooltip in der ausblendbaren .header-actions Box an", () => {
    render(<App />);

    const versionBtn = screen.getByRole("button", {
      name: /version \d+\.\d+\.\d+ changelog anzeigen/i,
    });
    expect(versionBtn).toBeDefined();
    expect(versionBtn.classList.contains("btn-version-badge")).toBe(true);

    const headerActionsContainer = versionBtn.closest(".header-actions");
    expect(headerActionsContainer).not.toBeNull();
  });

  it("stellt sicher, dass die Ergebnis-Panels (results-tab-pane) die Tabelle und das Prüfprotokoll vollständig enthalten", () => {
    render(<App />);

    const resultsContainer = document.querySelector(".results-tab-content");
    expect(resultsContainer).not.toBeNull();

    const panes = resultsContainer?.querySelectorAll(".results-tab-pane");
    expect(panes?.length).toBe(2);

    // Tab 1: Tabelle enthalten
    const tableContainer = panes?.[0].querySelector(".table-container");
    expect(tableContainer).not.toBeNull();
    const table = tableContainer?.querySelector(".details-table");
    expect(table).not.toBeNull();

    // Tab 2: Prüfprotokoll enthalten
    const auditWrapper = panes?.[1].querySelector(".audit-wrapper");
    expect(auditWrapper).not.toBeNull();
    const auditList = auditWrapper?.querySelector(".audit-list");
    expect(auditList).not.toBeNull();
  });
});
