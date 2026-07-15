import type { MissionLifecycleStatus } from "./mission-lifecycle.js";

export type UniversalEventKind =
  | "observation.received"
  | "observation.recorded"
  | "mission.received"
  | "mission.recorded"
  | "mission.planned"
  | "mission.waiting-executor"
  | "mission.executing"
  | "mission.waiting-authorization"
  | "mission.completed"
  | "mission.failed"
  | "mission.rejected"
  | string;

export interface UniversalEventInput {
  kind: UniversalEventKind;
  streamId: string;
  source: string;
  payload?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
  occurredAt?: string;
}

export interface UniversalEvent extends UniversalEventInput {
  id: string;
  sequence: number;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface MissionProjection {
  missionId: string;
  status: MissionLifecycleStatus;
  updatedAt: string;
  requiredCapabilities: string[];
  executorId?: string;
  summary?: string;
  output?: Record<string, unknown>;
  events: UniversalEvent[];
}

function eventId(sequence: number): string {
  return `evt_${Date.now()}_${sequence}_${Math.random().toString(36).slice(2, 8)}`;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
}

const STATUS_BY_KIND: Partial<Record<UniversalEventKind, MissionLifecycleStatus>> = {
  "mission.received": "received",
  "mission.recorded": "recorded",
  "mission.planned": "planned",
  "mission.waiting-executor": "waiting-executor",
  "mission.executing": "executing",
  "mission.waiting-authorization": "waiting-authorization",
  "mission.completed": "completed",
  "mission.failed": "failed",
  "mission.rejected": "rejected",
};

/**
 * Mémoire append-only universelle du moteur.
 *
 * La V1 est volontairement en mémoire. Le contrat d'append et les projections
 * restent indépendants du futur backend persistant.
 */
export class UniversalEventStore {
  private readonly events: UniversalEvent[] = [];

  append(input: UniversalEventInput): UniversalEvent {
    if (!input.kind.trim()) throw new Error("Event kind is required.");
    if (!input.streamId.trim()) throw new Error("Event streamId is required.");
    if (!input.source.trim()) throw new Error("Event source is required.");

    const sequence = this.events.length + 1;
    const event: UniversalEvent = Object.freeze({
      ...input,
      id: eventId(sequence),
      sequence,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      payload: Object.freeze({ ...(input.payload ?? {}) }),
    });
    this.events.push(event);
    return event;
  }

  all(): UniversalEvent[] {
    return [...this.events];
  }

  stream(streamId: string): UniversalEvent[] {
    return this.events.filter((event) => event.streamId === streamId);
  }

  correlated(correlationId: string): UniversalEvent[] {
    return this.events.filter((event) => event.correlationId === correlationId);
  }

  projectMission(missionId: string): MissionProjection | undefined {
    const events = this.stream(missionId).filter((event) => event.kind.startsWith("mission."));
    if (!events.length) return undefined;

    let status: MissionLifecycleStatus = "received";
    let requiredCapabilities: string[] = [];
    let executorId: string | undefined;
    let summary: string | undefined;
    let output: Record<string, unknown> | undefined;

    for (const event of events) {
      status = STATUS_BY_KIND[event.kind] ?? status;
      const capabilities = strings(event.payload.requiredCapabilities);
      if (capabilities.length) requiredCapabilities = capabilities;
      if (typeof event.payload.executorId === "string") executorId = event.payload.executorId;
      if (typeof event.payload.summary === "string") summary = event.payload.summary;
      if (event.payload.output && typeof event.payload.output === "object" && !Array.isArray(event.payload.output)) {
        output = event.payload.output as Record<string, unknown>;
      }
    }

    return {
      missionId,
      status,
      updatedAt: events.at(-1)!.occurredAt,
      requiredCapabilities,
      ...(executorId ? { executorId } : {}),
      ...(summary ? { summary } : {}),
      ...(output ? { output } : {}),
      events,
    };
  }
}
