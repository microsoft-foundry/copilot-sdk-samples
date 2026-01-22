# Microsoft Teams (SDK)

MS Teams collaboration integration for workspace management and automated notifications.

## What This Demonstrates

- Workspace and team analytics
- Channel and message management
- Rich notifications with Adaptive Cards
- Alert, deployment, and incident notifications
- Meeting creation and scheduling

## SDK Usage

```typescript
import { createTeamsConnector } from "./connectors/teams.js";
import { createTeamsCollaborationService } from "./services/collaboration.js";

const connector = createTeamsConnector({ mode: "mock" });
const collaboration = createTeamsCollaborationService(connector);
const overview = await collaboration.getWorkspaceOverview();
await collaboration.sendDeploymentNotification(channelId, deploymentInfo);
```

## Running

```bash
pnpm teams
```

## Key Files

| File                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `index.ts`                  | Sample entry point with notification demos    |
| `services/collaboration.js` | Teams operations (messages, meetings, alerts) |
| `connectors/teams.js`       | MS Graph API connector with mock support      |
| `types/index.ts`            | Type definitions for Teams data               |
