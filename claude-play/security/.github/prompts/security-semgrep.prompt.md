---
mode: agent
description: Adds or updates a GitHub Actions Semgrep workflow for an existing repository. Use when the repository needs fast rule based application security scanning or supplemental SAST beyond CodeQL.
tools:
  - codebase
  - githubRepo
  - readFile
  - createFile
  - editFile
---

Add or update Semgrep in this repository.

## Required steps

1. Inspect existing workflows and security tooling first.
2. Determine whether Semgrep results should appear in GitHub code scanning via SARIF or remain in CI logs or Semgrep platform.
3. Create or update a workflow using the repo's trigger conventions.
4. Avoid inventing authentication or Semgrep AppSec Platform integration unless the repo already has it or the user explicitly wants it.
5. Keep configuration minimal and repository-aware.
6. Avoid duplicate scans on the same event if another workflow already covers the same scope.
7. Summarize exactly what was changed.

## Output standard

Return:
- workflow file path
- whether SARIF upload is configured
- whether login or token setup is required
- triggers configured
- any repo-specific caveats
