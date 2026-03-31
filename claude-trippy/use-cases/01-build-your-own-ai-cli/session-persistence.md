# Session Persistence

How Claude Code saves and restores conversations.

---

## Storage Format: JSONL

Every conversation is stored as a **JSON Lines** file:
```
~/.claude/projects/<sanitized-cwd>/<sessionId>.jsonl
```

Each line is a JSON object representing one message:
```json
{"type":"user","uuid":"abc-123","parentUuid":null,"content":"Fix the login bug","timestamp":1711929600}
{"type":"assistant","uuid":"def-456","parentUuid":"abc-123","content":[{"type":"text","text":"I'll look at..."}],"timestamp":1711929605}
{"type":"tool_use","uuid":"ghi-789","parentUuid":"def-456","name":"Read","input":{"file_path":"/src/auth.ts"},"timestamp":1711929606}
{"type":"tool_result","uuid":"jkl-012","parentUuid":"ghi-789","content":"...file contents...","timestamp":1711929607}
```

### Why JSONL?
- **Append-only**: No file rewrites, just append new lines
- **Streamable**: Can read/write line by line without loading entire file
- **Resumable**: Load any conversation by reading the file top-to-bottom
- **Debuggable**: Human-readable, grep-able

---

## Message Chain Reconstruction

Messages form a tree via `uuid` → `parentUuid`:
```
User message (uuid: A, parent: null)
  └─ Assistant response (uuid: B, parent: A)
       ├─ Tool call: Read (uuid: C, parent: B)
       │   └─ Tool result (uuid: D, parent: C)
       └─ Tool call: Edit (uuid: E, parent: B)
           └─ Tool result (uuid: F, parent: E)
  └─ Assistant follow-up (uuid: G, parent: F)
```

On resume, the JSONL is loaded and the chain is reconstructed by following `parentUuid` links.

---

## Session Resume Flow

```
/resume command
    │
    ├─ List all .jsonl files from ~/.claude/projects/<cwd>/
    ├─ Read last 64KB of each file for preview (tail optimization)
    ├─ Display session picker with timestamps and previews
    │
    ▼ User selects session
    │
    ├─ switchSession(sessionId)
    │   ├─ Update bootstrap state (cwd, sessionId, projectDir)
    │   └─ Clear current conversation
    │
    ├─ loadTranscriptFile(sessionId)
    │   ├─ Read .jsonl line by line
    │   ├─ Parse each JSON line into message objects
    │   ├─ Reconstruct parentUuid chain
    │   └─ Handle legacy progress entries (bridge format)
    │
    └─ Restore conversation in UI
```

---

## Prompt History (Separate from Transcripts)

Global prompt history for the `/resume` picker:
```
~/.claude/history.jsonl
```

- Tracks every command typed across all sessions and projects
- Per-project filtering in the picker UI
- Large pastes stored as hash references in `~/.claude/paste-store/<hash>.txt`
- Deduplicated by display text

---

## Memory System (Persistent Knowledge)

### Auto-Memory (Across Sessions)
```
~/.claude/projects/<sanitized-git-root>/memory/
├── MEMORY.md              # Index (200 lines max)
├── user_role.md           # Type: user
├── feedback_testing.md    # Type: feedback
├── project_context.md     # Type: project
└── reference_jira.md      # Type: reference
```

### Session Memory (Per-Conversation Summary)
```
~/.claude/projects/<cwd>/<sessionId>/session-memory/summary.md
```
- Extracted by a background subagent
- Triggered after ~20k new tokens
- Captures key decisions, findings, and context

---

## Building Your Own: Implementation

### Minimal JSONL persistence:
```typescript
import { appendFileSync, readFileSync } from 'fs';

function appendMessage(sessionPath, message) {
  appendFileSync(sessionPath, JSON.stringify(message) + '\n');
}

function loadSession(sessionPath) {
  return readFileSync(sessionPath, 'utf-8')
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));
}

function resumeSession(sessionPath) {
  const messages = loadSession(sessionPath);
  // Reconstruct chain via parentUuid
  // Feed back into query loop
  return messages;
}
```

### Adding memory:
```typescript
// After each conversation turn, extract memories
async function extractMemories(messages, memoryDir) {
  const recentMessages = messages.slice(-10);
  const extraction = await callLLM({
    system: "Extract key facts worth remembering for future sessions.",
    messages: [{ role: 'user', content: JSON.stringify(recentMessages) }],
  });
  
  // Append to MEMORY.md index
  appendFileSync(join(memoryDir, 'MEMORY.md'), `\n- ${extraction.summary}`);
  
  // Write individual memory file
  writeFileSync(join(memoryDir, `${extraction.type}_${Date.now()}.md`), extraction.content);
}
```
