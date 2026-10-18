# QEOS AI Tool Permission & Risk Model

**Authorization:** QEOS-AUTH-0090
**Module:** `src/core/ai/orchestration/AIToolPermissionGuard.ts`

---

## 1. Security Principles

1. **Model-Supplied Tenant Rejection:** Under no circumstances is an `organizationId` or `branchId` passed in the model prompt accepted as a source of truth. The trusted context from QEOS Security Session strictly overrides model arguments.
2. **Multi-Tenant Isolation:** If a model proposes an action targeting an `organizationId` or `branchId` outside the user's authorized security boundary, the request is instantly **REJECTED** with a security violation error.
3. **Role & Permission Check:** The user must explicitly possess ALL required permissions declared in `AIToolDefinition.requiredPermissions`.

---

## 2. Risk Classification Matrix

| Risk Level | Description | Example Tools | Approval Requirement |
|---|---|---|---|
| `read_only` | Query operations with zero side-effects | `sales.get_daily_summary`, `inventory.check_alerts` | Automated Execution |
| `low` | Reversible operational actions / recommendations | `ai.generate_recommendations` | Automated Execution |
| `medium` | Non-financial state mutations (draft creation) | `purchasing.create_draft_order` | Automated Execution with Policy Audit |
| `critical` | Financial postings, inventory adjustments, data deletion | `financial.write_off_debt` | **Explicit Human-in-the-Loop (HITL) Approval Required** |

---

## 3. Human-in-the-Loop (HITL) Workflow

```text
AI Proposes Action (Risk = critical)
               ↓
AIToolPermissionGuard (Verifies Tenant & Permissions)
               ↓
AIToolApprovalOrchestrator (Generates Pending Approval Request)
               ↓
User Notification / Approval Dialog
               ↓
Authorized Approver (Confirms / Declines in UI)
               ↓
AIToolInvocationEngine (Executes Tool upon Approval)
               ↓
Audit Service (Records Provenance)
```
