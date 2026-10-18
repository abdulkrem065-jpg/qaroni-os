import { AIToolContract } from './types';

export class AIToolRegistry {
  private static instance: AIToolRegistry;
  private tools: Map<string, AIToolContract> = new Map();

  private constructor() {
    this.registerBuiltInTools();
  }

  public static getInstance(): AIToolRegistry {
    if (!AIToolRegistry.instance) {
      AIToolRegistry.instance = new AIToolRegistry();
    }
    return AIToolRegistry.instance;
  }

  /**
   * Registers a tool contract in the registry. Replaces existing tool if toolId exists.
   */
  public registerTool(contract: AIToolContract): void {
    this.validateToolContract(contract);
    this.tools.set(contract.toolId, { ...contract });
  }

  /**
   * Unregisters a tool by ID.
   */
  public unregisterTool(toolId: string): boolean {
    return this.tools.delete(toolId);
  }

  /**
   * Retrieves a registered tool contract by ID.
   */
  public getTool(toolId: string): AIToolContract | undefined {
    const tool = this.tools.get(toolId);
    if (!tool) return undefined;
    return { ...tool };
  }

  /**
   * Returns all registered tool contracts.
   */
  public getAllTools(): AIToolContract[] {
    return Array.from(this.tools.values()).map(t => ({ ...t }));
  }

