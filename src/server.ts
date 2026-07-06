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
  engine.garden.addMission({
    id: missionId,
    parcelId: parcel.id,
    title: typeof body.title === "string" ? body.title : `Prepare a useful campaign for ${parcel.name}`,
    status: "running",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const mission = await engine.runtime.run({
    id: missionId,
    title: typeof body.title === "string" ? body.title : `Prepare a useful campaign for ${parcel.name}`,
    objective: typeof body.objective === "string" ? body.objective : parcel.objective,
    parcel,
    preferredTheme: "marketing",
    requiredCapabilities: ["campaign.generate"],
    prompt: typeof body.prompt === "string" ? body.prompt : undefined,
    authorizedResources,
  });

  engine.garden.updateMission(missionId, { status: mission.status, output: mission.output });

  return c.json(mission);
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port });
console.log(`Octopus HTTP server listening on port ${port}`);
