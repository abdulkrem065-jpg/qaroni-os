import type { AIToolContract, AIToolRiskLevel, AIToolSchema } from '../orchestration/types';

export type { AIToolContract, AIToolRiskLevel, AIToolSchema };

/** @deprecated Legacy alias for AIToolContract */
export type AITool = AIToolContract;

export interface AIToolAuthorizationRequest {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  riskLevel: AIToolRiskLevel;
  reason: string;
}

export interface AIToolExecutor {
  execute(toolName: string, args: Record<string, any>, context: any): Promise<any>;
  getAvailableTools(context: any): AIToolContract[];
  getMCPTools?(serverId: string, context: any): Promise<AIToolContract[]>;
  validateToolCallAuthorization?(request: AIToolAuthorizationRequest, context: any): Promise<{ authorized: boolean; reason?: string }>;
}
