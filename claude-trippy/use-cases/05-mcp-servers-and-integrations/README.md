# 05 - MCP Servers & Integrations

Build MCP (Model Context Protocol) servers that expose your tools, APIs, and databases to Claude Code.

---

## Overview

MCP is the protocol Claude Code uses to connect to external tools. By building an MCP server, you can make Claude Code interact with:

- Your internal REST/GraphQL APIs
- Databases (query, not mutate)
- Cloud dashboards (AWS, GCP, Azure)
- Issue trackers (Jira, Linear, GitHub Issues)
- Communication tools (Slack, email)
- Custom business logic

---

## How Claude Code Consumes MCP

```
MCP Server Config (settings.json or .claude/mcp-servers.json)
    │
    ▼
Claude Code connects to server at startup
    │
    ├─ Server provides: tools, resources, instructions
    ├─ Tools are ALWAYS deferred (lazy-loaded via ToolSearch)
    ├─ Server instructions appear in <system-reminder> blocks
    └─ Resources accessible via ListMcpResources/ReadMcpResource
```

### Key Facts from the Source Code
1. **MCP tools are always deferred** - Claude must use ToolSearch to load them
2. **Design tool names for discoverability** - ToolSearch uses keyword matching
3. **Server instructions are injected as `<system-reminder>`** - use them to guide Claude
4. **MCP servers connect at startup** - slow servers delay first response
5. **Multiple config sources**: project, user, CLI, enterprise, Claude.ai subscriber

---

## Deep-Dive Documents

| Document | Content |
|----------|---------|
| [Building an MCP Server](./building-mcp-server.md) | Step-by-step guide to creating an MCP server |
| [MCP Design Patterns](./mcp-design-patterns.md) | Patterns for effective MCP server design |

---

## Configuration

### Project-level: `.claude/mcp-servers.json`
```json
{
  "my-api": {
    "command": "node",
    "args": ["./mcp-servers/my-api/index.js"],
    "env": {
      "API_BASE_URL": "https://api.example.com",
      "API_KEY": "${API_KEY}"
    }
  }
}
```

### User-level: `~/.claude/settings.json`
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

### CLI: `--mcp-config`
```bash
claude --mcp-config ./my-mcp-config.json
```
