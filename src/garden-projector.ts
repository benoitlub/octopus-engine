import type { EventBus, OctopusEvent, OctopusEventType } from "./event-bus.js";
import type { SeedRecord, SproutRecord } from "./garden-domain.js";
import type { GardenStore, HarvestRecord, MissionRecord, ResourceUsageRecord } from "./garden-store.js";
import type { ResourceUsage } from "./resource-manager.js";

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
  "SeedPlanted",
  "SeedUpdated",
  "SproutCreated",
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

function usageValue(payload: Record<string, unknown>): ResourceUsage | undefined {
  return recordValue(payload, "usage") as ResourceUsage | undefined;
}

function seedValue(payload: Record<string, unknown>): SeedRecord | undefined {
  const seed = recordValue(payload, "seed") as SeedRecord | undefined;
  return seed && typeof seed.id === "string" && typeof seed.parcelId === "string" ? seed : undefined;
}

function sproutValue(payload: Record<string, unknown>): SproutRecord | undefined {
  const sprout = recordValue(payload, "sprout") as SproutRecord | undefined;
  return sprout && typeof sprout.id === "string" && typeof sprout.seedId === "string" ? sprout : undefined;
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
    } else if (event.type === "AuthorizationRequested") {
      this.updateMission(event, "waiting-authorization");
    } else if (event.type === "MissionCompleted") {
      this.updateMission(event, "completed");
    } else if (event.type === "MissionFailed") {
      this.updateMission(event, "failed");
    } else if (event.type === "ResourceUsed") {
      this.projectResourceUsage(event);
    } else if (event.type === "SeedPlanted" || event.type === "SeedUpdated") {
      this.projectSeed(event);
    } else if (event.type === "SproutCreated") {
      this.projectSprout(event);
    } else if (event.type === "HarvestCreated") {
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
      this.garden.updateMission(missionId, output ? { status, output } : { status });
      return;
    }

    this.garden.addMission({
      id: missionId,
      parcelId,
      title: stringValue(event.payload, "title") ?? missionId,
      status,
      createdAt: stringValue(event.payload, "createdAt") ?? event.timestamp,
      updatedAt: event.timestamp,
      ...(output ? { output } : {}),
    });
  }

  private updateMission(event: OctopusEvent, status: MissionRecord["status"]): void {
    const missionId = stringValue(event.payload, "missionId");
    if (!missionId) return;
    const output = recordValue(event.payload, "output");
    this.garden.updateMission(missionId, output ? { status, output } : { status });
  }

  private projectResourceUsage(event: OctopusEvent): void {
    const missionId = stringValue(event.payload, "missionId");
    const parcelId = stringValue(event.payload, "parcelId");
    const resourceId = stringValue(event.payload, "resourceId");
    if (!missionId || !parcelId || !resourceId) return;

    const usage = usageValue(event.payload);
    const record: ResourceUsageRecord = {
      id: stringValue(event.payload, "usageId") ?? `usage_${event.id}`,
      missionId,
      parcelId,
      resourceId,
      status: stringValue(event.payload, "status") ?? "success",
      createdAt: event.timestamp,
      ...(usage ? { usage } : {}),
    };
    this.garden.addResourceUsage(record);
  }

  private projectSeed(event: OctopusEvent): void {
    const seed = seedValue(event.payload);
    if (!seed) return;

    const existing = this.garden.getState().seeds.some((candidate) => candidate.id === seed.id);
    if (existing) {
      this.garden.updateSeed(seed.id, seed);
      return;
    }

    this.garden.plantSeed(seed);
  }

  private projectSprout(event: OctopusEvent): void {
    const sprout = sproutValue(event.payload);
    if (!sprout) return;

    const exists = this.garden.getState().sprouts.some((candidate) => candidate.id === sprout.id);
    if (!exists) this.garden.addSprout(sprout);
  }

  private projectHarvest(event: OctopusEvent): void {
    const missionId = stringValue(event.payload, "missionId");
    const parcelId = stringValue(event.payload, "parcelId");
    if (!missionId || !parcelId) return;

    const seedId = stringValue(event.payload, "seedId");
    const record: HarvestRecord = {
      id: stringValue(event.payload, "harvestId") ?? `harvest_${event.id}`,
      missionId,
      parcelId,
      title: stringValue(event.payload, "title") ?? missionId,
      createdAt: event.timestamp,
      preview: stringValue(event.payload, "preview") ?? "",
      ...(seedId ? { seedId } : {}),
    };
    this.garden.addHarvest(record);
  }
}
