import { describe, expect, it } from "vitest";
import { EventBus } from "../event-bus.js";
import { UniversalEventStore } from "../event-store.js";

describe("UniversalEventStore", () => {
  it("appends immutable ordered events and filters streams", () => {
    const store = new UniversalEventStore();
    const first = store.append({
      kind: "observation.received",
      streamId: "observation:1",
      source: "spectrl",
      payload: { confidence: 0.82 },
    });
    const second = store.append({
      kind: "observation.recorded",
      streamId: "observation:1",
      source: "octopus-engine",
      payload: { accepted: true },
      causationId: first.id,
    });

    expect(first.sequence).toBe(1);
    expect(second.sequence).toBe(2);
    expect(store.stream("observation:1").map((event) => event.kind)).toEqual([
      "observation.received",
      "observation.recorded",
    ]);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.payload)).toBe(true);
  });

  it("projects a mission from its event stream", () => {
    const store = new UniversalEventStore();
    const missionId = "mission:42";
    store.append({
      kind: "mission.received",
      streamId: missionId,
      source: "octopus-engine",
      payload: { requiredCapabilities: ["content.article.write"] },
    });
    store.append({ kind: "mission.recorded", streamId: missionId, source: "octopus-engine" });
    store.append({ kind: "mission.planned", streamId: missionId, source: "octopus-engine" });
    store.append({
      kind: "mission.waiting-executor",
      streamId: missionId,
      source: "octopus-engine",
      payload: { executorId: "publisher" },
    });

    const projection = store.projectMission(missionId);
    expect(projection?.status).toBe("waiting-executor");
    expect(projection?.requiredCapabilities).toEqual(["content.article.write"]);
    expect(projection?.executorId).toBe("publisher");
    expect(projection?.events).toHaveLength(4);
  });

  it("uses the universal store as the EventBus source of truth", async () => {
    const store = new UniversalEventStore();
    const bus = new EventBus(store);
    await bus.emit("MissionStarted", { missionId: "mission:bus", title: "Test" });

    expect(bus.history()).toHaveLength(1);
    expect(store.stream("mission:bus")).toHaveLength(1);
    expect(store.stream("mission:bus")[0]?.kind).toBe("MissionStarted");
  });
});
