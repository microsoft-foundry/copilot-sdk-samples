# Testing Guide

This guide covers test-driven development (TDD) practices for the Copilot SDK Samples repository.

## Philosophy

We follow **test-driven development** principles:

1. **Write tests first** - Before implementing a feature, write the tests
2. **Red-Green-Refactor** - See tests fail, make them pass, then refactor
3. **Fast feedback** - Use watch mode for continuous testing during development
4. **High coverage** - Maintain minimum 80% code coverage for core functionality
5. **Mock-first** - All tests run without external dependencies

## Quick Start

```bash
# Run all tests once
pnpm test

# TDD mode - watch for changes and re-run tests
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

## TDD Workflow

### 1. Starting a New Feature

```bash
# Start watch mode in a separate terminal
pnpm test:watch

# Now write your test first
```

### 2. Red Phase - Write a Failing Test

Create your test file in the appropriate location:

- `test/samples/<name>/` for sample tests
- `test/connectors/<name>/` for connector tests
- `test/shared/` for shared utility tests

Example:

```typescript
import { describe, it, expect } from "vitest";

describe("MyNewFeature", () => {
  it("should do something specific", () => {
    const result = myNewFeature();
    expect(result).toBe("expected");
  });
});
```

### 3. Green Phase - Make It Pass

Implement the minimum code needed to make the test pass.

### 4. Refactor Phase - Improve the Code

Clean up your implementation while keeping tests green.

## Test Structure

### Directory Organization

```
test/
├── connectors/          # Connector implementation tests
│   ├── github.test.ts
│   ├── jira.test.ts
│   └── ...
├── samples/             # Sample application tests
│   ├── hello-world/
│   │   └── hello-world.test.ts
│   ├── issue-triage/
│   │   └── issue-triage.test.ts
│   └── ...
├── shared/              # Shared utility tests
│   └── client.test.ts
├── helpers/             # Test helper utilities
│   ├── connector.ts     # Connector test helpers
│   ├── helpers.test.ts  # Tests for test helpers
│   └── index.ts
└── setup.ts             # Global test setup
```

### Test File Naming

- Test files: `<name>.test.ts`
- Place tests near the code they test (in `test/` directory)
- Mirror the source file structure in `test/`

### Test Structure Pattern

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { expectSuccess, expectFailure } from "../../helpers/index.js";

describe("ComponentName", () => {
  // Setup and teardown
  beforeEach(() => {
    // Initialize test state
  });

  afterEach(() => {
    // Clean up resources
  });

  describe("methodName", () => {
    it("should handle success case", () => {
      // Arrange
      const input = "test";

      // Act
      const result = method(input);

      // Assert
      expect(result).toBe("expected");
    });

    it("should handle error case", () => {
      // Test error scenarios
    });

    it("should validate edge cases", () => {
      // Test boundary conditions
    });
  });
});
```

## Testing Patterns

### ConnectorResult Pattern

Use `expectSuccess` and `expectFailure` for testing connector results:

```typescript
import { expectSuccess, expectFailure } from "../../helpers/index.js";

it("should return successful result", async () => {
  const result = await connector.fetchData();

  expectSuccess(result);
  expect(result.data).toBeDefined();
  expect(result.data.id).toBe(123);
});

it("should return failure with error code", async () => {
  const result = await connector.fetchInvalid();

  expectFailure(result, "NOT_FOUND");
  expect(result.error?.message).toContain("not found");
});
```

### Mock Connectors

All connectors support mock mode by default:

```typescript
import { createGitHubConnector } from "../../../shared/connectors/github/index.js";

beforeEach(async () => {
  connector = createGitHubConnector({ mode: "mock" });
  await connector.initialize();
});

afterEach(async () => {
  await connector.dispose();
});
```

### Async Operations

Always use `async/await` for testing async code:

```typescript
it("should handle async operations", async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined();
});
```

### Timeouts

Configure timeouts in `vitest.config.ts` or per-test:

```typescript
it("should complete within timeout", async () => {
  // Test will timeout after 5000ms (configured globally)
  const result = await longRunningOperation();
  expect(result).toBeDefined();
}, 10000); // Override to 10 seconds for this test
```

## Test Helpers

### Available Helpers

Located in `test/helpers/`:

- `expectSuccess(result)` - Assert ConnectorResult is successful
- `expectFailure(result, code?)` - Assert ConnectorResult failed
- `createMockResult(data)` - Create mock success result
- `createMockError(code, message)` - Create mock error result
- `createTimedMock(value, delay)` - Create async mock with delay
- `withTimeout(promise, ms)` - Add timeout to promise
- `createSpyConnector()` - Create spy connector for testing

### Creating Test Helpers

Add reusable test utilities to `test/helpers/`:

```typescript
export function createTestData(): TestData {
  return {
    id: 1,
    name: "Test",
    // ...
  };
}
```

## Coverage Requirements

### Minimum Coverage Thresholds

We enforce minimum coverage thresholds to ensure code quality:

- **Statements**: 55% (enforced)
- **Branches**: 50% (enforced)
- **Functions**: 60% (enforced)
- **Lines**: 55% (enforced)

**Target Coverage Goals** (aim for these when writing new code):

- **Connectors**: 80%+ coverage
- **Samples**: 70%+ coverage
- **Shared utilities**: 80%+ coverage
- **Test helpers**: 100% coverage

