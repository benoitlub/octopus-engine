import { randomUUID } from "node:crypto";
import { AutonomousWakeStore } from "./autonomous-wake-store.js";
import type { AutonomousWake, RunnerTickResult } from "./types.js";

export interface AutonomousRunnerOptions {
  store?: AutonomousWakeStore;
  octopusUrl?: string;
  ownerId?: string;
  leaseMs?: number;
  fetchImpl?: typeof fetch;
  onEvent?: (kind: string, wake: AutonomousWake, payload?: Record<string, unknown>) => void | Promise<void>;
}

export class AutonomousRunner {
  private readonly store: AutonomousWakeStore;
  private readonly octopusUrl: string;
  private readonly ownerId: string;
  private readonly leaseMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly onEvent?: AutonomousRunnerOptions["onEvent"];

  constructor(options: AutonomousRunnerOptions = {}) {
    this.store = options.store ?? new AutonomousWakeStore();
    this.octopusUrl = (options.octopusUrl ?? process.env.OCTOPUS_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
    this.ownerId = options.ownerId ?? `${process.pid}:${randomUUID()}`;
    this.leaseMs = options.leaseMs ?? 60_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.onEvent = options.onEvent;
  }

  async tick(now = new Date()): Promise<RunnerTickResult> {
    const due = await this.store.due(now);
    const result: RunnerTickResult = { checked: due.length, claimed: 0, completed: 0, failed: 0, skipped: 0 };

    for (const candidate of due) {
      const wake = await this.store.claim(candidate.id, this.ownerId, this.leaseMs, now);
      if (!wake) {
        result.skipped += 1;
        continue;
      }
      result.claimed += 1;
      await this.emit("wake.claimed", wake);
      const outcome = await this.dispatch(wake, now);
      if (outcome) result.completed += 1;
      else result.failed += 1;
    }

    return result;
  }

  private async dispatch(wake: AutonomousWake, now: Date): Promise<boolean> {
    const operationId = wake.mission.operationId ?? `wake:${wake.id}:${now.toISOString()}`;
    wake.status = "dispatched";
    wake.attempts += 1;
    wake.lastRunAt = now.toISOString();
    wake.updatedAt = now.toISOString();
    await this.store.save(wake);
    await this.emit("wake.dispatched", wake, { operationId });

    try {
      const response = await this.fetchImpl(`${this.octopusUrl}/mission`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": operationId },
        body: JSON.stringify({ ...wake.mission, operationId }),
      });
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok || payload.status === "failed" || payload.status === "rejected") {
        throw new Error(typeof payload.summary === "string" ? payload.summary : `Mission dispatch failed (${response.status}).`);
      }

      const completedAt = new Date();
      wake.status = "completed";
      wake.lastCompletedAt = completedAt.toISOString();
      wake.lastResult = payload;
      wake.lastError = undefined;
      wake.lockOwner = undefined;
      wake.lockUntil = undefined;
      wake.nextRunAt = wake.intervalMs ? new Date(completedAt.getTime() + wake.intervalMs).toISOString() : "9999-12-31T23:59:59.999Z";
      wake.updatedAt = completedAt.toISOString();
      await this.store.save(wake);
      await this.emit("wake.completed", wake, { operationId, status: payload.status });
      return true;
    } catch (error) {
      const failedAt = new Date();
      wake.status = "failed";
      wake.lastError = error instanceof Error ? error.message : "Unknown autonomous wake failure.";
      wake.lockOwner = undefined;
      wake.lockUntil = undefined;
      const retryDelay = Math.min(3_600_000, 30_000 * Math.max(1, wake.attempts));
      wake.nextRunAt = wake.attempts >= wake.maxAttempts ? "9999-12-31T23:59:59.999Z" : new Date(failedAt.getTime() + retryDelay).toISOString();
      wake.updatedAt = failedAt.toISOString();
      await this.store.save(wake);
      await this.emit("wake.failed", wake, { operationId, error: wake.lastError });
      return false;
    }
  }

  private async emit(kind: string, wake: AutonomousWake, payload: Record<string, unknown> = {}): Promise<void> {
    await this.onEvent?.(kind, wake, payload);
  }
}
