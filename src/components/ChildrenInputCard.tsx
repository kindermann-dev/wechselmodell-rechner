import type { AgeGroup } from "../types/config";
import type { ChildInput } from "../types/input";
import type { ChildCalculationResult } from "../types/output";
import { NumericInput } from "./NumericInput";
import { Tooltip } from "./Tooltip";

interface ChildrenInputCardProps {
  childrenList: ChildInput[];
  childrenResults?: ChildCalculationResult[];
  kindergeldPerChild: number;
  setKindergeldPerChild: (amount: number) => void;
  parentAName?: string;
  parentBName?: string;
  onAddChild: () => void;
  onRemoveChild: (id: string) => void;
  onUpdateChild: (id: string, partial: Partial<ChildInput>) => void;
}

export function ChildrenInputCard({
  childrenList,
  childrenResults,
  kindergeldPerChild,
  setKindergeldPerChild,
  parentAName = "Elternteil A",
  parentBName = "Elternteil B",
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
        {/* Konfigurierbarer Kindergeld-Bereich */}
        <div
          className="child-item"
          style={{
            backgroundColor: "var(--bg-surface-elevated)",
            borderColor: "var(--border-strong)",
            marginBottom: "10px",
          }}
        >
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label-text">
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  Staatliches Kindergeld
                </span>
              </label>
              <div className="form-label-controls">
                <span className="badge-fixed-unit" title="Monatliches Kindergeld je Kind">
                  € / Monat je Kind
                </span>
                <Tooltip
                  title="Staatliches Kindergeld (§ 1612b BGB / EStG § 66)"
                  explanation="Gesetzlicher Kindergeldbetrag pro Kind und Monat. Seit dem 01.01.2026 beträgt das bundeseinheitliche Kindergeld 259 € pro Monat (2025: 255 €, bis 2024: 250 €)."
                  legalNote="Zweistufiges Kindergeld-Splitting (§ 1612b BGB, BGH, Beschluss vom 20.04.2016 – Az. XII ZB 45/15): Das staatliche Kindergeld wird aufgeteilt in 50 % Betreuungsanteil (je 25 % fix pro Elternteil) und 50 % Baranteil (Aufteilung nach Haftungsquoten). Der Auszahlungsempfänger leitet 25 % Festanteil zzgl. der Haftungsquote des anderen Elternteils am 50 %-Baranteil weiter."
                  caseLaw="§ 1612b BGB; BGH XII ZB 45/15 (FamRZ 2016, 1053); BGH XII ZB 565/15 Rn. 32"
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
                marginTop: "4px",
              }}
            >
              <div style={{ flex: "1 1 130px", minWidth: "120px" }}>
                <NumericInput
                  value={kindergeldPerChild}
                  onChange={setKindergeldPerChild}
                  placeholder="259"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn-action"
                  style={{
                    padding: "6px 10px",
                    fontSize: "12px",
                    backgroundColor:
                      kindergeldPerChild === 259 ? "var(--brand-subtle)" : "var(--bg-primary)",
                    borderColor:
                      kindergeldPerChild === 259 ? "var(--brand-primary)" : "var(--border-subtle)",
                    color:
                      kindergeldPerChild === 259 ? "var(--brand-primary)" : "var(--text-secondary)",
                  }}
                  onClick={() => setKindergeldPerChild(259)}
                  title="Gesetzliches Kindergeld ab 01.01.2026"
                >
                  259 € (2026)
                </button>
                <button
                  type="button"
                  className="btn-action"
                  style={{
                    padding: "6px 10px",
                    fontSize: "12px",
                    backgroundColor:
                      kindergeldPerChild === 255 ? "var(--brand-subtle)" : "var(--bg-primary)",
                    borderColor:
                      kindergeldPerChild === 255 ? "var(--brand-primary)" : "var(--border-subtle)",
                    color:
                      kindergeldPerChild === 255 ? "var(--brand-primary)" : "var(--text-secondary)",
                  }}
                  onClick={() => setKindergeldPerChild(255)}
                  title="Gesetzliches Kindergeld 2025"
                >
                  255 € (2025)
                </button>
                <button
                  type="button"
                  className="btn-action"
                  style={{
                    padding: "6px 10px",
                    fontSize: "12px",
                    backgroundColor:
                      kindergeldPerChild === 250 ? "var(--brand-subtle)" : "var(--bg-primary)",
                    borderColor:
                      kindergeldPerChild === 250 ? "var(--brand-primary)" : "var(--border-subtle)",
                    color:
                      kindergeldPerChild === 250 ? "var(--brand-primary)" : "var(--text-secondary)",
                  }}
                  onClick={() => setKindergeldPerChild(250)}
                  title="Gesetzliches Kindergeld 2023 / 2024"
                >
                  250 € (2024)
                </button>
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              Fixer Betreuungsanteil (25 %): {((Number(kindergeldPerChild) || 0) * 0.25).toFixed(2)}{" "}
              € je Kind (zzgl. Quotenanteil am 50 % Baranteil; Gesamt-Kindergeld:{" "}
              {((Number(kindergeldPerChild) || 0) * childrenList.length).toFixed(2)} € / Monat)
            </span>
          </div>
        </div>

        {childrenList.map((child, index) => {
          const childResult = childrenResults?.find((r) => r.childId === child.id);
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
                  <div className="form-label-row">
                    <label className="form-label-text">
                      <span>Altersstufe</span>
                    </label>
                    <div className="form-label-controls">
                      <Tooltip
                        title="Altersstufe nach Düsseldorfer Tabelle 2026"
                        explanation="Die 4 Altersstufen der Düsseldorfer Tabelle: 0–5 Jahre, 6–11 Jahre, 12–17 Jahre und ab 18 Jahre (Volljährige)."
                        legalNote="Volljährige Kinder (ab 18): Minderjährige Kinder sind privilegiert. Bei Volljährigen haften beide Eltern barunterhaltspflichtig und das staatliche Kindergeld (259 €) wird in voller Höhe (100 %, kein Minderjährigen-Splitting) bedarfsmindernd abgezogen."
                        caseLaw="§ 1606 Abs. 3 S. 1 BGB; Düsseldorfer Tabelle 2026"
                      />
                    </div>
                  </div>
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
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Tabellen-Grundbedarf: {tabellenBedarf.toFixed(2)} €
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label-text">
                      <span>Errechneter Wohnmehrbedarf</span>
                    </label>
                    <div className="form-label-controls">
                      <Tooltip
                        title="Errechneter Realkosten-Wohnmehrbedarf (BGH XII ZB 565/15 Rn. 25)"
                        explanation="Automatisch ermittelte Wohnmehrkosten aus den Warmmieten beider Elternhaushalte nach der Pro-Kopf-Methode abzüglich des im Tabellenbedarf bereits enthaltenen 20%-Wohnkostenanteils."
                        legalNote={`Berechnung: Tatsächlicher Wohnbedarf (${actualHousing.toFixed(2)} €) minus 20% Tabellenanteil (${table20Pct.toFixed(2)} €) = ${wohnMehrbedarf.toFixed(2)} € / Monat. Übersteigende Mietkosten sind nach ständiger BGH-Rechtsprechung echter Kindesmehrbedarf.`}
                        caseLaw="BGH XII ZB 565/15 Rn. 25; Wendl/Dose § 1 Rn. 562"
                      />
                    </div>
                  </div>
                  <div
                    className="form-input"
                    style={{
                      backgroundColor: "var(--bg-surface-elevated)",
                      borderColor:
                        wohnMehrbedarf > 0 ? "rgba(56, 189, 248, 0.4)" : "var(--border-subtle)",
                      color: wohnMehrbedarf > 0 ? "var(--brand-primary)" : "var(--text-muted)",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "default",
                    }}
                  >
                    <span>
                      {wohnMehrbedarf > 0 ? `+ ${wohnMehrbedarf.toFixed(2)} €` : "0,00 €"}
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
                      color: wohnMehrbedarf > 0 ? "var(--brand-primary)" : "var(--text-muted)",
                    }}
                  >
                    {wohnMehrbedarf > 0
                      ? "Automatisch aus Warmmieten A + B ermittelt"
                      : "Warmmiete in Eltern-Tabs eintragen"}
                  </span>
                </div>
              </div>

              {/* Private Krankenversicherung des Kindes (Mehrbedarf nach Ziff. 10.4 OLG-Leitlinien) */}
              <div className="input-grid" style={{ marginTop: "8px" }}>
                <div
                  className="form-group"
                  style={{
                    gridColumn: child.istPrivatVersichert ? "1 / -1" : undefined,
                  }}
                >
                  <div className="form-label-row">
                    <label className="checkbox-label" style={{ fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        aria-label={`Kind ${index + 1} ist privat krankenversichert`}
                        checked={Boolean(child.istPrivatVersichert)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onUpdateChild(child.id, {
                            istPrivatVersichert: checked,
                            pkvBeitrag: checked ? child.pkvBeitrag || 0 : 0,
                            pkvZahler: checked ? child.pkvZahler || "elternteil1" : "elternteil1",
                          });
                        }}
                      />
                      <span>Kind ist privat krankenversichert (PKV)</span>
                    </label>
                    <div className="form-label-controls">
                      <Tooltip
                        title="PKV des Kindes (Ziff. 10.4 OLG-Leitlinien)"
                        explanation="Beiträge zur privaten Kranken- und Pflegeversicherung des Kindes stellen unterhaltsrechtlichen Mehrbedarf dar und werden im Verhältnis der Haftungsquoten (Q_A : Q_B) getragen."
                        legalNote="Spitzabrechnung: Der gezahlte Betrag wird den Direktkosten des verauslagenden Elternteils zugerechnet und in der abschließenden Abrechnung quotengerecht ausgeglichen."
                        caseLaw="Ziff. 10.4 OLG-Leitlinien; § 1606 Abs. 3 S. 1 BGB; BGH XII ZB 565/15"
                      />
                    </div>
                  </div>
                  <span className="form-hint">
                    {child.istPrivatVersichert
                      ? childResult?.pkvShareParentA !== undefined && (child.pkvBeitrag || 0) > 0
                        ? `PKV-Mehrbedarf: ${(child.pkvBeitrag || 0).toFixed(2)} € / Mo. (Anteil ${parentAName}: ${childResult.pkvShareParentA.toFixed(2)} €, Anteil ${parentBName}: ${childResult.pkvShareParentB?.toFixed(2)} €)`
                        : "Wird nach Haftungsquoten auf beide Eltern aufgeteilt"
                      : "GKV ist beitragsfrei in Familienversicherung enthalten"}
                  </span>
                </div>
              </div>

              {child.istPrivatVersichert && (
                <div className="input-grid" style={{ marginTop: "8px" }}>
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label-text">
                        <span>Monatlicher PKV-Beitrag des Kindes</span>
                      </label>
                      <div className="form-label-controls">
                        <span className="badge-fixed-unit" title="Monatlicher Beitrag">
                          € / Monat
                        </span>
                        <Tooltip
                          title="Monatlicher PKV-Beitrag des Kindes"
                          explanation="Tatsächlicher monatlicher Zahlbeitrag für die Kranken- und Pflegepflichtversicherung des Kindes."
                          legalNote="Stellt echten unterhaltsrechtlichen Mehrbedarf des Kindes dar."
                          caseLaw="Ziff. 10.4 OLG-Leitlinien"
                        />
                      </div>
                    </div>
                    <NumericInput
                      value={child.pkvBeitrag || 0}
                      onChange={(val) =>
                        onUpdateChild(child.id, {
                          pkvBeitrag: val,
                        })
                      }
                      placeholder="z. B. 150"
                    />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Mehrbedarf nach Ziff. 10.4 OLG-Leitlinien
                    </span>
                  </div>

                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label-text">
                        <span>Wird bezahlt von:</span>
                      </label>
                      <div className="form-label-controls">
                        <Tooltip
                          title="Verauslagender Elternteil für Kindes-PKV"
                          explanation="Gibt an, wer die PKV-Beiträge an das Versicherungsunternehmen überweist."
                          legalNote="Der verauslagte Betrag wird den Direktkosten des jeweiligen Elternteils zugerechnet, sodass der andere Elternteil seinen Quotenanteil im Rahmen der Spitzabrechnung erstattet."
                          caseLaw="BGH XII ZB 565/15 Rn. 28-30"
                        />
                      </div>
                    </div>
                    <select
                      className="form-select"
                      value={child.pkvZahler || "elternteil1"}
                      onChange={(e) =>
                        onUpdateChild(child.id, {
                          pkvZahler: e.target.value as any,
                        })
                      }
                    >
                      <option value="elternteil1">{parentAName || "Elternteil A"}</option>
                      <option value="elternteil2">{parentBName || "Elternteil B"}</option>
                      <option value="getrennt">Hälftig (je 50 %)</option>
                    </select>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Wird in Direktkosten-Spitzabrechnung verrechnet
                    </span>
                  </div>
                </div>
              )}

              <div className="input-grid" style={{ marginTop: "8px" }}>
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label-text">
                      <span>Sonst. Mehr-/Sonderbedarf</span>
                    </label>
                    <div className="form-label-controls">
                      <span className="badge-fixed-unit" title="Monatlicher Betrag">
                        € / Monat
                      </span>
                      <Tooltip
                        title="Sonstiger Mehrbedarf & Sonderbedarf"
                        explanation="Regelmäßige sonstige Mehrkosten (z. B. Fahrtkosten für den Kita-/Schultransfer, Kita-/Hortbeiträge, Nachhilfe, Therapien). Der Wohnmehrbedarf wird automatisch oben addiert."
                        legalNote="Wohnmehrbedarf vs. Sonstiger Mehrbedarf (BGH XII ZB 565/15): 1. Wohnmehrkosten werden anhand der Warmmieten und Haushaltsgrößen pro Kopf ermittelt und automatisch addiert. 2. Hier tragen Sie bitte sonstige Mehrbedarfe ein (z. B. Fahrtkosten, Hortbeiträge, Sportverein über dem Tabellenanteil)."
                        caseLaw="BGH XII ZB 565/15 Rn. 24–27; BGHZ 213, 254"
                      />
                    </div>
                  </div>
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
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    z. B. Fahrtkosten, Hort, Therapien
                  </span>
                </div>

                <div
                  className="form-group"
                  style={{
                    gridRow: "1 / -1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
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
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
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
                      {childResult ? `${childResult.totalNeed.toFixed(2)} € / Monat` : "—"}
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
