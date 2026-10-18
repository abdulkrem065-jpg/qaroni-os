import { AIToolApprovalOrchestrator } from './AIToolApprovalOrchestrator';
import { AIToolAuditService } from './AIToolAuditService';
import { AIToolLifecycleGovernance } from './AIToolLifecycleGovernance';
import { AIToolPermissionGuard } from './AIToolPermissionGuard';
import { AIToolRegistry } from './AIToolRegistry';
import { AIToolResultNormalizer } from './AIToolResultNormalizer';
import { MCPToolAdapter } from './MCPToolAdapter';
import {
  AIToolContract,
  AIToolExecutionContext,
  AIToolExecutionResult
} from './types';

export class AIToolInvocationEngine {
  private registry: AIToolRegistry;
  private permissionGuard: AIToolPermissionGuard;
  private resultNormalizer: AIToolResultNormalizer;
  private approvalOrchestrator: AIToolApprovalOrchestrator;
  private auditService: AIToolAuditService;
  private governance: AIToolLifecycleGovernance;
  private mcpAdapter: MCPToolAdapter;
  private idempotencyStore: Map<string, AIToolExecutionResult> = new Map();

  constructor(
    registry?: AIToolRegistry,
    permissionGuard?: AIToolPermissionGuard,
    resultNormalizer?: AIToolResultNormalizer,
    approvalOrchestrator?: AIToolApprovalOrchestrator,
    auditService?: AIToolAuditService,
    mcpAdapter?: MCPToolAdapter,
    governance?: AIToolLifecycleGovernance
  ) {
    this.registry = registry || AIToolRegistry.getInstance();
    this.permissionGuard = permissionGuard || new AIToolPermissionGuard();
    this.resultNormalizer = resultNormalizer || new AIToolResultNormalizer();
    this.approvalOrchestrator = approvalOrchestrator || AIToolApprovalOrchestrator.getInstance();
    this.auditService = auditService || AIToolAuditService.getInstance();
    this.mcpAdapter = mcpAdapter || new MCPToolAdapter();
    this.governance = governance || AIToolLifecycleGovernance.getInstance();
  }

