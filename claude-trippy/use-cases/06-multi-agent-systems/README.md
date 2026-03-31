# 06 - Multi-Agent Systems

Build coordinator, swarm, and fork-based multi-agent architectures using Claude Code's patterns.

---

## Agent Orchestration Patterns in Claude Code

Claude Code implements 4 distinct multi-agent patterns:

### 1. Coordinator Pattern
One agent directs multiple workers:
```
Coordinator (orchestrator, no direct file access)
    ├─ Worker 1: Research (read-only, parallel)
    ├─ Worker 2: Research (read-only, parallel)
    ├─ Worker 3: Implementation (write, serial)
    └─ Worker 4: Verification (read + test, serial)
```

### 2. Fork Pattern
Parent spawns children that inherit full context:
```
Parent (has conversation history)
    ├─ Fork 1: Same context + "investigate X"
    ├─ Fork 2: Same context + "investigate Y"
    └─ Fork 3: Same context + "investigate Z"
    
All forks share prompt cache (byte-identical prefixes)
```

### 3. Swarm/Teammate Pattern
Named agents that communicate via messages:
```
Lead Agent
    ├─ @frontend (can send messages to others)
    ├─ @backend (can send messages to others)
    └─ @reviewer (can send messages to others)
    
Communication: SendMessage(to: "@backend", message: "...")
Broadcast: SendMessage(to: "*", message: "...")
```

### 4. Background Task Pattern
Fire-and-forget with notification:
```
Parent spawns background agent
    │ → Returns immediately with task ID
    │ → Parent continues other work
    │
    └─ <task-notification> arrives when agent completes
```

---

## Deep-Dive Documents

| Document | Content |
|----------|---------|
| [Coordinator Architecture](./coordinator-architecture.md) | Build orchestrator agents that direct workers |
| [Fork-Based Parallelism](./fork-parallelism.md) | Cache-sharing parallel research with fork semantics |
| [Team Communication](./team-communication.md) | Named agents with message-passing |

---

## When to Use Which Pattern

| Scenario | Pattern | Why |
|----------|---------|-----|
| Large feature implementation | Coordinator | Research → plan → implement → verify |
| Exploring multiple hypotheses | Fork | All forks share context cache |
| Full-stack feature work | Swarm | Frontend/backend/test specialists |
| Long-running background work | Background | Don't block the user |
| Code review from multiple perspectives | Fork | Each fork reviews from a different angle |
| Parallel independent tasks | Background | Multiple tasks, no coordination needed |
