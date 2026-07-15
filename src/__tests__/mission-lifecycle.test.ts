import { describe, expect, it } from "vitest";
import {
  MissionLifecycle,
  canTransitionMission,
  isMissionLifecycleState,
} from "../mission-lifecycle.js";

describe("MissionLifecycle", () => {
  it("tracks the universal happy path", () => {
    const lifecycle = new MissionLifecycle();

    lifecycle.receive("mission-1", { source: "spectrl" });
    lifecycle.transition("mission-1", "recorded");
    lifecycle.transition("mission-1", "planned");
    lifecycle.transition("mission-1", "waiting-executor");
    lifecycle.transition("mission-1", "executing");
    const completed = lifecycle.transition("mission-1", "completed");

    expect(completed.state).toBe("completed");
    expect(completed.transitions.map((transition) => transition.to)).toEqual([
      "received",
      "recorded",
      "planned",
      "waiting-executor",
      "executing",
      "completed",
    ]);
  });

  it("supports intrinsic completion without an external executor", () => {
    const lifecycle = new MissionLifecycle();

    lifecycle.receive("observation-1");
    lifecycle.transition("observation-1", "recorded");
    lifecycle.transition("observation-1", "planned");
    const completed = lifecycle.transition("observation-1", "completed", {
      reason: "Intrinsic observation.receive completed.",
    });

    expect(completed.state).toBe("completed");
    expect(completed.transitions.at(-1)?.reason).toContain("observation.receive");
  });

  it("rejects impossible transitions and terminal-state mutation", () => {
    const lifecycle = new MissionLifecycle();
    lifecycle.receive("mission-2");

    expect(() => lifecycle.transition("mission-2", "executing")).toThrow(
      "Invalid mission transition: received -> executing.",
    );

    lifecycle.transition("mission-2", "rejected");
    expect(() => lifecycle.transition("mission-2", "planned")).toThrow(
      "Invalid mission transition: rejected -> planned.",
    );
  });

  it("recognizes only published lifecycle states", () => {
    expect(isMissionLifecycleState("waiting-executor")).toBe(true);
    expect(isMissionLifecycleState("campaign-generating")).toBe(false);
    expect(canTransitionMission("executing", "waiting-authorization")).toBe(true);
    expect(canTransitionMission("completed", "executing")).toBe(false);
  });
});
