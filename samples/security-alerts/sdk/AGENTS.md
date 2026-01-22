# AGENTS.md - Security Alerts

Sample-specific guidance for AI agents working with the security-alerts SDK sample.

## Key Patterns

- **Severity prioritization**: Critical > High > Medium > Low
- **PrioritizedAlert**: Enriched alert with priority score and remediation
- **SecurityAnalysis**: Aggregated analysis result type

## Files to Understand

| File                       | Purpose                                |
| -------------------------- | -------------------------------------- |
| `index.ts`                 | Orchestrates security analysis flow    |
| `alerts.ts`                | Core analysis and prioritization logic |
| `../../connectors/github/` | GitHub security API abstraction        |

## Testing

```bash
pnpm security-alerts
pnpm test --filter security-alerts
```

Mock data includes various severity levels for testing prioritization.

## Extension Points

- Modify severity scoring weights in prioritization logic
- Add new remediation suggestion templates
- Extend `SecurityAnalysis` for additional metrics
- Integrate with vulnerability databases for enrichment
