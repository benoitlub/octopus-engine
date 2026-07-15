import { UniversalEventStore, type UniversalEvent } from "./event-store.js";

export type OctopusEventType =
  | "OctopusStarted"
  | "GardenInspected"
  | "MissionQueued"
  | "MissionStarted"
  | "TentacleSelected"
  | "ResourceRequested"
  | "AuthorizationRequested"
  | "ResourceUsed"
  | "MissionCompleted"
  | "MissionFailed"
  | "ParcelUpdated"
  | "SeedPlanted"
  | "SeedUpdated"
  | "SeedResonanceEvaluated"
  | "SproutCreated"
  | "HarvestCreated"
  | "TentacleLearned"
  | "AdapterRegistered"
  | "AdapterUnregistered"
  | "AdapterSelected";

export interface OctopusEvent {
  id: string;
  type: OctopusEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

export type EventHandler = (event: OctopusEvent) => void | Promise<void>;

function streamId(type: OctopusEventType, payload: Record<string, unknown>): string {
  const identity = payload.missionId ?? payload.operationId ?? payload.eventId ?? payload.adapterId;
  return typeof identity === "string" && identity.trim() ? identity : `system:${type}`;
}

/**
 * Bus de diffusion synchrone adossé à l'Event Store universel.
 * `history()` reste compatible avec le contrat V1 mais ne possède plus sa
 * propre mémoire : l'Event Store est l'unique source de vérité.
 */
export class EventBus {
  private readonly handlers = new Map<OctopusEventType, EventHandler[]>();

  constructor(readonly store = new UniversalEventStore()) {}

  on(type: OctopusEventType, handler: EventHandler): void {
    const handlers = this.handlers.get(type) ?? [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  async emit(type: OctopusEventType, payload: Record<string, unknown> = {}): Promise<OctopusEvent> {
    const stored = this.store.append({
      kind: type,
      streamId: streamId(type, payload),
      source: "octopus-engine",
      payload,
      ...(typeof payload.correlationId === "string" ? { correlationId: payload.correlationId } : {}),
      ...(typeof payload.causationId === "string" ? { causationId: payload.causationId } : {}),
    });
    const event = this.toLegacyEvent(stored, type);

    for (const handler of this.handlers.get(type) ?? []) {
      await handler(event);
    }
    return event;
  }

  history(): OctopusEvent[] {
    return this.store.all().map((event) => this.toLegacyEvent(event, event.kind as OctopusEventType));
  }

  private toLegacyEvent(event: UniversalEvent, type: OctopusEventType): OctopusEvent {
    return {
      id: event.id,
      type,
      timestamp: event.occurredAt,
      payload: event.payload,
    };
  }
}
