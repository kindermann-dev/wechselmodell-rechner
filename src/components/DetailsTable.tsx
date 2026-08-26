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
                <Tooltip
                  title="Bereinigtes Nettoeinkommen"
                  explanation="Maßgebliches unterhaltsrechtliches Einkommen (1/12 des Jahres-Gesamtnettos inkl. Boni abzüglich aller zulässigen Abzüge)."
                  legalNote="Abzugspositionen: 5%-Berufspauschale, max. 4% zusätzliche Altersvorsorge, berücksichtigungsfähige Verbindlichkeiten, zzgl. Wohnvorteil."
                  caseLaw="Düsseldorfer Tabelle 2026 Anm. A"
                />
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
                <Tooltip
                  title="Haftungseinkommen über Selbstbehalt"
                  explanation="Einkommensanteil, der den angemessenen Selbstbehalt (SB_ang = 1.750 €) übersteigt."
                  legalNote="Rechtsgrundsatz nach BGH XII ZB 565/15 Rn. 29 & XII ZB 599/13: Nur das Einkommen oberhalb von 1.750 € dient zur Quotenbildung. Unterschreitet ein Elternteil diese Grenze, haftet er rechnerisch mit 0 % (außer im Mangelfall)."
                  caseLaw="BGH XII ZB 565/15 Rn. 29; BGH XII ZB 599/13"
                />
              </div>
            </td>
            <td className="number">{parentA.liabilityIncome.toFixed(2)} €</td>
            <td className="number">{parentB.liabilityIncome.toFixed(2)} €</td>
          </tr>
          <tr>
            <td>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Haftungsanteil am Barbedarf (abzgl. Naturalunterhalt)</span>
                <Tooltip
                  title="Haftungsanteil am Barunterhalt (BGH XII ZB 565/15)"
                  explanation="Rechnerischer Barunterhaltsanteil vor Kindergeld- und Direktaufwandsverrechnung (Unterhaltsspitze)."
                  legalNote="Spitzabrechnung nach BGH XII ZB 565/15 Rn. 30: Jeder Elternteil leistet im 50:50-Wechselmodell 50 % des Kindesbedarfs als Naturalunterhalt (Wohnung, Essen). Der geschuldete Barunterhalt entspricht daher dem Haftungsanteil abzüglich des erbrachten 50%-Naturalunterhalts (Anteil_A - 50% * B_ges)."
                  caseLaw="BGH XII ZB 565/15 Rn. 30 (BGHZ 213, 254)"
                />
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
                <Tooltip
                  title="Kindergeld-Ausgleich im Innenverhältnis (BGH XII ZB 45/15 & XII ZB 565/15)"
                  explanation="Ausgleich des staatlichen Kindergeldes: 25% fixer Betreuungsanteil an den anderen Elternteil zuzüglich dessen Quotenanteil am 50%-Barunterhaltsanteil."
                  legalNote="BGH, Beschluss vom 20.04.2016 – Az. XII ZB 45/15 & BGH XII ZB 565/15 Rn. 32: Das Kindergeld wird in 50 % Betreuungsanteil (je 25 % pro Elternteil einkommensunabhängig) und 50 % Baranteil (Minderung des Barbedarfs nach Haftungsquoten) aufgeteilt. Der Auszahlungsempfänger gleicht den Betreuungsanteil (25 %) und die quotenmäßige Barentlastung des anderen Elternteils aus."
                  caseLaw="BGH XII ZB 45/15 (FamRZ 2016, 1053); BGH XII ZB 565/15 Rn. 32; § 1612b BGB"
                />
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
                <Tooltip
                  title="Quotenmäßige Verrechnung direkter Kindesausgaben (BGH XII ZB 565/15)"
                  explanation="Quotenmäßige Beteiligung an zentral verauslagten Sach- und Anschaffungskosten für das Kind (z. B. Hort, Schulessen, Kleidung)."
                  legalNote="Quotenmäßige Tragung nach BGH XII ZB 565/15 Rn. 28–30: Direktkosten, die ein Elternteil für das Kind aufwendet, sind von beiden Eltern nach ihren Haftungsquoten (Q_A : Q_B) zu tragen. Der andere Elternteil erstattet seinen Quotenanteil (z. B. + Q_A * D_B für Elternteil A)."
                  caseLaw="BGH XII ZB 565/15 Rn. 28–30"
                />
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
                <Tooltip
                  title="Verbleibendes Nettoeinkommen & Selbstbehalt"
                  explanation="Nettoeinkommen des Elternteils nach Durchführung der monatlichen Ausgleichszahlung."
                  legalNote="Notwendiger Selbstbehalt: Dem barunterhaltspflichtigen Elternteil müssen nach Zahlung mindestens 1.450 € (erwerbstätig) bzw. 1.200 € (nichterwerbstätig) verbleiben. Andernfalls liegt ein Mangelfall vor."
                  caseLaw="Düsseldorfer Tabelle 2026 Anm. B.I"
                />
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
