# QEOS Enterprise AI Tool Orchestration Engine

**Authorization:** QEOS-AUTH-0090
**Reference:** QEOS-AUTH-0089.5 (AI Architecture Revalidation & Agentic Era Upgrade)
**Architecture Scope:** AI Core / Application Layer / Security Boundary

---

## 1. Architectural Philosophy

> **The model proposes tool calls; QEOS decides, secures, executes, normalizes, and audits.**

The AI Tool Orchestration Engine is the official execution layer between **QEOS AI Hub** and **QEOS Enterprise Capabilities**. AI models (Gemini, OpenAI, Claude, DeepSeek) are treated as non-trusted reasoning participants operating strictly within QEOS tenant, identity, permission, risk, and approval boundaries.

---

## 2. Single Intelligence Principle Enforcement

The system maintains absolute adherence to the **Single Intelligence Principle**:
- **ONE AI ENGINE**
- **ONE AI HUB**
- **ONE MEMORY ENGINE**
- **ONE CONTEXT ENGINE**
- **ONE TOOL ORCHESTRATION ENGINE**

No domain module (Sales, Inventory, Financial, CRM, Purchasing) owns an independent AI instance or chatbot. All modules expose tools to the central AI Tool Orchestration Engine.

---

## 3. Core Architecture & Execution Pipeline

```text
User Request
    ↓
QEOS AI Hub
    ↓
Agentic Planner
    ↓
Tool Discovery Engine (Context & Risk Filtered)
    ↓
Tool Policy / Permission Guard (Tenant Isolation & RBAC)
    ↓
Trusted Execution Context Injection (Non-model generated)
    ↓
Human Approval Gate (HITL for Critical Actions)
    ↓
Tool Invocation Engine (Timeout, Retry, Idempotency)
    ↓
┌──────────────────────────────────────────┐
│ Native QEOS Tools                        │
│ MCP-compatible Tools (IMCPToolAdapter)   │
│ Internal Application Services            │
│ External Connectors                      │
└──────────────────────────────────────────┘
    ↓
Result Normalizer (Sanitize, Redact Secrets, Typed Result)
    ↓
Audit Service (Lifecycle Provenance Log)
    ↓
AI Hub & Agentic Loop
    ↓
Final Response
```

---

## 4. Key Subsystem Responsibilities

1. **`AIToolRegistry`**: Centralized store of tool definitions (`toolId`, `version`, `inputSchema`, `riskLevel`, `idempotencyPolicy`, `timeoutPolicy`, `retryPolicy`, `auditPolicy`, `confirmationPolicy`).
2. **`AIToolDiscoveryEngine`**: Deterministic, context-aware filtering based on user permissions, organization ID, branch ID, module context, and maximum allowed risk level.
3. **`AIToolPermissionGuard`**: Strictly enforces tenant/branch security. **REJECTS** model-supplied `organizationId` or `branchId` if different from the authenticated security context.
4. **`AIToolApprovalOrchestrator`**: Manages Human-in-the-Loop (HITL) approval requests (`AIToolApprovalRequest`) for `critical` risk operations.
5. **`AIToolInvocationEngine`**: Executes native handlers or MCP adapters with schema validation, idempotency caching, timeout handling, and exponential backoff retries.
6. **`AIToolResultNormalizer`**: Normalizes output into standardized `AIToolExecutionResult` and redacts credentials/secrets.
7. **`AIToolAuditService`**: Logs full execution provenance (`Proposed` -> `Authorized` -> `Approved` -> `Executed` -> `Completed` / `Failed`).
8. **`MCPToolAdapter`**: Provides interoperability with remote/local MCP (Model Context Protocol) servers (`2024-11-05` and `2026-07-28` versions) without making MCP the security authority.
