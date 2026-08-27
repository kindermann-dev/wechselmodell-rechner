import type { CalculationStepLog } from "../types/output";

interface AuditTrailListProps {
  auditTrail: CalculationStepLog[];
}

export function AuditTrailList({ auditTrail }: AuditTrailListProps) {
  return (
    <div className="audit-wrapper">
      <div className="card-header" style={{ marginTop: "8px" }}>
        <span className="card-title" style={{ fontSize: "14px" }}>
          Schrittweises Prüfprotokoll ({auditTrail.length})
        </span>
      </div>
      <div className="audit-list">
        {auditTrail.map((log) => (
          <div key={log.stepNumber} className="audit-item">
            <div className="audit-head">
              <span className="audit-step-title">
                Stufe {log.stepNumber}: {log.label}
              </span>
            </div>
            <div className="audit-formula">{log.formula}</div>
            <div className="audit-desc">{log.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
