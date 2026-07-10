import type { ParcelSnapshot, GardenReport } from "./gardener.js";
import type { OctopusEvent } from "./event-bus.js";
import type { ResourceUsage } from "./resource-manager.js";
import type {
  CapabilityRecord,
  CompostEntry,
  EvaluationRecord,
  SeedRecord,
  SproutRecord,
} from "./garden-domain.js";

export interface MissionRecord {
  id: string;
  parcelId: string;
  title: string;
  status: "queued" | "running" | "completed" | "failed" | "waiting-authorization";
  createdAt: string;
  updatedAt: string;
  output?: Record<string, unknown>;
}

export interface ResourceUsageRecord {
  id: string;
  missionId: string;
  parcelId: string;
  resourceId: string;
  status: string;
  createdAt: string;
  usage?: ResourceUsage;
}

export interface HarvestRecord {
  id: string;
  missionId: string;
  parcelId: string;
  seedId?: string;
  title: string;
  createdAt: string;
  preview: string;
}

export interface GardenState {
  parcels: ParcelSnapshot[];
  missions: MissionRecord[];
  events: OctopusEvent[];
  resourceUsage: ResourceUsageRecord[];
  harvests: HarvestRecord[];
  seeds: SeedRecord[];
  sprouts: SproutRecord[];
  compost: CompostEntry[];
  capabilities: CapabilityRecord[];
  evaluations: EvaluationRecord[];
  lastReport?: GardenReport;
}

export class GardenStore {
  private state: GardenState;

  constructor(initial?: Partial<GardenState>) {
    this.state = {
      parcels: initial?.parcels ?? [],
      missions: initial?.missions ?? [],
      events: initial?.events ?? [],
      resourceUsage: initial?.resourceUsage ?? [],
      harvests: initial?.harvests ?? [],
      seeds: initial?.seeds ?? [],
      sprouts: initial?.sprouts ?? [],
      compost: initial?.compost ?? [],
      capabilities: initial?.capabilities ?? [],
      evaluations: initial?.evaluations ?? [],
      lastReport: initial?.lastReport,
    };
  }

  getState(): GardenState {
    return {
      parcels: [...this.state.parcels],
      missions: [...this.state.missions],
      events: [...this.state.events],
      resourceUsage: [...this.state.resourceUsage],
      harvests: [...this.state.harvests],
      seeds: [...this.state.seeds],
      sprouts: [...this.state.sprouts],
      compost: [...this.state.compost],
      capabilities: [...this.state.capabilities],
      evaluations: [...this.state.evaluations],
      lastReport: this.state.lastReport,
    };
  }

  upsertParcel(parcel: ParcelSnapshot): void {
    const index = this.state.parcels.findIndex((item) => item.id === parcel.id);
    if (index >= 0) this.state.parcels[index] = parcel;
    else this.state.parcels.push(parcel);
  }

  setReport(report: GardenReport): void {
    this.state.lastReport = report;
  }

  addMission(record: MissionRecord): void {
    this.state.missions.push(record);
  }

  updateMission(id: string, patch: Partial<MissionRecord>): void {
    const mission = this.state.missions.find((item) => item.id === id);
    if (!mission) return;
    Object.assign(mission, patch, { updatedAt: new Date().toISOString() });
  }

  appendEvent(event: OctopusEvent): void {
    this.state.events.push(event);
  }

  addResourceUsage(record: ResourceUsageRecord): void {
    this.state.resourceUsage.push(record);
  }

  addHarvest(record: HarvestRecord): void {
    this.state.harvests.push(record);
    if (record.seedId) this.updateSeed(record.seedId, { status: "harvested" });
  }

  plantSeed(seed: SeedRecord): void {
    if (!this.state.parcels.some((parcel) => parcel.id === seed.parcelId)) {
      throw new Error(`Unknown parcel: ${seed.parcelId}`);
    }
    if (this.state.seeds.some((item) => item.id === seed.id)) {
      throw new Error(`Seed already exists: ${seed.id}`);
    }
    this.state.seeds.push(seed);
  }

  updateSeed(id: string, patch: Partial<SeedRecord>): void {
    const seed = this.state.seeds.find((item) => item.id === id);
    if (!seed) return;
    Object.assign(seed, patch, { updatedAt: new Date().toISOString() });
  }

  addSprout(sprout: SproutRecord): void {
    if (!this.state.seeds.some((seed) => seed.id === sprout.seedId)) {
      throw new Error(`Unknown seed: ${sprout.seedId}`);
    }
    this.state.sprouts.push(sprout);
    this.updateSeed(sprout.seedId, { status: "sprouted" });
  }

  compostSeed(entry: CompostEntry): void {
    if (!this.state.seeds.some((seed) => seed.id === entry.seedId)) {
      throw new Error(`Unknown seed: ${entry.seedId}`);
    }
    this.state.compost.push(entry);
    this.updateSeed(entry.seedId, { status: "composted" });
  }

  upsertCapability(capability: CapabilityRecord): void {
    const index = this.state.capabilities.findIndex((item) => item.id === capability.id);
    if (index >= 0) this.state.capabilities[index] = capability;
    else this.state.capabilities.push(capability);
  }

  addEvaluation(evaluation: EvaluationRecord): void {
    this.state.evaluations.push(evaluation);
    if (!evaluation.capabilityId) return;
    const capability = this.state.capabilities.find((item) => item.id === evaluation.capabilityId);
    if (!capability) return;
    if (evaluation.reaction === "isolate" || evaluation.reaction === "suspend" || evaluation.reaction === "block") {
      capability.stability = "isolated";
      capability.updatedAt = evaluation.createdAt;
    }
  }
}

export function createDemoGardenStore(): GardenStore {
  return new GardenStore({
    parcels: [
      {
        id: "yael",
        name: "Yael Bali",
        kind: "client",
        objective: "Obtenir 1 à 2 clients qualifiés par mois.",
        status: "watch",
        signals: { freshness: 30, traction: 15, revenue: 0 },
        notes: ["Facebook faible", "Besoin d'un canal prioritaire"],
      },
      {
        id: "kif-molla",
        name: "Kif & Molla",
        kind: "project",
        objective: "Relancer l'intérêt autour du livre et de l'univers.",
        status: "watch",
        signals: { freshness: 10, traction: 45, revenue: 0 },
        notes: ["Aucune campagne récente"],
      },
      {
        id: "publisher",
        name: "Publisher ancien",
        kind: "project",
        objective: "Réduire la dette et préserver les briques utiles.",
        status: "blocked",
        signals: { freshness: 5, traction: 5, revenue: 0 },
        notes: ["Interface à remplacer", "Backend à récupérer partiellement"],
      },
    ],
  });
}
