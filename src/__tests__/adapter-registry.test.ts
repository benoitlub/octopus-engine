import { describe, expect, it, vi } from "vitest";
import { AdapterRegistry } from "../adapter-registry.js";

describe("AdapterRegistry", () => {
  it("registers and selects an adapter by explicit capabilities", () => {
    const registry = new AdapterRegistry();
    registry.register({
      id: "spectrl",
      name: "SpecTRL adapter",
      capabilities: ["observation.analyze"],
      executeUrl: "https://example.test/execute",
    });

    expect(registry.select(["observation.analyze"])?.id).toBe("spectrl");
    expect(registry.select(["campaign.generate"])).toBeUndefined();
  });

  it("forwards a neutral mission to the selected adapter", async () => {
    const registry = new AdapterRegistry();
    const adapter = registry.register({
      id: "publisher",
      name: "Publisher adapter",
      capabilities: ["copy.generate"],
      executeUrl: "https://example.test/execute",
    });
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      status: "completed",
      summary: "done",
      output: { text: "hello" },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const result = await registry.execute(adapter, {
      operationId: "op-1",
      title: "Test",
      objective: "Test neutral execution",
      requiredCapabilities: ["copy.generate"],
      authorizedResources: [],
      context: { id: "ctx-1" },
    }, fetchImpl as unknown as typeof fetch);

    expect(result.status).toBe("completed");
    expect(result.output).toEqual({ text: "hello" });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
