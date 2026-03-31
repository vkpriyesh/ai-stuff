# 09 - Hooks & Automation

Automate workflows using Claude Code's event-driven hook system.

---

## Hook Architecture

Hooks are event handlers configured in `settings.json` that fire at tool/session lifecycle events. They execute shell commands with JSON input on stdin.

### All 12+ Hook Events

| Event | When | Input | Use Case |
|-------|------|-------|----------|
| **PreToolUse** | Before tool executes | Tool name + input args | Block dangerous ops, validate inputs |
| **PostToolUse** | After tool executes | Tool name + input + result | Audit, auto-format, lint |
| **UserPromptSubmit** | User sends message | Prompt text | Content filtering, logging |
| **PermissionDenied** | Auto-mode blocks tool | Tool + reason | Alert, auto-retry |
| **SubagentStart** | Agent spawned | Agent ID + type | Logging, resource tracking |
| **SubagentStop** | Agent concludes | Agent ID + transcript path | Cleanup, notification |
| **SessionStart** | Session begins | Source | Setup, welcome message |
| **SessionEnd** | Session ends | Reason | Cleanup, summary |
| **PreCompact** | Before compaction | Trigger + details | Save important context |
| **PostCompact** | After compaction | Compact result | Inject post-compact instructions |
| **TaskCreated** | Task created | Task ID + subject | Tracking, validation |
| **TaskCompleted** | Task done | Task ID + result | Notification, chaining |
| **WorktreeCreate** | Worktree created | N/A | Custom VCS setup |
| **WorktreeRemove** | Worktree removed | N/A | Cleanup |
| **Elicitation** | MCP requests input | Server + message + schema | Auto-respond, validate |

### Exit Code Semantics
- **Exit 0**: Operation allowed; stdout may be shown
- **Exit 2**: Operation blocked; stderr shown to user and model
- **Other**: Hook failure (logged but doesn't block)

---

## Deep-Dive Documents

| Document | Content |
|----------|---------|
| [Workflow Automation Recipes](./workflow-recipes.md) | Ready-to-use hook configurations |
| [CI/CD Integration](./ci-cd-integration.md) | Using Claude Code in CI/CD pipelines |

---

## Configuration Format

```json
// settings.json or .claude/settings.json
{
  "hooks": {
    "EventName": [
      {
        "matcher": {
          "field_name": "pattern"     // regex matching
        },
        "command": "path/to/script.sh"
      }
    ]
  }
}
```

### Matcher Examples
```json
// Match specific tool
{ "tool_name": "Bash" }

// Match multiple tools
{ "tool_name": "Edit|Write" }

// Match bash commands containing "git"
{ "tool_name": "Bash", "command": ".*git.*" }

// Match all (empty matcher)
{}
```
