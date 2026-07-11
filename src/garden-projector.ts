import type { EventBus, OctopusEvent, OctopusEventType } from "./event-bus.js";
import type { GardenStore, HarvestRecord, MissionRecord, ResourceUsageRecord } from "./garden-store.js";

const PROJECTED_EVENTS: OctopusEventType[] = [
  "OctopusStarted",
  "GardenInspected",
  "MissionQueued",
  "MissionStarted",
  "TentacleSelected",
  "ResourceRequested",
  "AuthorizationRequested",
  "ResourceUsed",
  "MissionCompleted",
  "MissionFailed",
  "ParcelUpdated",
  "HarvestCreated",
  "TentacleLearned",
];

function stringValue(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}

function recordValue(payload: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = payload[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

export class GardenProjector {
  private connected = false;

  constructor(
    private readonly events: EventBus,
    private readonly garden: GardenStore,
  ) {}

  connect(): void {
    if (this.connected) return;
    this.connected = true;
    for (const type of PROJECTED_EVENTS) {
      this.events.on(type, (event) => this.project(event));
    }
  }

  private project(event: OctopusEvent): void {
    this.garden.appendEvent(event);

    if (event.type === "MissionQueued" || event.type === "MissionStarted") {
      this.projectMission(event);
      return;
    }

    if (event.type === "AuthorizationRequested") {
      this.updateMission(event, "waiting-authorization");
      return;
    }

    if (event.type === "MissionCompleted") {
      this.updateMission(event, "completed");
      return;
    }

    if (event.type === "MissionFailed") {
      this.updateMission(event, "failed");
      return;
    }

    if (event.type === "ResourceUsed") {
      this.projectResourceUsage(event);
      return;
    }

    if (event.type === "HarvestCreated") {
      this.projectHarvest(event);
    }
  }

  private projectMission(event: OctopusEvent): void {
    const missionId = stringValue(event.payload, "missionId");
    const parcelId = stringValue(event.payload, "parcelId");
    if (!missionId || !parcelId) return;

    const existing = this.garden.getState().missions.some((mission) => mission.id === missionId);
    const status: MissionRecord["status"] = event.type === "MissionQueued" ? "queued" : "running";
    const output = recordValue(event.payload, "output");

    if (existing) {
      this.garden.updateMission(missionId, { status, output });
      return;
    }

    this.garden.addMission({
      id: missionId,
      parcelId,
      title: stringValue(event.payload, "title") ?? missionId,
      status,
      createdAt: stringValue(event.payload, "createdAt") ?? event.timestamp,
      updatedAt: event.timestamp,
      output,
    });
  }

  private updateMission(event: OctopusEvent, status: MissionRecord["status"]): void {
    const missionId = stringValue(event.payload, "missionId");
    if (!missionId) return;
    this.garden.updateMission(missionId, {
      status,
      output: recordValue(event.payload, "output"),
    });
  }

  private projectResourceUsage(event: OctopusEvent): void {
    const missionId = stringValue(event.payload, "missionId");
    const parcelId = stringValue(event.payload, "parcelId");
    const resourceId = stringValue(event.payload, "resourceId");
    if (!missionId || !parcelId || !resourceId) return;

    const record: ResourceUsageRecord = {
      id: stringValue(event.payload, "usageId") ?? `usage_${event.id}`,
      missionId,
      parcelId,
      resourceId,
      status: stringValue(event.payload, "status") ?? "success",
      createdAt: event.timestamp,
      usage: recordValue(event.payload, "usage"),
    };
    this.garden.addResourceUsage(record);
  }

  private projectHarvest(event: OctopusEvent): void {
    const missionId = stringValue(event.payload, "missionId");
    const parcelId = stringValue(event.payload, "parcelId");
    if (!missionId || !parcelId) return;

    const record: HarvestRecord = {
      id: stringValue(event.payload, "harvestId") ?? `harvest_${event.id}`,
      missionId,
      parcelId,
      seedId: stringValue(event.payload, "seedId"),
      title: stringValue(event.payload, "title") ?? missionId,
      createdAt: event.timestamp,
      preview: stringValue(event.payload, "preview") ?? "",
    };
    this.garden.addHarvest(record);
  }
}
