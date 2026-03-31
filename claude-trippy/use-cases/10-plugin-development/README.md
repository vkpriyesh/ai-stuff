# 10 - Plugin Development

Build and distribute plugins that bundle skills, hooks, and MCP servers.

---

## Plugin Architecture

A Claude Code plugin is a package that can provide:

1. **Skills** - Custom slash commands with prompts
2. **Hooks** - Event handlers for lifecycle events
3. **MCP Servers** - External tool integrations

---

## Plugin Structure

```
my-plugin/
├── manifest.json              # Plugin metadata and content
├── skills/
│   ├── deploy/prompt.txt      # Skill definition
│   └── lint-fix/prompt.txt
├── hooks/
│   ├── auto-format.js         # Hook scripts
│   └── security-check.js
└── mcp-servers/
    └── my-api/index.js        # MCP server implementation
```

### manifest.json
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A plugin that adds deployment, formatting, and API integration",
  "skills": [
    {
      "name": "deploy",
      "description": "Deploy to staging or production",
      "prompt_file": "skills/deploy/prompt.txt",
      "allowed_tools": ["Bash", "Read"],
      "context": "fork"
    },
    {
      "name": "lint-fix",
      "description": "Auto-fix linting errors",
      "prompt_file": "skills/lint-fix/prompt.txt",
      "allowed_tools": ["Bash", "Read", "Edit"],
      "context": "fork"
    }
  ],
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "tool_name": "Edit|Write" },
        "command": "node hooks/auto-format.js"
      }
    ],
    "PreToolUse": [
      {
        "matcher": { "tool_name": "Bash" },
        "command": "node hooks/security-check.js"
      }
    ]
  },
  "mcpServers": {
    "my-api": {
      "command": "node",
      "args": ["mcp-servers/my-api/index.js"],
      "env": {
        "API_URL": "${MY_API_URL}"
      }
    }
  }
}
```

---

## Plugin Scope Hierarchy

Plugins can be installed at different scopes:

| Scope | Location | Managed By |
|-------|----------|------------|
| **Managed** | managed-settings.json | Organization admin |
| **User** | ~/.claude/settings.json | Individual user |
| **Project** | .claude/settings.json | Project team |
| **Local** | .claude/local/settings.json | Local overrides |

Higher scopes override lower scopes. Managed plugins cannot be disabled by users.

---

## Plugin Lifecycle

### Installation
```
1. Download from marketplace (or local path)
2. Verify against policy (isPluginBlockedByPolicy())
3. Extract to ~/.claude/plugins/<marketplace>/<name>/<version>/
4. Update installed_plugins.json (V2 format)
5. Add to settings.json enabledPlugins list
6. Register skills, hooks, and MCP servers
```

### Enable/Disable
```
- Toggle in settings.json enabledPlugins array
- Disabled plugins: hooks don't fire, skills hidden, MCP servers disconnected
```

### Update
```
1. Check marketplace for new version
2. Download new version
3. Replace in cache directory
4. Re-register content
```

### Uninstall
```
1. Remove from settings.json
2. Remove from installed_plugins.json
3. Optionally delete cache and plugin data directory
```

---

## Building a Plugin: Step by Step

### 1. Create the directory structure
```bash
mkdir -p my-plugin/{skills/my-skill,hooks,mcp-servers/my-server}
```

### 2. Write a skill
**my-plugin/skills/my-skill/prompt.txt:**
```yaml
---
name: my-skill
description: "Does something useful"
context: fork
allowed_tools: [Bash, Read, Grep]
---

Your skill instructions here...
```

### 3. Write a hook
**my-plugin/hooks/my-hook.js:**
```javascript
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
// Process hook data
// Exit 0 to allow, exit 2 to block
process.exit(0);
```

### 4. Write the manifest
**my-plugin/manifest.json:** (see format above)

### 5. Test locally
```json
// .claude/settings.json
{
  "enabledPlugins": ["./my-plugin"]
}
```

---

## Plugin Design Best Practices

1. **Keep hooks fast** - They run synchronously and block tool execution
2. **Use fork context for skills** - Inline skills can't be cancelled
3. **Scope MCP servers narrowly** - Only expose tools the plugin actually needs
4. **Handle errors gracefully** - Hook failures shouldn't crash Claude Code
5. **Document thoroughly** - Users need to know what your plugin does
6. **Version carefully** - Breaking changes should bump major version
7. **Respect scope hierarchy** - Don't override managed settings

---

## Example: Full-Stack Development Plugin

A plugin for full-stack web development:

```json
{
  "name": "fullstack-dev",
  "version": "2.0.0",
  "description": "Full-stack development toolkit with testing, formatting, and deployment",
  "skills": [
    { "name": "api-scaffold", "description": "Scaffold a new API endpoint" },
    { "name": "component", "description": "Create a React component with tests" },
    { "name": "migration", "description": "Create a database migration" },
    { "name": "deploy", "description": "Deploy to staging/production" }
  ],
  "hooks": {
    "PostToolUse": [
      { "matcher": { "tool_name": "Edit|Write" }, "command": "prettier --write" },
      { "matcher": { "tool_name": "Edit", "file_path": ".*\\.test\\." }, "command": "jest --findRelatedTests" }
    ],
    "PreToolUse": [
      { "matcher": { "tool_name": "Bash", "command": ".*npm publish.*" }, "command": "node hooks/publish-check.js" }
    ]
  },
  "mcpServers": {
    "database": {
      "command": "node",
      "args": ["mcp-servers/db-readonly.js"],
      "env": { "DATABASE_URL": "${DATABASE_URL}" }
    }
  }
}
```
