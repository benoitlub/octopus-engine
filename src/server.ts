import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AdapterRegistry, type AdapterRegistrationInput } from "./adapter-registry.js";
import { CreateSproutCommandHandler } from "./create-sprout-command.js";
import type { ExecutionContext } from "./execution-contract.js";
import type { SeedRecord } from "./garden-domain.js";
import { isIntrinsicCapability } from "./intrinsic-capabilities.js";
import { MissionLifecycle, type MissionLifecycleState } from "./mission-lifecycle.js";
import { OctopusEngine } from "./octopus.js";
import { renderGardenerPage } from "./gardener-page.js";
import { SeedResonanceCommandHandler } from "./seed-resonance-command.js";

const app = new Hono();
const engine = new OctopusEngine();
const adapters = new AdapterRegistry();
const lifecycle = new MissionLifecycle();
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
  return typeof seed.id === "string" && typeof seed.parcelId === "string" && typeof seed.kind === "string" &&
    typeof seed.title === "string" && typeof seed.content === "string" && typeof seed.status === "string" &&
    typeof seed.createdAt === "string" && typeof seed.updatedAt === "string" && Boolean(signals) &&
    typeof signals?.maturity === "number" && typeof signals.coherence === "number" &&
    typeof signals.utility === "number" && typeof signals.confidence === "number" &&
    typeof signals.estimatedCost === "number";
}

function missionEvent(missionId: string, state: MissionLifecycleState, payload: Record<string, unknown> = {}): void {
  engine.events.store.append({
    kind: `mission.${state}`,
    streamId: missionId,
    source: "octopus-engine",
    correlationId: missionId,
    payload,
  });
}

function transition(missionId: string, state: MissionLifecycleState, reason?: string, metadata?: Record<string, unknown>): void {
  lifecycle.transition(missionId, state, { ...(reason ? { reason } : {}), ...(metadata ? { metadata } : {}) });
  missionEvent(missionId, state, { ...(reason ? { summary: reason } : {}), ...(metadata ?? {}) });
}

app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"], allowHeaders: ["Content-Type"] }));

app.get("/", (c) => c.json({
  name: "octopus-engine",
  status: "alive",
  mode: "neutral-core",
  routes: ["GET /health", "GET /events", "GET /missions/:id", "GET /adapters", "POST /adapters/register", "POST /adapters/unregister", "POST /mission"],
  contracts: {
    mission: "neutral-execution-v2",
    lifecycle: "universal-mission-lifecycle-v1",
    eventStore: "universal-event-store-v1",
    adapterRegistration: "octopus-adapter-registration-v1",
    adapterExecution: "octopus-adapter-execution-v1",
    legacyGardenRoutes: "deprecated",
  },
  defaults: { capabilities: [], tentacles: [], resources: [] },
}));

app.get("/health", async (c) => c.json({
  status: "alive",
  mode: "neutral-core",
  eventCount: engine.events.store.all().length,
  adapters: adapters.list().map(({ id, name, version, capabilities, healthUrl, updatedAt }) => ({ id, name, version, capabilities, healthUrl, updatedAt })),
  tentacles: engine.tentacles.list(),
  resources: await engine.resources.inspect(),
}));
app.get("/events", (c) => c.json({ events: engine.events.store.all() }));
app.get("/missions/:id", (c) => {
  const mission = engine.events.store.projectMission(c.req.param("id"));
  return mission ? c.json(mission) : c.json({ status: "not-found" }, 404);
});
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
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (!isSeedRecord(body.seed)) return c.json({ status: "failed", message: "A valid seed snapshot is required." }, 400);
  return c.json({ status: "evaluated", seedId: body.seed.id, result: await seedResonance.execute({ seed: body.seed, proposedCapabilities: stringList(body.proposedCapabilities) }) });
});

app.post("/seeds/sprout", async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (!isSeedRecord(body.seed)) return c.json({ status: "failed", message: "A valid seed snapshot is required." }, 400);
  if (body.decision !== "sprout") return c.json({ status: "failed", message: "An explicit sprout decision is required." }, 400);
  try {
    const sprout = await createSprout.execute({ seed: body.seed, decision: "sprout", rationale: typeof body.rationale === "string" ? body.rationale : undefined, proposedCapabilities: stringList(body.proposedCapabilities) });
    return c.json({ status: "sprouted", seedId: body.seed.id, sprout });
  } catch (error) {
    return c.json({ status: "failed", message: error instanceof Error ? error.message : "Unable to create sprout." }, 409);
  }
});

