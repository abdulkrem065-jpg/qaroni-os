# QEOS ACCOUNTING IMMUTABILITY POLICY

## PURPOSE
To guarantee the absolute integrity and traceability of all financial data within the QEOS platform.

## CHAPTER 5: IMMUTABILITY CONSTITUTION

### POSTING BOUNDARIES
* **Journal Entries**: After a Journal is successfully posted, it becomes **IMMUTABLE**. It cannot be deleted or modified. Errors must be corrected via reversing or adjusting entries.
* **Period Closures**: After an Accounting Period is closed, it becomes **IMMUTABLE**.

### RE-OPENING RULES
* Re-opening a closed period requires explicit, high-level authorization.
* Every reopening action MUST generate an indelible audit event.

## CHAPTER 6: AUDIT CONSTITUTION

Every financial action (posting, closing, voiding, adjusting) MUST generate a comprehensive Audit Event containing:
* **Audit Event Type**
* **User** (Identity of the actor)
* **Organization** (Tenant boundary)
* **Timestamp** (Exact time of occurrence)
* **Previous Value** (State before action, if applicable)
* **New Value** (State after action)
* **Reason** (Justification for the action)

**ABSOLUTE RULE: No silent modifications are permitted in the financial core.**
