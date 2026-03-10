# Project conventions for security automation

When adding or changing security scanning in this repository:

- Prefer GitHub Actions workflows under `.github/workflows/`.
- Prefer SARIF output when supported so findings can surface in GitHub code scanning.
- Do not silently overwrite existing CI conventions.
- Reuse existing workflow names, triggers, matrices, and caching patterns when reasonable.
- Keep secrets out of source control and out of workflow logs.
- When tool versions are pinned in this repo, preserve the repo's pinning style.
- After changes, validate YAML syntax and look for obvious duplication or trigger conflicts.
