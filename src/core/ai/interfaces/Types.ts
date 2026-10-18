export type AIRole = 'system' | 'user' | 'assistant' | 'tool' | 'thought';

export interface AIThinkingStep {
  id: string;
  thought: string;
  timestamp: Date;
  confidence?: number;
  type?: 'reasoning' | 'plan_eval' | 'safety_check' | 'tool_selection';
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  mcpServerId?: string;
  riskLevel?: 'safe' | 'medium' | 'critical';
  requiresConfirmation?: boolean;
}

/**
 * Canonical Tool Call Observation
 * Represents the observed result or output from a tool call within a conversation turn or agentic step.
 */
export interface AIToolCallObservation {
  id: string;
  result: any;
  error?: string;
  executionDurationMs?: number;
  status: 'success' | 'failed' | 'rejected_by_user' | 'permission_denied';
}

/** @deprecated Legacy alias for AIToolCallObservation. Use AIToolExecutionResult for execution engine results. */
export type AIToolResult = AIToolCallObservation;

export interface AIMessage {
  role: AIRole;
  content: string;
  timestamp: Date;
  thinking?: string;
  thinkingSteps?: AIThinkingStep[];
  toolCalls?: AIToolCall[];
  toolResults?: AIToolCallObservation[];
}

export interface AIAgenticStep {
  stepNumber: number;
  thought: string;
  action?: AIToolCall;
  observation?: AIToolCallObservation;
  status: 'thinking' | 'executing_tool' | 'waiting_authorization' | 'completed' | 'failed';
}

export interface AIResponse {
  message: AIMessage;
  agenticSteps?: AIAgenticStep[];
  thinkingChain?: AIThinkingStep[];
  confidenceScore?: number;
  tokensUsed?: number;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error' | 'awaiting_confirmation';
  explanation?: AIExplanation;
}

export interface AIExplanation {
  reason: string;
  supportingData: Record<string, any>;
  confidenceLevel: 'high' | 'medium' | 'low';
  businessImpact: string;
  suggestedAction?: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
}
