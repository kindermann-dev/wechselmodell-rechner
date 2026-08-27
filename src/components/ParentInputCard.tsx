import { useState } from "react";
import { NumericInput } from "./NumericInput";
import { Tooltip } from "./Tooltip";
import { PeriodNumericField } from "./PeriodNumericField";
import { PeriodToggle, type PeriodUnit } from "./PeriodToggle";
import { round2 } from "../calculator/rounding";
import type { EmploymentStatus } from "../types/input";
import { LEGAL_NOTICES, TOOLTIP_TEXTS } from "../config/legalTexts";

interface ParentInputCardProps {
  parentKey: "parentA" | "parentB";
  name: string;
  setName: (name: string) => void;
  erwerbsstatus?: EmploymentStatus;
  setErwerbsstatus?: (status: EmploymentStatus) => void;
  grossAnnual: number;
  setGrossAnnual: (gross: number) => void;
  netAnnual: number;
  setNetAnnual: (net: number) => void;
  annualBonusNet: number;
  setAnnualBonusNet: (bonus: number) => void;
  isEmployed: boolean;
  setIsEmployed: (isEmployed: boolean) => void;
  useFlatRate: boolean;
  setUseFlatRate: (useFlatRate: boolean) => void;
  customAnnualExpense: number;
  setCustomAnnualExpense: (customExpense: number) => void;
  pensionAnnual: number;
  setPensionAnnual: (pension: number) => void;
  istPrivatVersichert?: boolean;
  setIstPrivatVersichert?: (isPkv: boolean) => void;
  pkvBeitragBasisAnnual?: number;
  setPkvBeitragBasisAnnual?: (val: number) => void;
  pkvArbeitgeberzuschussAnnual?: number;
  setPkvArbeitgeberzuschussAnnual?: (val: number) => void;
  housingAnnual: number;
  setHousingAnnual: (housing: number) => void;
  debtsAnnual: number;
  setDebtsAnnual: (debts: number) => void;
  directExpensesAnnual: number;
  setDirectExpensesAnnual: (directExpenses: number) => void;
  warmRentMonthly: number;
  setWarmRentMonthly: (rent: number) => void;
  householdPersons: number;
  setHouseholdPersons: (persons: number) => void;
  receivesKindergeld: boolean;
  onSelectKindergeld: () => void;
}

