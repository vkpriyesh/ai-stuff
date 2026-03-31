# Workflow Automation Recipes

Ready-to-use hook configurations for common workflows.

---

## Recipe 1: Auto-Format After Edit

Automatically run Prettier/Black/gofmt after Claude edits a file.

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": { "tool_name": "Edit|Write" },
      "command": "node .claude/hooks/auto-format.js"
    }]
  }
}
```

**.claude/hooks/auto-format.js:**
```javascript
const { execSync } = require('child_process');
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const filePath = data.input?.file_path;

if (!filePath) process.exit(0);

const ext = filePath.split('.').pop();
const formatters = {
  js: `npx prettier --write "${filePath}"`,
  ts: `npx prettier --write "${filePath}"`,
  tsx: `npx prettier --write "${filePath}"`,
  jsx: `npx prettier --write "${filePath}"`,
  py: `black "${filePath}"`,
  go: `gofmt -w "${filePath}"`,
  rs: `rustfmt "${filePath}"`,
};

if (formatters[ext]) {
  try { execSync(formatters[ext], { stdio: 'pipe' }); }
  catch (e) { /* formatting failed, not critical */ }
}
```

---

## Recipe 2: Auto-Test After Changes

Run relevant tests after file modifications.

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": { "tool_name": "Edit|Write" },
      "command": "node .claude/hooks/auto-test.js"
    }]
  }
}
```

**.claude/hooks/auto-test.js:**
```javascript
const { execSync } = require('child_process');
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const filePath = data.input?.file_path || '';

// Skip test files themselves
if (filePath.includes('.test.') || filePath.includes('.spec.')) process.exit(0);

// Find matching test file
const testFile = filePath
  .replace('/src/', '/tests/')
  .replace('.ts', '.test.ts')
  .replace('.js', '.test.js');

try {
  const { existsSync } = require('fs');
  if (existsSync(testFile)) {
    execSync(`npx jest "${testFile}" --silent 2>&1`, { timeout: 30000 });
    console.log(`Tests passed: ${testFile}`);
  }
} catch (e) {
  console.error(`Tests FAILED: ${testFile}`);
  process.exit(2); // Show to model so it can fix
}
```

---

## Recipe 3: Git Pre-Commit Validation

Validate before any git commit.

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": { "tool_name": "Bash", "command": ".*git commit.*" },
      "command": "node .claude/hooks/pre-commit-check.js"
    }]
  }
}
```

**.claude/hooks/pre-commit-check.js:**
```javascript
const { execSync } = require('child_process');

try {
  // Run linter
  execSync('npx eslint . --quiet', { stdio: 'pipe' });
  
  // Run type check
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  
  // Check for console.log
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
  for (const file of staged.trim().split('\n')) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = require('fs').readFileSync(file, 'utf-8');
      if (content.includes('console.log')) {
        console.error(`WARNING: console.log found in ${file}`);
      }
    }
  }
} catch (e) {
  console.error('Pre-commit checks failed. Fix issues before committing.');
  process.exit(2);
}
```

---

## Recipe 4: Slack Notification on Session End

```json
{
  "hooks": {
    "SessionEnd": [{
      "matcher": {},
      "command": "node .claude/hooks/slack-notify.js"
    }]
  }
}
```

**.claude/hooks/slack-notify.js:**
```javascript
const https = require('https');
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));

const webhook = process.env.SLACK_WEBHOOK_URL;
if (!webhook) process.exit(0);

const payload = JSON.stringify({
  text: `Claude Code session ended: ${data.reason || 'user exit'}`,
});

const url = new URL(webhook);
const req = https.request({
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
}, () => process.exit(0));
req.write(payload);
req.end();
```

---

## Recipe 5: Audit Log

Log every tool call to a file for compliance.

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": {},
      "command": "node .claude/hooks/audit.js"
    }]
  }
}
```

**.claude/hooks/audit.js:**
```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(0, 'utf-8'));

const entry = {
  timestamp: new Date().toISOString(),
  tool: data.tool_name,
  input: data.input,
  success: !data.response?.isError,
};

fs.appendFileSync('.claude/audit.jsonl', JSON.stringify(entry) + '\n');
```

---

## Recipe 6: Prevent Modifications to Protected Files

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": { "tool_name": "Edit|Write" },
      "command": "node .claude/hooks/protect-files.js"
    }]
  }
}
```

**.claude/hooks/protect-files.js:**
```javascript
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const filePath = data.input?.file_path || '';

const PROTECTED = [
  /\.env/,
  /secrets?\./,
  /credentials/,
  /\.pem$/,
  /\.key$/,
  /production\.config/,
  /\/migrations\/.*\.sql$/,
];

for (const pattern of PROTECTED) {
  if (pattern.test(filePath)) {
    console.error(`BLOCKED: ${filePath} is a protected file`);
    process.exit(2);
  }
}
```
