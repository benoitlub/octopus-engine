import type { ParcelSnapshot } from "./gardener.js";
import type { TentacleRegistry, TentacleTheme } from "./tentacle.js";
import type { ResourceManager, ResourceResult } from "./resource-manager.js";

export type MissionStatus = "completed" | "waiting-authorization" | "failed";

export interface RuntimeMissionInput {
  id: string;
  title: string;
  objective: string;
  parcel: ParcelSnapshot;
  requiredCapabilities: string[];
  preferredTheme?: TentacleTheme;
  prompt?: string;
  authorizedResources?: string[];
}

export interface RuntimeMissionResult {
  missionId: string;
  status: MissionStatus;
  parcelId: string;
  tentacleId?: string;
  summary: string;
  resourceResult?: ResourceResult;
  output: Record<string, unknown>;
}

function defaultPrompt(input: RuntimeMissionInput): string {
  return [
    `Mission: ${input.title}`,
    `Objective: ${input.objective}`,
    `Parcel: ${input.parcel.name}`,
    `Parcel objective: ${input.parcel.objective}`,
    "Return a concrete, useful action plan with a first mission output.",
  ].join("\n");
}

export class MissionRuntime {
  constructor(
    private readonly tentacles: TentacleRegistry,
    private readonly resources: ResourceManager,
  ) {}

  async run(input: RuntimeMissionInput): Promise<RuntimeMissionResult> {
    const selection = this.tentacles.select({
      requiredCapabilities: input.requiredCapabilities,
      preferredTheme: input.preferredTheme,
      allowLearningTentacles: true,
    });

    if (!selection.tentacle) {
      return {
        missionId: input.id,
        status: "failed",
        parcelId: input.parcel.id,
        summary: selection.reason,
        output: {},
      };
    }

    const resource = selection.tentacle.resources.find((candidate) =>
      candidate.capabilityIds.some((capabilityId) => input.requiredCapabilities.includes(capabilityId)),
    );

    if (!resource) {
      return {
        missionId: input.id,
        status: "failed",
        parcelId: input.parcel.id,
        tentacleId: selection.tentacle.id,
        summary: "Selected tentacle has no resource matching the required capabilities.",
        output: {},
      };
    }

    const resourceResult = await this.resources.execute({
      resourceId: resource.id,
      missionId: input.id,
      estimatedCost: resource.costLevel,
      sensitive: resource.requiresAuthorization,
      authorizedResources: input.authorizedResources,
      input: {
        system: "You are a resource used by Octopus Engine. Produce concise, actionable output in French when the prompt is French. Never expose internal garden mechanics to clients.",
        prompt: input.prompt ?? defaultPrompt(input),
      },
    });

    if (resourceResult.status === "authorization-required") {
      return {
        missionId: input.id,
        status: "waiting-authorization",
        parcelId: input.parcel.id,
        tentacleId: selection.tentacle.id,
        summary: resourceResult.message ?? "Gardener authorization required.",
        resourceResult,
        output: resourceResult.output,
      };
    }

    if (resourceResult.status === "error") {
      return {
        missionId: input.id,
        status: "failed",
        parcelId: input.parcel.id,
        tentacleId: selection.tentacle.id,
        summary: resourceResult.message ?? "Resource execution failed.",
        resourceResult,
        output: resourceResult.output,
      };
    }

    return {
      missionId: input.id,
      status: "completed",
      parcelId: input.parcel.id,
      tentacleId: selection.tentacle.id,
      summary: `Mission completed through ${selection.tentacle.name}.`,
      resourceResult,
      output: resourceResult.output,
    };
  }
}
