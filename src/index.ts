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
