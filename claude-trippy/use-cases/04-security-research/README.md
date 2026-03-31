# 04 - Security Research

Understanding Claude Code's security model for authorized testing, auditing, and defense.

---

## Overview

Claude Code implements a multi-layered security model:

1. **Permission framework** - 4 modes, classifiers, rule matching
2. **Bash classifier** - auto-approval of safe commands, blocking dangerous ones
3. **YOLO classifier** - transcript-based security analysis
4. **Filesystem sandbox** - restrict file access to project directory
5. **Tool-level permissions** - per-tool allow/deny rules
6. **Prompt injection defense** - system-reminder handling, flag-and-alert
7. **Hook-based security** - custom validation before/after tool execution

---

## Deep-Dive Documents

| Document | Content |
|----------|---------|
| [Permission Model Deep Dive](./permission-model.md) | How permissions are evaluated, classified, and enforced |
| [Attack Surface Analysis](./attack-surface.md) | Injection points, bypass patterns, and defense mechanisms |
| [Building Security Hooks](./security-hooks.md) | Create custom security controls using the hook system |
