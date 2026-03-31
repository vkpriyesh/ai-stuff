# Custom Skills

Build slash commands that Claude Code can execute.

---

## How Skills Work

Skills are prompt templates invoked via `/skill-name` or the SkillTool. They can run inline (in the current conversation) or forked (as a subagent).

### Skill Definition Format

**File:** `.claude/skills/prompt.txt` (or `.claude/skills/<name>/prompt.txt`)

```yaml
---
name: deploy
description: "Deploy the current branch to staging or production"
context: fork
model: sonnet
allowed_tools:
  - Bash
  - Read
  - Glob
---

You are a deployment assistant. Deploy the current branch.

## Steps
1. Run `git status` to verify clean working tree
2. Run tests: `npm test`
3. If tests pass, determine target environment from user args: $ARGUMENTS
4. Run deployment command:
   - staging: `npm run deploy:staging`
   - production: `npm run deploy:production` (require explicit confirmation)
5. Verify deployment by checking health endpoint
6. Report deployment status with URL and commit hash
```

### Frontmatter Options

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | filename | Skill name (used as `/name`) |
| `description` | string | required | What this skill does |
| `context` | `fork` or `inline` | `fork` | Execution mode |
| `model` | string | inherit | Model override |
| `allowed_tools` | string[] | all | Tool allowlist |
| `agent` | string | none | Agent type to use |

---

## Execution Flow

```
User types: /deploy staging
    │
    ▼
SkillTool.call({ skill: "deploy", args: "staging" })
    │
    ├─ getCommand("deploy") → load skill definition
    ├─ getPromptForCommand("staging") → expand template with $ARGUMENTS
    │
    ├─ If context: fork
    │   ├─ prepareForkedCommandContext() → build agent context
    │   ├─ runAgent() → execute as subagent
    │   └─ extractResultText() → return result to parent
    │
    └─ If context: inline
        └─ Inject prompt directly into current conversation
```

---

## Skill Examples

### /test - Run Tests with Analysis
```yaml
---
name: test
description: "Run tests and analyze failures"
context: fork
allowed_tools:
  - Bash
  - Read
  - Grep
---

Run the project's test suite and analyze any failures.

1. Detect test framework (jest, vitest, pytest, go test, etc.)
2. Run the full test suite
3. If failures:
   - Read the failing test files
   - Read the source files being tested
   - Diagnose the root cause
   - Suggest specific fixes with code
4. Report: passed/failed/skipped counts, failure analysis
```

### /doc - Generate Documentation
```yaml
---
name: doc
description: "Generate documentation for a file or module"
context: fork
allowed_tools:
  - Read
  - Glob
  - Grep
  - Write
---

Generate documentation for: $ARGUMENTS

1. Read the target file(s)
2. Analyze exports, functions, classes, types
3. Generate JSDoc/docstring comments for each export
4. Create a summary document covering:
   - Module purpose
   - Key exports with descriptions
   - Usage examples
   - Dependencies
```

### /refactor - Refactor with Safety
```yaml
---
name: refactor
description: "Refactor code with automated safety checks"
context: fork
allowed_tools:
  - Read
  - Edit
  - Bash
  - Glob
  - Grep
---

Refactor the code at: $ARGUMENTS

## Safety Protocol
1. Run tests BEFORE changes to establish baseline
2. Make refactoring changes
3. Run tests AFTER changes
4. If tests fail, revert and report what went wrong
5. If tests pass, report changes made

## Refactoring Priorities
- Extract duplicated code into shared functions
- Simplify complex conditionals
- Improve naming for clarity
- Reduce function length (max 30 lines)
- Remove dead code
```

### /changelog - Generate Changelog
```yaml
---
name: changelog
description: "Generate a changelog from recent git history"
context: fork
allowed_tools:
  - Bash
  - Read
---

Generate a changelog from git history.

1. Run `git log --oneline` for recent commits
2. Categorize commits:
   - Features (feat:, add:)
   - Bug Fixes (fix:, bugfix:)
   - Performance (perf:)
   - Documentation (docs:)
   - Refactoring (refactor:)
   - Tests (test:)
   - Chores (chore:, ci:, build:)
3. Format as Keep a Changelog format
4. Include date range and contributor list
```
