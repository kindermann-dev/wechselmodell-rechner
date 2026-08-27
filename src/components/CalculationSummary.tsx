import { TOOLTIP_TEXTS } from "../config/legalTexts";
import type { DtIncomeTier } from "../types/config";
import { Tooltip } from "./Tooltip";

interface CalculationSummaryProps {
  combinedAdjustedNet: number;
  appliedDtTier: DtIncomeTier;
  liabilityShareA: number;
  liabilityShareB: number;
}

export function CalculationSummary({
  combinedAdjustedNet,
  appliedDtTier,
  liabilityShareA,
  liabilityShareB,
}: CalculationSummaryProps) {
  return (
    <div className="summary-grid">
      <div className="summary-tile">
        <div
          className="summary-tile-label"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Kombiniertes Netto</span>
          <Tooltip {...TOOLTIP_TEXTS.summary.combinedNet} />
        </div>
        <div className="summary-tile-val">{combinedAdjustedNet.toFixed(2)} €</div>
      </div>

      <div className="summary-tile">
        <div
          className="summary-tile-label"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>DT-Einstufung</span>
          <Tooltip {...TOOLTIP_TEXTS.summary.dtTier} />
        </div>
        <div className="summary-tile-val">
          Gruppe {appliedDtTier.tierIndex} ({appliedDtTier.percentage}%)
        </div>
      </div>

      <div className="summary-tile">
        <div
          className="summary-tile-label"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Haftungsquote A</span>
          <Tooltip {...TOOLTIP_TEXTS.summary.liabilityShareA} />
        </div>
        <div className="summary-tile-val">{(liabilityShareA * 100).toFixed(1)} %</div>
      </div>

      <div className="summary-tile">
        <div
          className="summary-tile-label"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Haftungsquote B</span>
          <Tooltip {...TOOLTIP_TEXTS.summary.liabilityShareB} />
        </div>
        <div className="summary-tile-val">{(liabilityShareB * 100).toFixed(1)} %</div>
      </div>
    </div>
  );
}
