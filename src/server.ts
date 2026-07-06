import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { OctopusEngine } from "./octopus.js";

const app = new Hono();
const engine = new OctopusEngine();
let lastStart: Awaited<ReturnType<OctopusEngine["start"]>> | null = null;

app.get("/", (c) =>
  c.json({
    name: "octopus-engine",
    status: "alive",
    routes: ["GET /health", "GET /brief", "GET /garden", "GET /resources", "POST /mission"],
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

app.get("/garden", (c) => c.json(engine.garden.getState()));

app.get("/resources", async (c) => c.json(await engine.resources.inspect()));

app.post("/mission", async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const state = engine.garden.getState();
  const parcelId = typeof body.parcelId === "string" ? body.parcelId : undefined;
  const parcel = state.parcels.find((item) => item.id === parcelId) ?? state.parcels[0];

  if (!parcel) {
    return c.json({ status: "failed", message: "No parcel available." }, 400);
  }

  const mission = await engine.runtime.run({
    id: `mission_${Date.now()}`,
    title: typeof body.title === "string" ? body.title : `Prepare a useful campaign for ${parcel.name}`,
    objective: typeof body.objective === "string" ? body.objective : parcel.objective,
    parcel,
    preferredTheme: "marketing",
    requiredCapabilities: ["campaign.generate"],
    prompt: typeof body.prompt === "string" ? body.prompt : undefined,
  });

  return c.json(mission);
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port });
console.log(`🐙 Octopus HTTP server listening on port ${port}`);
