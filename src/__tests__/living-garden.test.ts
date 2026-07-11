import { describe, expect, it } from "vitest";
import { GardenStore } from "../garden-store.js";
import { ResonanceEngine } from "../resonance-engine.js";
import type { SeedRecord } from "../garden-domain.js";

const now = "2026-07-10T12:00:00.000Z";

function makeSeed(overrides: Partial<SeedRecord> = {}): SeedRecord {
  return {
    id: "seed-1",
    parcelId: "parcel-1",
    kind: "opportunity",
    title: "Tester une nouvelle capacité",
    content: "Combiner deux outils déjà disponibles.",
    status: "seed",
    createdAt: now,
    updatedAt: now,
    signals: {
      maturity: 90,
      coherence: 90,
      utility: 90,
      confidence: 90,
      estimatedCost: 0.05,
    },
    ...overrides,
  };
}

describe("living Garden", () => {
  it("turns a mature seed into a sprout", () => {
    const engine = new ResonanceEngine();
    const result = engine.evaluate(makeSeed(), ["mistral.generate"]);

    expect(result.decision).toBe("sprout");
    expect(result.sprout?.proposedCapabilities).toEqual(["mistral.generate"]);
  });

  it("keeps seeds attached to a known parcel", () => {
    const store = new GardenStore({
      parcels: [{
        id: "parcel-1",
        name: "Laboratoire",
        kind: "project",
        objective: "Découvrir sans casser.",
        status: "watch",
        signals: { freshness: 100, traction: 0, revenue: 0 },
        notes: [],
      }],
    });

    store.plantSeed(makeSeed());
    expect(store.getState().seeds).toHaveLength(1);
    expect(() => store.plantSeed(makeSeed({ id: "seed-2", parcelId: "missing" }))).toThrow("Unknown parcel");
  });

  it("records a blocking evaluation without mutating projected capability stability", () => {
    const store = new GardenStore();
    store.upsertCapability({
      id: "experimental-composer",
      domain: "content",
      capabilities: ["compose"],
      connectors: ["mistral"],
      stability: "experimental",
      limits: [],
      permissions: [],
      metrics: { executions: 1, successes: 0, failures: 1, averageCost: 0.1, averageDurationMs: 100 },
      createdAt: now,
      updatedAt: now,
    });

    store.addEvaluation({
      id: "evaluation-1",
      missionId: "mission-1",
      parcelId: "parcel-1",
      capabilityId: "experimental-composer",
      createdAt: now,
      reaction: "block",
      score: 10,
      findings: [{ code: "policy", severity: "critical", message: "Violation de policy" }],
    });

    const state = store.getState();
    expect(state.evaluations).toHaveLength(1);
    expect(state.evaluations[0]?.reaction).toBe("block");
    expect(state.capabilities[0]?.stability).toBe("experimental");
  });
});
