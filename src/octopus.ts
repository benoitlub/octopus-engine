import { EventBus } from "./event-bus.js";
import { TentacleRegistry, type TentacleProfile } from "./tentacle.js";
import { PolicyManager, type ResourcePolicyRule } from "./policy.js";
import { ResourceManager } from "./resource-manager.js";
import { MissionRuntime, type RuntimeMissionResult } from "./mission-runtime.js";
import { MistralResource } from "./resources/mistral-resource.js";

export interface OctopusStartResult {
  brief: string;
  resources: Awaited<ReturnType<ResourceManager["inspect"]>>;
  mission?: RuntimeMissionResult;
}

const CORE_CAPABILITY_IDS = [
  "knowledge.search",
  "copy.generate",
  "content.article.write",
  "content.social.write",
  "landing.generate",
];

function buildCoreTentacle(): TentacleProfile {
  return {
    id: "octopus-core",
    name: "Octopus Core (Mistral)",
    theme: "custom",
    health: "trained",
    capabilities: CORE_CAPABILITY_IDS.map((id) => ({ id, description: `Capacité générique portée par le cœur d'Octopus (${id}).` })),
    resources: [{
      id: "mistral",
      name: "Mistral AI",
      capabilityIds: CORE_CAPABILITY_IDS,
      reliability: 80,
      costLevel: "low",
      requiresAuthorization: false,
    }],
    missionCount: 0,
    successRate: 100,
    load: 0,
  };
}

const CORE_POLICY_RULES: ResourcePolicyRule[] = [
  { resourceId: "mistral", decision: "allow", reason: "Ressource Mistral du cœur, pré-autorisée pour la génération de texte standard." },
];

/**
 * Octopus Engine starts with a single generic Mistral-backed tentacle as its
 * only built-in capability, used when no external adapter (Poulpe Fiction,
 * Publisher, games...) already covers the required capabilities. Domain
 * knowledge, Garden concepts and app-specific logic remain outside the core.
 * See ADR-0008.
 */
export class OctopusEngine {
  readonly events = new EventBus();
  readonly tentacles: TentacleRegistry;
  readonly resources: ResourceManager;
  readonly runtime: MissionRuntime;

  constructor() {
    this.tentacles = new TentacleRegistry([buildCoreTentacle()]);
    this.resources = new ResourceManager([new MistralResource()], new PolicyManager(CORE_POLICY_RULES));
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
      "Ressource propre : Mistral AI (génération de texte générique).",
    ].join("\n");
  }
}
