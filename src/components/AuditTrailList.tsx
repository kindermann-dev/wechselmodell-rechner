import { useState, useRef } from "react";
import type { CalculationStepLog } from "../types/output";

interface AuditTrailListProps {
  auditTrail: CalculationStepLog[];
}

/**
 * AuditTrailList - Interaktives und deterministisches Prüfprotokoll für das Wechselmodell.
 * Bietet Schritt-für-Schritt-Navigation (Vorheriger / Nächster Punkt) sowohl auf Desktop als auch
 * auf Mobilgeräten, damit Nutzer beim sorgfältigen Durchlesen gezielt durch die BGH-Prüfstufen
 * springen können, ohne manuell scrollen zu müssen.
 */
export function AuditTrailList({ auditTrail }: AuditTrailListProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalSteps = auditTrail.length;
  const safeIndex = totalSteps > 0 ? Math.min(Math.max(0, activeStepIndex), totalSteps - 1) : 0;

  const scrollToStep = (targetIndex: number) => {
    const container = listRef.current;
    const targetEl = itemRefs.current[targetIndex];

    if (!container || !targetEl) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const relativeTop = targetRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
      top: Math.max(0, relativeTop),
      behavior: "smooth",
    });

    // Stellt sicher, dass auf Mobilgeräten der Prüfprotokoll-Container sichtbar im Viewport bleibt
    if (containerRect.top < 0) {
      container.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      const prevIndex = safeIndex - 1;
      setActiveStepIndex(prevIndex);
      scrollToStep(prevIndex);
    }
  };

  const handleNext = () => {
    if (safeIndex < totalSteps - 1) {
      const nextIndex = safeIndex + 1;
      setActiveStepIndex(nextIndex);
      scrollToStep(nextIndex);
    }
  };

  const handleSelectStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setActiveStepIndex(index);
      scrollToStep(index);
    }
  };

  return (
    <div className="audit-wrapper">
      <div className="card-header audit-card-header" style={{ marginTop: "8px" }}>
        <div>
          <span className="card-title" style={{ fontSize: "14px" }}>
            Schrittweises Prüfprotokoll ({totalSteps})
          </span>
          <div className="audit-subtitle print-only-text">
            Deterministische 7-Stufen-Prüfung nach BGH XII ZB 565/15, XII ZB 599/13 &amp; XII ZB
            45/15 (Düsseldorfer Tabelle 2026)
          </div>
        </div>

        <div className="card-header-controls audit-nav-controls">
          <button
            type="button"
            className="btn-audit-nav btn-audit-prev"
            onClick={handlePrev}
            disabled={safeIndex <= 0 || totalSteps === 0}
            title="Zum vorherigen Prüfschritt springen"
            aria-label="Vorheriger Prüfschritt"
          >
            <span aria-hidden="true">←</span> Vorheriger
          </button>

          <span className="audit-nav-counter" aria-live="polite" aria-atomic="true">
            {totalSteps > 0 ? (
              <>
                <span className="audit-nav-counter-label">Schritt </span>
                <strong>{safeIndex + 1}</strong>
                <span className="audit-nav-counter-sep"> / </span>
                <span>{totalSteps}</span>
              </>
            ) : (
              "0 / 0"
            )}
          </span>

          <button
            type="button"
            className="btn-audit-nav btn-audit-next"
            onClick={handleNext}
            disabled={safeIndex >= totalSteps - 1 || totalSteps === 0}
            title="Zum nächsten Prüfschritt springen"
            aria-label="Nächster Prüfschritt"
          >
            Nächster <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div ref={listRef} className="audit-list">
        {auditTrail.map((log, index) => {
          const isActive = index === safeIndex;
          return (
            <div
              key={log.stepNumber}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={`audit-item ${isActive ? "audit-item-active" : ""}`}
              onClick={() => handleSelectStep(index)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? "step" : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectStep(index);
                }
              }}
            >
              <div className="audit-head">
                <span className="audit-step-title">
                  Stufe {log.stepNumber}: {log.label}
                </span>
                {isActive && (
                  <span className="audit-active-badge" aria-hidden="true">
                    Aktiv
                  </span>
                )}
              </div>
              <div className="audit-formula">{log.formula}</div>
              <div className="audit-desc">{log.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
