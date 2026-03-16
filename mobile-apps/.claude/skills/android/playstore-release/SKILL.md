# Android Play Store Release Skill

## Purpose
Prepare and execute a release to the Google Play Store.

## Prerequisites
- Google Play Console Access.
- Keystore (Upload Key).

## Steps
1.  **Version Bump**: Update `versionCode` and `versionName` in `build.gradle.kts`.
2.  **Build**: Run `./gradlew bundleRelease`.
3.  **Testing**:
    -   Deploy to **Internal Testing** track first.
    -   Verify mapping file (ProGuard/R8) is uploaded for de-obfuscation.
4.  **Listing**: Update "What's New".
5.  **Rollout**: Start a staged rollout (e.g., 10% -> 20% -> 50% -> 100%).

## Automation Checks (Fastlane)
- Verify `secrets.properties` are available in CI.
- Verify signing config is secure.
- Verify tests passed.

## Artifacts
- `.aab` (Android App Bundle).
- `mapping.txt`.
