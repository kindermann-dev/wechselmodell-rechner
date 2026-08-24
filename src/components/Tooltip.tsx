import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  title: string;
  explanation: string;
  legalNote?: string;
  caseLaw?: string;
}

export function Tooltip({
  title,
  explanation,
  legalNote,
  caseLaw,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placeAbove: boolean;
  }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(340, window.innerWidth - 24);
    const estimatedHeight = 220; // safe estimate before render

    // Horizontal positioning: center on trigger, clamped to viewport
    let targetLeft = rect.left + rect.width / 2 - popoverWidth / 2;
    if (targetLeft < 12) {
      targetLeft = 12;
    } else if (targetLeft + popoverWidth > window.innerWidth - 12) {
      targetLeft = window.innerWidth - popoverWidth - 12;
    }

    // Vertical positioning: flip above if close to bottom
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    const targetTop = placeAbove
      ? rect.top - 8 // popover will use transform: translateY(-100%)
      : rect.bottom + 8;

    setCoords({
      top: targetTop,
      left: targetLeft,
      placeAbove,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("resize", handleScrollOrResize);
      window.addEventListener("scroll", handleScrollOrResize, true);

      return () => {
        window.removeEventListener("resize", handleScrollOrResize);
        window.removeEventListener("scroll", handleScrollOrResize, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const popoverContent = isOpen ? (
    <div
      ref={popoverRef}
      className="tooltip-popover-portal"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        transform: coords.placeAbove ? "translateY(-100%)" : "none",
        width: "340px",
        maxWidth: "calc(100vw - 24px)",
        zIndex: 999999,
      }}
      role="tooltip"
    >
      <div className="tooltip-header">
        <span className="tooltip-title">{title}</span>
        <button
          type="button"
          className="tooltip-close"
          onClick={() => setIsOpen(false)}
          aria-label="Schließen"
          tabIndex={-1}
        >
          &times;
        </button>
      </div>

      <div className="tooltip-body">
        <p className="tooltip-explanation">{explanation}</p>

        {legalNote && (
          <div className="tooltip-legal-box">
            <span className="tooltip-legal-badge">
              ⚖️ Rechtsprechung &amp; Streitfragen
            </span>
            <p className="tooltip-legal-text">{legalNote}</p>
          </div>
        )}

        {caseLaw && (
          <div className="tooltip-caselaw">
            <strong>Rechtsgrundlage:</strong> {caseLaw}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="tooltip-container">
      <button
        ref={triggerRef}
        type="button"
        className={`tooltip-trigger ${isOpen ? "active" : ""}`}
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => {
          updatePosition();
          setIsOpen(true);
        }}
        aria-label={`Hilfe zu ${title}`}
        tabIndex={-1}
      >
        ?
      </button>

      {typeof document !== "undefined" && popoverContent
        ? createPortal(popoverContent, document.body)
        : null}
    </div>
  );
}
