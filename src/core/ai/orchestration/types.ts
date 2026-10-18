export type MCPProtocolVersion = '2024-11-05' | '2026-07-28';

export type AIToolRiskLevel = 'read_only' | 'low' | 'medium' | 'critical';

export interface AIToolSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
}

export type AIToolErrorClassification =
  | 'validation_error'
  | 'permission_denied'
  | 'approval_required'
  | 'timeout'
  | 'retryable_failure'
  | 'permanent_failure'
  | 'external_service_failure'
  | 'duplicate_execution'
  | 'context_expired';

/**
 * Canonical Tool Contract
 * Unified QEOS AI Tool Contract specification across all domains.
 */
export interface AIToolContract {
  toolId: string;
  version: string;
  name: string;
  description: string;
  category: 'inventory' | 'financial' | 'sales' | 'purchasing' | 'system' | 'reporting' | string;
  protocol: 'native' | 'mcp';
  inputSchema: AIToolSchema;
  outputSchema?: AIToolSchema;
  requiredPermissions: string[];
  riskLevel: AIToolRiskLevel;
  sideEffects: boolean;
  idempotencyPolicy: {
    enabled: boolean;
    keyHeader?: string;
    ttlSeconds?: number;
  };
  timeoutPolicy: {
    timeoutMs: number;
  };
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  auditPolicy: {
    logInput: boolean;
    logOutput: boolean;
    retentionDays?: number;
  };
  confirmationPolicy: {
    requireHumanApproval: boolean;
    approvalRole?: string;
  };
  contextRequirements?: {
    requireOrgId: boolean;
    requireBranchId: boolean;
    requireUserId: boolean;
  };
  enabled: boolean;
  mcpServerId?: string;
  handler?: (args: Record<string, any>, executionContext: AIToolExecutionContext) => Promise<any>;
}

/** @deprecated Legacy alias for AIToolContract */
export type AIToolDefinition = AIToolContract;

export interface AIToolExecutionPolicy {
  idempotency: {
    enabled: boolean;
    keyHeader?: string;
    ttlSeconds?: number;
  };
  timeout: {
    timeoutMs: number;
  };
  retry: {
    maxRetries: number;
    backoffMs: number;
  };
  audit: {
    logInput: boolean;
    logOutput: boolean;
    retentionDays?: number;
  };
  confirmation: {
    requireHumanApproval: boolean;
    approvalRole?: string;
  };
}

export interface AIToolExecutionContext {
  userId: string;
  organizationId: string;
  branchId: string;
  role: string;
  permissions: string[];
  language: string;
  timezone: string;
  currentModule: string;
  currentScreen: string;
  sessionId: string;
  conversationId: string;
  correlationId: string;
  requestId: string;
}

export interface AIToolDiscoveryRequest {
  context: AIToolExecutionContext;
  options?: {
    category?: string;
    maxRiskLevel?: AIToolRiskLevel;
    protocol?: 'native' | 'mcp';
    limit?: number;
  };
}

export interface AIToolDiscoveryResult {
  tools: AIToolContract[];
  discoveredCount: number;
  timestamp: Date;
}

export interface AIToolExecutionRequest {
  executionId: string;
  toolId: string;
  args: Record<string, any>;
  context: AIToolExecutionContext;
  riskLevel: AIToolRiskLevel;
  protocol: 'native' | 'mcp';
  mcpServerId?: string;
  idempotencyKey?: string;
}

export interface AIToolAuthorizationDecision {
  authorized: boolean;
  reason?: string;
  sanitizedArgs?: Record<string, any>;
  errorClassification?: AIToolErrorClassification;
}

export interface AIToolExecutionError {
  code: string;
  message: string;
  classification: AIToolErrorClassification;
}

export interface AIToolExecutionResult {
  executionId: string;
  toolId: string;
  status: 'success' | 'failed' | 'rejected' | 'approval_required' | 'timeout';
  data?: any;
  metadata: {
    executionDurationMs: number;
    protocol: 'native' | 'mcp';
    mcpServerId?: string;
    idempotentHit?: boolean;
    sanitized?: boolean;
  };
  warnings?: string[];
  error?: AIToolExecutionError;
  source: string;
  duration: number;
  correlationId: string;
  auditId: string;
}

export interface AIToolApprovalRequest {
  approvalId: string;
  executionId: string;
  toolId: string;
  args: Record<string, any>;
  requestedBy: {
    userId: string;
    role: string;
  };
  targetOrgId: string;
  targetBranchId: string;
  riskLevel: AIToolRiskLevel;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: Date;
  approvedBy?: {
    userId: string;
    role: string;
    timestamp: Date;
  };
}

/**
 * Canonical Approval Decision
 * Represents the authorization decision made by a human approver.
 */
export interface AIToolApprovalDecision {
  approvalId: string;
  status: 'approved' | 'rejected';
  reason?: string;
  authorizedByUserId: string;
}

/** @deprecated Legacy alias for AIToolApprovalDecision */
export type AIToolApprovalResult = AIToolApprovalDecision;

export interface AIAgenticStepResult {
  stepNumber: number;
  status: 'success' | 'failed' | 'approval_required';
  observation?: any;
  error?: string;
  durationMs: number;
}

export interface AIAgenticExecution {
  executionId: string;
  goal: string;
  steps: any[];
  status: 'in_progress' | 'completed' | 'failed' | 'awaiting_approval';
  startTime: Date;
  endTime?: Date;
}

export interface MCPToolDefinition {
  name: string;
  description?: string;
  inputSchema: Record<string, any>;
  category?: string;
  riskLevel?: AIToolRiskLevel;
  sideEffects?: boolean;
  timeoutMs?: number;
}

export interface IMCPToolAdapter {
  protocolVersion: MCPProtocolVersion;
  discoverTools(mcpServerId: string): Promise<AIToolContract[]>;
  executeTool(
    mcpServerId: string,
    toolId: string,
    args: Record<string, any>,
    context: AIToolExecutionContext
  ): Promise<any>;
  translateSchema(mcpSchema: any): AIToolSchema;
  validateAuthToken(token: string, audience: string): Promise<boolean>;
}

export interface INativeToolAdapter {
  executeNativeTool(
    toolId: string,
    args: Record<string, any>,
    context: AIToolExecutionContext
  ): Promise<any>;
}

/**
 * Canonical Execution Audit Event
 */
export interface AIToolExecutionAudit {
  auditId: string;
  executionId: string;
  correlationId: string;
  toolId: string;
  toolVersion: string;
  protocol: 'native' | 'mcp';
  mcpServerId?: string;
  userId: string;
  organizationId: string;
  branchId: string;
  riskLevel: AIToolRiskLevel;
  status: 'Proposed' | 'Authorized' | 'ApprovalRequired' | 'Approved' | 'Executing' | 'Completed' | 'Failed' | 'Rejected';
  timestamp: Date;
  durationMs?: number;
  errorClassification?: AIToolErrorClassification;
  argsSummary?: Record<string, any>;
  resultSummary?: Record<string, any>;
}

/** @deprecated Legacy alias for AIToolExecutionAudit */
export type AIToolAuditEvent = AIToolExecutionAudit;
