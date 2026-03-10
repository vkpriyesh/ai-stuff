---
mode: agent
description: Adds or updates a GitHub Actions CodeQL workflow for supported languages in an existing repository. Use when the repository needs GitHub native code scanning or CodeQL modernization.
tools:
  - codebase
  - githubRepo
  - readFile
  - createFile
  - editFile
---

Add or update CodeQL in this repository.

## Required steps

1. Inspect existing `.github/workflows/` files for CI patterns, build commands, branch filters, and any current CodeQL setup.
2. Identify the repository language set from the codebase and existing CI.
3. Create or update a CodeQL workflow that fits the existing repository style.
4. If the repo requires a custom build, do not rely on `autobuild`. Reuse the real build steps.
5. Ensure permissions include what CodeQL needs, especially security events upload.
6. Avoid introducing a second overlapping CodeQL workflow.
7. Summarize exactly what was changed.

## Output standard

Return:
- workflow file path
- languages configured
- triggers configured
- whether autobuild or custom build is used
- any repo-specific risks or follow-ups