app.post("/mission", async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const context = executionContext(body.context);
  if (!context) return c.json({ status: "rejected", code: "CONTEXT_REQUIRED", summary: "A neutral execution context is required.", output: {} }, 400);
  const requiredCapabilities = stringList(body.requiredCapabilities);
  if (!requiredCapabilities.length) return c.json({ status: "rejected", code: "CAPABILITY_REQUIRED", summary: "At least one explicit required capability is required.", output: {} }, 400);

  const operationId = typeof body.operationId === "string" && body.operationId.trim() ? body.operationId : `mission_${Date.now()}`;
  const title = typeof body.title === "string" ? body.title : `Execute ${context.label ?? context.id}`;
  const objective = typeof body.objective === "string" ? body.objective : context.objective ?? "Process the supplied context.";
  const authorizedResources = stringList(body.authorizedResources).length ? stringList(body.authorizedResources) : stringList(body.authorize);
  const common = { operationId, missionId: operationId, contextId: context.id, requiredCapabilities };

  lifecycle.receive(operationId, { contextId: context.id, requiredCapabilities });
  missionEvent(operationId, "received", { ...common, title, objective });
  transition(operationId, "recorded", "Mission recorded.", common);
  transition(operationId, "planned", "Capabilities resolved.", common);

  const allIntrinsic = requiredCapabilities.every(isIntrinsicCapability);
  if (allIntrinsic) {
    transition(operationId, "executing", "Executing intrinsic capabilities.", common);
    const observation = context.metadata?.event ?? context.metadata?.observation ?? context.metadata ?? {};
    if (requiredCapabilities.includes("observation.receive")) {
      engine.events.store.append({ kind: "observation.received", streamId: context.id, source: typeof context.metadata?.source === "string" ? context.metadata.source : "external-application", correlationId: operationId, payload: isRecord(observation) ? observation : { value: observation } });
      engine.events.store.append({ kind: "observation.recorded", streamId: context.id, source: "octopus-engine", correlationId: operationId, payload: { missionId: operationId, contextId: context.id } });
    }
    const output = {
      decision: "record",
      reason: "Observation received, timestamped and recorded by Octopus Engine.",
      actions: ["record_observation"],
      receivedCapabilities: requiredCapabilities,
    };
    transition(operationId, "completed", "Intrinsic mission completed.", { ...common, output });
    return c.json({ status: "completed", operationId, missionId: operationId, contextId: context.id, summary: output.reason, output, lifecycle: lifecycle.get(operationId) });
  }

  const externalAdapter = adapters.select(requiredCapabilities);
  if (!externalAdapter) {
    transition(operationId, "waiting-executor", "No registered adapter currently provides every required capability.", common);
    return c.json({ status: "waiting-executor", operationId, missionId: operationId, contextId: context.id, summary: "Mission recorded and waiting for a compatible executor.", output: { requiredCapabilities }, lifecycle: lifecycle.get(operationId) }, 202);
  }

  transition(operationId, "waiting-executor", "Compatible adapter selected.", { ...common, executorId: externalAdapter.id });
  transition(operationId, "executing", "External adapter execution started.", { ...common, executorId: externalAdapter.id });
  try {
    const external = await adapters.execute(externalAdapter, { operationId, title, objective, requiredCapabilities, authorizedResources, ...(typeof body.prompt === "string" ? { prompt: body.prompt } : {}), context });
    if (external.status === "waiting-authorization") transition(operationId, "waiting-authorization", external.summary, { ...common, executorId: externalAdapter.id, output: external.output ?? {} });
    else if (external.status === "completed") transition(operationId, "completed", external.summary, { ...common, executorId: externalAdapter.id, output: external.output ?? {} });
    else transition(operationId, "failed", external.summary, { ...common, executorId: externalAdapter.id, output: external.output ?? {} });
    return c.json({ ...external, operationId, missionId: operationId, contextId: context.id, adapterId: externalAdapter.id, lifecycle: lifecycle.get(operationId) });
  } catch (error) {
    const summary = error instanceof Error ? error.message : "External adapter execution failed.";
    transition(operationId, "failed", summary, { ...common, executorId: externalAdapter.id });
    return c.json({ status: "failed", operationId, missionId: operationId, contextId: context.id, adapterId: externalAdapter.id, summary, output: {}, lifecycle: lifecycle.get(operationId) }, 502);
  }
});

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`Octopus HTTP server listening on port ${port}`);
