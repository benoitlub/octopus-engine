import { EventBus } from "./event-bus.js";
import { TentacleRegistry } from "./tentacle.js";
import { PolicyManager } from "./policy.js";
import { ResourceManager } from "./resource-manager.js";
import { MissionRuntime, type RuntimeMissionResult } from "./mission-runtime.js";

export interface OctopusStartResult {
  brief: string;
  resources: Awaited<ReturnType<ResourceManager["inspect"]>>;
  mission?: RuntimeMissionResult;
}

/**
 * Octopus Engine starts neutral: no domain tentacle, capability, Garden
 * concept or external resource is embedded in the core. Applications
 * (Poulpe Fiction, Publisher, games...) register their own adapters and
 * executors outside this package. See ADR-0008.
 */
export class OctopusEngine {
  readonly events = new EventBus();
  readonly tentacles: TentacleRegistry;
  readonly resources: ResourceManager;
  readonly runtime: MissionRuntime;

  constructor() {
    this.tentacles = new TentacleRegistry([]);
    this.resources = new ResourceManager([], new PolicyManager([]));
    this.runtime = new MissionRuntime(this.tentacles, this.resources);
  }

  async start(): Promise<OctopusStartResult> {
    await this.events.emit("OctopusStarted");
    const resources = await this.resources.inspect();

    return {
      resources,
      brief: this.formatBrief(),
    };
  }

  private formatBrief(): string {
    return [
      "🐙 Octopus Engine",
      "Moteur d'exécution neutre, en ligne.",
      "Exécuteurs : aucun adaptateur externe enregistré.",
    ].join("\n");
  }
}
