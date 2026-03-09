import type { WizardData } from '../../types/wizard'
import type { GeneratedFile } from '../engine'

function displayLanguage(lang: string): string {
  const map: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript/TypeScript',
    go: 'Go',
    rust: 'Rust',
    both: 'Python + JavaScript/TypeScript',
    other: 'Other',
    not_sure: 'Not yet decided',
  }
  return map[lang] || lang || 'Not specified'
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

const fileDescriptions: Record<string, string> = {
  'CLAUDE.md': 'Claude Code reads this at the start of every session. It contains the project description, coding rules, behavioral guidelines, and protected file list.',
  '.claude/settings.json': 'Permissions and safety configuration. Controls which commands Claude Code can run without asking, and registers quality hooks.',
  'docs/development-queue.md': 'The task backlog. Each task has a description, priority, acceptance criteria, and recovery instructions. Claude Code works through these in order.',
  'docs/philosophy.md': 'Design principles ranked by priority, anti-patterns to avoid, and a decision log for tracking architectural choices.',
  'docs/feature-inventory.md': 'Tracks every feature: built, in progress, designed, or just mentioned. Claude Code updates this as work is completed.',
  'docs/handoff-log.md': 'Session notes written by Claude Code at the end of each session. Records what changed, what works, what broke, and the exact next step.',
  '.gitignore': 'Keeps sensitive files (secrets, env vars, build artifacts) out of version control.',
  '.mcp.json': 'AI tool connections — configures which external tools (documentation lookup, web search, database, etc.) Claude Code can use.',
  '.claude/hooks/session-start.sh': 'Runs automatically when Claude Code starts. Loads git status, recent commits, uncommitted changes, and last session notes.',
  '.claude/hooks/pre-commit-check.sh': 'Runs automatically before every commit. Ensures tests pass and documentation is updated before code is saved.',
  '.claude/hooks/pre-bash-firewall.sh': 'Runs automatically before every terminal command. Blocks dangerous operations like force-push, rm -rf, and piped curl-to-bash.',
  '.claude/rules/schema.md': 'Database rules that activate when Claude Code touches database files. Enforces reading the schema before writing queries.',
  'Claude Code Prompt Advisor.txt': 'This file. Paste it into any LLM to get help writing Claude Code prompts.',
  'Start Claude Code.bat': 'Double-click to launch Claude Code in your project directory.',
  'Start Claude Code.command': 'Double-click to launch Claude Code in your project directory.',
  'Start Claude Code (Full Permissions).bat': 'Launch Claude Code with all permission prompts skipped. Use once you trust it with your project.',
  'Start Claude Code (Full Permissions).command': 'Launch Claude Code with all permission prompts skipped. Use once you trust it with your project.',
  'Start Plan Mode.bat': 'Launch Claude Code in planning mode — it analyzes and proposes before acting.',
  'Start Plan Mode.command': 'Launch Claude Code in planning mode — it analyzes and proposes before acting.',
  'Check Costs.bat': 'Check Claude Code API usage costs.',
  'Check Costs.command': 'Check Claude Code API usage costs.',
  'Setup/1 - Setup Prerequisites.bat': 'Interactive installer for Node.js, Git, and Claude Code.',
  'Setup/1 - Setup Prerequisites.command': 'Interactive installer for Node.js, Git, and Claude Code.',
  'Setup/2 - Setup Credentials.bat': 'Interactive setup for AI tool API keys and connection strings.',
  'Setup/2 - Setup Credentials.command': 'Interactive setup for AI tool API keys and connection strings.',
  'Setup/0 - READ ME FIRST.pdf': 'Getting started guide with setup instructions and useful prompts.',
}

function buildFileList(files: GeneratedFile[]): string {
  return files.map(f => {
    const shortName = f.name.includes('/') ? f.name.substring(f.name.indexOf('/') + 1) : f.name
    const desc = fileDescriptions[shortName]
    if (!desc) return `- ${shortName}`
    return `- ${shortName} — ${desc}`
  }).join('\n')
}

