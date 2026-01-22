# Datadog Monitoring (SDK)

Infrastructure monitoring, SLO compliance, and incident management using Datadog APIs.

## What This Demonstrates

- Monitor health aggregation and alerting workflows
- SLO compliance tracking and breach detection
- Incident lifecycle management
- Host health monitoring with CPU/memory analysis
- Proactive remediation (muting, monitor creation)

## SDK Usage

```typescript
import { runSample, createClient } from "../../../shared/client.js";
import { createDatadogConnector } from "./connectors/datadog.js";
import { createMonitoringService } from "./services/monitoring.js";

await runSample({ name: "datadog" }, async (client) => {
  const connector = createDatadogConnector({ mode: "mock" });
  const monitoring = createMonitoringService(connector);
  const overview = await monitoring.getMonitoringOverview();
});
```

## Running

```bash
pnpm datadog
```

## Key Files

| File                     | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `index.ts`               | Sample entry point with demo scenarios          |
| `services/monitoring.js` | Monitoring operations (alerts, SLOs, incidents) |
| `connectors/datadog.js`  | Datadog API connector with mock support         |
| `types/index.ts`         | Type definitions for monitoring data            |
