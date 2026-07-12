export interface ExecutionContext {
  id: string;
  label?: string;
  objective?: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionAuthorizationPolicy {
  internalWork?: "allowed" | "requires-approval";
  externalAction?: "allowed" | "requires-human-approval";
}

export interface ExecutionRequest {
  operationId: string;
  title: string;
  objective: string;
  context: ExecutionContext;
  requiredCapabilities: string[];
  prompt?: string;
  authorizedResources?: string[];
  authorizationPolicy?: ExecutionAuthorizationPolicy;
}

export interface ExecutionArtifact {
  id?: string;
  kind: string;
  title?: string;
  content?: unknown;
  metadata?: Record<string, unknown>;
}

export interface ExecutionResult {
  operationId: string;
  status: "completed" | "waiting-authorization" | "failed";
  contextId: string;
  executorId?: string;
  summary: string;
  output: Record<string, unknown>;
  artifacts?: ExecutionArtifact[];
  diagnostics?: string[];
}
