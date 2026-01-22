# AGENTS.md - MCP Orchestration

Sample-specific guidance for AI agents working with the mcp-orchestration SDK sample.

## Key Patterns

- **Server discovery**: `listServers()` finds available MCP servers
- **Tool discovery**: `listTools()` enumerates capabilities per server
- **Data aggregation**: Combine CI, deployments, health, metrics from multiple sources

## Files to Understand

| File       | Purpose                                       |
| ---------- | --------------------------------------------- |
| `index.ts` | Orchestrates MCP queries and displays results |
| `mcp.ts`   | `MCPClient` and typed query methods           |

## Testing

```bash
pnpm mcp-orchestration
pnpm test --filter mcp-orchestration
```

## Types Reference

- `CIBuildStatus`: Build state, branch, commit info
- `DeploymentStatus`: Environment, version, status
- `ServiceHealth`: Service name, health state, latency
- `InfrastructureMetrics`: CPU, memory, request rates

## Extension Points

- Add new MCP server integrations in `mcp.ts`
- Extend query methods for additional infrastructure data
- Implement custom aggregation logic across data sources
