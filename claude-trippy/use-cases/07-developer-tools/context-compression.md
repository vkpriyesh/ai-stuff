# Context Compression Library

Reuse Claude Code's compaction pipeline in your own LLM applications.

---

## The 5-Stage Pipeline

Claude Code's context management is its most sophisticated engineering:

```
Stage 1: Snip Compact
    → Cheapest: just drop old messages at conversation boundaries
    → No LLM call needed
    → Preserves recent context

Stage 2: Microcompact
    → Cache tool results externally (1h TTL)
    → Replace inline tool_result with cache reference
    → On next request, API resolves reference from cache
    → Saves context window without losing information

Stage 3: Context Collapse
    → Staged removal of expandable sections
    → System-reminders, agent listings, verbose tool results
    → Progressive: collapse more as pressure increases

Stage 4: Autocompact
    → Call LLM to summarize the conversation
    → Replace old messages with summary boundary
    → Expensive but effective
    → Preserves key facts, decisions, and context

Stage 5: Reactive Compact
    → Triggered by API "prompt too long" error
    → Emergency: aggressive compact + retry
    → Last resort before conversation truncation
```

---

## Implementing Each Stage

### Stage 1: Snip Compaction
```typescript
function snipCompact(messages: Message[], maxTokens: number): Message[] {
  let tokenCount = estimateTokens(messages);
  let cutIndex = 0;
  
  while (tokenCount > maxTokens && cutIndex < messages.length - 4) {
    // Find next safe boundary (between user/assistant pairs)
    cutIndex = findNextBoundary(messages, cutIndex + 1);
    tokenCount = estimateTokens(messages.slice(cutIndex));
  }
  
  if (cutIndex > 0) {
    return [
      { role: 'user', content: '[Earlier conversation snipped for context]' },
      ...messages.slice(cutIndex),
    ];
  }
  return messages;
}
```

### Stage 2: Microcompact (External Cache)
```typescript
function microcompact(messages: Message[], cache: Cache): Message[] {
  return messages.map(msg => {
    if (msg.type === 'tool_result' && msg.content.length > 1000) {
      const hash = sha256(msg.content);
      cache.set(hash, msg.content, { ttl: 3600 }); // 1h TTL
      return { ...msg, content: `[cached:${hash}]`, cached: true };
    }
    return msg;
  });
}
```

### Stage 3: Context Collapse
```typescript
function contextCollapse(messages: Message[], pressure: number): Message[] {
  // pressure: 0 (no pressure) to 1 (critical)
  return messages.map(msg => {
    // At low pressure, only collapse system-reminders
    if (pressure < 0.3 && msg.isSystemReminder) {
      return { ...msg, content: '[system context collapsed]' };
    }
    // At medium pressure, collapse verbose tool results
    if (pressure < 0.7 && msg.type === 'tool_result' && msg.content.length > 500) {
      return { ...msg, content: truncate(msg.content, 200) };
    }
    // At high pressure, collapse everything non-essential
    if (pressure >= 0.7 && msg.type === 'tool_result') {
      return { ...msg, content: truncate(msg.content, 50) };
    }
    return msg;
  });
}
```

### Stage 4: Autocompact (LLM Summarization)
```typescript
async function autocompact(messages: Message[], llm: LLM): Promise<Message[]> {
  const oldMessages = messages.slice(0, -4); // Keep last 4 messages
  const recentMessages = messages.slice(-4);
  
  const summary = await llm.complete({
    system: "Summarize the key facts, decisions, and context from this conversation. Be concise.",
    messages: [{ role: 'user', content: formatMessages(oldMessages) }],
  });
  
  return [
    { role: 'user', content: `[Conversation summary]\n${summary}` },
    { role: 'assistant', content: 'I understand the context. Continuing.' },
    ...recentMessages,
  ];
}
```

### Stage 5: Reactive (on API error)
```typescript
async function handlePromptTooLong(messages, error) {
  // Emergency: aggressive compact
  let compacted = snipCompact(messages, error.maxAllowed * 0.8);
  compacted = contextCollapse(compacted, 1.0); // max pressure
  
  if (estimateTokens(compacted) > error.maxAllowed) {
    compacted = await autocompact(compacted, llm);
  }
  
  // Retry with compacted messages
  return retry(compacted);
}
```

---

## Key Insights from Claude Code

1. **Pipeline order matters**: cheap before expensive
2. **Preserve recent context**: always keep the last few messages intact
3. **Safe boundaries**: only cut between complete user/assistant turns
4. **Cache externally**: microcompact avoids re-sending large tool results
5. **Progressive pressure**: collapse more as context fills up
6. **Emergency fallback**: always have a last-resort strategy
