# Android Compose UI Skill

## Purpose
Create declarative UI components and screens using Jetpack Compose.

## Standards
- **No Business Logic**: Composables should only render state and emit events.
- **State Hoisting**: State goes up, events go down.
- **Previews**: Include `@Preview` for multiple configurations (Light/Dark, Font Scale).

## Architecture
- **ScreenComposable**: Receives `UiState` and `(Event) -> Unit` lambda.
- **ViewModel**: Exposes `StateFlow<UiState>`.

## Pattern
```kotlin
@Composable
fun MyScreen(viewModel: MyViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    MyScreenContent(state = state, onEvent = viewModel::onEvent)
}

@Composable
fun MyScreenContent(state: MyUiState, onEvent: (MyEvent) -> Unit) {
    // UI Implementation
}
```

## Checklist
- [ ] Remember to use `remember` and `rememberSaveable`.
- [ ] Handle configuration changes.
- [ ] Handle Loading, Error, and Empty states visually.
- [ ] Accessibility: Set `contentDescription`, support larger fonts.
