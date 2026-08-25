import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangelogModal } from "../ChangelogModal";
import { APP_VERSION } from "../../../config/changelog";

describe("ChangelogModal Komponente", () => {
  it("rendert nichts im DOM, wenn isOpen auf false steht", () => {
    const { container } = render(<ChangelogModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("rendert den Modaldialog, wenn isOpen auf true steht", () => {
    render(<ChangelogModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Versionshistorie & Changelog/i)).toBeDefined();
    expect(screen.getByText(new RegExp(`v${APP_VERSION}`, "i"))).toBeDefined();
    expect(screen.getByText(/Rechtliche Präzisierung & BGH-Kindergeld-Splitting/i)).toBeDefined();
  });

  it("ruft onClose auf, wenn der Schließen-Button geklickt wird", () => {
    const handleClose = vi.fn();
    render(<ChangelogModal isOpen={true} onClose={handleClose} />);

    const closeButtons = screen.getAllByRole("button", { name: /Schließen/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);

    // Klick auf den oberen X-Button
    fireEvent.click(closeButtons[0]!);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Klick auf den unteren Schließen-Button
    fireEvent.click(closeButtons[1]!);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it("ruft onClose auf, wenn die Escape-Taste gedrückt wird", () => {
    const handleClose = vi.fn();
    render(<ChangelogModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("ruft onClose auf, wenn der Hintergrund (Backdrop) angeklickt wird", () => {
    const handleClose = vi.fn();
    const { container } = render(<ChangelogModal isOpen={true} onClose={handleClose} />);

    const backdrop = container.querySelector(".modal-backdrop");
    expect(backdrop).toBeDefined();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it("verhindert das Schließen, wenn innerhalb der Modalkarte geklickt wird", () => {
    const handleClose = vi.fn();
    const { container } = render(<ChangelogModal isOpen={true} onClose={handleClose} />);

    const modalCard = container.querySelector(".modal-card");
    expect(modalCard).toBeDefined();
    if (modalCard) {
      fireEvent.click(modalCard);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });
});
