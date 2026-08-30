import { DEFAULT_LEGAL_CONFIG_2026, formatChildName } from "../config/dtTable2026";
import type { AgeGroup } from "../types/config";
import type { EmploymentStatus, PkvPayer } from "../types/input";
import type { AppInputState, UrlStateV1 } from "../types/urlState";

/**
 * Wandelt ein Uint8Array in einen URL-sicheren Base64URL-String (RFC 4648 § 5) um.
 * Ersetzt '+' durch '-', '/' durch '_' und entfernt '='-Padding.
 */
export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Wandelt einen Base64URL-String zurück in ein Uint8Array um.
 */
export function base64UrlToUint8Array(b64url: string): Uint8Array {
  let base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Komprimiert einen UTF-8-String mit dem standardmäßigen Deflate-Algorithmus (Zlib / RFC 1950).
 * Verwendet die native Web Streams CompressionStream-API mit Fallback bei Nichtverfügbarkeit.
 */
export async function compressString(str: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const CompressionStreamCtor =
    typeof CompressionStream !== "undefined"
      ? CompressionStream
      : typeof globalThis !== "undefined"
        ? globalThis.CompressionStream
        : undefined;

  if (CompressionStreamCtor) {
    try {
      const cs = new CompressionStreamCtor("deflate");
      const writer = cs.writable.getWriter();
      writer.write(data);
      writer.close();
      const response = new Response(cs.readable);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      // Fallback auf unkomprimierte Bytes
    }
  }

  return data;
}

/**
 * Dekomprimiert Deflate-komprimierte Bytes zurück in einen UTF-8-String.
 * Erkennt und verarbeitet auch unkomprimierte Fallback-Daten.
 */
export async function decompressString(bytes: Uint8Array): Promise<string> {
  const DecompressionStreamCtor =
    typeof DecompressionStream !== "undefined"
      ? DecompressionStream
      : typeof globalThis !== "undefined"
        ? globalThis.DecompressionStream
        : undefined;

  if (DecompressionStreamCtor) {
    try {
      const ds = new DecompressionStreamCtor("deflate");
      const writer = ds.writable.getWriter();
      const writePromise = writer
        .write(bytes as unknown as BufferSource)
        .then(() => writer.close())
        .catch(() => {});
      const readPromise = new Response(ds.readable).text().catch(() => null);

      const [, text] = await Promise.all([writePromise, readPromise]);
      if (text !== null && typeof text === "string") {
        return text;
      }
    } catch {
      // Fallback: Falls keine Deflate-Kompression vorliegt
    }
  }

  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}

/**
 * Wandelt den vollständigen Anwendungszustand in das kompakte V1-Schema um.
 * Lässt Standard- bzw. 0-Werte weg, um die URL-Länge maximal zu minimieren.
 */
export function appStateToUrlStateV1(state: AppInputState): UrlStateV1 {
  const pA = state.parentA;
  const pB = state.parentB;

  const urlV1: UrlStateV1 = {
    v: 1,
  };

  if (state.scenario && state.scenario !== "custom") {
    urlV1.s = state.scenario;
  }

  if (
    state.kindergeldPerChild &&
    state.kindergeldPerChild !== DEFAULT_LEGAL_CONFIG_2026.kindergeldPerChild
  ) {
    urlV1.kg = state.kindergeldPerChild;
  }

  // Elternteil A
  urlV1.pA = {
    n: pA.name !== "Elternteil A" ? pA.name : undefined,
    es: pA.erwerbsstatus !== "erwerbstaetig" ? pA.erwerbsstatus : undefined,
    ga: pA.grossAnnual || undefined,
    na: pA.netAnnual || undefined,
    bn: pA.annualBonusNet || undefined,
    emp: pA.isEmployed === false ? false : undefined,
    fr: pA.useFlatRate === false ? false : undefined,
    cae: pA.customAnnualExpense || undefined,
    pa: pA.pensionAnnual || undefined,
    pkv: pA.istPrivatVersichert || undefined,
    pkb: pA.pkvBeitragBasisAnnual || undefined,
    pka: pA.pkvArbeitgeberzuschussAnnual || undefined,
    ha: pA.housingAnnual || undefined,
    da: pA.debtsAnnual || undefined,
    wr: pA.warmRentMonthly || undefined,
    hp: pA.householdPersons !== 2 ? pA.householdPersons : undefined,
    dea: pA.directExpensesAnnual || undefined,
    rkg: pA.receivesKindergeld === false ? false : undefined,
  };

  // Elternteil B
  urlV1.pB = {
    n: pB.name !== "Elternteil B" ? pB.name : undefined,
    es: pB.erwerbsstatus !== "erwerbstaetig" ? pB.erwerbsstatus : undefined,
    ga: pB.grossAnnual || undefined,
    na: pB.netAnnual || undefined,
    bn: pB.annualBonusNet || undefined,
    emp: pB.isEmployed === false ? false : undefined,
    fr: pB.useFlatRate === false ? false : undefined,
    cae: pB.customAnnualExpense || undefined,
    pa: pB.pensionAnnual || undefined,
    pkv: pB.istPrivatVersichert || undefined,
    pkb: pB.pkvBeitragBasisAnnual || undefined,
    pka: pB.pkvArbeitgeberzuschussAnnual || undefined,
    ha: pB.housingAnnual || undefined,
    da: pB.debtsAnnual || undefined,
    wr: pB.warmRentMonthly || undefined,
    hp: pB.householdPersons !== 2 ? pB.householdPersons : undefined,
    dea: pB.directExpensesAnnual || undefined,
  };

  // Kinder
  if (state.children && state.children.length > 0) {
    urlV1.ch = state.children.map((child, idx) => {
      const standardName = formatChildName(idx + 1, child.ageGroup);
      const isDefaultName =
        !child.name || child.name === standardName || child.name === `Kind ${idx + 1}`;

      return {
        id: child.id,
        n: isDefaultName ? undefined : child.name,
        ag: child.ageGroup,
        kz: child.kinderzuschlag || undefined,
        ws: child.additionalNeeds?.wechselmodellSurcharge || undefined,
        sn: child.additionalNeeds?.specialNeeds || undefined,
        pkv: child.istPrivatVersichert || undefined,
        pkb: child.pkvBeitrag || undefined,
        pkz: child.pkvZahler !== "elternteil1" ? child.pkvZahler : undefined,
      };
    });
  }

  return urlV1;
}

/**
 * Validiert und migriert ein beliebiges rohes JSON-Objekt in das aktuelle V1-Schema.
 */
export function migrateStateToLatest(raw: unknown): UrlStateV1 | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  // Schema-Version 1 (aktuell)
  if (obj.v === 1 || !obj.v) {
    const v1 = obj as unknown as UrlStateV1;
    v1.v = 1;
    return v1;
  }

  // Zukünftige Schema-Versionen (z. B. v2 -> v1 Migration) hier ergänzen:
  // if (obj.v === 2) { ... }

  return null;
}

