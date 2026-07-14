import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { CreateSproutCommandHandler } from "./create-sprout-command.js";
import { handleCreatureObservation, parseCreatureObservation } from "./creature-observation.js";
import type { ExecutionContext } from "./execution-contract.js";
import type { SeedRecord } from "./garden-domain.js";
import { OctopusEngine } from "./octopus.js";
import { renderGardenerPage } from "./gardener-page.js";
import { SeedResonanceCommandHandler } from "./seed-resonance-command.js";

const app = new Hono();
const engine = new OctopusEngine();
const seedResonance = new SeedResonanceCommandHandler(engine.events);
const createSprout = new CreateSproutCommandHandler(engine.events);
let lastStart: Awaited<ReturnType<OctopusEngine["start"]>> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
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

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) =>
  c.json({
    name: "octopus-engine",
    status: "alive",
    routes: [
      "GET /health",
      "GET /brief",
      "GET /garden",
      "GET /garden-ui",
      "GET /resources",
      "POST /mission",
      "POST /observations/creature-sync",
      "POST /seeds/resonance",
      "POST /seeds/sprout",
    ],
    contracts: {
      mission: "neutral-execution-v1",
      creatureObservation: "creature-observation-v1",
      legacyGardenRoutes: "deprecated",
    },
  }),
);

app.get("/health", async (c) => {
  const resources = await engine.resources.inspect();
  return c.json({ status: "alive", resources });
});

app.get("/brief", async (c) => {
  lastStart = await engine.start();
  return c.json({ brief: lastStart.brief, mission: lastStart.mission, resources: lastStart.resources });
});

app.get("/garden-ui", (c) => c.html(renderGardenerPage()));
app.get("/gardener", (c) => c.html(renderGardenerPage()));
app.get("/garden", (c) => c.json(engine.garden.getState()));
app.get("/resources", async (c) => c.json(await engine.resources.inspect()));

app.post("/observations/creature-sync", async (c) => {
  const body: unknown = await c.req.json().catch(() => null);
  const observation = parseCreatureObservation(body);
  if (!observation) {
    return c.json({
      status: "failed",
      message: "A valid CreatureObservationEvent is required.",
    }, 400);
  }

  const response = await handleCreatureObservation(engine, observation);
  return c.json(response);
});

app.post("/seeds/resonance", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (!isSeedRecord(body.seed)) {
    return c.json({ status: "failed", message: "A valid seed snapshot is required." }, 400);
  }

  const proposedCapabilities = stringList(body.proposedCapabilities);
  const result = await seedResonance.execute({ seed: body.seed, proposedCapabilities });
  return c.json({ status: "evaluated", seedId: body.seed.id, result });
});

app.post("/seeds/sprout", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (!isSeedRecord(body.seed)) {
    return c.json({ status: "failed", message: "A valid seed snapshot is required." }, 400);
  }
  if (body.decision !== "sprout") {
    return c.json({ status: "failed", message: "An explicit sprout decision is required." }, 400);
  }

  try {
    const sprout = await createSprout.execute({
      seed: body.seed,
      decision: "sprout",
      rationale: typeof body.rationale === "string" ? body.rationale : undefined,
      proposedCapabilities: stringList(body.proposedCapabilities),
    });
    return c.json({ status: "sprouted", seedId: body.seed.id, sprout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create sprout.";
    return c.json({ status: "failed", message }, 409);
  }
});

app.post("/mission", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const context = executionContext(body.context);

  // Temporary compatibility bridge for clients that still send parcelId.
  const legacyParcelId = typeof body.parcelId === "string" ? body.parcelId : undefined;
  const legacyParcel = context
    ? undefined
    : engine.garden.getState().parcels.find((item) => item.id === legacyParcelId)
      ?? engine.garden.getState().parcels[0];

  if (!context && !legacyParcel) {
    return c.json({
      status: "failed",
      message: "A neutral execution context is required. Legacy parcel fallback is unavailable.",
    }, 400);
  }

  const resolvedContext: ExecutionContext = context ?? {
    id: legacyParcel!.id,
    label: legacyParcel!.name,
    objective: legacyParcel!.objective,
    metadata: { legacySource: "parcel" },
  };
  const operationId = typeof body.operationId === "string" && body.operationId.trim()
    ? body.operationId
    : `mission_${Date.now()}`;
  const title = typeof body.title === "string"
    ? body.title
    : `Execute ${resolvedContext.label ?? resolvedContext.id}`;
  const objective = typeof body.objective === "string"
    ? body.objective
    : resolvedContext.objective ?? "Produce a useful execution result.";
  const requiredCapabilities = stringList(body.requiredCapabilities);
  const authorizedResources = stringList(body.authorizedResources).length
    ? stringList(body.authorizedResources)
    : stringList(body.authorize);
  const eventIdentity = {
    missionId: operationId,
    operationId,
    contextId: resolvedContext.id,
    ...(legacyParcel ? { parcelId: legacyParcel.id } : {}),
  };

  await engine.events.emit("MissionStarted", {
    ...eventIdentity,
    title,
    createdAt: new Date().toISOString(),
  });
  await engine.events.emit("ResourceRequested", {
    ...eventIdentity,
    resourceId: "mistral",
    authorized: authorizedResources.includes("mistral"),
  });

  const mission = await engine.runtime.run({
    id: operationId,
    title,
    objective,
    context: resolvedContext,
    ...(legacyParcel ? { parcel: legacyParcel } : {}),
    preferredTheme: "marketing",
    requiredCapabilities: requiredCapabilities.length ? requiredCapabilities : ["campaign.generate"],
    prompt: typeof body.prompt === "string" ? body.prompt : undefined,
    authorizedResources,
  });

  if (mission.tentacleId) {
    await engine.events.emit("TentacleSelected", {
      ...eventIdentity,
      tentacleId: mission.tentacleId,
    });
  }

  if (mission.status === "waiting-authorization") {
    await engine.events.emit("AuthorizationRequested", {
      ...eventIdentity,
      resourceId: mission.resourceResult?.resourceId ?? "mistral",
      output: mission.output,
    });
  } else if (mission.status === "completed") {
    if (mission.resourceResult) {
      await engine.events.emit("ResourceUsed", {
        ...eventIdentity,
        usageId: `usage_${Date.now()}`,
        resourceId: mission.resourceResult.resourceId,
        status: mission.resourceResult.status,
        usage: mission.resourceResult.usage,
      });
    }

    // Legacy Garden projection is maintained only for the old parcel contract.
    if (legacyParcel) {
      const text = typeof mission.output.text === "string" ? mission.output.text : JSON.stringify(mission.output);
      await engine.events.emit("HarvestCreated", {
        ...eventIdentity,
        harvestId: `harvest_${Date.now()}`,
        title,
        preview: text.slice(0, 280),
      });
    }
    await engine.events.emit("MissionCompleted", {
      ...eventIdentity,
      output: mission.output,
    });
  } else {
    await engine.events.emit("MissionFailed", {
      ...eventIdentity,
      reason: mission.summary,
      output: mission.output,
    });
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
