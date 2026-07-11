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
  | "SproutCreated"
  | "HarvestCreated"
  | "TentacleLearned";

export interface OctopusEvent {
  id: string;
  type: OctopusEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

export type EventHandler = (event: OctopusEvent) => void | Promise<void>;

function makeEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class EventBus {
  private readonly handlers = new Map<OctopusEventType, EventHandler[]>();
  private readonly log: OctopusEvent[] = [];

  on(type: OctopusEventType, handler: EventHandler): void {
    const handlers = this.handlers.get(type) ?? [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  async emit(type: OctopusEventType, payload: Record<string, unknown> = {}): Promise<OctopusEvent> {
    const event: OctopusEvent = {
      id: makeEventId(),
      type,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.log.push(event);
    for (const handler of this.handlers.get(type) ?? []) {
      await handler(event);
    }
    return event;
  }

  history(): OctopusEvent[] {
    return [...this.log];
  }
}
