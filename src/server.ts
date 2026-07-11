import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { OctopusEngine } from "./octopus.js";
import { renderGardenerPage } from "./gardener-page.js";

const app = new Hono();
const engine = new OctopusEngine();
let lastStart: Awaited<ReturnType<OctopusEngine["start"]>> | null = null;

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
    routes: ["GET /health", "GET /brief", "GET /garden", "GET /garden-ui", "GET /resources", "POST /mission"],
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

app.post("/mission", async (c) => {
  const body: Record<string, unknown> = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const state = engine.garden.getState();
  const parcelId = typeof body.parcelId === "string" ? body.parcelId : undefined;
  const parcel = state.parcels.find((item) => item.id === parcelId) ?? state.parcels[0];
  const authorizedResources = Array.isArray(body.authorize)
    ? body.authorize.filter((item): item is string => typeof item === "string")
    : [];

  if (!parcel) {
    return c.json({ status: "failed", message: "No parcel available." }, 400);
  }

  const missionId = `mission_${Date.now()}`;
  const title = typeof body.title === "string" ? body.title : `Prepare a useful campaign for ${parcel.name}`;
  engine.garden.addMission({
    id: missionId,
    parcelId: parcel.id,
    title,
    status: "running",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await engine.events.emit("MissionStarted", { missionId, parcelId: parcel.id, title });
  await engine.events.emit("ResourceRequested", { missionId, resourceId: "mistral", authorized: authorizedResources.includes("mistral") });

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
    await engine.events.emit("TentacleSelected", { missionId, tentacleId: mission.tentacleId });
  }

  engine.garden.updateMission(missionId, { status: mission.status, output: mission.output });

  if (mission.status === "waiting-authorization") {
    await engine.events.emit("AuthorizationRequested", { missionId, parcelId: parcel.id, resourceId: mission.resourceResult?.resourceId ?? "mistral" });
  } else if (mission.status === "completed") {
    if (mission.resourceResult) {
      const usage = mission.resourceResult.usage;
      engine.garden.addResourceUsage({
        id: `usage_${Date.now()}`,
        missionId,
        parcelId: parcel.id,
        resourceId: mission.resourceResult.resourceId,
        status: mission.resourceResult.status,
        createdAt: new Date().toISOString(),
        usage,
      });
      await engine.events.emit("ResourceUsed", { missionId, parcelId: parcel.id, resourceId: mission.resourceResult.resourceId, usage });
    }
    const text = typeof mission.output.text === "string" ? mission.output.text : JSON.stringify(mission.output);
    engine.garden.addHarvest({
      id: `harvest_${Date.now()}`,
      missionId,
      parcelId: parcel.id,
      title,
      createdAt: new Date().toISOString(),
      preview: text.slice(0, 280),
    });
    await engine.events.emit("HarvestCreated", { missionId, parcelId: parcel.id, title });
    await engine.events.emit("MissionCompleted", { missionId, parcelId: parcel.id });
  } else {
    await engine.events.emit("MissionFailed", { missionId, parcelId: parcel.id, reason: mission.summary });
  }

  return c.json(mission);
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port });
console.log(`Octopus HTTP server listening on port ${port}`);
