import { APP_VERSION } from "../config/changelog";
import type { LegalTab } from "./legal/LegalModal";

interface FooterProps {
  onOpenLegal?: (tab: LegalTab) => void;
  onOpenChangelog?: () => void;
}

export function Footer({ onOpenLegal, onOpenChangelog }: FooterProps) {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-disclaimer">
          <strong>Rechtlicher Hinweis:</strong> Dieser Rechner dient der Orientierung nach den
          Grundsätzen des BGH (XII ZB 565/15, XII ZB 599/13, XII ZB 45/15) und der Düsseldorfer
          Tabelle 2026. Er stellt keine Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes
          (RDG) dar.
        </div>
        <div className="footer-links">
          {onOpenChangelog ? (
            <button
              type="button"
              onClick={onOpenChangelog}
              className="footer-link btn-link"
              title="Versionshistorie & Changelog öffnen"
            >
              Version {APP_VERSION} (Changelog)
            </button>
          ) : (
            <span>Version {APP_VERSION} (Düsseldorfer Tabelle 2026)</span>
          )}
          <span className="footer-dot">•</span>
          {onOpenLegal && (
            <>
              <button
                type="button"
                onClick={() => onOpenLegal("impressum")}
                className="footer-link btn-link"
              >
                Impressum
              </button>
              <span className="footer-dot">•</span>
              <button
                type="button"
                onClick={() => onOpenLegal("datenschutz")}
                className="footer-link btn-link"
              >
                Datenschutzerklärung
              </button>
              <span className="footer-dot">•</span>
            </>
          )}
          <a
            href="https://github.com/kindermann-dev/wechselmodell-rechner"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub Repository
          </a>
          <span className="footer-dot">•</span>
          <a
            href="https://github.com/kindermann-dev/wechselmodell-rechner/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            MIT Lizenz
          </a>
        </div>
      </div>
    </footer>
  );
}
