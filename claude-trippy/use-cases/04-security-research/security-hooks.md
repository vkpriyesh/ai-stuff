# Building Security Hooks

Create custom security controls using Claude Code's hook system.

---

## Hook Architecture

Hooks fire at tool lifecycle events. For security, the key hooks are:

| Hook | When | Security Use |
|------|------|-------------|
| **PreToolUse** | Before tool executes | Block dangerous operations |
| **PostToolUse** | After tool executes | Audit and flag suspicious results |
| **UserPromptSubmit** | User sends message | Validate user input |
| **PermissionDenied** | Auto-mode denies tool | Log and alert on blocked actions |

---

## Example 1: Command Firewall

Block dangerous bash commands:

**settings.json:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": { "tool_name": "Bash" },
      "command": "python .claude/hooks/command-firewall.py"
    }]
  }
}
```

**.claude/hooks/command-firewall.py:**
```python
import sys, json

BLOCKED_PATTERNS = [
    "rm -rf /",
    "rm -rf ~",
    "DROP TABLE",
    "DELETE FROM",
    "git push --force",
    "git reset --hard",
    "chmod 777",
    "curl | bash",
    "wget | sh",
    "> /dev/sda",
    "mkfs.",
    "dd if=",
]

data = json.load(sys.stdin)
command = data.get("input", {}).get("command", "")

for pattern in BLOCKED_PATTERNS:
    if pattern.lower() in command.lower():
        print(f"BLOCKED: Command contains dangerous pattern: {pattern}", file=sys.stderr)
        sys.exit(2)  # Exit 2 = block

sys.exit(0)  # Exit 0 = allow
```

---

## Example 2: File Access Audit

Log all file operations:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": { "tool_name": "Read|Edit|Write" },
      "command": "python .claude/hooks/file-audit.py"
    }]
  }
}
```

```python
import sys, json, datetime

data = json.load(sys.stdin)
tool = data.get("tool_name", "")
path = data.get("input", {}).get("file_path", "")
timestamp = datetime.datetime.now().isoformat()

with open(".claude/audit.log", "a") as f:
    f.write(f"{timestamp} | {tool} | {path}\n")

sys.exit(0)
```

---

## Example 3: Secrets Scanner

Scan tool results for leaked secrets:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": {},
      "command": "python .claude/hooks/secrets-scanner.py"
    }]
  }
}
```

```python
import sys, json, re

SECRET_PATTERNS = [
    r"(?i)(api[_-]?key|apikey)\s*[:=]\s*['\"]?[\w-]{20,}",
    r"(?i)(secret|password|passwd|pwd)\s*[:=]\s*['\"]?[\w-]{8,}",
    r"(?i)bearer\s+[\w-]{20,}",
    r"ghp_[a-zA-Z0-9]{36}",              # GitHub PAT
    r"sk-[a-zA-Z0-9]{48}",               # OpenAI key
    r"AKIA[0-9A-Z]{16}",                 # AWS access key
    r"-----BEGIN (RSA |EC )?PRIVATE KEY-----",
]

data = json.load(sys.stdin)
response = json.dumps(data.get("response", ""))

for pattern in SECRET_PATTERNS:
    if re.search(pattern, response):
        print(f"WARNING: Possible secret detected in tool output", file=sys.stderr)
        sys.exit(2)  # Show warning to model

sys.exit(0)
```

---

## Example 4: Network Request Validator

Block requests to internal/sensitive URLs:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": { "tool_name": "WebFetch" },
      "command": "python .claude/hooks/url-validator.py"
    }]
  }
}
```

```python
import sys, json
from urllib.parse import urlparse

BLOCKED_HOSTS = [
    "localhost", "127.0.0.1", "0.0.0.0",
    "169.254.169.254",  # AWS metadata
    "metadata.google.internal",
    "internal.", ".local", ".internal",
]

data = json.load(sys.stdin)
url = data.get("input", {}).get("url", "")
host = urlparse(url).hostname or ""

for blocked in BLOCKED_HOSTS:
    if host == blocked or host.endswith(blocked):
        print(f"BLOCKED: Access to {host} is not allowed", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
```

---

## Layering Hooks for Defense-in-Depth

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": { "tool_name": "Bash" }, "command": "python .claude/hooks/command-firewall.py" },
      { "matcher": { "tool_name": "WebFetch" }, "command": "python .claude/hooks/url-validator.py" },
      { "matcher": { "tool_name": "Write|Edit" }, "command": "python .claude/hooks/path-validator.py" }
    ],
    "PostToolUse": [
      { "matcher": {}, "command": "python .claude/hooks/secrets-scanner.py" },
      { "matcher": {}, "command": "python .claude/hooks/file-audit.py" }
    ]
  }
}
```

Multiple hooks can fire for the same event. All must pass (exit 0) for the operation to proceed.