export function ParentInputCard({
  name,
  setName,
  erwerbsstatus = "erwerbstaetig",
  setErwerbsstatus,
  grossAnnual,
  setGrossAnnual,
  netAnnual,
  setNetAnnual,
  annualBonusNet,
  setAnnualBonusNet,
  isEmployed: _isEmployed,
  setIsEmployed,
  useFlatRate,
  setUseFlatRate,
  customAnnualExpense,
  setCustomAnnualExpense,
  pensionAnnual,
  setPensionAnnual,
  istPrivatVersichert = false,
  setIstPrivatVersichert,
  pkvBeitragBasisAnnual = 0,
  setPkvBeitragBasisAnnual,
  pkvArbeitgeberzuschussAnnual = 0,
  setPkvArbeitgeberzuschussAnnual,
  housingAnnual,
  setHousingAnnual,
  debtsAnnual,
  setDebtsAnnual,
  directExpensesAnnual,
  setDirectExpensesAnnual,
  warmRentMonthly,
  setWarmRentMonthly,
  householdPersons,
  setHouseholdPersons,
  receivesKindergeld,
  onSelectKindergeld,
}: ParentInputCardProps) {
  const [hasHomeOwnership, setHasHomeOwnership] = useState(housingAnnual > 0);
  const [housingPeriod, setHousingPeriod] = useState<PeriodUnit>("monthly");
  const [customExpensePeriod, setCustomExpensePeriod] = useState<PeriodUnit>("monthly");

  const isBuergergeld = erwerbsstatus === "buergergeld";

  const totalNetAnnual = (Number(netAnnual) || 0) + (Number(annualBonusNet) || 0);
  const monthlyNetEquivalent = totalNetAnnual / 12;
  const perHeadHousing =
    (Number(warmRentMonthly) || 0) / Math.max(1, Number(householdPersons) || 1);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{name}</span>
        <div className="card-header-controls">
          <label className="checkbox-label buergergeld-checkbox-label">
            <input
              type="checkbox"
              aria-label="Bürgergeld-Bezug / Nicht erwerbstätig"
              checked={isBuergergeld}
              onChange={(e) => {
                const isBuerger = e.target.checked;
                const newStatus: EmploymentStatus = isBuerger ? "buergergeld" : "erwerbstaetig";
                if (setErwerbsstatus) {
                  setErwerbsstatus(newStatus);
                }
                if (isBuerger) {
                  setIsEmployed(false);
                  setGrossAnnual(0);
                  setNetAnnual(0);
                  setAnnualBonusNet(0);
                  setCustomAnnualExpense(0);
                  setPensionAnnual(0);
                  setHousingAnnual(0);
                  setDebtsAnnual(0);
                  setWarmRentMonthly(0);
                  if (setIstPrivatVersichert) setIstPrivatVersichert(false);
                  if (setPkvBeitragBasisAnnual) setPkvBeitragBasisAnnual(0);
                  if (setPkvArbeitgeberzuschussAnnual) setPkvArbeitgeberzuschussAnnual(0);
                } else {
                  setIsEmployed(true);
                }
              }}
            />
            <div className="checkbox-text-stacked" aria-hidden="true">
              <span>Bürgergeld-Bezug</span>
              <span>Nicht erwerbstätig</span>
            </div>
            <Tooltip {...TOOLTIP_TEXTS.parent.buergergeld} />
          </label>
          <label className="checkbox-label">
            <input
              type="radio"
              name="kgRecipient"
              checked={receivesKindergeld}
              onChange={onSelectKindergeld}
            />
            <span>Erhält Kindergeld</span>
            <Tooltip {...TOOLTIP_TEXTS.parent.receivesKindergeld} />
          </label>
        </div>
      </div>

      {isBuergergeld && (
        <div className="buergergeld-status-banner">
          <span>ℹ️</span>
          <span>{LEGAL_NOTICES.buergergeld.statusBanner}</span>
        </div>
      )}

      <div className="form-section">
        <div className="input-grid">
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label-text">
                <span>Name</span>
              </label>
            </div>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Elternteil A"
            />
            <span className="form-hint">Bezeichnung in Auswertung & Druck</span>
          </div>

          <PeriodNumericField
            label="Bruttoeinkommen"
            annualValue={grossAnnual}
            onAnnualValueChange={setGrossAnnual}
            disabled={isBuergergeld}
            tooltipTitle={TOOLTIP_TEXTS.parent.grossIncome.title}
            tooltipExplanation={TOOLTIP_TEXTS.parent.grossIncome.explanation}
            tooltipLegalNote={TOOLTIP_TEXTS.parent.grossIncome.legalNote}
            tooltipCaseLaw={TOOLTIP_TEXTS.parent.grossIncome.caseLaw}
            placeholder={isBuergergeld ? "0" : "z. B. 4000"}
          />
        </div>

        <div className="input-grid">
          <PeriodNumericField
            label="Nettoeinkommen"
            annualValue={netAnnual}
            onAnnualValueChange={setNetAnnual}
            disabled={isBuergergeld}
            tooltipTitle={TOOLTIP_TEXTS.parent.netIncome.title}
            tooltipExplanation={TOOLTIP_TEXTS.parent.netIncome.explanation}
            tooltipLegalNote={TOOLTIP_TEXTS.parent.netIncome.legalNote}
            tooltipCaseLaw={TOOLTIP_TEXTS.parent.netIncome.caseLaw}
            placeholder={isBuergergeld ? "0" : "z. B. 3000"}
            extraSubtext="Basis ohne Boni"
          />

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label-text">
                <span>Jahresboni / Sonderzahlung</span>
              </label>
              <div className="form-label-controls">
                <span
                  className="badge-fixed-unit"
                  title="Dieses Feld wird immer auf Jahresbasis erfasst"
                >
                  € / Jahr
                </span>
                <Tooltip {...TOOLTIP_TEXTS.parent.annualBonus} />
              </div>
            </div>
            <NumericInput
              value={annualBonusNet}
              onChange={setAnnualBonusNet}
              disabled={isBuergergeld}
              placeholder={isBuergergeld ? "0" : undefined}
            />
            <span className="form-hint form-hint-highlight">
              {isBuergergeld
                ? "Kein anrechenbares Einkommen"
                : `Gesamt-Netto: Ø ${monthlyNetEquivalent.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} € / Monat`}
            </span>
          </div>
        </div>

        {/* Private Kranken- und Pflegeversicherung (PKV / PPV) */}
        <div className="input-grid">
          <div
            className="form-group"
            style={{ gridColumn: istPrivatVersichert && !isBuergergeld ? "1 / -1" : undefined }}
          >
            <div className="form-label-row">
              <label className="checkbox-label" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  aria-label="Privat krankenversichert (PKV)"
                  checked={istPrivatVersichert && !isBuergergeld}
                  disabled={isBuergergeld}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (setIstPrivatVersichert) {
                      setIstPrivatVersichert(checked);
                    }
                    if (!checked) {
                      if (setPkvBeitragBasisAnnual) setPkvBeitragBasisAnnual(0);
                      if (setPkvArbeitgeberzuschussAnnual) setPkvArbeitgeberzuschussAnnual(0);
                    }
                  }}
                />
                <span>Privat krankenversichert (PKV)</span>
              </label>
              <div className="form-label-controls">
                <Tooltip {...TOOLTIP_TEXTS.parent.pkvGeneral} />
              </div>
            </div>
            <span className="form-hint">
              {isBuergergeld
                ? "Bei Bürgergeld nicht anwendbar"
                : istPrivatVersichert
                  ? `Abzugsfähiger PKV-Eigenanteil: Ø ${Math.max(
                      0,
                      (Number(pkvBeitragBasisAnnual) || 0) / 12 -
                        (Number(pkvArbeitgeberzuschussAnnual) || 0) / 12
                    ).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} € / Monat (Basis minus Zuschuss)`
                  : "Basisabsicherung inkl. Pflegepflichtversicherung abzugsfähig"}
            </span>
          </div>
        </div>

        {istPrivatVersichert && !isBuergergeld && (
          <div className="input-grid">
            <PeriodNumericField
              label="PKV-Monatsbeitrag (Basisabsicherung)"
              annualValue={pkvBeitragBasisAnnual}
              onAnnualValueChange={setPkvBeitragBasisAnnual || (() => {})}
              disabled={isBuergergeld}
              tooltipTitle={TOOLTIP_TEXTS.parent.pkvBasis.title}
              tooltipExplanation={TOOLTIP_TEXTS.parent.pkvBasis.explanation}
              tooltipLegalNote={TOOLTIP_TEXTS.parent.pkvBasis.legalNote}
              tooltipCaseLaw={TOOLTIP_TEXTS.parent.pkvBasis.caseLaw}
              placeholder="z. B. 700"
              extraSubtext="ohne Wahlleistungen"
            />

            <PeriodNumericField
              label="Arbeitgeberzuschuss / Beihilfe"
              annualValue={pkvArbeitgeberzuschussAnnual}
              onAnnualValueChange={setPkvArbeitgeberzuschussAnnual || (() => {})}
              disabled={isBuergergeld}
              tooltipTitle={TOOLTIP_TEXTS.parent.pkvArbeitgeberzuschuss.title}
              tooltipExplanation={TOOLTIP_TEXTS.parent.pkvArbeitgeberzuschuss.explanation}
              tooltipLegalNote={TOOLTIP_TEXTS.parent.pkvArbeitgeberzuschuss.legalNote}
              tooltipCaseLaw={TOOLTIP_TEXTS.parent.pkvArbeitgeberzuschuss.caseLaw}
              placeholder="z. B. 350"
              extraSubtext="€ / Monat"
            />
          </div>
        )}

        <div className="input-grid">
          <PeriodNumericField
            label="Altersvorsorge"
            annualValue={pensionAnnual}
            onAnnualValueChange={setPensionAnnual}
            disabled={isBuergergeld}
            tooltipTitle={TOOLTIP_TEXTS.parent.pension.title}
            tooltipExplanation={TOOLTIP_TEXTS.parent.pension.explanation}
            tooltipLegalNote={TOOLTIP_TEXTS.parent.pension.legalNote}
            tooltipCaseLaw={TOOLTIP_TEXTS.parent.pension.caseLaw}
            placeholder={isBuergergeld ? "0" : "z. B. 100"}
            extraSubtext="max. 4% Brutto"
          />

          <div className="form-group">
            <div className="form-label-row">
              <label className="checkbox-label" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={hasHomeOwnership && !isBuergergeld}
                  disabled={isBuergergeld}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasHomeOwnership(checked);
                    if (!checked) {
                      setHousingAnnual(0);
                    }
                  }}
                />
                <span>Eigenheim (Wohnvorteil)</span>
              </label>
              <div className="form-label-controls">
                <PeriodToggle
                  period={housingPeriod}
                  onChange={setHousingPeriod}
                  disabled={isBuergergeld || !hasHomeOwnership}
                  ariaLabel="Zeitraum für Wohnvorteil"
                />
                <Tooltip {...TOOLTIP_TEXTS.parent.housingAdvantage} />
              </div>
            </div>
            <NumericInput
              value={housingPeriod === "monthly" ? round2(housingAnnual / 12) : housingAnnual}
              onChange={(v) => setHousingAnnual(housingPeriod === "monthly" ? round2(v * 12) : v)}
              disabled={isBuergergeld || !hasHomeOwnership}
              placeholder={
                isBuergergeld
                  ? "0"
                  : hasHomeOwnership
                    ? housingPeriod === "monthly"
                      ? "z. B. 300"
                      : "z. B. 3600"
                    : "Deaktiviert (kein Eigenheim)"
              }
            />
            <span className="form-hint">
              {isBuergergeld
                ? "Bei Bürgergeld nicht anwendbar"
                : hasHomeOwnership
                  ? housingPeriod === "monthly"
                    ? `Entspricht ${(housingAnnual || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr`
                    : `Ø ${((housingAnnual || 0) / 12).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Monat`
                  : "Nur bei eigenem Wohneigentum aktivierbar"}
            </span>
          </div>
        </div>

        <div className="input-grid">
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label-text">
                <span>Berufsbedingte Aufwendungen</span>
              </label>
              <div className="form-label-controls">
                {!useFlatRate && (
                  <PeriodToggle
                    period={customExpensePeriod}
                    onChange={setCustomExpensePeriod}
                    disabled={isBuergergeld}
                    ariaLabel="Zeitraum für berufsbedingte Aufwendungen"
                  />
                )}
                <Tooltip {...TOOLTIP_TEXTS.parent.occupationalExpenses} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <select
                className="form-select"
                value={useFlatRate ? "flat" : "custom"}
                onChange={(e) => setUseFlatRate(e.target.value === "flat")}
                disabled={isBuergergeld}
              >
                <option value="flat">5% Pauschale (50 - 150 €/Monat)</option>
                <option value="custom">Individueller Nachweis</option>
              </select>
              {!useFlatRate && (
                <NumericInput
                  placeholder={
                    isBuergergeld
                      ? "0"
                      : customExpensePeriod === "monthly"
                        ? "Nachgewiesener Monatsbetrag (€)"
                        : "Nachgewiesener Jahresbetrag (€)"
                  }
                  value={
                    customExpensePeriod === "monthly"
                      ? round2(customAnnualExpense / 12)
                      : customAnnualExpense
                  }
                  onChange={(v) =>
                    setCustomAnnualExpense(customExpensePeriod === "monthly" ? round2(v * 12) : v)
                  }
                  disabled={isBuergergeld}
                />
              )}
            </div>
            <span className="form-hint">
              {isBuergergeld
                ? "Bei Bürgergeld entfallen Berufsaufwendungen"
                : useFlatRate
                  ? "Automatisch: 5% des Nettoeinkommens"
                  : customExpensePeriod === "monthly"
                    ? `Entspricht ${(customAnnualExpense || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr`
                    : `Ø ${((customAnnualExpense || 0) / 12).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Monat`}
            </span>
          </div>

          <PeriodNumericField
            label="Berücksichtigungsf. Schulden"
            annualValue={debtsAnnual}
            onAnnualValueChange={setDebtsAnnual}
            disabled={isBuergergeld}
            tooltipTitle={TOOLTIP_TEXTS.parent.debts.title}
            tooltipExplanation={TOOLTIP_TEXTS.parent.debts.explanation}
            tooltipLegalNote={TOOLTIP_TEXTS.parent.debts.legalNote}
            tooltipCaseLaw={TOOLTIP_TEXTS.parent.debts.caseLaw}
            placeholder={isBuergergeld ? "0" : "z. B. 0"}
          />
        </div>

        {/* Tatsächliche Wohnkosten (BGH XII ZB 565/15 Rn. 25 & Kopfzahl-Methode) */}
        <div className="input-grid">
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label-text">
                <span>Tatsächliche Warmmiete</span>
              </label>
              <div className="form-label-controls">
                <span className="badge-fixed-unit" title="Monatliche Warmmiete inkl. Nebenkosten">
                  € / Monat
                </span>
                <Tooltip {...TOOLTIP_TEXTS.parent.warmRent} />
              </div>
            </div>
            <NumericInput
              value={warmRentMonthly}
              onChange={setWarmRentMonthly}
              disabled={isBuergergeld}
              placeholder={isBuergergeld ? "0" : "z. B. 1200"}
            />
            <span className="form-hint">
              {isBuergergeld ? "Im Bürgergeld / KdU enthalten" : "Warmmiete inkl. NK & Heizung"}
            </span>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label-text">
                <span>Personen im Haushalt</span>
              </label>
              <div className="form-label-controls">
                <span className="badge-fixed-unit" title="Anzahl der Personen im Haushalt">
                  Kopfzahl
                </span>
                <Tooltip {...TOOLTIP_TEXTS.parent.householdPersons} />
              </div>
            </div>
            <NumericInput
              value={householdPersons}
              onChange={setHouseholdPersons}
              disabled={isBuergergeld}
              min={1}
              placeholder={isBuergergeld ? "2" : "z. B. 2"}
            />
            <span className="form-hint form-hint-highlight">
              {isBuergergeld
                ? "KdU durch Jobcenter übernommen"
                : `Pro-Kopf-Wohnanteil: ${perHeadHousing.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} € / Person`}
            </span>
          </div>
        </div>

        <div className="input-grid">
          <PeriodNumericField
            label="Direkte Kindesausgaben"
            annualValue={directExpensesAnnual}
            onAnnualValueChange={setDirectExpensesAnnual}
            disabled={isBuergergeld}
            tooltipTitle={TOOLTIP_TEXTS.parent.directExpenses.title}
            tooltipExplanation={TOOLTIP_TEXTS.parent.directExpenses.explanation}
            tooltipLegalNote={TOOLTIP_TEXTS.parent.directExpenses.legalNote}
            tooltipCaseLaw={TOOLTIP_TEXTS.parent.directExpenses.caseLaw}
            placeholder={isBuergergeld ? "0" : "z. B. 0"}
          />
        </div>
      </div>
    </div>
  );
}
