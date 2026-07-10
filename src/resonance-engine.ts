import type { SeedRecord, SeedSignals, SproutRecord } from "./garden-domain.js";

export interface ResonanceThresholds {
  sproutScore: number;
  compostScore: number;
  maxEstimatedCost: number;
}

export interface ResonanceResult {
  score: number;
  decision: "keep" | "resonate" | "sprout" | "compost";
  reasons: string[];
  sprout?: SproutRecord;
}

const DEFAULT_THRESHOLDS: ResonanceThresholds = {
  sproutScore: 70,
  compostScore: 25,
  maxEstimatedCost: 1,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export class ResonanceEngine {
  constructor(private readonly thresholds: ResonanceThresholds = DEFAULT_THRESHOLDS) {}

  score(signals: SeedSignals): number {
    const costPenalty = Math.min(30, (signals.estimatedCost / Math.max(this.thresholds.maxEstimatedCost, 0.01)) * 30);
    return clamp(
      signals.maturity * 0.25 +
        signals.coherence * 0.25 +
        signals.utility * 0.3 +
        signals.confidence * 0.2 -
        costPenalty,
    );
  }

  evaluate(seed: SeedRecord, proposedCapabilities: string[] = []): ResonanceResult {
    const score = this.score(seed.signals);
    const reasons: string[] = [];

    if (seed.signals.confidence < 40) reasons.push("Confiance insuffisante");
    if (seed.signals.coherence < 40) reasons.push("Cohérence trop faible");
    if (seed.signals.utility >= 70) reasons.push("Utilité élevée");
    if (seed.signals.maturity >= 70) reasons.push("Maturité suffisante");
    if (seed.signals.estimatedCost > this.thresholds.maxEstimatedCost) reasons.push("Coût estimé au-dessus du seuil");

    if (score <= this.thresholds.compostScore) {
      return { score, decision: "compost", reasons };
    }

    if (score >= this.thresholds.sproutScore && seed.signals.confidence >= 50) {
      return {
        score,
        decision: "sprout",
        reasons,
        sprout: {
          id: `sprout-${seed.id}`,
          seedId: seed.id,
          parcelId: seed.parcelId,
          title: seed.title,
          createdAt: new Date().toISOString(),
          rationale: reasons.join(" · ") || "Résonance suffisante",
          proposedCapabilities,
        },
      };
    }

    return {
      score,
      decision: score >= 45 ? "resonate" : "keep",
      reasons,
    };
  }
}
