import { AIToolExecutionAudit } from './types';

export class AIToolAuditService {
  private static instance: AIToolAuditService;
  private auditLogs: AIToolExecutionAudit[] = [];
  private maxLogsInMemory = 1000;

  public static getInstance(): AIToolAuditService {
    if (!AIToolAuditService.instance) {
      AIToolAuditService.instance = new AIToolAuditService();
    }
    return AIToolAuditService.instance;
  }

  /**
   * Records an audit event for tool invocation lifecycle tracking.
   */
  public logEvent(event: Omit<AIToolExecutionAudit, 'auditId' | 'timestamp'>): string {
    const auditId = `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullEvent: AIToolExecutionAudit = {
      ...event,
      auditId,
      timestamp: new Date()
    };

    this.auditLogs.unshift(fullEvent);
    if (this.auditLogs.length > this.maxLogsInMemory) {
      this.auditLogs.pop();
    }

    // Console trace for environment observability
    console.log(
      `[QEOS_AI_AUDIT] [${fullEvent.status}] Tool: ${fullEvent.toolId} | ExecID: ${fullEvent.executionId} | User: ${fullEvent.userId} | Risk: ${fullEvent.riskLevel}`
    );

    return auditId;
  }

  /**
   * Retrieves audit trail for a specific executionId or correlationId.
   */
  public getAuditTrail(executionId: string): AIToolExecutionAudit[] {
    return this.auditLogs.filter(log => log.executionId === executionId || log.correlationId === executionId);
  }

  /**
   * Returns recent audit logs for an organization.
   */
  public getOrganizationAuditLogs(orgId: string, limit = 50): AIToolExecutionAudit[] {
    return this.auditLogs.filter(log => log.organizationId === orgId).slice(0, limit);
  }
}
