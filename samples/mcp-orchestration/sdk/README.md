# MCP Orchestration (SDK)

Queries development infrastructure via Model Context Protocol (MCP).

## What This Demonstrates

- MCP server discovery and connection
- Tool discovery across MCP servers
- Multi-source data aggregation (CI, deployments, metrics)
- Infrastructure health monitoring patterns

## SDK Usage

```typescript
const mcp = createMCPClient({ mode: "mock" });
const servers = await mcp.listServers();
const ciStatus = await mcp.getCIStatus();
const health = await mcp.getServiceHealth();
```

## Running

```bash
pnpm mcp-orchestration
```

## Key Files

| File       | Purpose                               |
| ---------- | ------------------------------------- |
| `index.ts` | Sample entry point                    |
| `mcp.ts`   | MCP client and infrastructure queries |
