# AGENTS.md - RLM Orchestration

Sample-specific guidance for AI agents.

## Key Patterns

- **Recursive LLM**: Iterative reasoning with code extraction and REPL execution
- **Event system**: `on()`, `off()` for event handling
- **NDJSON streaming**: GitHub Actions compatible output format

## Event Types

`execution_start`, `iteration_start`, `code_extracted`, `repl_executing`, `repl_result`, `final_detected`, `iteration_complete`, `execution_complete`, `error`

## Files to Understand

| File             | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `rlm-client.js`  | Core RLM client with `execute()` method                        |
| `types.js`       | `RLMEvent`, `RLMExecution`, `RLMIteration`, `calculateStats()` |
| `environment.js` | GitHub Actions environment configuration                       |

## Environment Variables

- `GITHUB_TOKEN` - GitHub authentication
- `GITHUB_REPOSITORY` - Target repository
- `RLM_STREAMING` - Enable NDJSON streaming

## Testing

```bash
pnpm test samples/rlm-orchestration
```

## Extension Points

- Add new event types in `types.js`
- Extend REPL capabilities in `rlm-client.js`
- Add custom iteration strategies
