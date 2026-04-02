# Setup Guide: Production-Grade AI Coding Instructions

This package contains instruction files that make GitHub Copilot (with Claude Opus/Sonnet models) behave with production-grade coding discipline, git safety, and security awareness.

---

## Quick Start (2 Minutes)

### Step 1: Copy files to your project
```bash
# Copy the .github folder to your project root
cp -r .github/ /path/to/your/project/.github/

# Copy AGENTS.md to your project root
cp AGENTS.md /path/to/your/project/AGENTS.md
```

### Step 2: Add VS Code settings
Open VS Code settings JSON (`Ctrl+Shift+P` → "Open User Settings (JSON)") and paste the contents of `vscode-settings-snippet.jsonc`.

### Step 3: Select Claude model in Copilot
1. Open Copilot Chat in VS Code
2. Click the model selector at the bottom of the chat panel
3. Choose **Claude Sonnet** or **Claude Opus**

Done. Copilot will now follow these instructions automatically.

---

## What Each File Does

### `AGENTS.md` (Project Root)
**Purpose:** Master instruction file for AI coding agents.
**Loaded by:** GitHub Copilot coding agent, Codex, and other tools that support the AGENTS.md standard.
**Contains:** All behavioral rules - coding discipline, git safety, security, output style, verification.
**Size:** ~3,500 words. Well within limits.

### `.github/copilot-instructions.md`
**Purpose:** Copilot-specific project instructions.
**Loaded by:** GitHub Copilot Chat, code completions, and code review.
**Contains:** Condensed version of AGENTS.md (~3,500 characters for code review compatibility).
**Limit:** First 4,000 characters used for code review. Full file used for chat.

### `.github/agents/code-reviewer.md`
**Purpose:** Custom agent for code reviews.
**Invoke:** Type `@code-reviewer` in Copilot Chat.
**Behavior:** Reviews for correctness, security (OWASP), performance, maintainability, and testing. Rates issues by severity.

### `.github/agents/architect.md`
**Purpose:** Custom agent for architecture and planning.
**Invoke:** Type `@architect` in Copilot Chat.
**Behavior:** Explores codebase, designs implementation plans, identifies risks. Does NOT implement - only plans.

### `.github/agents/security-auditor.md`
**Purpose:** Custom agent for security audits.
**Invoke:** Type `@security-auditor` in Copilot Chat.
**Behavior:** Full OWASP Top 10 + extended audit. Checks for injection, XSS, auth issues, secrets, misconfigurations, outdated dependencies.

### `.github/instructions/git-operations.instructions.md`
**Purpose:** Git safety rules applied to all files.
**Loaded by:** Copilot when any git operations are discussed.
**Contains:** The complete git safety protocol - no force push, no hook skipping, new commits not amends, specific file staging.

### `.github/instructions/tests.instructions.md`
**Purpose:** Testing guidelines applied to test files only.
**Loaded by:** Copilot when editing `*.test.*` or `*.spec.*` files.
**Contains:** Test quality rules, coverage priorities, test hygiene.

### `vscode-settings-snippet.jsonc`
**Purpose:** Global VS Code settings for Copilot behavior.
**Applied to:** All projects (user-level settings).
**Contains:** Code generation, test generation, code review, and commit message instructions.

---

## Customization

### Adding Project-Specific Rules
Edit `AGENTS.md` or `.github/copilot-instructions.md` to add your project's specific conventions:

```markdown
## Project-Specific Rules
- This is a Next.js 14 project with App Router
- Use Prisma ORM for database access
- Follow the existing component structure in src/components/
- All API routes must include rate limiting middleware
```

### Adding Path-Specific Instructions
Create new files in `.github/instructions/`:

```markdown
---
applyTo: "src/api/**/*.ts"
---

# API Route Guidelines
- All routes must validate input with Zod schemas
- Return consistent error format: { error: { code, message } }
- Include rate limiting middleware
- Log all mutations to audit trail
```

### Creating New Custom Agents
Add files to `.github/agents/`:

```markdown
---
name: my-agent
description: "What this agent does"
tools: ["read", "search", "terminal"]
---

Your agent's system prompt here...
```

### Disabling Specific Rules
Comment out or remove any rules that don't fit your workflow. The files are modular - each section is independent.

---

## How It Works (Under the Hood)

### Instruction Loading Order
1. VS Code user settings (`github.copilot.chat.codeGeneration.instructions`)
2. `AGENTS.md` in project root
3. `.github/copilot-instructions.md`
4. `.github/instructions/*.instructions.md` (matched by `applyTo` glob)
5. Custom agent prompts (when `@agent-name` is invoked)

All applicable instructions are combined and sent to the model as context.

### Token Budget
- `copilot-instructions.md`: First 4,000 characters used for code review; full file for chat
- Agent profiles: Up to 30,000 characters
- `AGENTS.md`: Up to ~1,000 lines recommended
- VS Code settings: No hard limit, but keep individual instructions concise

### Model Selection
These instructions are optimized for Claude models (Opus/Sonnet) but work with any model Copilot supports. Claude models respond particularly well to:
- Concrete behavioral rules (NEVER/ALWAYS patterns)
- Specific examples over vague guidelines
- Structured output formats
- Failure-mode prevention rules

---

## Verification

After setup, test that instructions are working:

1. **Test read-before-edit:** Ask Copilot to modify a file. It should read it first.
2. **Test git safety:** Ask Copilot to commit. It should ask for confirmation and stage specific files.
3. **Test anti-gold-plating:** Ask for a bug fix. It should fix only the bug, not refactor surroundings.
4. **Test code review:** Use `@code-reviewer` on a PR. It should categorize issues by severity.
5. **Test honesty:** Ask it to run tests. If tests fail, it should report failures faithfully.

---

## Origin

These instructions are distilled from ~2,000 lines of production-tested system prompts and behavioral controls used in one of the most sophisticated AI coding agent architectures. The patterns have been validated across millions of coding sessions and refined based on observed failure modes.

Key behavioral insights:
- AI coders tend to over-produce (hence anti-gold-plating rules)
- AI coders tend to gold-plate (hence "three lines > premature abstraction")
- AI coders tend to amend wrong commits after hook failures (hence "CRITICAL: new commits")
- AI coders tend to use `git add -A` (hence "stage specific files")
- AI coders tend to suppress failing tests in reports (hence "report faithfully")

Each rule exists because a specific failure pattern was observed and fixed in production.
