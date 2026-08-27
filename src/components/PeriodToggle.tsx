export type PeriodUnit = "monthly" | "yearly";

interface PeriodToggleProps {
  period: PeriodUnit;
  onChange: (period: PeriodUnit) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

/**
 * Kompakte Umschaltkomponente zwischen Monatsbeträgen (€ / Monat) und Jahresbeträgen (€ / Jahr).
 */
export function PeriodToggle({
  period,
  onChange,
  ariaLabel = "Zeitraum auswählen",
  disabled = false,
}: PeriodToggleProps) {
  return (
    <div className="period-toggle" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={`period-btn ${period === "monthly" ? "active" : ""}`}
        onClick={() => onChange("monthly")}
        disabled={disabled}
        aria-pressed={period === "monthly"}
        aria-label="Monatliche Eingabe (€ / Monat)"
        title="Monatliche Eingabe (€ / Monat)"
      >
        € / Mo
      </button>
      <button
        type="button"
        className={`period-btn ${period === "yearly" ? "active" : ""}`}
        onClick={() => onChange("yearly")}
        disabled={disabled}
        aria-pressed={period === "yearly"}
        aria-label="Jährliche Eingabe (€ / Jahr)"
        title="Jährliche Eingabe (€ / Jahr)"
      >
        € / Jahr
      </button>
    </div>
  );
}
