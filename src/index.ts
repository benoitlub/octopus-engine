/**
 * Octopus Engine — exports publics V1
 *
 * Ce barrel exporte uniquement les contrats stables et les composants
 * runtime approuvés par la Constitution et les ADR.
 *
 * Les schémas futurs (Policy, Trace, RuntimeContext) seront ajoutés
 * dans une version mineure sans rupture de contrat (semver MINOR).
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
  ParcelStatus,
  ResourceKind,
  GardenerDecision,
  ParcelSnapshot,
  ResourceNeed,
  ParcelReport,
  GardenReport,
} from "./gardener.js";
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
