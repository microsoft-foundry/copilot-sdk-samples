# AGENTS.md - PagerDuty

Sample-specific guidance for AI agents working with the pagerduty SDK sample.

## Key Patterns

- **Incident lifecycle**: `getActiveIncidents()` -> `acknowledgeIncident()` -> resolve
- **Urgency filtering**: `getHighUrgencyIncidents()` for critical issues
- **Service context**: `getServiceHealth()` provides service-level view

## Files to Understand

| File                          | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `index.ts`                    | Orchestrates incident management flow |
| `incidents.ts`                | Core incident operations and analysis |
| `../../connectors/pagerduty/` | PagerDuty API abstraction             |

## Testing

```bash
pnpm pagerduty
pnpm test --filter pagerduty
```

## Types Reference

- `IncidentAnalysis`: Aggregated incident insights
- `IncidentSummary`: Single incident overview
- `ServiceHealth`: Service status and metrics
- `OnCallSummary`: Current on-call responders

## Extension Points

- Add escalation logic in incident management service
- Extend `IncidentAnalysis` for trend detection
- Implement incident correlation across services
- Add runbook automation triggers
