import type { Capability } from "./types.js";

export type TentacleTheme =
  | "marketing"
  | "edition"
  | "development"
  | "research"
  | "operations"
  | "custom";

export type TentacleHealth = "trained" | "watch" | "sick" | "learning" | "retired";
export type TentacleMutation = "add-resource" | "remove-resource" | "promote" | "downgrade" | "quarantine" | "retire";

export interface TentacleResource {
  id: string;
  name: string;
  capabilityIds: string[];
  reliability: number;
  costLevel: "free" | "low" | "medium" | "high";
  requiresAuthorization: boolean;
}

export interface TentacleProfile {
  id: string;
  name: string;
  theme: TentacleTheme;
  health: TentacleHealth;
  capabilities: Capability[];
  resources: TentacleResource[];
  missionCount: number;
  successRate: number;
  load: number;
  notes?: string[];
}

export interface TentacleSelectionInput {
  requiredCapabilities: string[];
  preferredTheme?: TentacleTheme;
  allowLearningTentacles?: boolean;
}

export interface TentacleSelection {
  tentacle: TentacleProfile | null;
  reason: string;
}

function hasCapabilities(tentacle: TentacleProfile, required: string[]): boolean {
  const ids = new Set(tentacle.capabilities.map((capability) => capability.id));
  return required.every((id) => ids.has(id));
}

function rankTentacle(tentacle: TentacleProfile): number {
  const healthScore: Record<TentacleHealth, number> = {
    trained: 40,
    learning: 20,
    watch: 10,
    sick: -30,
    retired: -100,
  };

  return healthScore[tentacle.health] + tentacle.successRate * 40 - tentacle.load * 20 + Math.min(tentacle.missionCount, 100) / 10;
}

export class TentacleRegistry {
  private readonly tentacles: TentacleProfile[];

  constructor(tentacles: TentacleProfile[]) {
    this.tentacles = tentacles;
  }

  list(): TentacleProfile[] {
    return [...this.tentacles];
  }

  select(input: TentacleSelectionInput): TentacleSelection {
    const candidates = this.tentacles
      .filter((tentacle) => tentacle.health !== "retired")
      .filter((tentacle) => input.allowLearningTentacles || tentacle.health !== "learning")
      .filter((tentacle) => !input.preferredTheme || tentacle.theme === input.preferredTheme)
      .filter((tentacle) => hasCapabilities(tentacle, input.requiredCapabilities))
      .sort((a, b) => rankTentacle(b) - rankTentacle(a));

    const tentacle = candidates[0] ?? null;
    if (!tentacle) {
      return {
        tentacle: null,
        reason: "No available tentacle exposes the required capabilities.",
      };
    }

    return {
      tentacle,
      reason: `Selected ${tentacle.name} because it matches the requested capabilities with health=${tentacle.health}, successRate=${tentacle.successRate}, load=${tentacle.load}.`,
    };
  }
}
