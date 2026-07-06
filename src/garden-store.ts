import type { ParcelSnapshot, GardenReport } from "./gardener.js";
import type { OctopusEvent } from "./event-bus.js";

export interface MissionRecord {
  id: string;
  parcelId: string;
  title: string;
  status: "queued" | "running" | "completed" | "failed" | "waiting-authorization";
  createdAt: string;
  updatedAt: string;
  output?: Record<string, unknown>;
}

export interface GardenState {
  parcels: ParcelSnapshot[];
  missions: MissionRecord[];
  events: OctopusEvent[];
  lastReport?: GardenReport;
}

export class GardenStore {
  private state: GardenState;

  constructor(initial?: Partial<GardenState>) {
    this.state = {
      parcels: initial?.parcels ?? [],
      missions: initial?.missions ?? [],
      events: initial?.events ?? [],
      lastReport: initial?.lastReport,
    };
  }

  getState(): GardenState {
    return {
      parcels: [...this.state.parcels],
      missions: [...this.state.missions],
      events: [...this.state.events],
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
