import { useState, useId } from "react";
import { NumericInput } from "./NumericInput";
import { Tooltip } from "./Tooltip";
import { PeriodToggle, type PeriodUnit } from "./PeriodToggle";
import { round2 } from "../calculator/rounding";

export interface PeriodNumericFieldProps {
  id?: string;
  label: string;
  annualValue: number;
  onAnnualValueChange: (annualValue: number) => void;
  tooltipTitle?: string;
  tooltipExplanation?: string;
  tooltipLegalNote?: string;
  tooltipCaseLaw?: string;
  defaultPeriod?: PeriodUnit;
  disabled?: boolean;
  placeholder?: string;
  extraSubtext?: string;
  min?: number;
  max?: number;
}

/**
 * Universelles Eingabefeld für Geldbeträge mit integriertem Zeitraum-Umschalter (€/Monat vs. €/Jahr).
 *
 * Im Standard werden Werte auf Monatsbasis eingegeben und für den unterhaltsrechtlichen
 * Rechenkern automatisch und verlustfrei in Jahreswerte umgerechnet.
 */
export function PeriodNumericField({
  id,
  label,
  annualValue,
  onAnnualValueChange,
  tooltipTitle,
  tooltipExplanation,
  tooltipLegalNote,
  tooltipCaseLaw,
  defaultPeriod = "monthly",
  disabled = false,
  placeholder,
  extraSubtext,
  min,
  max,
}: PeriodNumericFieldProps) {
  const [period, setPeriod] = useState<PeriodUnit>(defaultPeriod);
  const generatedId = useId();
  const inputId = id || generatedId;

  const currentAnnual = Number(annualValue) || 0;
  const displayValue = period === "monthly" ? round2(currentAnnual / 12) : currentAnnual;

  const handleChange = (val: number) => {
    if (period === "monthly") {
      onAnnualValueChange(round2(val * 12));
    } else {
      onAnnualValueChange(round2(val));
    }
  };

  const dynamicPlaceholder = placeholder || (period === "monthly" ? "z. B. 3000" : "z. B. 36000");

  const formattedAnnual = currentAnnual.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedMonthly = (currentAnnual / 12).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={inputId} className="form-label-text">
          <span>{label}</span>
        </label>
        <div className="form-label-controls">
          <PeriodToggle
            period={period}
            onChange={setPeriod}
            disabled={disabled}
            ariaLabel={`Zeitraum für ${label}`}
          />
          {tooltipTitle && (
            <Tooltip
              title={tooltipTitle}
              explanation={tooltipExplanation || ""}
              legalNote={tooltipLegalNote}
              caseLaw={tooltipCaseLaw}
            />
          )}
        </div>
      </div>
      <NumericInput
        id={inputId}
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={dynamicPlaceholder}
        min={min}
        max={max}
      />
      <span className="form-hint">
        {period === "monthly" ? (
          <>
            Entspricht {formattedAnnual} € / Jahr
            {extraSubtext ? ` (${extraSubtext})` : ""}
          </>
        ) : (
          <>
            Ø {formattedMonthly} € / Monat
            {extraSubtext ? ` (${extraSubtext})` : ""}
          </>
        )}
      </span>
    </div>
  );
}
