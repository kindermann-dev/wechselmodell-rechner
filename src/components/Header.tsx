import { APP_VERSION } from "../config/changelog";
import { TOOLTIP_TEXTS } from "../config/legalTexts";
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
        <div className="header-actions">
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
          <Tooltip {...TOOLTIP_TEXTS.header.asymmetricNotice} />
        </div>
      </div>
    </header>
  );
}
