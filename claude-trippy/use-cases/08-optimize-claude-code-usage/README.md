# 08 - Optimize Claude Code Usage

Maximize performance and minimize cost using knowledge of the internals.

---

## Quick Wins

### 1. Maximize Prompt Cache Hits
The system prompt is cached with 1h TTL. To maximize cache hits:
- Stay in the same session (don't restart Claude Code frequently)
- Avoid changing MCP servers mid-session (busts tool schema cache)
- Use `--append-system-prompt` instead of `--system-prompt` (preserves cacheable prefix)

### 2. Pick the Right Mode
```
Simple question      → claude -p "question"          (headless, fast)
Quick task           → claude --effort low            (reduced output)
Complex task         → claude                         (interactive, full)
Scripting/CI         → claude --bare -p "task"        (minimal prompt)
Batch processing     → claude --output-format json    (structured output)
```

### 3. Pick the Right Agent Type
```
Find a file/function → Glob or Grep directly (no agent needed)
Explore codebase     → Agent(subagent_type: "Explore", thoroughness: "quick")
Plan implementation  → Agent(subagent_type: "Plan")
Deep research        → Agent(subagent_type: "Explore", thoroughness: "very thorough")
Implementation       → Agent(subagent_type: "general-purpose")
Parallel research    → Multiple Explore agents in one message
```

### 4. Use CLAUDE.md for Persistent Context
Instead of repeating instructions every session, put them in `CLAUDE.md`:
```markdown
# Rules
- Use pytest for all tests
- Follow Google Python Style Guide
- Database migrations use alembic
- API follows OpenAPI 3.0 spec
```

### 5. Use Memory System
Let Claude learn your preferences:
- Corrections → saved as `feedback` memories
- Project context → saved as `project` memories
- Your role → saved as `user` memories

These persist across sessions and reduce repeated explanations.

---

## Performance Optimization

### Reduce First Token Time (TTFT)
- Fewer MCP servers = faster startup (each requires connection)
- Use `--bare` for scripting (minimal system prompt)
- Headless mode (`-p`) skips trust dialog and UI rendering

### Reduce Token Usage
- `--effort low` for simple tasks
- Keep conversations focused (long conversations trigger compaction)
- Use specific agent types (Explore is cheaper than general-purpose)
- Fork agents for parallel research (cache sharing saves 97% input tokens)

### Reduce Cost
- Use Sonnet for most tasks (5x cheaper than Opus)
- Use Haiku for simple lookups (60x cheaper than Opus)
- Monitor cache hit rate (high cache hits = lower cost)
- Use `--model sonnet` or `--model haiku` when Opus isn't needed

---

## Advanced Techniques

### Batch Processing with Structured Output
```bash
# Process multiple files
for file in src/*.ts; do
  claude --bare -p "Analyze $file for security issues" \
         --output-format json \
         --model haiku
done
```

### Custom Skills for Repeated Tasks
Instead of typing the same instructions, create a skill:
```
.claude/skills/lint-fix/prompt.txt
```
Then just run `/lint-fix` every time.

### Hook-Based Automation
Auto-format after every file edit:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": { "tool_name": "Edit|Write" },
      "command": "npx prettier --write $FILE_PATH"
    }]
  }
}
```

### Resume for Long Tasks
If a task spans multiple sessions:
1. Let memory system capture key context
2. Use `/resume` to continue where you left off
3. Conversation history is fully restored from JSONL

---

## Environment Variables for Power Users

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_SIMPLE=1` | Minimal system prompt |
| `ANTHROPIC_API_KEY` | Direct API key (skip OAuth) |
| `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` | Skip CLAUDE.md loading |
| `ENABLE_TOOL_SEARCH=auto:20` | Defer tools when MCP > 20% of context |
| `CLAUDE_CODE_INCLUDE_PARTIAL_MESSAGES=1` | Show partial streaming messages |
