export type WakeStatus = "scheduled" | "claimed" | "dispatched" | "completed" | "failed" | "paused";

export interface WakeMission {
  operationId?: string;
  title: string;
  objective: string;
  requiredCapabilities: string[];
  authorizedResources?: string[];
  prompt?: string;
  context: {
    id: string;
    label?: string;
    objective?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface AutonomousWake {
  id: string;
  source: string;
  status: WakeStatus;
  nextRunAt: string;
  intervalMs?: number;
  mission: WakeMission;
  attempts: number;
  maxAttempts: number;
  lockOwner?: string;
  lockUntil?: string;
  lastRunAt?: string;
  lastCompletedAt?: string;
  lastError?: string;
  lastResult?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WakeStoreSnapshot {
  version: 1;
  wakes: AutonomousWake[];
}

export interface RunnerTickResult {
  checked: number;
  claimed: number;
  completed: number;
  failed: number;
  skipped: number;
}
