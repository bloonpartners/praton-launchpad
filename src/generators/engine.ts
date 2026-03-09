import type { WizardData } from '../types/wizard'
import { generatePromptAdvisor } from './templates/promptAdvisor'

export interface GeneratedFile {
  name: string
  content: string
}

const today = new Date().toISOString().split('T')[0]

function languageCommands(lang: string): string {
  switch (lang) {
    case 'python':
      return `- \`pip install -r requirements.txt\` — install dependencies
- \`python -m pytest\` — run all tests
- \`python -m pytest -x\` — stop on first failure
- \`ruff check .\` — run linter`
    case 'javascript':
      return `- \`npm install\` — install dependencies
- \`npm test\` — run all tests
- \`npm run lint\` — run linter
- \`npm run dev\` — start dev server
- \`npm run build\` — production build`
    case 'go':
      return `- \`go build ./...\` — build project
- \`go test ./...\` — run all tests
- \`golangci-lint run\` — run linter`
    case 'rust':
      return `- \`cargo build\` — build project
- \`cargo test\` — run all tests
- \`cargo clippy\` — run linter`
    case 'both':
      return `- \`pip install -r requirements.txt\` — install Python deps
- \`npm install\` — install JS deps
- \`python -m pytest\` — run Python tests
- \`npm test\` — run JS tests
- \`ruff check .\` — Python linter
- \`npm run lint\` — JS linter`
    default:
      return `- Configure your build, test, and lint commands here`
  }
}

function principleDescription(p: string): string {
  const map: Record<string, string> = {
    'Simplicity': 'Prefer simple, readable solutions over clever ones. Remove before adding.',
    'Speed': 'Optimize for performance. Profile before optimizing. Measure after.',
    'Security': 'Validate all inputs. Trust nothing from the client. Encrypt sensitive data.',
    'Scalability': 'Design for horizontal scaling. Avoid shared mutable state.',
    'User Experience': 'Every user-facing change must be visually verified. UI consistency matters.',
    'Reliability': 'Handle every error path. Prefer defensive coding. Fail gracefully.',
    'Low Cost': 'Minimize API calls and external service usage. Cache aggressively.',
    'Privacy': 'Never collect data you don\'t need. Encrypt at rest. Document data flows.',
  }
  return map[p] || p
}

function generateClaudeMd(d: WizardData): string {
  const sections: string[] = []

  sections.push(`# Project: ${d.project_name || 'Untitled Project'}\n`)
  sections.push(d.project_description + '\n')

  sections.push(`## Commands\n`)
  sections.push(languageCommands(d.language) + '\n')

  sections.push(`## Architecture\n`)
  if (d.has_database === 'yes') sections.push(`- \`db/\` — database migrations and schema`)
  if (d.has_frontend === 'yes') sections.push(`- \`src/\` or \`frontend/\` — user-facing application`)
  if (d.deploy_target === 'server') sections.push(`- Deployed to remote server`)
  sections.push('')

  sections.push(`## Behavioral Rules\n`)
  sections.push(`### Debugging Discipline
- When a test fails, read the ENTIRE error message before proposing a fix
- After 2 failed fix attempts on the same issue, STOP. Summarize what you tried, what happened, and your current hypothesis. Ask for guidance.
- Never "fix" a test by changing the test to match broken behavior
- Do not guess at fixes — trace the actual execution path\n`)

  sections.push(`### Scope Control
- Only modify files directly related to the stated task
- If you discover a bug in unrelated code, NOTE it but do NOT fix it
- If the task says "fix X in file Y", do not also refactor file Y\n`)

  sections.push(`### Implementation Discipline
- Before modifying any function, state what it currently does
- Make the smallest change that solves the problem
- Run tests after every change
- If a change requires modifying more than 3 files, present a plan first
- Commit working changes before attempting risky refactors\n`)

  sections.push(`### Git Discipline
- Commit after every completed task: \`feat:\`, \`fix:\`, \`docs:\`, \`refactor:\`, \`test:\`, \`chore:\`
- Never work on uncommitted changes — commit or stash first
- Before any risky change, make a safety commit`)
  if (d.team_type === 'team') sections.push(`- Use feature branches for all work. Never push directly to main.`)
  if (d.deploy_target === 'server') {
    sections.push(`- After deploying to server, verify local and server are in sync`)
    sections.push(`- Never deploy via inline SSH commands — use the deploy workflow`)
  }
  sections.push('')

  sections.push(`## Protected Files — DO NOT MODIFY
- \`.env\` / \`.env.*\` — environment configuration`)
  if (d.language === 'javascript' || d.language === 'both') sections.push(`- \`package-lock.json\` — dependency lockfile`)
  if (d.language === 'python' || d.language === 'both') sections.push(`- \`requirements.txt\` — pinned dependencies (add new deps, don't modify existing pins)`)
  if (d.has_database === 'yes') sections.push(`- \`migrations/\` — committed migrations (create NEW migrations instead)`)
  sections.push(`\nIf you need to change a protected file, STOP and explain why before proceeding.\n`)

  if (d.design_principles.includes('Security')) {
    sections.push(`## Security Rules
- Always validate user input before processing
- Never trust client-side data without server verification
- Use parameterized queries for all database operations
- Never log sensitive data (passwords, tokens, API keys)
- Never commit secrets — use environment variables\n`)
  }

  if (d.design_principles.includes('Privacy')) {
    sections.push(`## Privacy Rules
- Never collect data you don't need
- Encrypt at rest
- Document data flows
- Log all data access\n`)
  }

  sections.push(`## Self-Maintenance
- When this file exceeds ~150 lines, extract operational detail into .claude/CLAUDE.md and convert this to a routing index
- When you accumulate >10 project-specific gotchas, create .claude/skills/${d.project_slug || 'project'}/SKILL.md`)

  return sections.join('\n')
}

