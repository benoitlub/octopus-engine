/**
 * Octopus Engine — Contrats minimaux V1
 *
 * Ces types constituent les schémas fondateurs levant le gel d'implémentation
 * documenté dans docs/implementation-freeze.md.
 *
 * Schémas couverts : Workflow, ModuleTask, Capability, UserIntent.
 * Schémas futurs : Policy, Trace, TraceEvent, RuntimeContext.
 */

/** Intention utilisateur transmise au Conductor / MissionPlanner. */
export interface UserIntent {
  text: string;
  workspaceId?: string;
  userId?: string;
  context?: Record<string, unknown>;
}

/**
 * Contrat versionné décrivant une action réalisable.
 * Indépendant du connecteur réel (Constitution Loi VI).
 */
export interface Capability {
  id: string;
  description: string;
}

/** Cycle de vie d'une exécution de module. */
export type ModuleStatus = "pending" | "running" | "success" | "error";

/**
 * Interface d'un module Octopus.
 *
 * Lois respectées :
 * - Loi IV : le module ignore les autres modules.
 * - Loi X  : le module peut être retiré sans casser le reste.
 */
export interface ModuleTask {
  id: string;
  name: string;
  requiredCapabilities: string[];
  execute(input: Record<string, unknown>): Promise<Record<string, unknown>>;
}

/**
 * Étape déclarative dans un workflow.
 * Le module ne reçoit que cette tâche locale — jamais le workflow complet.
 */
export interface WorkflowStep {
  moduleId: string;
  input: Record<string, unknown>;
}

/**
 * Partition déclarative, versionnée et rejouable (Constitution Loi III).
 * Ne vit pas dans le Coordinator — le Coordinator sait l'interpréter.
 */
export interface WorkflowDefinition {
  id: string;
  version: string;
  description: string;
  steps: WorkflowStep[];
}

/** Définition versionnée d'une mission reconnue par l'application. */
export interface MissionDefinition {
  id: string;
  version: string;
  description: string;
  requiredCapabilities: string[];
  workflowId: string;
  validateInput?: (intent: UserIntent) => void;
}

/** Résultat de l'exécution d'une étape par le Coordinator. */
export interface StepResult {
  moduleId: string;
  status: ModuleStatus;
  output: Record<string, unknown>;
}

/** Résultat complet d'une exécution de workflow par le Coordinator. */
export interface CoordinatorResult {
  workflowId: string;
  steps: StepResult[];
  output: Record<string, unknown>;
}

/** Résultat consolidé d'une mission (mission + workflow + output). */
export interface PlanResult {
  missionId: string;
  workflowId: string;
  result: Record<string, unknown>;
}
