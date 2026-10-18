import { AIMessage, AIResponse } from './Types';
import { AITool } from './Tools';

export interface AIModel {
  id: string;
  name: string;
  provider: string; // e.g., 'gemini', 'openai', 'anthropic', 'deepseek', 'local'
  capabilities: ('text' | 'vision' | 'tools' | 'embedding')[];
  contextWindow: number;
}

export interface AIProvider {
  id: string;
  name: string;
  getModels(): Promise<AIModel[]>;
  generateResponse(messages: AIMessage[], model: AIModel, tools?: AITool[]): Promise<AIResponse>;
  streamResponse?(messages: AIMessage[], model: AIModel, tools?: AITool[]): AsyncGenerator<string, AIResponse, unknown>;
}
