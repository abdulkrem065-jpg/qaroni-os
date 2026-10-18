# QEOS Enterprise AI Tool Naming Constitution

**Authorization:** QEOS-AUTH-0090A  
**Scope:** AI Core / Application Layer / Security & Orchestration Boundaries  
**Status:** OFFICIAL CANONICAL NAMING REGISTRY

---

## 1. Philosophical Mandate

Every entity, contract, request, decision, result, event, and service within the QEOS AI Orchestration Engine must strictly adhere to the single canonical dictionary defined herein. Ambiguous, overlapping, or generic legacy names are deprecated and replaced by single-responsibility canonical names.

---

## 2. Official Canonical Naming Registry

| Architectural Layer | Responsibility | Canonical Name | Deprecated Legacy Names |
|---|---|---|---|
| **Contract** | Unified Tool Contract Specification | `AIToolContract` | `AITool`, `AIToolDefinition` |
| **Discovery** | Tool Discovery Input Request | `AIToolDiscoveryRequest` | `ToolSearchQuery` |
| **Discovery** | Tool Discovery Filtered Result | `AIToolDiscoveryResult` | `ToolSearchResult`, `ToolDiscoveryResponse` |
| **Execution** | Tool Execution Payload Request | `AIToolExecutionRequest` | `ToolCallRequest` |
| **Execution** | Trusted Non-Model Context | `AIToolExecutionContext` | `ToolContext` |
| **Execution** | Policy Declaration (Idempotency, Timeout, Retry) | `AIToolExecutionPolicy` | `ToolPolicy` |
| **Execution** | Permission Guard Authorization Output | `AIToolAuthorizationDecision` | `GuardCheckResult` |
| **Execution** | Classified Execution Error | `AIToolExecutionError` | `ToolError` |
| **Execution** | Normalized Execution Engine Result | `AIToolExecutionResult` | `AIToolResult` |
| **Approval** | Human-in-the-Loop Approval Request | `AIToolApprovalRequest` | `PendingApproval` |
| **Approval** | Human Approver Decision Output | `AIToolApprovalDecision` | `AIToolApprovalResult` |
| **Agentic** | Entire Agentic Workflow Session | `AIAgenticExecution` | `AgenticRun` |
| **Agentic** | Individual Agentic Reasoning Step | `AIAgenticStep` | `Step` |
| **Agentic** | Output Observation of Agentic Step | `AIAgenticStepResult` | `StepObservation` |
| **Observation** | Tool Call Result Observation in Conversation | `AIToolCallObservation` | `AIToolResult` |
| **Audit** | Lifecycle Execution Audit Event | `AIToolExecutionAudit` | `AIToolAuditEvent` |
| **Orchestrator** | Tool Registry Component | `AIToolRegistry` | `ToolStore` |
| **Orchestrator** | Discovery Engine Component | `AIToolDiscoveryEngine` | `ToolFinder` |
| **Orchestrator** | Security & Isolation Guard Component | `AIToolPermissionGuard` | `PermissionChecker` |
| **Orchestrator** | Execution Invocation Engine | `AIToolInvocationEngine` | `ToolExecutor` |
| **Orchestrator** | Output Normalizer & Sanitizer | `AIToolResultNormalizer` | `ResultCleaner` |
| **Orchestrator** | Execution Audit Service | `AIToolAuditService` | `AuditLogger` |
| **Adapter** | Native Tool Execution Adapter Interface | `INativeToolAdapter` | `NativeHandler` |
| **Adapter** | MCP Interoperability Adapter Interface | `IMCPToolAdapter` | `MCPAdapter` |
| **Adapter** | MCP Tool Schema Definition | `MCPToolDefinition` | `MCPTool` |
| **Adapter** | MCP Protocol Version Enum | `MCPProtocolVersion` | `MCPVersion` |

---

## 3. Tool Naming Convention

All tool identifiers exposed to models follow the deterministic convention:

```text
<domain>_<verb>_<object>
```

### Examples:
- `sales_get_daily_summary`
- `inventory_check_stock_alerts`
- `purchasing_create_draft_order`
- `financial_write_off_debt`
