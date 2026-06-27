import type { ModuleTask } from "./types.js";

export type { ModuleTask };

/**
 * Déclare un module avec typage strict.
 *
 * Chaque module est pur, sans état et testable indépendamment.
 * Il ignore l'existence des autres modules (Constitution Loi IV).
 * Aucun appel réseau, aucun LLM, aucun effet de bord externe
 * sauf déclaration explicite dans la documentation du module.
 */
export function defineModule(task: ModuleTask): ModuleTask {
  return task;
}
