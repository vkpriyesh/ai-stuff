# Claude Code Internals - Use Cases & Applications

A comprehensive guide to everything you can build, exploit, customize, and learn from Claude Code's source code. Each folder contains deep-dive documentation for a specific application domain.

---

## What You Have

By reverse-engineering Claude Code, you now possess:

- **The exact system prompts** (~2000+ lines) Anthropic sends to Claude for every conversation
- **40+ hidden tool prompts** - behavioral instructions embedded in tool descriptions
- **The complete query loop** - streaming, retry, compaction, tool orchestration
- **The permission framework** - 4 modes, classifiers, denial tracking
- **5 agent spawn paths** - standard, fork, background, teammate, worktree
- **The plugin/skill/hook architecture** - 12+ hook events, 3 skill sources, plugin manifests
- **Session persistence model** - JSONL transcripts, auto-memory, session memory extraction
- **Multi-provider API client** - Anthropic, Bedrock, Azure Foundry, Vertex AI
- **Feature gate system** - compile-time dead code elimination

---

## Use Case Index

| # | Folder | What You Can Do |
|---|--------|-----------------|
| 01 | [Build Your Own AI CLI](./01-build-your-own-ai-cli/) | Clone the architecture for any LLM - build a competitor or domain-specific agent |
| 02 | [Custom Agents & Skills](./02-custom-agents-and-skills/) | Create custom agents, skills, and personas without touching source code |
| 03 | [Prompt Engineering Playbook](./03-prompt-engineering-playbook/) | Extract and reuse Anthropic's production prompt patterns |
| 04 | [Security Research](./04-security-research/) | Understand the permission model, study injection surfaces, build security hooks |
| 05 | [MCP Servers & Integrations](./05-mcp-servers-and-integrations/) | Build MCP servers that expose your tools/APIs/databases to Claude |
| 06 | [Multi-Agent Systems](./06-multi-agent-systems/) | Build coordinator, swarm, and fork-based multi-agent architectures |
| 07 | [Developer Tools](./07-developer-tools/) | Build session replay, cost dashboards, context compressors, and more |
| 08 | [Optimize Claude Code Usage](./08-optimize-claude-code-usage/) | Maximize cache hits, reduce costs, pick the right modes and agents |
| 09 | [Hooks & Automation](./09-hooks-and-automation/) | Automate workflows with pre/post hooks for every tool and event |
| 10 | [Plugin Development](./10-plugin-development/) | Build and distribute plugins that bundle skills, hooks, and MCP servers |

---

## Quick Reference: Key Source Files

| Domain | Files |
|--------|-------|
| System Prompts | `constants/prompts.ts`, `constants/system.ts`, `constants/cyberRiskInstruction.ts` |
| Query Loop | `QueryEngine.ts`, `query.ts`, `services/api/claude.ts` |
| Tool System | `Tool.ts`, `tools.ts`, `tools/*/prompt.ts` |
| Permissions | `utils/permissions/permissions.ts`, `bashClassifier.ts`, `yoloClassifier.ts` |
| Agents | `tools/AgentTool/AgentTool.tsx`, `tools/AgentTool/built-in/*.ts` |
| Skills | `skills/bundledSkills.ts`, `tools/SkillTool/SkillTool.ts` |
| Hooks | `utils/hooks/hooksConfigManager.ts`, `utils/hooks/exec*.ts` |
| Plugins | `plugins/builtinPlugins.ts`, `services/plugins/pluginOperations.ts` |
| State/Memory | `state/AppStateStore.ts`, `memdir/`, `services/SessionMemory/` |
| MCP | `services/mcp/client.ts`, `services/mcp/config.ts` |
| Persistence | `utils/sessionStorage.ts`, `history.ts` |
| API Client | `services/api/client.ts`, `services/api/withRetry.ts` |
| Startup | `main.tsx`, `entrypoints/init.ts`, `setup.ts`, `bootstrap/state.ts` |

---

## How to Use This Guide

1. **Pick a use case** that matches your goal
2. **Read the overview** in that folder's README
3. **Follow the deep-dive docs** for implementation details
4. **Reference the source files** listed to understand the exact implementation
5. **Build incrementally** - start with the simplest version, then add sophistication

Each folder is self-contained with:
- `README.md` - Overview and quick-start
- Detailed `.md` files for each sub-topic
- Code examples and configuration snippets
- Architecture diagrams where applicable
