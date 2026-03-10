---
mode: agent
description: Adds or updates GitHub Actions based security scanning for existing repositories using CodeQL, Semgrep, and Gitleaks. Use when a project needs SAST, secret scanning, or a security CI baseline in GitHub pipelines.
tools:
  - codebase
  - githubRepo
  - readFile
  - createFile
  - editFile
---

Use this skill to add a practical security scanning baseline to an existing project.

## Goal

Implement or update GitHub pipeline based scanning with:
- CodeQL for code scanning
- Semgrep for fast rule-based SAST
- Gitleaks for secret detection

## Workflow

Copy this checklist and keep it updated while working:

```text
Security Suite Progress:
- [ ] Inspect existing GitHub Actions and repository language stack
- [ ] Decide whether to add new workflows or extend existing ones
- [ ] Add or update CodeQL workflow
- [ ] Add or update Semgrep workflow
- [ ] Add or update Gitleaks workflow
- [ ] Validate triggers, permissions, paths, and output formats
- [ ] Summarize what changed and any repo-specific follow-ups
```

## Operating rules

1. Read existing `.github/workflows/` files first.
2. Reuse existing CI trigger patterns unless they are clearly broken.
3. Prefer separate workflow files unless the repository already centralizes security jobs into one workflow.
4. Avoid duplicate scans that fire on the same events unless the repo explicitly wants that.
5. Prefer official actions or the vendor-maintained action where practical.
6. Prefer SARIF upload for CodeQL and Semgrep when available.
7. For Gitleaks, fail the build on verified findings unless the repo already uses soft-fail security gates.
8. Do not invent ignore rules or baselines unless the repo already has them or the user asked for them.

## Delegation

Use the child prompts in this directory when implementing each scanner:

* `security-codeql.prompt.md`
* `security-semgrep.prompt.md`
* `security-gitleaks.prompt.md`

Read these references only when needed:

* [Tool selection notes](.github/prompts/security-suite/references/tool-selection.md)
* [GitHub Actions guidance](.github/prompts/security-suite/references/github-actions.md)
* [Validation checklist](.github/prompts/security-suite/references/validation-checklist.md)

## Deliverable

After implementation, provide:

* files created or modified
* triggers added
* permissions required
* whether findings surface in GitHub Security or as plain CI logs
* any repo-specific caveats
