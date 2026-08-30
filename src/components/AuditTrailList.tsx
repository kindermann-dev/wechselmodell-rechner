import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { CalculationStepLog } from "../types/output";
import { formatAuditTrailAsText } from "../utils/auditTrailFormatter";
import { copyTextToClipboard } from "../utils/clipboard";

interface AuditTrailListProps {
  auditTrail: CalculationStepLog[];
}

/**
 * AuditTrailList - Interaktives und deterministisches Prüfprotokoll für das Wechselmodell.
 * Bietet Schritt-für-Schritt-Navigation (Vorheriger / Nächster Punkt), vollständiges Kopieren in die
 * Zwischenablage sowie auf Desktop einen vollflächigen Hover-Tooltip zur Vermeidung von Scrollen
 * bei umfangreichen Einzelschritten.
 */
export function AuditTrailList({ auditTrail }: AuditTrailListProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [hoveredStep, setHoveredStep] = useState<{
    log: CalculationStepLog;
    index: number;
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [adjustedTop, setAdjustedTop] = useState<number | null>(null);

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

  const handleCopyAuditTrail = async () => {
    if (auditTrail.length === 0) return;
    const text = formatAuditTrailAsText(auditTrail);
    const success = await copyTextToClipboard(text);
    if (success) {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const handleMouseEnter = (index: number, log: CalculationStepLog, el: HTMLDivElement) => {
    if (typeof window === "undefined") return;
    const isDesktopPointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isDesktopPointer) return;

    const rect = el.getBoundingClientRect();
    setHoveredStep({
      log,
      index,
      top: rect.top,
      left: rect.left,
      width: rect.width,
    });
  };

  const handleMouseLeave = () => {
    setHoveredStep(null);
  };

  // Tooltip bei Scroll-Events sofort ausblenden
  useEffect(() => {
    const handleScroll = () => {
      setHoveredStep(null);
    };
    const listEl = listRef.current;
    if (listEl) {
      listEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (listEl) {
        listEl.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Prüfe vertikale Positionierung des Popovers zur Vermeidung von Viewport-Überlauf
  useEffect(() => {
    if (hoveredStep && popoverRef.current) {
      const popoverHeight = popoverRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      let top = hoveredStep.top;
      if (top + popoverHeight > viewportHeight - 16) {
        top = Math.max(16, viewportHeight - popoverHeight - 16);
      }
      setAdjustedTop(top);
    } else {
      setAdjustedTop(null);
    }
  }, [hoveredStep]);

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
            className={`btn-audit-nav btn-audit-copy ${isCopied ? "is-copied" : ""}`}
            onClick={handleCopyAuditTrail}
            disabled={totalSteps === 0}
            title="Vollständiges Prüfprotokoll in die Zwischenablage kopieren"
            aria-label="Prüfprotokoll kopieren"
          >
            {isCopied ? "✓ Kopiert!" : "📋 Kopieren"}
          </button>

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
              onMouseEnter={(e) => handleMouseEnter(index, log, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
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

      {hoveredStep &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            className="audit-hover-popover"
            style={{
              top: adjustedTop !== null ? `${adjustedTop}px` : `${hoveredStep.top}px`,
              left: `${hoveredStep.left}px`,
              width: `${hoveredStep.width}px`,
            }}
          >
            <div className="audit-head">
              <span className="audit-step-title">
                Stufe {hoveredStep.log.stepNumber}: {hoveredStep.log.label}
              </span>
              {hoveredStep.index === safeIndex && (
                <span className="audit-active-badge" aria-hidden="true">
                  Aktiv
                </span>
              )}
            </div>
            <div className="audit-formula">{hoveredStep.log.formula}</div>
            <div className="audit-desc">{hoveredStep.log.description}</div>
          </div>,
          document.body
        )}
    </div>
  );
}
