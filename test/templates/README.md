# Test Templates

This directory contains templates for creating new tests in the repository.

## Available Templates

- `connector.test.template.ts` - Template for testing connectors
- `sample.test.template.ts` - Template for testing samples
- `shared.test.template.ts` - Template for testing shared utilities

## Usage

1. Copy the appropriate template file
2. Rename it to match your test file (e.g., `my-connector.test.ts`)
3. Replace placeholder values:
   - `__CONNECTOR_NAME__` or `__SAMPLE_NAME__` or `__UTILITY_NAME__`
   - `__DESCRIPTION__`
   - Add your specific test cases
4. Run tests: `pnpm test:watch`

## Quick Start

```bash
# For a new connector
cp test/templates/connector.test.template.ts test/connectors/my-connector.test.ts

# For a new sample
cp test/templates/sample.test.template.ts test/samples/my-sample/my-sample.test.ts

# For a shared utility
cp test/templates/shared.test.template.ts test/shared/my-utility.test.ts
```

## Best Practices

- Follow the Arrange-Act-Assert pattern
- Test both success and failure cases
- Test edge cases and boundaries
- Use descriptive test names
- Keep tests independent
- Clean up resources in `afterEach`

See [../docs/TESTING.md](../../docs/TESTING.md) for complete testing guidelines.
