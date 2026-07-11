import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { CreateSproutCommandHandler } from "./create-sprout-command.js";
import type { SeedRecord } from "./garden-domain.js";
import { OctopusEngine } from "./octopus.js";
import { renderGardenerPage } from "./gardener-page.js";
import { SeedResonanceCommandHandler } from "./seed-resonance-command.js";

const app = new Hono();
const engine = new OctopusEngine();
const seedResonance = new SeedResonanceCommandHandler(engine.events);
const createSprout = new CreateSproutCommandHandler(engine.events);
let lastStart: Awaited<ReturnType<OctopusEngine["start"]>> | null = null;

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
      "POST /seeds/resonance",
      "POST /seeds/sprout",
    ],
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

app.post("/seeds/resonance", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  if (!isSeedRecord(body.seed)) {
    return c.json({ status: "failed", message: "A valid seed snapshot is required." }, 400);
  }

  const proposedCapabilities = Array.isArray(body.proposedCapabilities)
    ? body.proposedCapabilities.filter((item): item is string => typeof item === "string")
    : [];
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

  const proposedCapabilities = Array.isArray(body.proposedCapabilities)
    ? body.proposedCapabilities.filter((item): item is string => typeof item === "string")
    : [];

  try {
    const sprout = await createSprout.execute({
      seed: body.seed,
      decision: "sprout",
      rationale: typeof body.rationale === "string" ? body.rationale : undefined,
      proposedCapabilities,
    });
    return c.json({ status: "sprouted", seedId: body.seed.id, sprout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create sprout.";
    return c.json({ status: "failed", message }, 409);
  }
});

app.post("/mission", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const state = engine.garden.getState();
  const parcelId = typeof body.parcelId === "string" ? body.parcelId : undefined;
  const parcel = state.parcels.find((item) => item.id === parcelId) ?? state.parcels[0];
  const authorizedResources = Array.isArray(body.authorize)
    ? body.authorize.filter((item): item is string => typeof item === "string")
    : [];

  if (!parcel) return c.json({ status: "failed", message: "No parcel available." }, 400);

  const missionId = `mission_${Date.now()}`;
  const title = typeof body.title === "string" ? body.title : `Prepare a useful campaign for ${parcel.name}`;
  await engine.events.emit("MissionStarted", {
    missionId,
    parcelId: parcel.id,
    title,
    createdAt: new Date().toISOString(),
  });
  await engine.events.emit("ResourceRequested", {
    missionId,
    parcelId: parcel.id,
    resourceId: "mistral",
    authorized: authorizedResources.includes("mistral"),
  });

  const mission = await engine.runtime.run({
    id: missionId,
    title,
    objective: typeof body.objective === "string" ? body.objective : parcel.objective,
    parcel,
    preferredTheme: "marketing",
    requiredCapabilities: ["campaign.generate"],
    prompt: typeof body.prompt === "string" ? body.prompt : undefined,
    authorizedResources,
  });

  if (mission.tentacleId) {
    await engine.events.emit("TentacleSelected", { missionId, parcelId: parcel.id, tentacleId: mission.tentacleId });
  }

  if (mission.status === "waiting-authorization") {
    await engine.events.emit("AuthorizationRequested", {
      missionId,
      parcelId: parcel.id,
      resourceId: mission.resourceResult?.resourceId ?? "mistral",
      output: mission.output,
    });
  } else if (mission.status === "completed") {
    if (mission.resourceResult) {
      await engine.events.emit("ResourceUsed", {
        usageId: `usage_${Date.now()}`,
        missionId,
        parcelId: parcel.id,
        resourceId: mission.resourceResult.resourceId,
        status: mission.resourceResult.status,
        usage: mission.resourceResult.usage,
      });
    }
    const text = typeof mission.output.text === "string" ? mission.output.text : JSON.stringify(mission.output);
    await engine.events.emit("HarvestCreated", {
      harvestId: `harvest_${Date.now()}`,
      missionId,
      parcelId: parcel.id,
      title,
      preview: text.slice(0, 280),
    });
    await engine.events.emit("MissionCompleted", { missionId, parcelId: parcel.id, output: mission.output });
  } else {
    await engine.events.emit("MissionFailed", {
      missionId,
      parcelId: parcel.id,
      reason: mission.summary,
      output: mission.output,
    });
  }

  return c.json(mission);
});

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`Octopus HTTP server listening on port ${port}`);
