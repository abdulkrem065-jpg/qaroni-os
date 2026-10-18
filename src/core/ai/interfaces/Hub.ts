import { AIContext } from './Context';
import { AIAgenticStep, AIMessage, AIResponse } from './Types';
import { AITool, AIToolAuthorizationRequest } from './Tools';

export interface EnterpriseAIHub {
  /**
   * Submits a query to the single intelligence engine.
   * The hub automatically resolves the active provider, unified memory, and unified tools based on context.
   */
  processQuery(query: string, context: AIContext): Promise<AIResponse>;
  
  /**
   * Streams a response from the single intelligence engine.
   */
  streamQuery(query: string, context: AIContext): AsyncGenerator<string, AIResponse, unknown>;
  
  /**
   * Executes an autonomous multi-step agentic query stream with reasoning and tool execution steps.
   */
  processAgenticQuery?(query: string, context: AIContext): AsyncGenerator<AIAgenticStep, AIResponse, unknown>;

  /**
   * Confirms human-in-the-loop authorization for pending tool execution.
   */
  confirmToolExecution?(toolCallId: string, authorized: boolean, context: AIContext): Promise<AIResponse>;

  /**
   * Switches the active domain context without losing conversation memory.
   */
  switchContext(newDomain: string, contextUpdates: Partial<AIContext>): void;
  
  /**
   * Retrieves the unified conversation history across all domains.
   */
  getConversationHistory(): AIMessage[];
  
  /**
   * Registers a tool dynamically from any business module.
   */
  registerTool(tool: AITool): void;

  /**
   * Registers an external MCP (Model Context Protocol) tool provider.
   */
  registerMCPProvider?(serverId: string, endpoint: string): void;
}
