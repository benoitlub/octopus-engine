export type PolicyDecision = "allow" | "ask" | "deny";

export interface ResourcePolicyRule {
  resourceId: string;
  decision: PolicyDecision;
  reason: string;
}

export interface PolicyCheckInput {
  resourceId: string;
  missionId?: string;
  estimatedCost?: string;
  sensitive?: boolean;
}

export interface PolicyCheckResult {
  decision: PolicyDecision;
  reason: string;
}

export class PolicyManager {
  private readonly rules: Map<string, ResourcePolicyRule>;

  constructor(rules: ResourcePolicyRule[] = []) {
    this.rules = new Map(rules.map((rule) => [rule.resourceId, rule]));
  }

  check(input: PolicyCheckInput): PolicyCheckResult {
    const rule = this.rules.get(input.resourceId);
    if (rule) return { decision: rule.decision, reason: rule.reason };

    if (input.sensitive) {
      return { decision: "ask", reason: "Sensitive resource use requires gardener approval." };
    }

    if (input.estimatedCost && input.estimatedCost !== "free") {
      return { decision: "ask", reason: "Non-free resource use requires gardener approval by default." };
    }

    return { decision: "allow", reason: "No blocking policy matched." };
  }
}
