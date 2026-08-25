import { APP_VERSION } from "../config/changelog";
import { Tooltip } from "./Tooltip";

interface HeaderProps {
  onOpenChangelog?: () => void;
}

export function Header({ onOpenChangelog }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-title-row">
        <div>
          <h1>Kindesunterhaltsrechner Wechselmodell</h1>
          <p>
            Paritätisches 50:50-Wechselmodell nach BGH XII ZB 599/13, 565/15 &amp; 45/15
            (Düsseldorfer Tabelle 2026)
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {onOpenChangelog && (
            <button
              type="button"
              className="badge-legal btn-version-badge"
              onClick={onOpenChangelog}
              title="Versionshistorie & Changelog anzeigen"
              aria-label={`Version ${APP_VERSION} Changelog anzeigen`}
            >
              <span>📋 v{APP_VERSION} (Changelog)</span>
            </button>
          )}
          <Tooltip
            title="Rechtliche Abgrenzung: Symmetrisches Wechselmodell"
            explanation="Dieser Rechner ist ausschließlich auf das echte, paritätische Wechselmodell (50:50-Betreuung) ausgelegt."
            legalNote="Abgrenzung zum asymmetrischen Modell: Der BGH hat mit Beschluss vom 12.03.2014 (XII ZB 601/13, FamRZ 2014, 917) klargestellt, dass bei asymmetrischer Betreuung (z. B. 40:60) keine wechselseitige Quotelung stattfindet, sondern strikt das Residenzmodell (§ 1606 Abs. 3 S. 2 BGB) gilt."
            caseLaw="BGH XII ZB 601/13 (FamRZ 2014, 917); BGH XII ZB 599/13"
          />
        </div>
      </div>
    </header>
  );
}
