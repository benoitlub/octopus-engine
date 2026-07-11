import { describe, expect, it } from "vitest";
import { EventBus } from "../event-bus.js";
import { GardenProjector } from "../garden-projector.js";
import { GardenStore } from "../garden-store.js";

describe("GardenProjector", () => {
  it("projects a complete mission lifecycle from events", async () => {
    const events = new EventBus();
    const garden = new GardenStore();
    new GardenProjector(events, garden).connect();

    await events.emit("MissionStarted", {
      missionId: "mission-1",
      parcelId: "parcel-1",
      title: "Mission test",
    });
    await events.emit("ResourceUsed", {
      usageId: "usage-1",
      missionId: "mission-1",
      parcelId: "parcel-1",
      resourceId: "mistral",
      status: "success",
      usage: { totalTokens: 42 },
    });
    await events.emit("HarvestCreated", {
      harvestId: "harvest-1",
      missionId: "mission-1",
      parcelId: "parcel-1",
      title: "Mission test",
      preview: "Une récolte réelle",
    });
    await events.emit("MissionCompleted", {
      missionId: "mission-1",
      parcelId: "parcel-1",
      output: { text: "Terminé" },
    });

    const state = garden.getState();
    expect(state.missions).toHaveLength(1);
    expect(state.missions[0]?.status).toBe("completed");
    expect(state.missions[0]?.output).toEqual({ text: "Terminé" });
    expect(state.resourceUsage[0]?.usage?.totalTokens).toBe(42);
    expect(state.harvests[0]?.preview).toBe("Une récolte réelle");
    expect(state.events.map((event) => event.type)).toEqual([
      "MissionStarted",
      "ResourceUsed",
      "HarvestCreated",
      "MissionCompleted",
    ]);
  });

  it("projects an external Seed resonance evaluation without deciding growth", async () => {
    const events = new EventBus();
    const garden = new GardenStore({
      parcels: [{
        id: "parcel-1",
        name: "Laboratoire",
        kind: "project",
        objective: "Observer une idée.",
        status: "watch",
        signals: { freshness: 100, traction: 0, revenue: 0 },
        notes: [],
      }],
    });
    new GardenProjector(events, garden).connect();

    await events.emit("SeedPlanted", {
      seed: {
        id: "seed-1",
        parcelId: "parcel-1",
        kind: "idea",
        title: "Une idée dormante",
        content: "Attendre de nouvelles observations.",
        status: "seed",
        createdAt: "2026-07-11T12:00:00.000Z",
        updatedAt: "2026-07-11T12:00:00.000Z",
        signals: { maturity: 20, coherence: 40, utility: 30, confidence: 25, estimatedCost: 0.1 },
      },
    });
    await events.emit("SeedResonanceEvaluated", {
      seedId: "seed-1",
      score: 57,
      decision: "resonate",
      reasons: ["Nouvelle observation Publisher"],
      signals: { maturity: 55, coherence: 70, utility: 65, confidence: 60, estimatedCost: 0.1 },
    });

    const state = garden.getState();
    expect(state.seeds[0]?.status).toBe("resonating");
    expect(state.seeds[0]?.signals.maturity).toBe(55);
    expect(state.sprouts).toHaveLength(0);
    expect(state.events.at(-1)?.type).toBe("SeedResonanceEvaluated");
    expect(state.events.at(-1)?.payload.decision).toBe("resonate");
  });

  it("ignores resonance projections for an unknown Seed", async () => {
    const events = new EventBus();
    const garden = new GardenStore();
    new GardenProjector(events, garden).connect();

    await events.emit("SeedResonanceEvaluated", {
      seedId: "missing",
      signals: { maturity: 80, coherence: 80, utility: 80, confidence: 80, estimatedCost: 0.1 },
    });

    expect(garden.getState().seeds).toHaveLength(0);
    expect(garden.getState().events).toHaveLength(1);
  });

  it("connects only once", async () => {
    const events = new EventBus();
    const garden = new GardenStore();
    const projector = new GardenProjector(events, garden);
    projector.connect();
    projector.connect();

    await events.emit("MissionStarted", {
      missionId: "mission-1",
      parcelId: "parcel-1",
      title: "Mission test",
    });

    expect(garden.getState().events).toHaveLength(1);
    expect(garden.getState().missions).toHaveLength(1);
  });
});
