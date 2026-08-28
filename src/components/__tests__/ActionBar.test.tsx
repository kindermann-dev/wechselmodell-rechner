import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ActionBar } from "../ActionBar";

describe("ActionBar Component", () => {
  it("sollte alle Aktions-Buttons rendern inklusive Link kopieren", () => {
    const onSelectScenario = vi.fn();
    const onCopySummary = vi.fn();
    const onShareLink = vi.fn();
    const onPrint = vi.fn();
    const onReset = vi.fn();

    render(
      <ActionBar
        currentScenario="bgh-standard"
        onSelectScenario={onSelectScenario}
        onShareLink={onShareLink}
        isLinkCopied={false}
        onCopySummary={onCopySummary}
        isCopied={false}
        onPrint={onPrint}
        onReset={onReset}
      />
    );

    const shareBtn = screen.getByText("🔗 Link kopieren");
    expect(shareBtn).toBeDefined();

    const copyBtn = screen.getByText("📋 Ergebnis kopieren");
    expect(copyBtn).toBeDefined();

    const printBtn = screen.getByText("🖨️ Drucken / PDF");
    expect(printBtn).toBeDefined();

    const resetBtn = screen.getByText("🔄 Zurücksetzen");
    expect(resetBtn).toBeDefined();
  });

  it("sollte onShareLink auslösen wenn der Link-Button geklickt wird", () => {
    const onShareLink = vi.fn();
    render(
      <ActionBar
        currentScenario="bgh-standard"
        onSelectScenario={vi.fn()}
        onShareLink={onShareLink}
        isLinkCopied={false}
        onCopySummary={vi.fn()}
        isCopied={false}
        onPrint={vi.fn()}
        onReset={vi.fn()}
      />
    );

    const shareBtn = screen.getByText("🔗 Link kopieren");
    fireEvent.click(shareBtn);
    expect(onShareLink).toHaveBeenCalledTimes(1);
  });

  it("sollte optisches Feedback '✓ Link kopiert!' anzeigen wenn isLinkCopied true ist", () => {
    render(
      <ActionBar
        currentScenario="bgh-standard"
        onSelectScenario={vi.fn()}
        onShareLink={vi.fn()}
        isLinkCopied={true}
        onCopySummary={vi.fn()}
        isCopied={false}
        onPrint={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("✓ Link kopiert!")).toBeDefined();
  });
});
