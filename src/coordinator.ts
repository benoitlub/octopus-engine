import type { WorkflowDefinition, ModuleTask, CoordinatorResult } from "./types.js";

/**
 * Coordinator — runtime technique qui interprète un workflow déclaratif
 * et orchestre les modules (ADR-0006, Constitution Loi III).
 *
 * Invariants :
 * - Exécution séquentielle, déterministe.
 * - Chaque module reçoit uniquement sa tâche locale (Loi IV).
 * - Aucune logique métier spécifique à une application.
 * - Aucun LLM. Aucun appel réseau. Aucun effet de bord externe.
 * - N'invente jamais une mission, ne compose jamais un workflow.
 * - N'est jamais confondu avec le Conductor / Persona (ADR-0006).
 */
export class Coordinator {
  private readonly modules: Map<string, ModuleTask>;

  constructor(modules: ModuleTask[]) {
    this.modules = new Map(modules.map((m) => [m.id, m]));
  }

  /**
   * Interprète un workflow et orchestre ses modules séquentiellement.
   *
   * Chaque step reçoit : contexte accumulé ∪ input statique du step
   * (l'input statique gagne en cas de conflit — décision explicite).
   */
  async run(
    workflow: WorkflowDefinition,
    context: Record<string, unknown> = {},
  ): Promise<CoordinatorResult> {
    const steps: CoordinatorResult["steps"] = [];
    let accumulated: Record<string, unknown> = { ...context };

    for (const step of workflow.steps) {
      const mod = this.modules.get(step.moduleId);
      if (!mod) {
        throw new Error(`Module not found: ${step.moduleId}`);
      }

      const input: Record<string, unknown> = { ...accumulated, ...step.input };
      const output = await mod.execute(input);

      accumulated = { ...accumulated, ...output };
      steps.push({ moduleId: step.moduleId, status: "success", output });
    }

    return { workflowId: workflow.id, steps, output: accumulated };
  }
}
