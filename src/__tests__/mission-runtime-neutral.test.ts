import { afterEach, describe, expect, it, vi } from "vitest";
import { MissionRuntime } from "../mission-runtime.js";
import { OctopusEngine } from "../octopus.js";
import { ResourceManager, type OctopusResource, type ResourceRequest } from "../resource-manager.js";
import { TentacleRegistry } from "../tentacle.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

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

  it("routes copy.generate through Publisher and returns a completed Markdown artifact", async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: "completed",
        artifact: {
          title: "Récolte Yael",
          content: "# Récolte Yael\n\nUn Markdown exploitable.",
          mimeType: "text/markdown",
          metadata: { provider: "mistral", model: "mistral-large-latest", status: "completed" },
        },
      }),
    } as Response));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const engine = new OctopusEngine();
    const result = await engine.runtime.run({
      id: "yael-copy",
      title: "Récolte Yael",
      objective: "Produire une récolte exploitable pour Yael.",
      context: {
        id: "yael-bali",
        label: "Yael Bali",
        metadata: { seedId: "yael", expectedHarvests: ["landing-page"] },
      },
      requiredCapabilities: ["copy.generate"],
      preferredTheme: "marketing",
      prompt: "Trouve un prospect intéressant pour Yael.",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://blacklace-publisher-api.onrender.com/api/production/execute",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("copy.generate"),
      }),
    );
    expect(result.status).toBe("completed");
    expect(result.resourceResult?.resourceId).toBe("publisher");
    expect(result.output.text).toContain("# Récolte Yael");
    expect(result.output.artifacts).toEqual([
      expect.objectContaining({
        artifactType: "markdown",
        mimeType: "text/markdown",
        status: "completed",
      }),
    ]);
    expect(result.artifacts?.[0]).toMatchObject({
      kind: "landing-page",
      content: { text: expect.stringContaining("# Récolte Yael") },
    });
  });
});
