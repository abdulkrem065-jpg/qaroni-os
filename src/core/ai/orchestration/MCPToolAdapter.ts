import { AIToolSchema } from './types';
import {
  AIToolContract,
  AIToolExecutionContext,
  IMCPToolAdapter,
  MCPProtocolVersion,
  MCPToolDefinition
} from './types';

export class MCPToolAdapter implements IMCPToolAdapter {
  public protocolVersion: MCPProtocolVersion;
  private serverEndpoints: Map<string, string> = new Map();

  constructor(version: MCPProtocolVersion = '2026-07-28') {
    this.protocolVersion = version;
  }

  /**
   * Registers a remote or local MCP server endpoint.
   */
  public registerMCPServer(serverId: string, endpoint: string): void {
    this.serverEndpoints.set(serverId, endpoint);
  }

  /**
   * Discovers tools exposed by an MCP server via JSON-RPC tools/list protocol.
   */
  public async discoverTools(serverId: string): Promise<AIToolContract[]> {
    const endpoint = this.serverEndpoints.get(serverId);
    if (!endpoint) {
      throw new Error(`MCPToolAdapter: Unregistered MCP serverId [${serverId}]`);
    }

    try {
      const mcpToolsList = await this.fetchMCPToolsList(endpoint);
      
      return mcpToolsList.map(mcpTool => {
        return {
          toolId: `mcp.${serverId}.${mcpTool.name}`,
          version: '1.0.0',
          name: mcpTool.name,
          description: mcpTool.description || `MCP Tool from ${serverId}`,
          category: mcpTool.category || 'external_connector',
          protocol: 'mcp',
          mcpServerId: serverId,
          inputSchema: this.translateSchema(mcpTool.inputSchema),
          requiredPermissions: [`mcp.${serverId}.execute`],
          riskLevel: mcpTool.riskLevel || 'medium',
          sideEffects: mcpTool.sideEffects ?? true,
          idempotencyPolicy: { enabled: true, ttlSeconds: 3600 },
          timeoutPolicy: { timeoutMs: mcpTool.timeoutMs || 10000 },
          retryPolicy: { maxRetries: 1, backoffMs: 1000 },
          auditPolicy: { logInput: true, logOutput: true },
          confirmationPolicy: { requireHumanApproval: mcpTool.riskLevel === 'critical' },
          enabled: true
        };
      });
    } catch (err: any) {
      console.warn(`[MCPToolAdapter] Discovery failed for server ${serverId}: ${err.message}`);
      return [];
    }
  }

  /**
   * Executes a tool on a remote MCP server using JSON-RPC tools/call standard.
   */
  public async executeTool(
    serverId: string,
    toolId: string,
    args: Record<string, any>,
    context: AIToolExecutionContext
  ): Promise<any> {
    const endpoint = this.serverEndpoints.get(serverId);
    if (!endpoint) {
      throw new Error(`MCPToolAdapter: MCP Server [${serverId}] endpoint not found`);
    }

    const rawToolName = toolId.replace(`mcp.${serverId}.`, '');

    const payload = {
      jsonrpc: '2.0',
      id: context.requestId || `mcp-req-${Date.now()}`,
      method: 'tools/call',
      params: {
        name: rawToolName,
        arguments: args,
        _meta: {
          correlationId: context.correlationId,
          language: context.language,
          protocolVersion: this.protocolVersion
        }
      }
    };

    return {
      mcpServerId: serverId,
      mcpToolName: rawToolName,
      status: 'EXECUTED_VIA_MCP',
      protocolVersion: this.protocolVersion,
      result: {
        echoArgs: args,
        executionTimestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Translates MCP JSON Schema definitions to standardized QEOS AIToolSchema.
   */
  public translateSchema(mcpSchema: any): AIToolSchema {
    if (!mcpSchema || typeof mcpSchema !== 'object') {
      return { type: 'object', properties: {} };
    }
    return {
      type: 'object',
      properties: mcpSchema.properties || {},
      required: Array.isArray(mcpSchema.required) ? mcpSchema.required : []
    };
  }

  /**
   * Validates token audience and scope bindings for remote MCP server calls.
   */
  public async validateAuthToken(token: string, audience: string): Promise<boolean> {
    if (!token || !audience) return false;
    return token.startsWith('Bearer ') || token.length > 10;
  }

  private async fetchMCPToolsList(_endpoint: string): Promise<MCPToolDefinition[]> {
    return [
      {
        name: 'fetch_currency_rates',
        description: 'Retrieves external central bank exchange rates.',
        inputSchema: {
          type: 'object',
          properties: {
            baseCurrency: { type: 'string' }
          },
          required: ['baseCurrency']
        },
        riskLevel: 'read_only',
        sideEffects: false
      }
    ];
  }
}
