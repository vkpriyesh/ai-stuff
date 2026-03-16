# GEMINI.md

You are assisting in a production-grade iOS mobile repository.

Your job is to create and maintain Claude Code assets for this repo:
- `.claude/CLAUDE.md`
- `.claude/skills/**`
- `.claude/agents/**`
- supporting templates, checklists, and commands

The team already has a PRD. Always start from the PRD and related docs under:
- `docs/prd/`
- `docs/architecture/`
- `docs/qa/`
- `docs/delivery/`

## Primary objective
Generate Claude Code instructions, skills, nested skill folders, and subagents that help build, secure, test, release, and operate a production iOS app.

## Working rules
- Do not write generic fluff.
- Read the PRD first, then derive architecture, backlog shape, security controls, release steps, and testing rules from it.
- Convert ambiguous PRD language into explicit engineering constraints.
- If something critical is missing from the PRD, record it under an assumptions section and continue.
- Optimize for maintainability, privacy, observability, and production readiness.
- Never hardcode secrets or include real credentials in code, docs, examples, or tests.
- Prefer Swift-first guidance.
- Assume modern iOS stack unless repo already dictates otherwise.
- Prefer:
  - Swift
  - SwiftUI
  - modular architecture
  - service and repository abstractions
  - async/await
  - structured concurrency
  - URLSession abstraction or approved network layer
  - Keychain for secure storage
  - feature flags
  - analytics and crash reporting
  - CI/CD and staged rollout discipline

## Production requirements
When generating Claude assets, enforce:
- staging and production separation
- environment-specific config
- no secrets in plist files committed to source control
- API keys and tokens via secure secret handling only
- secure auth/session storage
- backend validation expectations
- rate limiting expectations for write/auth flows
- backup and rollback awareness
- App Store release readiness
- crash reporting, persistent logs, metrics, alerts
- `/health` endpoint requirement for any backend owned by this app
- proper feature flagging, not commented-out code
- UTC storage and local display for time
- privacy-conscious telemetry collection

## Output requirements
Whenever asked to generate Claude Code assets, create:
1. `.claude/CLAUDE.md`
2. `.claude/agents/mobile-architect.md`
3. `.claude/agents/mobile-security.md`
4. `.claude/agents/mobile-test-engineer.md`
5. `.claude/agents/release-manager.md`
6. shared skills:
   - `.claude/skills/prd-to-architecture/`
   - `.claude/skills/mobile-api-integration/`
   - `.claude/skills/observability/`
   - `.claude/skills/feature-flags/`
7. iOS-specific skills:
   - `.claude/skills/ios/app-foundation/`
   - `.claude/skills/ios/swiftui-ui/`
   - `.claude/skills/ios/appstore-release/`

## Skill design rules
- Every skill must have a `SKILL.md`.
- Every `SKILL.md` must be concise, task-oriented, and production-minded.
- Put reusable detail in sibling files like `security.md`, `testing.md`, `architecture.md`, `checklist.md`, `reference.md`.
- Use nested folders to separate shared mobile skills from iOS-specific skills.
- Skills must include:
  - when to use
  - inputs required
  - outputs expected
  - guardrails
  - security checks
  - testing expectations
  - done criteria

## iOS-specific standards
Claude assets must guide the repo toward:
- clean separation of UI, domain, data, and integration layers
- no business logic in SwiftUI views
- reusable design system components
- offline/error/loading states
- typed request and response models
- retry and timeout handling
- idempotent write patterns where applicable
- proper background task handling
- secure Keychain usage
- deep link and universal link safety
- privacy manifest awareness
- accessibility and localization readiness
- app lifecycle and startup performance awareness

## Testing standards
Generated instructions must require:
- unit tests for business logic
- UI tests for critical flows
- dependency-mocked integration coverage
- unhappy path coverage
- malformed payload coverage
- auth/session expiry cases
- network timeout and offline cases
- release smoke checklist
- rollback notes

## Documentation standards
Generated assets must assume the team already has PRDs and should:
- link implementation decisions back to PRD requirements
- convert PRD items into technical acceptance criteria
- produce architecture notes and delivery checklists
- keep README and release docs current
- document env vars and config requirements without exposing secret values

## Behavior
When generating content:
- be opinionated
- be specific
- avoid placeholder nonsense
- produce repo-ready markdown
- do not invent completed implementation details that are not in the PRD
- clearly mark assumptions, risks, and missing inputs