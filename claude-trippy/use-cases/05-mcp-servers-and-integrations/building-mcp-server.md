# Building an MCP Server

Step-by-step guide to creating an MCP server for Claude Code.

---

## Minimal MCP Server (Node.js)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-api-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
    resources: {},
  },
});

// Define a tool
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "query_users",
    description: "Query users from the database by name, email, or role",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max results", default: 10 },
      },
      required: ["query"],
    },
  }],
}));

// Handle tool calls
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "query_users") {
    const { query, limit = 10 } = request.params.arguments;
    const results = await db.users.search(query, limit);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Define resources
server.setRequestHandler("resources/list", async () => ({
  resources: [{
    uri: "myapi://docs/api-reference",
    name: "API Reference",
    description: "Complete API documentation",
    mimeType: "text/markdown",
  }],
}));

server.setRequestHandler("resources/read", async (request) => {
  if (request.params.uri === "myapi://docs/api-reference") {
    return {
      contents: [{ uri: request.params.uri, text: "# API Reference\n..." }],
    };
  }
  throw new Error(`Unknown resource: ${request.params.uri}`);
});

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Design Tips for Claude Code Integration

### 1. Name Tools for ToolSearch Discovery
Since MCP tools are always deferred, Claude finds them via keyword search.

**Good names:**
```
query_database, search_users, create_ticket, send_notification
```

**Bad names:**
```
do_thing, handler_1, process, execute
```

### 2. Write Detailed Descriptions
The description is all Claude has when deciding whether to use your tool:
```javascript
{
  name: "search_jira_issues",
  description: "Search Jira issues by JQL query, assignee, status, or free text. Returns issue key, summary, status, assignee, and priority. Use this when the user asks about tickets, bugs, or tasks tracked in Jira.",
}
```

### 3. Provide Server Instructions
Server instructions appear in `<system-reminder>` blocks:
```typescript
const server = new Server({
  name: "my-server",
  version: "1.0.0",
  instructions: `
    This server connects to the production API at api.example.com.
    - Always use search_users before create_user to check for duplicates
    - Query results are paginated; use the 'cursor' parameter for next page
    - Rate limit: 100 requests per minute
  `,
});
```

### 4. Return Structured Data
Claude handles JSON well. Return structured data, not prose:
```javascript
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      results: users,
      total: count,
      cursor: nextCursor,
      query: originalQuery,
    }, null, 2),
  }],
};
```

---

## Example MCP Servers to Build

### Internal API Gateway
Expose your company's REST APIs as MCP tools:
- One tool per endpoint
- Automatic auth handling (inject API keys from env)
- Response formatting

### Database Query Tool
Read-only database access:
- Natural language to SQL (tool description guides Claude)
- Schema introspection as resources
- Query result formatting with row limits

### Monitoring Dashboard
Connect to Grafana/Datadog/CloudWatch:
- Query metrics by time range
- List active alerts
- Check service health

### Issue Tracker
Connect to Jira/Linear/GitHub Issues:
- Search issues by query
- Read issue details
- Create/update issues
- Link issues to code changes
