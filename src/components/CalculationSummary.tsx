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
          <Tooltip
            title="Kombiniertes bereinigtes Nettoeinkommen (BGH XII ZB 565/15)"
            explanation="Summe der bereinigten Nettoeinkünfte beider Elternteile (N_adj,A + N_adj,B)."
            legalNote="Zwingender BGH-Grundsatz (Rn. 18): Das zusammengerechnete Elterneinkommen bestimmt die DT-Einkommensgruppe. Eine Aufspaltung in zwei getrennte Berechnungen nach den Einzeleinkommen ist unzulässig, damit das Kind am gemeinsamen Lebensstandard beider Eltern teilhat."
            caseLaw="BGH XII ZB 565/15 Rn. 18 (BGHZ 213, 254)"
          />
        </div>
        <div className="summary-tile-val">
          {combinedAdjustedNet.toFixed(2)} €
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
          <span>DT-Einstufung</span>
          <Tooltip
            title="Einkommensgruppe Düsseldorfer Tabelle 2026"
            explanation="Die Tabelle umfasst 15 Einkommensgruppen (von bis 2.100 € bis 11.200 € bereinigtes Netto)."
            legalNote="Bedarfssätze nach BGH XII ZB 565/15 Rn. 27: Bei höherem kombinierten Einkommen steigen die Bedarfssätze stufenweise von 100 % bis 200 %; darin sind anteilig auch höhere Beträge für Kultur, Hobbys und Freizeit enthalten."
            caseLaw="Düsseldorfer Tabelle 2026; BGH XII ZB 565/15"
          />
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
          <Tooltip
            title="Haftungsquote Elternteil A (BGH XII ZB 565/15)"
            explanation="Anteil von Elternteil A am gesamten Barunterhaltsbedarf."
            legalNote="Quotelung nach BGH XII ZB 565/15 Rn. 29: Berechnet sich zwingend nach Abzug des angemessenen Selbstbehalts (1.750 €): Q_A = max(0, N_adj,A - 1.750 €) / (H_A + H_B). Eine Quotelung nach dem reinen Netto ohne Selbstbehalt ist rechtsfehlerhaft."
            caseLaw="BGH XII ZB 565/15 Rn. 29; BGH XII ZB 599/13"
          />
        </div>
        <div className="summary-tile-val">
          {(liabilityShareA * 100).toFixed(1)} %
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
          <span>Haftungsquote B</span>
          <Tooltip
            title="Haftungsquote Elternteil B (BGH XII ZB 565/15)"
            explanation="Anteil von Elternteil B am gesamten Barunterhaltsbedarf."
            legalNote="Quotelung nach BGH XII ZB 565/15 Rn. 29: Berechnet sich nach Abzug des angemessenen Selbstbehalts (1.750 €): Q_B = max(0, N_adj,B - 1.750 €) / (H_A + H_B). Beide Quoten ergeben in der Summe stets genau 100 %."
            caseLaw="BGH XII ZB 565/15 Rn. 29; BGH XII ZB 599/13"
          />
        </div>
        <div className="summary-tile-val">
          {(liabilityShareB * 100).toFixed(1)} %
        </div>
      </div>
    </div>
  );
}
