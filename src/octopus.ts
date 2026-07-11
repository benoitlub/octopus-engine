import { EventBus } from "./event-bus.js";
import { GardenStore, createDemoGardenStore, type GardenStore as GardenStoreType } from "./garden-store.js";
import { GardenProjector } from "./garden-projector.js";
import { GardenerConsole } from "./gardener.js";
import { TentacleRegistry, type TentacleProfile } from "./tentacle.js";
import { PolicyManager } from "./policy.js";
import { ResourceManager } from "./resource-manager.js";
import { MistralResource } from "./resources/mistral-resource.js";
import { MissionRuntime, type RuntimeMissionResult } from "./mission-runtime.js";
import { OctopusRhythm } from "./rhythm.js";

export interface OctopusStartResult {
  brief: string;
  resources: Awaited<ReturnType<ResourceManager["inspect"]>>;
  mission?: RuntimeMissionResult;
}

function createDefaultTentacles(): TentacleProfile[] {
  return [
    {
      id: "marketing",
      name: "Marketing Tentacle",
      theme: "marketing",
      health: "trained",
      capabilities: [
        { id: "campaign.generate", description: "Generate a campaign plan and first output." },
        { id: "copy.generate", description: "Generate concise marketing copy." },
      ],
      resources: [
        {
          id: "mistral",
          name: "Mistral AI",
          capabilityIds: ["campaign.generate", "copy.generate"],
          reliability: 0.92,
          costLevel: "low",
          requiresAuthorization: true,
        },
      ],
      missionCount: 12,
      successRate: 0.88,
      load: 0.2,
    },
  ];
}

export class OctopusEngine {
  readonly events = new EventBus();
  readonly garden: GardenStoreType;
  readonly gardenProjector: GardenProjector;
  readonly gardener = new GardenerConsole();
  readonly rhythm = new OctopusRhythm();
  readonly tentacles: TentacleRegistry;
  readonly resources: ResourceManager;
  readonly runtime: MissionRuntime;

  constructor(garden = createDemoGardenStore()) {
    this.garden = garden;
    this.gardenProjector = new GardenProjector(this.events, this.garden);
    this.gardenProjector.connect();
    this.tentacles = new TentacleRegistry(createDefaultTentacles());
    this.resources = new ResourceManager(
      [new MistralResource()],
      new PolicyManager([{ resourceId: "mistral", decision: "ask", reason: "Mistral requires gardener approval by default." }]),
    );
    this.runtime = new MissionRuntime(this.tentacles, this.resources);
  }

  async start(): Promise<OctopusStartResult> {
    await this.events.emit("OctopusStarted");
    const state = this.garden.getState();
    const report = this.gardener.inspect(state.parcels);
    this.garden.setReport(report);
    await this.events.emit("GardenInspected", { parcels: state.parcels.length, reports: report.reports.length });

    const resources = await this.resources.inspect();
    const rhythm = this.rhythm.plan({
      now: new Date(),
      parcels: state.parcels,
      tentacles: this.tentacles.list(),
      pendingAuthorizations: report.authorizationQueue.length,
    });

    const candidate = state.parcels.find((parcel) => parcel.status === "watch" || parcel.status === "blocked") ?? state.parcels[0];
    let mission: RuntimeMissionResult | undefined;

    if (candidate) {
      const missionId = `mission_${Date.now()}`;
      const title = `Prepare a useful campaign for ${candidate.name}`;
      await this.events.emit("MissionQueued", {
        missionId,
        parcelId: candidate.id,
        title,
        createdAt: new Date().toISOString(),
      });
      await this.events.emit("MissionStarted", { missionId, parcelId: candidate.id, title });

      mission = await this.runtime.run({
        id: missionId,
        title,
        objective: candidate.objective,
        parcel: candidate,
        preferredTheme: "marketing",
        requiredCapabilities: ["campaign.generate"],
      });

      if (mission.tentacleId) {
        await this.events.emit("TentacleSelected", { missionId, parcelId: candidate.id, tentacleId: mission.tentacleId });
      }
      if (mission.status === "waiting-authorization") {
        await this.events.emit("AuthorizationRequested", {
          missionId,
          parcelId: candidate.id,
          resourceId: mission.resourceResult?.resourceId ?? "mistral",
          output: mission.output,
        });
      } else if (mission.status === "completed") {
        await this.events.emit("MissionCompleted", { missionId, parcelId: candidate.id, output: mission.output });
      } else {
        await this.events.emit("MissionFailed", { missionId, parcelId: candidate.id, reason: mission.summary, output: mission.output });
      }
    }

    return {
      resources,
      mission,
      brief: this.formatBrief(state.parcels.length, report.authorizationQueue.length, rhythm.activities.length, mission),
    };
  }

  private formatBrief(parcelCount: number, authorizationCount: number, activityCount: number, mission?: RuntimeMissionResult): string {
    const lines = [
      "🐙 Octopus Engine",
      "Bonjour Benoît.",
      "",
      `Jardin : ${parcelCount} parcelle(s) observée(s).`,
      `Rythme : ${activityCount} activité(s) proposée(s).`,
      `Autorisations : ${authorizationCount} en attente avant mission.`,
    ];
    if (mission) {
      lines.push("", `Mission : ${mission.status}`, mission.summary);
    }
    return lines.join("\n");
  }
}
