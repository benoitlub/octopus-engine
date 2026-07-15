import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AdapterRegistry, type AdapterRegistrationInput } from "./adapter-registry.js";
import { CreateSproutCommandHandler } from "./create-sprout-command.js";
import type { ExecutionContext } from "./execution-contract.js";
import type { SeedRecord } from "./garden-domain.js";
import { OctopusEngine } from "./octopus.js";
import { renderGardenerPage } from "./gardener-page.js";
import { SeedResonanceCommandHandler } from "./seed-resonance-command.js";

const app = new Hono();
const engine = new OctopusEngine();
const adapters = new AdapterRegistry();
const seedResonance = new SeedResonanceCommandHandler(engine.events);
const createSprout = new CreateSproutCommandHandler(engine.events);
let lastStart: Awaited<ReturnType<OctopusEngine["start"]>> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}

function executionContext(value: unknown): ExecutionContext | undefined {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id.trim()) return undefined;
  return {
    id: value.id,
    ...(typeof value.label === "string" ? { label: value.label } : {}),
    ...(typeof value.objective === "string" ? { objective: value.objective } : {}),
    ...(isRecord(value.metadata) ? { metadata: value.metadata } : {}),
  };
}

function adapterInput(value: unknown): AdapterRegistrationInput | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.id !== "string" || typeof value.name !== "string" || typeof value.executeUrl !== "string") return undefined;
  const capabilities = stringList(value.capabilities);
  if (!capabilities.length) return undefined;
  return {
    id: value.id,
    name: value.name,
    executeUrl: value.executeUrl,
    capabilities,
    ...(typeof value.version === "string" ? { version: value.version } : {}),
    ...(typeof value.healthUrl === "string" ? { healthUrl: value.healthUrl } : {}),
    ...(isRecord(value.metadata) ? { metadata: value.metadata } : {}),
  };
}

function isSeedRecord(value: unknown): value is SeedRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const seed = value as Partial<SeedRecord>;
  const signals = seed.signals;
  return (
    typeof seed.id === "string" &&
    typeof seed.parcelId === "string" &&
    typeof seed.kind === "string" &&
    typeof seed.title === "string" &&
    typeof seed.content === "string" &&
    typeof seed.status === "string" &&
    typeof seed.createdAt === "string" &&
    typeof seed.updatedAt === "string" &&
    Boolean(signals) &&
    typeof signals?.maturity === "number" &&
    typeof signals.coherence === "number" &&
    typeof signals.utility === "number" &&
    typeof signals.confidence === "number" &&
    typeof signals.estimatedCost === "number"
  );
}

app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"], allowHeaders: ["Content-Type"] }));

app.get("/", (c) => c.json({
  name: "octopus-engine",
  status: "alive",
  mode: "neutral-core",
  routes: [
    "GET /health",
    "GET /brief",
    "GET /garden",
    "GET /garden-ui",
    "GET /resources",
    "GET /adapters",
    "POST /adapters/register",
    "POST /adapters/unregister",
    "POST /mission",
    "POST /seeds/resonance",
    "POST /seeds/sprout",
  ],
  contracts: {
    mission: "neutral-execution-v1",
    adapterRegistration: "octopus-adapter-registration-v1",
    adapterExecution: "octopus-adapter-execution-v1",
    legacyGardenRoutes: "deprecated",
  },
  defaults: { capabilities: [], tentacles: [], resources: [] },
}));

app.get("/health", async (c) => c.json({
  status: "alive",
  mode: "neutral-core",
  adapters: adapters.list().map(({ id, name, version, capabilities, healthUrl, updatedAt }) => ({ id, name, version, capabilities, healthUrl, updatedAt })),
  tentacles: engine.tentacles.list(),
  resources: await engine.resources.inspect(),
}));
app.get("/brief", async (c) => {
  lastStart = await engine.start();
  return c.json({ brief: lastStart.brief, mission: lastStart.mission, resources: lastStart.resources });
});
app.get("/garden-ui", (c) => c.html(renderGardenerPage()));
app.get("/gardener", (c) => c.html(renderGardenerPage()));
app.get("/garden", (c) => c.json(engine.garden.getState()));
app.get("/resources", async (c) => c.json(await engine.resources.inspect()));
app.get("/adapters", (c) => c.json({ contract: "octopus-adapter-registration-v1", adapters: adapters.list() }));

