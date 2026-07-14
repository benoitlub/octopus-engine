import type { OctopusEngine } from "./octopus.js";

export type CreatureObservation = {
  id: string;
  timestamp: string;
  location?: string;
  source: "audio" | "manual" | "camera" | "ambient";
  species?: string;
  category: "animal" | "weather" | "human_activity" | "aircraft" | "unknown";
  confidence?: number;
  rawLabel: string;
  context: string;
  mediaRef?: string;
};

export type CreatureObservationAction =
  | { type: "speak_as_creature"; creature: string; text: string }
  | { type: "save_to_notion"; database?: string; payload?: Record<string, unknown> }
  | { type: "notify_user"; title: string; message: string }
  | { type: "ignore"; reason?: string };

export type CreatureObservationResponse = {
  observationId: string;
  actions: CreatureObservationAction[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseCreatureObservation(value: unknown): CreatureObservation | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id.trim()) return null;
  if (typeof value.timestamp !== "string" || !value.timestamp.trim()) return null;
  if (typeof value.rawLabel !== "string" || !value.rawLabel.trim()) return null;
  if (typeof value.context !== "string") return null;

  const sources = new Set(["audio", "manual", "camera", "ambient"]);
  const categories = new Set(["animal", "weather", "human_activity", "aircraft", "unknown"]);
  if (typeof value.source !== "string" || !sources.has(value.source)) return null;
  if (typeof value.category !== "string" || !categories.has(value.category)) return null;

  return {
    id: value.id,
    timestamp: value.timestamp,
    source: value.source as CreatureObservation["source"],
    category: value.category as CreatureObservation["category"],
    rawLabel: value.rawLabel,
    context: value.context,
    ...(typeof value.location === "string" ? { location: value.location } : {}),
    ...(typeof value.species === "string" ? { species: value.species } : {}),
    ...(typeof value.confidence === "number" ? { confidence: value.confidence } : {}),
    ...(typeof value.mediaRef === "string" ? { mediaRef: value.mediaRef } : {}),
  };
}

function fallbackVoice(observation: CreatureObservation) {
  const creature = observation.species || "Créature observatrice";
  if (observation.category === "aircraft") {
    return {
      creature,
      text: "Les grands oiseaux de métal traversent encore le ciel. Ils ne nichent jamais, mais les humains lèvent toujours la tête.",
    };
  }
  return {
    creature,
    text: observation.context.trim() || `J’ai remarqué ${observation.rawLabel.toLowerCase()} près d’ici.`,
  };
}

function extractText(output: unknown): string | null {
  if (!isRecord(output)) return null;
  if (typeof output.text === "string" && output.text.trim()) return output.text.trim();
  if (typeof output.content === "string" && output.content.trim()) return output.content.trim();
  return null;
}

export async function handleCreatureObservation(
  engine: OctopusEngine,
  observation: CreatureObservation,
): Promise<CreatureObservationResponse> {
  await engine.events.emit("CreatureObservationReceived", {
    observationId: observation.id,
    source: observation.source,
    category: observation.category,
    species: observation.species,
    confidence: observation.confidence,
    createdAt: observation.timestamp,
  });

  const fallback = fallbackVoice(observation);
  let voice = fallback;

  try {
    const mission = await engine.runtime.run({
      id: `creature_${observation.id}`,
      title: `Donner une voix à ${observation.species || observation.rawLabel}`,
      objective: "Produire une phrase brève, poétique et ancrée dans l’observation, dite par l’animal lui-même.",
      context: {
        id: `creature-sync:${observation.id}`,
        label: observation.species || observation.rawLabel,
        objective: observation.context,
        metadata: { source: "creature-sync", observation },
      },
      preferredTheme: "narrative",
      requiredCapabilities: ["narrative.generate"],
      authorizedResources: ["mistral"],
      prompt: [
        "Tu écris une seule phrase en français, 30 mots maximum.",
        `La voix est celle de : ${observation.species || "un animal témoin"}.`,
        `Observation : ${observation.rawLabel}.`,
        `Contexte : ${observation.context || "aucun détail supplémentaire"}.`,
        `Lieu : ${observation.location || "non précisé"}.`,
        "Ne donne aucune explication et ne mets pas de guillemets.",
      ].join("\n"),
    });

    const generated = extractText(mission.output);
    if (mission.status === "completed" && generated) {
      voice = { creature: observation.species || fallback.creature, text: generated };
    }
  } catch {
    // The endpoint must remain useful when Mistral or another resource is unavailable.
  }

  const actions: CreatureObservationAction[] = [
    { type: "speak_as_creature", ...voice },
    {
      type: "save_to_notion",
      database: "Creature-Sync observations",
      payload: { observation, voice, source: "octopus-engine" },
    },
  ];

  await engine.events.emit("CreatureObservationActionPrepared", {
    observationId: observation.id,
    actionTypes: actions.map((action) => action.type),
    createdAt: new Date().toISOString(),
  });

  return { observationId: observation.id, actions };
}
