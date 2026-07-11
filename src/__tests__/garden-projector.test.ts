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
