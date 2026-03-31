# Hidden Tool Prompt Patterns

How Claude Code embeds behavioral instructions in tool descriptions.

---

## The Pattern

Every tool has two text fields sent to the LLM:
1. **`description`** - Short summary (shown in tool list)
2. **`prompt()`** - Full instructions (the "hidden prompt")

The `prompt()` return value is sent as the tool's description in the API call. Users never see it, but it heavily influences Claude's behavior.

---

## Why Hide Instructions in Tool Descriptions?

1. **Modular**: Each tool carries its own behavioral rules
2. **Contextual**: Rules only apply when the tool is available
3. **Cache-efficient**: Tool schemas are cached separately from the system prompt
4. **Scalable**: Adding a tool adds its rules; removing a tool removes them

---

## Real Examples from Claude Code

### BashTool: The Git Protocol
The Bash tool's prompt contains the **entire git commit and PR creation protocol** (~200 lines). This means:
- Git safety rules only exist when Bash is available
- If Bash is removed from the tool pool, git instructions disappear
- The rules are contextual to the tool, not global

Key embedded rules:
```
- NEVER update the git config
- NEVER skip hooks (--no-verify, --no-gpg-sign)
- NEVER force push to main/master
- CRITICAL: Always create NEW commits rather than amending
- Always pass commit message via HEREDOC
```

### FileEditTool: The Pre-Read Requirement
```
You MUST use your Read tool at least once in the conversation before editing.
This tool will error if you attempt an edit without reading the file.
```
This is enforced both in the prompt AND in code. Double enforcement.

### WebSearchTool: The Sources Mandate
```
You MUST include Sources section at end of response
```
A single line that changes Claude's output format whenever search results are involved.

### AgentTool: The Delegation Rules
```
Never delegate understanding. Don't write "based on your findings, fix the bug."
Write prompts that prove you understood: include file paths, line numbers.
```
This prevents lazy delegation to subagents.

---

## Designing Your Own Hidden Tool Prompts

### Template:
```typescript
const MyTool = {
  name: 'MyTool',
  prompt: () => `
    [What the tool does - 1 sentence]
    
    [Usage rules - when to use, when NOT to use]
    
    [Output format requirements]
    
    [Safety constraints specific to this tool]
    
    [Common mistakes to avoid]
  `,
};
```

### Guidelines:
1. **Be specific**: "Use absolute paths" not "be careful with paths"
2. **Include anti-patterns**: "Do NOT use this for X" is as important as "use this for Y"
3. **Embed format requirements**: If the tool needs structured output, say so in the tool prompt
4. **Add safety rails**: Any dangerous capability should have explicit constraints
5. **Keep it relevant**: Only include instructions that relate to this tool's functionality
