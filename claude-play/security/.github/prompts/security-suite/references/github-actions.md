# GitHub Actions implementation guidance

## General
- Prefer `pull_request` and `push` to the default branch for scanning.
- Keep `permissions` minimal.
- Reuse the repo's branch naming and path filters if they already exist.

## CodeQL
- Use `security-events: write` permission.
- Use matrix language detection only if it matches the repository stack.
- Avoid forcing autobuild if the repo needs a custom build step.

## Semgrep
- Use SARIF output and upload to GitHub code scanning when the repo wants findings in GitHub Security.
- If SARIF upload is not used, clearly state that findings remain in CI logs or Semgrep platform.

## Gitleaks
- Run on pull requests and default-branch pushes.
- Prefer explicit exit behavior.
- If scanning git history is too slow for the repo, scan the workspace first and document the tradeoff.
