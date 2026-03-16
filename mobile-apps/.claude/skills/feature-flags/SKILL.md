# Feature Flags Skill

## Purpose
Implement a system to toggle features on/off remotely or locally to support trunk-based development and safe rollouts.

## When to Use
- Developing incomplete features that must merge to main.
- Releasing risky changes that might need a kill-switch.
- A/B testing.

## Implementation
1.  **Configuration**: Define the flag source (Firebase Remote Config, LaunchDarkly, or local JSON).
2.  **Abstraction**: Create a `FeatureFlagService` interface.
    -   `isFeatureEnabled(key: FeatureKey): Boolean`
3.  **Usage**:
    -   Wrap UI entry points.
    -   Wrap code paths in ViewModels/Interactors.

## Best Practices
- **Default Values**: Always define a safe default (usually `false`).
- **Cleanup**: Add a TODO to remove the flag code once the feature is fully rolled out (stale flags are tech debt).
- **Caching**: Ensure flags are fetched/cached appropriately so they don't block app startup if possible.

## Checklist
- [ ] Flag keys are constants/enums.
- [ ] Fallback values are defined.
- [ ] Analytics events include active experiment variants if applicable.
