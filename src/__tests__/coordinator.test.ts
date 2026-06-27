/**
 * Tests Coordinator — Octopus Engine V1
 *
 * Ces tests sont des tests de frontières architecturales (docs/testing-boundaries.md) :
 * - Le Coordinator n'exécute jamais de logique métier d'application.
 * - Les modules s'ignorent mutuellement (Constitution Loi IV).
 * - Le Coordinator ne mute jamais le contexte original.
 */
import { describe, it, expect } from "vitest";
import { Coordinator } from "../coordinator.js";
import type { WorkflowDefinition, ModuleTask } from "../types.js";

const echoModule: ModuleTask = {
  id: "echo",
  name: "Echo",
  requiredCapabilities: [],
  execute: async (input) => ({ echoed: input["value"] ?? "none" }),
};

const appendModule: ModuleTask = {
  id: "append",
  name: "Append",
  requiredCapabilities: [],
  execute: async (input) => ({ result: `${String(input["echoed"] ?? "")}_appended` }),
};

const failingModule: ModuleTask = {
  id: "fail",
  name: "Toujours échoue",
  requiredCapabilities: [],
  execute: async () => {
    throw new Error("Module failure");
  },
};

const identityModule: ModuleTask = {
  id: "identity",
  name: "Identity",
  requiredCapabilities: [],
  execute: async (input) => ({ ...input }),
};

const twoStepWorkflow: WorkflowDefinition = {
  id: "two_step",
  version: "1.0.0",
  description: "Echo puis append",
  steps: [
    { moduleId: "echo", input: { value: "hello" } },
    { moduleId: "append", input: {} },
  ],
};

describe("Coordinator", () => {
  it("exécute toutes les étapes dans l'ordre et retourne workflowId", async () => {
    const coord = new Coordinator([echoModule, appendModule]);
    const result = await coord.run(twoStepWorkflow);
    expect(result.workflowId).toBe("two_step");
    expect(result.steps).toHaveLength(2);
  });

  it("accumule les outputs entre les étapes", async () => {
    const coord = new Coordinator([echoModule, appendModule]);
    const result = await coord.run(twoStepWorkflow);
    expect(result.output["echoed"]).toBe("hello");
    expect(result.output["result"]).toBe("hello_appended");
  });

  it("marque toutes les étapes comme success sur le chemin nominal", async () => {
    const coord = new Coordinator([echoModule, appendModule]);
    const result = await coord.run(twoStepWorkflow);
    expect(result.steps[0]?.status).toBe("success");
    expect(result.steps[1]?.status).toBe("success");
  });

  it("l'input statique du step écrase le contexte accumulé en cas de conflit", async () => {
    const coord = new Coordinator([echoModule, appendModule]);
    const result = await coord.run(twoStepWorkflow, { value: "world" });
    expect(result.output["echoed"]).toBe("hello");
  });

  it("le contexte initial est disponible tout au long du workflow", async () => {
    const workflow: WorkflowDefinition = {
      id: "ctx_flow",
      version: "1.0.0",
      description: "Passthrough contexte",
      steps: [{ moduleId: "identity", input: {} }],
    };
    const coord = new Coordinator([identityModule]);
    const result = await coord.run(workflow, { extra: "ctx_data" });
    expect(result.output["extra"]).toBe("ctx_data");
  });

  it("lève une erreur claire quand un module requis n'est pas enregistré", async () => {
    const coord = new Coordinator([echoModule]);
    await expect(coord.run(twoStepWorkflow)).rejects.toThrow("Module not found: append");
  });

  it("propage les erreurs d'exécution des modules", async () => {
    const workflow: WorkflowDefinition = {
      id: "fail_flow",
      version: "1.0.0",
      description: "Échoue",
      steps: [{ moduleId: "fail", input: {} }],
    };
    const coord = new Coordinator([failingModule]);
    await expect(coord.run(workflow)).rejects.toThrow("Module failure");
  });

  it("exécute un workflow vide sans erreur", async () => {
    const emptyWorkflow: WorkflowDefinition = {
      id: "empty",
      version: "1.0.0",
      description: "Aucune étape",
      steps: [],
    };
    const coord = new Coordinator([]);
    const result = await coord.run(emptyWorkflow, { seed: 1 });
    expect(result.steps).toHaveLength(0);
    expect(result.output["seed"]).toBe(1);
  });

  it("ne mute pas l'objet contexte original (immuabilité)", async () => {
    const coord = new Coordinator([echoModule, appendModule]);
    const ctx: Record<string, unknown> = { original: true };
    await coord.run(twoStepWorkflow, ctx);
    expect(ctx).toEqual({ original: true });
  });
});
