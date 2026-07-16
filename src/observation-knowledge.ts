import type { UniversalEvent } from "./event-store.js";

export interface ObservationRelation {
  targetId: string;
  relationType: "similar-to";
  strength: number;
}

export interface ObservationKnowledge {
  observationId: string;
  recordedAt: string;
  relations: ObservationRelation[];
  aggregates: {
    relatedCount: number;
    observedCount: number;
    firstRelatedAt?: string;
    lastRelatedAt?: string;
  };
  trend: {
    direction: "increasing" | "stable" | "decreasing" | "insufficient-data";
    window: "recent";
  };
}

const IGNORED_KEYS = new Set(["id", "createdAt", "occurredAt", "timestamp", "sessionId", "operationId", "missionId"]);

function flatten(value: unknown, prefix = "", output: Record<string, string | number | boolean> = {}): Record<string, string | number | boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return output;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (IGNORED_KEYS.has(key)) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string" || typeof child === "number" || typeof child === "boolean") output[path] = child;
    else if (child && typeof child === "object" && !Array.isArray(child)) flatten(child, path, output);
  }
  return output;
}

function primitiveSimilarity(left: string | number | boolean, right: string | number | boolean): number {
  if (typeof left !== typeof right) return 0;
  if (typeof left === "number" && typeof right === "number") {
    const scale = Math.max(Math.abs(left), Math.abs(right), 1);
    return Math.max(0, 1 - Math.abs(left - right) / scale);
  }
  return left === right ? 1 : 0;
}

export function observationSimilarity(left: Record<string, unknown>, right: Record<string, unknown>): number {
  const a = flatten(left);
  const b = flatten(right);
  const shared = Object.keys(a).filter((key) => key in b);
  if (!shared.length) return 0;
  const score = shared.reduce((sum, key) => sum + primitiveSimilarity(a[key]!, b[key]!), 0) / shared.length;
  const coverage = shared.length / Math.max(Object.keys(a).length, Object.keys(b).length, 1);
  return Math.round(score * coverage * 1000) / 1000;
}

function trendDirection(relations: ObservationRelation[]): ObservationKnowledge["trend"]["direction"] {
  if (relations.length < 2) return "insufficient-data";
  const recent = relations.slice(0, Math.min(3, relations.length));
  const older = relations.slice(Math.min(3, relations.length), 6);
  if (!older.length) return "stable";
  const average = (items: ObservationRelation[]) => items.reduce((sum, item) => sum + item.strength, 0) / items.length;
  const delta = average(recent) - average(older);
  if (delta > 0.08) return "increasing";
  if (delta < -0.08) return "decreasing";
  return "stable";
}

export function projectObservationKnowledge(
  current: UniversalEvent,
  events: UniversalEvent[],
): ObservationKnowledge {
  const previous = events
    .filter((event) => event.kind === "observation.received" && event.id !== current.id)
    .map((event) => ({ event, strength: observationSimilarity(current.payload, event.payload) }))
    .filter((item) => item.strength >= 0.55)
    .sort((a, b) => b.strength - a.strength);

  const relations = previous.slice(0, 8).map(({ event, strength }) => ({
    targetId: event.id,
    relationType: "similar-to" as const,
    strength,
  }));
  const relatedEvents = previous.map(({ event }) => event).sort((a, b) => a.sequence - b.sequence);

  return {
    observationId: current.id,
    recordedAt: current.occurredAt,
    relations,
    aggregates: {
      relatedCount: previous.length,
      observedCount: events.filter((event) => event.kind === "observation.received").length,
      ...(relatedEvents[0] ? { firstRelatedAt: relatedEvents[0].occurredAt } : {}),
      ...(relatedEvents.at(-1) ? { lastRelatedAt: relatedEvents.at(-1)!.occurredAt } : {}),
    },
    trend: {
      direction: trendDirection(relations),
      window: "recent",
    },
  };
}
