import type { Capability } from "./types.js";

/**
 * Guardian — système immunitaire du runtime (ADR-0005).
 *
 * V1 implémente le niveau 3 : Limiter.
 * Valide que les capabilities requises sont disponibles avant
 * d'autoriser la dispatch d'une mission.
 *
 * Niveaux futurs (V2+) :
 *   1. Observer   — surveillance passive
 *   2. Alerter    — notification Coordinator / Conductor
 *   3. Limiter    — validation capabilities [IMPLÉMENTÉ]
 *   4. Isoler     — désactivation temporaire d'un module
 *   5. Suspendre  — mise en pause d'une mission
 *   6. Bloquer    — arrêt immédiat en cas de risque critique
 *
 * Invariants (Constitution Loi XIV) :
 * - Ne définit jamais les objectifs métier.
 * - Ne se substitue jamais au Coordinator.
 * - Agit de manière proportionnée au niveau de risque.
 */
export class Guardian {
  private readonly registry: Map<string, Capability>;

  constructor(capabilities: Capability[]) {
    this.registry = new Map(capabilities.map((c) => [c.id, c]));
  }

  /**
   * Niveau 3 — Limiter.
   * Lève `Error("Capability missing: <id>")` pour la première
   * capability requise absente du registre.
   */
  validate(requiredCapabilities: string[]): void {
    for (const capId of requiredCapabilities) {
      if (!this.registry.has(capId)) {
        throw new Error(`Capability missing: ${capId}`);
      }
    }
  }

  /** Retourne true si la capability est enregistrée. */
  has(capId: string): boolean {
    return this.registry.has(capId);
  }

  /** Liste toutes les capabilities enregistrées. */
  list(): Capability[] {
    return Array.from(this.registry.values());
  }
}
