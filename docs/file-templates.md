# File Templates

Exact content for every generated file. Placeholders use `{{variable}}` syntax.
Conditional blocks use `{{#if condition}}...{{/if}}`.
The generation engine (src/generators/templates/) converts these to TypeScript functions.

---

## 1. CLAUDE.md (always generated)

```markdown
# Project: {{projectName}}

{{projectDescription}}

## Commands
{{#if language === 'python'}}
- `pip install -r requirements.txt` — install dependencies
- `python -m pytest` — run all tests
- `python -m pytest -x` — stop on first failure
- `ruff check .` — run linter
{{/if}}
{{#if language === 'javascript'}}
- `npm install` — install dependencies
- `npm test` — run all tests
- `npm run lint` — run linter
- `npm run dev` — start dev server
- `npm run build` — production build
{{/if}}
{{#if language === 'both'}}
- `pip install -r requirements.txt` — install Python deps
- `npm install` — install JS deps
- `python -m pytest` — run Python tests
- `npm test` — run JS tests
- `ruff check .` — Python linter
- `npm run lint` — JS linter
{{/if}}
{{#if language === 'other' || language === 'not_sure'}}
- Configure your build, test, and lint commands here
{{/if}}

## Architecture
{{#each architectureEntries}}
- `{{path}}` — {{purpose}}
{{/each}}
{{#if hasDatabase}}
- `db/` — database migrations and schema
{{/if}}
{{#if hasFrontend}}
- `src/` or `frontend/` — user-facing application
{{/if}}

## Behavioral Rules

### Debugging Discipline
- When a test fails, read the ENTIRE error message before proposing a fix
- After 2 failed fix attempts on the same issue, STOP. Summarize what you tried, what happened, and your current hypothesis. Ask for guidance.
- Never "fix" a test by changing the test to match broken behavior
- Do not guess at fixes — trace the actual execution path

### Scope Control
- Only modify files directly related to the stated task
- If you discover a bug in unrelated code, NOTE it but do NOT fix it
- If the task says "fix X in file Y", do not also refactor file Y

### Implementation Discipline
- Before modifying any function, state what it currently does
- Make the smallest change that solves the problem
- Run tests after every change
- If a change requires modifying more than 3 files, present a plan first
- Commit working changes before attempting risky refactors

### Git Discipline
- Commit after every completed task: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Never work on uncommitted changes — commit or stash first
- Before any risky change, make a safety commit
{{#if isTeam}}
- Use feature branches for all work. Never push directly to main.
{{/if}}
{{#if hasVPS}}
- After deploying to server, verify local and server are in sync
- Never deploy via inline SSH commands — use the deploy workflow
{{/if}}

## Protected Files — DO NOT MODIFY
- `.env` / `.env.*` — environment configuration
{{#if language === 'javascript'}}
- `package-lock.json` — dependency lockfile
{{/if}}
{{#if language === 'python'}}
- `requirements.txt` — pinned dependencies (add new deps, don't modify existing pins)
{{/if}}
{{#if hasDatabase}}
- `migrations/` — committed migrations (create NEW migrations instead)
{{/if}}

If you need to change a protected file, STOP and explain why before proceeding.

{{#if designPrinciples.includes('security')}}
## Security Rules
- Always validate user input before processing
- Never trust client-side data without server verification
- Use parameterized queries for all database operations
- Never log sensitive data (passwords, tokens, API keys)
- Never commit secrets — use environment variables
{{/if}}

## Self-Maintenance
- When this file exceeds ~150 lines, extract operational detail into .claude/CLAUDE.md and convert this to a routing index
- When you accumulate >10 project-specific gotchas, create .claude/skills/{{projectSlug}}/SKILL.md
```

---

