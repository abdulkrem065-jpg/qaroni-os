import { AIToolErrorClassification, AIToolExecutionResult } from './types';

export class AIToolResultNormalizer {
  private static sensitiveKeys = new Set([
    'password',
    'secret',
    'apiKey',
    'token',
    'privateKey',
    'accessToken',
    'refreshToken',
    'bearerToken',
    'ssn',
    'creditCard'
  ]);

  /**
   * Normalizes raw execution output into a secure, standardized AIToolExecutionResult.
   */
  public normalizeSuccess(
    executionId: string,
    toolId: string,
    rawData: any,
    metadata: {
      durationMs: number;
      protocol: 'native' | 'mcp';
      mcpServerId?: string;
      idempotentHit?: boolean;
    },
    correlationId: string,
    auditId: string
  ): AIToolExecutionResult {
    const sanitizedData = this.sanitizeOutput(rawData);

    return {
      executionId,
      toolId,
      status: 'success',
      data: sanitizedData,
      metadata: {
        executionDurationMs: metadata.durationMs,
        protocol: metadata.protocol,
        mcpServerId: metadata.mcpServerId,
        idempotentHit: metadata.idempotentHit || false,
        sanitized: true
      },
      source: `QEOS_ORCHESTRATOR::${metadata.protocol.toUpperCase()}`,
      duration: metadata.durationMs,
      correlationId,
      auditId
    };
  }

  /**
   * Normalizes execution error into a standardized failure response.
   */
  public normalizeError(
    executionId: string,
    toolId: string,
    error: Error | string | any,
    classification: AIToolErrorClassification,
    durationMs: number,
    correlationId: string,
    auditId: string,
    protocol: 'native' | 'mcp' = 'native'
  ): AIToolExecutionResult {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown execution error';
    const errorCode = typeof error === 'object' && error?.code ? error.code : 'TOOL_EXECUTION_FAILED';

    return {
      executionId,
      toolId,
      status: classification === 'approval_required' ? 'approval_required' : classification === 'timeout' ? 'timeout' : 'failed',
      metadata: {
        executionDurationMs: durationMs,
        protocol,
        sanitized: true
      },
      error: {
        code: errorCode,
        message: errorMessage,
        classification
      },
      source: `QEOS_ORCHESTRATOR::${protocol.toUpperCase()}`,
      duration: durationMs,
      correlationId,
      auditId
    };
  }

  /**
   * Recursively sanitizes objects to redact credentials and tokens.
   */
  public sanitizeOutput(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeOutput(item));
    }

    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (AIToolResultNormalizer.sensitiveKeys.has(key) || AIToolResultNormalizer.sensitiveKeys.has(key.toLowerCase())) {
        cleanObj[key] = '[REDACTED_SECRET]';
      } else if (typeof value === 'object' && value !== null) {
        cleanObj[key] = this.sanitizeOutput(value);
      } else {
        cleanObj[key] = value;
      }
    }
    return cleanObj;
  }
}
