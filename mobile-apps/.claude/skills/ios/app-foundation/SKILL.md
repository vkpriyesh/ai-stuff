# iOS App Foundation Skill

## Purpose
Set up the core structure and scaffolding for a modern iOS application.

## Inputs
- `docs/architecture/`
- Target iOS Version.

## Standards
- **Language**: Swift.
- **UI Framework**: SwiftUI.
- **Concurrency**: Async/Await.
- **Architecture**: MVVM or TCA (check repo preference).

## Tasks
1.  **Project Structure**:
    -   Folder organization (App, Core, Features, DesignSystem).
    -   SPM (Swift Package Manager) for dependencies.
2.  **Base Setup**:
    -   `App` struct (lifecycle).
    -   Dependency Injection container/factory.
3.  **Navigation**:
    -   `NavigationStack`.
    -   Router/Coordinator pattern if complex.
4.  **Theming**:
    -   Asset Catalog (Colors, Images).
    -   Font extensions.

## Output
- `.xcodeproj` / `.xcworkspace` configuration updates.
- `App.swift`.
- Base protocols/extensions.

## Checklist
- [ ] SwiftLint configuration (`.swiftlint.yml`).
- [ ] Schemes config (Dev, Staging, Prod).
- [ ] Info.plist configuration.
