/**
 * Octopus Engine — exports publics V1
 *
 * Le moteur expose des contrats d'exécution neutres. Les exports Garden
 * restent temporairement disponibles comme pont de compatibilité pendant
 * leur migration vers Poulpe Fiction ; ils seront retirés après validation
 * du nouveau propriétaire du domaine.
 */

export type {
  UserIntent,
  Capability,
  ModuleStatus,
  ModuleTask,
  WorkflowStep,
  WorkflowDefinition,
  MissionDefinition,
  StepResult,
  CoordinatorResult,
  PlanResult,
} from "./types.js";

export { Guardian } from "./guardian.js";
export { Coordinator } from "./coordinator.js";
export { defineModule } from "./module-task.js";

export type {
  ExecutionContext,
  ExecutionAuthorizationPolicy,
  ExecutionRequest,
  ExecutionArtifact,
  ExecutionResult,
} from "./execution-contract.js";

/** @deprecated Garden belongs to Poulpe Fiction. Kept temporarily for compatibility. */
export type {
  ParcelStatus,
  ResourceKind,
  GardenerDecision,
  ParcelSnapshot,
  ResourceNeed,
  ParcelReport,
  GardenReport,
} from "./gardener.js";
/** @deprecated Garden belongs to Poulpe Fiction. Kept temporarily for compatibility. */
export { GardenerConsole } from "./gardener.js";

export type {
  TentacleTheme,
  TentacleHealth,
  TentacleMutation,
  TentacleResource,
  TentacleProfile,
  TentacleSelectionInput,
  TentacleSelection,
} from "./tentacle.js";
export { TentacleRegistry } from "./tentacle.js";

export type {
  OctopusDaypart,
  RhythmActivityKind,
  RhythmContext,
  RhythmActivity,
  RhythmPlan,
} from "./rhythm.js";
export { OctopusRhythm, resolveDaypart } from "./rhythm.js";

export type {
  PolicyDecision,
  ResourcePolicyRule,
  PolicyCheckInput,
  PolicyCheckResult,
} from "./policy.js";
export { PolicyManager } from "./policy.js";

export type {
  ResourceStatus,
  ResourceRequest,
  ResourceResult,
  OctopusResource,
  ResourceManagerReport,
} from "./resource-manager.js";
export { ResourceManager } from "./resource-manager.js";

export type { MistralResourceOptions } from "./resources/mistral-resource.js";
export { MistralResource } from "./resources/mistral-resource.js";

export type {
  MissionStatus,
  RuntimeMissionInput,
  RuntimeMissionResult,
} from "./mission-runtime.js";
export { MissionRuntime } from "./mission-runtime.js";

export type { OctopusEventType, OctopusEvent, EventHandler } from "./event-bus.js";
export { EventBus } from "./event-bus.js";

/** @deprecated Garden domain belongs to Poulpe Fiction. */
export type {
  SeedKind,
  SeedStatus,
  CapabilityStability,
  GuardianReaction,
  SeedSignals,
  SeedRecord,
  SproutRecord,
  CompostEntry,
  CapabilityMetrics,
  CapabilityRecord,
  EvaluationFinding,
  EvaluationRecord,
} from "./garden-domain.js";

/** @deprecated Garden domain belongs to Poulpe Fiction. */
export type { ResonanceThresholds, ResonanceResult } from "./resonance-engine.js";
/** @deprecated Garden domain belongs to Poulpe Fiction. */
export { ResonanceEngine } from "./resonance-engine.js";
/** @deprecated Garden domain belongs to Poulpe Fiction. */
export type { EvaluateSeedResonanceCommand } from "./seed-resonance-command.js";
/** @deprecated Garden domain belongs to Poulpe Fiction. */
export { SeedResonanceCommandHandler } from "./seed-resonance-command.js";
/** @deprecated Garden domain belongs to Poulpe Fiction. */
export type { CreateSproutCommand } from "./create-sprout-command.js";
/** @deprecated Garden domain belongs to Poulpe Fiction. */
export { CreateSproutCommandHandler } from "./create-sprout-command.js";

/** @deprecated Garden domain belongs to Poulpe Fiction. */
export type {
  MissionRecord,
  ResourceUsageRecord,
  HarvestRecord,
  GardenState,
} from "./garden-store.js";
/** @deprecated Garden domain belongs to Poulpe Fiction. */
export { GardenStore, createDemoGardenStore } from "./garden-store.js";
/** @deprecated Garden domain belongs to Poulpe Fiction. */
export { GardenProjector } from "./garden-projector.js";

export type { OctopusStartResult } from "./octopus.js";
export { OctopusEngine } from "./octopus.js";
