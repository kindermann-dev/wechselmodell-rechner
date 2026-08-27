import { useState } from "react";
import { NumericInput } from "./NumericInput";
import { Tooltip } from "./Tooltip";
import { PeriodNumericField } from "./PeriodNumericField";
import { PeriodToggle, type PeriodUnit } from "./PeriodToggle";
import { round2 } from "../calculator/rounding";

interface ParentInputCardProps {
  parentKey: "parentA" | "parentB";
  name: string;
  setName: (name: string) => void;
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
  grossAnnual,
  setGrossAnnual,
  netAnnual,
  setNetAnnual,
  annualBonusNet,
  setAnnualBonusNet,
  isEmployed,
  setIsEmployed,
  useFlatRate,
  setUseFlatRate,
  customAnnualExpense,
  setCustomAnnualExpense,
  pensionAnnual,
  setPensionAnnual,
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

  const totalNetAnnual = (Number(netAnnual) || 0) + (Number(annualBonusNet) || 0);
  const monthlyNetEquivalent = totalNetAnnual / 12;
  const perHeadHousing =
    (Number(warmRentMonthly) || 0) / Math.max(1, Number(householdPersons) || 1);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{name}</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isEmployed}
              onChange={(e) => setIsEmployed(e.target.checked)}
            />
            <span>Erwerbstätig</span>
            <Tooltip
              title="Erwerbstätigkeit & Erwerbsobliegenheit"
              explanation="Gibt an, ob der Elternteil derzeit erwerbstätig ist."
              legalNote="Erwerbsobliegenheit nach BGH XII ZB 565/15: 1. Bei Kindern unter 3 Jahren: 50%-Erwerbsobliegenheit (Teilzeit). 2. Ab dem 3. Lebensjahr: Vollzeiterwerbsobliegenheit (100%). Wer grundlos weniger arbeitet, muss sich ein fiktives Vollzeiteinkommen anrechnen lassen (BGH Rn. 21). Notwendiger Selbstbehalt: 1.450 € (erwerbstätig) vs. 1.200 € (nichterwerbstätig)."
              caseLaw="BGH XII ZB 565/15 Rn. 21–23"
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
            tooltipTitle="Bruttoeinkommen"
            tooltipExplanation="Gesamtes Bruttoeinkommen inklusive Urlaubs-/Weihnachtsgeld, geldwerter Vorteile (z. B. Firmenwagen) und vermögenswirksamer Leistungen."
            tooltipLegalNote="Dient als Berechnungsgrundlage für die Obergrenze der privaten Altersvorsorge (max. 4 % des Gesamtbruttoeinkommens). Bei Selbstständigen ist der 3-Jahres-Durchschnitt maßgebend."
            tooltipCaseLaw="BGH XII ZR 149/01, Düsseldorfer Tabelle 2026 Anm. A.3"
            placeholder="z. B. 4000"
          />
        </div>

        <div className="input-grid">
          <PeriodNumericField
            label="Nettoeinkommen"
            annualValue={netAnnual}
            onAnnualValueChange={setNetAnnual}
            tooltipTitle="Nettoeinkommen (Basis)"
            tooltipExplanation="Summe der laufenden monatlichen Nettogehälter (ohne variable Sonderboni). Steuererstattungen sind dem Zuflussjahr hinzuzurechnen."
            tooltipLegalNote="Steuerklassenwahl: Ab dem Folgejahr der Trennung besteht eine Rechtspflicht zum Wechsel in Steuerklasse I/II. Wer schuldhaft ungünstige Steuerklassen beibehält, muss sich fiktive Berechnungen anrechnen lassen."
            tooltipCaseLaw="§ 1606 Abs. 3 BGB, BGH XII ZR 111/05"
            placeholder="z. B. 3000"
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
            <NumericInput value={annualBonusNet} onChange={setAnnualBonusNet} />
            <span className="form-hint form-hint-highlight">
              Gesamt-Netto: Ø{" "}
              {monthlyNetEquivalent.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              € / Monat
            </span>
          </div>
        </div>

        <div className="input-grid">
          <PeriodNumericField
            label="Altersvorsorge"
            annualValue={pensionAnnual}
            onAnnualValueChange={setPensionAnnual}
            tooltipTitle="Zusätzliche Altersvorsorge"
            tooltipExplanation="Tatsächlich geleistete Beiträge zu privaten Rentenversicherungen, Riester-/Rürup-Verträgen oder betrieblicher Altersvorsorge (bAV)."
            tooltipLegalNote="Höchstgrenze 4 % des Bruttos: Kann nur abgezogen werden, wenn tatsächliche Zahlungen nachgewiesen werden (kein Pauschalabzug). Bei Unterschreitung des Mindestunterhalts (Mangelfall) kann der Abzug gerichtlich verwehrt werden."
            tooltipCaseLaw="BGH XII ZR 149/01; BGH XII ZB 599/13"
            placeholder="z. B. 100"
            extraSubtext="max. 4% Brutto"
          />

          <div className="form-group">
            <div className="form-label-row">
              <label className="checkbox-label" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={hasHomeOwnership}
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
                  disabled={!hasHomeOwnership}
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
              disabled={!hasHomeOwnership}
              placeholder={
                hasHomeOwnership
                  ? housingPeriod === "monthly"
                    ? "z. B. 300"
                    : "z. B. 3600"
                  : "Deaktiviert (kein Eigenheim)"
              }
            />
            <span className="form-hint">
              {hasHomeOwnership
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
              >
                <option value="flat">5% Pauschale (50 - 150 €/Monat)</option>
                <option value="custom">Individueller Nachweis</option>
              </select>
              {!useFlatRate && (
                <NumericInput
                  placeholder={
                    customExpensePeriod === "monthly"
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
                />
              )}
            </div>
            <span className="form-hint">
              {useFlatRate
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
            tooltipTitle="Berücksichtigungsfähige Verbindlichkeiten"
            tooltipExplanation="Laufende Tilgungs- und Zinsleistungen für eheprägende, familiäre oder notwendige Kredite."
            tooltipLegalNote="Streitpunkt Neue Konsumschulden: Verbindlichkeiten, die nach der Trennung für Konsumzwecke aufgenommen wurden, mindern den Unterhalt grundsätzlich nicht. Der Pflichtige hat eine Obliegenheit zur Streckung oder Umschuldung."
            tooltipCaseLaw="BGH XII ZR 131/04; OLG Leitlinien"
            placeholder="z. B. 0"
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
              placeholder="z. B. 1200"
            />
            <span className="form-hint">Warmmiete inkl. NK & Heizung</span>
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
              min={1}
              placeholder="z. B. 2"
            />
            <span className="form-hint form-hint-highlight">
              Pro-Kopf-Wohnanteil:{" "}
              {perHeadHousing.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              € / Person
            </span>
          </div>
        </div>

        <div className="input-grid">
          <PeriodNumericField
            label="Direkte Kindesausgaben"
            annualValue={directExpensesAnnual}
            onAnnualValueChange={setDirectExpensesAnnual}
            tooltipTitle="Direkte Kindesausgaben (Bargeld-Auslagen)"
            tooltipExplanation="Vom Elternteil zentral verauslagte Sachkosten für das Kind (z. B. Kleidung, Schulgeld, Monatskarte, Vereinsbeiträge, Krankenzusatzversicherung)."
            tooltipLegalNote="Abgrenzung & Quotenverrechnung nach BGH XII ZB 565/15 Rn. 28, 30: 1. Gewöhnliche Verpflegungs- und Wohnkosten der eigenen Betreuungswoche sind durch den 50%-Naturalunterhalt abgegolten und dürfen NICHT eingetragen werden. 2. Zentrale Sachausgaben und Anschaffungen für das Kind werden nach den Haftungsquoten (Q_A : Q_B) aufgeteilt. Der andere Elternteil übernimmt seinen prozentualen Quotenanteil im Rahmen der Spitzabrechnung."
            tooltipCaseLaw="BGH XII ZB 565/15 Rn. 28–30 (BGHZ 213, 254)"
            placeholder="z. B. 0"
          />
        </div>
      </div>
    </div>
  );
}
