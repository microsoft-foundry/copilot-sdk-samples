# Issue Triage (SDK)

Auto-labels GitHub issues using AI-powered classification.

## What This Demonstrates

- GitHub connector integration with mock support
- Issue classification and labeling workflow
- ConnectorResult pattern (`{ success, data?, error? }`)
- Service layer abstraction for business logic

## SDK Usage

```typescript
const github = createGitHubConnector({ mode: "mock" });
const triage = createTriageService(client, github);
const result = await triage.triageIssues();
```

## Running

```bash
pnpm issue-triage
```

## Key Files

| File                       | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `index.ts`                 | Sample entry point                        |
| `triage.ts`                | `triageIssues()`, `classifyIssue()` logic |
| `../../connectors/github/` | GitHub connector implementation           |
