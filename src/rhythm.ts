import type { ParcelSnapshot } from "./gardener.js";
import type { TentacleProfile } from "./tentacle.js";

export type OctopusDaypart = "night" | "morning" | "afternoon" | "evening";
export type RhythmActivityKind = "observe" | "train" | "maintain" | "prepare" | "ask-authorization" | "rest";

export interface RhythmContext {
  now: Date;
  parcels: ParcelSnapshot[];
  tentacles: TentacleProfile[];
  pendingAuthorizations: number;
}

export interface RhythmActivity {
  kind: RhythmActivityKind;
  title: string;
  reason: string;
  safeWithoutAuthorization: boolean;
}

export interface RhythmPlan {
  daypart: OctopusDaypart;
  activities: RhythmActivity[];
}

export function resolveDaypart(now: Date): OctopusDaypart {
  const hour = now.getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export class OctopusRhythm {
  plan(context: RhythmContext): RhythmPlan {
    const daypart = resolveDaypart(context.now);
    const weakTentacles = context.tentacles.filter((tentacle) => tentacle.health === "watch" || tentacle.health === "learning");
    const blockedParcels = context.parcels.filter((parcel) => parcel.status === "blocked" || parcel.status === "watch");
    const activities: RhythmActivity[] = [];

    if (daypart === "night") {
      activities.push({
        kind: "train",
        title: "Train and compare tentacles",
        reason: "Night is suited for low-risk maintenance and evaluation work.",
        safeWithoutAuthorization: true,
      });
    }

    if (daypart === "morning") {
      activities.push({
        kind: "observe",
        title: "Prepare gardener briefing",
        reason: "Morning should surface parcel news, blocked work, and authorization requests.",
        safeWithoutAuthorization: true,
      });
    }

    if (daypart === "afternoon") {
      activities.push({
        kind: "prepare",
        title: "Prepare useful outputs",
        reason: "Afternoon is suited for work that may be reviewed by the gardener or a client.",
        safeWithoutAuthorization: false,
      });
    }

    if (daypart === "evening") {
      activities.push({
        kind: "maintain",
        title: "Clean the garden state",
        reason: "Evening is suited for summarizing, archiving, and preparing tomorrow.",
        safeWithoutAuthorization: true,
      });
    }

    if (blockedParcels.length > 0 || context.pendingAuthorizations > 0) {
      activities.push({
        kind: "ask-authorization",
        title: "Ask the gardener for decisions",
        reason: `${blockedParcels.length} parcel(s) need attention and ${context.pendingAuthorizations} authorization(s) are pending.`,
        safeWithoutAuthorization: true,
      });
    }

    if (weakTentacles.length > 0) {
      activities.push({
        kind: "maintain",
        title: "Review weak or learning tentacles",
        reason: `${weakTentacles.length} tentacle(s) should be evaluated before they are trusted on important missions.`,
        safeWithoutAuthorization: true,
      });
    }

    if (activities.length === 0) {
      activities.push({
        kind: "rest",
        title: "Rest and observe",
        reason: "No urgent activity detected.",
        safeWithoutAuthorization: true,
      });
    }

    return { daypart, activities };
  }
}
