import { AdapterRegistry, type AdapterRegistration } from "./adapter-registry.js";

export interface ConfiguredAdapterEnv {
  EXECUTION_ADAPTER?: { fetch(request: Request): Promise<Response> };
  EXECUTION_ADAPTER_ID?: string;
  EXECUTION_ADAPTER_URL?: string;
  EXECUTION_ADAPTER_CAPABILITIES?: string;
}

/** Rebuild deployment-owned registration in every new isolate. */
export function configureAdapter(registry: AdapterRegistry, env: ConfiguredAdapterEnv): void {
  if (!env.EXECUTION_ADAPTER || !env.EXECUTION_ADAPTER_ID || !env.EXECUTION_ADAPTER_URL) return;
  const capabilities = (env.EXECUTION_ADAPTER_CAPABILITIES ?? "").split(",").map(value => value.trim()).filter(Boolean);
  if (!capabilities.length) return;
  registry.register({ id: env.EXECUTION_ADAPTER_ID, name: env.EXECUTION_ADAPTER_ID,
    version: "deployment", executeUrl: env.EXECUTION_ADAPTER_URL, capabilities });
}

/** A public registration cannot redirect the deployment's service binding. */
export function configuredAdapterFetch(adapter: AdapterRegistration, env: ConfiguredAdapterEnv): typeof fetch {
  if (env.EXECUTION_ADAPTER && adapter.id === env.EXECUTION_ADAPTER_ID && adapter.executeUrl === env.EXECUTION_ADAPTER_URL) {
    const service = env.EXECUTION_ADAPTER;
    return ((input, init) => service.fetch(new Request(input, init))) as typeof fetch;
  }
  return fetch;
}
