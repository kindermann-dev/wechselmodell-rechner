import { useEffect } from "react";
import { APP_VERSION, CHANGELOG_ENTRIES } from "../../config/changelog";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Hintergrund-Scrollen verhindern, wenn der Modal-Dialog geöffnet ist
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-modal-title"
      onClick={onClose}
    >
      <div className="modal-card changelog-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal-Kopfbereich */}
        <div className="modal-header">
          <div className="modal-header-tabs">
            <h2 id="changelog-modal-title" className="changelog-modal-title">
              📋 Versionshistorie &amp; Changelog
            </h2>
            <span className="badge-legal badge-version-current">v{APP_VERSION} (Aktuell)</span>
          </div>

          <div className="modal-header-actions">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-action btn-action-secondary"
              title="Changelog drucken"
              aria-label="Changelog drucken"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>Drucken</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-modal-close"
              aria-label="Modal schließen"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal-Inhaltsbereich (scrollbar) */}
        <div className="modal-body changelog-modal-body">
          <p className="changelog-intro">
            Übersicht aller Versionen, rechtlichen Aktualisierungen nach BGH-Rechtsprechung und
            technischen Verbesserungen des Kindesunterhaltsrechners.
          </p>

          <div className="changelog-timeline">
            {CHANGELOG_ENTRIES.map((entry) => (
              <article
                key={entry.version}
                className={`changelog-item ${entry.isCurrent ? "changelog-item-current" : ""}`}
              >
                <div className="changelog-item-header">
                  <div className="changelog-item-title-row">
                    <span className="changelog-version-tag">Version {entry.version}</span>
                    {entry.isCurrent && (
                      <span className="changelog-current-badge">Aktuelle Version</span>
                    )}
                    <span className="changelog-date">
                      {new Date(entry.date).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="changelog-item-heading">{entry.title}</h3>
                </div>

                <p className="changelog-item-summary">{entry.summary}</p>

                <div className="changelog-categories-list">
                  {entry.categories.map((group, gIdx) => (
                    <div key={gIdx} className="changelog-category-group">
                      <div className="changelog-category-header">
                        {group.icon && (
                          <span className="changelog-category-icon">{group.icon}</span>
                        )}
                        <span className="changelog-category-name">{group.categoryLabel}</span>
                      </div>
                      <ul className="changelog-item-bullets">
                        {group.items.map((item, itemIdx) => (
                          <li key={itemIdx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Modal-Fußbereich */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-action">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
