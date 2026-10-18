export type AIToolLifecycleState =
  | 'DRAFT'
  | 'REGISTERED'
  | 'VALIDATED'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'DISABLED'
  | 'RETIRED';

export type AIToolStopLevel =
  | 'STEP_STOP'
  | 'EXECUTION_STOP'
  | 'TOOL_DISABLE'
  | 'GLOBAL_AI_STOP';

export type AIToolHardStopReason =
  | 'AUTHORIZATION_FAILURE'
  | 'PERMISSION_FAILURE'
  | 'RISK_POLICY_EXCEEDED'
  | 'VERSION_MISMATCH'
  | 'SCHEMA_MISMATCH'
  | 'APPROVAL_EXPIRED'
  | 'CONTEXT_CORRUPTED'
  | 'TENANT_BOUNDARY_BREACH'
  | 'UNREGISTERED_TOOL'
  | 'UNAUTHORIZED_CREDENTIAL'
  | 'UNVERIFIABLE_SENSITIVE_RESULT'
  | 'INVALID_STATE_FOR_OPERATION'
  | 'ARCHITECTURAL_AMBIGUITY'
  | 'UNPROVEN_AUTHORITY';

export type AIToolAmbiguityType = 'BLOCKING_AMBIGUITY' | 'NON_BLOCKING_AMBIGUITY';

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

export interface AIToolTransitionRequest {
  toolId: string;
  requestedState: AIToolLifecycleState;
  authorityUserId: string;
  authorityRole: string; // Must be QEOS_GOVERNANCE_AUTHORITY or GOVERNANCE_ADMIN
  reason: string;
  preconditions: AIToolLifecyclePreconditions;
  replacementToolId?: string;
}

export interface AIToolTransitionRecord {
  transitionId: string;
  toolId: string;
  fromState: AIToolLifecycleState;
  toState: AIToolLifecycleState;
  authorizedBy: string;
  timestamp: Date;
  reason: string;
  status: 'SUCCESS' | 'REJECTED';
  rejectionReason?: string;
}

export interface AIToolStopExecutionEvent {
  stopId: string;
  level: AIToolStopLevel;
  reason: AIToolHardStopReason;
  toolId?: string;
  executionId?: string;
  triggeredByComponent: string;
  details: string;
  timestamp: Date;
}

export interface AIToolAmbiguityEvent {
  ambiguityId: string;
  type: AIToolAmbiguityType;
  description: string;
  component: string;
  actionTaken: 'STOPPED' | 'LOGGED_NON_BLOCKING';
  timestamp: Date;
}
