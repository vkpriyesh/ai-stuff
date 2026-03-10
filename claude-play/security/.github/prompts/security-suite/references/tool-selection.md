# Tool selection notes

## CodeQL
Use for GitHub-native code scanning on supported languages.
Prefer the official GitHub CodeQL workflow structure.
Best when the repo already uses GitHub Advanced Security or GitHub code scanning.

## Semgrep
Use for additional app-layer SAST coverage and faster custom rules.
Prefer Semgrep SARIF output when integrating with GitHub code scanning.
If the project already uses Semgrep AppSec Platform, preserve the existing login/auth model.

## Gitleaks
Use for secret scanning in source history and current files.
Keep configuration simple unless a `.gitleaks.toml` already exists.
If the repo already has an allowlist or baseline, preserve that pattern instead of replacing it.