/**
 * Rekonstruiert den vollständigen AppInputState aus dem kompakten UrlStateV1.
 */
export function urlStateV1ToAppState(v1: UrlStateV1): AppInputState {
  const pA = v1.pA || {};
  const pB = v1.pB || {};

  const validAgeGroups: AgeGroup[] = ["0-5", "6-11", "12-17", "18+"];
  const validPkvPayers: PkvPayer[] = [
    "elternteil1",
    "elternteil2",
    "getrennt",
    "parentA",
    "parentB",
    "haelftig",
  ];

  const children =
    Array.isArray(v1.ch) && v1.ch.length > 0
      ? v1.ch.map((c, idx) => {
          const ageGroup: AgeGroup = validAgeGroups.includes(c.ag) ? c.ag : "6-11";
          const pkvZahler: PkvPayer =
            c.pkz && validPkvPayers.includes(c.pkz) ? c.pkz : "elternteil1";

          return {
            id: c.id || `child-${idx + 1}`,
            name: c.n || formatChildName(idx + 1, ageGroup),
            ageGroup,
            kinderzuschlag: Math.max(0, Number(c.kz) || 0),
            additionalNeeds: {
              wechselmodellSurcharge: Math.max(0, Number(c.ws) || 0),
              specialNeeds: Math.max(0, Number(c.sn) || 0),
            },
            istPrivatVersichert: Boolean(c.pkv),
            pkvBeitrag: Math.max(0, Number(c.pkb) || 0),
            pkvZahler,
          };
        })
      : [
          {
            id: "child-1",
            name: formatChildName(1, "6-11"),
            ageGroup: "6-11" as AgeGroup,
            additionalNeeds: {
              wechselmodellSurcharge: 0,
              specialNeeds: 0,
            },
          },
        ];

  const pAErwerbsstatus: EmploymentStatus =
    pA.es === "buergergeld" ? "buergergeld" : "erwerbstaetig";
  const pBErwerbsstatus: EmploymentStatus =
    pB.es === "buergergeld" ? "buergergeld" : "erwerbstaetig";

  return {
    scenario: v1.s || "custom",
    kindergeldPerChild: Math.max(0, Number(v1.kg) || DEFAULT_LEGAL_CONFIG_2026.kindergeldPerChild),
    parentA: {
      name: pA.n || "Elternteil A",
      erwerbsstatus: pAErwerbsstatus,
      grossAnnual: Math.max(0, Number(pA.ga) || 0),
      netAnnual: Math.max(0, Number(pA.na) || 0),
      annualBonusNet: Math.max(0, Number(pA.bn) || 0),
      isEmployed: pAErwerbsstatus === "buergergeld" ? false : pA.emp !== false,
      useFlatRate: pA.fr !== false,
      customAnnualExpense: Math.max(0, Number(pA.cae) || 0),
      pensionAnnual: Math.max(0, Number(pA.pa) || 0),
      istPrivatVersichert: Boolean(pA.pkv),
      pkvBeitragBasisAnnual: Math.max(0, Number(pA.pkb) || 0),
      pkvArbeitgeberzuschussAnnual: Math.max(0, Number(pA.pka) || 0),
      housingAnnual: Math.max(0, Number(pA.ha) || 0),
      debtsAnnual: Math.max(0, Number(pA.da) || 0),
      warmRentMonthly: Math.max(0, Number(pA.wr) || 0),
      householdPersons: Math.max(1, Number(pA.hp) || 2),
      directExpensesAnnual: Math.max(0, Number(pA.dea) || 0),
      receivesKindergeld: pA.rkg !== false,
    },
    parentB: {
      name: pB.n || "Elternteil B",
      erwerbsstatus: pBErwerbsstatus,
      grossAnnual: Math.max(0, Number(pB.ga) || 0),
      netAnnual: Math.max(0, Number(pB.na) || 0),
      annualBonusNet: Math.max(0, Number(pB.bn) || 0),
      isEmployed: pBErwerbsstatus === "buergergeld" ? false : pB.emp !== false,
      useFlatRate: pB.fr !== false,
      customAnnualExpense: Math.max(0, Number(pB.cae) || 0),
      pensionAnnual: Math.max(0, Number(pB.pa) || 0),
      istPrivatVersichert: Boolean(pB.pkv),
      pkvBeitragBasisAnnual: Math.max(0, Number(pB.pkb) || 0),
      pkvArbeitgeberzuschussAnnual: Math.max(0, Number(pB.pka) || 0),
      housingAnnual: Math.max(0, Number(pB.ha) || 0),
      debtsAnnual: Math.max(0, Number(pB.da) || 0),
      warmRentMonthly: Math.max(0, Number(pB.wr) || 0),
      householdPersons: Math.max(1, Number(pB.hp) || 2),
      directExpensesAnnual: Math.max(0, Number(pB.dea) || 0),
    },
    children,
  };
}

