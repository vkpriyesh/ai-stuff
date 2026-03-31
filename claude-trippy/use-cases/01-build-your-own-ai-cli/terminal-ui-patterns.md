# Terminal UI Patterns

How Claude Code renders a reactive terminal UI using React/Ink.

---

## Tech Stack

- **React** - Component model and state management
- **Ink** - React renderer for terminal (instead of DOM)
- **Chalk** - Terminal color and styling
- **Commander.js** - CLI argument parsing

---

## Why React for a Terminal?

Claude Code renders a full reactive UI in the terminal:
- Spinners that animate during API calls
- Progress bars for long operations
- Multi-pane layouts for agent teams
- Permission dialogs that overlay the conversation
- Real-time streaming text display

React/Ink makes this manageable with:
- Component composition
- State-driven re-renders
- Hooks for side effects
- Context for global state

---

## Architecture

```
main.tsx
  └─ launchRepl()
       └─ renderAndRun(<App><REPL/></App>)
            │
            ├─ <App> (state provider, context setup)
            │   ├─ AppStateStore (React Context)
            │   ├─ NotificationContext
            │   └─ MailboxContext
            │
            └─ <REPL> (main interactive loop)
                ├─ Input reading from terminal
                ├─ Message history display
                ├─ <Spinner> during API calls
                ├─ <ProgressBar> for tool execution
                ├─ <InlinePrompt> for permission dialogs
                └─ Streaming text output
```

---

## Key Components

### Streaming Text Display
```
API stream event received
    │
    ├─ text delta → append to current text block → re-render
    ├─ tool_use start → show tool name + spinner
    ├─ tool_use delta → show accumulating JSON input
    ├─ tool_use stop → show tool result (collapsed/expanded)
    └─ message stop → finalize display
```

### Permission Dialogs
```
Tool needs permission
    │
    ├─ Render <InlinePrompt> overlay
    │   ├─ Show tool name, description, input
    │   ├─ Options: Allow / Deny / Always Allow
    │   └─ Keyboard handling (y/n/a)
    │
    ├─ User responds
    │   ├─ Allow → execute tool
    │   ├─ Deny → return error to LLM
    │   └─ Always Allow → add to allow rules + execute
    │
    └─ Remove overlay, continue rendering
```

### Agent Team Display
```
Coordinator mode
    │
    ├─ Left pane: coordinator conversation
    ├─ Right pane: selected worker output
    └─ Status bar: worker list with status indicators
```

---

## Rendering Pipeline

```
State change (new message, tool result, etc.)
    │
    ▼
React re-render cycle
    │
    ▼
Ink renders to terminal
    │
    ├─ cli/print.ts (212KB) - main formatting logic
    │   ├─ Format assistant text (markdown)
    │   ├─ Format tool calls (collapsed view)
    │   ├─ Format tool results (truncated if large)
    │   └─ Format errors and status messages
    │
    ├─ components/ - reusable UI components
    │   ├─ Spinner - animated loading indicator
    │   ├─ ProgressBar - progress display
    │   └─ InlinePrompt - permission/input dialogs
    │
    └─ outputStyles/ - configurable output formatting
```

---

## Alternative Approaches for Your CLI

If you don't want the React/Ink complexity:

### Option 1: Raw ANSI (simplest)
```typescript
// Direct terminal writing with ANSI escape codes
process.stdout.write('\x1b[1mBold text\x1b[0m\n');
process.stdout.write('\x1b[32mGreen text\x1b[0m\n');
```

### Option 2: Blessed (medium complexity)
```typescript
import blessed from 'blessed';
const screen = blessed.screen();
const box = blessed.box({ content: 'Hello' });
screen.append(box);
screen.render();
```

### Option 3: Ink (Claude Code's approach)
```tsx
import { render, Text, Box } from 'ink';

function App() {
  const [output, setOutput] = useState('');
  return (
    <Box flexDirection="column">
      <Text color="green">AI Agent</Text>
      <Text>{output}</Text>
    </Box>
  );
}

render(<App />);
```

The right choice depends on your UI complexity. For simple agents, raw ANSI is fine. For Claude Code-level UX, use Ink.
