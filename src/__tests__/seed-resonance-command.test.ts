import { describe, expect, it } from "vitest";
import { EventBus } from "../event-bus.js";
import { GardenProjector } from "../garden-projector.js";
import { GardenStore } from "../garden-store.js";
import type { SeedRecord } from "../garden-domain.js";
import { SeedResonanceCommandHandler } from "../seed-resonance-command.js";

const seed: SeedRecord = {
  id: "seed-command-1",
  parcelId: "parcel-1",
  kind: "opportunity",
  title: "Combiner deux capacités",
  content: "Tester une combinaison déjà disponible.",
  status: "seed",
  createdAt: "2026-07-11T12:00:00.000Z",
  updatedAt: "2026-07-11T12:00:00.000Z",
  signals: {
    maturity: 90,
    coherence: 90,
    utility: 90,
    confidence: 90,
    estimatedCost: 0.05,
  },
};

describe("SeedResonanceCommandHandler", () => {
  it("evaluates a supplied seed snapshot and projects the result without sprouting automatically", async () => {
    const events = new EventBus();
    const garden = new GardenStore({
      parcels: [{
        id: "parcel-1",
        name: "Laboratoire",
        kind: "project",
        objective: "Tester sans casser.",
        status: "watch",
        signals: { freshness: 100, traction: 0, revenue: 0 },
        notes: [],
      }],
    });
    new GardenProjector(events, garden).connect();
    await events.emit("SeedPlanted", { seed });

    const handler = new SeedResonanceCommandHandler(events);
    const result = await handler.execute({ seed, proposedCapabilities: ["mistral.generate"] });

    expect(result.decision).toBe("sprout");
    expect(garden.getState().seeds[0]?.status).toBe("resonating");
    expect(garden.getState().sprouts).toHaveLength(0);

    const resonanceEvent = garden.getState().events.find((event) => event.type === "SeedResonanceEvaluated");
    expect(resonanceEvent?.payload.seedId).toBe(seed.id);
    expect(resonanceEvent?.payload.decision).toBe("sprout");
    expect(resonanceEvent?.payload.proposedCapabilities).toEqual(["mistral.generate"]);
  });
});
