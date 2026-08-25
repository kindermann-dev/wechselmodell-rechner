import { describe, it, expect } from "vitest";
import {
  encodeBase64,
  decodeBase64,
  getEncodedLegalConfig,
  getDecodedLegalConfig,
  getDecodedLegalField,
  DEFAULT_LEGAL_CONFIG_B64,
} from "../legalConfig";

describe("legalConfig & Base64-Verschleierung", () => {
  it("kodiert und dekodiert Standard- und UTF-8-Zeichenketten mit deutschen Umlauten korrekt", () => {
    const testStrings = [
      "Max Mustermann",
      "Münchner Straße 42b, 80331 München",
      "info@unterhalt-wechselmodell.de",
      "+49 (0) 89 123456-78",
      "Große Äpfel & süße Kirschen – € 100,-",
    ];

    for (const str of testStrings) {
      const encoded = encodeBase64(str);
      expect(encoded).not.toBe(str);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(str);
    }
  });

  it("behandelt leere oder ungültige Base64-Zeichenketten fehlerfrei", () => {
    expect(decodeBase64("")).toBe("");
    expect(encodeBase64("")).toBe("");
  });

  it("dekodiert standardmäßige Fallback-Base64-Konstanten korrekt", () => {
    expect(decodeBase64(DEFAULT_LEGAL_CONFIG_B64.name)).toBe("Max Mustermann");
    expect(decodeBase64(DEFAULT_LEGAL_CONFIG_B64.email)).toBe("max.mustermann@beispiel.de");
    expect(decodeBase64(DEFAULT_LEGAL_CONFIG_B64.street)).toBe("Musterstraße 12");
    expect(decodeBase64(DEFAULT_LEGAL_CONFIG_B64.phone)).toBe("+49 123 456789");
    expect(decodeBase64(DEFAULT_LEGAL_CONFIG_B64.privacyEmail)).toBe("datenschutz@beispiel.de");
  });

  it("liefert gültige rechtliche Konfiguration und stimmt mit dekodierten Werten überein", () => {
    const encoded = getEncodedLegalConfig();
    expect(encoded.name).toBeDefined();
    expect(encoded.email).toBeDefined();
    expect(encoded.street).toBeDefined();
    expect(encoded.phone).toBeDefined();
    expect(encoded.privacyEmail).toBeDefined();

    const decoded = getDecodedLegalConfig();
    expect(decoded.name).toBe(decodeBase64(encoded.name));
    expect(decoded.email).toBe(decodeBase64(encoded.email));
    expect(decoded.street).toBe(decodeBase64(encoded.street));
    expect(decoded.phone).toBe(decodeBase64(encoded.phone));
    expect(decoded.privacyEmail).toBe(decodeBase64(encoded.privacyEmail));
  });

  it("dekodiert ein einzelnes Feld bei Bedarf", () => {
    const config = getDecodedLegalConfig();
    expect(getDecodedLegalField("name")).toBe(config.name);
    expect(getDecodedLegalField("email")).toBe(config.email);
    expect(getDecodedLegalField("phone")).toBe(config.phone);
    expect(getDecodedLegalField("privacyEmail")).toBe(config.privacyEmail);
  });
});
