import { AIAgenticStep, AIMessage } from './Types';
import { AIContext } from './Context';

export interface AIAgenticPlanConfig {
  maxSteps?: number;
  autoExecuteSafeTools?: boolean;
  requireConfirmationForCriticalTools?: boolean;
}

export interface AIPlanner {
  createPlan(goal: string, context: AIContext): Promise<string[]>;
  executePlan(steps: string[], context: AIContext, config?: AIAgenticPlanConfig): AsyncGenerator<AIMessage, void, unknown>;
  refinePlan?(originalPlan: string[], failedStepIndex: number, errorReason: string, context: AIContext): Promise<string[]>;
  executeAgenticLoop?(goal: string, context: AIContext, config?: AIAgenticPlanConfig): AsyncGenerator<AIAgenticStep, void, unknown>;
}
