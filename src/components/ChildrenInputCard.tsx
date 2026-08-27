import { TOOLTIP_TEXTS } from "../config/legalTexts";
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
        <Tooltip {...TOOLTIP_TEXTS.children.general} />
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
                <Tooltip {...TOOLTIP_TEXTS.children.kindergeld} />
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
                      <Tooltip {...TOOLTIP_TEXTS.children.ageGroup} />
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
                        {...TOOLTIP_TEXTS.children.calculatedWohnmehrbedarf(
                          actualHousing,
                          table20Pct,
                          wohnMehrbedarf
                        )}
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
                      <Tooltip {...TOOLTIP_TEXTS.children.pkvGeneral} />
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
                        <Tooltip {...TOOLTIP_TEXTS.children.pkvBeitrag} />
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
                        <Tooltip {...TOOLTIP_TEXTS.children.pkvZahler} />
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
                      <Tooltip {...TOOLTIP_TEXTS.children.specialNeeds} />
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

                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label-text">
                      <span>Tatsächlich bezogener Kinderzuschlag (§ 6a BKGG)</span>
                    </label>
                    <div className="form-label-controls">
                      <span className="badge-fixed-unit" title="Monatlicher Kinderzuschlag">
                        € / Monat
                      </span>
                      <Tooltip {...TOOLTIP_TEXTS.children.kinderzuschlag} />
                    </div>
                  </div>
                  <NumericInput
                    value={child.kinderzuschlag || 0}
                    onChange={(val) =>
                      onUpdateChild(child.id, {
                        kinderzuschlag: val,
                      })
                    }
                    placeholder="z. B. 250"
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {child.kinderzuschlag && child.kinderzuschlag > 0
                      ? "100 % Bedarfsanrechnung nach BGH XII ZB 512/19"
                      : "Echtes Kindeseinkommen (100 % Anrechnung)"}
                  </span>
                </div>
              </div>

              {/* Bedarfsübersicht für dieses Kind */}
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Gesamtbedarf Kind (vor Anrechnung):
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {childResult ? `${childResult.totalNeed.toFixed(2)} € / Monat` : "—"}
                    </span>
                  </div>

                  {childResult?.kinderzuschlag !== undefined && childResult.kinderzuschlag > 0 && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "var(--brand-primary)" }}>
                          - Anzurechnender Kinderzuschlag (§ 6a BKGG):
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--brand-primary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          - {childResult.kinderzuschlag.toFixed(2)} € / Monat
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px dashed var(--border-subtle)",
                          paddingTop: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          Verbleibender Restbedarf (B_rest):
                        </span>
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "var(--brand-primary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {`${(childResult.reducedNeed ?? childResult.totalNeed).toFixed(2)} € / Monat`}
                        </span>
                      </div>
                    </>
                  )}
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
