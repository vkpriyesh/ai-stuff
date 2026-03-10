---
mode: agent
description: Adds or updates a GitHub Actions Gitleaks workflow for an existing repository. Use when the repository needs secret scanning in CI for commits, pull requests, or repository content.
tools:
  - codebase
  - githubRepo
  - readFile
  - createFile
  - editFile
---

Add or update Gitleaks in this repository.

## Required steps

1. Inspect existing workflows and any current secret scanning configuration such as `.gitleaks.toml`.
2. Decide whether to scan working tree content, git history, or both based on repository size and existing conventions.
3. Create or update a workflow that fits the repo's trigger patterns.
4. Do not add noisy allowlists unless the repository already has a clear pattern.
5. Prefer failing the workflow on verified findings unless the repo already uses soft-fail security gates.
6. Summarize exactly what was changed.

## Output standard

Return:
- workflow file path
- scan mode used
- whether a config file was added or reused
- triggers configured
- any repo-specific caveats
