# QEOS AI Tool Audit & Observability Specification

**Authorization:** QEOS-AUTH-0090
**Module:** `src/core/ai/orchestration/AIToolAuditService.ts`

---

## 1. Audit Principles

Every tool execution initiated by the AI layer generates a tamper-evident audit trail tracking the full lifecycle of the request.

---

## 2. Audit Lifecycle States

```text
Proposed ──> Authorized ──> Approved ──> Executed ──> Completed / Failed / Rejected
```

- **Proposed**: Tool call proposed by AI model.
- **Authorized**: Permission guard verified tenant, role, and RBAC permissions.
- **Approved**: Human approver confirmed execution for critical risk tool.
- **Executed**: Execution initiated on native tool or remote MCP server.
- **Completed**: Execution finished successfully; result normalized and sanitized.
- **Failed**: Execution failed with classified error.
- **Rejected**: Execution rejected by security guard or human approver.

---

## 3. Audit Payload Schema (`AIToolAuditEvent`)

```typescript
export interface AIToolAuditEvent {
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
  riskLevel: 'read_only' | 'low' | 'medium' | 'critical';
  status: 'Proposed' | 'Authorized' | 'Approved' | 'Executed' | 'Completed' | 'Failed' | 'Rejected';
  timestamp: Date;
  durationMs?: number;
  errorClassification?: AIToolErrorClassification;
  argsSummary?: Record<string, any>;
  resultSummary?: Record<string, any>;
}
```
