# Documentation Standards

Guidelines for writing code documentation that explains *why*, not *what*.

## Function Documentation

### Template

```typescript
/**
 * [One-line description of what this does and why it exists]
 * 
 * [Optional: Context about when/why to use this]
 * 
 * @param paramName - [Purpose, constraints, edge cases]
 * @returns [What's returned and when, including null/undefined cases]
 * @throws [Error type] - [When this error occurs]
 * 
 * @example
 * // [Brief description of example scenario]
 * const result = functionName(input);
 * // result: expectedOutput
 */
```

### Good Example

```typescript
/**
 * Calculates the trust score for a user profile.
 * 
 * Trust score determines feature access:
 * - Score > 80: Show verification badge
 * - Score > 60: Enable premium features
 * - Score < 40: Trigger additional verification
 * 
 * @param profile - User profile with verification signals
 * @returns Score from 0-100, or null if insufficient data (< 2 signals)
 * 
 * @example
 * const score = calculateTrustScore({
 *   emailVerified: true,
 *   phoneVerified: false,
 *   accountAge: 90 // days
 * }); // Returns ~65
 */
function calculateTrustScore(profile: UserProfile): number | null {
  // Implementation
}
```

### Bad Examples

```typescript
// ❌ DON'T: Comment restates code
/**
 * Gets user by ID
 * @param id - The ID
 * @returns The user
 */
function getUserById(id: string): User { }

// ❌ DON'T: No context on why/when
/**
 * Validates input
 */
function validateInput(input: unknown): boolean { }

// ❌ DON'T: Missing edge cases
/**
 * Divides two numbers
 */
function divide(a: number, b: number): number { }
// What happens when b is 0?
```

## Inline Comments

### When to Comment

Comment the *why*, not the *what*:

```typescript
// ✅ DO: Explain non-obvious decisions
// Using 47ms delay because Chrome's requestIdleCallback
// fires at ~50ms intervals on average
const IDLE_DELAY = 47;

// ✅ DO: Warn about gotchas
// WARNING: This modifies the original array for performance
// Clone first if you need the original preserved
array.sort(compareFn);

// ✅ DO: Explain business rules
// Users get a 30-day grace period after subscription expires
// per legal requirement in EU markets (PSD2)
const GRACE_PERIOD_DAYS = 30;
```

```typescript
// ❌ DON'T: State the obvious
// Increment counter by 1
counter++;

// ❌ DON'T: Explain standard patterns
// Use a for loop to iterate
for (const item of items) { }

// ❌ DON'T: Leave outdated comments
// TODO: Fix this later (from 2019)
```

## README Template

Every project/module needs these sections:

```markdown
# Project Name

> One-sentence purpose: What problem does this solve?

## User Outcome

Who benefits and how? Example:
"Helps developers quickly prototype forms with built-in validation,
reducing form implementation time by 60%."

## Quick Start

Get running in < 5 minutes:

\`\`\`bash
npm install your-package
\`\`\`

\`\`\`typescript
import { Form } from 'your-package';

// Minimal working example
const form = new Form({ /* ... */ });
\`\`\`

## Architecture

[Diagram or description of key components]

\`\`\`
┌─────────────┐     ┌─────────────┐
│   Input     │────▶│  Validator  │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Output    │
                    └─────────────┘
\`\`\`

## Key Decisions

| Decision | Why | Alternatives Considered |
|----------|-----|------------------------|
| React over Vue | Team expertise | Vue, Svelte |
| Zod for validation | Type inference | Yup, Joi |

## Known Limitations

- Does not support file uploads > 10MB
- Requires JavaScript enabled
- IE11 not supported

## Contributing

1. Fork the repository
2. Create feature branch
3. Run tests: `npm test`
4. Submit PR with description
```

## Error Messages

### Format

```typescript
interface UserFacingError {
  // What happened (user-friendly)
  title: string;
  
  // Why it happened (if known)
  reason?: string;
  
  // How to fix it
  action: string;
  
  // For support/debugging (not shown to user by default)
  code: string;
}
```

### Examples

```typescript
// ✅ Good error message
{
  title: "Unable to save your changes",
  reason: "The server is temporarily unavailable",
  action: "Please try again in a few minutes",
  code: "ERR_SERVER_503"
}

// ❌ Bad error messages
"Error 500"
"Something went wrong"
"Invalid input"
"null is not an object"
```

### Never Blame the User

```typescript
// ❌ DON'T
"You entered an invalid email"
"Your password is wrong"

// ✅ DO
"Please enter a valid email address"
"The password doesn't match our records"
```

## Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.2.0] - 2024-01-15

### Added
- Dark mode support with `prefers-color-scheme` detection
- Export to PDF functionality

### Changed
- Improved form validation error messages
- Updated dependencies to latest versions

### Fixed
- Button focus state not visible in high contrast mode
- Memory leak in infinite scroll component

### Security
- Updated crypto library to patch CVE-2024-XXXX
```

## API Documentation

For public APIs, document:

```typescript
/**
 * @public
 * @since 1.0.0
 * @deprecated Use `newMethod` instead. Will be removed in v3.0.
 * 
 * @param config - Configuration object
 * @param config.timeout - Request timeout in ms (default: 5000)
 * @param config.retries - Number of retry attempts (default: 3)
 * 
 * @returns Promise resolving to response data
 * 
 * @throws {NetworkError} When request fails after all retries
 * @throws {ValidationError} When config is invalid
 * 
 * @see {@link newMethod} for the recommended alternative
 * @see {@link https://docs.example.com/api} for full documentation
 */
```