  /**
   * Enables or disables a tool.
   */
  public setToolEnabled(toolId: string, enabled: boolean): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) return false;
    tool.enabled = enabled;
    return true;
  }

  /**
   * Validates required metadata fields on a tool contract.
   */
  private validateToolContract(contract: AIToolContract): void {
    if (!contract.toolId || typeof contract.toolId !== 'string') {
      throw new Error('AIToolRegistry: toolId must be a non-empty string');
    }
    if (!contract.version || typeof contract.version !== 'string') {
      throw new Error(`AIToolRegistry [${contract.toolId}]: version is required`);
    }
    if (!contract.name || typeof contract.name !== 'string') {
      throw new Error(`AIToolRegistry [${contract.toolId}]: name is required`);
    }
    if (!contract.inputSchema || contract.inputSchema.type !== 'object') {
      throw new Error(`AIToolRegistry [${contract.toolId}]: inputSchema must be an object schema`);
    }
    if (!contract.riskLevel) {
      throw new Error(`AIToolRegistry [${contract.toolId}]: riskLevel is required`);
    }
    if (!contract.idempotencyPolicy || !contract.timeoutPolicy || !contract.retryPolicy) {
      throw new Error(`AIToolRegistry [${contract.toolId}]: policies (idempotency, timeout, retry) are required`);
    }
  }

  /**
   * Registers default native QEOS baseline tool contracts across enterprise domains.
   */
  private registerBuiltInTools(): void {
    // 1. Sales Summary Tool (read_only)
    const salesSummaryContract: AIToolContract = {
      toolId: 'sales_get_daily_summary',
      version: '1.0.0',
      name: 'Get Daily Sales Summary',
      description: 'Retrieves sales volume, revenue, and gross profit metrics for a given date.',
      category: 'sales',
      protocol: 'native',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'ISO YYYY-MM-DD date string' },
          branchId: { type: 'string', description: 'Optional target branch ID' }
        },
        required: ['date']
      },
      requiredPermissions: ['sales.view_summary'],
      riskLevel: 'read_only',
      sideEffects: false,
      idempotencyPolicy: { enabled: false },
      timeoutPolicy: { timeoutMs: 5000 },
      retryPolicy: { maxRetries: 2, backoffMs: 500 },
      auditPolicy: { logInput: true, logOutput: false },
      confirmationPolicy: { requireHumanApproval: false },
      contextRequirements: { requireOrgId: true, requireBranchId: true, requireUserId: true },
      enabled: true,
      handler: async (args, ctx) => {
        return {
          date: args.date,
          orgId: ctx.organizationId,
          branchId: args.branchId || ctx.branchId,
          totalSales: 14850.75,
          totalOrders: 64,
          grossProfit: 3420.50,
          currency: 'SAR'
        };
      }
    };
    this.registerTool(salesSummaryContract);
    // Backward compatibility alias for dot notation
    this.registerTool({ ...salesSummaryContract, toolId: 'qeos.sales.get_daily_summary' });

    // 2. Inventory Alert Query Tool (read_only)
    const stockAlertsContract: AIToolContract = {
      toolId: 'inventory_check_stock_alerts',
      version: '1.0.0',
      name: 'Check Stock Alerts',
      description: 'Queries items that have dropped below safety thresholds.',
      category: 'inventory',
      protocol: 'native',
      inputSchema: {
        type: 'object',
        properties: {
          categoryFilter: { type: 'string' }
        }
      },
      requiredPermissions: ['inventory.view_alerts'],
      riskLevel: 'read_only',
      sideEffects: false,
      idempotencyPolicy: { enabled: false },
      timeoutPolicy: { timeoutMs: 5000 },
      retryPolicy: { maxRetries: 2, backoffMs: 500 },
      auditPolicy: { logInput: true, logOutput: false },
      confirmationPolicy: { requireHumanApproval: false },
      enabled: true,
      handler: async (_args, ctx) => {
        return {
          branchId: ctx.branchId,
          alertCount: 2,
          alerts: [
            { productId: 'P-101', name: 'Basmati Rice 10kg', currentStock: 4, minThreshold: 15 },
            { productId: 'P-204', name: 'Sunflower Oil 5L', currentStock: 2, minThreshold: 10 }
          ]
        };
      }
    };
    this.registerTool(stockAlertsContract);
    this.registerTool({ ...stockAlertsContract, toolId: 'qeos.inventory.check_stock_alerts' });

    // 3. Purchase Order Draft Creation Tool (medium risk)
    const draftOrderContract: AIToolContract = {
      toolId: 'purchasing_create_draft_order',
      version: '1.0.0',
      name: 'Create Purchase Order Draft',
      description: 'Generates a draft purchase order for supplier items without committing financial posting.',
      category: 'purchasing',
      protocol: 'native',
      inputSchema: {
        type: 'object',
        properties: {
          supplierId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'number' }
              },
              required: ['productId', 'quantity']
            }
          }
        },
        required: ['supplierId', 'items']
      },
      requiredPermissions: ['purchasing.create_order'],
      riskLevel: 'medium',
      sideEffects: true,
      idempotencyPolicy: { enabled: true, ttlSeconds: 3600 },
      timeoutPolicy: { timeoutMs: 10000 },
      retryPolicy: { maxRetries: 1, backoffMs: 1000 },
      auditPolicy: { logInput: true, logOutput: true },
      confirmationPolicy: { requireHumanApproval: false },
      enabled: true,
      handler: async (args, ctx) => {
        return {
          draftOrderId: `PO-DRAFT-${Date.now().toString(36).toUpperCase()}`,
          supplierId: args.supplierId,
          orgId: ctx.organizationId,
          branchId: ctx.branchId,
          status: 'DRAFT',
          totalAmountEstimate: 12500.00
        };
      }
    };
    this.registerTool(draftOrderContract);
    this.registerTool({ ...draftOrderContract, toolId: 'qeos.purchasing.create_draft_order' });

    // 4. Financial Posting / Debt Adjustment Tool (critical risk)
    const writeOffDebtContract: AIToolContract = {
      toolId: 'financial_write_off_debt',
      version: '1.0.0',
      name: 'Write Off Customer Debt',
      description: 'Posts a financial write-off journal entry for uncollectible customer debt.',
      category: 'financial',
      protocol: 'native',
      inputSchema: {
        type: 'object',
        properties: {
          customerId: { type: 'string' },
          amount: { type: 'number' },
          justification: { type: 'string' }
        },
        required: ['customerId', 'amount', 'justification']
      },
      requiredPermissions: ['financial.write_off'],
      riskLevel: 'critical',
      sideEffects: true,
      idempotencyPolicy: { enabled: true, ttlSeconds: 86400 },
      timeoutPolicy: { timeoutMs: 15000 },
      retryPolicy: { maxRetries: 0, backoffMs: 0 },
      auditPolicy: { logInput: true, logOutput: true, retentionDays: 365 },
      confirmationPolicy: { requireHumanApproval: true, approvalRole: 'CFO' },
      enabled: true,
      handler: async (args, ctx) => {
        return {
          journalEntryId: `JE-WRITEOFF-${Date.now()}`,
          customerId: args.customerId,
          amountWrittenOff: args.amount,
          postedByUserId: ctx.userId,
          status: 'COMMITTED'
        };
      }
    };
    this.registerTool(writeOffDebtContract);
    this.registerTool({ ...writeOffDebtContract, toolId: 'qeos.financial.write_off_debt' });
  }
}
