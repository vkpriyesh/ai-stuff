# CI/CD Integration

Using Claude Code in CI/CD pipelines for automated code tasks.

---

## Headless Mode for CI/CD

```bash
# Basic headless query
claude -p "Fix the failing test in src/auth.test.ts" --output-format json

# Minimal mode (faster, less prompt overhead)
claude --bare -p "Add type annotations to src/utils.ts"

# With specific model (cost control)
claude --bare -p "Lint and fix style issues" --model haiku

# Structured output for parsing
claude -p "List all TODO comments" --output-format json | jq '.result'
```

---

## CI Pipeline Examples

### GitHub Actions: Auto-Fix PR Issues
```yaml
name: Claude Auto-Fix
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Claude Code
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx claude-code --bare -p "
            Review the git diff for this PR.
            Fix any linting errors, type errors, or obvious bugs.
            Run tests to verify fixes.
          " --model sonnet --permission-mode auto
      - name: Commit fixes
        run: |
          git add -A
          git diff --cached --quiet || git commit -m "Auto-fix by Claude Code"
          git push
```

### Code Review Bot
```yaml
name: Claude Review
on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          REVIEW=$(npx claude-code --bare -p "
            Review the PR diff (git diff origin/main...HEAD).
            Focus on: bugs, security issues, performance.
            Output as markdown with severity levels.
          " --model sonnet --output-format text)
          
          # Post as PR comment
          gh pr comment ${{ github.event.number }} --body "$REVIEW"
```

### Automated Documentation
```yaml
name: Doc Generation
on:
  push:
    branches: [main]
    paths: ['src/**/*.ts']

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate docs
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx claude-code --bare -p "
            Read all TypeScript files in src/.
            Update docs/API.md with current function signatures and descriptions.
            Only update docs that have changed.
          " --model haiku --permission-mode auto
```

---

## Key Flags for CI/CD

| Flag | Purpose |
|------|---------|
| `--bare` / `-p` | Headless mode, no interactive UI |
| `--output-format json` | Machine-parseable output |
| `--model haiku` | Cost-effective for simple tasks |
| `--permission-mode auto` | Don't prompt for permissions |
| `--max-turns N` | Limit conversation turns |
| `CLAUDE_CODE_SIMPLE=1` | Minimal system prompt |

---

## Cost Control in CI

- Use `--model haiku` for simple tasks (60x cheaper than Opus)
- Use `--model sonnet` for moderate tasks (5x cheaper than Opus)
- Set `--max-turns` to prevent runaway conversations
- Use `--effort low` when detailed analysis isn't needed
- Cache Claude Code installation in CI (avoid re-downloading)
