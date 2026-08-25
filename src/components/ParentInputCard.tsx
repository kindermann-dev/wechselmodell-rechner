import { useState } from "react";
import { NumericInput } from "./NumericInput";
import { Tooltip } from "./Tooltip";

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

  const totalNetAnnual = (Number(netAnnual) || 0) + (Number(annualBonusNet) || 0);
  const monthlyNetEquivalent = totalNetAnnual / 12;
  const monthlyGrossEquivalent = (Number(grossAnnual) || 0) / 12;
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
              title="Kindergeld-Bezugsberechtigung (BGH XII ZB 565/15 & 45/15)"
              explanation="Gibt an, an welchen Elternteil die Familienkasse das staatliche Kindergeld auszahlt."
              legalNote="Hälftiger Ausgleich nach BGH XII ZB 565/15 Rn. 32: Das Kindergeld mindert zur Hälfte den Barbedarf (§ 1612b BGB). Der Auszahlungsempfänger muss dem anderen Elternteil die auf die Betreuung entfallende andere Hälfte (z. B. 129,50 € bei 259 € KG) rechnerisch gutschreiben."
              caseLaw="BGH XII ZB 565/15 Rn. 32; BGH XII ZB 45/15"
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="input-grid">
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Name</span>
            </label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Jahres-Bruttoeinkommen (€/Jahr)</span>
              <Tooltip
                title="Jahres-Bruttoeinkommen"
                explanation="Gesamtes Bruttoeinkommen der letzten 12 Monate inklusive Urlaubs-/Weihnachtsgeld, geldwerter Vorteile (z. B. Firmenwagen) und vermögenswirksamer Leistungen."
                legalNote="Dient als Berechnungsgrundlage für die Obergrenze der privaten Altersvorsorge (max. 4 % des Gesamtbruttoeinkommens). Bei Selbstständigen ist der 3-Jahres-Durchschnitt maßgebend."
                caseLaw="BGH XII ZR 149/01, Düsseldorfer Tabelle 2026 Anm. A.3"
              />
            </label>
            <NumericInput value={grossAnnual} onChange={setGrossAnnual} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Ø {monthlyGrossEquivalent.toFixed(2)} € / Monat
            </span>
          </div>
        </div>

        <div className="input-grid">
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Jahres-Nettoeinkommen (€/Jahr)</span>
              <Tooltip
                title="Jahres-Nettoeinkommen (Basis)"
                explanation="Summe der laufenden monatlichen Nettogehälter der letzten 12 Monate (ohne variable Sonderboni). Steuererstattungen sind dem Zuflussjahr hinzuzurechnen."
                legalNote="Steuerklassenwahl: Ab dem Folgejahr der Trennung besteht eine Rechtspflicht zum Wechsel in Steuerklasse I/II. Wer schuldhaft ungünstige Steuerklassen beibehält, muss sich fiktive Berechnungen anrechnen lassen."
                caseLaw="§ 1606 Abs. 3 BGB, BGH XII ZR 111/05"
              />
            </label>
            <NumericInput value={netAnnual} onChange={setNetAnnual} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Basis {((Number(netAnnual) || 0) / 12).toFixed(2)} € / Monat
            </span>
          </div>
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Jahresboni / Sonderzahlung (Netto €)</span>
              <Tooltip
                title="Jahresboni & Einmalzahlungen"
                explanation="Variable Vergütungen wie Jahresboni, Tantiemen, Provisionen, Überstundenvergütungen und Einkommensteuererstattungen der letzten 12 Monate."
                legalNote="Streitpunkt Überstunden & Boni: Regelmäßige Boni zählen voll zum Unterhaltseinkommen. Bei stark schwankenden Beträgen verlangt die Rechtsprechung einen 3-Jahres-Durchschnitt zur Glättung."
                caseLaw="BGH FamRZ 2014, 923; OLG Düsseldorf Leitlinien"
              />
            </label>
            <NumericInput value={annualBonusNet} onChange={setAnnualBonusNet} />
            <span style={{ fontSize: "11px", color: "var(--brand-primary)" }}>
              Gesamt-Netto: Ø {monthlyNetEquivalent.toFixed(2)} € / Monat
            </span>
          </div>
        </div>

        <div className="input-grid">
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Altersvorsorge (€/Jahr)</span>
              <Tooltip
                title="Zusätzliche Altersvorsorge"
                explanation="Tatsächlich geleistete jährliche Beiträge zu privaten Rentenversicherungen, Riester-/Rürup-Verträgen oder betrieblicher Altersvorsorge (bAV)."
                legalNote="Höchstgrenze 4 % des Bruttos: Kann nur abgezogen werden, wenn tatsächliche Zahlungen nachgewiesen werden (kein Pauschalabzug). Bei Unterschreitung des Mindestunterhalts (Mangelfall) kann der Abzug gerichtlich verwehrt werden."
                caseLaw="BGH XII ZR 149/01; BGH XII ZB 599/13"
              />
            </label>
            <NumericInput value={pensionAnnual} onChange={setPensionAnnual} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Ø {((Number(pensionAnnual) || 0) / 12).toFixed(2)} € / Monat (max. 4% Brutto)
            </span>
          </div>
          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "22px",
              }}
            >
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
              <Tooltip
                title="Wohnvorteil (Eigenheim)"
                explanation="Mietfreies Wohnen in einer eigenen Immobilie spart Mietkosten und wird dem Einkommen als fiktiver Ertrag hinzugerechnet."
                legalNote="Eigenheim nach BGH XII ZB 565/15 Rn. 25 & XII ZB 110/16: Zinsen und verbrauchsunabhängige Hauskosten sind abzugsfähig. Tilgung bis max. 4% Vorsorgequote. Achtung: Nicht doppelt als Wohnvorteil-Minderung UND als Schuld eintragen!"
                caseLaw="BGH XII ZB 565/15 Rn. 25; BGH XII ZB 110/16"
              />
            </div>
            <NumericInput
              value={housingAnnual}
              onChange={setHousingAnnual}
              disabled={!hasHomeOwnership}
              placeholder={hasHomeOwnership ? "z. B. 3600" : "Deaktiviert (kein Eigenheim)"}
            />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {hasHomeOwnership
                ? `Ø ${((Number(housingAnnual) || 0) / 12).toFixed(2)} € / Monat`
                : "Nur bei eigenem Wohneigentum aktivierbar"}
            </span>
          </div>
        </div>

        <div className="input-grid">
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Berufsbed. Aufwendungen</span>
              <Tooltip
                title="Berufsbedingte Aufwendungen"
                explanation="Aufwendungen zur Sicherung und Erzielung des Erwerbseinkommens (Fahrtkosten, Arbeitsmittel, doppelte Haushaltsführung)."
                legalNote="5%-Pauschale vs. Einzelnachweis: Die 5%-Pauschale (50–150 €/Monat) gilt nur bei Erwerbstätigkeit ohne Nachweispflicht. Wer höhere tatsächliche Fahrtkosten (0,42 €/km) nachweist, muss alle Aufwendungen darlegen; die Pauschale entfällt dann."
                caseLaw="Düsseldorfer Tabelle 2026 Anm. A.3; BGH XII ZB 599/13"
              />
            </label>
            <select
              className="form-select"
              value={useFlatRate ? "flat" : "custom"}
              onChange={(e) => setUseFlatRate(e.target.value === "flat")}
            >
              <option value="flat">5% Pauschale (50 - 150 €/Monat)</option>
              <option value="custom">Individueller Jahresnachweis</option>
            </select>
            {!useFlatRate && (
              <NumericInput
                style={{ marginTop: "8px" }}
                placeholder="Nachgewiesener Jahresbetrag (€)"
                value={customAnnualExpense}
                onChange={setCustomAnnualExpense}
              />
            )}
          </div>
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Berücksichtigungsf. Schulden (€/Jahr)</span>
              <Tooltip
                title="Berücksichtigungsfähige Verbindlichkeiten"
                explanation="Laufende jährliche Tilgungs- und Zinsleistungen für eheprägende, familiäre oder notwendige Kredite."
                legalNote="Streitpunkt Neue Konsumschulden: Verbindlichkeiten, die nach der Trennung für Konsumzwecke aufgenommen wurden, mindern den Unterhalt grundsätzlich nicht. Der Pflichtige hat eine Obliegenheit zur Streckung oder Umschuldung."
                caseLaw="BGH XII ZR 131/04; OLG Leitlinien"
              />
            </label>
            <NumericInput value={debtsAnnual} onChange={setDebtsAnnual} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Ø {((Number(debtsAnnual) || 0) / 12).toFixed(2)} € / Monat
            </span>
          </div>
        </div>

        {/* Tatsächliche Wohnkosten (BGH XII ZB 565/15 Rn. 25 & Kopfzahl-Methode) */}
        <div className="input-grid">
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Tatsächliche Warmmiete (€/Monat)</span>
              <Tooltip
                title="Tatsächliche Warmmiete des Haushalts (BGH XII ZB 565/15 Rn. 25)"
                explanation="Monatliche Warmmiete inkl. Nebenkosten und Heizung (bzw. Zinsen/Nebenkosten bei Eigentum)."
                legalNote="Realkosten-Vergleich nach BGH XII ZB 565/15: Der auf das Kind entfallende Wohnbedarf wird nach der Kopfzahl-Methode (Warmmiete / Personen) ermittelt. Übersteigen die summierten tatsächlichen Wohnkosten beider Haushalte den im Tabellenunterhalt bereits enthaltenen 20%-Wohnkostenanteil, wird die positive Differenz automatisch als Wohnmehrbedarf des Kindes angesetzt."
                caseLaw="BGH XII ZB 565/15 Rn. 25 (BGHZ 213, 254)"
              />
            </label>
            <NumericInput
              value={warmRentMonthly}
              onChange={setWarmRentMonthly}
              placeholder="z. B. 1200"
            />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Warmmiete inkl. NK & Heizung
            </span>
          </div>
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Personen im Haushalt</span>
              <Tooltip
                title="Haushaltsgröße (Kopfzahl-Methode)"
                explanation="Gesamtzahl der ständig oder wechselnd im Haushalt lebenden Personen (Elternteil + alle Kinder + Partner)."
                legalNote="Kopfzahl-Aufteilung nach BGH: Die Warmmiete wird gleichmäßig auf alle Haushaltsangehörigen aufgeteilt. Wohnen z. B. der Elternteil und 2 Kinder in der Wohnung, beträgt die Kopfzahl 3 (1/3 Warmmiete je Kind)."
                caseLaw="BGH FamRZ 2011, 454; Wendl/Dose § 1 Rn. 562"
              />
            </label>
            <NumericInput
              value={householdPersons}
              onChange={setHouseholdPersons}
              min={1}
              placeholder="z. B. 2"
            />
            <span style={{ fontSize: "11px", color: "var(--brand-primary)" }}>
              Pro-Kopf-Wohnanteil: {perHeadHousing.toFixed(2)} € / Person
            </span>
          </div>
        </div>

        <div className="input-grid">
          <div className="form-group">
            <label className="form-label-with-tooltip">
              <span>Direkte Kindesausgaben (€/Jahr)</span>
              <Tooltip
                title="Direkte Kindesausgaben (Bargeld-Auslagen)"
                explanation="Vom Elternteil zentral verauslagte Sachkosten für das Kind (z. B. Kleidung, Schulgeld, Monatskarte, Vereinsbeiträge, Krankenzusatzversicherung)."
                legalNote="Abgrenzung & Quotenverrechnung nach BGH XII ZB 565/15 Rn. 28, 30: 1. Gewöhnliche Verpflegungs- und Wohnkosten der eigenen Betreuungswoche sind durch den 50%-Naturalunterhalt abgegolten und dürfen NICHT eingetragen werden. 2. Zentrale Sachausgaben und Anschaffungen für das Kind werden nach den Haftungsquoten (Q_A : Q_B) aufgeteilt. Der andere Elternteil übernimmt seinen prozentualen Quotenanteil im Rahmen der Spitzabrechnung."
                caseLaw="BGH XII ZB 565/15 Rn. 28–30 (BGHZ 213, 254)"
              />
            </label>
            <NumericInput value={directExpensesAnnual} onChange={setDirectExpensesAnnual} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Ø {((Number(directExpensesAnnual) || 0) / 12).toFixed(2)} € / Monat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