/**
 * Serialisiert den Berechnungszustand nach dem geforderten Workflow:
 * [ State Object ] -> JSON.stringify() -> Kompression (Deflate) -> Base64URL -> URL-Hash '#v1=...'
 *
 * @param state - Der vollständige Eingabezustand
 * @returns Promise<string> - Der fertige URL-Hash z. B. '#v1=eJzTV...'
 */
export async function serializeStateToHash(state: AppInputState): Promise<string> {
  const v1Object = appStateToUrlStateV1(state);
  const jsonString = JSON.stringify(v1Object);
  const compressedBytes = await compressString(jsonString);
  const base64UrlString = uint8ArrayToBase64Url(compressedBytes);
  return `#v1=${base64UrlString}`;
}

/**
 * Deserialisiert einen URL-Hash oder Payload-String zurück in den AppInputState:
 * [ URL Hash ] -> Base64URL-Decode -> Dekompression (Deflate) -> JSON.parse() -> Schema-Migration -> AppInputState
 *
 * @param hashOrPayload - Der URL-Hash (z. B. '#v1=eJzTV...', 'v1=eJzTV...' oder '#state=...')
 * @returns Promise<AppInputState | null> - Der rekonstruierte Zustand oder null bei fehlerhaften Daten
 */
export async function deserializeHashToState(hashOrPayload: string): Promise<AppInputState | null> {
  if (!hashOrPayload || typeof hashOrPayload !== "string") {
    return null;
  }

  // Hash-Präfixe entfernen (#, v1=, state=)
  let cleanPayload = hashOrPayload.trim();
  if (cleanPayload.startsWith("#")) {
    cleanPayload = cleanPayload.slice(1);
  }

  // Bekannte Modal-Hashes ignorieren
  const lower = cleanPayload.toLowerCase();
  if (
    lower === "impressum" ||
    lower === "datenschutz" ||
    lower === "changelog" ||
    lower === "version" ||
    lower === "versions" ||
    cleanPayload === ""
  ) {
    return null;
  }

  if (cleanPayload.startsWith("v1=")) {
    cleanPayload = cleanPayload.slice(3);
  } else if (cleanPayload.startsWith("state=")) {
    cleanPayload = cleanPayload.slice(6);
  }

  if (!cleanPayload) {
    return null;
  }

  try {
    const bytes = base64UrlToUint8Array(cleanPayload);
    const jsonString = await decompressString(bytes);
    const parsed = JSON.parse(jsonString);
    const migrated = migrateStateToLatest(parsed);

    if (!migrated) {
      return null;
    }

    return urlStateV1ToAppState(migrated);
  } catch {
    // Bei ungültigen/beschädigten Parametern geräuschlos abfangen
    return null;
  }
}

/**
 * Erstellt eine vollständige, teilbare URL basierend auf dem aktuellen Zustand.
 *
 * @param state - Der Anwendungszustand
 * @param baseUrl - Optionale Basis-URL (Standard: window.location.href ohne alten Hash)
 * @returns Promise<string> - Vollständige URL mit #v1=...
 */
export async function buildShareableUrl(state: AppInputState, baseUrl?: string): Promise<string> {
  const hash = await serializeStateToHash(state);

  if (baseUrl) {
    const urlObj = new URL(baseUrl);
    urlObj.hash = hash;
    return urlObj.toString();
  }

  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const search = window.location.search;
    return `${origin}${pathname}${search}${hash}`;
  }

  return hash;
}
