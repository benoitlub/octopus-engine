import type { EventBus } from "./event-bus.js";
import type { SeedRecord, SproutRecord } from "./garden-domain.js";

export interface CreateSproutCommand {
  seed: SeedRecord;
  decision: "sprout";
  rationale?: string;
  proposedCapabilities?: string[];
}

export class CreateSproutCommandHandler {
  constructor(private readonly events: EventBus) {}

  async execute(command: CreateSproutCommand): Promise<SproutRecord> {
    if (command.seed.status !== "resonating") {
      throw new Error(`Seed ${command.seed.id} is not resonating.`);
    }

    const sprout: SproutRecord = {
      id: `sprout-${command.seed.id}`,
      seedId: command.seed.id,
      parcelId: command.seed.parcelId,
      title: command.seed.title,
      createdAt: new Date().toISOString(),
      rationale: command.rationale?.trim() || "Explicit sprout decision",
      proposedCapabilities: command.proposedCapabilities ?? [],
    };

    await this.events.emit("SproutCreated", { sprout });
    return sprout;
  }
}
