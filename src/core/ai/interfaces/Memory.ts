import { AIMessage } from './Types';

export interface AIMemoryEngine {
  getSessionMemory(sessionId: string): AIMessage[];
  addSessionMessage(sessionId: string, message: AIMessage): void;
  
  getOrganizationMemory(orgId: string): Record<string, any>;
  updateOrganizationMemory(orgId: string, insights: Record<string, any>): void;
  
  getTemporaryContext(sessionId: string): Record<string, any>;
  setTemporaryContext(sessionId: string, context: Record<string, any>): void;
  
  clearSession(sessionId: string): void;
}
