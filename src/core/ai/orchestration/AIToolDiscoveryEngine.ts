import { AIToolLifecycleGovernance } from './AIToolLifecycleGovernance';
import { AIToolRegistry } from './AIToolRegistry';
import {
  AIToolContract,
  AIToolDiscoveryRequest,
  AIToolDiscoveryResult,
  AIToolExecutionContext
} from './types';

export class AIToolDiscoveryEngine {
  private registry: AIToolRegistry;
  private governance: AIToolLifecycleGovernance;
  private cache: Map<string, { timestamp: number; tools: AIToolContract[] }> = new Map();
  private cacheTTLMs = 60000; // 1 minute discovery cache

  constructor(registry?: AIToolRegistry, governance?: AIToolLifecycleGovernance) {
    this.registry = registry || AIToolRegistry.getInstance();
    this.governance = governance || AIToolLifecycleGovernance.getInstance();
  }

  /**
   * Discovers tools based on a structured discovery request.
   */
  public discover(request: AIToolDiscoveryRequest): AIToolDiscoveryResult {
    const discoveredTools = this.discoverTools(request.context, request.options);
    return {
      tools: discoveredTools,
      discoveredCount: discoveredTools.length,
      timestamp: new Date()
    };
  }

  /**
   * Dynamically discovers and filters tool contracts available to the given execution context.
   * Deterministic and tenant-isolated.
   */
  public discoverTools(
    context: AIToolExecutionContext,
    options?: AIToolDiscoveryRequest['options']
  ): AIToolContract[] {
    const cacheKey = this.buildCacheKey(context, options);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTLMs) {
      return cached.tools.map(t => ({ ...t }));
    }

    const allTools = this.registry.getAllTools();
    const userPermissions = new Set(context.permissions || []);

    const eligibleTools = allTools.filter(tool => {
      // 0. Governance Check - Must be in ACTIVE state
      const executionCheck = this.governance.canExecute(tool.toolId);
      if (!executionCheck.allowed) return false;

      // 1. Tool must be globally enabled
      if (!tool.enabled) return false;

      // 2. Protocol filter if specified
      if (options?.protocol && tool.protocol !== options.protocol) return false;

      // 3. Category filter if specified
      if (options?.category && tool.category !== options.category) return false;

      // 4. Max risk filter if specified
      if (options?.maxRiskLevel && !this.isRiskAllowed(tool.riskLevel, options.maxRiskLevel)) {
        return false;
      }

      // 5. Context requirement checks
      if (tool.contextRequirements) {
        if (tool.contextRequirements.requireOrgId && !context.organizationId) return false;
        if (tool.contextRequirements.requireBranchId && !context.branchId) return false;
        if (tool.contextRequirements.requireUserId && !context.userId) return false;
      }

      // 6. User Permission Check
      if (tool.requiredPermissions && tool.requiredPermissions.length > 0) {
        const hasAllPermissions = tool.requiredPermissions.every(p => userPermissions.has(p) || userPermissions.has('admin.super'));
        if (!hasAllPermissions) return false;
      }

      return true;
    });

    const result = options?.limit ? eligibleTools.slice(0, options.limit) : eligibleTools;

    this.cache.set(cacheKey, {
      timestamp: Date.now(),
      tools: result.map(t => ({ ...t }))
    });

    return result;
  }

  /**
   * Clears the discovery cache.
   */
  public invalidateCache(): void {
    this.cache.clear();
  }

  private buildCacheKey(context: AIToolExecutionContext, options?: AIToolDiscoveryRequest['options']): string {
    return [
      context.organizationId,
      context.branchId,
      context.userId,
      context.role,
      (context.permissions || []).sort().join(','),
      options?.category || 'all',
      options?.maxRiskLevel || 'all',
      options?.protocol || 'all',
      options?.limit || 'none'
    ].join('::');
  }

  private isRiskAllowed(
    toolRisk: 'read_only' | 'low' | 'medium' | 'critical',
    maxAllowed: 'read_only' | 'low' | 'medium' | 'critical'
  ): boolean {
    const riskRank = { read_only: 0, low: 1, medium: 2, critical: 3 };
    return riskRank[toolRisk] <= riskRank[maxAllowed];
  }
}
