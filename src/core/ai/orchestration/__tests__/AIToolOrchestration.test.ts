import { AIToolLifecycleGovernance } from '../AIToolLifecycleGovernance';
import { AIToolRegistry } from '../AIToolRegistry';
import { AIToolDiscoveryEngine } from '../AIToolDiscoveryEngine';
import { AIToolPermissionGuard } from '../AIToolPermissionGuard';
import { AIToolApprovalOrchestrator } from '../AIToolApprovalOrchestrator';
import { AIToolResultNormalizer } from '../AIToolResultNormalizer';
import { AIToolAuditService } from '../AIToolAuditService';
import { MCPToolAdapter } from '../MCPToolAdapter';
import { AIToolInvocationEngine } from '../AIToolInvocationEngine';
import {
  AIToolContract,
  AIToolExecutionContext,
  AIToolExecutionResult,
  AIToolApprovalDecision
} from '../types';

export class AIToolOrchestrationTestRunner {
  public static async runAllTests(): Promise<{ passed: number; failed: number; log: string[] }> {
    const logs: string[] = [];
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, testName: string) => {
      if (condition) {
        passed++;
        logs.push(`✅ PASS: ${testName}`);
      } else {
        failed++;
        logs.push(`❌ FAIL: ${testName}`);
      }
    };

    logs.push('--- STARTING QEOS AI TOOL CANONICAL ORCHESTRATION TEST SUITE ---');

    const trustedContext: AIToolExecutionContext = {
      userId: 'usr-exec-001',
      organizationId: 'org-qeos-main',
      branchId: 'branch-hq-01',
      role: 'EXECUTIVE_DIRECTOR',
      permissions: ['sales.view_summary', 'inventory.view_alerts', 'purchasing.create_order', 'financial.write_off'],
      language: 'ar',
      timezone: 'Asia/Riyadh',
      currentModule: 'executive',
      currentScreen: 'dashboard',
      sessionId: 'sess-test-123',
      conversationId: 'conv-test-456',
      correlationId: 'corr-test-789',
      requestId: 'req-test-101'
    };

    // 1. Test Registry & Built-in Tool Contracts
    const registry = AIToolRegistry.getInstance();
    const salesContract: AIToolContract | undefined = registry.getTool('sales_get_daily_summary');
    assert(salesContract !== undefined && salesContract.toolId === 'sales_get_daily_summary', 'Registry stores and retrieves canonical AIToolContract');

    // 2. Test Discovery Engine with Canonical Request
    const discoveryEngine = new AIToolDiscoveryEngine(registry);
    const discoveryResult = discoveryEngine.discover({
      context: trustedContext,
      options: { category: 'sales' }
    });
    assert(discoveryResult.tools.length >= 1 && discoveryResult.discoveredCount >= 1, 'Discovery Engine returns canonical AIToolDiscoveryResult');

    // 3. Test Permission Guard Tenant Isolation & Cross-Tenant Rejection
    const guard = new AIToolPermissionGuard();
    const crossTenantDecision = guard.evaluate(
      salesContract!,
      { date: '2026-09-27', organizationId: 'org-ATTACKER-EVIL' },
      trustedContext
    );
    assert(!crossTenantDecision.authorized && crossTenantDecision.reason?.includes('Security Breach Rejected'), 'Permission Guard returns AIToolAuthorizationDecision rejecting cross-tenant tampering');

    // 4. Test Native Read Tool Execution returning AIToolExecutionResult
    const invocationEngine = new AIToolInvocationEngine(registry, guard);
    const salesExecResult: AIToolExecutionResult = await invocationEngine.invokeTool(
      'sales_get_daily_summary',
      { date: '2026-09-27' },
      trustedContext
    );
    assert(salesExecResult.status === 'success' && salesExecResult.data?.totalSales === 14850.75, 'Read-only tool returns canonical AIToolExecutionResult');

    // 5. Test Human-in-the-Loop (HITL) Gate on Critical Tool
    const criticalExecResult = await invocationEngine.invokeTool(
      'financial_write_off_debt',
      { customerId: 'CUST-88', amount: 5000, justification: 'Bad debt write off' },
      trustedContext
    );
    assert(criticalExecResult.status === 'approval_required' && criticalExecResult.error?.classification === 'approval_required', 'Critical tool triggers approval_required gate');

    // 6. Test Approval Decision Flow
    const approvalOrchestrator = AIToolApprovalOrchestrator.getInstance();
    const approvalReq = approvalOrchestrator.findByExecutionId(criticalExecResult.executionId);
    assert(approvalReq !== undefined && approvalReq.status === 'pending', 'Approval Orchestrator creates canonical AIToolApprovalRequest');

    if (approvalReq) {
      const decision: AIToolApprovalDecision = approvalOrchestrator.processApprovalDecision(approvalReq.approvalId, true, trustedContext);
      assert(decision.status === 'approved', 'Approver returns canonical AIToolApprovalDecision');

      const reInvokedResult = await invocationEngine.invokeTool(
        'financial_write_off_debt',
        { customerId: 'CUST-88', amount: 5000, justification: 'Bad debt write off' },
        trustedContext
      );
      assert(reInvokedResult.status === 'success' && reInvokedResult.data?.postedByUserId === trustedContext.userId, 'Approved critical tool executes successfully');
    }

    // 7. Test Idempotency Guard
    const draft1 = await invocationEngine.invokeTool(
      'purchasing_create_draft_order',
      { supplierId: 'SUP-44', items: [{ productId: 'P-1', quantity: 10 }] },
      trustedContext,
      'idempotency-key-001'
    );
    const draft2 = await invocationEngine.invokeTool(
      'purchasing_create_draft_order',
      { supplierId: 'SUP-44', items: [{ productId: 'P-1', quantity: 10 }] },
      trustedContext,
      'idempotency-key-001'
    );
    assert(draft2.metadata.idempotentHit === true && draft1.executionId === draft2.executionId, 'Idempotency policy prevents duplicate executions');

