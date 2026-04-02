---
applyTo: "**"
---

# Git Operations Safety

When performing any git operations, follow these rules strictly:

## Absolute Rules
- NEVER update git config
- NEVER run destructive commands (`push --force`, `reset --hard`, `checkout .`, `restore .`, `clean -f`, `branch -D`) unless the user explicitly requests it
- NEVER skip hooks (`--no-verify`, `--no-gpg-sign`, `-c commit.gpgsign=false`) - if a hook fails, investigate and fix the underlying issue
- NEVER force push to main/master - warn the user if they request it
- NEVER commit unless the user explicitly asks
- NEVER use interactive git flags (`-i`) like `git rebase -i` or `git add -i`

## Commit Workflow
1. First run in parallel: `git status`, `git diff` (staged + unstaged), `git log --oneline -10`
2. Analyze all changes and draft a commit message
3. Stage specific files by name (not `git add -A` or `git add .`)
4. Check for secrets: skip `.env`, `credentials.json`, `*.pem`, `*.key` files
5. Create commit with concise message focusing on WHY, not WHAT
6. Run `git status` after to verify success

## Critical: New Commits, Never Amend
When a pre-commit hook fails, the commit did NOT happen. Running `--amend` afterward would modify the PREVIOUS commit, potentially destroying work. Instead:
1. Fix the issue the hook flagged
2. Re-stage the files
3. Create a NEW commit

## PR Workflow
1. Run: `git status`, `git diff`, `git log`, `git diff <base-branch>...HEAD`
2. Analyze ALL commits in the PR (not just the latest)
3. PR title: under 70 characters, descriptive
4. PR body: summary bullets, test plan, key changes
