export const MISSION_LIFECYCLE_STATES = [
  "received",
  "recorded",
  "planned",
  "waiting-executor",
  "executing",
  "waiting-authorization",
  "completed",
  "failed",
  "rejected",
] as const;

export type MissionLifecycleState = typeof MISSION_LIFECYCLE_STATES[number];

export interface MissionLifecycleTransition {
  from: MissionLifecycleState | null;
  to: MissionLifecycleState;
  at: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface MissionLifecycleSnapshot {
  missionId: string;
  state: MissionLifecycleState;
  createdAt: string;
  updatedAt: string;
  transitions: MissionLifecycleTransition[];
}

const ALLOWED_TRANSITIONS: Readonly<Record<MissionLifecycleState, readonly MissionLifecycleState[]>> = {
  received: ["recorded", "rejected", "failed"],
  recorded: ["planned", "rejected", "failed"],
  planned: ["waiting-executor", "executing", "completed", "failed"],
  "waiting-executor": ["executing", "failed", "rejected"],
  executing: ["waiting-authorization", "completed", "failed"],
  "waiting-authorization": ["executing", "completed", "failed", "rejected"],
  completed: [],
  failed: [],
  rejected: [],
};

export function isMissionLifecycleState(value: string): value is MissionLifecycleState {
  return (MISSION_LIFECYCLE_STATES as readonly string[]).includes(value);
}

export function canTransitionMission(from: MissionLifecycleState, to: MissionLifecycleState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export class MissionLifecycle {
  private readonly missions = new Map<string, MissionLifecycleSnapshot>();

  receive(missionId: string, metadata?: Record<string, unknown>): MissionLifecycleSnapshot {
    const id = missionId.trim();
    if (!id) throw new Error("Mission id is required.");
    if (this.missions.has(id)) throw new Error(`Mission ${id} already exists.`);

    const now = new Date().toISOString();
    const snapshot: MissionLifecycleSnapshot = {
      missionId: id,
      state: "received",
      createdAt: now,
      updatedAt: now,
      transitions: [{ from: null, to: "received", at: now, ...(metadata ? { metadata } : {}) }],
    };
    this.missions.set(id, snapshot);
    return this.clone(snapshot);
  }

  transition(
    missionId: string,
    to: MissionLifecycleState,
    options: { reason?: string; metadata?: Record<string, unknown> } = {},
  ): MissionLifecycleSnapshot {
    const current = this.missions.get(missionId);
    if (!current) throw new Error(`Mission ${missionId} was not received.`);
    if (!canTransitionMission(current.state, to)) {
      throw new Error(`Invalid mission transition: ${current.state} -> ${to}.`);
    }

    const now = new Date().toISOString();
    const next: MissionLifecycleSnapshot = {
      ...current,
      state: to,
      updatedAt: now,
      transitions: [
        ...current.transitions,
        {
          from: current.state,
          to,
          at: now,
          ...(options.reason ? { reason: options.reason } : {}),
          ...(options.metadata ? { metadata: options.metadata } : {}),
        },
      ],
    };
    this.missions.set(missionId, next);
    return this.clone(next);
  }

  get(missionId: string): MissionLifecycleSnapshot | undefined {
    const snapshot = this.missions.get(missionId);
    return snapshot ? this.clone(snapshot) : undefined;
  }

  list(): MissionLifecycleSnapshot[] {
    return [...this.missions.values()].map((snapshot) => this.clone(snapshot));
  }

  private clone(snapshot: MissionLifecycleSnapshot): MissionLifecycleSnapshot {
    return {
      ...snapshot,
      transitions: snapshot.transitions.map((transition) => ({
        ...transition,
        ...(transition.metadata ? { metadata: { ...transition.metadata } } : {}),
      })),
    };
  }
}
