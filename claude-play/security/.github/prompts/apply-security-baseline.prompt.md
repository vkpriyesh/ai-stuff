---
mode: agent
description: Applies the repository security scanning baseline by using the security-suite prompt to add or update CodeQL, Semgrep, and Gitleaks in GitHub Actions.
tools:
  - codebase
  - githubRepo
  - readFile
  - createFile
  - editFile
---

Use the `security-suite.prompt.md` skill to inspect the current repository and implement the scanning baseline.