function generateSettingsJson(d: WizardData): string {
  const allow: string[] = []

  if (d.language === 'python' || d.language === 'both') {
    allow.push('"Bash(python -m pytest *)"', '"Bash(ruff *)"', '"Bash(pip install *)"')
  }
  if (d.language === 'javascript' || d.language === 'both') {
    allow.push('"Bash(npm run *)"', '"Bash(npm test *)"', '"Bash(npx *)"')
  }
  if (d.language === 'go') {
    allow.push('"Bash(go build *)"', '"Bash(go test *)"', '"Bash(golangci-lint *)"')
  }
  if (d.language === 'rust') {
    allow.push('"Bash(cargo *)"')
  }

  allow.push(
    '"Bash(git add *)"',
    '"Bash(git commit *)"',
    '"Bash(git diff *)"',
    '"Bash(git log *)"',
    '"Bash(git status)"',
    '"Bash(git branch *)"',
    '"Bash(git checkout *)"',
    '"Bash(* --version)"',
    '"Bash(* --help *)"',
    '"Read(*)"',
  )

  return JSON.stringify({
    "$schema": "https://json.schemastore.org/claude-code-settings.json",
    permissions: {
      allow: allow.map(s => s.replace(/^"|"$/g, '')),
      deny: [
        "Bash(git push --force *)",
        "Bash(rm -rf /)",
        "Bash(rm -rf ~)",
        "Bash(curl * | bash)",
        "Bash(wget * | bash)",
        "Read(./.env)",
        "Read(./.env.*)",
        "Read(./secrets/**)",
      ],
    },
    hooks: {
      SessionStart: [{
        matcher: "",
        hooks: [{ type: "command", command: 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"' }],
      }],
      PreToolUse: [{
        matcher: "Bash",
        hooks: [{ type: "command", command: 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-bash-firewall.sh"' }],
      }],
      PostToolUse: [{
        matcher: "Bash",
        hooks: [{ type: "command", command: 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-commit-check.sh"' }],
      }],
    },
  }, null, 2)
}

function generateSessionStart(d: WizardData): string {
  let script = `#!/bin/bash
# session-start.sh — fires on SessionStart
set -euo pipefail

echo "=== SESSION CONTEXT ==="
echo ""

echo "## Git Status"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'not a git repo')"
git status --short 2>/dev/null | head -20 || true
echo ""

if ! git diff --quiet 2>/dev/null; then
  echo "WARNING: Uncommitted changes from previous session"
  git diff --name-only 2>/dev/null | head -10
  echo ""
fi

echo "## Recent Commits"
git log --oneline -5 2>/dev/null || true
echo ""

if [ -f "docs/handoff-log.md" ] && [ -s "docs/handoff-log.md" ]; then
  echo "## Last Handoff Notes"
  tail -30 "docs/handoff-log.md"
  echo ""
fi

CLAUDE_LINES=$(wc -l < "CLAUDE.md" 2>/dev/null || echo 0)
if [ "$CLAUDE_LINES" -gt 150 ]; then
  echo "WARNING: CLAUDE.md is $CLAUDE_LINES lines — check Self-Maintenance instructions for splitting"
fi

MODULE_COUNT=$(find . -maxdepth 2 -name '*.py' -o -name '*.ts' -o -name '*.js' | xargs -I{} dirname {} | sort -u | wc -l 2>/dev/null || echo 0)
if [ "$MODULE_COUNT" -gt 5 ]; then
  echo "INFO: Project has $MODULE_COUNT source directories — consider creating docs/architecture.md if it doesn't exist"
fi
`

  if (d.has_frontend === 'yes') {
    script += `
FRONTEND_CHANGES=$(git log --oneline -10 --name-only 2>/dev/null | grep -cE '\\.(tsx|jsx|css|html|vue|svelte)$' || true)
if [ "$FRONTEND_CHANGES" -gt 15 ]; then
  echo "INFO: Heavy frontend activity ($FRONTEND_CHANGES files in last 10 commits) — consider .claude/rules/frontend.md"
fi
`
  }

  if (d.deploy_target === 'server') {
    script += `
LOCAL_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
echo "## Sync Status"
echo "Local HEAD: $LOCAL_HEAD"
echo "Run 'git push' if behind remote"
`
  }

  script += `
echo ""
echo "=== END SESSION CONTEXT ==="
exit 0
`
  return script
}

function generatePreCommitCheck(d: WizardData): string {
  let testBlock = ''
  if (d.language === 'python' || d.language === 'both') {
    testBlock += `
if [ -f "$PROJECT_DIR/pyproject.toml" ] || [ -f "$PROJECT_DIR/pytest.ini" ] || [ -f "$PROJECT_DIR/requirements.txt" ]; then
  if ! python -m pytest --quiet -x 2>/dev/null; then
    ERRORS="\${ERRORS}\\n❌ Python tests are failing. Fix before committing."
  fi
fi`
  }
  if (d.language === 'javascript' || d.language === 'both') {
    testBlock += `
if [ -f "$PROJECT_DIR/package.json" ]; then
  if ! npm test --silent 2>/dev/null; then
    ERRORS="\${ERRORS}\\n❌ Tests are failing. Fix before committing."
  fi
fi`
  }
  if (d.language === 'go') {
    testBlock += `
if [ -f "$PROJECT_DIR/go.mod" ]; then
  if ! go test ./... 2>/dev/null; then
    ERRORS="\${ERRORS}\\n❌ Go tests are failing. Fix before committing."
  fi
fi`
  }
  if (d.language === 'rust') {
    testBlock += `
if [ -f "$PROJECT_DIR/Cargo.toml" ]; then
  if ! cargo test 2>/dev/null; then
    ERRORS="\${ERRORS}\\n❌ Rust tests are failing. Fix before committing."
  fi
fi`
  }

  return `#!/bin/bash
# pre-commit-check.sh — fires on PostToolUse for Bash
set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

if ! echo "$CMD" | grep -q 'git commit'; then
  exit 0
fi

if [ "\${CLAUDE_STOP_HOOK_ACTIVE:-}" = "true" ]; then
  exit 0
fi

PROJECT_DIR="\${CLAUDE_PROJECT_DIR:-.}"
ERRORS=""
${testBlock}

CHANGED=$(git diff --cached --name-only 2>/dev/null || true)
CODE_CHANGES=$(echo "$CHANGED" | grep -E '\\.(py|ts|tsx|js|jsx|go|rs)$' | grep -v '^tests/' || true)

if [ -n "$CODE_CHANGES" ]; then
  DOCS_UPDATED=$(echo "$CHANGED" | grep -E 'docs/(feature-inventory|handoff-log)' || true)
  if [ -z "$DOCS_UPDATED" ]; then
    ERRORS="\${ERRORS}\\n⚠️ Code changed but docs/feature-inventory.md or docs/handoff-log.md not updated. Update before committing."
  fi
fi

if [ -n "$ERRORS" ]; then
  echo -e "$ERRORS" >&2
  exit 2
fi

exit 0
`
}

function generatePreBashFirewall(): string {
  return `#!/bin/bash
# pre-bash-firewall.sh — fires on PreToolUse for Bash
set -euo pipefail

CMD=$(jq -r '.tool_input.command // ""')

DENY_PATTERNS=(
  'rm\\s+-rf\\s+/'
  'rm\\s+-rf\\s+~'
  'git\\s+reset\\s+--hard'
  'git\\s+push.*--force'
  'curl.*\\|\\s*bash'
  'wget.*\\|\\s*bash'
  'chmod\\s+777'
  'dd\\s+if='
  '>\\s*/dev/sd'
  'mkfs\\.'
)

for pat in "\${DENY_PATTERNS[@]}"; do
  if echo "$CMD" | grep -Eiq "$pat"; then
    echo "❌ Blocked: matches dangerous pattern '$pat'. Use a safer alternative." >&2
    exit 2
  fi
done

exit 0
`
}

function generateMcpJson(d: WizardData): string {
  const servers: Record<string, unknown> = {
    context7: {
      command: "npx",
      args: ["-y", "@upstash/context7-mcp@latest"],
    },
  }

  if (d.capabilities.includes('perplexity')) {
    servers.perplexity = {
      command: "npx",
      args: ["-y", "@perplexity-ai/mcp-server@latest"],
      env: {
        PERPLEXITY_API_KEY: "TODO_ADD_PERPLEXITY_API_KEY",
      },
    }
  }
  if (d.capabilities.includes('playwright')) {
    servers.playwright = {
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-playwright@latest"],
    }
  }
  if (d.capabilities.includes('postgres')) {
    servers.postgres = {
      command: "npx",
      args: ["-y", "@crystaldba/postgres-mcp@latest"],
      env: {
        DATABASE_URL: "TODO_ADD_DATABASE_URL",
      },
    }
  }
  if (d.capabilities.includes('shell')) {
    servers.shell = {
      command: "npx",
      args: ["-y", "ssh-mcp@latest"],
      env: {
        SSH_HOST: "TODO_ADD_SSH_ADDRESS",
      },
    }
  }

  return JSON.stringify({ mcpServers: servers }, null, 2)
}

function generateDevQueue(d: WizardData): string {
  const lines: string[] = [
    `# Development Queue\n`,
  ]

  if (d.project_description) lines.push(`> ${d.project_description}`)
  if (d.problem_statement) lines.push(`> Problem: ${d.problem_statement}`)
  lines.push('\n## Current Sprint\n')

  if (!d.goal1_description.trim()) {
    lines.push(`### 1. Your first task
**Status:** PENDING
**Priority:** High

**Scope:**
Add your first task here or tell Claude Code what you want to build.

**Recovery (if something breaks):**
- Check git log for last known good commit
- Revert with \`git checkout <commit>\` if needed
- Re-read CLAUDE.md before retrying

---
`)
  } else {
    const goals = [
      { desc: d.goal1_description, criteria: d.goal1_acceptance_criteria, priority: 'High' },
      { desc: d.goal2_description, criteria: '', priority: 'Medium' },
      { desc: d.goal3_description, criteria: '', priority: 'Medium' },
      { desc: d.goal4_description, criteria: '', priority: 'Medium' },
    ].filter(g => g.desc.trim())

    goals.forEach((g, i) => {
      lines.push(`### ${i + 1}. ${g.desc.split('\n')[0]}`)
      lines.push(`**Status:** PENDING`)
      lines.push(`**Priority:** ${g.priority}\n`)
      lines.push(`**Scope:**\n${g.desc}\n`)
      if (g.criteria) lines.push(`**Acceptance Criteria:**\n${g.criteria}\n`)
      lines.push(`**Recovery (if something breaks):**
- Check git log for last known good commit
- Revert with \`git checkout <commit>\` if needed
- Re-read CLAUDE.md before retrying

---
`)
    })
  }

  lines.push(`## Completed
(Tasks move here when done)

## Task Template

Copy this for new tasks:

\`\`\`
### N. Task Title
**Status:** PENDING | IN PROGRESS | DONE | BLOCKED
**Priority:** Critical | High | Medium | Low

**Scope:**
What needs doing — describe the goal, not the implementation.

**Acceptance Criteria:**
- Specific, verifiable condition 1
- Specific, verifiable condition 2
- Tests pass, no regressions

**Recovery (if something breaks):**
- Check git log for last known good commit
- Revert with \\\`git checkout <commit>\\\` if needed
- Re-read CLAUDE.md before retrying
\`\`\`
`)

  return lines.join('\n')
}

function generatePhilosophy(d: WizardData): string {
  const lines: string[] = [
    `# ${d.project_name || 'Project'} — Design Philosophy\n`,
    `## What This Is\n${d.project_description || 'Describe your project here.'}\n`,
  ]

  if (d.problem_statement) {
    lines.push(`## Problem Statement\n${d.problem_statement}\n`)
  }

  if (d.design_principles.length > 0) {
    lines.push(`## Design Principles (ranked)\n`)
    d.design_principles.forEach((p, i) => {
      lines.push(`${i + 1}. **${p}** — ${principleDescription(p)}`)
    })
    lines.push('')
  }

  if (d.anti_patterns) {
    lines.push(`## Anti-Patterns — What We Will NOT Do\n${d.anti_patterns}\n`)
  }

  lines.push(`## Decision Log
Record significant design decisions here as the project evolves.

| Date | Decision | Rationale |
|------|----------|-----------|
| ${today} | Project created with Praton Launchpad | Initial scaffold |
`)

  return lines.join('\n')
}

function generateFeatureInventory(d: WizardData): string {
  const goal1Title = d.goal1_description ? d.goal1_description.split('\n')[0] : 'First task'
  const designed: string[] = []
  if (d.goal2_description) designed.push(`| ${d.goal2_description.split('\n')[0]} | Initial planning | Queued |`)
  if (d.goal3_description) designed.push(`| ${d.goal3_description.split('\n')[0]} | Initial planning | Queued |`)
  if (d.goal4_description) designed.push(`| ${d.goal4_description.split('\n')[0]} | Initial planning | Queued |`)

  return `# Feature Inventory

Track every feature: built, in progress, designed, or mentioned.

## Built (verified working)

| Feature | Date | Notes |
|---------|------|-------|
| Project scaffold | ${today} | Generated by Praton Launchpad |

## In Progress

| Feature | Started | Status | Notes |
|---------|---------|--------|-------|
| ${goal1Title} | — | PENDING | First task in queue |

## Designed (not yet built)

| Feature | Source | Notes |
|---------|--------|-------|
${designed.join('\n')}

## Mentioned (ideas, not yet designed)

| Feature | Source | Notes |
|---------|--------|-------|
`
}

function generateHandoffLog(): string {
  return `# Handoff Log

Claude Code writes session notes here incrementally. Each entry captures what changed, what works, what's broken, and the exact next step.

---
`
}

function generateGitignore(d: WizardData): string {
  const lines: string[] = [
    '# Claude Code',
    'CLAUDE.local.md',
    '.claude/settings.local.json',
    '.claude/agent-memory-local/',
    '.mcp.json',
    '',
    '# Environment',
    '.env',
    '.env.*',
    'secrets/',
    '',
  ]

  if (d.language === 'python' || d.language === 'both') {
    lines.push('# Python', '__pycache__/', '*.pyc', '*.pyo', '.venv/', 'venv/', '*.egg-info/', 'dist/', 'build/', '.pytest_cache/', '.ruff_cache/', '')
  }
  if (d.language === 'javascript' || d.language === 'both') {
    lines.push('# JavaScript/TypeScript', 'node_modules/', 'dist/', '.next/', '.nuxt/', '.output/', 'coverage/', '')
  }
  if (d.language === 'go') {
    lines.push('# Go', 'bin/', 'vendor/', '')
  }
  if (d.language === 'rust') {
    lines.push('# Rust', 'target/', '')
  }

  lines.push('# OS', '.DS_Store', 'Thumbs.db', '')

  return lines.join('\n')
}

function generateLaunchersBat(): { name: string; content: string }[] {
  return [
    {
      name: 'Start Claude Code.bat',
      content: `@echo off\r\ncd /d "%~dp0"\r\nclaude\r\npause`,
    },
    {
      name: 'Start Claude Code (Full Permissions).bat',
      content: `@echo off\r\ncd /d "%~dp0"\r\nclaude --dangerously-skip-permissions\r\npause`,
    },
    {
      name: 'Start Plan Mode.bat',
      content: `@echo off\r\ncd /d "%~dp0"\r\nclaude -p "Use plan mode. Read CLAUDE.md first. Then read docs/development-queue.md and present a plan for the next pending task. Do not make any changes until the plan is approved."\r\npause`,
    },
    {
      name: 'Check Costs.bat',
      content: `@echo off\r\nnpx ccusage@latest\r\npause`,
    },
  ]
}

function generateLaunchersUnix(): { name: string; content: string }[] {
  return [
    {
      name: 'Start Claude Code.command',
      content: `#!/bin/bash\ncd "$(dirname "$0")"\nclaude`,
    },
    {
      name: 'Start Claude Code (Full Permissions).command',
      content: `#!/bin/bash\ncd "$(dirname "$0")"\nclaude --dangerously-skip-permissions`,
    },
    {
      name: 'Start Plan Mode.command',
      content: `#!/bin/bash\ncd "$(dirname "$0")"\nclaude -p "Use plan mode. Read CLAUDE.md first. Then read docs/development-queue.md and present a plan for the next pending task. Do not make any changes until the plan is approved."`,
    },
    {
      name: 'Check Costs.command',
      content: `#!/bin/bash\nnpx ccusage@latest`,
    },
  ]
}

function generateSetupPrerequisitesBat(): string {
  return `@echo off\r
setlocal\r
echo.\r
echo === Setup Prerequisites ===\r
echo.\r
\r
echo -----------------------------------------------\r
echo Step 1: Node.js\r
echo -----------------------------------------------\r
node --version >nul 2>&1\r
if %errorlevel%==0 (\r
  for /f "tokens=*" %%i in ('node --version') do echo V Node.js is installed ^(%%i^)\r
) else (\r
  echo Node.js is required. Opening the download page now...\r
  start https://nodejs.org\r
  echo Install Node.js using the default settings, then press Enter when done.\r
  pause >nul\r
  node --version >nul 2>&1\r
  if errorlevel 1 (\r
    echo Node.js still not detected. Try closing and reopening this window after installing.\r
    pause\r
    exit /b 1\r
  ) else (\r
    for /f "tokens=*" %%i in ('node --version') do echo V Node.js is installed ^(%%i^)\r
  )\r
)\r
echo.\r
\r
echo -----------------------------------------------\r
echo Step 2: Git\r
echo -----------------------------------------------\r
git --version >nul 2>&1\r
if %errorlevel%==0 (\r
  echo V Git is installed\r
) else (\r
  echo Git is required. Opening the download page now...\r
  start https://git-scm.com/downloads\r
  echo Install Git using the default settings, then press Enter when done.\r
  pause >nul\r
  git --version >nul 2>&1\r
  if errorlevel 1 (\r
    echo Git still not detected. Try closing and reopening this window after installing.\r
    pause\r
    exit /b 1\r
  ) else (\r
    echo V Git is installed\r
  )\r
)\r
echo.\r
\r
echo -----------------------------------------------\r
echo Step 3: Claude Code\r
echo -----------------------------------------------\r
claude --version >nul 2>&1\r
if %errorlevel%==0 (\r
  echo V Claude Code is installed\r
) else (\r
  echo Installing Claude Code now...\r
  call npm install -g @anthropic-ai/claude-code\r
  claude --version >nul 2>&1\r
  if errorlevel 1 (\r
    echo Claude Code installation failed. Make sure Node.js is installed and try again.\r
    pause\r
    exit /b 1\r
  ) else (\r
    echo V Claude Code installed\r
  )\r
)\r
echo.\r
\r
echo -----------------------------------------------\r
echo Step 4: Claude Code Login\r
echo -----------------------------------------------\r
echo Now let's log you into Claude Code...\r
echo A Claude Code session will open. Once logged in, type /exit to come back here.\r
echo.\r
call claude\r
echo.\r
\r
echo ===============================================\r
echo All set! Next step: double-click 'Setup Credentials'\r
echo to connect your AI tools, then 'Start Claude Code'\r
echo to begin.\r
echo ===============================================\r
echo.\r
pause\r
`
}

function generateSetupPrerequisitesCommand(): string {
  return `#!/bin/bash
cd "$(dirname "$0")/.."

# Make all .command scripts executable
chmod +x *.command 2>/dev/null
chmod +x Setup/*.command 2>/dev/null

echo ""
echo "=== Setup Prerequisites ==="
echo ""

echo "-----------------------------------------------"
echo "Step 1: Node.js"
echo "-----------------------------------------------"
if command -v node &>/dev/null; then
  echo "V Node.js is installed ($(node --version))"
else
  echo "Node.js is required. Opening the download page now..."
  if command -v xdg-open &>/dev/null; then
    xdg-open "https://nodejs.org"
  elif command -v open &>/dev/null; then
    open "https://nodejs.org"
  else
    echo "Visit https://nodejs.org to download Node.js"
  fi
  echo "Install Node.js using the default settings, then press Enter when done."
  read -r
  if command -v node &>/dev/null; then
    echo "V Node.js is installed ($(node --version))"
  else
    echo "Node.js still not detected. Try closing and reopening this window after installing."
    exit 1
  fi
fi
echo ""

echo "-----------------------------------------------"
echo "Step 2: Git"
echo "-----------------------------------------------"
if command -v git &>/dev/null; then
  echo "V Git is installed"
else
  echo "Git is required. Opening the download page now..."
  if command -v xdg-open &>/dev/null; then
    xdg-open "https://git-scm.com/downloads"
  elif command -v open &>/dev/null; then
    open "https://git-scm.com/downloads"
  else
    echo "Visit https://git-scm.com/downloads to download Git"
  fi
  echo "Install Git using the default settings, then press Enter when done."
  read -r
  if command -v git &>/dev/null; then
    echo "V Git is installed"
  else
    echo "Git still not detected. Try closing and reopening this window after installing."
    exit 1
  fi
fi
echo ""

echo "-----------------------------------------------"
echo "Step 3: Claude Code"
echo "-----------------------------------------------"
if command -v claude &>/dev/null; then
  echo "V Claude Code is installed"
else
  echo "Installing Claude Code now..."
  npm install -g @anthropic-ai/claude-code
  if command -v claude &>/dev/null; then
    echo "V Claude Code installed"
  else
    echo "Claude Code installation failed. Make sure Node.js is installed and try again."
    exit 1
  fi
fi
echo ""

echo "-----------------------------------------------"
echo "Step 4: Claude Code Login"
echo "-----------------------------------------------"
echo "Now let's log you into Claude Code..."
echo "A Claude Code session will open. Once logged in, type /exit to come back here."
echo ""
claude
echo ""

echo "==============================================="
echo "All set! Next step: double-click 'Setup Credentials'"
echo "to connect your AI tools, then 'Start Claude Code'"
echo "to begin."
echo "==============================================="
`
}

function generateSetupCredentialsBat(d: WizardData): string {
  const entries: { placeholder: string; label: string; url: string; prompt: string }[] = []

  if (d.capabilities.includes('perplexity')) {
    entries.push({
      placeholder: 'TODO_ADD_PERPLEXITY_API_KEY',
      label: 'Perplexity API Key',
      url: 'https://perplexity.ai/settings/api',
      prompt: 'Paste your key: ',
    })
  }
  if (d.capabilities.includes('postgres')) {
    entries.push({
      placeholder: 'TODO_ADD_DATABASE_URL',
      label: 'PostgreSQL Connection String (e.g. postgresql://user:password@localhost:5432/mydb)',
      url: "Your database dashboard (Supabase, Railway, or Neon — look for 'Connection String' or 'Database URL')",
      prompt: 'Paste your connection string: ',
    })
  }
  if (d.capabilities.includes('shell')) {
    entries.push({
      placeholder: 'TODO_ADD_SSH_ADDRESS',
      label: 'SSH Server Address (e.g. user@123.456.789.0)',
      url: 'Your server/VPS provider dashboard',
      prompt: 'Paste your SSH address: ',
    })
  }

  if (entries.length === 0) return ''

  let script = `@echo off\r\nsetlocal enabledelayedexpansion\r\ncd /d "%~dp0\\.."\r\necho.\r\necho === Configure Your AI Tools ===\r\necho.\r\n`

  for (const entry of entries) {
    script += `\r\nfindstr /C:"${entry.placeholder}" .mcp.json >nul 2>&1\r\n`
    script += `if %errorlevel%==0 (\r\n`
    script += `  echo -----------------------------------------------\r\n`
    script += `  echo ${entry.label}\r\n`
    script += `  echo Get yours at: ${entry.url}\r\n`
    script += `  echo -----------------------------------------------\r\n`
    script += `  set /p USER_VALUE="${entry.prompt}"\r\n`
    script += `  if defined USER_VALUE (\r\n`
    script += `    powershell -Command "(Get-Content '.mcp.json' -Raw) -replace '${entry.placeholder}','!USER_VALUE!' | Set-Content '.mcp.json' -Encoding utf8"\r\n`
    script += `    echo Saved!\r\n`
    script += `    set "USER_VALUE="\r\n`
    script += `  ) else (\r\n`
    script += `    echo Skipped.\r\n`
    script += `  )\r\n`
    script += `  echo.\r\n`
    script += `)\r\n`
  }

  script += `\r\necho ===============================================\r\n`
  script += `echo Done! Your AI tools are configured.\r\n`
  script += `echo ===============================================\r\n`
  script += `echo.\r\npause\r\n`

  return script
}

function generateSetupCredentialsCommand(d: WizardData): string {
  const entries: { placeholder: string; label: string; url: string; prompt: string }[] = []

  if (d.capabilities.includes('perplexity')) {
    entries.push({
      placeholder: 'TODO_ADD_PERPLEXITY_API_KEY',
      label: 'Perplexity API Key',
      url: 'https://perplexity.ai/settings/api',
      prompt: 'Paste your key: ',
    })
  }
  if (d.capabilities.includes('postgres')) {
    entries.push({
      placeholder: 'TODO_ADD_DATABASE_URL',
      label: 'PostgreSQL Connection String (e.g. postgresql://user:password@localhost:5432/mydb)',
      url: "Your database dashboard (Supabase, Railway, or Neon — look for 'Connection String' or 'Database URL')",
      prompt: 'Paste your connection string: ',
    })
  }
  if (d.capabilities.includes('shell')) {
    entries.push({
      placeholder: 'TODO_ADD_SSH_ADDRESS',
      label: 'SSH Server Address (e.g. user@123.456.789.0)',
      url: 'Your server/VPS provider dashboard',
      prompt: 'Paste your SSH address: ',
    })
  }

  if (entries.length === 0) return ''

  let script = `#!/bin/bash\ncd "$(dirname "$0")/.."\necho ""\necho "=== Configure Your AI Tools ==="\necho ""\n`

  for (const entry of entries) {
    script += `\nif grep -q "${entry.placeholder}" .mcp.json 2>/dev/null; then\n`
    script += `  echo "-----------------------------------------------"\n`
    script += `  echo "${entry.label}"\n`
    script += `  echo "Get yours at: ${entry.url}"\n`
    script += `  echo "-----------------------------------------------"\n`
    script += `  printf "${entry.prompt}"\n`
    script += `  read -r USER_VALUE\n`
    script += `  if [ -n "$USER_VALUE" ]; then\n`
    script += `    sed -i.bak "s|${entry.placeholder}|$USER_VALUE|" .mcp.json && rm -f .mcp.json.bak\n`
    script += `    echo "Saved!"\n`
    script += `  else\n`
    script += `    echo "Skipped."\n`
    script += `  fi\n`
    script += `  echo ""\n`
    script += `fi\n`
  }

  script += `\necho "==============================================="\n`
  script += `echo "Done! Your AI tools are configured."\n`
  script += `echo "==============================================="\n`

  return script
}

export function generateFiles(d: WizardData): GeneratedFile[] {
  const toggles = d.review_toggles
  const isOn = (id: string) => toggles[id] !== false

  const files: GeneratedFile[] = []
  const slug = d.project_slug || 'my-project'

  // Project files
  if (isOn('claude_md')) files.push({ name: `${slug}/CLAUDE.md`, content: generateClaudeMd(d) })
  if (isOn('settings_json')) files.push({ name: `${slug}/.claude/settings.json`, content: generateSettingsJson(d) })
  if (isOn('dev_queue')) files.push({ name: `${slug}/docs/development-queue.md`, content: generateDevQueue(d) })
  if (isOn('philosophy')) files.push({ name: `${slug}/docs/philosophy.md`, content: generatePhilosophy(d) })
  if (isOn('feature_inventory')) files.push({ name: `${slug}/docs/feature-inventory.md`, content: generateFeatureInventory(d) })
  if (isOn('handoff_log')) files.push({ name: `${slug}/docs/handoff-log.md`, content: generateHandoffLog() })
  if (isOn('gitignore')) files.push({ name: `${slug}/.gitignore`, content: generateGitignore(d) })

  // Hooks
  if (isOn('session_start')) files.push({ name: `${slug}/.claude/hooks/session-start.sh`, content: generateSessionStart(d) })
  if (isOn('test_enforce')) files.push({ name: `${slug}/.claude/hooks/pre-commit-check.sh`, content: generatePreCommitCheck(d) })
  if (isOn('cmd_blocker')) files.push({ name: `${slug}/.claude/hooks/pre-bash-firewall.sh`, content: generatePreBashFirewall() })

  // MCP config
  files.push({ name: `${slug}/.mcp.json`, content: generateMcpJson(d) })

  // Schema rules (if DB)
  if (d.has_database === 'yes' && isOn('schema_rules')) {
    files.push({
      name: `${slug}/.claude/rules/schema.md`,
      content: `---
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
`,
    })
  }

  // Launcher scripts (OS-specific)
  const isWindows = d.detected_os === 'windows'
  if (isOn('launchers')) {
    if (isWindows) {
      for (const l of generateLaunchersBat()) {
        files.push({ name: `${slug}/${l.name}`, content: l.content })
      }
    } else {
      for (const l of generateLaunchersUnix()) {
        files.push({ name: `${slug}/${l.name}`, content: l.content })
      }
    }
  }

  // Setup scripts (in Setup/ subfolder, OS-specific)
  if (isWindows) {
    files.push({ name: `${slug}/Setup/1 - Setup Prerequisites.bat`, content: generateSetupPrerequisitesBat() })
    const credBat = generateSetupCredentialsBat(d)
    if (credBat) files.push({ name: `${slug}/Setup/2 - Setup Credentials.bat`, content: credBat })
  } else {
    files.push({ name: `${slug}/Setup/1 - Setup Prerequisites.command`, content: generateSetupPrerequisitesCommand() })
    const credCommand = generateSetupCredentialsCommand(d)
    if (credCommand) files.push({ name: `${slug}/Setup/2 - Setup Credentials.command`, content: credCommand })
  }

  // Prompt Advisor — generated last so it can list all other files
  if (isOn('prompt_advisor')) {
    files.push({ name: `${slug}/Claude Code Prompt Advisor.txt`, content: generatePromptAdvisor(d, files) })
  }

  return files
}
