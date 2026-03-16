# Observability and Monitoring Skill

## Purpose
ensure the app provides sufficient telemetry to understand its health, usage, and crashes in production.

## When to Use
- Implementing a new feature.
- Setting up a new project.
- Debugging production issues.

## Strategies
1.  **Crash Reporting**:
    -   Identify Crashlytics/Sentry integration points.
    -   Ensure non-fatal errors are logged for "silent" failures.
2.  **Analytics**:
    -   Define event names and properties.
    -   **Privacy**: Do NOT log PII (emails, names, IDs) in analytics events.
3.  **Performance Monitoring**:
    -   Track app startup time.
    -   Track critical network request durations.
    -   Track screen render times.

## Implementation Checklist
- [ ] Initialize SDKs only after user consent (if required by GDPR/CCPA).
- [ ] Use a wrapper/abstraction over the analytics vendor.
- [ ] Breadcrumbs: Leave logs of user actions leading up to a crash.
- [ ] Sanitize logs: Ensure `Log.d` / `print` are stripped in release builds.

## Output
- Analytics event map (`docs/analytics/events.md`).
- Logging utility classes/extensions.
