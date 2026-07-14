import { createHash } from "node:crypto";

export type AutonomousJobStatus =
  | "queued"
  | "running"
  | "paused"
  | "blocked"
  | "ready"
  | "failed";

export interface AutonomousSignal {
  readonly id: string;
  readonly title: string;
  readonly objective?: string;
  readonly source: string;
  readonly payload?: Record<string, unknown>;
}

export interface AutonomousJob {
  readonly id: string;
  readonly idempotencyKey: string;
  readonly signal: AutonomousSignal;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly attempts: number;
  readonly status: AutonomousJobStatus;
  readonly operationId?: string;
  readonly result?: unknown;
  readonly obstacle?: string;
}

export interface AutonomousRunResult {
  readonly status: "ready" | "blocked" | "failed";
  readonly operationId?: string;
  readonly result?: unknown;
  readonly obstacle?: string;
}

export type AutonomousExecutor = (signal: AutonomousSignal, operationId: string) => Promise<AutonomousRunResult>;

function now(): string {
  return new Date().toISOString();
}

function fingerprint(signal: AutonomousSignal): string {
  return createHash("sha256")
    .update(JSON.stringify({ id: signal.id, source: signal.source, title: signal.title, objective: signal.objective }))
    .digest("hex")
    .slice(0, 20);
}

/**
 * Neutral, idempotent job registry for autonomous internal work.
 *
 * This registry deliberately does not know Seeds, Gardens or Harvests. The
 * domain application translates its own vocabulary at the boundary.
 * Persistence can later be replaced by a database adapter without changing
 * the HTTP contract. The in-memory implementation is honest: it survives a
 * closed browser tab, but not a server restart.
 */
export class AutonomousCycle {
  readonly #jobs = new Map<string, AutonomousJob>();
  readonly #executor: AutonomousExecutor;
  readonly #maxAttempts: number;

  constructor(executor: AutonomousExecutor, maxAttempts = 2) {
    this.#executor = executor;
    this.#maxAttempts = Math.max(1, maxAttempts);
  }

  list(): AutonomousJob[] {
    return [...this.#jobs.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  get(id: string): AutonomousJob | undefined {
    return this.#jobs.get(id);
  }

  enqueue(signal: AutonomousSignal): AutonomousJob {
    const key = fingerprint(signal);
    const existing = [...this.#jobs.values()].find((job) => job.idempotencyKey === key);
    if (existing) return existing;

    const timestamp = now();
    const job: AutonomousJob = {
      id: `autonomy_${key}`,
      idempotencyKey: key,
      signal,
      createdAt: timestamp,
      updatedAt: timestamp,
      attempts: 0,
      status: "queued",
    };
    this.#jobs.set(job.id, job);
    return job;
  }

  async run(jobId: string): Promise<AutonomousJob> {
    const current = this.#jobs.get(jobId);
    if (!current) throw new Error(`Unknown autonomous job: ${jobId}`);
    if (current.status === "ready" || current.status === "running") return current;
    if (current.attempts >= this.#maxAttempts) {
      const failed = { ...current, status: "failed" as const, updatedAt: now(), obstacle: current.obstacle ?? "Maximum attempts reached." };
      this.#jobs.set(jobId, failed);
      return failed;
    }

    const operationId = `autonomous_${current.idempotencyKey}`;
    const running: AutonomousJob = {
      ...current,
      status: "running",
      attempts: current.attempts + 1,
      operationId,
      updatedAt: now(),
      obstacle: undefined,
    };
    this.#jobs.set(jobId, running);

    try {
      const outcome = await this.#executor(running.signal, operationId);
      const completed: AutonomousJob = {
        ...running,
        status: outcome.status,
        updatedAt: now(),
        operationId: outcome.operationId ?? operationId,
        result: outcome.result,
        obstacle: outcome.obstacle,
      };
      this.#jobs.set(jobId, completed);
      return completed;
    } catch (error) {
      const failed: AutonomousJob = {
        ...running,
        status: "failed",
        updatedAt: now(),
        obstacle: error instanceof Error ? error.message : "Autonomous execution failed.",
      };
      this.#jobs.set(jobId, failed);
      return failed;
    }
  }

  async tick(signals: readonly AutonomousSignal[]): Promise<AutonomousJob[]> {
    const jobs = signals.map((signal) => this.enqueue(signal));
    const runnable = jobs.filter((job) => job.status === "queued" || job.status === "paused");
    const results: AutonomousJob[] = [];
    for (const job of runnable) results.push(await this.run(job.id));
    return results.length ? results : jobs;
  }
}

export function isAutonomousSignal(value: unknown): value is AutonomousSignal {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const signal = value as Partial<AutonomousSignal>;
  return Boolean(signal.id?.trim() && signal.title?.trim() && signal.source?.trim());
}
