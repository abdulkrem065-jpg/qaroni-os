# QEOS Enterprise AI Tool Governance Constitution

**Authorization Directive:** QEOS-AUTH-0091  
**Scope:** AI Core / Tool Lifecycle / Governance & Stop Authority Boundaries  
**Status:** **OFFICIAL SINGLE SOURCE OF TRUTH FOR AI TOOL GOVERNANCE**

---

## 1. Governance Authority Matrix

| Actor / Component | May Read Tool State | May Propose Transitions | May Authorize State Transitions | May Trigger Stop | May Reset Global Stop |
|---|---|---|---|---|---|
| **QEOS Governance Authority** (`GOVERNANCE_ADMIN` / `CHIEF_ARCHITECT`) | ✅ | ✅ | **YES (Sole Source)** | ✅ | **YES** |
| **AI Model / LLM** | ✅ | ✅ (Proposal Only) | ❌ **PROHIBITED** | ❌ | ❌ |
| **Agentic Planner / Hub** | ✅ | ✅ (Proposal Only) | ❌ **PROHIBITED** | ✅ (`STEP_STOP`/`EXECUTION_STOP`) | ❌ |
| **AIToolPermissionGuard** | ✅ | ❌ | ❌ **PROHIBITED** | ✅ (`STEP_STOP`) | ❌ |
| **MCP Server / Adapter** | ✅ | ❌ | ❌ **PROHIBITED** | ✅ (`STEP_STOP`) | ❌ |
| **User Interface (UI)** | ✅ | ✅ (Request Only) | ❌ **PROHIBITED** | ✅ (`TOOL_DISABLE` via Admin) | ❌ |

---

## 2. Stop Authority & Levels

Any subsystem discovering an authorization failure, tenant breach, schema corruption, or policy violation has the authority to issue an immediate **STOP**.

| Stop Level | Triggered By | Action / Scope |
|---|---|---|
| `STEP_STOP` | Invocation Engine / Permission Guard | Halts the current tool execution step. |
| `EXECUTION_STOP` | Agentic Execution Engine / Ambiguity Gate | Halts multi-step agentic execution plan. |
| `TOOL_DISABLE` | Governance Authority | Transitions tool lifecycle state to `DISABLED`. |
| `GLOBAL_AI_STOP` | Security / Governance Authority | Freezes all AI model operations across the entire platform. |

> **Crucial Rule:** STOP does not mean RETIRE. Stopping freezes execution; re-activation requires explicit Governance Revalidation + Authorization.

---

## 3. Architectural Ambiguity Authority (`ARCHITECTURAL_AMBIGUITY`)

When system components discover uncertainty regarding authority, source of truth, contract versions, schema policies, or execution boundaries:
- **`BLOCKING_AMBIGUITY`**: The system **DOES NOT GUESS**. Triggers immediate `STOP` + `ARCHITECTURAL REVIEW`.
- **`NON_BLOCKING_AMBIGUITY`**: Logged as an audit trace; execution proceeds under default strict policy.

```text
AMBIGUITY DETECTED ──> STOP ──> ARCHITECTURAL REVIEW ──> DECISION ──> RESUME
```

---

## 4. Unified Tool Lifecycle States

```text
DRAFT
  ↓
REGISTERED
  ↓
VALIDATED
  ↓
ACTIVE
  ↓
DEPRECATED
  ↓
DISABLED
  ↓
RETIRED
```

---

## 5. Official Transition Table

| From State | Requested State | Allowed | Condition / Gate |
|---|---|---|---|
| `DRAFT` | `REGISTERED` | YES | Identity + Contract valid |
| `REGISTERED` | `VALIDATED` | YES | Schema + Source + Trust + Risk + Policy PASS |
| `VALIDATED` | `ACTIVE` | YES | Governance Admission + Activation Authorization |
| `ACTIVE` | `DEPRECATED` | YES | Reason + Replacement/Removal metadata |
| `ACTIVE` | `DISABLED` | YES | Disable Authorization + Reason |
| `DEPRECATED` | `DISABLED` | YES | Disable Authorization |
| `DISABLED` | `ACTIVE` | YES | Revalidation + Governance Authorization |
| `DISABLED` | `DEPRECATED` | YES | Governance decision |
| `DISABLED` | `RETIRED` | YES | Retirement Authorization + No active dependencies |
| `DEPRECATED` | `RETIRED` | YES | Retirement Authorization + No active dependencies |
| `ACTIVE` | `RETIRED` | **NO** | Illegal Direct Path; must pass through `DISABLED` or `DEPRECATED` |
| `RETIRED` | `ACTIVE` | **NO** | Terminal State |
| `RETIRED` | `DRAFT` | **NO** | Terminal State |
| `ANY` | `DRAFT` | **NO** | Invalid Path |

---

## 6. Precondition Policy (`AIToolLifecyclePreconditions`)

```typescript
export interface AIToolLifecyclePreconditions {
  identityValid: boolean;
  contractValid: boolean;
  schemaValid: boolean;
  sourceTrustValid: boolean;
  riskPolicyValid: boolean;
  authorityValid: boolean;
  revalidationPassed?: boolean;
  noActiveDependencies?: boolean;
  replacementMetadataPresent?: boolean;
  disableReasonPresent?: boolean;
}
```

---

## 7. Model Non-Authority Rule

AI Models, Planners, MCP Servers, and UIs **CANNOT**:
1. Grant permissions to themselves or tools.
2. Mutate tool lifecycle states.
3. Bypass `AIToolPermissionGuard` or Human-in-the-Loop (HITL) approval gates.
4. Overwrite model-supplied tenant IDs.
5. Unilaterally resume from a `GLOBAL_AI_STOP` or `STEP_STOP`.
