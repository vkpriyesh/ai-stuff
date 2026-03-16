# Android App Foundation Skill

## Purpose
Set up the core structure and scaffolding for a modern Android application.

## Inputs
- `docs/architecture/`
- Project constraints (minSdk, targetSdk).

## Standards
- **Language**: Kotlin.
- **Build System**: Gradle (Kotlin DSL preferred).
- **DI**: Hilt or Koin.
- **Concurrency**: Coroutines & Flow.

## tasks
1.  **Project Structure**:
    -   `app`, `core`, `feature/*` modules.
    -   Apply `build-logic` plugins for consistency.
2.  **Base Classes**:
    -   `BaseViewModel` (handling loading/error/event states).
    -   `Application` class (initializing logging, DI, monitoring).
3.  **Navigation**:
    -   Setup Jetpack Navigation (Compose versions).
    -   Define routes and arguments type-safely.
4.  **Theming**:
    -   Establish Material 3 theme.
    -   Define Color, Type, Shape systems.

## Output
- `build.gradle.kts` files.
- `Application.kt`.
- `Theme.kt` / `Color.kt` / `Type.kt`.
- DI Module definitions.
