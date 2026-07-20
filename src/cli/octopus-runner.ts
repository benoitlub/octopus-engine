import { AutonomousRunner } from "../autonomy/autonomous-runner.js";

const intervalMs = Number(process.env.OCTOPUS_RUNNER_INTERVAL_MS ?? 60_000);
const once = process.argv.includes("--once");
const runner = new AutonomousRunner();

async function run(): Promise<void> {
  const result = await runner.tick();
  console.log(JSON.stringify({ at: new Date().toISOString(), ...result }));
}

await run();

if (!once) {
  setInterval(() => {
    void run().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  }, intervalMs).unref();
  await new Promise(() => undefined);
}
