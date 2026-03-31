# System Prompt Customization

How to modify Claude Code's behavior through system prompt overrides.

---

## Three Injection Points

### 1. Full Override: `--system-prompt`
Replaces the entire system prompt:
```bash
claude --system-prompt "You are a Python expert. Only write Python code. Use type hints everywhere."
```

### 2. Append: `--append-system-prompt`
Adds to the end of the default system prompt:
```bash
claude --append-system-prompt "Always use functional programming style. Avoid classes."
```

### 3. CLAUDE.md Files (Persistent)
Create a `CLAUDE.md` in your project root. It's automatically loaded into context:
```markdown
# Project Rules

- This is a Go project using the standard library only
- Tests must use table-driven test patterns
- All errors must be wrapped with fmt.Errorf("context: %w", err)
- Database queries use sqlc-generated code, never raw SQL
- API responses follow the JSON:API specification
```

**CLAUDE.md discovery order:**
1. Walk up from CWD to filesystem root
2. Each CLAUDE.md found is injected
3. `.claude.md` is also recognized
4. Can be disabled with `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1`

---

## What Each Override Affects

| Override | Scope | Persistence | Use Case |
|----------|-------|-------------|----------|
| `--system-prompt` | Single session | None | Testing, one-off persona |
| `--append-system-prompt` | Single session | None | Adding constraints |
| `CLAUDE.md` | Every session in project | Until file deleted | Project-specific rules |
| Auto-memory | Cross-session | Until memory deleted | Learned preferences |

---

## Effective Customization Patterns

### Persona Specialization
```bash
claude --append-system-prompt "
You are a senior backend engineer specializing in distributed systems.
When suggesting solutions:
- Always consider failure modes and retry strategies
- Prefer eventual consistency over strong consistency
- Suggest circuit breakers for external service calls
- Include observability (metrics, tracing, logging) in every change
"
```

### Output Format Control
```bash
claude --append-system-prompt "
Output format rules:
- Always show file diffs in unified diff format
- Include line numbers in all code references
- End every response with a ## Next Steps section
- Use tables for comparing options
"
```

### Stack-Specific Expertise
```bash
claude --append-system-prompt "
This is a Next.js 14 project with:
- App Router (not Pages Router)
- Server Components by default
- Prisma ORM with PostgreSQL
- Tailwind CSS with shadcn/ui components
- Zod for validation
- tRPC for API layer

Always use these patterns. Never suggest alternatives.
"
```

### Safety Constraints
```bash
claude --append-system-prompt "
CRITICAL SAFETY RULES:
- NEVER modify files in /production/ or /config/secrets/
- NEVER run commands that access the production database
- NEVER commit directly to main branch
- Always create feature branches from develop
- Run tests before suggesting any commit
"
```

---

## How the System Prompt Is Assembled

Understanding the assembly order helps you know where your overrides land:

```
1. Prefix: "You are Claude Code..."
2. Intro: Role description, security instructions
3. System: Tool behavior, system-reminder handling
4. Doing Tasks: Coding best practices
5. Actions: Reversibility, blast radius awareness
6. Using Your Tools: Tool preferences, task management
7. Tone/Style: Conciseness, formatting
8. Output Efficiency: Brevity instructions
9. ─── DYNAMIC BOUNDARY (below this changes per session) ───
10. Session-specific guidance
11. Memory system instructions
12. Environment info (CWD, platform, model, git status)
13. MCP server instructions (from connected MCP servers)
14. CLAUDE.md content (from project files)
15. --append-system-prompt content (if provided)
```

If using `--system-prompt`, everything above is replaced with your text. The dynamic sections (10-15) are still appended.
