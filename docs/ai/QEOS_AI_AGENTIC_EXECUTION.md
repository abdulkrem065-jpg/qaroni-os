# QEOS Agentic Execution & Safeguards

**Authorization:** QEOS-AUTH-0090
**Reference:** QEOS-AUTH-0089.5

---

## 1. Multi-Step Agentic Loop Sequence

The AI Hub executes complex user goals using a multi-step agentic loop:

```text
Step 1: Reason / Think (AIThinkingStep)
   ↓
Step 2: Select Tool Call (AIToolCall)
   ↓
Step 3: Execute via AIToolInvocationEngine
   ↓
Step 4: Receive Normalized Observation (AIToolExecutionResult)
   ↓
Step 5: Reflect & Refine Plan
   ↓
Step 6: Final Executive Response
```

---

## 2. Infinite Loop Protection & Guardrails

To ensure safety and prevent unconstrained execution:

1. **Step Budget Limit:** Configurable `maxSteps` (default: 5 steps per user query).
2. **Timeout Budget:** Global execution timeout budget for entire agentic plan.
3. **Duplicate Call Detection:** Prevents identical tool calls with identical arguments in a single reasoning loop.
4. **Human-in-the-Loop Interruption:** Execution pauses immediately when encountering a `critical` tool requiring human confirmation (`status = 'approval_required'`).
5. **No Parallel Mutations:** Parallel execution is restricted to `read_only` tools. State-mutating tools execute serially with policy validation.
