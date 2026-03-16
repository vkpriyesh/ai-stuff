# CLAUDE.md

This file contains persistent project instructions for Claude Code.

## Core Principles

### Root Cause First
- Do not apply quick fixes, band-aids, or cosmetic patches.
- Diagnose problems to the root cause before making changes.
- Prefer durable, maintainable solutions over shortcuts.
- If a proper fix is not possible within the current scope, document the limitation clearly and create a tracked follow-up item with a deadline.

## Security & Secrets
- Never hardcode secrets, API keys, tokens, passwords, or connection strings.
- Never commit secrets to git, sample files, logs, screenshots, or documentation.
- Use separate credentials and tokens for dev, staging, and prod.
- Validate all external and client input server-side.
- Add rate limiting on authentication, write operations, and externally exposed endpoints.
- Follow least privilege for service accounts, roles, and database access.
- Mask sensitive values in logs and error messages.

## Architecture & Code Quality
- Design the architecture before building. Do not let it grow into spaghetti.
- Keep modules small and cohesive. Split large controllers, views, services, and components early.
- Wrap external API calls behind a clean service layer so they are easier to test, swap, cache, and extend.
- Keep business logic out of UI layers.
- Version database changes through proper migrations.
- Prefer explicit interfaces and contracts between layers.
- Keep code readable and boring over clever and fragile.
- Refactor when complexity starts compounding instead of normalizing mess.

## Observability
- Add crash reporting from day one.
- Implement persistent logging. Console-only logging is not acceptable.
- Structure logs so they are searchable and useful in production.
- Add metrics where useful for critical flows.
- Set up monitoring and alerts for service health, errors, and abnormal behavior.
- Do not wait for a user or random DM to tell you the app is down.

## Health Checks
- Every service must expose a `/health` endpoint.
- Health endpoints should be lightweight and deterministic.
- Health checks should verify the service is alive and, where appropriate, confirm critical dependencies are reachable.
- Do not rely on the homepage or main UI route as an uptime check.

## Feature Flags
- Use real feature flags for incomplete, risky, staged, or experimental functionality.
- Never use commented-out code as a release strategy.
- Feature flags should be named clearly and removable later.
- Flag rollout decisions should be documented.
- Clean up stale flags after rollout or retirement.

## Documentation
- Keep the `README.md` current at all times.
- Document how to run, build, test, deploy, and troubleshoot the project.
- Document required environment variables without exposing secret values.
- Document important architectural decisions and operational runbooks.
- Update docs in the same change set when behavior or setup changes.

## Environments & Deployment
- Maintain a real staging environment that mirrors production as closely as practical.
- Do not use wildcard CORS. Always restrict origins explicitly.
- Set up CI/CD early.
- Deployments must come from the pipeline, not from a developer laptop.
- Keep environment-specific configuration externalized.
- Ensure rollback is possible for production releases.

## Testing & Resilience
- Test unhappy paths, not just happy paths.
- Cover network failures, timeouts, malformed input, partial dependency outages, bad API responses, and retry behavior.
- Add tests for critical business flows and regression-prone logic.
- Verify backup and restore procedures at least once before they are needed in anger.
- Handle failures explicitly with meaningful errors and safe fallbacks where appropriate.

## Time Handling
- Store all timestamps in UTC.
- Convert to local time only at the display boundary.
- Be explicit about timezone assumptions in APIs, logs, reports, and scheduled jobs.

## Operational Discipline
- Do not leave hacky code in place without a tracked ticket and a deadline.
- "Later" is not a plan.
- Do not skip fundamentals just because the code compiles or appears to work.
- Prefer correctness, maintainability, and operability over speed theater.

## Implementation Expectations for Claude
When making changes in this repository:
- Start by understanding the relevant architecture and flow before editing code.
- Explain the likely root cause before proposing or applying a fix.
- Prefer minimal, clean changes that align with the existing architecture.
- Update tests when behavior changes.
- Update documentation when setup, behavior, or operations change.
- Add or improve observability when touching critical paths.
- Call out missing monitoring, health checks, feature flags, or documentation if they should exist and do not.
- Flag security concerns immediately.
- Do not introduce secrets into code, config, tests, or docs.
- Do not remove guardrails, validation, or error handling without a strong reason.

## Definition of Done
A task is not done unless, where applicable:
- the root cause is addressed
- code is clean and consistent
- tests are updated or added
- logs and monitoring are considered
- `/health` behavior remains valid
- docs are updated
- no secrets are exposed
- deployment path is clear through CI/CD