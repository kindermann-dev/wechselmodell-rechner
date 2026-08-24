export interface Scenario {
  id: string;
  name: string;
  description: string;
}

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "bgh-standard",
    name: "BGH-Leitfall 2026 (Standard: 48k € / 36k €, 1 Kind)",
    description:
      "Typischer Fall mit zwei Erwerbstätigen, 5% Pauschale, 1.200 € Vorsorge A und 1 Kind (6-11 J.).",
  },
  {
    id: "mehrkind-housing",
    name: "Mehrkind & Wohnmehrbedarf (2 Kinder, hohe Mieten)",
    description:
      "2 Kinder (6-11 J. & 12-17 J.) mit Realkosten-Wohnmehrbedarf aus Warmmieten (1.400 € und 1.100 €).",
  },
  {
    id: "mangelfall",
    name: "Mangelfall (Unterschreitung Selbstbehalt: 24k € / 20k €)",
    description:
      "Einkommen nahe dem notwendigen Selbstbehalt (1.450 €) mit anteiliger Mangelfall-Verteilung.",
  },
  {
    id: "high-income",
    name: "Spitzenverdiener (120k € + Boni / 60k €, 2 Kinder)",
    description:
      "Höchste DT-Stufe 15 (200 %) mit 4 % Altersvorsorgedeckelung und 2 Kindern inkl. Volljährigem.",
  },
];
