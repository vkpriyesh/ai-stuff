---
applyTo: "**/*.{test,spec}.{ts,tsx,js,jsx,py,go,rs}"
---

# Test File Guidelines

When writing or modifying tests:

## Test Quality
- Use descriptive test names that explain the scenario, not the implementation
- One logical assertion per test when possible
- Test behavior, not implementation details
- Use fixtures/factories for test data, not inline literals

## Coverage Priorities
1. **Happy path** - Normal, expected usage
2. **Edge cases** - Empty input, null/undefined, boundary values, max/min
3. **Error cases** - Invalid input, network failures, timeouts, permission errors
4. **Integration** - Component interactions, API contracts

## Test Hygiene
- Tests must be independent - no shared mutable state between tests
- Mock external services (APIs, databases, file systems), not internal logic
- Clean up resources in teardown/afterEach
- Don't test framework behavior - only test YOUR code
- Avoid snapshot tests for dynamic content

## When Modifying Tests
- Read the existing test file to understand patterns before adding new tests
- Match the existing test framework and style conventions
- Don't refactor existing tests unless they're broken or directly related to your change
- Run the full test suite after changes to check for regressions

## When Writing New Tests
- Check if a test file already exists for the module - add to it rather than creating a new one
- Follow the project's existing test file naming convention
- Include both positive and negative test cases
- Verify error messages and error types, not just that an error was thrown
