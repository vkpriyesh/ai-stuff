# Cost Dashboard

Track and optimize Claude API spend using data from Claude Code's cost tracker.

---

## How Claude Code Tracks Costs

**File:** `cost-tracker.ts`

Every API call records:
```typescript
{
  inputTokens: number,
  outputTokens: number,
  cacheReadInputTokens: number,      // Prompt cache hits (cheaper)
  cacheCreationInputTokens: number,  // Cache write cost
  webSearchRequests: number,          // Web search tool usage
  costUSD: number,                    // Calculated price
}
```

Cost is calculated per-model using `calculateUSDCost(model, usage)`.

Session totals persisted to config:
```
lastCost, lastModelUsage, lastSessionId
```

---

## Data Sources for a Dashboard

### 1. Session Transcripts (Richest Data)
Parse `~/.claude/projects/*/*.jsonl` for per-message usage:
```typescript
// Extract cost data from session
function extractCosts(sessionPath: string) {
  const messages = parseJsonl(sessionPath);
  return messages
    .filter(m => m.usage)
    .map(m => ({
      timestamp: m.timestamp,
      model: m.model,
      inputTokens: m.usage.inputTokens,
      outputTokens: m.usage.outputTokens,
      cacheHits: m.usage.cacheReadInputTokens || 0,
      cacheWrites: m.usage.cacheCreationInputTokens || 0,
    }));
}
```

### 2. Config File (Quick Summary)
Read `~/.claude/config.json` for last session cost.

---

## Dashboard Metrics

### Per-Session
- Total cost (USD)
- Token breakdown (input vs output vs cache)
- Cache hit rate (%)
- Most expensive tool calls
- Cost per user message

### Per-Project
- Total spend over time
- Cost trend (increasing/decreasing)
- Average session cost
- Most expensive sessions

### Per-Model
- Cost by model (opus vs sonnet vs haiku)
- Token efficiency per model
- Cache effectiveness per model

### Optimization Opportunities
- Sessions with low cache hit rates (prompt instability)
- Sessions with excessive compaction (conversations too long)
- Tools that consume disproportionate tokens (large file reads)
- Subagent overhead (fork vs standard spawn cost)

---

## Pricing Reference (from source)

The cost tracker uses per-model pricing. Current approximate rates:
```
Claude Opus:   $15/M input, $75/M output
Claude Sonnet: $3/M input,  $15/M output
Claude Haiku:  $0.25/M input, $1.25/M output

Cache read:    75% discount on input price
Cache write:   25% premium on input price
```

---

## Optimization Tips from Internals

1. **Maximize cache hits**: Keep system prompts stable; avoid unnecessary tool changes
2. **Use appropriate models**: Haiku for simple tasks, Opus only when needed
3. **Leverage fork**: Fork subagents share parent's cache (97% input savings)
4. **Use `--effort low`**: For simple tasks, reduces output tokens
5. **Avoid unnecessary file reads**: Large files consume many input tokens
6. **Use Explore agent for search**: It's read-only and faster than general-purpose
7. **Monitor compaction**: Frequent compaction means conversations are too long
