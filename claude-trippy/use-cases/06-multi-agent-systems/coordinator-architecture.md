# Coordinator Architecture

How to build orchestrator agents that direct workers.

---

## How Coordinator Mode Works in Claude Code

When `CLAUDE_CODE_COORDINATOR_MODE=1`, the agent transforms:

**Normal mode:** Agent reads, writes, and executes directly
**Coordinator mode:** Agent only directs workers; no direct file access

### Coordinator System Prompt (from source)
```
You are a coordinator. Your job is to:
- Help the user achieve their goal
- Direct workers to research, implement and verify
- Synthesize results and communicate with the user
- Answer questions directly when possible

Tools available: Agent, SendMessage, TaskStop
NOT available: Direct file editing, shell
```

### Coordinator Workflow
```
Phase 1: Research (parallel workers)
    Agent({ type: "Explore", prompt: "Find all auth code" })
    Agent({ type: "Explore", prompt: "Find all API endpoints" })
    
Phase 2: Synthesis (coordinator analyzes)
    Read worker results → identify patterns → plan implementation
    
Phase 3: Implementation (serial workers)
    Agent({ type: "general-purpose", prompt: "Implement X in file Y" })
    
Phase 4: Verification (verification worker)
    Agent({ type: "verification", prompt: "Run tests, check for regressions" })
```

---

## Building Your Own Coordinator

### The Key Insight
A coordinator is just an agent with:
1. A restricted tool set (only Agent, SendMessage, TaskStop)
2. A system prompt that describes orchestration patterns
3. Background workers that report back via task notifications

### Coordinator System Prompt Template
```
You are an orchestrator. You do NOT directly edit code or run commands.
Instead, you:

1. ANALYZE the user's request
2. DECOMPOSE into subtasks
3. SPAWN workers for each subtask (parallel when possible)
4. SYNTHESIZE results
5. DIRECT follow-up work based on findings
6. VERIFY the final result

## Worker Types
- Explore: Fast read-only search (use for research)
- general-purpose: Full tool access (use for implementation)
- verification: Run tests and check for issues

## Concurrency Rules
- Research workers: launch in parallel (they're read-only)
- Implementation workers: launch serially (they modify files)
- Verification: always last, after all changes

## Communication
- When a worker completes, you receive a <task-notification>
- Read the notification, then decide next steps
- Use SendMessage to continue an existing worker
- Use Agent to spawn a new worker
```

---

## Example: Feature Implementation Coordinator

```
User: "Add user authentication with JWT tokens"

Coordinator:
  │
  ├─ Phase 1: Research (parallel)
  │   ├─ Worker 1: "Find existing auth code, middleware, user models"
  │   ├─ Worker 2: "Find package.json, check for existing JWT libraries"
  │   └─ Worker 3: "Find route definitions and API structure"
  │
  ├─ Phase 2: Plan
  │   "Based on research: Express app, no existing auth,
  │    need to add jsonwebtoken, create middleware, protect routes"
  │
  ├─ Phase 3: Implementation (serial)
  │   ├─ Worker 4: "Install jsonwebtoken, create auth middleware in src/middleware/auth.ts"
  │   ├─ Worker 5: "Create login/register routes in src/routes/auth.ts"
  │   └─ Worker 6: "Protect existing routes with auth middleware"
  │
  └─ Phase 4: Verification
      └─ Worker 7: "Run tests, verify login flow works, check for security issues"
```

---

## Anti-Patterns

### Don't Over-Coordinate
If the task is simple (fix a typo, add a comment), don't use a coordinator. Use a direct agent.

### Don't Serialize Research
Research workers are read-only. Always launch them in parallel.

### Don't Forget Verification
Every implementation phase should be followed by a verification worker.

### Don't Use Coordinator for Single-File Changes
The overhead of spawning workers is only worth it for cross-cutting changes.