  /**
   * Main entry point to invoke a tool contract under QEOS Security & Policy Boundaries.
   */
  public async invokeTool(
    toolId: string,
    modelArgs: Record<string, any>,
    trustedContext: AIToolExecutionContext,
    idempotencyKey?: string
  ): Promise<AIToolExecutionResult> {
    const startTime = Date.now();
    const executionId = `EXEC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const correlationId = trustedContext.correlationId || executionId;

    // 1. Audit Proposed Event
    const auditId = this.auditService.logEvent({
      executionId,
      correlationId,
      toolId,
      toolVersion: 'unknown',
      protocol: 'native',
      userId: trustedContext.userId,
      organizationId: trustedContext.organizationId,
      branchId: trustedContext.branchId,
      riskLevel: 'medium',
      status: 'Proposed',
      argsSummary: { ...modelArgs }
    });

    // 1.5 Governance Lifecycle State & Stop Authority Check
    const canExecCheck = this.governance.canExecute(toolId);
    if (!canExecCheck.allowed) {
      this.governance.triggerStop(
        'STEP_STOP',
        'INVALID_STATE_FOR_OPERATION',
        canExecCheck.reason || `Tool [${toolId}] cannot be executed under governance policy`,
        'AIToolInvocationEngine',
        toolId,
        executionId
      );

      return this.resultNormalizer.normalizeError(
        executionId,
        toolId,
        `Tool [${toolId}] execution halted by QEOS Governance Authority: ${canExecCheck.reason}` ,
        'permission_denied',
        Date.now() - startTime,
        correlationId,
        auditId
      );
    }

    // 2. Fetch Tool Contract
    const tool = this.registry.getTool(toolId);
    if (!tool) {
      return this.resultNormalizer.normalizeError(
        executionId,
        toolId,
        `Tool [${toolId}] is not registered in AIToolRegistry`,
        'validation_error',
        Date.now() - startTime,
        correlationId,
        auditId
      );
    }

    if (!tool.enabled) {
      return this.resultNormalizer.normalizeError(
        executionId,
        toolId,
        `Tool [${toolId}] is currently disabled by administrator policy`,
        'validation_error',
        Date.now() - startTime,
        correlationId,
        auditId,
        tool.protocol
      );
    }

    // 3. Evaluate Security & Permission Policy
    const guardDecision = this.permissionGuard.evaluate(tool, modelArgs, trustedContext);
    if (!guardDecision.authorized) {
      this.auditService.logEvent({
        executionId,
        correlationId,
        toolId,
        toolVersion: tool.version,
        protocol: tool.protocol,
        userId: trustedContext.userId,
        organizationId: trustedContext.organizationId,
        branchId: trustedContext.branchId,
        riskLevel: tool.riskLevel,
        status: 'Rejected',
        errorClassification: guardDecision.errorClassification || 'permission_denied'
      });

      return this.resultNormalizer.normalizeError(
        executionId,
        toolId,
        guardDecision.reason || 'Permission denied by QEOS Permission Guard',
        guardDecision.errorClassification || 'permission_denied',
        Date.now() - startTime,
        correlationId,
        auditId,
        tool.protocol
      );
    }

    const sanitizedArgs = guardDecision.sanitizedArgs || modelArgs;

    // 4. Validate Input Schema
    const schemaError = this.validateInputSchema(tool, sanitizedArgs);
    if (schemaError) {
      return this.resultNormalizer.normalizeError(
        executionId,
        toolId,
        `Input Schema Validation Error: ${schemaError}`,
        'validation_error',
        Date.now() - startTime,
        correlationId,
        auditId,
        tool.protocol
      );
    }

    // 5. Enforce Idempotency Check
    const resolvedIdempotencyKey = idempotencyKey || (sanitizedArgs.idempotencyKey as string);
    if (tool.idempotencyPolicy.enabled && resolvedIdempotencyKey) {
      const existingResult = this.idempotencyStore.get(resolvedIdempotencyKey);
      if (existingResult) {
        return {
          ...existingResult,
          metadata: {
            ...existingResult.metadata,
            idempotentHit: true
          }
        };
      }
    }

    // 6. Check Human-in-the-Loop Approval Requirements
    if (tool.riskLevel === 'critical' || tool.confirmationPolicy.requireHumanApproval) {
      const existingApproval = this.approvalOrchestrator.findApprovedRequest(tool.toolId, trustedContext.userId) || this.approvalOrchestrator.findByExecutionId(executionId);
      if (!existingApproval || existingApproval.status !== 'approved') {
        const approvalReq = this.approvalOrchestrator.createApprovalRequest(
          executionId,
          tool,
          sanitizedArgs,
          trustedContext,
          `Critical Risk Action [${tool.name}] requires executive human authorization`
        );

        this.auditService.logEvent({
          executionId,
          correlationId,
          toolId,
          toolVersion: tool.version,
          protocol: tool.protocol,
          userId: trustedContext.userId,
          organizationId: trustedContext.organizationId,
          branchId: trustedContext.branchId,
          riskLevel: tool.riskLevel,
          status: 'ApprovalRequired',
          argsSummary: sanitizedArgs
        });

        return this.resultNormalizer.normalizeError(
          executionId,
          toolId,
          `Action requires explicit human approval. Created Approval Request ID: [${approvalReq.approvalId}]`,
          'approval_required',
          Date.now() - startTime,
          correlationId,
          auditId,
          tool.protocol
        );
      }
    }

    // 7. Execute Tool Contract (Native or MCP)
    try {
      this.auditService.logEvent({
        executionId,
        correlationId,
        toolId,
        toolVersion: tool.version,
        protocol: tool.protocol,
        userId: trustedContext.userId,
        organizationId: trustedContext.organizationId,
        branchId: trustedContext.branchId,
        riskLevel: tool.riskLevel,
        status: 'Executing',
        argsSummary: sanitizedArgs
      });

      const rawResult = await this.executeWithTimeoutAndRetry(tool, sanitizedArgs, trustedContext);

      const durationMs = Date.now() - startTime;
      const normalizedResult = this.resultNormalizer.normalizeSuccess(
        executionId,
        toolId,
        rawResult,
        {
          durationMs,
          protocol: tool.protocol,
          mcpServerId: tool.mcpServerId
        },
        correlationId,
        auditId
      );

      if (tool.idempotencyPolicy.enabled && resolvedIdempotencyKey) {
        this.idempotencyStore.set(resolvedIdempotencyKey, normalizedResult);
      }

      this.auditService.logEvent({
        executionId,
        correlationId,
        toolId,
        toolVersion: tool.version,
        protocol: tool.protocol,
        userId: trustedContext.userId,
        organizationId: trustedContext.organizationId,
        branchId: trustedContext.branchId,
        riskLevel: tool.riskLevel,
        status: 'Completed',
        durationMs
      });

      return normalizedResult;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      this.auditService.logEvent({
        executionId,
        correlationId,
        toolId,
        toolVersion: tool.version,
        protocol: tool.protocol,
        userId: trustedContext.userId,
        organizationId: trustedContext.organizationId,
        branchId: trustedContext.branchId,
        riskLevel: tool.riskLevel,
        status: 'Failed',
        durationMs,
        errorClassification: err.classification || 'permanent_failure'
      });

      return this.resultNormalizer.normalizeError(
        executionId,
        toolId,
        err,
        err.classification || 'permanent_failure',
        durationMs,
        correlationId,
        auditId,
        tool.protocol
      );
    }
  }

  private async executeWithTimeoutAndRetry(
    tool: AIToolContract,
    args: Record<string, any>,
    context: AIToolExecutionContext
  ): Promise<any> {
    const timeoutMs = tool.timeoutPolicy.timeoutMs || 10000;
    const maxRetries = tool.retryPolicy.maxRetries || 0;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            const err: any = new Error(`Tool execution timed out after ${timeoutMs}ms`);
            err.classification = 'timeout';
            reject(err);
          }, timeoutMs);
        });

        const executionPromise = tool.protocol === 'mcp' && tool.mcpServerId
          ? this.mcpAdapter.executeTool(tool.mcpServerId, tool.toolId, args, context)
          : tool.handler
          ? tool.handler(args, context)
          : Promise.reject(new Error(`No handler or MCP configuration found for tool [${tool.toolId}]`));

        return await Promise.race([executionPromise, timeoutPromise]);
      } catch (err: any) {
        attempt++;
        if (attempt > maxRetries || err.classification === 'timeout') {
          throw err;
        }
        await new Promise(r => setTimeout(r, tool.retryPolicy.backoffMs * attempt));
      }
    }
  }

  private validateInputSchema(tool: AIToolContract, args: Record<string, any>): string | null {
    if (!args || typeof args !== 'object') {
      return 'Arguments must be a valid JSON object';
    }

    const schema = tool.inputSchema;
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredProp of schema.required) {
        if (args[requiredProp] === undefined || args[requiredProp] === null) {
          return `Missing required parameter [${requiredProp}]`;
        }
      }
    }
    return null;
  }
}
