export type ParcelStatus = "healthy" | "watch" | "blocked" | "abandon";
export type ResourceKind = "memory" | "garden" | "mistral" | "notion" | "web" | "connector";
export type GardenerDecision = "optimize" | "improve" | "pause" | "abandon" | "needs-authorization";

export interface ParcelSnapshot {
  id: string;
  name: string;
  kind: "client" | "project" | "product" | "world";
  objective: string;
  status: ParcelStatus;
  lastActivity?: string;
  signals?: Record<string, number | string | boolean>;
  notes?: string[];
}

export interface ResourceNeed {
  resource: ResourceKind;
  reason: string;
  requiresAuthorization: boolean;
  estimatedValue: "low" | "medium" | "high";
  estimatedCost?: string;
}

export interface ParcelReport {
  parcelId: string;
  summary: string;
  decision: GardenerDecision;
  nextAction: string;
  resourceNeeds: ResourceNeed[];
}

export interface GardenReport {
  generatedAt: string;
  reports: ParcelReport[];
  authorizationQueue: ResourceNeed[];
}

function score(parcel: ParcelSnapshot, key: string): number {
  const value = parcel.signals?.[key];
  return typeof value === "number" ? value : 0;
}

export class GardenerConsole {
  inspect(parcels: ParcelSnapshot[], now = new Date()): GardenReport {
    const reports = parcels.map((parcel) => this.inspectParcel(parcel));
    return {
      generatedAt: now.toISOString(),
      reports,
      authorizationQueue: reports.flatMap((report) =>
        report.resourceNeeds.filter((need) => need.requiresAuthorization),
      ),
    };
  }

  inspectParcel(parcel: ParcelSnapshot): ParcelReport {
    const traction = score(parcel, "traction");
    const freshness = score(parcel, "freshness");
    const revenue = score(parcel, "revenue");

    if (parcel.status === "abandon") {
      return {
        parcelId: parcel.id,
        summary: `${parcel.name} is marked as a possible abandon/pause parcel.`,
        decision: "abandon",
        nextAction: "Ask the gardener to confirm pause, abandon, or rescue.",
        resourceNeeds: [],
      };
    }

    if (parcel.status === "blocked" || freshness < 25) {
      return {
        parcelId: parcel.id,
        summary: `${parcel.name} needs a short diagnosis before more work is added.`,
        decision: "needs-authorization",
        nextAction: "Prepare a small diagnostic mission before any campaign work.",
        resourceNeeds: [
          {
            resource: "mistral",
            reason: "Improve diagnosis and shape a useful first mission.",
            requiresAuthorization: true,
            estimatedValue: "high",
            estimatedCost: "low-token diagnostic",
          },
        ],
      };
    }

    if (traction >= 60 || revenue > 0) {
      return {
        parcelId: parcel.id,
        summary: `${parcel.name} has useful signals. Optimize before rebuilding.`,
        decision: "optimize",
        nextAction: "Create an optimization mission on the best existing channel.",
        resourceNeeds: [
          {
            resource: "memory",
            reason: "Read previous results before acting.",
            requiresAuthorization: false,
            estimatedValue: "medium",
          },
        ],
      };
    }

    return {
      parcelId: parcel.id,
      summary: `${parcel.name} can be improved without emergency rebuild.`,
      decision: "improve",
      nextAction: "Create a simple mission: clarify offer, priority channel, first output.",
      resourceNeeds: [
        {
          resource: "garden",
          reason: "Compare this parcel with the rest of the garden before prioritizing.",
          requiresAuthorization: false,
          estimatedValue: "medium",
        },
      ],
    };
  }
}
