# Session Replay & Analysis

Build tools to replay, analyze, and learn from AI conversations.

---

## Data Source

Claude Code stores every conversation as JSONL:
```
~/.claude/projects/<sanitized-cwd>/<sessionId>.jsonl
```

Each line is a JSON message with:
```json
{
  "type": "user|assistant|tool_use|tool_result|system",
  "uuid": "unique-id",
  "parentUuid": "parent-message-id",
  "content": "...",
  "timestamp": 1711929600,
  "model": "claude-opus-4-6",
  "usage": { "inputTokens": 1000, "outputTokens": 500 }
}
```

---

## Tool Ideas

### 1. Conversation Replay Viewer
Build a web UI that replays conversations step-by-step:
```
- Timeline slider to scrub through the conversation
- Tool call visualization (what was called, inputs, outputs)
- Token usage graph over time
- Cost per message breakdown
- File diff viewer for each edit
```

### 2. Session Analytics
Parse JSONL files across projects to answer:
```
- Total tokens used per project/day/week
- Most used tools (Bash? Read? Edit?)
- Average conversation length
- Most expensive sessions
- Tool call success/failure rates
- Common error patterns
```

### 3. Prompt Pattern Extractor
Analyze successful sessions to extract reusable patterns:
```
- What system prompt modifications led to better results?
- Which tool sequences are most common?
- How often does compaction trigger?
- What percentage of tool calls are read-only vs write?
```

---

## Implementation: JSONL Parser

```typescript
import { readFileSync } from 'fs';

interface Message {
  type: 'user' | 'assistant' | 'tool_use' | 'tool_result' | 'system';
  uuid: string;
  parentUuid: string | null;
  content: any;
  timestamp: number;
  model?: string;
  usage?: { inputTokens: number; outputTokens: number };
}

function parseSession(path: string): Message[] {
  return readFileSync(path, 'utf-8')
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));
}

function getConversationTree(messages: Message[]) {
  const byId = new Map(messages.map(m => [m.uuid, m]));
  const roots = messages.filter(m => !m.parentUuid);
  
  function buildTree(msg: Message): any {
    const children = messages.filter(m => m.parentUuid === msg.uuid);
    return { ...msg, children: children.map(buildTree) };
  }
  
  return roots.map(buildTree);
}

function getTokenUsage(messages: Message[]) {
  return messages.reduce((acc, msg) => {
    if (msg.usage) {
      acc.input += msg.usage.inputTokens;
      acc.output += msg.usage.outputTokens;
    }
    return acc;
  }, { input: 0, output: 0 });
}

function getToolCallStats(messages: Message[]) {
  const toolCalls = messages.filter(m => m.type === 'tool_use');
  const counts: Record<string, number> = {};
  for (const call of toolCalls) {
    const name = call.content?.name || 'unknown';
    counts[name] = (counts[name] || 0) + 1;
  }
  return counts;
}
```

---

## Export Formats

### Markdown Export
```typescript
function toMarkdown(messages: Message[]): string {
  return messages.map(msg => {
    switch (msg.type) {
      case 'user':
        return `## User\n\n${msg.content}\n`;
      case 'assistant':
        return `## Assistant\n\n${extractText(msg.content)}\n`;
      case 'tool_use':
        return `### Tool: ${msg.content.name}\n\`\`\`json\n${JSON.stringify(msg.content.input, null, 2)}\n\`\`\`\n`;
      case 'tool_result':
        return `### Result\n\`\`\`\n${truncate(msg.content, 500)}\n\`\`\`\n`;
      default:
        return '';
    }
  }).join('\n---\n\n');
}
```
