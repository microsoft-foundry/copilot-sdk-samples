# AGENTS.md - Issue Triage

Sample-specific guidance for AI agents working with the issue-triage SDK sample.

## Key Patterns

- **ConnectorResult**: All connector methods return `{ success, data?, error? }`
- **Mock-first development**: Use `{ mode: "mock" }` for local development
- **Service layer**: Business logic in `triage.ts`, connector logic separate

## Files to Understand

| File                       | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `index.ts`                 | Orchestrates connector and service setup  |
| `triage.ts`                | Core triage logic and `TriageResult` type |
| `../../connectors/github/` | GitHub API abstraction                    |

## Testing

```bash
pnpm issue-triage
pnpm test --filter issue-triage
```

Use `expectSuccess()` / `expectFailure()` helpers from `test/helpers/`.

## Extension Points

- Add new issue labels in `classifyIssue()` classification logic
- Extend `TriageResult` type for additional metadata
- Swap `{ mode: "mock" }` to `{ mode: "live" }` with real credentials
