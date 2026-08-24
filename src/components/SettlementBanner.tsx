interface SettlementBannerProps {
  settlement: {
    payer: "parentA" | "parentB" | "balanced";
    amount: number;
  };
  parentAName: string;
  parentBName: string;
}

export function SettlementBanner({ settlement, parentAName, parentBName }: SettlementBannerProps) {
  const isPayerA = settlement.payer === "parentA";
  const isPayerB = settlement.payer === "parentB";

  return (
    <div className={`settlement-banner ${isPayerA ? "payer-a" : isPayerB ? "payer-b" : ""}`}>
      <div className="settlement-lead">Monatlicher Zahlungsanspruch</div>
      <div className="settlement-amount">{settlement.amount.toFixed(2)} €</div>
      <div className="settlement-desc">
        {settlement.payer === "balanced"
          ? "Kein Ausgleichszahlbetrag erforderlich (vollständig ausgeglichen)"
          : isPayerA
            ? `${parentAName} zahlt an ${parentBName}`
            : `${parentBName} zahlt an ${parentAName}`}
      </div>
    </div>
  );
}
