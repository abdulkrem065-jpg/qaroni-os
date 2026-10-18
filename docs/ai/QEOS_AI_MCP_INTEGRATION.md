# QEOS Model Context Protocol (MCP) Integration Strategy

**Authorization:** QEOS-AUTH-0090
**Module:** `src/core/ai/orchestration/MCPToolAdapter.ts`

---

## 1. Architectural Boundary

> **MCP is a Tool Interoperability Protocol. QEOS is the Identity, Tenant, Permission, Risk, Approval, and Audit Authority.**

Model Context Protocol (MCP) servers allow external systems to expose tools using standard JSON-RPC interfaces (`tools/list` and `tools/call`). QEOS integrates MCP tools via `MCPToolAdapter` without delegating security or tenant authorization to external MCP servers.

---

## 2. MCP Protocol Version Support

The adapter supports dual specification versions:
- `MCPProtocolVersion`: `'2024-11-05'` and `'2026-07-28'`.
- Supports JSON-RPC `tools/list` discovery and `tools/call` stateless execution.
- Translates MCP tool definitions into QEOS `AIToolDefinition` contracts.

---

## 3. Remote OAuth & Token Security

When communicating with remote MCP endpoints:
1. QEOS internal JWTs or admin credentials are **NEVER** sent directly to external MCP servers.
2. Token audience validation (`validateAuthToken`) ensures least privilege access.
3. Every MCP tool execution passes through `AIToolPermissionGuard` and `AIToolResultNormalizer` before reaching the AI model context.
