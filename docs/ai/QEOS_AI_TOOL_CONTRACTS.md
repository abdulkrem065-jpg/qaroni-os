# QEOS AI Tool Contracts & Specifications

**Authorization:** QEOS-AUTH-0090 & QEOS-AUTH-0090A  
**Module:** `src/core/ai/orchestration/types.ts`

---

## 1. Canonical Tool Contract (`AIToolContract`)

```typescript
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
  riskLevel: 'read_only' | 'low' | 'medium' | 'critical';
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
```

---

## 2. Trusted Execution Context Contract (`AIToolExecutionContext`)

```typescript
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
```

---

## 3. Normalized Execution Result Contract (`AIToolExecutionResult`)

```typescript
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
```
