# Query Loop Architecture

How Claude Code's query loop works internally, and how to replicate it.

---

## The Core Loop

The query loop is an **async generator** (`query.ts`) that yields streaming events. Here's the exact flow:

### Phase 1: Pre-Processing

```
User message received
    │
    ├─ Build system prompt (sections assembled from constants/prompts.ts)
    ├─ Normalize messages:
    │   ├─ Reorder attachments (bubble up until tool results)
    │   ├─ Strip virtual messages (display-only, never sent to API)
    │   ├─ Filter progress/system messages
    │   ├─ Merge consecutive user messages
    │   ├─ Normalize tool inputs (strip custom fields)
    │   └─ Strip problematic media (errored PDFs, images)
    │
    └─ Compaction pipeline:
        ├─ Snip compaction: truncate old messages at safe boundaries
        ├─ Microcompact: cache tool results to ephemeral 1h cache
        ├─ Context collapse: staged drain when approaching overflow
        └─ Autocompact: summarize conversation if still too large
```

### Phase 2: API Call

```typescript
// What actually gets sent to the API
const request = {
  model: "claude-opus-4-6",
  messages: normalizedMessages,      // with cache breakpoints
  system: systemPromptBlocks,        // with cache_control markers
  tools: toolSchemas,                // with defer_loading flags
  max_tokens: 128000,
  stream: true,
  
  // Cache control
  // System prompt blocks get { type: 'ephemeral', ttl: '1h', scope: 'global' }
  
  // Beta features as headers
  // betas: ['prompt-caching-scope-2025-01-01', 'fast-mode-2025-01-01', ...]
};
```

### Phase 3: Streaming Response

```
SSE stream begins
    │
    ├─ message_start → capture usage, message ID
    ├─ content_block_start → begin text or tool_use block
    ├─ content_block_delta → accumulate text chunks / tool JSON fragments
    ├─ content_block_stop → finalize block
    ├─ message_delta → usage update, stop_reason
    └─ message_stop → final event
```

### Phase 4: Tool Execution

```
Tool calls extracted from response
    │
    ├─ Partition by concurrency safety:
    │   ├─ Read-only tools (Glob, Grep, Read) → run in parallel
    │   └─ Write tools (Edit, Bash, Write) → run serially
    │
    ├─ Per tool:
    │   ├─ validateInput() → schema validation
    │   ├─ checkPermissions() → allow / deny / ask user
    │   ├─ call() → execute, emit progress events
    │   ├─ Map result → ToolResultBlockParam
    │   └─ Apply context modifiers (file changes)
    │
    └─ Append tool results as user message
        └─ Loop back to Phase 2
```

### Phase 5: Termination

```
stop_reason === 'end_turn'     → normal completion
stop_reason === 'max_tokens'   → truncate + retry (up to 3x)
error: prompt_too_long         → reactive compact + retry
error: streaming_failure       → fallback to non-streaming
budget exhausted               → stop and return
```

---

## Key Design Decisions to Replicate

### 1. Async Generator Pattern
The query loop is a generator, not a callback system. This lets the caller control backpressure:
```typescript
for await (const event of query(messages, tools, systemPrompt)) {
  // Caller processes events at its own pace
  // Stream naturally pauses during tool execution
  render(event);
}
```

### 2. Message Normalization as a Separate Pass
Don't mix normalization with the query loop. Do it once before the API call:
- Merge consecutive same-role messages
- Strip display-only metadata
- Reorder for optimal cache hits

### 3. Tool Execution Partitioning
The key insight: read-only tools can run in parallel safely. Write tools must be serial.
```typescript
function partitionTools(calls) {
  const parallel = calls.filter(c => tools[c.name].isReadOnly());
  const serial = calls.filter(c => !tools[c.name].isReadOnly());
  return { parallel, serial };
}
```

### 4. Compaction as a Pipeline
Don't build one compaction strategy. Build a pipeline:
1. **Cheap** (snip): Just drop old messages
2. **Medium** (microcompact): Cache tool results externally
3. **Expensive** (autocompact): Call the LLM to summarize
4. **Emergency** (reactive): Triggered by API error

### 5. Retry with Backoff
```typescript
async function* withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      yield* fn();
      return;
    } catch (e) {
      if (!isTransient(e) || i === maxRetries - 1) throw e;
      await sleep(jitteredBackoff(i));
    }
  }
}
```

---

## Context Window Management

Claude Code's most sophisticated engineering is context management:

| Strategy | When Used | How It Works |
|----------|-----------|--------------|
| Snip | Messages exceed soft limit | Drop oldest messages at conversation boundaries |
| Microcompact | After each turn | Replace tool_result blocks with cached references |
| Context Collapse | Approaching hard limit | Staged removal of expandable sections |
| Autocompact | Still over limit after snip | Call LLM to summarize old conversation |
| Reactive Compact | API returns prompt_too_long | Emergency compact + retry |

### Cache Control Strategy
```
System prompt blocks → { cache_control: { type: 'ephemeral', ttl: '1h' } }
                        Shared across sessions for the same project

Tool schemas → Sorted for stability (prevent cache busts from reordering)
               Deferred tools excluded (loaded on demand via ToolSearch)

Messages → Cache breakpoints inserted at conversation boundaries
           Microcompact replaces tool results with cache refs
```

---

## Building Your Own: Checklist

- [ ] CLI argument parsing (Commander.js or yargs)
- [ ] System prompt builder (modular sections)
- [ ] Message normalization pass
- [ ] Streaming API client with retry
- [ ] Tool registry with schema generation
- [ ] Tool permission system (at minimum: allow/deny)
- [ ] Tool execution with concurrency partitioning
- [ ] JSONL transcript persistence
- [ ] Context window tracking and compaction
- [ ] Session resume from transcript
- [ ] Terminal UI (Ink, blessed, or raw ANSI)