function capabilityName(c: string): string {
  const map: Record<string, string> = {
    context7: 'Live Documentation (Context7) — Always fetches the latest official docs for libraries and frameworks. No prompting needed.',
    perplexity: 'Web Research (Perplexity) — Can search the internet during coding sessions to find solutions and verify approaches.',
    playwright: 'Browser Testing (Playwright) — Can open a real browser to see and test your website visually.',
    postgres: 'Database Access (Postgres) — Can query your database directly to verify code changes work with real data.',
    shell: 'Server Access (SSH) — Can connect to your server to check health, read logs, and deploy code.',
  }
  return map[c] || c
}

export function generatePromptAdvisor(d: WizardData, files: GeneratedFile[]): string {
  const projectName = d.project_name || 'Your Project'
  const allCaps = ['context7', ...d.capabilities.filter(c => c !== 'context7')]

  const sections: string[] = []

  // ─── Header ───
  sections.push(`CLAUDE CODE PROMPT ADVISOR — ${projectName}
================================================================================

You are an expert at writing prompts for Claude Code, an AI coding assistant
made by Anthropic that runs in the terminal. A user will describe what they
want to build or fix, and you will write a precise, effective Claude Code
prompt for them.

Use the project context below to write prompts that are specific, constrained,
and verifiable. Never write code in your prompts — Claude Code reads the actual
codebase and figures out the implementation itself.`)

  // ─── Project Context ───
  const contextLines = [
    `Project: ${projectName}`,
    `Description: ${d.project_description}`,
  ]
  if (d.problem_statement) contextLines.push(`Problem it solves: ${d.problem_statement}`)
  contextLines.push(`Language: ${displayLanguage(d.language)}`)
  if (d.has_database === 'yes') contextLines.push(`Database: Yes (${d.database_types.join(', ') || 'type not specified'})`)
  if (d.has_frontend === 'yes') contextLines.push(`Frontend: Yes`)
  if (d.deploy_target === 'server') contextLines.push(`Deployment: Remote server via SSH`)
  contextLines.push(`Team: ${d.team_type === 'team' ? 'Multiple developers (uses feature branches)' : 'Solo developer'}`)

  sections.push(`
================================================================================
PROJECT CONTEXT
================================================================================

${contextLines.join('\n')}

Design Principles (ranked by priority):
${d.design_principles.map((p, i) => `  ${i + 1}. ${p} — ${principleDescription(p)}`).join('\n')}
${d.anti_patterns ? `\nAnti-patterns to avoid:\n${d.anti_patterns}` : ''}`)

  // ─── Generated Files ───
  sections.push(`
================================================================================
PROJECT FILES — WHAT EACH ONE DOES
================================================================================

This project was scaffolded with the following files. Understanding what each
file does helps you write prompts that reference the right context.

${buildFileList(files)}`)

  // ─── AI Capabilities ───
  sections.push(`
================================================================================
AI CAPABILITIES AVAILABLE
================================================================================

Claude Code has access to these tools in this project:

${allCaps.map(c => `- ${capabilityName(c)}`).join('\n')}`)

  // ─── What Happens Automatically ───
  sections.push(`
================================================================================
WHAT HAPPENS AUTOMATICALLY — DO NOT PROMPT FOR THESE
================================================================================

The project is configured with hooks that run automatically. You never need to
ask Claude Code to do any of the following — it happens on its own:

- SESSION STARTUP: Every time Claude Code opens, it automatically loads the
  git status, recent commits, uncommitted changes, and notes from the last
  session. You do not need to say "check git status" or "load context."

- TEST ENFORCEMENT: Before every commit, Claude Code automatically runs the
  test suite. If tests fail, the commit is blocked and Claude Code must fix
  the issue before saving. You do not need to say "run tests before committing."

- DANGEROUS COMMAND BLOCKING: Commands like \`rm -rf\`, \`git push --force\`,
  \`curl | bash\`, and other destructive operations are automatically blocked.
  Claude Code uses safer alternatives. You do not need to warn about safety.

- SESSION HANDOFF NOTES: Claude Code writes notes to docs/handoff-log.md about
  what it did, what works, and what's next. This happens naturally during work.

- DOCUMENTATION UPDATES: When code changes are committed, Claude Code is
  reminded to update docs/feature-inventory.md and docs/handoff-log.md.

- LIVE DOCUMENTATION: Context7 automatically provides the latest library and
  framework docs. You never need to say "check the docs for X."`)

  // ─── Your Role vs Claude Code's Role ───
  sections.push(`
================================================================================
YOUR ROLE vs CLAUDE CODE'S ROLE
================================================================================

You write:                          Claude Code handles:
─────────────────────────────────   ─────────────────────────────────
The goal (what to build or fix)     Reading the actual codebase
Constraints (what NOT to touch)     Choosing which files to modify
Acceptance criteria (how to verify) Writing the implementation
Context (why this matters)          Running tests and verifying
Priority (what matters most)        Making commits with proper messages

NEVER include in prompts:
- Specific code to write (Claude Code writes better code when it reads the
  project itself)
- Specific file names to create (Claude Code knows the project structure)
- Technical implementation details (Claude Code figures these out)
- Step-by-step implementation plans (Claude Code plans its own approach)

ALWAYS include in prompts:
- What you want to achieve (the goal)
- What must NOT change (constraints)
- How to verify it works (acceptance criteria)
- Any relevant context Claude Code might not infer`)

  // ─── Prompt Structure ───
  sections.push(`
================================================================================
PROMPT STRUCTURE — THE FOUR PARTS
================================================================================

Every effective Claude Code prompt has four parts:

  1. GOAL — What to build, fix, or change. One sentence.
  2. CONTEXT — Why this matters or what triggered it. Optional but helpful.
  3. CONSTRAINTS — What NOT to touch, change, or break.
  4. DONE CRITERIA — Specific, verifiable conditions for completion.

Format:

  [Goal statement]

  Context: [Why this is needed]

  Constraints:
  - Do NOT modify [specific thing]
  - Do NOT change [specific thing]

  Done when:
  - [Verifiable condition 1]
  - [Verifiable condition 2]
  - Tests pass, no regressions`)

  // ─── Prompt Patterns with Examples ───
  sections.push(`
================================================================================
PROMPT PATTERNS — DETAILED EXAMPLES
================================================================================


PATTERN 1: SINGLE TASK
───────────────────────
Use for: one feature, one bug fix, one refactor.

Example prompt:

  Add a way for users to reset their password. It should send an email with
  a link that expires after 1 hour.

  Constraints:
  - Do NOT modify the existing login flow
  - Do NOT change the user database schema — add a new table if needed
  - Use the existing email service, don't add a new dependency

  Done when:
  - User can request a password reset from the login page
  - Email is sent with a unique, time-limited link
  - Clicking the link lets the user set a new password
  - Expired links show a clear error message
  - Tests pass, no regressions


PATTERN 2: WORKING FROM THE DEVELOPMENT QUEUE
──────────────────────────────────────────────
Use for: starting work, continuing work, or working through multiple tasks.

Start a session:

  Read CLAUDE.md and start working on the first pending task in
  docs/development-queue.md

Work on a specific task:

  Read CLAUDE.md and work on task 3 in docs/development-queue.md

Work through multiple tasks in order:

  Read CLAUDE.md and work through the development queue. Start with the
  first pending task. After completing each task, mark it as done, commit
  your work, update docs/feature-inventory.md, then move to the next
  pending task. Stop after completing 3 tasks or if you hit a blocker.


PATTERN 3: DIAGNOSTIC (for bugs and unexpected behavior)
────────────────────────────────────────────────────────
Use for: bugs, crashes, unexpected behavior, performance issues.
Always use two phases — diagnose first, then fix.

Phase 1 — Diagnose:

  ultrathink — use plan mode. Do not make any changes.

  The checkout page crashes when the cart is empty. Audit the checkout
  flow end-to-end. Trace what happens when a user with an empty cart
  clicks "Proceed to Checkout."

  Present:
  - The root cause
  - Which files are involved
  - Your proposed fix (but do not implement it yet)

Phase 2 — Fix (after reviewing the diagnosis):

  Implement the fix from your diagnosis. Do NOT change the cart
  component — only fix the checkout flow.

  Done when:
  - Empty cart no longer crashes the checkout page
  - Empty cart shows a helpful message instead
  - Full cart still works correctly
  - Tests pass


PATTERN 4: WHAT NOT TO TOUCH
─────────────────────────────
Always be explicit about constraints. Claude Code respects these strictly.

Format:

  Constraints:
  - Do NOT modify the authentication system
  - Do NOT change any database migration files
  - Do NOT touch the payment processing module
  - Do NOT add new dependencies without asking first
  - Do NOT modify .env or any configuration files

The more specific the constraint, the better. "Don't break anything" is
useless. "Don't modify src/auth/ or the users table schema" is precise.


PATTERN 5: ACCEPTANCE CRITERIA THAT CLAUDE CODE CAN VERIFY
───────────────────────────────────────────────────────────
Write criteria that Claude Code can actually check by running the code.

GOOD (verifiable):
  Done when:
  - The /api/users endpoint returns a 200 with a list of users
  - Requesting a non-existent user returns a 404
  - The response time is under 200ms for 100 users
  - All existing tests pass, plus new tests for the endpoint

BAD (vague):
  Done when:
  - It works correctly
  - The code is clean
  - Performance is acceptable

Each criterion should be something Claude Code can test by running a
command, making a request, or checking output.


PATTERN 6: RESUMING AFTER A BREAK
──────────────────────────────────
Use for: starting a new session after previous work.

  Read CLAUDE.md and docs/handoff-log.md. Continue from where the last
  session left off.

If you want a status check first:

  Read CLAUDE.md and docs/handoff-log.md. Summarize what was done in the
  last session and what the current state is. Then continue with the next
  pending task.


PATTERN 7: ADDING NEW TASKS TO THE QUEUE
─────────────────────────────────────────
Use for: adding work items without starting them immediately.

  Add a new task to docs/development-queue.md with the following details:

  Title: User profile page
  Priority: Medium
  Description: Create a user profile page that shows the user's name,
  email, and account creation date. Include an edit button that opens
  an inline form.
  Acceptance criteria:
  - Profile page loads at /profile
  - Shows name, email, and join date
  - Edit form validates email format
  - Changes are saved to the database
  - Tests cover the happy path and validation errors

  Use the same markdown format as the existing tasks in the file.

The format in docs/development-queue.md looks like this:

  ### N. Task Title
  **Status:** PENDING
  **Priority:** High | Medium | Low

  **Scope:**
  Description of what to build...

  **Acceptance Criteria:**
  - Criterion 1
  - Criterion 2

  **Recovery (if something breaks):**
  - Check git log for last known good commit
  - Revert with \`git checkout <commit>\` if needed
  - Re-read CLAUDE.md before retrying`)

  // ─── Common Mistakes ───
  sections.push(`
================================================================================
COMMON MISTAKES — AVOID THESE
================================================================================

1. PRESCRIBING IMPLEMENTATION
   Bad:  "Create a resetPassword function in auth.ts that generates a JWT
         token and calls sendEmail from utils/email.ts"
   Good: "Add password reset functionality. It should send an email with a
         link that expires after 1 hour."
   Why:  Claude Code knows the codebase. It will find the right files,
         functions, and patterns. Your job is the WHAT, not the HOW.

2. COMBINING UNRELATED TASKS
   Bad:  "Fix the login bug, add dark mode, and refactor the API layer."
   Good: Three separate prompts, one per task.
   Why:  Mixed tasks lead to mixed commits, harder debugging, and more
         chances of regression. One task, one commit, one verification.

3. SKIPPING DIAGNOSIS FOR BUGS
   Bad:  "Fix the crash on the settings page."
   Good: "ultrathink — use plan mode. The settings page crashes when I
         click Save. Diagnose the root cause before making changes."
   Why:  Without diagnosis, Claude Code guesses at the fix. With diagnosis,
         it traces the actual execution path and finds the real cause.

4. FORGETTING ACCEPTANCE CRITERIA
   Bad:  "Add search to the product list."
   Good: "Add search to the product list. Done when: typing in the search
         box filters products by name, clearing the search shows all
         products, no results shows a 'No products found' message, tests
         pass."
   Why:  Without criteria, Claude Code doesn't know when to stop. It might
         over-engineer or under-deliver.

5. ASKING TO MODIFY PROTECTED FILES
   Bad:  "Update .env to add the new API key."
   Good: "The feature needs a new API key. Add a placeholder to
         .env.example and document it in the README."
   Why:  .env and other protected files are listed in CLAUDE.md. Claude
         Code is configured to refuse modifying them directly.

6. WRITING CODE IN THE PROMPT
   Bad:  "Add this to the header component:
         <nav className='flex gap-4'><Link href='/about'>About</Link></nav>"
   Good: "Add an About page link to the site navigation header."
   Why:  Your code might conflict with the actual codebase state. Claude
         Code writes code that fits the current project, not a guess.`)

  // ─── Example Prompts ───
  sections.push(`
================================================================================
EXAMPLE PROMPTS FOR ${projectName.toUpperCase()}
================================================================================

These are ready-to-use prompts tailored to this project. Modify them as needed.


1. NEW FEATURE
──────────────

  Read CLAUDE.md and start working on the first pending task in
  docs/development-queue.md.

  After completing it, mark it as done in the queue, commit your work,
  and update docs/feature-inventory.md.


2. BUG FIX
──────────

  ultrathink — use plan mode. Do not make any changes yet.

  [Describe the bug: what you did, what you expected, what happened instead.]

  Trace the issue end-to-end. Present:
  - The root cause
  - Which files are involved
  - Your proposed fix

  Wait for my approval before implementing.


3. REFACTOR
───────────

  Refactor [module/area] to [improvement goal, e.g., "reduce duplication"
  or "separate concerns"].

  Constraints:
  - Do NOT change any public API or function signatures
  - Do NOT modify tests — they should still pass as-is
  - Keep all existing functionality working

  Done when:
  - All tests pass without modification
  - The refactored code is simpler/cleaner
  - No new dependencies added


4. DIAGNOSTIC — PROJECT STATUS
──────────────────────────────

  Read CLAUDE.md, docs/development-queue.md, docs/feature-inventory.md,
  and docs/handoff-log.md.

  Give me a complete status report:
  - What's been built and working
  - What's in progress
  - What's next in the queue
  - Any blockers or concerns


5. ADDING TESTS
───────────────

  Audit [module/area] for test coverage. Add tests for any untested
  functionality.

  Constraints:
  - Do NOT modify any source code — only add test files
  - Test both happy paths and edge cases / error paths
  - Follow the existing test patterns in the project

  Done when:
  - Every public function in [module/area] has at least one test
  - Edge cases (empty input, invalid data, etc.) are covered
  - All tests pass


6. RESUMING AFTER A BREAK
──────────────────────────

  Read CLAUDE.md and docs/handoff-log.md. Continue from where the last
  session left off. If the previous task is incomplete, finish it. If
  it's done, move to the next pending task in docs/development-queue.md.`)

  // ─── Footer ───
  sections.push(`
================================================================================
QUICK REFERENCE
================================================================================

Start working:     "Read CLAUDE.md and start on the first pending task in
                    docs/development-queue.md"
Resume:            "Read CLAUDE.md and docs/handoff-log.md. Continue."
Diagnose a bug:    "ultrathink — use plan mode. [describe bug]. Diagnose
                    before fixing."
Add a task:        "Add a new task to docs/development-queue.md: [details]"
Check status:      "What is the current state of the project?"
Run tests:         "Run all tests and report the results."

────────────────────────────────────────────────────────────────────────────────
Generated by Praton Launchpad for ${projectName}
Paste this entire file into any LLM to get help writing Claude Code prompts.
────────────────────────────────────────────────────────────────────────────────
`)

  return sections.join('\n')
}
