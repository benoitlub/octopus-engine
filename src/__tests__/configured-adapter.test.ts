import { describe, it, expect, vi } from "vitest";
import { AdapterRegistry } from "../adapter-registry.js";
import { configureAdapter, configuredAdapterFetch } from "../configured-adapter.js";

describe("configured execution adapter", () => {
  it("survives independent cold starts and executes through the service binding", async () => {
    const serviceFetch = vi.fn(async (request: Request) => {
      const body = await request.json() as any;
      expect(body.mission.requiredCapabilities).toEqual(["copy.generate"]);
      return Response.json({ status: "completed", output: { text: "actual producer result" } });
    });
    const env = { EXECUTION_ADAPTER: { fetch: serviceFetch }, EXECUTION_ADAPTER_ID: "producer",
      EXECUTION_ADAPTER_URL: "https://producer.example/execute", EXECUTION_ADAPTER_CAPABILITIES: "copy.generate,knowledge.search" };
    for (let coldStart = 0; coldStart < 2; coldStart++) {
      const registry = new AdapterRegistry();
      configureAdapter(registry, env);
      const adapter = registry.select(["copy.generate"])!;
      expect(adapter).toBeDefined();
      const result = await registry.execute(adapter, { operationId: "test", title: "Test", objective: "Text",
        requiredCapabilities: ["copy.generate"], authorizedResources: [], context: { id: "test" } }, configuredAdapterFetch(adapter, env));
      expect(result.status).toBe("completed");
      expect(result.output?.text).toBe("actual producer result");
    }
    expect(serviceFetch).toHaveBeenCalledTimes(2);
  });

  it("does not bootstrap incomplete configuration or grant a service binding to arbitrary registrations", () => {
    const registry = new AdapterRegistry();
    configureAdapter(registry, {});
    expect(registry.list()).toEqual([]);
    const adapter = registry.register({ id: "producer", name: "external", capabilities: ["copy.generate"], executeUrl: "https://other.example/execute" });
    expect(configuredAdapterFetch(adapter, { EXECUTION_ADAPTER: { fetch: vi.fn() }, EXECUTION_ADAPTER_ID: "producer", EXECUTION_ADAPTER_URL: "https://producer.example/execute" })).toBe(fetch);
  });
});
