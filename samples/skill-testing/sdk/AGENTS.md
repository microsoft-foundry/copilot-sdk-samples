# AGENTS.md - Skill Testing

Sample-specific guidance for AI agents.

## Key Patterns

- **Skill file format**: Skills defined in `SKILL.md` markdown files
- **Test criteria types**: `code_compiles`, `output_contains`, `test_passes`
- **Harness lifecycle**: `initialize()` -> `runTestSuite()` -> `dispose()`

## Files to Understand

| File                | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `parser.js`         | `ParsedSkill`, `SkillTestCase` parsing                      |
| `harness.js`        | Test execution with `initialize`, `runTestSuite`, `dispose` |
| `skills/*/SKILL.md` | Skill definitions to test                                   |

## Testing

```bash
pnpm test samples/skill-testing
```

Use `verbose: true` in harness config for detailed test output.

## Extension Points

- Add new test criteria types in harness
- Create new skills in `skills/[skill-name]/SKILL.md`
- Extend parser for additional skill metadata
