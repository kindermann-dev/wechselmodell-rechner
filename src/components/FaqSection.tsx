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
      "Im paritätischen Wechselmodell betreuen beide Elternteile das Kind zu gleichen Teilen und erbringen den laufenden Lebensunterhalt während ihrer Betreuungszeit bereits jeweils zur Hälfte in natura. Nach § 1606 Abs. 3 S. 1 BGB haften jedoch beide Elternteile im Verhältnis ihrer finanziellen Leistungsfähigkeit für den Barunterhalt. Die Berechnung erfolgt nach den Grundsätzen des Bundesgerichtshofs (BGH XII ZB 565/15) in folgenden Kernschritten: 1. Ermittlung des bereinigten Nettoeinkommens beider Eltern, 2. Bestimmung der Einkommensgruppe der Düsseldorfer Tabelle nach dem zusammengerechneten Gesamteinkommen, 3. Berechnung der individuellen Haftungsquoten nach Abzug des angemessenen Selbstbehalts (1.750 €), 4. Ermittlung des Gesamtbedarfs (inkl. Wohn- und sonstigem Mehrbedarf) abzüglich 50 % Naturalunterhalt, 5. Quotenmäßige Aufteilung verauslagter Mehrkosten und zentraler Anschaffungen, 6. Zweistufiges Kindergeld-Splitting nach BGH XII ZB 45/15 (25 % Betreuungsausgleich + quotenmäßiger 50 % Baranteil) und 7. Ermittlung der monatlichen Ausgleichszahlung (Barunterhaltsspitze).",
    legalBasis: "§ 1606 Abs. 3 S. 1 BGB, BGH XII ZB 565/15",
  },
  {
    id: "wer-zahlt-an-wen",
    question: "Wer muss im Wechselmodell an wen Unterhalt zahlen?",
    answer:
      "Der Elternteil mit dem höheren Haftungseinkommen (bereinigtes Nettoeinkommen abzüglich des angemessenen Selbstbehalts von 1.750 €) zahlt eine monatliche Ausgleichszahlung an den anderen Elternteil. Rechtlich handelt es sich dabei um die sogenannte Barunterhaltsspitze des Kindes (BGH XII ZB 565/15 Rn. 44), die den höheren Lebensstandard des leistungsfähigeren Elternteils für das Kind sichert. Haben beide Elternteile nach Abzug des Selbstbehalts exakt das gleiche bereinigte Einkommen und tragen identische Direkt- und Wohnkosten, beträgt der monatliche Zahlbetrag 0,00 €.",
    legalBasis: "§ 1606 Abs. 3 S. 1 BGB, BGH XII ZB 599/13, BGH XII ZB 565/15",
  },
  {
    id: "kindergeld-aufteilung",
    question: "Wie wird das staatliche Kindergeld im Wechselmodell aufgeteilt?",
    answer:
      "Das staatliche Kindergeld (2026: 259 € monatlich pro Kind) wird nach dem Grundsatzbeschluss des BGH vom 20. April 2016 (Az. XII ZB 45/15) und § 1612b BGB zweistufig aufgeteilt: 1. Ein 50 %-iger Betreuungsanteil steht beiden Elternteilen zu gleichen Teilen zu (je 25 % des gesamten Kindergeldes = 64,75 € fix und einkommensunabhängig als Betreuungsausgleich). 2. Der verbleibende 50 %-ige Baranteil (129,50 €) mindert den kindlichen Barbedarf und wird nach den individuellen Haftungsquoten (Q_A : Q_B) verrechnet. Der Auszahlungsempfänger leistet an den anderen Elternteil: ΔKG = 25 % KG + (Q_andere x 50 % KG). Liegen keine Einkommensnachweise vor, besteht stets ein sofortiger isolierter Mindestanspruch auf Auszahlung von 25 % des Kindergeldes („Ein-Viertel-Regel“).",
    legalBasis: "§ 1612b BGB, BGH XII ZB 45/15",
  },
  {
    id: "wohnmehrbedarf",
    question:
      "Was ist der Wohnmehrbedarf und wie wird er nach der BGH-Rechtsprechung (Kopfzahlmethode) ermittelt?",
    answer:
      "Der in den Richtsätzen der Düsseldorfer Tabelle einkalkulierte Wohnkostenanteil von pauschal 20 % bildet lediglich den typisierten Bedarf für ein einziges Kinderzimmer im traditionellen Residenzmodell ab. Im echten 50:50-Wechselmodell müssen jedoch beide Elternteile vollwertigen Wohnraum für das Kind vorhalten. Der tatsächliche Wohnaufwand pro Kind wird in jedem Haushalt nach der Kopfzahlmethode bestimmt (Warmmiete geteilt durch Anzahl der Haushaltsmitglieder). Nach ständiger Rechtsprechung des Bundesgerichtshofs (BGH XII ZB 565/15 Rn. 35) stellt der über die 20 %-Tabellenpauschale hinausgehende Gesamtwohnaufwand beider Eltern einen unterhaltsrechtlichen Mehrbedarf dar, der in den Gesamtbedarf einfließt und nach den Haftungsquoten (Q_A : Q_B) geteilt wird. Zur Bestimmung der primären Barunterhaltspflicht werden die tatsächlichen Kindes-Wohnkosten beider Haushalte vom Gesamtbedarf abgezogen. Den verbleibenden Restbedarf für den laufenden Lebensunterhalt (Ernährung, Kleidung, Freizeit) erbringen beide Elternteile zu je 50 % als Naturalunterhalt während ihrer Betreuungszeit. Vom individuellen Haftungsanteil bringt jeder Elternteil diesen 50 %-Naturalunterhalt sowie seine im eigenen Haushalt getragenen Kindes-Wohnkosten bedarfsmindernd in Abzug.",
    legalBasis:
      "BGH XII ZB 565/15 Rn. 35; Wendl/Dose/Klinkhammer, Das Unterhaltsrecht in der familiengerichtlichen Praxis, § 2",
  },
  {
    id: "direktkosten-aufteilung",
    question: "Wie werden Sachausgaben wie Hortgebühren, Kleidung oder Schulbedarf geteilt?",
    answer:
      "Hier ist zwischen Mehrbedarf und laufendem Regelbedarf zu unterscheiden: 1. Echter Mehrbedarf (z. B. Kita-/Hortgebühren ohne Verpflegung, Klassenfahrten, ungedeckte Krankheitskosten): Diese Kosten fallen zusätzlich zum Tabellenunterhalt an und werden nach BGH XII ZB 565/15 Rn. 28-30 streng nach den ermittelten Haftungsquoten (Q_A : Q_B) aufgeteilt. 2. Laufender Regelbedarf (z. B. Kleidung, Schulbedarf, Spielzeug): Diese Positionen sind im Tabellenunterhalt bereits enthalten. Werden solche Anschaffungen einvernehmlich zentral von einem Elternteil verauslagt, stellt dieser den Betrag in die Abrechnung ein und erhält den Quotenanteil des anderen Elternteils erstattet.",
    legalBasis: "§ 1610 Abs. 2 BGB, BGH XII ZB 565/15 Rn. 28-30, BGH XII ZR 65/07",
  },
  {
    id: "pkv-beitraege",
    question:
      "Wie werden Beiträge zur privaten Kranken- und Pflegeversicherung (PKV/PPV) für Eltern und Kinder berücksichtigt?",
    answer:
      "Nach Ziffer 10.4 der OLG-Leitlinien und § 10 Abs. 1 Nr. 3 EStG wird differenziert: 1. PKV der Eltern: Abzugsfähig vom Nettoeinkommen ist der monatliche Eigenanteil für die Basisabsicherung inkl. gesetzlicher Pflegepflichtversicherung abzüglich des steuerfreien Arbeitgeberzuschusses oder der Beihilfe (Wahlleistungen wie Chefarzt/Einbettzimmer sind nicht abzugsfähig). 2. PKV des Kindes: Da die Düsseldorfer Tabelle von einer beitragsfreien gesetzlichen Familienversicherung ausgeht, stellen PKV-Beiträge des Kindes echten unterhaltsrechtlichen Mehrbedarf dar. Sie fließen in den Gesamtbedarf ein und werden nach den Haftungsquoten (Q_A : Q_B) geteilt. Der verauslagende Elternteil bringt den gezahlten Beitrag als direkte Leistung voll in Abzug.",
    legalBasis:
      "§ 10 Abs. 1 Nr. 3 EStG, Ziff. 10.4 OLG-Leitlinien, BGH XII ZB 565/15, BGH XII ZR 158/06",
  },
  {
    id: "sozialleistungen-subsidiaritaet",
    question:
      "Werden staatliche Sozialleistungen wie Kinderzuschlag, Wohngeld oder Unterhaltsvorschuss angerechnet?",
    answer:
      "Es gilt die gefestigte Rechtsprechung: 1. Kinderzuschlag (§ 6a BKGG): Wird der Kinderzuschlag bezogen, gilt er nach ständiger BGH-Rechtsprechung (BGH XII ZB 512/19) als bedarfsdeckendes Kindeseinkommen, das den Gesamtbedarf des Kindes vor der Quotenverteilung zu 100 % mindert. 2. Wohngeld (WoGG): Wohngeld mindert den Tabellenbedarf des Kindes nicht, sondern dient nach dem Subsidiaritätsprinzip (§ 1606 Abs. 3 S. 1 BGB) der Entlastung des jeweiligen Haushalts. 3. Kindergeld (§ 1612b BGB): Wird zweistufig zur Hälfte auf den Betreuungsaufwand und zur Hälfte auf den Barbedarf angerechnet (BGH XII ZB 45/15). 4. Unterhaltsvorschuss (UVG): Scheidet im paritätischen Wechselmodell aus, da kein Elternteil alleinstehend im Sinne des § 1 Abs. 1 Nr. 2 UVG ist (BVerwG 5 C 20.11).",
    legalBasis:
      "§ 1606 Abs. 3 S. 1 BGB, § 1612b BGB, § 6a BKGG, § 1 Abs. 1 Nr. 2 UVG, BGH XII ZB 512/19, BGH XII ZB 45/15, BVerwG 5 C 20.11",
  },
  {
    id: "asymmetrische-betreuung",
    question: "Gilt diese Berechnung auch bei einer 40:60- oder 30:70-Betreuung?",
    answer:
      "Nein. Die streng quotierte Wechselmodell-Berechnung gilt ausschließlich bei einer echten, paritätischen 50:50-Betreuung. Liegt der Betreuungsanteil eines Elternteils darunter (z. B. 40:60 oder 30:70), verbleibt es rechtlich beim Residenzmodell mit erweitertem Umgang (BGH XII ZB 599/13). In diesem Fall bleibt der weniger betreuende Elternteil voll barunterhaltspflichtig (§ 1606 Abs. 3 S. 2 BGB). Die überobligatorische Betreuung kann lediglich nach den Umständen des Einzelfalls durch eine Herabstufung um ein oder zwei Einkommensgruppen der Düsseldorfer Tabelle berücksichtigt werden.",
    legalBasis:
      "§ 1606 Abs. 3 S. 2 BGB, § 1629 Abs. 2 S. 2 BGB, BGH XII ZB 599/13, BGH XII ZB 234/13",
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
