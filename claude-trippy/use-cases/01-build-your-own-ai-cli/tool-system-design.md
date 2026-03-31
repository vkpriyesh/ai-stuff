# Tool System Design

How to build a pluggable tool system like Claude Code's.

---

## Tool Interface

Every tool in Claude Code implements this interface:

```typescript
type Tool<Input, Output> = {
  // Identity
  name: string;                              // "Bash", "Read", "Edit"
  
  // What the LLM sees
  description(): Promise<string>;            // Short description for API schema
  prompt(): string;                          // Full behavioral instructions (hidden prompt)
  input_schema: JSONSchema;                  // Zod-validated input schema
  
  // Execution
  call(input, context, permCallback): Output;
  validateInput(input): ValidationResult;
  
  // Permissions
  checkPermissions(input): PermissionResult;
  getPath?(input): string;                   // Extract file path for rule matching
  
  // Behavioral flags
  isConcurrencySafe(input): boolean;         // Can run in parallel?
  isReadOnly(input): boolean;                // No side effects?
  isDestructive?(input): boolean;            // Irreversible?
  
  // Lazy loading
  shouldDefer?: boolean;                     // Require ToolSearch to load?
  alwaysLoad?: boolean;                      // Override deferral?
};
```

### Key Insight: Tool Descriptions Are Hidden Prompts

The `prompt()` method returns text that shapes the LLM's behavior but users never see. Examples:

- **BashTool's prompt** (~500 lines): includes the entire git commit protocol, PR creation protocol, sleep guidelines, sandbox restrictions
- **FileEditTool's prompt**: requires reading the file first, preserving indentation, ensuring old_string uniqueness
- **WebSearchTool's prompt**: mandates a Sources section at the end of responses

This is a powerful pattern: **embed behavioral instructions in tool descriptions** rather than bloating the system prompt.

---

## Tool Registration

```typescript
// tools.ts - Single source of truth
function getAllBaseTools(): Tool[] {
  return [
    BashTool,
    FileReadTool,
    FileEditTool,
    FileWriteTool,
    GlobTool,
    GrepTool,
    WebSearchTool,
    WebFetchTool,
    AgentTool,
    
    // Feature-gated tools
    ...(isFeatureEnabled('REPL') ? [REPLTool] : []),
    ...(isFeatureEnabled('CRON') ? [CronCreateTool, CronDeleteTool] : []),
    
    // Always last: the tool that loads other tools
    ToolSearchTool,
  ];
}
```

### Tool Pool Assembly
```
Base tools → filter by deny rules → add MCP tools → deduplicate → sort for cache stability
```

The sort is critical: tool order must be deterministic across requests to avoid prompt cache busts.

---

## Tool Schema Generation (What Gets Sent to the API)

```typescript
function toolToAPISchema(tool, options) {
  return {
    name: tool.name,
    description: await tool.prompt(options),    // Hidden behavioral prompt
    input_schema: tool.input_schema,
    
    // Lazy loading flag
    ...(isDeferredTool(tool) ? { defer_loading: true } : {}),
  };
}
```

When `defer_loading: true`:
- Only the tool's name appears in `<system-reminder>` blocks
- The LLM must call ToolSearchTool to fetch the full schema before using it
- Saves context window for tools that are rarely needed

---

## Concurrency Model

```
Tool calls from LLM response
    │
    ▼
Partition:
    ├─ Batch 1: All tools where isConcurrencySafe() === true
    │            → Promise.all([tool1.call(), tool2.call(), ...])
    │
    └─ Batch 2+: Each non-concurrent tool runs alone
                 → await tool.call()
                 → apply context modifiers before next tool
```

Read-only tools (Glob, Grep, Read) are concurrent-safe by default.
Write tools (Edit, Write, Bash) are not - they must run serially because:
- File edits may conflict
- Bash commands may depend on prior file state
- Context modifiers (file change tracking) must apply sequentially

---

## Permission System Integration

```
Tool call received
    │
    ▼
1. tool.validateInput(input)
    │ → reject malformed inputs before permission check
    ▼
2. tool.checkPermissions(input)
    │ → tool-specific logic (e.g., BashTool checks command safety)
    ▼
3. General permission rules
    │ → settings.json deny/allow/ask rules
    │ → bash classifier (safe vs dangerous commands)
    │ → permission mode (default/auto/bypass)
    ▼
4. Result: allow → execute
           deny → return error to LLM
           ask → prompt user → execute or deny
```

---

## Building Your Own Tool System

### Minimum viable tool:
```typescript
const ReadFileTool = {
  name: 'ReadFile',
  description: () => 'Read a file from disk',
  prompt: () => `Reads a file. Use absolute paths. Returns content with line numbers.`,
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Absolute file path' },
    },
    required: ['path'],
  },
  isConcurrencySafe: () => true,
  isReadOnly: () => true,
  call: async ({ path }) => {
    const content = await fs.readFile(path, 'utf-8');
    return content.split('\n').map((l, i) => `${i+1}\t${l}`).join('\n');
  },
};
```

### Scaling up:
1. Add `checkPermissions()` for dangerous operations
2. Add `validateInput()` for schema validation
3. Add progress events for long-running tools
4. Add `shouldDefer` for rarely-used tools
5. Add `getPath()` for file-based permission matching
