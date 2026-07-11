import type { EventBus } from "./event-bus.js";
import type { SeedRecord } from "./garden-domain.js";
import { ResonanceEngine, type ResonanceResult } from "./resonance-engine.js";

export interface EvaluateSeedResonanceCommand {
  seed: SeedRecord;
  proposedCapabilities?: string[];
}

export class SeedResonanceCommandHandler {
  constructor(
    private readonly events: EventBus,
    private readonly resonance = new ResonanceEngine(),
  ) {}

  async execute(command: EvaluateSeedResonanceCommand): Promise<ResonanceResult> {
    const proposedCapabilities = command.proposedCapabilities ?? [];
    const result = this.resonance.evaluate(command.seed, proposedCapabilities);

    await this.events.emit("SeedResonanceEvaluated", {
      seedId: command.seed.id,
      parcelId: command.seed.parcelId,
      signals: command.seed.signals,
      status: "resonating",
      score: result.score,
      decision: result.decision,
      reasons: result.reasons,
      proposedCapabilities,
    });

    return result;
  }
}
