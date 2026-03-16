# Reference Docs for Mobile Team

## Architecture Principles
- **Clean Architecture**: Dependent rule (inner layers don't know outer layers).
- **SOLID**: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.

## Common Libraries (Standard Stack)

### Android
- **UI**: Jetpack Compose, Material 3.
- **Async**: Coroutines, Flow.
- **Net**: Retrofit, OkHttp.
- **DI**: Hilt.
- **Image**: Coil.
- **DB**: Room.

### iOS
- **UI**: SwiftUI.
- **Async**: Swift Concurrency (async/await, Task).
- **Net**: URLSession (with wrappers).
- **DI**: Factory / Swinject / Pure DI.
- **Image**: Nuke / Kingfisher / AsyncImage.
- **DB**: SwiftData / CoreData / GRDB.

## Environment Variables
- `API_BASE_URL`
- `API_KEY` (Not in git!)
- `ENABLE_LOGGING`
