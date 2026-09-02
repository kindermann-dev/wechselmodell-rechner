import { describe, it, expect } from "vitest";
import {
  uint8ArrayToBase64Url,
  base64UrlToUint8Array,
  compressString,
  decompressString,
  appStateToUrlStateV1,
  urlStateV1ToAppState,
  migrateStateToLatest,
  serializeStateToHash,
  deserializeHashToState,
  buildShareableUrl,
} from "../urlSerialization";
import type { AppInputState, UrlStateV1 } from "../../types/urlState";

describe("URL Serialization & Deflate Compression Engine", () => {
  const sampleState: AppInputState = {
    scenario: "custom",
    kindergeldPerChild: 259,
    parentA: {
      name: "Elternteil A (Arzt)",
      erwerbsstatus: "erwerbstaetig",
      grossAnnual: 72000,
      netAnnual: 48000,
      annualBonusNet: 5000,
      isEmployed: true,
      useFlatRate: true,
      customAnnualExpense: 0,
      pensionAnnual: 2400,
      istPrivatVersichert: true,
      pkvBeitragBasisAnnual: 4800,
      pkvArbeitgeberzuschussAnnual: 2400,
      housingAnnual: 3600,
      debtsAnnual: 1200,
      warmRentMonthly: 1500,
      householdPersons: 3,
      directExpensesAnnual: 600,
      receivesKindergeld: true,
    },
    parentB: {
      name: "Elternteil B (Ingenieurin)",
      erwerbsstatus: "erwerbstaetig",
      grossAnnual: 45000,
      netAnnual: 32000,
      annualBonusNet: 0,
      isEmployed: true,
      useFlatRate: false,
      customAnnualExpense: 1800,
      pensionAnnual: 1200,
      istPrivatVersichert: false,
      pkvBeitragBasisAnnual: 0,
      pkvArbeitgeberzuschussAnnual: 0,
      housingAnnual: 0,
      debtsAnnual: 0,
      warmRentMonthly: 1100,
      householdPersons: 3,
      directExpensesAnnual: 300,
    },
    children: [
      {
        id: "c1",
        name: "Lukas",
        ageGroup: "6-11",
        kinderzuschlag: 100,
        additionalNeeds: {
          wechselmodellSurcharge: 80,
          specialNeeds: 20,
        },
        istPrivatVersichert: true,
        pkvBeitrag: 120,
        pkvZahler: "elternteil1",
      },
      {
        id: "c2",
        name: "Mia",
        ageGroup: "12-17",
        kinderzuschlag: 0,
        additionalNeeds: {
          wechselmodellSurcharge: 0,
          specialNeeds: 50,
        },
        istPrivatVersichert: false,
        pkvBeitrag: 0,
        pkvZahler: "elternteil1",
      },
    ],
  };

  it("sollte Base64URL fehlerfrei und URL-safe kodieren und dekodieren", () => {
    const bytes = new Uint8Array([0, 255, 128, 64, 32, 16, 8, 4, 2, 1, 63, 62]);
    const b64url = uint8ArrayToBase64Url(bytes);
    expect(b64url).not.toContain("+");
    expect(b64url).not.toContain("/");
    expect(b64url).not.toContain("=");

    const decoded = base64UrlToUint8Array(b64url);
    expect(decoded).toEqual(bytes);
  });

  it("sollte Strings mit Deflate komprimieren und dekomprimieren (Roundtrip)", async () => {
    const original = JSON.stringify(sampleState);
    const compressed = await compressString(original);
    const decompressed = await decompressString(compressed);
    expect(decompressed).toBe(original);
  });

  it("sollte Sonderzeichen, Umlaute und Emojis fehlerfrei verarbeiten", async () => {
    const testStr = JSON.stringify({
      text: "Ärzte, Großeltern & Kinder 👶 - 50:50 Wechselmodell § 1606 BGB €",
    });
    const compressed = await compressString(testStr);
    const decompressed = await decompressString(compressed);
    expect(decompressed).toBe(testStr);
  });

  it("sollte vollständigen Workflow ausführen: serializeStateToHash und deserializeHashToState", async () => {
    const hash = await serializeStateToHash(sampleState);
    expect(hash.startsWith("#v1=")).toBe(true);

    const recovered = await deserializeHashToState(hash);
    expect(recovered).not.toBeNull();
    if (!recovered) return;

    expect(recovered.scenario).toBe("custom");
    expect(recovered.kindergeldPerChild).toBe(259);
    expect(recovered.parentA.name).toBe("Elternteil A (Arzt)");
    expect(recovered.parentA.grossAnnual).toBe(72000);
    expect(recovered.parentA.netAnnual).toBe(48000);
    expect(recovered.parentA.annualBonusNet).toBe(5000);
    expect(recovered.parentA.pensionAnnual).toBe(2400);
    expect(recovered.parentA.istPrivatVersichert).toBe(true);
    expect(recovered.parentA.pkvBeitragBasisAnnual).toBe(4800);
    expect(recovered.parentA.pkvArbeitgeberzuschussAnnual).toBe(2400);
    expect(recovered.parentA.housingAnnual).toBe(3600);
    expect(recovered.parentA.debtsAnnual).toBe(1200);
    expect(recovered.parentA.warmRentMonthly).toBe(1500);
    expect(recovered.parentA.householdPersons).toBe(3);
    expect(recovered.parentA.directExpensesAnnual).toBe(600);
    expect(recovered.parentA.receivesKindergeld).toBe(true);

    expect(recovered.parentB.name).toBe("Elternteil B (Ingenieurin)");
    expect(recovered.parentB.useFlatRate).toBe(false);
    expect(recovered.parentB.customAnnualExpense).toBe(1800);
    expect(recovered.parentB.warmRentMonthly).toBe(1100);

    expect(recovered.children).toHaveLength(2);
    expect(recovered.children[0].name).toBe("Lukas");
    expect(recovered.children[0].ageGroup).toBe("6-11");
    expect(recovered.children[0].kinderzuschlag).toBe(100);
    expect(recovered.children[0].additionalNeeds.wechselmodellSurcharge).toBe(80);
    expect(recovered.children[0].additionalNeeds.specialNeeds).toBe(20);
    expect(recovered.children[0].istPrivatVersichert).toBe(true);
    expect(recovered.children[0].pkvBeitrag).toBe(120);

    expect(recovered.children[1].name).toBe("Mia");
    expect(recovered.children[1].ageGroup).toBe("12-17");
  });

  it("sollte Bürgergeld-Konfigurationen korrekt serialisieren und rekonstruieren", async () => {
    const buergergeldState: AppInputState = {
      scenario: "buergergeld",
      kindergeldPerChild: 259,
      parentA: {
        ...sampleState.parentA,
        erwerbsstatus: "erwerbstaetig",
        isEmployed: true,
      },
      parentB: {
        name: "Elternteil B (Bürgergeld)",
        erwerbsstatus: "buergergeld",
        grossAnnual: 0,
        netAnnual: 0,
        annualBonusNet: 0,
        isEmployed: false,
        useFlatRate: true,
        customAnnualExpense: 0,
        pensionAnnual: 0,
        istPrivatVersichert: false,
        pkvBeitragBasisAnnual: 0,
        pkvArbeitgeberzuschussAnnual: 0,
        housingAnnual: 0,
        debtsAnnual: 0,
        warmRentMonthly: 0,
        householdPersons: 2,
        directExpensesAnnual: 0,
      },
      children: [
        {
          id: "child-1",
          name: "Kind 1",
          ageGroup: "6-11",
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ],
    };

    const hash = await serializeStateToHash(buergergeldState);
    const recovered = await deserializeHashToState(hash);
    expect(recovered).not.toBeNull();
    if (!recovered) return;

    expect(recovered.parentB.erwerbsstatus).toBe("buergergeld");
    expect(recovered.parentB.isEmployed).toBe(false);
    expect(recovered.parentB.grossAnnual).toBe(0);
    expect(recovered.parentB.netAnnual).toBe(0);
  });

  it("sollte mit buildShareableUrl eine valide Gesamte-URL mit Basisadresse erzeugen", async () => {
    const url = await buildShareableUrl(
      sampleState,
      "https://kindermann-dev.github.io/wechselmodell-rechner/"
    );
    expect(url.startsWith("https://kindermann-dev.github.io/wechselmodell-rechner/#v1=")).toBe(
      true
    );
  });

  it("sollte ungültige oder beschädigte Hashes abfangen und null zurückgeben", async () => {
    expect(await deserializeHashToState("")).toBeNull();
    expect(await deserializeHashToState("#")).toBeNull();
    expect(await deserializeHashToState("#impressum")).toBeNull();
    expect(await deserializeHashToState("#datenschutz")).toBeNull();
    expect(await deserializeHashToState("#changelog")).toBeNull();
    expect(
      await deserializeHashToState("#v1=das-ist-kein-gueltiges-base64-oder-deflate")
    ).toBeNull();
    expect(await deserializeHashToState("invalid_payload_here")).toBeNull();
  });

  it("sollte Schema-Versionierung und Migration unterstützen (migrateStateToLatest)", () => {
    const rawV1: UrlStateV1 = {
      v: 1,
      s: "bgh-standard",
      pA: { n: "Elternteil A", ga: 48000 },
    };

    const migrated = migrateStateToLatest(rawV1);
    expect(migrated).not.toBeNull();
    expect(migrated?.v).toBe(1);
    expect(migrated?.pA?.ga).toBe(48000);

    const appState = urlStateV1ToAppState(migrated!);
    expect(appState.parentA.name).toBe("Elternteil A");
    expect(appState.parentA.grossAnnual).toBe(48000);
    expect(appState.parentB.name).toBe("Elternteil B");
    expect(appState.children).toHaveLength(1);
  });

  it("sollte Standardwerte bei appStateToUrlStateV1 weglassen um Payload zu minimieren", () => {
    const compactV1 = appStateToUrlStateV1(sampleState);
    expect(compactV1.v).toBe(1);
    expect(compactV1.pA?.n).toBe("Elternteil A (Arzt)");
    expect(compactV1.pA?.emp).toBeUndefined(); // Da true (Default)
    expect(compactV1.pB?.emp).toBeUndefined();
  });

  it("sollte Wohnmehrbedarf-Modi ('none', 'pro-kopf', 'real-per-child') und reale Wohnkosten serialisieren und dekodieren", async () => {
    const realChildState: AppInputState = {
      ...sampleState,
      housingCostMode: "real-per-child",
      children: [
        {
          id: "c1",
          name: "Lukas",
          ageGroup: "6-11",
          realHousingCostParentA: 320,
          realHousingCostParentB: 280,
          additionalNeeds: { wechselmodellSurcharge: 0, specialNeeds: 0 },
        },
      ],
    };

    const hash = await serializeStateToHash(realChildState);
    const recovered = await deserializeHashToState(hash);

    expect(recovered).not.toBeNull();
    if (!recovered) return;

    expect(recovered.housingCostMode).toBe("real-per-child");
    expect(recovered.children[0].realHousingCostParentA).toBe(320);
    expect(recovered.children[0].realHousingCostParentB).toBe(280);
  });

  it("sollte bestehende Legacy-URLs ohne hcm abwärtskompatibel dekodieren (Fallback-Inferenz)", () => {
    // Legacy URL mit Warmmieten aber ohne hcm -> sollte als "pro-kopf" inferiert werden
    const legacyV1WithRent: UrlStateV1 = {
      v: 1,
      s: "custom",
      pA: { n: "Elternteil A", wr: 1200, hp: 2 },
      pB: { n: "Elternteil B", wr: 800, hp: 2 },
      ch: [{ n: "Kind 1", ag: "6-11" }],
    };

    const appState1 = urlStateV1ToAppState(legacyV1WithRent);
    expect(appState1.housingCostMode).toBe("pro-kopf");

    // Legacy URL ohne Warmmieten und ohne hcm -> sollte als "none" inferiert werden
    const legacyV1NoRent: UrlStateV1 = {
      v: 1,
      s: "bgh-standard",
      pA: { n: "Elternteil A" },
      pB: { n: "Elternteil B" },
      ch: [{ n: "Kind 1", ag: "6-11" }],
    };

    const appState2 = urlStateV1ToAppState(legacyV1NoRent);
    expect(appState2.housingCostMode).toBe("none");
  });

  it("sollte negative sonstige Mehrbedarfe (Bedarfsabzug) korrekt serialisieren und deserialisieren", async () => {
    const negativeNeedsState: AppInputState = {
      ...sampleState,
      children: [
        {
          id: "child-1",
          name: "Kind 1",
          ageGroup: "6-11",
          additionalNeeds: {
            wechselmodellSurcharge: -50,
            specialNeeds: -25,
          },
        },
      ],
    };

    const hash = await serializeStateToHash(negativeNeedsState);
    const recovered = await deserializeHashToState(hash);

    expect(recovered).not.toBeNull();
    if (!recovered) return;

    expect(recovered.children[0].additionalNeeds.wechselmodellSurcharge).toBe(-50);
    expect(recovered.children[0].additionalNeeds.specialNeeds).toBe(-25);
  });
});