    // 8. Test Result Normalizer Secret Sanitization
    const normalizer = new AIToolResultNormalizer();
    const sanitized = normalizer.sanitizeOutput({
      username: 'admin',
      password: 'SuperSecretPassword123!',
      nested: { apiKey: 'secret-key-xyz' }
    });
    assert(sanitized.password === '[REDACTED_SECRET]' && sanitized.nested.apiKey === '[REDACTED_SECRET]', 'Result Normalizer redacts passwords and secrets');

    // 9. Test Audit Logging Trace (AIToolExecutionAudit)
    const auditService = AIToolAuditService.getInstance();
    const audits = auditService.getOrganizationAuditLogs(trustedContext.organizationId);
    assert(audits.length > 0 && audits[0].organizationId === trustedContext.organizationId, 'Audit Service records canonical AIToolExecutionAudit');

    // 10. Test MCP Adapter Protocol Interoperability
    const mcpAdapter = new MCPToolAdapter('2026-07-28');
    mcpAdapter.registerMCPServer('central-bank', 'https://api.mcp.centralbank.org');
    const mcpTools = await mcpAdapter.discoverTools('central-bank');
    assert(mcpTools.length > 0 && mcpTools[0].protocol === 'mcp', 'MCP Adapter discovers and translates MCP tools');

    // 11. Governance Lifecycle: Test Unauthorized State Mutation Rejection
    const governance = AIToolLifecycleGovernance.getInstance();
    const unauthorizedMutate = governance.requestTransition({
      toolId: 'sales_get_daily_summary',
      requestedState: 'DISABLED',
      authorityUserId: 'model-agent-007',
      authorityRole: 'AI_MODEL',
      reason: 'Model trying to disable tool',
      preconditions: {
        identityValid: true, contractValid: true, schemaValid: true, sourceTrustValid: true, riskPolicyValid: true, authorityValid: false
      }
    });
    assert(unauthorizedMutate.status === 'REJECTED' && unauthorizedMutate.rejectionReason?.includes('Unauthorized State Transition Attempt'), 'Governance Authority rejects state transition requested by Model/AI Role');

    // 12. Governance Lifecycle: Test Direct ACTIVE -> RETIRED Illegal Transition
    const illegalTransition = governance.requestTransition({
      toolId: 'sales_get_daily_summary',
      requestedState: 'RETIRED',
      authorityUserId: 'gov-admin-001',
      authorityRole: 'QEOS_GOVERNANCE_AUTHORITY',
      reason: 'Direct retired attempt',
      preconditions: { identityValid: true, contractValid: true, schemaValid: true, sourceTrustValid: true, riskPolicyValid: true, authorityValid: true }
    });
    assert(illegalTransition.status === 'REJECTED' && illegalTransition.rejectionReason?.includes('ACTIVE tools cannot transition directly to RETIRED'), 'Governance Transition Gate blocks illegal direct ACTIVE -> RETIRED transition');

    // 13. Governance Lifecycle: Test Controlled Transition Path ACTIVE -> DISABLED -> RETIRED
    const disableTrans = governance.requestTransition({
      toolId: 'purchasing_create_draft_order',
      requestedState: 'DISABLED',
      authorityUserId: 'gov-admin-001',
      authorityRole: 'QEOS_GOVERNANCE_AUTHORITY',
      reason: 'Scheduled tool disable for maintenance',
      preconditions: { identityValid: true, contractValid: true, schemaValid: true, sourceTrustValid: true, riskPolicyValid: true, authorityValid: true, disableReasonPresent: true }
    });
    assert(disableTrans.status === 'SUCCESS' && governance.getToolState('purchasing_create_draft_order') === 'DISABLED', 'Governance executes valid ACTIVE -> DISABLED transition');

    // 14. Governance Lifecycle: Test Execution Rejection of DISABLED Tool
    const disabledExecResult = await invocationEngine.invokeTool(
      'purchasing_create_draft_order',
      { supplierId: 'SUP-44', items: [{ productId: 'P-1', quantity: 10 }] },
      trustedContext
    );
    assert(disabledExecResult.status === 'failed' && disabledExecResult.error?.message.includes('halted by QEOS Governance Authority'), 'Invocation Engine halts execution when tool state is DISABLED');

    // Re-activate tool
    governance.requestTransition({
      toolId: 'purchasing_create_draft_order',
      requestedState: 'ACTIVE',
      authorityUserId: 'gov-admin-001',
      authorityRole: 'QEOS_GOVERNANCE_AUTHORITY',
      reason: 'Maintenance complete',
      preconditions: { identityValid: true, contractValid: true, schemaValid: true, sourceTrustValid: true, riskPolicyValid: true, authorityValid: true, revalidationPassed: true }
    });

    // 15. Governance Lifecycle: Test Architectural Ambiguity Stop
    const ambiguityEvent = governance.handleArchitecturalAmbiguity(
      'BLOCKING_AMBIGUITY',
      'Conflicting schema version authority detected',
      'TestRunnerComponent',
      'sales_get_daily_summary'
    );
    assert(ambiguityEvent.actionTaken === 'STOPPED', 'Architectural Ambiguity Authority triggers immediate Stop on BLOCKING_AMBIGUITY');

    logs.push(`--- TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED ---`);
    return { passed, failed, log: logs };
  }
}
