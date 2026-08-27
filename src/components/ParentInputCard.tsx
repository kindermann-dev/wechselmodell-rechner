import { useState } from "react";
import { NumericInput } from "./NumericInput";
import { Tooltip } from "./Tooltip";
import { PeriodNumericField } from "./PeriodNumericField";
import { PeriodToggle, type PeriodUnit } from "./PeriodToggle";
import { round2 } from "../calculator/rounding";
import type { EmploymentStatus } from "../types/input";

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
            <Tooltip
              title="Bürgergeld-Bezug / Nicht erwerbstätig (§ 1603 Abs. 2 BGB, SGB II)"
              explanation="Kennzeichnet, dass der Elternteil Bürgergeld (SGB II) bezieht oder derzeit kein Erwerbseinkommen erzielt."
              legalNote="Rechtsfolgen bei Bürgergeld: 1. Bereinigtes Nettoeinkommen = 0,00 € und Haftungsquote = 0 %. 2. Fiktive Einkünfte: Wegen der gesteigerten Erwerbsobliegenheit (§ 1603 Abs. 2 BGB) können Familiengerichte bei fehlenden Bewerbungsnachweisen fiktive Einkünfte anrechnen. 3. Anspruchsübergang (§ 33 SGB II): Unterhalts- und Kindergeldansprüche gehen bis zur Leistungshöhe auf das Jobcenter über. 4. Wohnkosten (KdU): Werden im Rahmen der Kosten der Unterkunft vom Jobcenter getragen."
              caseLaw="§ 1603 Abs. 2 BGB; § 33 SGB II; BGH XII ZB 45/15"
            />
          </label>
          <label className="checkbox-label">
            <input
              type="radio"
              name="kgRecipient"
              checked={receivesKindergeld}
              onChange={onSelectKindergeld}
            />
            <span>Erhält Kindergeld</span>
            <Tooltip
              title="Kindergeld-Bezugsberechtigung (BGH XII ZB 45/15 & XII ZB 565/15)"
              explanation="Gibt an, an welchen Elternteil die Familienkasse das staatliche Kindergeld auszahlt."
              legalNote="Zweistufiges Kindergeld-Splitting nach BGH XII ZB 45/15 (Beschluss vom 20.04.2016) & § 1612b BGB: 50 % Betreuungsanteil (je 25 % fix pro Elternteil) und 50 % Baranteil (Aufteilung nach Haftungsquoten). Der beziehende Elternteil leistet an den anderen: ΔKG = 25 % KG + (Q_andere × 50 % KG)."
              caseLaw="BGH XII ZB 45/15 (FamRZ 2016, 1053); BGH XII ZB 565/15 Rn. 32; § 1612b BGB"
            />
          </label>
        </div>
      </div>

      {isBuergergeld && (
        <div className="buergergeld-status-banner">
          <span>ℹ️</span>
          <span>
            <strong>Bürgergeld-Bezug aktiv:</strong> Einkommen, Abzüge und Unterkunftskosten (KdU)
            sind auf 0,00 € gesetzt. Die Haftungsquote beträgt 0 %.
          </span>
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
            tooltipTitle="Bruttoeinkommen"
            tooltipExplanation="Gesamtes Bruttoeinkommen inklusive Urlaubs-/Weihnachtsgeld, geldwerter Vorteile (z. B. Firmenwagen) und vermögenswirksamer Leistungen."
            tooltipLegalNote="Dient als Berechnungsgrundlage für die Obergrenze der privaten Altersvorsorge (max. 4 % des Gesamtbruttoeinkommens). Bei Selbstständigen ist der 3-Jahres-Durchschnitt maßgebend."
            tooltipCaseLaw="BGH XII ZR 149/01, Düsseldorfer Tabelle 2026 Anm. A.3"
            placeholder={isBuergergeld ? "0" : "z. B. 4000"}
          />
        </div>

        <div className="input-grid">
          <PeriodNumericField
            label="Nettoeinkommen"
            annualValue={netAnnual}
            onAnnualValueChange={setNetAnnual}
            disabled={isBuergergeld}
            tooltipTitle="Nettoeinkommen (Basis)"
            tooltipExplanation="Summe der laufenden monatlichen Nettogehälter (ohne variable Sonderboni). Steuererstattungen sind dem Zuflussjahr hinzuzurechnen."
            tooltipLegalNote="Steuerklassenwahl: Ab dem Folgejahr der Trennung besteht eine Rechtspflicht zum Wechsel in Steuerklasse I/II. Wer schuldhaft ungünstige Steuerklassen beibehält, muss sich fiktive Berechnungen anrechnen lassen."
            tooltipCaseLaw="§ 1606 Abs. 3 BGB, BGH XII ZR 111/05"
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
                <Tooltip
                  title="Jahresboni & Einmalzahlungen"
                  explanation="Variable Vergütungen wie Jahresboni, Tantiemen, Provisionen, Überstundenvergütungen und Einkommensteuererstattungen der letzten 12 Monate."
                  legalNote="Streitpunkt Überstunden & Boni: Regelmäßige Boni zählen voll zum Unterhaltseinkommen. Bei stark schwankenden Beträgen verlangt die Rechtsprechung einen 3-Jahres-Durchschnitt zur Glättung."
                  caseLaw="BGH FamRZ 2014, 923; OLG Düsseldorf Leitlinien"
                />
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
                <Tooltip
                  title="Private Kranken- und Pflegeversicherung (§ 10 Abs. 1 Nr. 3 EStG / Ziff. 10.4 OLG-Leitlinien)"
                  explanation="Abzugsfähig ist nur der Eigenanteil für die Basisabsicherung (ohne Wahlleistungen wie Chefarzt/Einbettzimmer) gemäß jährlicher Beitragsbescheinigung nach § 10 Abs. 1 Nr. 3 EStG (Ziff. 10.4 OLG-Leitlinien)."
                  legalNote="Einkommensbereinigung bei PKV: Der monatliche Eigenanteil (Basisbeitrag abzüglich steuerfreiem Arbeitgeberzuschuss oder Beihilfe) mindert das anrechenbare Nettoeinkommen. Komfort- und Wahltarife (z. B. Chefarztbehandlung, Einbettzimmer) sind unterhaltsrechtlich nicht abzugsfähig."
                  caseLaw="§ 10 Abs. 1 Nr. 3 EStG; Ziff. 10.4 OLG-Leitlinien; BGH XII ZB 565/15"
                />
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
              tooltipTitle="PKV-Basisbeitrag (inkl. Pflegepflichtversicherung)"
              tooltipExplanation="Monatlicher oder jährlicher Beitrag zur Basis-Krankenversicherung und gesetzlichen Pflegepflichtversicherung ohne Komforttarife."
              tooltipLegalNote="Abzugsfähig ist nur der Eigenanteil für die Basisabsicherung (ohne Wahlleistungen wie Chefarzt/Einbettzimmer) gemäß jährlicher Beitragsbescheinigung nach § 10 Abs. 1 Nr. 3 EStG (Ziff. 10.4 OLG-Leitlinien)."
              tooltipCaseLaw="§ 10 Abs. 1 Nr. 3 EStG; Ziff. 10.4 OLG-Leitlinien"
              placeholder="z. B. 700"
              extraSubtext="ohne Wahlleistungen"
            />

            <PeriodNumericField
              label="Arbeitgeberzuschuss / Beihilfe"
              annualValue={pkvArbeitgeberzuschussAnnual}
              onAnnualValueChange={setPkvArbeitgeberzuschussAnnual || (() => {})}
              disabled={isBuergergeld}
              tooltipTitle="Steuerfreier Arbeitgeberzuschuss / Beihilfe"
              tooltipExplanation="Steuerfreier Zuschuss des Arbeitgebers zur Kranken- und Pflegeversicherung nach § 257 SGB V bzw. Beihilfeleistungen."
              tooltipLegalNote="Der Arbeitgeberzuschuss mindert den abzugsfähigen PKV-Aufwand, sodass nur der tatsächliche Eigenanteil unterhaltsmindernd wirkt."
              tooltipCaseLaw="Ziff. 10.4 OLG-Leitlinien; § 257 SGB V"
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
            tooltipTitle="Zusätzliche Altersvorsorge"
            tooltipExplanation="Tatsächlich geleistete Beiträge zu privaten Rentenversicherungen, Riester-/Rürup-Verträgen oder betrieblicher Altersvorsorge (bAV)."
            tooltipLegalNote="Höchstgrenze 4 % des Bruttos: Kann nur abgezogen werden, wenn tatsächliche Zahlungen nachgewiesen werden (kein Pauschalabzug). Bei Unterschreitung des Mindestunterhalts (Mangelfall) kann der Abzug gerichtlich verwehrt werden."
            tooltipCaseLaw="BGH XII ZR 149/01; BGH XII ZB 599/13"
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
                <Tooltip
                  title="Wohnvorteil (Eigenheim)"
                  explanation="Mietfreies Wohnen in einer eigenen Immobilie spart Mietkosten und wird dem Einkommen als fiktiver Ertrag hinzugerechnet."
                  legalNote="Eigenheim nach BGH XII ZB 565/15 Rn. 25 & XII ZB 110/16: Zinsen und verbrauchsunabhängige Hauskosten sind abzugsfähig. Tilgung bis max. 4% Vorsorgequote. Achtung: Nicht doppelt als Wohnvorteil-Minderung UND als Schuld eintragen!"
                  caseLaw="BGH XII ZB 565/15 Rn. 25; BGH XII ZB 110/16"
                />
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
                <Tooltip
                  title="Berufsbedingte Aufwendungen"
                  explanation="Aufwendungen zur Sicherung und Erzielung des Erwerbseinkommens (Fahrtkosten, Arbeitsmittel, doppelte Haushaltsführung)."
                  legalNote="5%-Pauschale vs. Einzelnachweis: Die 5%-Pauschale (50–150 €/Monat) gilt nur bei Erwerbstätigkeit ohne Nachweispflicht. Wer höhere tatsächliche Fahrtkosten (0,42 €/km) nachweist, muss alle Aufwendungen darlegen; die Pauschale entfällt dann."
                  caseLaw="Düsseldorfer Tabelle 2026 Anm. A.3; BGH XII ZB 599/13"
                />
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
            tooltipTitle="Berücksichtigungsfähige Verbindlichkeiten"
            tooltipExplanation="Laufende Tilgungs- und Zinsleistungen für eheprägende, familiäre oder notwendige Kredite."
            tooltipLegalNote="Streitpunkt Neue Konsumschulden: Verbindlichkeiten, die nach der Trennung für Konsumzwecke aufgenommen wurden, mindern den Unterhalt grundsätzlich nicht. Der Pflichtige hat eine Obliegenheit zur Streckung oder Umschuldung."
            tooltipCaseLaw="BGH XII ZR 131/04; OLG Leitlinien"
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
                <Tooltip
                  title="Tatsächliche Warmmiete des Haushalts (BGH XII ZB 565/15 Rn. 25)"
                  explanation="Monatliche Warmmiete inkl. Nebenkosten und Heizung (bzw. Zinsen/Nebenkosten bei Eigentum)."
                  legalNote="Realkosten-Vergleich nach BGH XII ZB 565/15 Rn. 25: Der auf das Kind entfallende Wohnbedarf wird nach der in der Rechtsprechung anerkannten Kopfzahl-Methode (vgl. Wendl/Klinkhammer; Warmmiete / Personen) ermittelt. Übersteigen die summierten tatsächlichen Wohnkosten beider Haushalte den im Tabellenunterhalt kalkulierten 20%-Wohnkostenanteil, wird die Differenz als Wohnmehrbedarf des Kindes angesetzt und nach Haftungsquoten verteilt."
                  caseLaw="BGH XII ZB 565/15 Rn. 25 (BGHZ 213, 254); Wendl/Klinkhammer"
                />
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
                <Tooltip
                  title="Haushaltsgröße (Kopfzahl-Methode)"
                  explanation="Gesamtzahl der ständig oder wechselnd im Haushalt lebenden Personen (Elternteil + alle Kinder + Partner)."
                  legalNote="Kopfzahl-Aufteilung nach BGH: Die Warmmiete wird gleichmäßig auf alle Haushaltsangehörigen aufgeteilt. Wohnen z. B. der Elternteil und 2 Kinder in der Wohnung, beträgt die Kopfzahl 3 (1/3 Warmmiete je Kind)."
                  caseLaw="BGH FamRZ 2011, 454; Wendl/Klinkhammer; BGH XII ZB 565/15 Rn. 25"
                />
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
            tooltipTitle="Direkte Kindesausgaben (Bargeld-Auslagen)"
            tooltipExplanation="Vom Elternteil zentral verauslagte Sachkosten für das Kind (z. B. Kleidung, Schulgeld, Monatskarte, Vereinsbeiträge, Krankenzusatzversicherung)."
            tooltipLegalNote="Abgrenzung & Quotenverrechnung nach BGH XII ZB 565/15 Rn. 28, 30: 1. Gewöhnliche Verpflegungs- und Wohnkosten der eigenen Betreuungswoche sind durch den 50%-Naturalunterhalt abgegolten und dürfen NICHT eingetragen werden. 2. Zentrale Sachausgaben und Anschaffungen für das Kind werden nach den Haftungsquoten (Q_A : Q_B) aufgeteilt. Der andere Elternteil übernimmt seinen prozentualen Quotenanteil im Rahmen der Spitzabrechnung."
            tooltipCaseLaw="BGH XII ZB 565/15 Rn. 28–30 (BGHZ 213, 254)"
            placeholder={isBuergergeld ? "0" : "z. B. 0"}
          />
        </div>
      </div>
    </div>
  );
}