## 2. .claude/settings.json (always generated)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      {{#if language === 'python'}}
      "Bash(python -m pytest *)",
      "Bash(ruff *)",
      "Bash(pip install *)",
      {{/if}}
      {{#if language === 'javascript'}}
      "Bash(npm run *)",
      "Bash(npm test *)",
      "Bash(npx *)",
      {{/if}}
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git status)",
      "Bash(git branch *)",
      "Bash(git checkout *)",
      "Bash(* --version)",
      "Bash(* --help *)",
      "Read(*)"
    ],
    "deny": [
      "Bash(git push --force *)",
      "Bash(rm -rf /)",
      "Bash(rm -rf ~)",
      "Bash(curl * | bash)",
      "Bash(wget * | bash)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\""
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/pre-bash-firewall.sh\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/pre-commit-check.sh\""
          }
        ]
      }
    ]
  }
}
```

**Additional hooks wired when questionnaire triggers them:**

```json
// If VPS: add to PostToolUse array
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/post-deploy-sync.sh\""
    }
  ]
}

// If protected files hook generated: add to PreToolUse array
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/protect-files.sh\""
    }
  ]
}
```

---

## 3. .claude/hooks/session-start.sh (always generated)

```bash
#!/bin/bash
# session-start.sh — fires on SessionStart
# Outputs become Claude Code's initial context
set -euo pipefail

echo "=== SESSION CONTEXT ==="
echo ""

# Git status
echo "## Git Status"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'not a git repo')"
git status --short 2>/dev/null | head -20 || true
echo ""

# Uncommitted changes warning
if ! git diff --quiet 2>/dev/null; then
  echo "⚠️ WARNING: Uncommitted changes from previous session"
  git diff --name-only 2>/dev/null | head -10
  echo ""
fi

# Recent commits
echo "## Recent Commits"
git log --oneline -5 2>/dev/null || true
echo ""

# Load handoff log if it exists
if [ -f "docs/handoff-log.md" ] && [ -s "docs/handoff-log.md" ]; then
  echo "## Last Handoff Notes"
  tail -30 "docs/handoff-log.md"
  echo ""
fi

# --- Growth checks (non-blocking warnings) ---

# CLAUDE.md size check
CLAUDE_LINES=$(wc -l < "CLAUDE.md" 2>/dev/null || echo 0)
if [ "$CLAUDE_LINES" -gt 150 ]; then
  echo "⚠️ CLAUDE.md is $CLAUDE_LINES lines — check Self-Maintenance instructions for splitting"
fi

# Module count check
MODULE_COUNT=$(find . -maxdepth 2 -name '*.py' -o -name '*.ts' -o -name '*.js' | xargs -I{} dirname {} | sort -u | wc -l 2>/dev/null || echo 0)
if [ "$MODULE_COUNT" -gt 5 ]; then
  echo "ℹ️ Project has $MODULE_COUNT source directories — consider creating docs/architecture.md if it doesn't exist"
fi

