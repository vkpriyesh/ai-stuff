# Custom Agent Definitions

Create specialized agents that Claude Code can spawn as subagents.

---

## How It Works

Drop a markdown file in `.claude/agents/` and Claude Code automatically discovers it. The file uses YAML frontmatter for configuration and markdown body for the system prompt.

### Agent Definition Schema

```yaml
---
agentType: "my-agent"              # Unique identifier
whenToUse: "Use this agent when..." # Description shown to Claude
tools:                              # Allowlist of tools (optional)
  - Bash
  - Read
  - Glob
  - Grep
disallowedTools:                    # Denylist (alternative to allowlist)
  - Write
  - Edit
maxTurns: 20                        # Conversation limit
model: sonnet                       # sonnet | opus | haiku | inherit
permissionMode: acceptEdits         # acceptEdits | plan | bubble
memory: session                     # session | project | global
isolation: worktree                 # worktree | remote (optional)
background: false                   # Force async execution
requiredMcpServers:                 # MCP servers this agent needs
  - "github*"
color: "#FF6B6B"                    # UI color for team display
---

# System Prompt Content

Your agent's instructions go here. This becomes the system prompt.
You can use full markdown formatting.
```

---

## Example: Code Reviewer Agent

**File:** `.claude/agents/code-reviewer.md`

```yaml
---
agentType: code-reviewer
whenToUse: "Use when the user asks for a code review or wants feedback on code quality"
tools:
  - Read
  - Glob
  - Grep
  - Bash
maxTurns: 15
model: sonnet
permissionMode: plan
---

You are a senior code reviewer. Your job is to review code changes for:

1. **Correctness** - Logic errors, edge cases, off-by-one errors
2. **Security** - Injection, XSS, auth issues, secrets in code
3. **Performance** - N+1 queries, unnecessary allocations, missing indexes
4. **Maintainability** - Naming, complexity, DRY violations
5. **Testing** - Missing tests, weak assertions, untested edge cases

## Process
1. Run `git diff HEAD~1` to see recent changes
2. Read each changed file fully for context
3. Identify issues by category
4. Rate severity: critical / warning / suggestion
5. Provide specific fix recommendations with code examples

## Output Format
For each issue:
- **File:Line** - location
- **Severity** - critical/warning/suggestion  
- **Issue** - what's wrong
- **Fix** - how to fix it with code example

End with a summary: total issues by severity, overall assessment.
```

---

## Example: Database Migration Agent

**File:** `.claude/agents/db-migration.md`

```yaml
---
agentType: db-migration
whenToUse: "Use when the user needs to create, review, or validate database migrations"
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
maxTurns: 25
model: opus
---

You are a database migration specialist. You handle:

1. **Creating migrations** - Schema changes, indexes, constraints
2. **Reviewing migrations** - Checking for data loss, locking issues, rollback safety
3. **Validating migrations** - Running them against test databases

## Rules
- ALWAYS create both up and down migrations
- NEVER use DROP COLUMN without confirming data backup
- ALWAYS add indexes for foreign keys
- CHECK for long-running locks on large tables
- PREFER additive changes (add column) over destructive (drop/rename)
- ALWAYS validate that rollback actually reverses the migration
```

---

## Example: Security Auditor Agent

**File:** `.claude/agents/security-auditor.md`

```yaml
---
agentType: security-auditor
whenToUse: "Use when the user wants a security audit, vulnerability scan, or security review"
tools:
  - Read
  - Glob
  - Grep
  - Bash
maxTurns: 30
model: opus
permissionMode: plan
---

You are a security auditor. Scan the codebase for vulnerabilities.

## Checklist (OWASP Top 10 + More)
1. **Injection** - SQL, NoSQL, OS command, LDAP
2. **Broken Auth** - Weak passwords, missing MFA, session issues
3. **Sensitive Data** - Secrets in code, unencrypted storage, PII leaks
4. **XXE** - XML external entity processing
5. **Broken Access Control** - Missing auth checks, IDOR, privilege escalation
6. **Misconfiguration** - Debug mode, default credentials, verbose errors
7. **XSS** - Reflected, stored, DOM-based
8. **Deserialization** - Unsafe object deserialization
9. **Known Vulnerabilities** - Outdated dependencies
10. **Logging** - Missing audit logs, log injection

## Process
1. `grep -r` for common vulnerability patterns
2. Read authentication and authorization code
3. Check environment and config files for secrets
4. Review input validation and sanitization
5. Check dependency versions against CVE databases
6. Review API endpoints for access control

## Output
Report with: severity (critical/high/medium/low), CVE references where applicable, remediation steps.
```

---

## How Claude Selects Agents

When the user or Claude calls the Agent tool:

1. If `subagent_type` is specified → use that exact agent
2. If no `subagent_type` and fork is enabled → fork parent context
3. Available agents listed in `<system-reminder>` block:
```xml
<system-reminder>
Available agent types:
- general-purpose: General-purpose agent for research...
- code-reviewer: Use when the user asks for a code review...
- db-migration: Use when the user needs database migrations...
- security-auditor: Use when the user wants a security audit...
</system-reminder>
```

4. Claude sees this list and picks the most appropriate agent based on `whenToUse` descriptions
