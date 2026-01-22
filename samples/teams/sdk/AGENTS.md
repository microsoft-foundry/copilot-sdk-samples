# AGENTS.md - Microsoft Teams

Sample-specific guidance for AI agents.

## Key Patterns

- **Connector-focused**: Does not use CopilotClient directly in demo
- **Adaptive Cards**: Rich notification formatting for alerts, deployments, incidents
- **Service layer abstraction**: `TeamsCollaborationService` wraps connector

## Files to Understand

| File                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `services/collaboration.js` | Core Teams operations                         |
| `connectors/teams.js`       | MS Graph API abstraction with mock/live modes |
| `types/index.ts`            | Team, Channel, Message, Meeting types         |

## Testing

```bash
pnpm test samples/teams
```

Mock connector simulates Teams workspace with teams, channels, and users.

## Extension Points

- Add notification templates in `collaboration.js`
- Extend connector for additional Graph APIs (files, presence, calls)
- Add Adaptive Card templates for new notification types
