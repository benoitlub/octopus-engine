import { describe, expect, it } from "vitest";
import { MissionRuntime } from "../mission-runtime.js";
import { ResourceManager, type OctopusResource, type ResourceRequest } from "../resource-manager.js";
import { TentacleRegistry } from "../tentacle.js";

function makeRuntime() {
  const resource: OctopusResource = {
    id: "mistral",
    name: "Mistral",
    async status() {
      return "available";
    },
    async execute(request: ResourceRequest) {
      return {
        resourceId: "mistral",
        status: "success",
        output: { text: String(request.input.prompt ?? "") },
      };
    },
  };

  const tentacles = new TentacleRegistry([{
    id: "marketing",
    name: "Marketing",
    theme: "marketing",
    health: "trained",
    capabilities: [{ id: "campaign.generate", description: "Generate a campaign" }],
    resources: [{
      id: "mistral",
      name: "Mistral",
      capabilityIds: ["campaign.generate"],
      reliability: 1,
      costLevel: "low",
      requiresAuthorization: false,
    }],
    missionCount: 1,
    successRate: 1,
    load: 0,
  }]);

  return new MissionRuntime(tentacles, new ResourceManager([resource]));
}

describe("MissionRuntime neutral execution contract", () => {
  it("executes from a neutral context without a parcel", async () => {
    const runtime = makeRuntime();
    const result = await runtime.run({
      id: "operation-1",
      title: "Prepare a landing page",
      objective: "Produce one usable artifact",
      context: {
        id: "product-1",
        label: "Product one",
        objective: "Present the product honestly",
        metadata: { owner: "poulpe-fiction" },
      },
      requiredCapabilities: ["campaign.generate"],
      preferredTheme: "marketing",
      authorizedResources: ["mistral"],
    });

    expect(result.status).toBe("completed");
    expect(result.operationId).toBe("operation-1");
    expect(result.contextId).toBe("product-1");
    expect(result.parcelId).toBeUndefined();
    expect(result.output.text).toContain("Context: Product one");
    expect(result.output.text).not.toContain("Parcel:");
  });

  it("keeps the parcel compatibility bridge for legacy callers", async () => {
    const runtime = makeRuntime();
    const result = await runtime.run({
      id: "legacy-operation",
      title: "Legacy mission",
      objective: "Keep old clients working",
      parcel: {
        id: "parcel-1",
        name: "Legacy parcel",
        kind: "project",
        objective: "Compatibility",
        status: "watch",
        signals: { freshness: 100, traction: 0, revenue: 0 },
        notes: [],
      },
      requiredCapabilities: ["campaign.generate"],
      preferredTheme: "marketing",
      authorizedResources: ["mistral"],
    });

    expect(result.status).toBe("completed");
    expect(result.operationId).toBe("legacy-operation");
    expect(result.contextId).toBe("parcel-1");
    expect(result.parcelId).toBe("parcel-1");
    expect(result.output.text).toContain("Context: Legacy parcel");
  });

  it("exposes a structured landing-page artifact when requested by context metadata", async () => {
    const runtime = makeRuntime();
    const result = await runtime.run({
      id: "terra-landing",
      title: "Créer la landing page TERRA",
      objective: "Produire un texte publiable",
      context: {
        id: "blacklace-ecosystem",
        label: "Écosystème Blacklace",
        metadata: {
          owner: "poulpe-fiction",
          seedId: "terra",
          expectedHarvests: ["landing-page", "instagram-visual"],
        },
      },
      requiredCapabilities: ["campaign.generate"],
      preferredTheme: "marketing",
      authorizedResources: ["mistral"],
    });

    expect(result.status).toBe("completed");
    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts?.[0]).toMatchObject({
      id: "landing_terra-landing",
      kind: "landing-page",
      title: "Landing page TERRA",
      content: { text: expect.stringContaining("Créer la landing page TERRA") },
    });
  });
});
