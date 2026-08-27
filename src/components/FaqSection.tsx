import { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  legalBasis: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "berechnung-7-schritte",
    question: "Wie wird der Kindesunterhalt im echten 50:50-Wechselmodell berechnet?",
    answer:
      "Im paritätischen Wechselmodell betreuen beide Elternteile das Kind zu gleichen Teilen und leisten bereits 50 % des Unterhalts in Form von Naturalunterhalt (Wohnen, Verpflegung, Betreuung). Nach § 1606 Abs. 3 S. 1 BGB sind jedoch beide Elternteile im Verhältnis ihrer finanziellen Leistungsfähigkeit barunterhaltspflichtig. Die Berechnung erfolgt nach dem 7-Schritte-Schema des Bundesgerichtshofs (BGH XII ZB 565/15): 1. Bereinigung der beiderseitigen Nettoeinkommen, 2. Bestimmung der Einkommensgruppe der Düsseldorfer Tabelle anhand des zusammengerechneten Einkommens, 3. Ermittlung der individuellen Haftungsquoten nach Abzug des angemessenen Selbstbehalts (1.750 €), 4. Ermittlung der primären Barunterhaltspflicht abzüglich 50 % Naturalunterhalt, 5. Quotenmäßige Aufteilung verauslagter Direktkosten, 6. Zweistufiges Kindergeld-Splitting nach BGH XII ZB 45/15 (25 % Betreuungsanteil + quotenmäßiger 50 % Baranteil) und 7. Spitzabrechnung des monatlichen Zahlbetrags.",
    legalBasis: "§ 1606 Abs. 3 S. 1 BGB, BGH XII ZB 565/15",
  },
  {
    id: "wer-zahlt-an-wen",
    question: "Wer muss im Wechselmodell an wen Unterhalt zahlen?",
    answer:
      "Der Elternteil mit dem höheren Haftungseinkommen (bereinigtes Netto abzüglich 1.750 € Selbstbehalt) zahlt eine monatliche Ausgleichszahlung (die sogenannte Barunterhaltsspitze) an den anderen Elternteil. Haben beide Elternteile nach Abzug des Selbstbehalts exakt das gleiche bereinigte Einkommen und verauslagen gleiche Sachkosten, beträgt der monatliche Ausgleich 0,00 €. Bei ungleichen Einkommen gleicht die Zahlung den höheren finanziellen Lebensstandard des wohlhabenderen Elternteils für das Kind aus.",
    legalBasis: "BGH XII ZB 599/13, BGH XII ZB 565/15",
  },
  {
    id: "kindergeld-aufteilung",
    question: "Wie wird das staatliche Kindergeld im Wechselmodell aufgeteilt?",
    answer:
      "Das staatliche Kindergeld (2026: 259 € pro Monat und Kind) wird nach dem Grundsatzbeschluss des BGH vom 20. April 2016 (Az. XII ZB 45/15) und § 1612b BGB zweistufig aufgeteilt: 1. Ein 50 %-iger Betreuungsanteil steht beiden Elternteilen zu gleichen Teilen zu (je 25 % des gesamten Kindergeldes = 64,75 € fix und einkommensunabhängig als Betreuungsausgleich). 2. Der verbleibende 50 %-ige Baranteil (129,50 €) mindert den kindlichen Barbedarf und wird nach den individuellen Haftungsquoten (Q_A : Q_B) verrechnet. Der Auszahlungsempfänger leistet an den anderen Elternteil: ΔKG = 25 % KG + (Q_andere × 50 % KG). Liegen keine Einkommensnachweise vor, besteht stets ein sofortiger isolierter Mindestanspruch auf Auszahlung von 25 % des Kindergeldes („Ein-Viertel-Regel“).",
    legalBasis: "§ 1612b BGB, BGH XII ZB 45/15 (Beschluss vom 20.04.2016)",
  },
  {
    id: "wohnmehrbedarf",
    question: "Was ist der Wohnmehrbedarf und wie wird er nach der Kopfzahlmethode ermittelt?",
    answer:
      "Da im Wechselmodell in beiden elterlichen Haushalten Wohnraum bereitgestellt werden muss, können reale Mehrkosten für das Wohnen entstehen (BGH XII ZB 565/15 Rn. 25). Nach der in der familienrichterlichen Praxis anerkannten Kopfzahlmethode (vgl. Wendl/Klinkhammer) wird die Warmmiete jedes Haushalts durch die dort lebende Personenanzahl geteilt und für beide Haushalte addiert. Übersteigt diese Summe den im Tabellenunterhalt kalkulierten 20 %-Wohnkostenanteil, kann der Differenzbetrag als Wohnmehrbedarf angesetzt und nach Haftungsquoten verteilt werden.",
    legalBasis: "BGH XII ZB 565/15 Rn. 25",
  },
  {
    id: "direktkosten-aufteilung",
    question: "Wie werden Sachausgaben wie Hortgebühren, Kleidung oder Schulbedarf geteilt?",
    answer:
      "Kosten für das Kind, die zentral von einem Elternteil verauslagt werden (z. B. Hort- oder Kitabeiträge, Schulbücher, Klassenfahrten, Sportvereine, Kleidung), werden nicht pauschal 50:50 geteilt, sondern nach der höchstrichterlichen Rechtsprechung (BGH XII ZB 565/15 Rn. 28–30) exakt im Verhältnis der berechneten Haftungsquoten (Q_A : Q_B) miteinander verrechnet.",
    legalBasis: "BGH XII ZB 565/15 Rn. 28-30",
  },
  {
    id: "pkv-beitraege",
    question:
      "Wie werden Beiträge zur privaten Kranken- und Pflegeversicherung (PKV/PPV) für Eltern und Kinder berücksichtigt?",
    answer:
      "Nach Ziffer 10.4 der OLG-Leitlinien und § 10 Abs. 1 Nr. 3 EStG wird differenziert: 1. PKV der Eltern: Abzugsfähig vom Nettoeinkommen ist der monatliche Eigenanteil für die Basisabsicherung inkl. gesetzlicher Pflegepflichtversicherung abzüglich des steuerfreien Arbeitgeberzuschusses oder der Beihilfe (Wahlleistungen wie Chefarzt/Einbettzimmer sind nicht abzugsfähig). 2. PKV des Kindes: Die PKV-Beiträge des Kindes stellen echten unterhaltsrechtlichen Mehrbedarf dar. Sie werden nach den ermittelten Haftungsquoten (Q_A : Q_B) auf beide Eltern verteilt. Der verauslagende Elternteil stellt seinen gezahlten Betrag in die Direktkosten ein und erhält den Quotenanteil des anderen Elternteils in der Spitzabrechnung erstattet.",
    legalBasis: "§ 10 Abs. 1 Nr. 3 EStG, Ziff. 10.4 OLG-Leitlinien, BGH XII ZB 565/15",
  },
  {
    id: "sozialleistungen-subsidiaritaet",
    question:
      "Werden staatliche Sozialleistungen wie Kinderzuschlag, Wohngeld oder Unterhaltsvorschuss angerechnet?",
    answer:
      "Es gilt die BGH-Differenzierung: 1. Kinderzuschlag (§ 6a BKGG): Wird der Kinderzuschlag tatsächlich bezogen, gilt er nach ständiger BGH-Rechtsprechung (BGH XII ZB 512/19) als bedarfsdeckendes Kindeseinkommen, das den Gesamtbedarf des Kindes vor der Quotenverteilung zu 100 % mindert (Zuflussprinzip). 2. Wohngeld (WoGG): Wohngeld mindert den Tabellenbedarf nicht, sondern dient nach dem Subsidiaritätsprinzip (§ 1606 Abs. 3 S. 1 BGB) lediglich der Deckung ungedeckter Wohnkosten beim jeweiligen Elternteil. 3. Kindergeld (§ 1612b BGB): Wird zweistufig hälftig angerechnet (BGH XII ZB 45/15). 4. Unterhaltsvorschuss (UVG): Scheidet im paritätischen Wechselmodell in der Regel aus, da beide Eltern Naturalunterhalt leisten.",
    legalBasis:
      "§ 1606 Abs. 3 S. 1 BGB, § 6a BKGG, WoGG, § 2 UVG, BGH XII ZB 512/19, BGH XII ZB 45/15",
  },
  {
    id: "asymmetrische-betreuung",
    question: "Gilt diese Berechnung auch bei einer 40:60- oder 30:70-Betreuung?",
    answer:
      "Nein, die Wechselmodell-Berechnung gilt nur bei paritätischer 50:50-Betreuung; asymmetrische Betreuungsmodelle gelten als Residenzmodell mit erweitertem Umgang, bei dem der Mitbetreuende vollen Barunterhalt schuldet, jedoch durch eine Herabstufung in der Düsseldorfer Tabelle sowie einen pauschalen Bedarfsabzug von 10 % (maximal 15 %) entlastet werden kann.",
    legalBasis:
      "§ 1606 Abs. 3 BGB, § 1629 Abs. 2 Satz 2 BGB; BGH XII ZB 415/25 (15.04.2026), BGH XII ZB 234/13 (12.03.2014), BGH XII ZB 599/13 (05.11.2014)",
  },
];

export function FaqSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "berechnung-7-schritte": true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="faq-section" aria-labelledby="faq-section-title">
      <div className="faq-header">
        <div>
          <h2 id="faq-section-title" className="faq-title">
            📚 Häufig gestellte Fragen zum Wechselmodell (FAQ)
          </h2>
          <p className="faq-subtitle">
            Rechtliche Hintergründe zur Unterhaltsberechnung, BGH-Rechtsprechung und Düsseldorfer
            Tabelle 2026.
          </p>
        </div>
      </div>

      <div className="faq-list">
        {FAQ_DATA.map((item) => {
          const isOpen = Boolean(openItems[item.id]);
          return (
            <article
              key={item.id}
              className={`faq-card ${isOpen ? "faq-card-open" : ""}`}
              id={`faq-${item.id}`}
            >
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
              >
                <span className="faq-question-text">{item.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className={`faq-chevron ${isOpen ? "faq-chevron-rotated" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div id={`faq-answer-${item.id}`} className="faq-answer-container" role="region">
                  <p className="faq-answer-text">{item.answer}</p>
                  <div className="faq-legal-badge">
                    <span className="badge-legal">⚖️ {item.legalBasis}</span>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
