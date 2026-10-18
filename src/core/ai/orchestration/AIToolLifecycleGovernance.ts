import {
  AIToolAmbiguityEvent,
  AIToolAmbiguityType,
  AIToolHardStopReason,
  AIToolLifecyclePreconditions,
  AIToolLifecycleState,
  AIToolStopExecutionEvent,
  AIToolStopLevel,
  AIToolTransitionRecord,
  AIToolTransitionRequest
} from './AIToolGovernanceTypes';

export class AIToolLifecycleGovernance {
  private static instance: AIToolLifecycleGovernance;

  // Single Source of Truth for Tool Lifecycle States
  private toolStates: Map<string, AIToolLifecycleState> = new Map();
  private transitionHistory: AIToolTransitionRecord[] = [];
  private stopEvents: AIToolStopExecutionEvent[] = [];
  private ambiguityEvents: AIToolAmbiguityEvent[] = [];
  private globalAIStopEngaged = false;

  private constructor() {
    this.initializeBaselineStates();
  }

  public static getInstance(): AIToolLifecycleGovernance {
    if (!AIToolLifecycleGovernance.instance) {
      AIToolLifecycleGovernance.instance = new AIToolLifecycleGovernance();
    }
    return AIToolLifecycleGovernance.instance;
  }

  /**
   * Retrieves current canonical lifecycle state of a tool.
   */
  public getToolState(toolId: string): AIToolLifecycleState {
    return this.toolStates.get(toolId) || 'DRAFT';
  }

  /**
   * Checks if tool is in ACTIVE state and safe to execute.
   */
  public canExecute(toolId: string): { allowed: boolean; reason?: string } {
    if (this.globalAIStopEngaged) {
      return { allowed: false, reason: 'GLOBAL_AI_STOP engaged across system' };
    }

    const state = this.getToolState(toolId);
    if (state !== 'ACTIVE') {
      return {
        allowed: false,
        reason: `Governance Violation: Tool [${toolId}] is in [${state}] state, not ACTIVE`
      };
    }

    return { allowed: true };
  }

  /**
   * Transition Gate: Executes controlled lifecycle state mutation.
   * STRICT RULE: Authority must be QEOS_GOVERNANCE_AUTHORITY or GOVERNANCE_ADMIN.
   * Model/Planner/MCP/UI attempts are instantly REJECTED.
   */
  public requestTransition(request: AIToolTransitionRequest): AIToolTransitionRecord {
    const transitionId = `TRANS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const currentState = this.getToolState(request.toolId);
    const targetState = request.requestedState;

    // 1. Authority Validation - Reject non-governance actors
    const validRoles = new Set(['QEOS_GOVERNANCE_AUTHORITY', 'GOVERNANCE_ADMIN', 'CHIEF_ARCHITECT']);
    if (!validRoles.has(request.authorityRole)) {
      const rejectedRecord: AIToolTransitionRecord = {
        transitionId,
        toolId: request.toolId,
        fromState: currentState,
        toState: targetState,
        authorizedBy: request.authorityUserId,
        timestamp: new Date(),
        reason: request.reason,
        status: 'REJECTED',
        rejectionReason: `Unauthorized State Transition Attempt by role [${request.authorityRole}]. Model/AI/UI state mutations prohibited.`
      };
      this.transitionHistory.unshift(rejectedRecord);
      return rejectedRecord;
    }

    // 2. Validate Allowed Transition Matrix
    const isMatrixAllowed = this.validateTransitionMatrix(currentState, targetState);
    if (!isMatrixAllowed.allowed) {
      const rejectedRecord: AIToolTransitionRecord = {
        transitionId,
        toolId: request.toolId,
        fromState: currentState,
        toState: targetState,
        authorizedBy: request.authorityUserId,
        timestamp: new Date(),
        reason: request.reason,
        status: 'REJECTED',
        rejectionReason: isMatrixAllowed.reason
      };
      this.transitionHistory.unshift(rejectedRecord);
      return rejectedRecord;
    }

    // 3. Precondition Validation
    const preconditionCheck = this.validatePreconditions(currentState, targetState, request.preconditions);
    if (!preconditionCheck.passed) {
      const rejectedRecord: AIToolTransitionRecord = {
        transitionId,
        toolId: request.toolId,
        fromState: currentState,
        toState: targetState,
        authorizedBy: request.authorityUserId,
        timestamp: new Date(),
        reason: request.reason,
        status: 'REJECTED',
        rejectionReason: preconditionCheck.reason
      };
      this.transitionHistory.unshift(rejectedRecord);
      return rejectedRecord;
    }

    // 4. Execute State Mutation & Record Audit
    this.toolStates.set(request.toolId, targetState);

    const successRecord: AIToolTransitionRecord = {
      transitionId,
      toolId: request.toolId,
      fromState: currentState,
      toState: targetState,
      authorizedBy: request.authorityUserId,
      timestamp: new Date(),
      reason: request.reason,
      status: 'SUCCESS'
    };

    this.transitionHistory.unshift(successRecord);
    return successRecord;
  }

  /**
   * Stop Authority: Triggers immediate halt upon discovering security/governance/data violation.
   */
  public triggerStop(
    level: AIToolStopLevel,
    reason: AIToolHardStopReason,
    details: string,
    triggeredByComponent: string,
    toolId?: string,
    executionId?: string
  ): AIToolStopExecutionEvent {
    const stopId = `STOP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const event: AIToolStopExecutionEvent = {
      stopId,
      level,
      reason,
      toolId,
      executionId,
      triggeredByComponent,
      details,
      timestamp: new Date()
    };

    this.stopEvents.unshift(event);

    if (level === 'GLOBAL_AI_STOP') {
      this.globalAIStopEngaged = true;
    } else if (level === 'TOOL_DISABLE' && toolId) {
      this.toolStates.set(toolId, 'DISABLED');
    }

    console.warn(`[QEOS_GOVERNANCE_STOP] [${level}] Reason: ${reason} | Details: ${details} | Component: ${triggeredByComponent}`);
    return event;
  }

