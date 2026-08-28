import { PRESET_SCENARIOS } from "../config/scenarios";

interface ActionBarProps {
  currentScenario: string;
  onSelectScenario: (id: string) => void;
  onShareLink?: () => void;
  isLinkCopied?: boolean;
  onCopySummary: () => void;
  isCopied: boolean;
  onPrint: () => void;
  onReset: () => void;
}

export function ActionBar({
  currentScenario,
  onSelectScenario,
  onShareLink,
  isLinkCopied = false,
  onCopySummary,
  isCopied,
  onPrint,
  onReset,
}: ActionBarProps) {
  return (
    <div className="action-bar">
      <div className="action-group-left">
        <label htmlFor="scenario-select" className="action-label">
          <span>⚡ Beispielszenario:</span>
        </label>
        <select
          id="scenario-select"
          className="form-select action-select"
          value={currentScenario}
          onChange={(e) => onSelectScenario(e.target.value)}
        >
          <option value="custom">Benutzerdefiniert / Eigene Eingaben</option>
          {PRESET_SCENARIOS.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="action-group-right">
        {onShareLink && (
          <button
            type="button"
            className="btn-action"
            onClick={onShareLink}
            title="Aktuelle Berechnung als teilbaren URL-Link erstellen und direkt in die Zwischenablage kopieren"
          >
            {isLinkCopied ? "✓ Link kopiert!" : "🔗 Link kopieren"}
          </button>
        )}

        <button
          type="button"
          className="btn-action"
          onClick={onCopySummary}
          title="Zusammenfassung als formatierten Text in die Zwischenablage kopieren"
        >
          {isCopied ? "✓ Kopiert!" : "📋 Ergebnis kopieren"}
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={onPrint}
          title="Berechnungsblatt drucken oder als PDF speichern"
        >
          🖨️ Drucken / PDF
        </button>

        <button
          type="button"
          className="btn-action btn-action-secondary"
          onClick={onReset}
          title="Alle Eingaben auf Standardwerte zurücksetzen"
        >
          🔄 Zurücksetzen
        </button>
      </div>
    </div>
  );
}
