import type { OctopusResource, ResourceRequest, ResourceResult, ResourceStatus } from "../resource-manager.js";

export interface PublisherResourceOptions {
  baseUrl?: string;
}

interface PublisherArtifact {
  title?: string;
  content?: string;
  mimeType?: string | null;
  metadata?: Record<string, unknown>;
}

function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function baseUrl(options: PublisherResourceOptions): string {
  return (options.baseUrl ?? process.env.PUBLISHER_API_URL ?? "https://blacklace-publisher-api.onrender.com")
    .trim()
    .replace(/\/$/, "");
}

function artifactFromPayload(payload: unknown): PublisherArtifact | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const artifact = (payload as { artifact?: unknown }).artifact;
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) return null;
  return artifact as PublisherArtifact;
}

export class PublisherResource implements OctopusResource {
  readonly id = "publisher";
  readonly name = "Publisher Production Engine";
  private readonly url: string;

  constructor(options: PublisherResourceOptions = {}) {
    this.url = baseUrl(options);
  }

  async status(): Promise<ResourceStatus> {
    if (!this.url) return "needs-configuration";
    try {
      const response = await fetch(`${this.url}/api/production/diagnostics`);
      return response.ok ? "available" : "unavailable";
    } catch {
      return "unavailable";
    }
  }

  async execute(request: ResourceRequest): Promise<ResourceResult> {
    if (!this.url) {
      return {
        resourceId: this.id,
        status: "error",
        output: {},
        message: "Publisher API is not configured.",
      };
    }

    try {
      const response = await fetch(`${this.url}/api/production/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Octopus-Caller": "octopus-engine" },
        body: JSON.stringify({
          capability: "copy.generate",
          requestId: request.missionId,
          input: {
            title: safeText(request.input.title) || "Récolte Publisher",
            prompt: safeText(request.input.prompt),
            system: safeText(request.input.system),
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload && typeof payload === "object" && "error" in payload
          ? String(payload.error)
          : `Publisher Production Engine HTTP ${response.status}`;
        return { resourceId: this.id, status: "error", output: {}, message };
      }

      const artifact = artifactFromPayload(payload);
      const text = safeText(artifact?.content);
      if (!artifact || !text) {
        return {
          resourceId: this.id,
          status: "error",
          output: {},
          message: "Publisher returned no Markdown artifact.",
        };
      }

      return {
        resourceId: this.id,
        status: "success",
        output: {
          text,
          title: artifact.title ?? "Récolte Publisher",
          artifacts: [{
            artifactType: "markdown",
            type: "markdown",
            title: artifact.title ?? "Récolte Publisher",
            content: { text },
            artifact: text,
            mimeType: artifact.mimeType ?? "text/markdown",
            status: "completed",
            metadata: artifact.metadata ?? {},
          }],
          provider: artifact.metadata?.provider ?? "publisher",
          model: artifact.metadata?.model ?? null,
        },
      };
    } catch (error) {
      return {
        resourceId: this.id,
        status: "error",
        output: {},
        message: error instanceof Error ? error.message : "Publisher execution failed.",
      };
    }
  }
}
