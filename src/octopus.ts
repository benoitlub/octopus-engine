import { EventBus } from "./event-bus.js";
import { GardenStore, createDemoGardenStore, type GardenStore as GardenStoreType } from "./garden-store.js";
import { GardenProjector } from "./garden-projector.js";
import { GardenerConsole } from "./gardener.js";
import { TentacleRegistry } from "./tentacle.js";
import { PolicyManager } from "./policy.js";
import { ResourceManager } from "./resource-manager.js";
import { MissionRuntime, type RuntimeMissionResult } from "./mission-runtime.js";
import { OctopusRhythm } from "./rhythm.js";

export interface OctopusStartResult {
  brief: string;
  resources: Awaited<ReturnType<ResourceManager["inspect"]>>;
  mission?: RuntimeMissionResult;
}

/**
 * Octopus Engine starts neutral: no domain tentacle, capability or external
 * resource is embedded in the core. Applications register their own adapters
 * and executors outside this package.
 */
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
    this.tentacles = new TentacleRegistry([]);
    this.resources = new ResourceManager([], new PolicyManager([]));
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

    return {
      resources,
      brief: this.formatBrief(state.parcels.length, report.authorizationQueue.length, rhythm.activities.length),
    };
  }

  private formatBrief(parcelCount: number, authorizationCount: number, activityCount: number): string {
    return [
      "🐙 Octopus Engine",
      "Bonjour Benoît.",
      "",
      `Jardin : ${parcelCount} parcelle(s) observée(s).`,
      `Rythme : ${activityCount} activité(s) proposée(s).`,
      `Autorisations : ${authorizationCount} en attente.`,
      "Exécuteurs : aucun adaptateur externe enregistré.",
    ].join("\n");
  }
}
