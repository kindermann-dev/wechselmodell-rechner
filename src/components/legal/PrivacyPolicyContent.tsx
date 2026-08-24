import { useState } from "react";
import { ObfuscatedContact } from "./ObfuscatedContact";

export function PrivacyPolicyContent() {
  const [revealContact, setRevealContact] = useState(false);

  return (
    <div className="legal-content">
      {/* Top Banner & Global Reveal Control */}
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
        <button
          type="button"
          onClick={() => setRevealContact((prev) => !prev)}
          className="btn-action"
        >
          {revealContact ? "Kontaktdaten verbergen" : "Alle Daten aufdecken"}
        </button>
      </div>

      <noscript>
        <div className="legal-noscript-warning">
          Hinweis: Zur Anzeige der geschützten Kontaktdaten aktivieren Sie bitte JavaScript in Ihrem
          Browser.
        </div>
      </noscript>

      {/* 1. Verantwortlicher */}
      <section className="legal-section">
        <h3>1. Verantwortlicher</h3>
        <div className="legal-address-block">
          <div>
            <ObfuscatedContact fieldKey="name" isRevealed={revealContact} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="street" isRevealed={revealContact} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="city" isRevealed={revealContact} />
          </div>
          <div>
            <ObfuscatedContact fieldKey="country" isRevealed={revealContact} />
          </div>
          <div className="legal-contact-row" style={{ marginTop: "4px" }}>
            <span className="contact-field-label">E-Mail:</span>
            <ObfuscatedContact fieldKey="privacyEmail" type="email" isRevealed={revealContact} />
          </div>
        </div>
      </section>

      {/* 2. Clientseitige Datenverarbeitung & Cookies */}
      <section className="legal-section">
        <h3>2. Clientseitige Datenverarbeitung &amp; Cookies</h3>
        <p>
          Diese Website besteht aus statischen Dateien. Die Verarbeitung von Eingaben in der
          Webanwendung durch JavaScript erfolgt ausschließlich lokal in Ihrem Browser. Es werden
          keine dieser eingegebenen Daten an unsere Server oder an Dritte übermittelt.
        </p>
        <p style={{ marginTop: "8px" }}>
          Es werden keine Cookies eingesetzt, kein Web Storage (LocalStorage/SessionStorage) für
          Tracking-Zwecke verwendet und keine Analysedienste Dritter eingebunden.
        </p>
      </section>

      {/* 3. Hosting auf GitHub Pages */}
      <section className="legal-section">
        <h3>3. Hosting auf GitHub Pages</h3>
        <p>Wir setzen für die Bereitstellung unserer Website folgenden Hoster ein:</p>
        <div className="legal-host-box">
          <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>GitHub Inc.</p>
          <p>88 Colin P Kelly Jr St</p>
          <p>San Francisco, CA 94107</p>
          <p>USA</p>
        </div>
        <p style={{ marginTop: "8px" }}>
          Dieser ist Empfänger Ihrer personenbezogenen Daten. Dies entspricht unserem berechtigten
          Interesse im Sinne des Art. 6 Abs. 1 S. 1 lit. f DSGVO, selbst keinen Server in unseren
          Räumlichkeiten vorhalten zu müssen. Der Serverstandort ist unter anderem die USA.
        </p>
        <p style={{ marginTop: "8px" }}>
          Unser Hoster erhebt in sogenannten Logfiles folgende Daten, die Ihr Browser automatisch
          übermittelt: IP-Adresse, die Adresse der vorher besuchten Website (Referer
          Anfrage-Header), Datum und Uhrzeit der Anfrage, Zeitzonendifferenz zur Greenwich Mean
          Time, Inhalt der Anforderung, HTTP-Statuscode, übertragene Datenmenge, Website, von der
          die Anforderung kommt, sowie Informationen zu Browser und Betriebssystem.
        </p>
        <p style={{ marginTop: "8px" }}>
          Das ist erforderlich, um unsere Website anzuzeigen und die Stabilität und Sicherheit zu
          gewährleisten. Dies entspricht unserem berechtigten Interesse im Sinne des Art. 6 Abs. 1
          S. 1 lit. f DSGVO. Es erfolgt kein Tracking und wir haben auf diese Daten keinen direkten
          Zugriff. Die Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt. Die
          Verarbeitung der unter diesem Abschnitt angegebenen Daten ist weder gesetzlich noch
          vertraglich vorgeschrieben. Die Funktionsfähigkeit der Website ist ohne die Verarbeitung
          jedoch nicht gewährleistet.
        </p>
        <div style={{ marginTop: "12px" }}>
          <h4
            style={{
              fontWeight: 600,
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            Internationaler Datentransfer:
          </h4>
          <p style={{ marginTop: "4px" }}>
            GitHub ist nach dem „EU-US Data Privacy Framework“ zertifiziert. Dies ist ein
            Datenschutzabkommen, das ein angemessenes Datenschutzniveau bei Datenübermittlungen an
            zertifizierte US-Unternehmen sicherstellt. Zusätzlich stützt sich GitHub auf
            EU-Standardvertragsklauseln (SCCs).
          </p>
          <p style={{ marginTop: "8px" }}>
            Weitere Informationen zum Datenschutz bei GitHub finden Sie in der Datenschutzerklärung
            des Anbieters:
          </p>
          <p style={{ marginTop: "4px" }}>
            <a
              href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
              style={{ wordBreak: "break-all" }}
            >
              https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement
            </a>
          </p>
        </div>
      </section>

      {/* 4. SSL- bzw. TLS-Verschlüsselung */}
      <section className="legal-section">
        <h3>4. SSL- bzw. TLS-Verschlüsselung</h3>
        <p>
          Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung (HTTPS). Eine
          verschlüsselte Verbindung erkennen Sie an der Adresszeile des Browsers (
          <code
            style={{
              fontFamily: "var(--font-mono)",
              backgroundColor: "var(--bg-primary)",
              padding: "2px 5px",
              borderRadius: "4px",
            }}
          >
            https://
          </code>
          ) und dem Schloss-Symbol.
        </p>
      </section>

      {/* 5. Ihre Rechte */}
      <section className="legal-section">
        <h3>5. Ihre Rechte</h3>
        <p>
          Werden Ihre personenbezogenen Daten verarbeitet, stehen Ihnen als betroffene Person im
          Sinne der DSGVO folgende Rechte zu:
        </p>
        <ul className="legal-rights-list">
          <li>
            <strong>Recht auf Auskunft</strong> (Art. 15 DSGVO)
          </li>
          <li>
            <strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)
          </li>
          <li>
            <strong>Recht auf Löschung</strong> (Art. 17 DSGVO)
          </li>
          <li>
            <strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)
          </li>
          <li>
            <strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)
          </li>
          <li>
            <strong>Recht auf Widerspruch gegen die Verarbeitung</strong> (Art. 21 DSGVO)
          </li>
          <li>
            <strong>Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde</strong> (Art. 77
            DSGVO)
          </li>
        </ul>
        <p style={{ marginTop: "12px" }}>
          Zur Ausübung Ihrer Rechte können Sie sich jederzeit formlos an die unter Abschnitt 1
          angegebenen Kontaktdaten wenden.
        </p>
      </section>
    </div>
  );
}
