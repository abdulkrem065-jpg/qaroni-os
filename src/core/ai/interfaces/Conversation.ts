import { AIMessage } from './Types';

export interface AIConversation {
  id: string;
  title?: string;
  messages: AIMessage[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  addMessage(message: AIMessage): void;
  getHistory(): AIMessage[];
  clear(): void;
}
