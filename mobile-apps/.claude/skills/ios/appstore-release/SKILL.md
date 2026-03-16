# iOS App Store Release Skill

## Purpose
Prepare and execute a release to the Apple App Store.

## Prerequisites
- Apple Developer Program Account.
- App Store Connect Access.
- Distribution Certificates & Profiles.

## Steps
1.  **Version Bump**: Update `Marketing Version` and `Build Number` in Xcode target settings.
2.  **Build**: Archive via Xcode (`Product > Archive`).
3.  **Upload**: Validate and Distribute to App Store Connect.
4.  **Testing**:
    -   Process build in TestFlight.
    -   Distribute to internal/external testers.
5.  **Submission**:
    -   Select build.
    -   Update screenshots/metadata if needed.
    -   Submit for Review.

## Automation Checks (Fastlane)
- `match` for code signing sync.
- `gym` to build.
- `pilot` to upload to TestFlight.
- `deliver` to upload metadata.

## Artifacts
- `.ipa` file.
- `dSYMs` (for crash reporting).
