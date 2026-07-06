import type { OctopusResource, ResourceRequest, ResourceResult, ResourceStatus } from "../resource-manager.js";

export interface MistralResourceOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

interface MistralUsagePayload {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface MistralChatPayload {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: MistralUsagePayload;
}

function estimateCostEur(model: string, usage?: MistralUsagePayload): number | undefined {
  if (!usage) return undefined;
  const promptTokens = usage.prompt_tokens ?? 0;
  const completionTokens = usage.completion_tokens ?? 0;
  const normalized = model.toLowerCase();
  const promptPerMillion = normalized.includes("large") ? 1.8 : 0.4;
  const completionPerMillion = normalized.includes("large") ? 5.4 : 1.2;
  return Number(((promptTokens / 1_000_000) * promptPerMillion + (completionTokens / 1_000_000) * completionPerMillion).toFixed(6));
}

export class MistralResource implements OctopusResource {
  readonly id = "mistral";
  readonly name = "Mistral AI";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(options: MistralResourceOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.MISTRAL_API_KEY ?? "";
    this.model = options.model ?? process.env.MISTRAL_MODEL ?? "mistral-large-latest";
    this.baseUrl = options.baseUrl ?? "https://api.mistral.ai/v1";
  }

  async status(): Promise<ResourceStatus> {
    if (!this.apiKey) return "needs-configuration";
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return response.ok ? "available" : "unavailable";
    } catch {
      return "unavailable";
    }
  }

  async execute(request: ResourceRequest): Promise<ResourceResult> {
    if (!this.apiKey) {
      return {
        resourceId: this.id,
        status: "error",
        output: {},
        message: "MISTRAL_API_KEY is not configured.",
      };
    }

    const prompt = String(request.input.prompt ?? "");
    const system = String(request.input.system ?? "You are an Octopus Engine resource. Return useful, structured output.");
    const startedAt = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 900,
        }),
      });

      const durationMs = Date.now() - startedAt;

      if (!response.ok) {
        return {
          resourceId: this.id,
          status: "error",
          output: {},
          message: `Mistral API error: ${response.status} ${response.statusText}`,
          usage: { model: this.model, durationMs },
        };
      }

      const data = (await response.json()) as MistralChatPayload;
      return {
        resourceId: this.id,
        status: "success",
        output: {
          text: data.choices?.[0]?.message?.content ?? "",
          model: this.model,
        },
        usage: {
          model: this.model,
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
          durationMs,
          estimatedCostEur: estimateCostEur(this.model, data.usage),
        },
      };
    } catch (error) {
      return {
        resourceId: this.id,
        status: "error",
        output: {},
        message: error instanceof Error ? error.message : "Unknown Mistral error.",
        usage: { model: this.model, durationMs: Date.now() - startedAt },
      };
    }
  }
}
