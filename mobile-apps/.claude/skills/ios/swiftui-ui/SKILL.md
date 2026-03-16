# iOS SwiftUI UI Skill

## Purpose
Create declarative UI components and screens using SwiftUI.

## Standards
- **No Business Logic**: Views should observe data and dispatch actions.
- **Modifiers**: Use custom view modifiers for consistent styling.
- **Previews**: Include `#Preview` for rapid iteration.

## Architecture
- **View**: Observes `ObservableObject` or `@Observable` (iOS 17+).
- **ViewModel**: Manages state and side effects.

## Pattern
```swift
struct MyScreen: View {
    @StateObject private var viewModel = MyViewModel()
    
    var body: some View {
        MyScreenContent(state: viewModel.state, send: viewModel.send)
    }
}

struct MyScreenContent: View {
    let state: MyUiState
    let send: (MyAction) -> Void
    
    var body: some View {
        // UI Implementation
    }
}
```

## Checklist
- [ ] Verify dark mode support.
- [ ] Dynamic Type support (font scaling).
- [ ] Use `@MainActor` on ViewModels to ensure UI updates on main thread.
- [ ] Handle `Task` cancellation in `onDisappear`.
