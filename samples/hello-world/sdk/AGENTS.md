# AGENTS.md - Hello World

Sample-specific guidance for AI agents working with the hello-world SDK sample.

## Key Patterns

- **Session lifecycle**: Create session, send prompt, listen for events, destroy session
- **Event-driven completion**: Use `session.idle` event to detect when assistant finishes
- **Promise wrapping**: Wrap event listeners in Promise for async/await flow

## Files to Understand

| File                     | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `index.ts`               | Entry point demonstrating basic SDK flow          |
| `../../shared/client.ts` | `runSample()` helper and `createClient()` factory |

## Testing

```bash
pnpm hello-world
pnpm test --filter hello-world
```

## Extension Points

- Modify the prompt in `session.send()` to test different interactions
- Add additional event listeners (`assistant.message`, `tool.call`, etc.)
- Chain multiple `session.send()` calls for multi-turn conversations
