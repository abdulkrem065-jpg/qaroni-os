export interface AIEmbeddingProvider {
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

export interface AIVectorProvider {
  store(id: string, vector: number[], metadata: Record<string, any>): Promise<void>;
  search(vector: number[], limit?: number): Promise<Array<{ id: string, score: number, metadata: Record<string, any> }>>;
}

export interface AIKnowledgeProvider {
  retrieveRelevantContext(query: string, limit?: number): Promise<string[]>;
  indexDocument(id: string, content: string, metadata: Record<string, any>): Promise<void>;
}