app.post("/adapters/register", async (c) => {
  const body = await c.req.json<unknown>().catch(() => undefined);
  const input = adapterInput(body);
  if (!input) return c.json({ status: "failed", code: "INVALID_ADAPTER", message: "A valid adapter registration is required." }, 400);
  try {
    const adapter = adapters.register(input);
    await engine.events.emit("AdapterRegistered", { adapterId: adapter.id, capabilities: adapter.capabilities, updatedAt: adapter.updatedAt });
    return c.json({ status: "registered", contract: "octopus-adapter-registration-v1", adapter }, 201);
  } catch (error) {
    return c.json({ status: "failed", code: "INVALID_ADAPTER", message: error instanceof Error ? error.message : "Adapter registration failed." }, 400);
  }
});

app.post("/adapters/unregister", async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (typeof body.id !== "string" || !body.id.trim()) return c.json({ status: "failed", message: "Adapter id is required." }, 400);
  const removed = adapters.unregister(body.id);
  if (removed) await engine.events.emit("AdapterUnregistered", { adapterId: body.id, removedAt: new Date().toISOString() });
  return c.json({ status: removed ? "unregistered" : "not-found", adapterId: body.id }, removed ? 200 : 404);
});

app.post("/seeds/resonance", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (!isSeedRecord(body.seed)) return c.json({ status: "failed", message: "A valid seed snapshot is required." }, 400);
  const result = await seedResonance.execute({ seed: body.seed, proposedCapabilities: stringList(body.proposedCapabilities) });
  return c.json({ status: "evaluated", seedId: body.seed.id, result });
});

app.post("/seeds/sprout", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (!isSeedRecord(body.seed)) return c.json({ status: "failed", message: "A valid seed snapshot is required." }, 400);
  if (body.decision !== "sprout") return c.json({ status: "failed", message: "An explicit sprout decision is required." }, 400);
  try {
    const sprout = await createSprout.execute({
      seed: body.seed,
      decision: "sprout",
      rationale: typeof body.rationale === "string" ? body.rationale : undefined,
      proposedCapabilities: stringList(body.proposedCapabilities),
    });
    return c.json({ status: "sprouted", seedId: body.seed.id, sprout });
  } catch (error) {
    return c.json({ status: "failed", message: error instanceof Error ? error.message : "Unable to create sprout." }, 409);
  }
});

