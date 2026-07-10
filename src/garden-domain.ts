export type SeedKind = "intent" | "idea" | "opportunity" | "weak-signal" | "request";
export type SeedStatus = "seed" | "resonating" | "sprouted" | "harvested" | "composted";
export type CapabilityStability = "experimental" | "stable" | "deprecated" | "isolated";
export type GuardianReaction = "observe" | "alert" | "limit" | "isolate" | "suspend" | "block";

export interface SeedSignals {
  maturity: number;
  coherence: number;
  utility: number;
  confidence: number;
  estimatedCost: number;
}

export interface SeedRecord {
  id: string;
  parcelId: string;
  kind: SeedKind;
  title: string;
  content: string;
  status: SeedStatus;
  createdAt: string;
  updatedAt: string;
  signals: SeedSignals;
  tags?: string[];
  source?: string;
}

export interface SproutRecord {
  id: string;
  seedId: string;
  parcelId: string;
  title: string;
  createdAt: string;
  rationale: string;
  proposedCapabilities: string[];
}

export interface CompostEntry {
  id: string;
  seedId: string;
  parcelId: string;
  reason: string;
  createdAt: string;
  reusableInsights: string[];
}

export interface CapabilityMetrics {
  executions: number;
  successes: number;
  failures: number;
  averageCost: number;
  averageDurationMs: number;
}

export interface CapabilityRecord {
  id: string;
  domain: string;
  capabilities: string[];
  connectors: string[];
  stability: CapabilityStability;
  limits: string[];
  permissions: string[];
  policyId?: string;
  metrics: CapabilityMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationFinding {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface EvaluationRecord {
  id: string;
  missionId: string;
  parcelId: string;
  capabilityId?: string;
  createdAt: string;
  reaction: GuardianReaction;
  score: number;
  findings: EvaluationFinding[];
}
