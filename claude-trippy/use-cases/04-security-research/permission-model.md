# Permission Model Deep Dive

How Claude Code evaluates, classifies, and enforces permissions.

---

## Permission Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `default` | Ask user for each potentially dangerous operation | Normal usage |
| `auto` | Auto-approve safe operations, ask for dangerous | Trusted workflows |
| `plan` | Require plan approval before any execution | Maximum oversight |
| `bypass` | Skip all permission checks | Scripting, CI/CD (dangerous) |

---

## Evaluation Pipeline

```
Tool call received
    │
    ▼
Step 1: Tool-specific checkPermissions(input)
    │ → Each tool can implement custom permission logic
    │ → BashTool: analyzes command for safety
    │ → FileEditTool: checks path against sandbox
    │ → AgentTool: checks agent type availability
    │
    ▼
Step 2: General permission rules (settings.json)
    │ → Deny rules: { tool: "Bash", pattern: "rm -rf *", behavior: "deny" }
    │ → Allow rules: { tool: "Read", behavior: "allow" }
    │ → Ask rules: { tool: "Bash", behavior: "ask" }
    │
    ▼
Step 3: Bash classifier (for Bash tool only)
    │ → Categorizes commands:
    │   ├─ SAFE: ls, git status, cat, echo → auto-allow
    │   ├─ NEEDS_REVIEW: git commit, npm install → ask
    │   └─ DANGEROUS: rm -rf, git push --force → deny/ask
    │
    ▼
Step 4: YOLO classifier (in auto mode)
    │ → Transcript-based analysis
    │ → Evaluates full conversation context
    │ → Returns allow/deny/ask
    │
    ▼
Step 5: Denial tracking
    │ → If tool denied N times → escalate to user prompt
    │ → Prevents infinite retry loops
    │
    ▼
Result: { behavior: 'allow' | 'deny' | 'ask', reason?: string }
```

---

## Bash Classifier Details

The bash classifier (`bashClassifier.ts`) categorizes shell commands:

### Auto-Approved Commands (Safe)
```
ls, pwd, echo, cat, head, tail, wc, sort, uniq, diff
git status, git log, git diff, git branch, git show
node --version, npm --version, python --version
find (read-only), grep (read-only)
```

### Needs Review Commands
```
git commit, git merge, git rebase
npm install, pip install, cargo add
mkdir, touch, cp (creating new files)
docker build, docker run
```

### Dangerous Commands (Blocked/Ask)
```
rm -rf, rm -r (recursive delete)
git push --force, git reset --hard
DROP TABLE, DELETE FROM (SQL)
chmod 777, chown
curl | bash, wget | sh (pipe to shell)
kill -9, pkill
```

---

## Filesystem Sandbox

When sandbox is enabled:
- Tools can only access files within the project directory
- Attempts to read/write outside the sandbox return permission errors
- Symlinks that point outside the sandbox are blocked
- The sandbox boundary is the git root or CWD

**Key files:**
- `utils/permissions/permissions.ts` - Main evaluation
- `utils/permissions/bashClassifier.ts` - Command safety classification
- `utils/permissions/yoloClassifier.ts` - Transcript-based classification
- `utils/permissions/denialTracking.ts` - Track denial counts

---

## Permission Rule Format

```json
// In settings.json
{
  "permissions": {
    "deny": [
      { "tool": "Bash", "pattern": "rm -rf /" },
      { "tool": "Write", "path": "/etc/*" }
    ],
    "allow": [
      { "tool": "Read" },
      { "tool": "Glob" },
      { "tool": "Grep" }
    ],
    "ask": [
      { "tool": "Bash", "pattern": "git push*" }
    ]
  }
}
```

Rules are evaluated in order: deny → allow → ask → default behavior.
