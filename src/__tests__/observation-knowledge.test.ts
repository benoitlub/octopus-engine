import { describe, expect, it } from "vitest";
import { UniversalEventStore } from "../event-store.js";
import { observationSimilarity, projectObservationKnowledge } from "../observation-knowledge.js";

describe("universal observation knowledge", () => {
  it("compares neutral primitive metrics without domain vocabulary", () => {
    const similarity = observationSimilarity(
      { metrics: { frequency: 1000, confidence: 0.8 }, context: { place: "room" } },
      { metrics: { frequency: 1040, confidence: 0.78 }, context: { place: "room" } },
    );
    expect(similarity).toBeGreaterThan(0.8);
  });

  it("returns generic relations, aggregates and trend", () => {
    const store = new UniversalEventStore();
    store.append({
      kind: "observation.received",
      streamId: "observation:1",
      source: "application-a",
      occurredAt: "2026-07-15T20:00:00.000Z",
      payload: { metrics: { value: 100, confidence: 0.7 }, context: { category: "alpha" } },
    });
    const current = store.append({
      kind: "observation.received",
      streamId: "observation:2",
      source: "application-b",
      occurredAt: "2026-07-15T21:00:00.000Z",
      payload: { metrics: { value: 102, confidence: 0.72 }, context: { category: "alpha" } },
    });

    const knowledge = projectObservationKnowledge(current, store.all());
    expect(knowledge.aggregates.observedCount).toBe(2);
    expect(knowledge.aggregates.relatedCount).toBe(1);
    expect(knowledge.relations[0]?.relationType).toBe("similar-to");
    expect(knowledge.relations[0]?.strength).toBeGreaterThan(0.8);
    expect(knowledge).not.toHaveProperty("revelationScore");
    expect(knowledge).not.toHaveProperty("noveltyScore");
  });
});
