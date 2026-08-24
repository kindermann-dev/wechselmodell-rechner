import type { AgeGroup } from "../types/config";
import type { ChildInput } from "../types/input";
import type { ChildCalculationResult } from "../types/output";
import { NumericInput } from "./NumericInput";
import { Tooltip } from "./Tooltip";

interface ChildrenInputCardProps {
  childrenList: ChildInput[];
  childrenResults?: ChildCalculationResult[];
  onAddChild: () => void;
  onRemoveChild: (id: string) => void;
  onUpdateChild: (id: string, partial: Partial<ChildInput>) => void;
}

export function ChildrenInputCard({
  childrenList,
  childrenResults,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
}: ChildrenInputCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Kinder ({childrenList.length})</span>
        <Tooltip
          title="Kinderbedarfe im Wechselmodell (BGH XII ZB 565/15)"
          explanation="Jedes Kind hat einen einheitlichen Tabellenbedarf nach der Düsseldorfer Tabelle 2026, der auf dem zusammengerechneten Einkommen beider Eltern basiert und um konkrete Mehrbedarfe (insb. Wohnmehrbedarf) ergänzt wird."
          legalNote="Einheitlicher Kindesbedarf: Nach BGH XII ZB 565/15 Rn. 18 bestimmt das beiderseitige Einkommen den Regelbedarf. Bei zwei unterhaltsberechtigten Kindern greifen die normalen Tabellensätze ohne Herabstufung."
          caseLaw="BGH XII ZB 565/15 Rn. 18 (BGHZ 213, 254)"
        />
      </div>
      <div className="form-section">
        {childrenList.map((child, index) => {
          const childResult = childrenResults?.find(
            (r) => r.childId === child.id,
          );
          const wohnMehrbedarf = childResult?.calculatedWohnmehrbedarf || 0;
          const tabellenBedarf = childResult?.tabellenUnterhalt || 0;
          const actualHousing = childResult?.housingNeedCalculated || 0;
          const table20Pct = childResult?.housingPortionInTable || 0;

          return (
            <div key={child.id} className="child-item">
              <div className="child-header">
                <strong>{child.name || `Kind ${index + 1}`}</strong>
                {childrenList.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => onRemoveChild(child.id)}
                  >
                    Entfernen
                  </button>
                )}
              </div>
              <div className="input-grid">
                <div className="form-group">
                  <label className="form-label-with-tooltip">
                    <span>Altersstufe</span>
                    <Tooltip
                      title="Altersstufe nach Düsseldorfer Tabelle 2026"
                      explanation="Die 4 Altersstufen der Düsseldorfer Tabelle: 0–5 Jahre, 6–11 Jahre, 12–17 Jahre und ab 18 Jahre (Volljährige)."
                      legalNote="Volljährige Kinder (ab 18): Minderjährige Kinder sind privilegiert. Bei Volljährigen haften beide Eltern barunterhaltspflichtig und das staatliche Kindergeld (250 € bzw. 259 €) wird in voller Höhe (nicht nur hälftig) bedarfsmindernd abgezogen."
                      caseLaw="§ 1606 Abs. 3 S. 1 BGB; Düsseldorfer Tabelle 2026"
                    />
                  </label>
                  <select
                    className="form-select"
                    value={child.ageGroup}
                    onChange={(e) =>
                      onUpdateChild(child.id, {
                        ageGroup: e.target.value as AgeGroup,
                      })
                    }
                  >
                    <option value="0-5">0 - 5 Jahre</option>
                    <option value="6-11">6 - 11 Jahre</option>
                    <option value="12-17">12 - 17 Jahre</option>
                    <option value="18+">ab 18 Jahre</option>
                  </select>
                  {tabellenBedarf > 0 && (
                    <span
                      style={{ fontSize: "11px", color: "var(--text-muted)" }}
                    >
                      Tabellen-Grundbedarf: {tabellenBedarf.toFixed(2)} €
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label-with-tooltip">
                    <span>Errechneter Wohnmehrbedarf</span>
                    <Tooltip
                      title="Errechneter Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25)"
                      explanation="Automatisch ermittelte Wohnmehrkosten aus den Warmmieten beider Elternhaushalte nach der Pro-Kopf-Methode abzüglich des im Tabellenbedarf bereits enthaltenen 20%-Wohnkostenanteils."
                      legalNote={`Berechnung: Tatsächlicher Wohnbedarf (${actualHousing.toFixed(2)} €) minus 20% Tabellenanteil (${table20Pct.toFixed(2)} €) = ${wohnMehrbedarf.toFixed(2)} € / Monat. Übersteigende Mietkosten sind nach ständiger BGH-Rechtsprechung echter Kindesmehrbedarf.`}
                      caseLaw="BGH XII ZB 565/15 Rn. 25; Wendl/Dose § 1 Rn. 562"
                    />
                  </label>
                  <div
                    className="form-input"
                    style={{
                      backgroundColor: "var(--bg-surface-elevated)",
                      borderColor:
                        wohnMehrbedarf > 0
                          ? "rgba(56, 189, 248, 0.4)"
                          : "var(--border-subtle)",
                      color:
                        wohnMehrbedarf > 0
                          ? "var(--brand-primary)"
                          : "var(--text-muted)",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "default",
                    }}
                  >
                    <span>
                      {wohnMehrbedarf > 0
                        ? `+ ${wohnMehrbedarf.toFixed(2)} €`
                        : "0,00 €"}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 400,
                        color: "var(--text-muted)",
                      }}
                    >
                      {actualHousing > 0
                        ? `(Miete: ${actualHousing.toFixed(0)}€ - 20%: ${table20Pct.toFixed(0)}€)`
                        : "aus Warmmiete"}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color:
                        wohnMehrbedarf > 0
                          ? "var(--brand-primary)"
                          : "var(--text-muted)",
                    }}
                  >
                    {wohnMehrbedarf > 0
                      ? "Automatisch aus Warmmieten A + B ermittelt"
                      : "Warmmiete in Eltern-Tabs eintragen"}
                  </span>
                </div>
              </div>

              <div className="input-grid" style={{ marginTop: "8px" }}>
                <div className="form-group">
                  <label className="form-label-with-tooltip">
                    <span>Sonst. Mehr-/Sonderbedarf (€/Monat)</span>
                    <Tooltip
                      title="Sonstiger Mehrbedarf & Sonderbedarf"
                      explanation="Regelmäßige sonstige Mehrkosten (z. B. Fahrtkosten für den Kita-/Schultransfer, Kita-/Hortbeiträge, Nachhilfe, Therapien). Der Wohnmehrbedarf wird automatisch oben addiert."
                      legalNote="Wohnmehrbedarf vs. Sonstiger Mehrbedarf (BGH XII ZB 565/15): 1. Wohnmehrkosten werden anhand der Warmmieten und Haushaltsgrößen pro Kopf ermittelt und automatisch addiert. 2. Hier tragen Sie bitte sonstige Mehrbedarfe ein (z. B. Fahrtkosten, Hortbeiträge, Sportverein über dem Tabellenanteil)."
                      caseLaw="BGH XII ZB 565/15 Rn. 24–27; BGHZ 213, 254"
                    />
                  </label>
                  <NumericInput
                    value={
                      child.additionalNeeds.wechselmodellSurcharge +
                      child.additionalNeeds.specialNeeds
                    }
                    onChange={(val) =>
                      onUpdateChild(child.id, {
                        additionalNeeds: {
                          wechselmodellSurcharge: val,
                          specialNeeds: 0,
                        },
                      })
                    }
                    placeholder="z. B. 90 für Fahrtkosten"
                  />
                  <span
                    style={{ fontSize: "11px", color: "var(--text-muted)" }}
                  >
                    z. B. Fahrtkosten, Hort, Therapien
                  </span>
                </div>

                <div
                  className="form-group"
                  style={{ justifyContent: "flex-end" }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "8px 12px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: "11.5px", color: "var(--text-muted)" }}
                    >
                      Gesamtbedarf dieses Kindes:
                    </span>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {childResult
                        ? `${childResult.totalNeed.toFixed(2)} € / Monat`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <button type="button" className="btn-add" onClick={onAddChild}>
          + Weiteres Kind hinzufügen
        </button>
      </div>
    </div>
  );
}
