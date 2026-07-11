import { describe, expect, it } from "vitest";
import { EventBus } from "../event-bus.js";
import { GardenProjector } from "../garden-projector.js";
import { GardenStore } from "../garden-store.js";
import type { SeedRecord, SproutRecord } from "../garden-domain.js";

const now = "2026-07-11T12:00:00.000Z";

function createGarden(): GardenStore {
  return new GardenStore({
    parcels: [{
      id: "parcel-1",
      name: "Laboratoire",
      kind: "project",
      objective: "Observer la croissance.",
      status: "watch",
      signals: { freshness: 100, traction: 0, revenue: 0 },
      notes: [],
    }],
  });
}

const seed: SeedRecord = {
  id: "seed-1",
  parcelId: "parcel-1",
  kind: "idea",
  title: "Une idée à laisser mûrir",
  content: "Observer sans déclencher automatiquement une mission.",
  status: "seed",
  createdAt: now,
  updatedAt: now,
  signals: {
    maturity: 20,
    coherence: 70,
    utility: 60,
    confidence: 50,
    estimatedCost: 0,
  },
};

const sprout: SproutRecord = {
  id: "sprout-1",
  seedId: "seed-1",
  parcelId: "parcel-1",
  title: "Première pousse",
  createdAt: now,
  rationale: "La graine a été guidée explicitement.",
  proposedCapabilities: ["campaign.generate"],
};

describe("Seed and Sprout projections", () => {
  it("projects planting, updating and sprouting from events", async () => {
    const events = new EventBus();
    const garden = createGarden();
    new GardenProjector(events, garden).connect();

    await events.emit("SeedPlanted", { seed });
    await events.emit("SeedUpdated", {
      seed: {
        ...seed,
        status: "resonating",
        updatedAt: "2026-07-11T13:00:00.000Z",
        signals: { ...seed.signals, maturity: 45 },
      },
    });
    await events.emit("SproutCreated", { sprout });

    const state = garden.getState();
    expect(state.seeds).toHaveLength(1);
    expect(state.seeds[0]?.signals.maturity).toBe(45);
    expect(state.seeds[0]?.status).toBe("sprouted");
    expect(state.sprouts).toEqual([sprout]);
    expect(state.events.map((event) => event.type)).toEqual([
      "SeedPlanted",
      "SeedUpdated",
      "SproutCreated",
    ]);
  });

  it("is idempotent when the same records are replayed", async () => {
    const events = new EventBus();
    const garden = createGarden();
    new GardenProjector(events, garden).connect();

    await events.emit("SeedPlanted", { seed });
    await events.emit("SeedPlanted", { seed });
    await events.emit("SproutCreated", { sprout });
    await events.emit("SproutCreated", { sprout });

    const state = garden.getState();
    expect(state.seeds).toHaveLength(1);
    expect(state.sprouts).toHaveLength(1);
  });
});
