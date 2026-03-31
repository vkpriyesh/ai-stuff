# 01 - Build Your Own AI CLI / Agent Framework

Clone Claude Code's architecture to build your own AI-powered command-line tool using any LLM.

---

## What You'll Learn

Claude Code is the most sophisticated open-source-adjacent AI agent codebase available. By studying it, you can build:

- A CLI agent for **any LLM** (OpenAI, Gemini, Llama, Mistral, Deepseek)
- A **domain-specific agent** (DevOps, data science, legal, medical)
- An **enterprise internal tool** with permission controls
- A **coding assistant** tailored to your stack

---

## Architecture to Replicate

```
┌──────────────────────────────────────────────────────┐
│                    Entry Point                        │
│  CLI parsing → mode detection → initialization       │
├──────────────────────────────────────────────────────┤
│                   Query Engine                        │
│  Message normalization → API call → stream → tools   │
├──────────────────────────────────────────────────────┤
│                   Tool System                         │
│  Tool registry → permission check → execution        │
├──────────────────────────────────────────────────────┤
│                  State & Persistence                  │
│  Session store → transcript JSONL → memory           │
├──────────────────────────────────────────────────────┤
│                    Terminal UI                         │
│  React/Ink → streaming display → input handling      │
└──────────────────────────────────────────────────────┘
```

---

## Deep-Dive Documents

| Document | Content |
|----------|---------|
| [Query Loop Architecture](./query-loop-architecture.md) | How to build the streaming query loop with tool execution |
| [Tool System Design](./tool-system-design.md) | How to design a pluggable tool system with permissions |
| [Session Persistence](./session-persistence.md) | JSONL transcripts, resume, and memory systems |
| [Terminal UI Patterns](./terminal-ui-patterns.md) | Building reactive terminal UIs with React/Ink |

---

## Minimum Viable Agent (Pseudocode)

```typescript
// 1. Parse CLI arguments
const args = parseArgs(process.argv);

// 2. Build system prompt
const systemPrompt = buildSystemPrompt({
  prefix: "You are MyAgent, an AI assistant.",
  tools: getToolDescriptions(),
  context: getProjectContext(),
});

// 3. Query loop
async function* queryLoop(userMessage, messages) {
  messages.push({ role: 'user', content: userMessage });
  
  while (true) {
    // Call LLM API with streaming
    const stream = await callAPI({ model, messages, system: systemPrompt, tools });
    
    // Accumulate response
    const response = await accumulateStream(stream);
    messages.push(response);
    
    // If no tool calls, we're done
    if (!response.toolCalls.length) break;
    
    // Execute tools
    for (const call of response.toolCalls) {
      const result = await executeTool(call.name, call.input);
      messages.push({ role: 'user', content: [{ type: 'tool_result', ...result }] });
    }
    // Loop continues - model sees tool results
  }
}

// 4. Persist session
appendToTranscript(sessionId, messages);
```

This is the core of what Claude Code does. Everything else is optimization and polish.
