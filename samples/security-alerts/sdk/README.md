# Security Alerts (SDK)

Prioritizes security vulnerabilities with AI-powered analysis.

## What This Demonstrates

- Security alert fetching and analysis
- Severity-based prioritization logic
- Remediation suggestion generation
- ConnectorResult pattern with typed responses

## SDK Usage

```typescript
const github = createGitHubConnector({ mode: "mock" });
const security = createSecurityAlertService(client, github);
const analysis = await security.analyzeAlerts();
```

## Running

```bash
pnpm security-alerts
```

## Key Files

| File                       | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `index.ts`                 | Sample entry point                               |
| `alerts.ts`                | `analyzeAlerts()`, `getActionableAlerts()` logic |
| `../../connectors/github/` | GitHub security API integration                  |
