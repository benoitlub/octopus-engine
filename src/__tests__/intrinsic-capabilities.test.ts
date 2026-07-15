import { describe, expect, it } from "vitest";
import {
  INTRINSIC_CAPABILITY_IDS,
  isIntrinsicCapability,
  listIntrinsicCapabilities,
} from "../intrinsic-capabilities.js";

describe("intrinsic capabilities", () => {
  it("defines the neutral engine vocabulary without domain capabilities", () => {
    expect(INTRINSIC_CAPABILITY_IDS).toEqual([
      "observation.receive",
      "mission.plan",
      "mission.route",
      "execution.track",
      "event.record",
      "permission.check",
      "resource.authorize",
    ]);

    expect(INTRINSIC_CAPABILITY_IDS).not.toContain("campaign.generate");
    expect(INTRINSIC_CAPABILITY_IDS).not.toContain("content.article.write");
    expect(INTRINSIC_CAPABILITY_IDS).not.toContain("signal.translate");
  });

  it("recognizes intrinsic ids and returns defensive catalog copies", () => {
    expect(isIntrinsicCapability("observation.receive")).toBe(true);
    expect(isIntrinsicCapability("observation.analyze")).toBe(false);

    const first = listIntrinsicCapabilities();
    const second = listIntrinsicCapabilities();
    first[0]!.description = "mutated";

    expect(second[0]!.description).not.toBe("mutated");
    expect(second.map((capability) => capability.id)).toEqual(INTRINSIC_CAPABILITY_IDS);
  });
});
