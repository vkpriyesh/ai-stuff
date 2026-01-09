# Design-Led Development Skill

An Agent Skill for Claude Code that teaches Claude to build software with elite design principles focusing on user outcomes, trust, accessibility, and performance.

## Quick Start

1. **Verify the skill is loaded** - In Claude Code, ask:
   ```
   What Skills are available?
   ```
   You should see `design-led-development` in the list.

2. **Use the skill** - Simply ask Claude to perform tasks that match the skill's purpose:
   ```
   Create a button component with proper accessibility
   Review this code for UX best practices
   Help me design a form with good error handling
   ```

Claude automatically applies the skill when your request matches its description.

## Skill Structure

```
.claude/skills/design-led-development/
├── SKILL.md              # Core instructions (auto-loaded when triggered)
├── COLOR_TOKENS.md       # Color system reference
├── COMPONENT_PATTERNS.md # UI component patterns
├── DOCUMENTATION.md      # Code documentation standards
├── TESTING.md            # Testing strategy guide
└── README.md             # This file
```

## When This Skill Triggers

The skill activates when you ask about:

- Creating UI components
- Designing user flows
- Writing production code
- Reviewing code quality
- UX, accessibility, performance
- Trust-focused development
- Form validation patterns
- Error handling and feedback

## What It Teaches Claude

| Area | Key Principles |
|------|----------------|
| **Code** | Clarity over cleverness, explicit error handling |
| **Performance** | Budgets before coding, profile on low-end devices |
| **Accessibility** | Non-negotiable: ARIA, keyboard nav, contrast ratios |
| **Trust** | Privacy by default, reversible actions, visible feedback |
| **UI States** | All 9 states for every component |

## Example Prompts

```
# Component creation
"Create an accessible modal dialog component"

# Code review
"Review this form for UX anti-patterns"

# Architecture
"Design a loading state system for this app"

# Performance
"What performance budgets should I set for this feature?"
```

## Customization

### Edit the Skill

Modify `SKILL.md` to adjust instructions. Changes take effect immediately.

### Add Reference Files

Create new `.md` files and link them from `SKILL.md`:

```markdown
For detailed patterns, see [NEW_FILE.md](NEW_FILE.md)
```

### Scope Options

| Location | Availability |
|----------|--------------|
| `.claude/skills/` (current) | This project only |
| `~/.claude/skills/` | All your projects |

To make this skill available across all projects, move the folder:

```powershell
Move-Item ".\.claude\skills\design-led-development" "$env:USERPROFILE\.claude\skills\"
```

## Troubleshooting

### Skill Not Triggering

- Check the skill exists: `What Skills are available?`
- Use keywords from the description: "accessibility", "UX", "performance"
- Try explicit: "Using design principles, create..."

### Skill Not Loading

- Verify file path: `.claude/skills/design-led-development/SKILL.md`
- Check YAML frontmatter starts on line 1 (no blank lines before `---`)
- Run Claude Code with `--debug` flag to see loading errors

## Learn More

- [Agent Skills Documentation](https://code.claude.com/docs/en/skills)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Original Design Principles](../../design_instructions.md)
