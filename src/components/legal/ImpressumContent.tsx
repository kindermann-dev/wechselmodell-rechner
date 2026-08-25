import { useState } from "react";
import { ObfuscatedContact } from "./ObfuscatedContact";

export function ImpressumContent() {
  const [revealAll, setRevealAll] = useState(false);

  return (
    <div className="legal-content">
      {/* Banner & Globales Aufdecken */}
      <div className="legal-banner">
        <div className="legal-banner-info">
          <svg
            className="legal-banner-icon"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <div>
            <p className="legal-banner-title">Spamschutz nach deutschem Recht</p>
            <p className="legal-banner-desc">
              Kontaktdaten sind gegen automatisierte Scraper geschützt und werden per Klick direkt
              im Browser dekodiert.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setRevealAll((prev) => !prev)} className="btn-action">
          {revealAll ? "Kontaktdaten verbergen" : "Alle Daten aufdecken"}
        </button>
      </div>

      <noscript>
        <div className="legal-noscript-warning">
          Hinweis: Zur Anzeige der geschützten Kontaktdaten aktivieren Sie bitte JavaScript in Ihrem
          Browser.
        </div>
      </noscript>

      {/* Angaben gemäß § 5 DDG */}
      <section className="legal-section">
        <h3>Angaben gemäß § 5 DDG</h3>
        <div className="legal-address-block">
          <div>
            <ObfuscatedContact fieldKey="name" isRevealed={revealAll} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="street" isRevealed={revealAll} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="city" isRevealed={revealAll} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="country" isRevealed={revealAll} />
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="legal-section">
        <h3>Kontakt</h3>
        <div className="legal-contact-list">
          <div className="legal-contact-row">
            <span className="contact-field-label">Telefon:</span>
            <ObfuscatedContact fieldKey="phone" type="phone" isRevealed={revealAll} />
          </div>
          <div className="legal-contact-row">
            <span className="contact-field-label">E-Mail:</span>
            <ObfuscatedContact fieldKey="email" type="email" isRevealed={revealAll} />
          </div>
        </div>
      </section>

      {/* Redaktionell verantwortlich gemäß § 18 Abs. 2 MStV */}
      <section className="legal-section">
        <h3>Redaktionell verantwortlich gemäß § 18 Abs. 2 MStV</h3>
        <div className="legal-address-block">
          <div>
            <ObfuscatedContact fieldKey="editorialName" isRevealed={revealAll} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="editorialStreet" isRevealed={revealAll} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="editorialCity" isRevealed={revealAll} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="editorialCountry" isRevealed={revealAll} />
          </div>
        </div>
      </section>
    </div>
  );
}
