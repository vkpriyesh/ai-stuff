# MCP Design Patterns

Effective patterns for building MCP servers that work well with Claude Code.

---

## Pattern 1: Read-Then-Write

Expose paired tools that force reading before writing:

```
search_records → view_record → update_record
```

The update tool's description should say:
```
"You MUST call view_record first to see the current state before updating."
```

This mirrors Claude Code's own FileEdit pattern (must Read before Edit).

---

## Pattern 2: Paginated Results

Always support pagination for list/search tools:

```json
{
  "name": "list_items",
  "inputSchema": {
    "properties": {
      "cursor": { "type": "string", "description": "Pagination cursor from previous result" },
      "limit": { "type": "number", "default": 20, "maximum": 100 }
    }
  }
}
```

Return cursor in results:
```json
{ "items": [...], "next_cursor": "abc123", "has_more": true }
```

---

## Pattern 3: Confirmation for Mutations

For tools that modify data, add a `confirm` parameter:

```json
{
  "name": "delete_user",
  "description": "Delete a user. Set confirm=true to execute. Without confirm, returns a preview of what would be deleted.",
  "inputSchema": {
    "properties": {
      "user_id": { "type": "string" },
      "confirm": { "type": "boolean", "default": false }
    }
  }
}
```

When `confirm=false`, return a preview. When `confirm=true`, execute.

---

## Pattern 4: Schema as Resources

Expose your data schema as MCP resources so Claude can reference it:

```javascript
server.setRequestHandler("resources/list", async () => ({
  resources: [
    {
      uri: "mydb://schema/users",
      name: "Users Table Schema",
      description: "Column definitions for the users table",
    },
    {
      uri: "mydb://schema/orders",
      name: "Orders Table Schema",
      description: "Column definitions for the orders table",
    },
  ],
}));
```

Claude can read these via ReadMcpResource to understand your data model before querying.

---

## Pattern 5: Error Context

Return helpful errors that guide Claude to fix the issue:

```javascript
// Bad
throw new Error("Invalid query");

// Good
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      error: "Invalid JQL query",
      details: "Field 'asignee' does not exist. Did you mean 'assignee'?",
      valid_fields: ["assignee", "status", "priority", "created", "updated"],
      example: 'assignee = "john@example.com" AND status = "Open"',
    }),
  }],
  isError: true,
};
```

---

## Pattern 6: Batch Operations

For efficiency, support batch reads:

```json
{
  "name": "get_issues",
  "description": "Get one or more issues by key. Supports batch lookups.",
  "inputSchema": {
    "properties": {
      "keys": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Issue keys like ['PROJ-123', 'PROJ-456']"
      }
    }
  }
}
```

This reduces round trips between Claude and your server.