### Checking Coverage

```bash
# Generate HTML coverage report
pnpm test:coverage

# View report
open coverage/index.html
```

### Coverage by Area

**Target coverage goals** for new code:

- **Connectors**: Aim for 80%+ coverage
- **Samples**: Aim for 70%+ coverage (some integration code is hard to test)
- **Shared utilities**: Aim for 80%+ coverage
- **Test helpers**: Aim for 100% coverage

**Current baseline**: The repository maintains a minimum threshold to prevent coverage regression.

### Excluded from Coverage

These files are excluded from coverage:

- `**/node_modules/**`
- `**/dist/**`
- `**/index.ts` (re-export files)
- Integration test harnesses

## Writing Good Tests

### DO's

✅ Test behavior, not implementation  
✅ Use descriptive test names  
✅ Follow Arrange-Act-Assert pattern  
✅ Test both success and failure cases  
✅ Test edge cases and boundaries  
✅ Use mock mode for connectors  
✅ Clean up resources in `afterEach`  
✅ Keep tests independent and isolated  
✅ Use test helpers for common patterns

### DON'Ts

❌ Don't test implementation details  
❌ Don't make tests depend on each other  
❌ Don't use real API credentials in tests  
❌ Don't skip cleanup in `afterEach`  
❌ Don't write tests that can randomly fail  
❌ Don't test third-party libraries  
❌ Don't duplicate test setup code (use helpers)

## Testing New Features

### Checklist for Adding a New Sample

When adding a new sample, ensure you:

- [ ] Create `test/samples/<name>/<name>.test.ts`
- [ ] Test the main sample workflow
- [ ] Test all exported functions
- [ ] Test error handling
- [ ] Test edge cases
- [ ] Mock all external dependencies
- [ ] Achieve 70%+ coverage
- [ ] Update this testing guide if needed

### Checklist for Adding a New Connector

When adding a new connector, ensure you:

- [ ] Create `test/connectors/<name>.test.ts`
- [ ] Test `initialize()` method
- [ ] Test `dispose()` method
- [ ] Test `healthCheck()` method
- [ ] Test all connector-specific methods
- [ ] Test mock mode works correctly
- [ ] Test error scenarios
- [ ] Test ConnectorResult pattern
- [ ] Achieve 80%+ coverage
- [ ] Add connector test helpers if needed

## Continuous Integration

### Pre-commit Hooks

Tests run automatically before commits via Husky:

```bash
# Configured in .husky/pre-commit
# Runs lint-staged which includes tests for changed files
```

### CI Pipeline

GitHub Actions runs tests on every push and PR:

- **Lint**: ESLint checks
- **Typecheck**: TypeScript compilation
- **Test**: Full test suite
- **Build**: Production build

See `.github/workflows/ci.yml` for configuration.

### Enforcing Coverage

CI fails if coverage drops below thresholds. To check locally:

```bash
pnpm test:coverage
```

## Debugging Tests

### Using VS Code

1. Open test file
2. Set breakpoints
3. Run "Debug Test" from test sidebar
4. Step through code

### Using Vitest UI

```bash
pnpm test:ui
```

This opens a browser UI for:

- Running individual tests
- Viewing test results
- Debugging test failures
- Analyzing coverage

### Common Issues

**Tests timing out**

- Increase timeout in `vitest.config.ts` or per-test
- Check for unresolved promises

**Flaky tests**

- Remove dependencies on external state
- Use deterministic test data
- Avoid time-based assertions

**Mock not working**

- Ensure mock is configured before import
- Use `vi.hoisted()` for mock setup
- Check mock is in correct scope

## Best Practices

### 1. Test Names

Use descriptive test names that explain the scenario:

```typescript
// ✅ Good
it("should return error when issue number is invalid", () => {});

// ❌ Bad
it("should work", () => {});
```

### 2. Arrange-Act-Assert

Structure tests clearly:

```typescript
it("should calculate total", () => {
  // Arrange
  const items = [1, 2, 3];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(6);
});
```

### 3. One Assertion Per Test

Focus each test on one specific behavior:

```typescript
// ✅ Good - focused test
it("should return correct sum", () => {
  expect(add(2, 3)).toBe(5);
});

it("should return correct product", () => {
  expect(multiply(2, 3)).toBe(6);
});

// ❌ Bad - testing multiple things
it("should do math", () => {
  expect(add(2, 3)).toBe(5);
  expect(multiply(2, 3)).toBe(6);
});
```

### 4. Test Edge Cases

Don't just test the happy path:

```typescript
describe("validateEmail", () => {
  it("should accept valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("should reject empty string", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("should reject missing @", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("should reject missing domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });
});
```

### 5. Resource Cleanup

Always clean up in `afterEach`:

```typescript
let connector: Connector;

beforeEach(async () => {
  connector = createConnector({ mode: "mock" });
  await connector.initialize();
});

afterEach(async () => {
  await connector.dispose(); // Important!
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test-Driven Development (TDD)](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Getting Help

- Check existing tests for examples
- Review test helpers in `test/helpers/`
- Ask in team discussions
- See [SAMPLES.md](./SAMPLES.md) for sample-specific guidelines
- See [CONNECTORS.md](./CONNECTORS.md) for connector-specific guidelines