app.post("/mission", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const context = executionContext(body.context);
  const legacyParcelId = typeof body.parcelId === "string" ? body.parcelId : undefined;
  const legacyParcel = context ? undefined : engine.garden.getState().parcels.find((item) => item.id === legacyParcelId) ?? engine.garden.getState().parcels[0];
  if (!context && !legacyParcel) return c.json({ status: "failed", message: "A neutral execution context is required. Legacy parcel fallback is unavailable." }, 400);

  const requiredCapabilities = stringList(body.requiredCapabilities);
  if (!requiredCapabilities.length) {
    return c.json({
      status: "failed",
      code: "CAPABILITY_REQUIRED",
      message: "At least one explicit required capability is required. Octopus Engine has no domain default.",
    }, 400);
  }

  const resolvedContext: ExecutionContext = context ?? {
    id: legacyParcel!.id,
    label: legacyParcel!.name,
    objective: legacyParcel!.objective,
    metadata: { legacySource: "parcel" },
  };
  const operationId = typeof body.operationId === "string" && body.operationId.trim() ? body.operationId : `mission_${Date.now()}`;
  const title = typeof body.title === "string" ? body.title : `Execute ${resolvedContext.label ?? resolvedContext.id}`;
  const objective = typeof body.objective === "string" ? body.objective : resolvedContext.objective ?? "Produce a useful execution result.";
  const authorizedResources = stringList(body.authorizedResources).length ? stringList(body.authorizedResources) : stringList(body.authorize);
  const eventIdentity = { missionId: operationId, operationId, contextId: resolvedContext.id, ...(legacyParcel ? { parcelId: legacyParcel.id } : {}) };

  await engine.events.emit("MissionStarted", { ...eventIdentity, title, createdAt: new Date().toISOString() });
  for (const resourceId of authorizedResources) {
    await engine.events.emit("ResourceRequested", { ...eventIdentity, resourceId, authorized: true });
  }

  const externalAdapter = adapters.select(requiredCapabilities);
  if (externalAdapter) {
    await engine.events.emit("AdapterSelected", { ...eventIdentity, adapterId: externalAdapter.id, capabilities: requiredCapabilities });
    try {
      const external = await adapters.execute(externalAdapter, {
        operationId,
        title,
        objective,
        requiredCapabilities,
        authorizedResources,
        ...(typeof body.prompt === "string" ? { prompt: body.prompt } : {}),
        context: resolvedContext,
      });
      if (external.status === "completed") await engine.events.emit("MissionCompleted", { ...eventIdentity, adapterId: externalAdapter.id, output: external.output ?? {} });
      else if (external.status === "waiting-authorization") await engine.events.emit("AuthorizationRequested", { ...eventIdentity, adapterId: externalAdapter.id, output: external.output ?? {} });
      else await engine.events.emit("MissionFailed", { ...eventIdentity, adapterId: externalAdapter.id, reason: external.summary, output: external.output ?? {} });
      return c.json({ ...external, operationId, contextId: resolvedContext.id, adapterId: externalAdapter.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "External adapter execution failed.";
      await engine.events.emit("MissionFailed", { ...eventIdentity, adapterId: externalAdapter.id, reason: message, output: {} });
      return c.json({ status: "failed", operationId, contextId: resolvedContext.id, adapterId: externalAdapter.id, summary: message, output: {} }, 502);
    }
  }

  const mission = await engine.runtime.run({
    id: operationId,
    title,
    objective,
    context: resolvedContext,
    ...(legacyParcel ? { parcel: legacyParcel } : {}),
    requiredCapabilities,
    prompt: typeof body.prompt === "string" ? body.prompt : undefined,
    authorizedResources,
  });

  if (mission.tentacleId) await engine.events.emit("TentacleSelected", { ...eventIdentity, tentacleId: mission.tentacleId });
  if (mission.status === "waiting-authorization") {
    await engine.events.emit("AuthorizationRequested", { ...eventIdentity, resourceId: mission.resourceResult?.resourceId ?? "unknown", output: mission.output });
  } else if (mission.status === "completed") {
    if (mission.resourceResult) await engine.events.emit("ResourceUsed", {
      ...eventIdentity,
      usageId: `usage_${Date.now()}`,
      resourceId: mission.resourceResult.resourceId,
      status: mission.resourceResult.status,
      usage: mission.resourceResult.usage,
    });
    if (legacyParcel) {
      const text = typeof mission.output.text === "string" ? mission.output.text : JSON.stringify(mission.output);
      await engine.events.emit("HarvestCreated", { ...eventIdentity, harvestId: `harvest_${Date.now()}`, title, preview: text.slice(0, 280) });
    }
    await engine.events.emit("MissionCompleted", { ...eventIdentity, output: mission.output });
  } else {
    await engine.events.emit("MissionFailed", { ...eventIdentity, reason: mission.summary, output: mission.output });
  }

  return c.json({
    ...mission,
    operationId: mission.operationId || operationId,
    contextId: mission.contextId || resolvedContext.id,
    ...(legacyParcel ? { parcelId: mission.parcelId || legacyParcel.id } : {}),
  });
});

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`Octopus HTTP server listening on port ${port}`);
