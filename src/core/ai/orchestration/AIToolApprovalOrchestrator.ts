import {
  AIToolApprovalDecision,
  AIToolApprovalRequest,
  AIToolContract,
  AIToolExecutionContext
} from './types';

export class AIToolApprovalOrchestrator {
  private static instance: AIToolApprovalOrchestrator;
  private pendingApprovals: Map<string, AIToolApprovalRequest> = new Map();
  private approvalTTLMs = 300000; // 5 minutes TTL for human approvals

  public static getInstance(): AIToolApprovalOrchestrator {
    if (!AIToolApprovalOrchestrator.instance) {
      AIToolApprovalOrchestrator.instance = new AIToolApprovalOrchestrator();
    }
    return AIToolApprovalOrchestrator.instance;
  }

  /**
   * Creates a pending Human-in-the-Loop approval request for a critical tool action.
   */
  public createApprovalRequest(
    executionId: string,
    tool: AIToolContract,
    args: Record<string, any>,
    context: AIToolExecutionContext,
    reason: string
  ): AIToolApprovalRequest {
    const approvalId = `APPR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const request: AIToolApprovalRequest = {
      approvalId,
      executionId,
      toolId: tool.toolId,
      args,
      requestedBy: {
        userId: context.userId,
        role: context.role
      },
      targetOrgId: context.organizationId,
      targetBranchId: context.branchId,
      riskLevel: tool.riskLevel,
      reason,
      status: 'pending',
      createdAt: new Date()
    };

    this.pendingApprovals.set(approvalId, request);
    return { ...request };
  }

  /**
   * Confirms human approval decision or rejection for a pending tool execution.
   */
  public processApprovalDecision(
    approvalId: string,
    authorized: boolean,
    approverContext: AIToolExecutionContext
  ): AIToolApprovalDecision {
    const request = this.pendingApprovals.get(approvalId);

    if (!request) {
      throw new Error(`AIToolApprovalOrchestrator: Approval request ${approvalId} not found or expired`);
    }

    if (request.status !== 'pending') {
      throw new Error(`AIToolApprovalOrchestrator: Request ${approvalId} is already in ${request.status} status`);
    }

    // Verify expiration
    if (Date.now() - new Date(request.createdAt).getTime() > this.approvalTTLMs) {
      request.status = 'expired';
      throw new Error(`AIToolApprovalOrchestrator: Approval request ${approvalId} has expired`);
    }

    // Verify approver tenant isolation
    if (request.targetOrgId !== approverContext.organizationId) {
      throw new Error('AIToolApprovalOrchestrator: Cross-organization approval prohibited');
    }

    if (authorized) {
      request.status = 'approved';
      request.approvedBy = {
        userId: approverContext.userId,
        role: approverContext.role,
        timestamp: new Date()
      };
      return {
        approvalId,
        status: 'approved',
        authorizedByUserId: approverContext.userId
      };
    } else {
      request.status = 'rejected';
      return {
        approvalId,
        status: 'rejected',
        reason: 'User explicitly declined action approval',
        authorizedByUserId: approverContext.userId
      };
    }
  }

  /**
   * Retrieves a pending approval request by ID.
   */
  public getApprovalRequest(approvalId: string): AIToolApprovalRequest | undefined {
    const request = this.pendingApprovals.get(approvalId);
    if (!request) return undefined;
    return { ...request };
  }

  /**
   * Finds pending approval for an executionId.
   */
  public findByExecutionId(executionId: string): AIToolApprovalRequest | undefined {
    for (const req of this.pendingApprovals.values()) {
      if (req.executionId === executionId) {
        return { ...req };
      }
    }
    return undefined;
  }

  /**
   * Finds approved request for a toolId and userId.
   */
  public findApprovedRequest(toolId: string, userId: string): AIToolApprovalRequest | undefined {
    for (const req of this.pendingApprovals.values()) {
      if ((req.toolId === toolId || toolId.includes(req.toolId) || req.toolId.includes(toolId)) && req.requestedBy.userId === userId && req.status === 'approved') {
        return { ...req };
      }
    }
    return undefined;
  }
}
