import type { Capability } from "./types.js";

export const INTRINSIC_CAPABILITY_IDS = [
  "observation.receive",
  "mission.plan",
  "mission.route",
  "execution.track",
  "event.record",
  "permission.check",
  "resource.authorize",
] as const;

export type IntrinsicCapabilityId = (typeof INTRINSIC_CAPABILITY_IDS)[number];

export const INTRINSIC_CAPABILITIES: readonly Capability[] = Object.freeze([
  {
    id: "observation.receive",
    description: "Receive and validate a domain-neutral observation without interpreting its business meaning.",
  },
  {
    id: "mission.plan",
    description: "Build a neutral execution plan from an explicit objective and requested capabilities.",
  },
  {
    id: "mission.route",
    description: "Route a mission toward an intrinsic handler or a compatible external adapter.",
  },
  {
    id: "execution.track",
    description: "Track execution state and correlate operations without performing domain work.",
  },
  {
    id: "event.record",
    description: "Record a neutral engine event with identity, timestamp and payload metadata.",
  },
  {
    id: "permission.check",
    description: "Evaluate whether an explicitly requested operation is permitted by engine policy.",
  },
  {
    id: "resource.authorize",
    description: "Record and verify explicit authorization before an external resource may be used.",
  },
]);

const intrinsicIds = new Set<string>(INTRINSIC_CAPABILITY_IDS);

export function isIntrinsicCapability(value: string): value is IntrinsicCapabilityId {
  return intrinsicIds.has(value);
}

export function listIntrinsicCapabilities(): Capability[] {
  return INTRINSIC_CAPABILITIES.map((capability) => ({ ...capability }));
}
