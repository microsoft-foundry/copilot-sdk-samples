# PagerDuty (SDK)

Incident management with AI-powered analysis and response.

## What This Demonstrates

- PagerDuty connector integration with mock support
- Incident lifecycle management (list, acknowledge, create)
- On-call schedule and service health queries
- Incident timeline and analysis patterns

## SDK Usage

```typescript
const pagerduty = createPagerDutyConnector({ mode: "mock" });
const incidents = createIncidentManagementService(client, pagerduty);
const analysis = await incidents.getActiveIncidents();
```

## Running

```bash
pnpm pagerduty
```

## Key Files

| File                          | Purpose                           |
| ----------------------------- | --------------------------------- |
| `index.ts`                    | Sample entry point                |
| `incidents.ts`                | Incident management service logic |
| `../../connectors/pagerduty/` | PagerDuty API integration         |
