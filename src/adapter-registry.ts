export interface AdapterRegistration {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  executeUrl: string;
  healthUrl?: string;
  metadata?: Record<string, unknown>;
  registeredAt: string;
  updatedAt: string;
}

export interface AdapterRegistrationInput {
  id: string;
  name: string;
  version?: string;
  capabilities: string[];
  executeUrl: string;
  healthUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ExternalMissionRequest {
  operationId: string;
  title: string;
  objective: string;
  requiredCapabilities: string[];
  authorizedResources: string[];
  prompt?: string;
  context: {
    id: string;
    label?: string;
    objective?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface ExternalMissionResult {
  operationId?: string;
  status: "completed" | "waiting-authorization" | "failed";
  summary: string;
  output?: Record<string, unknown>;
  artifacts?: unknown[];
}

function hasAllCapabilities(adapter: AdapterRegistration, required: string[]): boolean {
  const exposed = new Set(adapter.capabilities);
  return required.every((capability) => exposed.has(capability));
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export class AdapterRegistry {
  private readonly registrations = new Map<string, AdapterRegistration>();

  list(): AdapterRegistration[] {
    return [...this.registrations.values()].map((adapter) => ({ ...adapter, capabilities: [...adapter.capabilities] }));
  }

  register(input: AdapterRegistrationInput): AdapterRegistration {
    if (!input.id.trim()) throw new Error("Adapter id is required.");
    if (!input.name.trim()) throw new Error("Adapter name is required.");
    if (!input.capabilities.length) throw new Error("At least one capability is required.");
    if (!input.capabilities.every((capability) => Boolean(capability.trim()))) throw new Error("Capabilities must be non-empty strings.");
    if (!isHttpUrl(input.executeUrl)) throw new Error("A valid HTTP(S) executeUrl is required.");
    if (input.healthUrl && !isHttpUrl(input.healthUrl)) throw new Error("healthUrl must be a valid HTTP(S) URL.");

    const now = new Date().toISOString();
    const previous = this.registrations.get(input.id);
    const registration: AdapterRegistration = {
      id: input.id,
      name: input.name,
      version: input.version ?? "1",
      capabilities: [...new Set(input.capabilities)],
      executeUrl: input.executeUrl,
      ...(input.healthUrl ? { healthUrl: input.healthUrl } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
      registeredAt: previous?.registeredAt ?? now,
      updatedAt: now,
    };
    this.registrations.set(registration.id, registration);
    return registration;
  }

  unregister(id: string): boolean {
    return this.registrations.delete(id);
  }

  select(requiredCapabilities: string[]): AdapterRegistration | undefined {
    return this.list().find((adapter) => hasAllCapabilities(adapter, requiredCapabilities));
  }

  async execute(adapter: AdapterRegistration, mission: ExternalMissionRequest, fetchImpl: typeof fetch = fetch): Promise<ExternalMissionResult> {
    const response = await fetchImpl(adapter.executeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contract: "octopus-adapter-execution-v1", adapterId: adapter.id, mission }),
    });
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      const message = typeof payload.message === "string" ? payload.message : `Adapter execution failed (${response.status}).`;
      return { operationId: mission.operationId, status: "failed", summary: message, output: payload };
    }
    const status = payload.status === "completed" || payload.status === "waiting-authorization" || payload.status === "failed"
      ? payload.status
      : "completed";
    return {
      operationId: typeof payload.operationId === "string" ? payload.operationId : mission.operationId,
      status,
      summary: typeof payload.summary === "string" ? payload.summary : `Mission handled by ${adapter.name}.`,
      output: payload.output && typeof payload.output === "object" && !Array.isArray(payload.output)
        ? payload.output as Record<string, unknown>
        : payload,
      ...(Array.isArray(payload.artifacts) ? { artifacts: payload.artifacts } : {}),
    };
  }
}
