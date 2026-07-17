import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AdapterRegistry, ExternalMissionRequest, ExternalMissionResult } from "./adapter-registry.js";

export type WorkerMissionState = "waiting-executor" | "executing" | "waiting-authorization" | "completed" | "failed";

export interface WorkerMission {
  operationId: string;
  request: ExternalMissionRequest;
  state: WorkerMissionState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  nextAttemptAt: string;
  adapterId?: string;
  summary?: string;
  output?: Record<string, unknown>;
}

interface WorkerOptions {
  registry: AdapterRegistry;
  storagePath?: string;
  intervalMs?: number;
  retryMs?: number;
  maxAttempts?: number;
  onTransition?: (mission: WorkerMission, previousState: WorkerMissionState) => void;
}

function cloneMission(mission: WorkerMission): WorkerMission {
  return {
    ...mission,
    request: {
      ...mission.request,
      requiredCapabilities: [...mission.request.requiredCapabilities],
      authorizedResources: [...mission.request.authorizedResources],
      context: {
        ...mission.request.context,
        ...(mission.request.context.metadata ? { metadata: { ...mission.request.context.metadata } } : {}),
      },
    },
    ...(mission.output ? { output: { ...mission.output } } : {}),
  };
}

export class AutonomousMissionWorker {
  private readonly registry: AdapterRegistry;
  private readonly storagePath: string;
  private readonly intervalMs: number;
  private readonly retryMs: number;
  private readonly maxAttempts: number;
  private readonly onTransition?: WorkerOptions["onTransition"];
  private readonly missions = new Map<string, WorkerMission>();
  private timer: NodeJS.Timeout | undefined;
  private ticking = false;

  constructor(options: WorkerOptions) {
    this.registry = options.registry;
    this.storagePath = options.storagePath ?? process.env.OCTOPUS_QUEUE_FILE ?? ".octopus-data/pending-missions.json";
    this.intervalMs = options.intervalMs ?? Number(process.env.OCTOPUS_WORKER_INTERVAL_MS ?? 5000);
    this.retryMs = options.retryMs ?? Number(process.env.OCTOPUS_WORKER_RETRY_MS ?? 15000);
    this.maxAttempts = options.maxAttempts ?? Number(process.env.OCTOPUS_WORKER_MAX_ATTEMPTS ?? 12);
    this.onTransition = options.onTransition;
    this.restore();
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
    this.timer.unref?.();
    void this.tick();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  list(): WorkerMission[] {
    return [...this.missions.values()].map(cloneMission);
  }

  get(operationId: string): WorkerMission | undefined {
    const mission = this.missions.get(operationId);
    return mission ? cloneMission(mission) : undefined;
  }

  enqueue(request: ExternalMissionRequest): WorkerMission {
    const existing = this.missions.get(request.operationId);
    if (existing && !["failed", "completed"].includes(existing.state)) return cloneMission(existing);
    const now = new Date().toISOString();
    const mission: WorkerMission = {
      operationId: request.operationId,
      request,
      state: "waiting-executor",
      attempts: 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      nextAttemptAt: now,
      summary: "Mission queued for autonomous server-side execution.",
    };
    this.missions.set(mission.operationId, mission);
    this.persist();
    return cloneMission(mission);
  }

  async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      const now = Date.now();
      for (const mission of this.missions.values()) {
        if (mission.state !== "waiting-executor") continue;
        if (Date.parse(mission.nextAttemptAt) > now) continue;
        await this.execute(mission);
      }
    } finally {
      this.ticking = false;
    }
  }

  private async execute(mission: WorkerMission): Promise<void> {
    const adapter = this.registry.select(mission.request.requiredCapabilities);
    if (!adapter) {
      mission.updatedAt = new Date().toISOString();
      mission.nextAttemptAt = new Date(Date.now() + this.retryMs).toISOString();
      mission.summary = "No compatible adapter is registered yet; the worker will retry automatically.";
      this.persist();
      return;
    }

    const previousState = mission.state;
    mission.state = "executing";
    mission.adapterId = adapter.id;
    mission.attempts += 1;
    mission.updatedAt = new Date().toISOString();
    mission.summary = `Executing with adapter ${adapter.name}.`;
    this.persist();
    this.onTransition?.(cloneMission(mission), previousState);

    let result: ExternalMissionResult;
    try {
      result = await this.registry.execute(adapter, mission.request);
    } catch (error) {
      result = {
        operationId: mission.operationId,
        status: "failed",
        summary: error instanceof Error ? error.message : "Adapter execution failed.",
        output: {},
      };
    }

    const beforeResult = mission.state;
    mission.summary = result.summary;
    mission.output = result.output ?? {};
    mission.updatedAt = new Date().toISOString();

    if (result.status === "completed") {
      mission.state = "completed";
      mission.nextAttemptAt = mission.updatedAt;
    } else if (result.status === "waiting-authorization") {
      mission.state = "waiting-authorization";
      mission.nextAttemptAt = mission.updatedAt;
    } else if (mission.attempts < this.maxAttempts) {
      mission.state = "waiting-executor";
      mission.nextAttemptAt = new Date(Date.now() + this.retryMs).toISOString();
      mission.summary = `${result.summary} Automatic retry ${mission.attempts}/${this.maxAttempts} scheduled.`;
    } else {
      mission.state = "failed";
      mission.nextAttemptAt = mission.updatedAt;
    }

    this.persist();
    this.onTransition?.(cloneMission(mission), beforeResult);
  }

  private restore(): void {
    try {
      const parsed = JSON.parse(readFileSync(this.storagePath, "utf8")) as unknown;
      if (!Array.isArray(parsed)) return;
      for (const value of parsed) {
        if (!value || typeof value !== "object" || Array.isArray(value)) continue;
        const mission = value as Partial<WorkerMission>;
        if (typeof mission.operationId !== "string" || !mission.request || typeof mission.request !== "object") continue;
        const restored = mission as WorkerMission;
        if (restored.state === "executing") restored.state = "waiting-executor";
        if (restored.state === "waiting-executor") restored.nextAttemptAt = new Date().toISOString();
        this.missions.set(restored.operationId, restored);
      }
    } catch {
      // First boot or unreadable queue: start empty instead of blocking the engine.
    }
  }

  private persist(): void {
    try {
      mkdirSync(dirname(this.storagePath), { recursive: true });
      const temporary = `${this.storagePath}.tmp`;
      writeFileSync(temporary, JSON.stringify(this.list(), null, 2), "utf8");
      renameSync(temporary, this.storagePath);
    } catch (error) {
      console.error("Unable to persist autonomous mission queue", error);
    }
  }
}
