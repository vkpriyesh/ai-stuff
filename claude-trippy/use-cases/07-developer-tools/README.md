# 07 - Developer Tools

Build developer tools using patterns from Claude Code's architecture.

---

## Tools You Can Build

### From the Query Loop
| Tool | Based On | Description |
|------|----------|-------------|
| **Context Compressor** | Compaction pipeline | Summarize long conversations for any LLM app |
| **Streaming Chat Library** | QueryEngine | Reusable streaming + tool execution for any frontend |
| **Token Budget Manager** | query/tokenBudget.ts | Auto-continue loops with diminishing returns detection |

### From the Tool System
| Tool | Based On | Description |
|------|----------|-------------|
| **AI Git Hooks** | PreToolUse hooks | Auto-lint, auto-test, auto-format on every commit |
| **Permission Framework** | utils/permissions/ | Reusable allow/deny/ask system for any agent |
| **Tool Orchestrator** | services/tools/ | Parallel/serial tool execution with concurrency safety |

### From Session Persistence
| Tool | Based On | Description |
|------|----------|-------------|
| **Session Replay Viewer** | JSONL transcripts | Visual replay of AI conversations |
| **Cost Dashboard** | cost-tracker.ts | Track spend across models, sessions, projects |
| **Conversation Exporter** | sessionStorage.ts | Export conversations to markdown, HTML, PDF |

### From the Agent System
| Tool | Based On | Description |
|------|----------|-------------|
| **Agent Debugger** | AgentTool + transcripts | Trace agent decision trees and tool calls |
| **Prompt Cache Analyzer** | Fork system | Measure cache hit rates across agent spawns |
| **Multi-Agent Visualizer** | Coordinator mode | Visualize agent communication and task flow |

---

## Deep-Dive Documents

| Document | Content |
|----------|---------|
| [Session Replay & Analysis](./session-replay.md) | Build tools to replay and analyze conversations |
| [Cost Dashboard](./cost-dashboard.md) | Track and optimize API spend |
| [Context Compression Library](./context-compression.md) | Reusable compaction pipeline for any LLM app |
