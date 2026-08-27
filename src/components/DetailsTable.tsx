import { TOOLTIP_TEXTS } from "../config/legalTexts";
import type { ParentCalculationDetails } from "../types/output";
import { Tooltip } from "./Tooltip";

interface DetailsTableProps {
  parentAName: string;
  parentBName: string;
  parentA: ParentCalculationDetails;
  parentB: ParentCalculationDetails;
}

export function DetailsTable({ parentAName, parentBName, parentA, parentB }: DetailsTableProps) {
  const nameA = parentAName && parentAName.trim() ? parentAName : "Elternteil A";
  const nameB = parentBName && parentBName.trim() ? parentBName : "Elternteil B";

  return (
    <div className="table-container">
      <table className="details-table">
        <thead>
          <tr>
            <th className="col-position">Berechnungsposition (monatlich / jährlich)</th>
            <th className="col-parent header-parent-a">{nameA}</th>
            <th className="col-parent header-parent-b">{nameB}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Bereinigtes Nettoeinkommen</span>
                <Tooltip {...TOOLTIP_TEXTS.detailsTable.adjustedNet} />
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                1/12 des bereinigten Jahresnettos
              </div>
            </td>
            <td className="number">
              <div>{parentA.adjustedNet.toFixed(2)} € / Mo.</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {(parentA.adjustedNet * 12).toFixed(2)} € / Jahr
              </div>
            </td>
            <td className="number">
              <div>{parentB.adjustedNet.toFixed(2)} € / Mo.</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {(parentB.adjustedNet * 12).toFixed(2)} € / Jahr
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Haftungseinkommen (&gt; 1.750 € SB)</span>
                <Tooltip {...TOOLTIP_TEXTS.detailsTable.liabilityIncome} />
              </div>
            </td>
            <td className="number">{parentA.liabilityIncome.toFixed(2)} €</td>
            <td className="number">{parentB.liabilityIncome.toFixed(2)} €</td>
          </tr>
          <tr>
            <td>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Haftungsanteil am Barbedarf (abzgl. Naturalunterhalt)</span>
                <Tooltip {...TOOLTIP_TEXTS.detailsTable.primaryObligation} />
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Anteil minus 50% Naturalunterhalt
              </div>
            </td>
            <td className="number">{parentA.primaryObligation.toFixed(2)} €</td>
            <td className="number">{parentB.primaryObligation.toFixed(2)} €</td>
          </tr>
          <tr>
            <td>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Kindergeld-Ausgleich</span>
                <Tooltip {...TOOLTIP_TEXTS.detailsTable.kindergeldAdjustment} />
              </div>
            </td>
            <td className="number">
              {parentA.kindergeldAdjustment > 0 ? "+" : ""}
              {parentA.kindergeldAdjustment.toFixed(2)} €
            </td>
            <td className="number">
              {parentB.kindergeldAdjustment > 0 ? "+" : ""}
              {parentB.kindergeldAdjustment.toFixed(2)} €
            </td>
          </tr>
          <tr>
            <td>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Direktkosten-Ausgleich (nach Quoten)</span>
                <Tooltip {...TOOLTIP_TEXTS.detailsTable.directExpensesAdjustment} />
              </div>
            </td>
            <td className="number">
              {parentA.directExpensesDeduction > 0 ? "+" : ""}
              {parentA.directExpensesDeduction.toFixed(2)} €
            </td>
            <td className="number">
              {parentB.directExpensesDeduction > 0 ? "+" : ""}
              {parentB.directExpensesDeduction.toFixed(2)} €
            </td>
          </tr>
          <tr className="row-total">
            <td>
              <div style={{ display: "flex", alignItems: "center" }}>
                <strong>Verbleibendes Netto</strong>
                <Tooltip {...TOOLTIP_TEXTS.detailsTable.remainingIncome} />
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                nach Barunterhaltsausgleich
              </div>
            </td>
            <td className="number font-highlight">
              <div>
                <strong>{parentA.remainingIncome.toFixed(2)} € / Mo.</strong>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontWeight: 400,
                }}
              >
                {(parentA.remainingIncome * 12).toFixed(2)} € / Jahr
              </div>
            </td>
            <td className="number font-highlight">
              <div>
                <strong>{parentB.remainingIncome.toFixed(2)} € / Mo.</strong>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontWeight: 400,
                }}
              >
                {(parentB.remainingIncome * 12).toFixed(2)} € / Jahr
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
