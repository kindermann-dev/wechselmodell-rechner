import { useEffect } from "react";
import { ImpressumContent } from "./ImpressumContent";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";

export type LegalTab = "impressum" | "datenschutz";

interface LegalModalProps {
  isOpen: boolean;
  activeTab: LegalTab;
  onClose: () => void;
  onTabChange: (tab: LegalTab) => void;
}

export function LegalModal({ isOpen, activeTab, onClose, onTabChange }: LegalModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling when modal is open
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
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-tabs">
            {/* Tab navigation buttons */}
            <button
              type="button"
              id="legal-modal-title"
              onClick={() => onTabChange("impressum")}
              className={`tab-btn ${activeTab === "impressum" ? "active" : ""}`}
            >
              Impressum
            </button>
            <button
              type="button"
              onClick={() => onTabChange("datenschutz")}
              className={`tab-btn ${activeTab === "datenschutz" ? "active" : ""}`}
            >
              Datenschutzerklärung
            </button>
          </div>

          <div className="modal-header-actions">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-action btn-action-secondary"
              title="Seite drucken"
              aria-label="Rechtliche Hinweise drucken"
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

        {/* Modal Scrollable Content */}
        <div className="modal-body">
          {activeTab === "impressum" ? <ImpressumContent /> : <PrivacyPolicyContent />}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-action">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
