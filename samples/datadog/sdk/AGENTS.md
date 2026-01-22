# AGENTS.md - Datadog Monitoring

Sample-specific guidance for AI agents.

## Key Patterns

- **ConnectorResult pattern**: All connector methods return `{ success, data?, error? }`
- **Service layer abstraction**: `MonitoringService` wraps connector for business logic
- **Mock-first development**: Use `mode: "mock"` for testing without credentials

## Files to Understand

| File                     | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `services/monitoring.js` | Core monitoring operations                                    |
| `connectors/datadog.js`  | API abstraction with mock/live modes                          |
| `types/index.ts`         | `MonitoringOverview`, `SLOComplianceReport`, `IncidentReport` |

## Testing

```bash
pnpm test samples/datadog
```

Mock connector provides deterministic responses for all scenarios.

## Extension Points

- Add new monitoring methods in `monitoring.js`
- Extend connector for additional Datadog APIs (APM, logs, dashboards)
- Add new types in `types/index.ts` for additional data structures
