import type { ExecutionContext, ExecutionResult } from "./execution-contract.js";
import type { ParcelSnapshot } from "./gardener.js";
import type { TentacleRegistry, TentacleTheme } from "./tentacle.js";
import type { ResourceManager, ResourceResult } from "./resource-manager.js";
import type { ExecutionArtifact } from "./execution-contract.js";

export type MissionStatus = "completed" | "waiting-authorization" | "failed";

export interface RuntimeMissionInput {
  id: string;
  title: string;
  objective: string;
  context?: ExecutionContext;
  /** @deprecated Compatibility bridge while Garden ownership moves to Poulpe Fiction. */
  parcel?: ParcelSnapshot;
  requiredCapabilities: string[];
  preferredTheme?: TentacleTheme;
  prompt?: string;
  authorizedResources?: string[];
}

export interface RuntimeMissionResult extends ExecutionResult {
  missionId: string;
  status: MissionStatus;
  contextId: string;
  /** @deprecated Compatibility alias for existing Garden clients. */
  parcelId?: string;
  tentacleId?: string;
  resourceResult?: ResourceResult;
}

function resolveContext(input: RuntimeMissionInput): ExecutionContext {
  if (input.context) return input.context;
  if (input.parcel) {
    return {
      id: input.parcel.id,
      label: input.parcel.name,
      objective: input.parcel.objective,
      metadata: { legacySource: "parcel" },
    };
  }
  return { id: "default", label: "Default execution context" };
}

function defaultPrompt(input: RuntimeMissionInput, context: ExecutionContext): string {
  return [
    `Mission: ${input.title}`,
    `Objective: ${input.objective}`,
    context.label ? `Context: ${context.label}` : "",
    context.objective ? `Context objective: ${context.objective}` : "",
    "Return a concrete, useful action plan with a first mission output.",
  ].filter(Boolean).join("\n");
}

function expectedHarvests(context: ExecutionContext): string[] {
  const value = context.metadata?.expectedHarvests;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function outputText(output: Record<string, unknown>): string {
  const value = output.text ?? output.content ?? output.result;
  if (typeof value === "string") return value;
  try { return JSON.stringify(output); } catch (_) { return ""; }
}

function structuredArtifacts(input: RuntimeMissionInput, context: ExecutionContext, output: Record<string, unknown>): ExecutionArtifact[] {
  const requested = expectedHarvests(context);
  if (!requested.includes("landing-page")) return [];
  const text = outputText(output);
  if (!text.trim()) return [];

  return [{
    id: `landing_${input.id}`,
    kind: "landing-page",
    title: context.metadata?.seedId === "terra" ? "Landing page TERRA" : input.title,
    content: { text },
    metadata: {
      source: "octopus-runtime",
      contextId: context.id,
      operationId: input.id,
    },
  }];
}

export class MissionRuntime {
  constructor(
    private readonly tentacles: TentacleRegistry,
    private readonly resources: ResourceManager,
  ) {}

  async run(input: RuntimeMissionInput): Promise<RuntimeMissionResult> {
    const context = resolveContext(input);
    const parcelId = input.parcel?.id;
    const selection = this.tentacles.select({
      requiredCapabilities: input.requiredCapabilities,
      preferredTheme: input.preferredTheme,
      allowLearningTentacles: true,
    });

    if (!selection.tentacle) {
      return {
        operationId: input.id,
        missionId: input.id,
        status: "failed",
        contextId: context.id,
        parcelId,
        summary: selection.reason,
        output: {},
      };
    }

    const resource = selection.tentacle.resources.find((candidate) =>
      candidate.capabilityIds.some((capabilityId) => input.requiredCapabilities.includes(capabilityId)),
    );

    if (!resource) {
      return {
        operationId: input.id,
        missionId: input.id,
        status: "failed",
        contextId: context.id,
        parcelId,
        tentacleId: selection.tentacle.id,
        executorId: selection.tentacle.id,
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
        title: input.title,
        objective: input.objective,
        system: "You are a resource used by Octopus Engine. Produce concise, actionable output in French when the prompt is French. Do not expose internal runtime mechanics to clients.",
        prompt: input.prompt ?? defaultPrompt(input, context),
      },
    });

    if (resourceResult.status === "authorization-required") {
      return {
        operationId: input.id,
        missionId: input.id,
        status: "waiting-authorization",
        contextId: context.id,
        parcelId,
        tentacleId: selection.tentacle.id,
        executorId: selection.tentacle.id,
        summary: resourceResult.message ?? "Human authorization required.",
        resourceResult,
        output: resourceResult.output,
      };
    }

    if (resourceResult.status === "error") {
      return {
        operationId: input.id,
        missionId: input.id,
        status: "failed",
        contextId: context.id,
        parcelId,
        tentacleId: selection.tentacle.id,
        executorId: selection.tentacle.id,
        summary: resourceResult.message ?? "Resource execution failed.",
        resourceResult,
        output: resourceResult.output,
      };
    }

    const artifacts = structuredArtifacts(input, context, resourceResult.output);
    return {
      operationId: input.id,
      missionId: input.id,
      status: "completed",
      contextId: context.id,
      parcelId,
      tentacleId: selection.tentacle.id,
      executorId: selection.tentacle.id,
      summary: `Mission completed through ${selection.tentacle.name}.`,
      resourceResult,
      output: resourceResult.output,
      ...(artifacts.length ? { artifacts } : {}),
    };
  }
}