  /**
   * Architectural Ambiguity Authority Gate.
   * If ambiguity is BLOCKING, halts execution without guessing.
   */
  public handleArchitecturalAmbiguity(
    type: AIToolAmbiguityType,
    description: string,
    component: string,
    toolId?: string,
    executionId?: string
  ): AIToolAmbiguityEvent {
    const ambiguityId = `AMBIG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const actionTaken = type === 'BLOCKING_AMBIGUITY' ? 'STOPPED' : 'LOGGED_NON_BLOCKING';

    const event: AIToolAmbiguityEvent = {
      ambiguityId,
      type,
      description,
      component,
      actionTaken,
      timestamp: new Date()
    };

    this.ambiguityEvents.unshift(event);

    if (type === 'BLOCKING_AMBIGUITY') {
      this.triggerStop(
        'EXECUTION_STOP',
        'ARCHITECTURAL_AMBIGUITY',
        `Architectural Ambiguity Detected: ${description}. System stopped execution rather than guessing.`,
        component,
        toolId,
        executionId
      );
    }

    return event;
  }

  /**
   * Resets global AI stop (requires Governance Authority).
   */
  public resetGlobalAIStop(authorityRole: string): boolean {
    if (authorityRole === 'QEOS_GOVERNANCE_AUTHORITY' || authorityRole === 'CHIEF_ARCHITECT') {
      this.globalAIStopEngaged = false;
      return true;
    }
    return false;
  }

  public isGlobalAIStopEngaged(): boolean {
    return this.globalAIStopEngaged;
  }

  public getTransitionHistory(toolId?: string): AIToolTransitionRecord[] {
    if (toolId) {
      return this.transitionHistory.filter(r => r.toolId === toolId);
    }
    return [...this.transitionHistory];
  }

  public getStopEvents(): AIToolStopExecutionEvent[] {
    return [...this.stopEvents];
  }

  /**
   * Validates official transition matrix rules.
   */
  private validateTransitionMatrix(
    from: AIToolLifecycleState,
    to: AIToolLifecycleState
  ): { allowed: boolean; reason?: string } {
    if (from === 'RETIRED') {
      return { allowed: false, reason: 'Terminal State Violation: RETIRED state is terminal and cannot transition to any state.' };
    }

    if (to === 'DRAFT') {
      return { allowed: false, reason: 'Invalid Transition: Cannot transition back to DRAFT from existing states.' };
    }

    if (from === 'ACTIVE' && to === 'RETIRED') {
      return { allowed: false, reason: 'Illegal Direct Transition: ACTIVE tools cannot transition directly to RETIRED. Must pass through DISABLED or DEPRECATED.' };
    }

    const validTransitions: Record<AIToolLifecycleState, AIToolLifecycleState[]> = {
      DRAFT: ['REGISTERED'],
      REGISTERED: ['VALIDATED'],
      VALIDATED: ['ACTIVE'],
      ACTIVE: ['DEPRECATED', 'DISABLED'],
      DEPRECATED: ['DISABLED', 'RETIRED'],
      DISABLED: ['ACTIVE', 'DEPRECATED', 'RETIRED'],
      RETIRED: []
    };

    const allowedTargets = validTransitions[from] || [];
    if (!allowedTargets.includes(to)) {
      return {
        allowed: false,
        reason: `Invalid Transition Path: Transition from [${from}] to [${to}] is prohibited in QEOS Lifecycle Table.`
      };
    }

    return { allowed: true };
  }

  /**
   * Validates required preconditions for transition gates.
   */
  private validatePreconditions(
    from: AIToolLifecycleState,
    to: AIToolLifecycleState,
    p: AIToolLifecyclePreconditions
  ): { passed: boolean; reason?: string } {
    if (to === 'REGISTERED' && (!p.identityValid || !p.contractValid)) {
      return { passed: false, reason: 'Precondition Failed: Tool identity or contract is invalid for REGISTERED state.' };
    }

    if (to === 'VALIDATED' && (!p.schemaValid || !p.sourceTrustValid || !p.riskPolicyValid)) {
      return { passed: false, reason: 'Precondition Failed: Schema, Source Trust, or Risk Policy validation failed for VALIDATED state.' };
    }

    if (to === 'ACTIVE' && (!p.authorityValid || (from === 'DISABLED' && !p.revalidationPassed))) {
      return { passed: false, reason: 'Precondition Failed: Activation requires explicit Governance Authority and Revalidation.' };
    }

    if (to === 'RETIRED' && p.noActiveDependencies === false) {
      return { passed: false, reason: 'Precondition Failed: Tool cannot be RETIRED while active system dependencies exist.' };
    }

    return { passed: true };
  }

  /**
   * Initializes baseline tool states for native built-in tools.
   */
  private initializeBaselineStates(): void {
    const builtInTools = [
      'sales_get_daily_summary',
      'inventory_check_stock_alerts',
      'purchasing_create_draft_order',
      'financial_write_off_debt',
      'qeos.sales.get_daily_summary',
      'qeos.inventory.check_stock_alerts',
      'qeos.purchasing.create_draft_order',
      'qeos.financial.write_off_debt'
    ];

    for (const toolId of builtInTools) {
      this.toolStates.set(toolId, 'ACTIVE');
    }
  }
}
