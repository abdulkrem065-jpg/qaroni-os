# QEOS AI Tool Execution Lifecycle & Flow

**Authorization:** QEOS-AUTH-0090
**Module:** `src/core/ai/orchestration/AIToolInvocationEngine.ts`

---

## 1. Sequential Execution Flow

When the AI Hub or Agentic Planner invokes a tool call, the `AIToolInvocationEngine` processes the request through the following 12-step pipeline:

```text
 1. Receive Request (toolId, modelArgs, trustedContext)
 2. Audit Event Logged ('Proposed')
 3. Fetch Tool Definition from AIToolRegistry
 4. Validate Tool Enabled State
 5. Evaluate Security Policy via AIToolPermissionGuard
 6. Overwrite & Sanitize Tenant/Branch Parameters with Trusted Context
 7. Validate JSON Input Schema
 8. Enforce Idempotency Check (Check Idempotency Cache)
 9. Check Risk & HITL Approval Requirement (Generate Approval Request if Critical)
10. Execute Tool via Native Handler or MCPAdapter with Timeout & Exponential Backoff Retry
11. Normalize Result via AIToolResultNormalizer (Sanitize Data, Redact Secrets)
12. Audit Event Logged ('Completed' / 'Failed') & Return Standardized Result
```

---

## 2. Error Classification Hierarchy

Errors are classified deterministically in `AIToolExecutionResult.error.classification`:

- `validation_error`: Input arguments failed JSON Schema check or missing parameters.
- `permission_denied`: User lacks required RBAC permissions or attempted cross-tenant access.
- `approval_required`: Action requires human confirmation before execution.
- `timeout`: Tool execution exceeded `timeoutPolicy.timeoutMs`.
- `retryable_failure`: Transient error recovered or failed after retries.
- `permanent_failure`: Unrecoverable execution exception.
- `duplicate_execution`: Idempotency guard blocked duplicate execution.
- `context_expired`: Security token or context expired.