{{#if hasFrontend}}
# Frontend file changes in recent commits
FRONTEND_CHANGES=$(git log --oneline -10 --name-only 2>/dev/null | grep -cE '\.(tsx|jsx|css|html|vue|svelte)$' || true)
if [ "$FRONTEND_CHANGES" -gt 15 ]; then
  echo "ℹ️ Heavy frontend activity ($FRONTEND_CHANGES files in last 10 commits) — consider .claude/rules/frontend.md"
fi
{{/if}}

{{#if hasVPS}}
# --- VPS checks ---

# Start SSH tunnels if configured
{{#if sshAddress}}
# Tunnel for MCP servers (add ports as needed)
# ssh -f -N -L 15432:localhost:5432 {{sshAddress}} 2>/dev/null || echo "⚠️ SSH tunnel failed — MCP servers may not connect"
{{/if}}

# Check local/remote sync
LOCAL_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
echo "## Sync Status"
echo "Local HEAD: $LOCAL_HEAD"
echo "Run 'git push' if behind remote"
{{/if}}

echo ""
echo "=== END SESSION CONTEXT ==="
exit 0
```

---

## 4. .claude/hooks/pre-commit-check.sh (always generated)

```bash
#!/bin/bash
# pre-commit-check.sh — fires on PostToolUse for Bash
# Only activates when git commit is detected
# Enforces: tests pass + docs updated
set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# Only trigger on git commit commands
if ! echo "$CMD" | grep -q 'git commit'; then
  exit 0
fi

# Prevent infinite loop
if [ "${CLAUDE_STOP_HOOK_ACTIVE:-}" = "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
ERRORS=""

# --- Gate 1: Tests must pass ---
{{#if language === 'python'}}
if [ -f "$PROJECT_DIR/pyproject.toml" ] || [ -f "$PROJECT_DIR/pytest.ini" ] || [ -f "$PROJECT_DIR/requirements.txt" ]; then
  if ! python -m pytest --quiet -x 2>/dev/null; then
    ERRORS="${ERRORS}\n❌ Python tests are failing. Fix before committing."
  fi
fi
{{/if}}
{{#if language === 'javascript'}}
if [ -f "$PROJECT_DIR/package.json" ]; then
  if ! npm test --silent 2>/dev/null; then
    ERRORS="${ERRORS}\n❌ Tests are failing. Fix before committing."
  fi
fi
{{/if}}
{{#if language === 'both'}}
if [ -f "$PROJECT_DIR/pyproject.toml" ] || [ -f "$PROJECT_DIR/pytest.ini" ]; then
  if ! python -m pytest --quiet -x 2>/dev/null; then
    ERRORS="${ERRORS}\n❌ Python tests are failing. Fix before committing."
  fi
fi
if [ -f "$PROJECT_DIR/package.json" ]; then
  if ! npm test --silent 2>/dev/null; then
    ERRORS="${ERRORS}\n❌ JS tests are failing. Fix before committing."
  fi
fi
{{/if}}

# --- Gate 2: Docs updated if code changed ---
CHANGED=$(git diff --cached --name-only 2>/dev/null || true)
CODE_CHANGES=$(echo "$CHANGED" | grep -E '\.(py|ts|tsx|js|jsx)$' | grep -v '^tests/' || true)

if [ -n "$CODE_CHANGES" ]; then
  # Check if feature inventory or handoff log was updated
  DOCS_UPDATED=$(echo "$CHANGED" | grep -E 'docs/(feature-inventory|handoff-log)' || true)
  if [ -z "$DOCS_UPDATED" ]; then
    ERRORS="${ERRORS}\n⚠️ Code changed but docs/feature-inventory.md or docs/handoff-log.md not updated. Update before committing."
  fi
fi

# --- Report ---
if [ -n "$ERRORS" ]; then
  echo -e "$ERRORS" >&2
  exit 2
fi

exit 0
```

---

## 5. .claude/hooks/pre-bash-firewall.sh (always generated)

```bash
#!/bin/bash
# pre-bash-firewall.sh — fires on PreToolUse for Bash
# Blocks dangerous commands before execution
set -euo pipefail

CMD=$(jq -r '.tool_input.command // ""')

DENY_PATTERNS=(
  'rm\s+-rf\s+/'
  'rm\s+-rf\s+~'
  'git\s+reset\s+--hard'
  'git\s+push.*--force'
  'curl.*\|\s*bash'
  'wget.*\|\s*bash'
  'chmod\s+777'
  'dd\s+if='
  '>\s*/dev/sd'
  'mkfs\.'
)

for pat in "${DENY_PATTERNS[@]}"; do
  if echo "$CMD" | grep -Eiq "$pat"; then
    echo "❌ Blocked: matches dangerous pattern '$pat'. Use a safer alternative." >&2
    exit 2
  fi
done

exit 0
```

---

## 6. .mcp.json (always generated)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
    {{#if perplexity}}
    ,
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server@latest"],
      "env": {
        "PERPLEXITY_API_KEY": "{{perplexityApiKey || 'TODO_ADD_YOUR_KEY'}}"
      }
    }
    {{/if}}
    {{#if playwright}}
    ,
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-playwright@latest"]
    }
    {{/if}}
    {{#if postgres}}
    ,
    "postgres": {
      "command": "npx",
      "args": ["-y", "@crystaldba/postgres-mcp@latest"],
      "env": {
        "DATABASE_URL": "{{postgresConnectionString || 'TODO_ADD_YOUR_CONNECTION_STRING'}}"
      }
    }
    {{/if}}
    {{#if shell}}
    ,
    "shell": {
      "command": "npx",
      "args": ["-y", "ssh-mcp@latest"],
      "env": {
        "SSH_HOST": "{{sshAddress || 'TODO_ADD_YOUR_SSH_ADDRESS'}}"
      }
    }
    {{/if}}
  }
}
```

---

## 7. docs/development-queue.md (always generated, seeded from goals)

```markdown
# Development Queue

> {{projectDescription}}
> Problem: {{problemStatement}}

## Current Sprint

### 1. {{goal1Title}}
**Status:** PENDING
**Priority:** High

**Scope:**
{{goal1Description}}

**Acceptance Criteria:**
{{goal1AcceptanceCriteria}}

**Recovery (if something breaks):**
- Check git log for last known good commit
- Revert with `git checkout <commit>` if needed
- Re-read CLAUDE.md before retrying

---

{{#if goal2}}
### 2. {{goal2Title}}
**Status:** PENDING
**Priority:** Medium

**Scope:**
{{goal2Description}}

**Recovery:**
- Check git log for last known good commit

---
{{/if}}

{{#if goal3}}
### 3. {{goal3Title}}
**Status:** PENDING
**Priority:** Medium

**Scope:**
{{goal3Description}}

**Recovery:**
- Check git log for last known good commit

---
{{/if}}

{{#if goal4}}
### 4. {{goal4Title}}
**Status:** PENDING
**Priority:** Medium

**Scope:**
{{goal4Description}}

**Recovery:**
- Check git log for last known good commit

---
{{/if}}

## Completed
(Tasks move here when done)

## Task Template

Copy this for new tasks:

### N. Task Title
**Status:** PENDING | IN PROGRESS | DONE | BLOCKED
**Priority:** Critical | High | Medium | Low
**Scope:** What needs doing
**Acceptance Criteria:** What "done" looks like
**Recovery:** If resuming mid-task: (1) read these files, (2) check this state, (3) most likely failure point is X
```

---

## 8. docs/philosophy.md (always generated, seeded from questionnaire)

```markdown
# {{projectName}} — Design Philosophy

## What This Is
{{projectDescription}}

## Problem Statement
{{problemStatement}}

## Design Principles (ranked)
{{#each designPrinciples}}
{{@index + 1}}. **{{this.label}}** — {{this.description}}
{{/each}}

{{#if antiPatterns}}
## Anti-Patterns — What We Will NOT Do
{{antiPatterns}}
{{/if}}

## Decision Log
Record significant design decisions here as the project evolves.

| Date | Decision | Rationale |
|------|----------|-----------|
| {{today}} | Project created with Praton Launchpad | Initial scaffold |
```

Design principle descriptions per selection:

| Selection | description value |
|-----------|------------------|
| Simplicity | Prefer simple, readable solutions over clever ones. Remove before adding. |
| Speed | Optimize for performance. Profile before optimizing. Measure after. |
| Security | Validate all inputs. Trust nothing from the client. Encrypt sensitive data. |
| Scalability | Design for horizontal scaling. Avoid shared mutable state. |
| User Experience | Every user-facing change must be visually verified. UI consistency matters. |
| Reliability | Handle every error path. Prefer defensive coding. Fail gracefully. |
| Low Cost | Minimize API calls and external service usage. Cache aggressively. |
| Privacy | Never collect data you don't need. Encrypt at rest. Document data flows. |

---

## 9. docs/feature-inventory.md (always generated)

```markdown
# Feature Inventory

Track every feature: built, in progress, designed, or mentioned.

## Built (verified working)

| Feature | Date | Notes |
|---------|------|-------|
| Project scaffold | {{today}} | Generated by Praton Launchpad |

## In Progress

| Feature | Started | Status | Notes |
|---------|---------|--------|-------|
| {{goal1Title}} | — | PENDING | First task in queue |

## Designed (not yet built)

| Feature | Source | Notes |
|---------|--------|-------|
{{#if goal2}}
| {{goal2Title}} | Initial planning | Queued |
{{/if}}
{{#if goal3}}
| {{goal3Title}} | Initial planning | Queued |
{{/if}}
{{#if goal4}}
| {{goal4Title}} | Initial planning | Queued |
{{/if}}

## Mentioned (ideas, not yet designed)

| Feature | Source | Notes |
|---------|--------|-------|
```

---

## 10. docs/handoff-log.md (always generated, empty)

```markdown
# Handoff Log

Claude Code writes session notes here incrementally. Each entry captures what changed, what works, what's broken, and the exact next step.

---
```

---

## 11. .gitignore (always generated)

```
# Claude Code
CLAUDE.local.md
.claude/settings.local.json
.claude/agent-memory-local/
.mcp.json

# Environment
.env
.env.*
secrets/

{{#if language === 'python'}}
# Python
__pycache__/
*.pyc
*.pyo
.venv/
venv/
*.egg-info/
dist/
build/
.pytest_cache/
.ruff_cache/
{{/if}}

{{#if language === 'javascript'}}
# JavaScript/TypeScript
node_modules/
dist/
.next/
.nuxt/
.output/
coverage/
{{/if}}

{{#if language === 'both'}}
# Python
__pycache__/
*.pyc
.venv/
venv/
.pytest_cache/
.ruff_cache/

# JavaScript/TypeScript
node_modules/
dist/
.next/
coverage/
{{/if}}

# OS
.DS_Store
Thumbs.db
```

---

## 12. Launcher Scripts (always generated, OS-detected)

### Windows (.bat files)

**Start Claude Code.bat:**
```batch
@echo off
cd /d "%~dp0"
claude
pause
```

**Start Claude Code (Full Permissions).bat:**
```batch
@echo off
cd /d "%~dp0"
claude --dangerously-skip-permissions
pause
```

**Start Plan Mode.bat:**
```batch
@echo off
cd /d "%~dp0"
claude -p "Use plan mode. Read CLAUDE.md first. Then read docs/development-queue.md and present a plan for the next pending task. Do not make any changes until the plan is approved."
pause
```

**Check Costs.bat:**
```batch
@echo off
npx ccusage@latest
pause
```

### macOS (.command files)

**Start Claude Code.command:**
```bash
#!/bin/bash
cd "$(dirname "$0")"
claude
```

**Start Claude Code (Full Permissions).command:**
```bash
#!/bin/bash
cd "$(dirname "$0")"
claude --dangerously-skip-permissions
```

**Start Plan Mode.command:**
```bash
#!/bin/bash
cd "$(dirname "$0")"
claude -p "Use plan mode. Read CLAUDE.md first. Then read docs/development-queue.md and present a plan for the next pending task. Do not make any changes until the plan is approved."
```

**Check Costs.command:**
```bash
#!/bin/bash
npx ccusage@latest
```

### Linux (.sh files)
Same as macOS .command files but with `.sh` extension.

**Note:** macOS .command and Linux .sh files need `chmod +x`. The Getting Started PDF must mention this, or the zip builder sets the executable bit.

---

## 13. Claude Code Prompt Advisor.txt (always generated)

```
CLAUDE CODE PROMPT ADVISOR — {{projectName}}

You are helping someone write prompts for Claude Code, an AI coding assistant
that works on the following project. Use this context to write effective prompts.

PROJECT CONTEXT:
- Name: {{projectName}}
- Description: {{projectDescription}}
- Problem it solves: {{problemStatement}}
- Language: {{language}}
{{#if hasDatabase}}- Has database ({{databaseTypes.join(', ')}}){{/if}}
{{#if hasFrontend}}- Has user-facing frontend{{/if}}
{{#if hasVPS}}- Deployed to server via SSH{{/if}}
- Team: {{teamType}}

DESIGN PRINCIPLES:
{{#each designPrinciples}}
- {{this.label}}: {{this.description}}
{{/each}}

AI CAPABILITIES AVAILABLE:
{{#each capabilities}}
- {{this.name}}: {{this.description}}
{{/each}}

CURRENT TASKS:
{{#each goals}}
- {{this.title}} ({{this.status}})
{{/each}}

---

HOW TO WRITE EFFECTIVE CLAUDE CODE PROMPTS:

1. STRUCTURE: Goal + Context + Constraints + Exit Criteria
   Example: "Add user login. Use the existing auth module. Do NOT modify
   the database schema. Done when: login works, tests pass, no regressions."

2. WHEN TO USE PLAN MODE: Add "ultrathink" and "use plan mode" when you want
   analysis before action — diagnostics, architecture decisions, multi-module work.
   Example: "ultrathink — use plan mode. Diagnose why the API returns 500 on
   POST /users. Present root cause before proposing any fix."

3. WHEN TO USE DEFAULT MODE: Single file fixes, small features, wiring work.
   No special keywords needed.

4. THE DIAGNOSTIC PATTERN (use for bugs):
   Phase 1: "ultrathink — use plan mode. Do not make any changes until you
   present a diagnosis. Audit [system] end-to-end. Present root cause."
   Phase 2 (after reviewing diagnosis): "Implement the fix from your diagnosis."

5. ROTATION QUEUE (multiple tasks in one session):
   "Read CLAUDE.md first. Work through these tasks in order.
   For each: implement, run tests, confirm zero regressions, commit, move to next.
   
   ## Task 1: [Goal]
   [Context, where to wire, what it replaces]
   WHAT NOT TO TOUCH: [specific files]
   Done when: [acceptance criteria]
   
   ## Task 2: [Goal]
   ..."

6. WHAT NOT TO TOUCH: Always list protected files explicitly.
   "WHAT NOT TO TOUCH:
   ❌ src/auth/ — authentication is stable
   ❌ migrations/ — create new, don't modify existing
   ❌ .env — never read or modify"

7. AFTER EVERY SESSION: Claude Code updates docs/handoff-log.md automatically.
   Start next session with: "Read CLAUDE.md and docs/handoff-log.md. Continue
   from where the last session left off."

8. COMMON STARTER PROMPTS:
   - "Read CLAUDE.md and start working on the first pending task in docs/development-queue.md"
   - "What is the current state of the project? Summarize what's built, what's in progress, and what's next."
   - "Run all tests and report the results."
{{#if hasVPS}}
   - "Check server health: container status, recent logs, any errors."
{{/if}}
{{#if hasDatabase}}
   - "Read the database schema and verify it matches the code's assumptions."
{{/if}}
```

---

## Questionnaire-Driven Files

### .claude/rules/schema.md (if hasDatabase)

```markdown
---
paths:
  - "db/**"
  - "models/**"
  - "migrations/**"
  - "**/*schema*"
  - "**/*model*"
  - "**/*query*"
---
# Database Rules

- ALWAYS read the current schema before writing any query or migration
- Use parameterized queries — never concatenate user input into SQL
- Create NEW migrations — never modify existing committed migrations
- After any schema change, verify the migration runs cleanly on a fresh database
- Column names, table names, and types must match exactly — do not guess
```

### .claude/hooks/post-deploy-sync.sh (if hasVPS)

```bash
#!/bin/bash
# post-deploy-sync.sh — fires on PostToolUse for Bash
# Auto-commits and pushes after deployment to prevent VPS/local divergence
set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# Only trigger on deploy-related commands
if ! echo "$CMD" | grep -qE '(ssh|scp|rsync|deploy)'; then
  exit 0
fi

# Auto-commit any uncommitted changes
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  git add -A
  git commit -m "chore: sync after deploy" 2>/dev/null || true
fi

# Push to remote if configured
if git remote get-url origin >/dev/null 2>&1; then
  git push 2>/dev/null || echo "⚠️ Push failed — sync manually" >&2
fi

exit 0
```

### .claude/hooks/post-deploy-verify.sh (if hasVPS AND hasDatabase)

```bash
#!/bin/bash
# post-deploy-verify.sh — fires on PostToolUse for Bash
# Checks server health after deployment
set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# Only trigger on deploy-related commands
if ! echo "$CMD" | grep -qE '(ssh|scp|rsync|deploy)'; then
  exit 0
fi

echo "## Post-Deploy Verification"

{{#if sshAddress}}
# Check container/service health
ssh {{sshAddress}} "docker ps --format 'table {{{{.Names}}}}\t{{{{.Status}}}}'" 2>/dev/null || echo "⚠️ Could not check container status"

# Tail recent logs for errors
ssh {{sshAddress}} "docker logs --tail 20 \$(docker ps -q --filter name={{projectSlug}}) 2>/dev/null" | grep -iE '(error|exception|fatal)' || echo "✅ No recent errors in logs"
{{/if}}

exit 0
```

### .claude/hooks/pre-compact-handoff.sh (if hasVPS or complex)

```bash
#!/bin/bash
# pre-compact-handoff.sh — fires on PreCompact event
# Finalizes handoff notes before context window compression
set -euo pipefail

HANDOFF_FILE="docs/handoff-log.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

echo "" >> "$HANDOFF_FILE"
echo "---" >> "$HANDOFF_FILE"
echo "## Session Note — $TIMESTAMP (auto-generated before compaction)" >> "$HANDOFF_FILE"
echo "" >> "$HANDOFF_FILE"
echo "### Changed Files" >> "$HANDOFF_FILE"
git diff --name-only HEAD 2>/dev/null >> "$HANDOFF_FILE" || echo "(no git changes detected)" >> "$HANDOFF_FILE"
echo "" >> "$HANDOFF_FILE"
echo "### Recent Commits" >> "$HANDOFF_FILE"
git log --oneline -5 2>/dev/null >> "$HANDOFF_FILE" || echo "(no commits)" >> "$HANDOFF_FILE"
echo "" >> "$HANDOFF_FILE"
echo "### Open TODOs" >> "$HANDOFF_FILE"
grep -rn "TODO\|FIXME\|HACK" --include='*.py' --include='*.ts' --include='*.js' . 2>/dev/null | head -10 >> "$HANDOFF_FILE" || echo "(none found)" >> "$HANDOFF_FILE"
echo "" >> "$HANDOFF_FILE"

exit 0
```

### .claude/hooks/lint-on-save.sh (if language has linter)

```bash
#!/bin/bash
# lint-on-save.sh — fires on PostToolUse for Edit|Write
# Auto-lints changed files
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

{{#if language === 'python'}}
if [[ "$FILE_PATH" == *.py ]]; then
  ruff check --fix "$FILE_PATH" 2>/dev/null || true
fi
{{/if}}

{{#if language === 'javascript'}}
if [[ "$FILE_PATH" == *.ts ]] || [[ "$FILE_PATH" == *.tsx ]] || [[ "$FILE_PATH" == *.js ]] || [[ "$FILE_PATH" == *.jsx ]]; then
  npx prettier --write "$FILE_PATH" 2>/dev/null || true
fi
{{/if}}

exit 0
```

### .claude/hooks/protect-files.sh (if hasDatabase or user specified protected files)

```bash
#!/bin/bash
# protect-files.sh — fires on PreToolUse for Edit|Write
# Blocks edits to protected paths
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

PROTECTED_PATTERNS=(
  ".env"
{{#if language === 'javascript'}}
  "package-lock.json"
  "pnpm-lock.yaml"
{{/if}}
  ".git/"
  "node_modules/"
{{#if hasDatabase}}
  "migrations/"
{{/if}}
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "❌ Blocked: $FILE_PATH matches protected pattern '$pattern'. Do not modify without explicit approval." >&2
    exit 2
  fi
done

exit 0
```
