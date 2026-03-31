# Fork-Based Parallelism

Cache-sharing parallel research using fork semantics.

---

## What Fork Does

When a fork subagent is spawned:
1. Child inherits the parent's **entire conversation history**
2. Child inherits the parent's **exact system prompt** (byte-identical)
3. Child inherits the parent's **exact tool array**
4. Parent's tool_use blocks are included with **placeholder results**
5. Only the **fork directive** (final instruction) differs per child

### Why This Matters: Prompt Cache Sharing

Anthropic charges for prompt caching. With fork:
```
Parent conversation: 50,000 tokens
                                    ┌─ Fork 1: 50,000 cached + 200 new (directive)
Parent forks 3 children ──────────►├─ Fork 2: 50,000 cached + 200 new (directive)
                                    └─ Fork 3: 50,000 cached + 200 new (directive)

Without fork: 3 × 50,000 = 150,000 input tokens
With fork:    50,000 + 3 × 200 = 50,600 input tokens (97% savings)
```

---

## How Fork Messages Are Built

```typescript
function buildForkedMessages(parentMessages, directive) {
  // 1. Take parent's messages verbatim (for cache parity)
  const messages = [...parentMessages];
  
  // 2. For each tool_use in parent, add placeholder tool_result
  //    (byte-identical across all forks)
  for (const msg of messages) {
    if (msg.type === 'tool_use') {
      messages.push({
        type: 'tool_result',
        content: '[placeholder - result not available in fork]',
      });
    }
  }
  
  // 3. Append the fork-specific directive as final user message
  messages.push({
    role: 'user',
    content: directive,  // This is the ONLY part that differs per fork
  });
  
  return messages;
}
```

---

## When to Use Fork

### Good Use Cases
- **Multiple research questions** from the same codebase context
- **Exploring alternatives** (investigate approach A vs B vs C)
- **Multi-perspective review** (security review, performance review, UX review)
- **Parallel search** across different dimensions

### Bad Use Cases
- **Implementation** (forks can't see each other's file changes)
- **Sequential work** (where step 2 depends on step 1)
- **Small tasks** (fork overhead not worth it)

---

## Example: Multi-Perspective Code Review

```
Parent has read the PR diff (50k tokens of context)
    │
    ├─ Fork 1: "Review this diff for security vulnerabilities.
    │           Focus on auth, injection, data exposure."
    │
    ├─ Fork 2: "Review this diff for performance issues.
    │           Focus on queries, allocations, caching."
    │
    └─ Fork 3: "Review this diff for correctness.
                Focus on logic errors, edge cases, race conditions."

All three forks share the 50k token cache → minimal additional cost
Each returns an independent review from their perspective
Parent synthesizes all three reviews into a single report
```

---

## Implementation Pattern

```typescript
// In your agent system
async function parallelResearch(parentContext, questions) {
  const forks = questions.map(question => ({
    // Inherit parent's system prompt and tools
    systemPrompt: parentContext.renderedSystemPrompt,
    tools: parentContext.tools,
    
    // Build forked messages
    messages: buildForkedMessages(parentContext.messages, question),
  }));
  
  // Launch all forks in parallel
  const results = await Promise.all(
    forks.map(fork => runAgent(fork))
  );
  
  return results;
}
```

---

## Fork Rules from Source Code

1. **Don't peek**: Fork children should not try to read the parent's tool results (they're placeholders)
2. **Don't race**: Multiple forks should not try to modify the same files
3. **Write directives, not situations**: The fork prompt should be actionable, not descriptive
