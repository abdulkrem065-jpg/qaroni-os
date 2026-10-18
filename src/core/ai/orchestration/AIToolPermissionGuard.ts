import {
  AIToolAuthorizationDecision,
  AIToolContract,
  AIToolExecutionContext
} from './types';

export class AIToolPermissionGuard {
  /**
   * Validates tool request against QEOS Security Context & Tenant Isolation Boundaries.
   * STRICT RULE: Never accept model-supplied organizationId or branchId as source of truth.
   */
  public evaluate(
    tool: AIToolContract,
    modelSuppliedArgs: Record<string, any>,
    trustedContext: AIToolExecutionContext
  ): AIToolAuthorizationDecision {
    // 1. Verify User Authentication
    if (!trustedContext.userId) {
      return {
        authorized: false,
        reason: 'Security Violation: Unauthenticated context provided to AI Tool Execution',
        errorClassification: 'permission_denied'
      };
    }

    // 2. Verify Organization & Branch Context
    if (!trustedContext.organizationId) {
      return {
        authorized: false,
        reason: 'Security Violation: Missing Organization ID in trusted security context',
        errorClassification: 'permission_denied'
      };
    }

    // 3. Detect and Reject Cross-Tenant Tampering Attempts
    if (modelSuppliedArgs) {
      if (
        modelSuppliedArgs.organizationId &&
        modelSuppliedArgs.organizationId !== trustedContext.organizationId
      ) {
        return {
          authorized: false,
          reason: `Security Breach Rejected: Model proposed organizationId (${modelSuppliedArgs.organizationId}) does not match trusted context (${trustedContext.organizationId})`,
          errorClassification: 'permission_denied'
        };
      }

      if (
        modelSuppliedArgs.branchId &&
        modelSuppliedArgs.branchId !== trustedContext.branchId &&
        !this.hasCrossBranchPermission(trustedContext)
      ) {
        return {
          authorized: false,
          reason: `Security Breach Rejected: Model proposed branchId (${modelSuppliedArgs.branchId}) unauthorized for user context (${trustedContext.branchId})`,
          errorClassification: 'permission_denied'
        };
      }
    }

    // 4. Verify Required Tool Permissions
    const userPermissions = new Set(trustedContext.permissions || []);
    if (tool.requiredPermissions && tool.requiredPermissions.length > 0) {
      const isSuperAdmin = userPermissions.has('admin.super');
      if (!isSuperAdmin) {
        const missingPermissions = tool.requiredPermissions.filter(p => !userPermissions.has(p));
        if (missingPermissions.length > 0) {
          return {
            authorized: false,
            reason: `Permission Denied: User lacks required permissions: [${missingPermissions.join(', ')}]`,
            errorClassification: 'permission_denied'
          };
        }
      }
    }

    // 5. Sanitize Tool Arguments & Force Trusted Tenant / Branch IDs
    const sanitizedArgs = { ...modelSuppliedArgs };
    if (tool.contextRequirements?.requireOrgId) {
      sanitizedArgs.organizationId = trustedContext.organizationId;
    }
    if (tool.contextRequirements?.requireBranchId && !sanitizedArgs.branchId) {
      sanitizedArgs.branchId = trustedContext.branchId;
    }

    return {
      authorized: true,
      sanitizedArgs
    };
  }

  private hasCrossBranchPermission(context: AIToolExecutionContext): boolean {
    const permissions = new Set(context.permissions || []);
    return (
      permissions.has('admin.super') ||
      permissions.has('organization.manage_all_branches') ||
      context.role === 'HQ_MANAGER' ||
      context.role === 'ADMIN'
    );
  }
}
