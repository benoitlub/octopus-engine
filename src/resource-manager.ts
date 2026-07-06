import { PolicyManager, type PolicyCheckResult } from "./policy.js";

export type ResourceStatus = "available" | "unavailable" | "needs-configuration";

export interface ResourceRequest {
  resourceId: string;
  missionId?: string;
  input: Record<string, unknown>;
  estimatedCost?: string;
  sensitive?: boolean;
  authorizedResources?: string[];
}

export interface ResourceResult {
  resourceId: string;
  status: "success" | "error" | "authorization-required";
  output: Record<string, unknown>;
  message?: string;
}

export interface OctopusResource {
  id: string;
  name: string;
  status(): Promise<ResourceStatus>;
  execute(request: ResourceRequest): Promise<ResourceResult>;
}

export interface ResourceManagerReport {
  resources: Array<{ id: string; name: string; status: ResourceStatus }>;
}

export class ResourceManager {
  private readonly resources: Map<string, OctopusResource>;
  private readonly policy: PolicyManager;

  constructor(resources: OctopusResource[], policy = new PolicyManager()) {
    this.resources = new Map(resources.map((resource) => [resource.id, resource]));
    this.policy = policy;
  }

  async inspect(): Promise<ResourceManagerReport> {
    const resources = [];
    for (const resource of this.resources.values()) {
      resources.push({ id: resource.id, name: resource.name, status: await resource.status() });
    }
    return { resources };
  }

  async execute(request: ResourceRequest): Promise<ResourceResult> {
    const resource = this.resources.get(request.resourceId);
    if (!resource) {
      return {
        resourceId: request.resourceId,
        status: "error",
        output: {},
        message: "Resource not registered.",
      };
    }

    const isAuthorized = request.authorizedResources?.includes(request.resourceId) ?? false;
    if (isAuthorized) return resource.execute(request);

    const policy: PolicyCheckResult = this.policy.check({
      resourceId: request.resourceId,
      missionId: request.missionId,
      estimatedCost: request.estimatedCost,
      sensitive: request.sensitive,
    });

    if (policy.decision === "deny") {
      return { resourceId: request.resourceId, status: "error", output: {}, message: policy.reason };
    }

    if (policy.decision === "ask") {
      return {
        resourceId: request.resourceId,
        status: "authorization-required",
        output: { policyReason: policy.reason },
        message: "Gardener authorization required.",
      };
    }

    return resource.execute(request);
  }
}
