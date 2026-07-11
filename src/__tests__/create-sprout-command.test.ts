import { describe, expect, it } from "vitest";
import { CreateSproutCommandHandler } from "../create-sprout-command.js";
import { EventBus } from "../event-bus.js";
import { GardenProjector } from "../garden-projector.js";
import { GardenStore } from "../garden-store.js";
import type { SeedRecord } from "../garden-domain.js";

const seed: SeedRecord = {
  id: "seed-1",
  parcelId: "parcel-1",
  kind: "idea",
  title: "Faire pousser une idée",
  content: "Une graine déjà évaluée.",
  status: "resonating",
  createdAt: "2026-07-11T12:00:00.000Z",
  updatedAt: "2026-07-11T12:00:00.000Z",
  signals: { maturity: 90, coherence: 85, utility: 92, confidence: 80, estimatedCost: 0.1 },
};

describe("CreateSproutCommandHandler", () => {
  it("creates a sprout only after an explicit decision", async () => {
    const events = new EventBus();
    const garden = new GardenStore({
      parcels: [{
        id: "parcel-1",
        name: "Laboratoire",
        kind: "project",
        objective: "Tester les pousses.",
        status: "watch",
        signals: { freshness: 100, traction: 0, revenue: 0 },
        notes: [],
      }],
    });
    new GardenProjector(events, garden).connect();
    await events.emit("SeedPlanted", { seed });

    const handler = new CreateSproutCommandHandler(events);
    const sprout = await handler.execute({
      seed,
      decision: "sprout",
      rationale: "Résonance confirmée par le Poulpe",
      proposedCapabilities: ["campaign.generate"],
    });

    const state = garden.getState();
    expect(sprout.seedId).toBe(seed.id);
    expect(state.sprouts).toHaveLength(1);
    expect(state.sprouts[0]?.rationale).toBe("Résonance confirmée par le Poulpe");
    expect(state.seeds[0]?.status).toBe("sprouted");
  });

  it("rejects a seed that is not resonating", async () => {
    const handler = new CreateSproutCommandHandler(new EventBus());
    await expect(handler.execute({ seed: { ...seed, status: "seed" }, decision: "sprout" }))
      .rejects.toThrow("is not resonating");
  });
});
