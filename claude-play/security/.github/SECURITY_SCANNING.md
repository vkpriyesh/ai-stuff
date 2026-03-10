# Security Scanning Setup Guide

This repository uses three automated security scanning tools that run as GitHub Actions workflows. This guide explains how to enable, configure, and act on findings from each tool.

---

## Table of Contents

1. [Overview](#overview)
2. [GitHub Prerequisites](#github-prerequisites)
3. [Semgrep](#semgrep)
4. [Gitleaks](#gitleaks)
5. [Viewing Findings](#viewing-findings)
6. [Suppressing False Positives](#suppressing-false-positives)
7. [Required Secrets Reference](#required-secrets-reference)

---

## Overview

| Tool | Purpose | Findings surface in |
|------|---------|---------------------|
| **Semgrep** | SAST — fast rule-based scanning (OWASP, supply chain, secrets-in-code) | CI workflow logs (job fails on findings) |
| **Gitleaks** | Secret scanning — detects hardcoded credentials in commits and working tree | CI workflow logs + PR status check |

> **Note:** CodeQL is not included because it requires GitHub Advanced Security, which is unavailable on the free plan for private repositories.

Both workflows share the same triggers: `push` and `pull_request` targeting `main`/`master`.

---

## GitHub Prerequisites

No special GitHub plan features are required. Both workflows use only `GITHUB_TOKEN`, which is provided automatically.

### Branch protection (recommended)

Add the following as **required status checks** on your default branch under **Settings → Branches → Branch protection rules**:

- `Semgrep SAST` — Semgrep
- `Secret Scanning` — Gitleaks

---

## Semgrep

**Workflow file:** [`.github/workflows/semgrep.yml`](.github/workflows/semgrep.yml)

### What it does

- Runs `semgrep scan --config auto` which selects matching rulesets from the [Semgrep Registry](https://semgrep.dev/r) based on the detected language stack (TypeScript, React)
- Prints findings to the workflow log and **fails the job** if any issues are found
- No GitHub Advanced Security required — works on private repos with a free plan

### Open-source usage (no account needed)

Without a `SEMGREP_APP_TOKEN` the workflow runs entirely against public OSS rules. No Semgrep account is required.

### Semgrep AppSec Platform (optional)

If you want findings tracked on [semgrep.dev](https://semgrep.dev/):

1. Create a free account at <https://semgrep.dev>
2. Go to **Settings → Tokens** and create an agent token
3. In your GitHub repository go to **Settings → Secrets and variables → Actions**
4. Add a secret named `SEMGREP_APP_TOKEN` with the token value

The workflow already reads `secrets.SEMGREP_APP_TOKEN` — no workflow changes needed.

### Custom rules

Add a `.semgrep/` directory with `.yml` rule files and reference them:

```yaml
run: semgrep scan --config auto --config .semgrep/ --text
```

### Ignoring findings inline

```typescript
// nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml
element.innerHTML = sanitisedHtml;
```

Or add a `.semgrepignore` file (uses `.gitignore` syntax):

```
src/components/ui/
**/*.test.ts
```

---

## Gitleaks

**Workflow file:** [`.github/workflows/gitleaks.yml`](.github/workflows/gitleaks.yml)

### What it does

- Checks out the repository with **full git history** (`fetch-depth: 0`)
- Scans all commits and the current working tree for hardcoded credentials, API keys, tokens, and other secrets using Gitleaks' built-in ruleset
- Fails the workflow (blocking merge) if verified findings are detected
- Posts a status check to the PR

### No additional setup required

Uses `GITHUB_TOKEN` (automatically provided by GitHub Actions). No external account is needed.

### Gitleaks Teams / Enterprise (optional)

If your organisation has a Gitleaks licence:

1. Add a repository secret named `GITLEAKS_LICENSE` with the licence key
2. Uncomment the line in the workflow:
   ```yaml
   GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
   ```

### Baseline / allowlist for false positives

Create a `.gitleaks.toml` in the repository root. Only add entries for confirmed false positives to avoid masking real leaks:

```toml
[allowlist]
  description = "Project-level allowlist"
  # Allowlist by regex on the secret value
  regexes = [
    "PLACEHOLDER",
    "example\\.com"
  ]
  # Allowlist by file path
  paths = [
    "ref/refInstruct.md"
  ]
  # Allowlist a specific git commit SHA (use sparingly)
  commits = []
```

### Reducing scan scope for large histories

To scan only the working tree (faster, loses historical coverage):

```yaml
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    # Scan working tree only, not git history
    args: detect --no-git
```

---

## Viewing Findings

### Semgrep — CI logs

1. Go to the **Actions** tab → select the failed `Semgrep SAST` run
2. Open the `Semgrep SAST` job and expand the **Run Semgrep** step
3. Findings are printed in this format:

```
  src/integrations/supabase/client.ts
     typescript.react.security.audit.react-href-inject.react-href-inject
        Found href with user-supplied data. ...
        Line 12
```

The job exits non-zero when findings are present, blocking merge if the check is required.

### Gitleaks — CI logs and PR checks

Gitleaks findings appear in:

- The **Actions** tab → workflow run → `Secret Scanning` job logs
- The PR status check (red ✗ with a summary)

Look for lines like:

```
Finding:     <matched secret value>
Secret:      <redacted>
RuleID:      <rule name>
File:        src/integrations/supabase/client.ts
Line:        5
```

---

## Suppressing False Positives

### Semgrep

Add `// nosemgrep` or `// nosemgrep: <rule-id>` on the offending line, or add to `.semgrepignore`.

### Gitleaks

Add an allowlist entry to `.gitleaks.toml` (see [Baseline / allowlist](#baseline--allowlist-for-false-positives) above). Prefer path or commit-based entries over broad regex allowlists.

---

## Required Secrets Reference

| Secret | Tool | Required | Where to set |
|--------|------|----------|--------------|
| `GITHUB_TOKEN` | All | Automatic | GitHub provides this automatically — no action needed |
| `SEMGREP_APP_TOKEN` | Semgrep | Optional | Repo Settings → Secrets and variables → Actions |
| `GITLEAKS_LICENSE` | Gitleaks | Optional (Teams/Enterprise only) | Repo Settings → Secrets and variables → Actions |

No secrets need to be created for basic operation. The workflows will run with full functionality for a public repository using only the automatic `GITHUB_TOKEN`.
