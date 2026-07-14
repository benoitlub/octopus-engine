import { describe, expect, it, vi } from "vitest";
import { AutonomousCycle, type AutonomousSignal } from "../autonomous-cycle.js";

const signal: AutonomousSignal = {
  id: "publisher:signal:terra",
  title: "TERRA promotion opportunity",
  objective: "Prepare an internal campaign draft",
  source: "blacklace-publisher",
};

describe("AutonomousCycle", () => {
  it("deduplicates the same signal", () => {
    const cycle = new AutonomousCycle(async () => ({ status: "ready" }));
    const first = cycle.enqueue(signal);
    const second = cycle.enqueue(signal);

    expect(first.id).toBe(second.id);
    expect(cycle.list()).toHaveLength(1);
  });

  it("runs internal work once and keeps the ready result", async () => {
    const executor = vi.fn(async (_signal: AutonomousSignal, operationId: string) => ({
      status: "ready" as const,
      operationId,
      result: { draft: "prepared" },
    }));
    const cycle = new AutonomousCycle(executor);

    const [first] = await cycle.tick([signal]);
    const [second] = await cycle.tick([signal]);

    expect(first.status).toBe("ready");
    expect(second.status).toBe("ready");
    expect(second.result).toEqual({ draft: "prepared" });
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it("records an obstacle without inventing success", async () => {
    const cycle = new AutonomousCycle(async () => ({
      status: "blocked",
      obstacle: "External publication requires human approval.",
    }));

    const [job] = await cycle.tick([signal]);

    expect(job.status).toBe("blocked");
    expect(job.obstacle).toContain("human approval");
  });

  it("limits retries", async () => {
    const cycle = new AutonomousCycle(async () => {
      throw new Error("temporary provider failure");
    }, 1);
    const job = cycle.enqueue(signal);

    const failed = await cycle.run(job.id);
    const notRetried = await cycle.run(job.id);

    expect(failed.status).toBe("failed");
    expect(notRetried.attempts).toBe(1);
  });
});
