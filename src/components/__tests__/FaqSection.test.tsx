import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FaqSection } from "../FaqSection";

describe("FaqSection (SEO & Rechtsinformationen)", () => {
  it("rendert den FAQ-Kopfbereich mit Überschrift und Untertitel", () => {
    render(<FaqSection />);

    expect(
      screen.getByRole("heading", {
        name: /Häufig gestellte Fragen zum Wechselmodell/i,
      })
    ).toBeDefined();
    expect(screen.getByText(/Düsseldorfer Tabelle 2026/i)).toBeDefined();
  });

  it("zeigt alle zentralen Rechtsfragen an", () => {
    render(<FaqSection />);

    expect(
      screen.getByText(/Wie wird der Kindesunterhalt im echten 50:50-Wechselmodell berechnet\?/i)
    ).toBeDefined();
    expect(screen.getByText(/Wer muss im Wechselmodell an wen Unterhalt zahlen\?/i)).toBeDefined();
    expect(
      screen.getByText(/Wie wird das staatliche Kindergeld im Wechselmodell aufgeteilt\?/i)
    ).toBeDefined();
    expect(
      screen.getByText(
        /Was ist der Wohnmehrbedarf und wie wird er nach der Kopfzahlmethode ermittelt\?/i
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        /Wie werden Sachausgaben wie Hortgebühren, Kleidung oder Schulbedarf geteilt\?/i
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        /Wie werden Beiträge zur privaten Kranken- und Pflegeversicherung \(PKV\/PPV\) für Eltern und Kinder berücksichtigt\?/i
      )
    ).toBeDefined();
    expect(
      screen.getByText(/Gilt diese Berechnung auch bei einer 40:60- oder 30:70-Betreuung\?/i)
    ).toBeDefined();
  });

  it("öffnet und schließt FAQ-Akkordeon-Einträge bei Klick", () => {
    render(<FaqSection />);

    const kindergeldBtn = screen.getByRole("button", {
      name: /Wie wird das staatliche Kindergeld im Wechselmodell aufgeteilt\?/i,
    });

    // Initial ist die Kindergeld-Frage geschlossen
    expect(screen.queryByText(/259 € pro Monat und Kind/i)).toBeNull();

    // Klick zum Öffnen
    fireEvent.click(kindergeldBtn);
    expect(screen.getByText(/259 € pro Monat und Kind/i)).toBeDefined();
    expect(screen.getAllByText(/BGH XII ZB 45\/15/i).length).toBeGreaterThan(0);

    // Klick zum Schließen
    fireEvent.click(kindergeldBtn);
    expect(screen.queryByText(/259 € pro Monat und Kind/i)).toBeNull();
  });

  it("zeigt rechtliche Hintergründe zur Abgrenzung bei asymmetrischer Betreuung (40:60)", () => {
    render(<FaqSection />);

    const asymmBtn = screen.getByRole("button", {
      name: /Gilt diese Berechnung auch bei einer 40:60- oder 30:70-Betreuung\?/i,
    });

    fireEvent.click(asymmBtn);
    expect(screen.getByText(/Residenzmodell mit erweitertem Umgang/i)).toBeDefined();
    expect(screen.getByText(/10 % \(maximal 15 %\)/i)).toBeDefined();
    expect(screen.getByText(/BGH XII ZB 415\/25/i)).toBeDefined();
    expect(screen.getByText(/BGH XII ZB 234\/13/i)).toBeDefined();
  });
});
