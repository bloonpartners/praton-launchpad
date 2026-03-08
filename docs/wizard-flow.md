# Wizard Flow

10 screens. Each field maps to specific file content via the configuration matrix.

## Screen 1: Welcome + Consent

**Purpose:** Branding, explain what the tool does, telemetry consent.

**Content:**
- Praton branding/logo
- Headline: "Set up a professional Claude Code project in minutes"
- One paragraph explaining: "This tool creates a complete project folder with AI coding assistant configuration, quality checks, and starter documentation — all based on your project's needs."
- Telemetry notice: "This tool sends your project configuration answers (project type, language, deployment target) anonymously to Praton to improve the tool. No personal data, API keys, or code is collected. By proceeding, you agree to this."
- [Continue] [Exit] — no skip option. This is the deal.

**Validation:** Must click Continue to proceed.

## Screen 2: Claude Code Authentication

**Purpose:** Ensure they can actually use Claude Code.

**Content:**
- "To use your AI coding assistant, you need a Claude account."
- Three cards (not dropdown):
  - **"I have a Claude Pro or Max subscription"** → "Great, you'll log in when you first open the project. Nothing to configure now." → Store auth_type = "subscription"
  - **"I have an Anthropic API key"** → Paste field + [Verify] button → Store auth_type = "api_key", store key
  - **"I don't have either"** → Side-by-side comparison:
    - Subscription: $20/mo, simple, recommended for beginners. Link to claude.ai/pricing
    - API: pay per use, flexible. Link to console.anthropic.com
    - "Come back after signing up." Wizard stays on this screen.
- Cost expectations note: "Claude Code uses the Anthropic API which charges per use. Set a spending limit in your Anthropic console to avoid surprises."

**Validation:** Must select an auth path. API key must verify if provided.

## Screen 3: Project Identity

**Fields:**

| Field | Type | Required | Maps To |
|-------|------|----------|---------|
| Project name | Text input | Yes | Directory name, CLAUDE.md header, launchers, PDF title |
| → Auto-generates slug | Display only | — | `my-cool-app` preview |
| Where to create | Note: "You'll choose where to save when downloading" | — | — |
| Project description | Textarea (paragraph) | Yes | CLAUDE.md "Why", philosophy.md intro, Prompt Advisor |
| What problem does it solve? | Textarea (paragraph) | Yes | philosophy.md, development-queue.md context |

**Validation:** Name required (no spaces, no special chars — auto-slug). Description required (min 20 chars).

## Screen 4: Design Principles

**Fields:**

| Field | Type | Required | Maps To |
|-------|------|----------|---------|
| What matters most? (pick up to 3) | Multi-select chips | Yes (min 1) | philosophy.md design principles, CLAUDE.md rules |
| Options: Simplicity, Speed, Security, Scalability, User Experience, Reliability, Low Cost, Privacy | | | |
| What will you NOT do? | Textarea (optional) | No | philosophy.md anti-patterns, CLAUDE.md constraints |

**Logic:** If Security selected → CLAUDE.md gets security rules section (validate inputs, parameterize queries, never log sensitive data).

## Screen 5: Technical Setup

**Fields:**

| Field | Type | Required | Maps To |
|-------|------|----------|---------|
| Programming language | Single select | Yes | Commands, permissions, test command, lint hook, .gitignore |
| Options: Python, JavaScript/TypeScript, Both, Other, Not sure | | | |
| Will your project store data? | Single select | Yes | Database MCP, schema rule, CLAUDE.md architecture |
| Options: Yes, No, Not sure yet | | | |
| → If Yes: What kind? | Multi-select | No | development-queue.md context |
| Options: User accounts, Products/inventory, Documents/content, Analytics/logs, Other | | | |
| Will it have a website/app users interact with? | Single select | Yes | Playwright MCP, frontend growth check |
| Options: Yes, No, Later | | | |
| Where will it run when live? | Single select | Yes | VPS hooks, Shell MCP, deploy rules |
| Options: My computer only, A server, Not sure yet | | | |
| → If Server: SSH address | Text (optional) | No | .mcp.json Shell entry, session-start tunnels |
| Work alone or with a team? | Single select | Yes | Git conventions, push permissions |
| Options: Alone, With a team | | | |

**Logic:**
- "Not sure" is valid for language, database, and deployment. Generates sensible defaults.
- "Not sure" for language → CLAUDE.md says "Your AI assistant will help you choose the right language."
- "Not sure yet" for database → no DB-specific files, but CLAUDE.md mentions "When you add a database, create .claude/rules/schema.md"

## Screen 6: AI Capabilities

**Purpose:** Show what's possible, let them toggle. Filtered by previous answers.

**Content:**
- "Your AI coding assistant can connect to additional tools. Select the ones you'd like:"

| Capability | Description shown to user | MCP server | Shown when |
|------------|--------------------------|------------|------------|
| Live Documentation | "Always uses latest library docs instead of outdated knowledge" | Context7 | Always (pre-selected, always on) |
| Web Research | "Can search the internet while coding to find solutions and check docs" | Perplexity | Always |
| Browser Testing | "Can open a browser and see what your website looks like after changes" | Playwright | Q8 frontend = Yes |
| Database Access | "Can query your database directly to verify code works with real data" | Postgres | Q7 database = Yes |
| Server Access | "Can check server health, read logs, and deploy code remotely" | Shell | Q9 deploy = Server |

**Logic:** Each toggle on → credential needed on Screen 8. Context7 cannot be toggled off.

## Screen 7: Goals

**Fields:**

| Field | Type | Required | Maps To |
|-------|------|----------|---------|
| What's the first thing you want to build? | Textarea | Yes | development-queue.md task 1 |
| What does "done" look like for this? | Textarea | Yes | development-queue.md task 1 acceptance criteria |
| What comes after that? | Textarea | No | development-queue.md task 2 |
| And after that? | Textarea | No | development-queue.md task 3 |
| And one more? | Textarea | No | development-queue.md task 4 |

**Logic:** Tasks 2-4 only show "next" field after previous is filled. Each task gets full queue entry format with Recovery section placeholder.

## Screen 8: Credentials

**Purpose:** Collect API keys/connection strings for selected MCP servers. Only shows fields for what they selected.

**Logic:** Only renders cards for capabilities toggled ON in Screen 6 that require credentials.

| Capability | What to show | Input | Guide |
|------------|-------------|-------|-------|
| Web Research (Perplexity) | "To enable web research, you need a Perplexity API key" | API key input + [Verify] | Link to perplexity.ai/settings/api, step-by-step |
| Database Access (Postgres) | "Your database connection string" | Connection string input | Example format shown, explanation of each part |
| Server Access (Shell) | "Your server SSH address" | SSH address input | Example: user@ip-address, link to SSH key setup guide |

**Every field has:** "Skip for now, I'll set this up later" option. Skipped fields get placeholder in .mcp.json with a TODO comment.

**Not shown here:** Anthropic auth — handled in Screen 2. Context7 — no credentials needed. Playwright — no credentials needed.

## Screen 9: Review

**Purpose:** Show everything that will be generated. Toggleable.

**Layout:** Grouped sections with toggles:

**Project Files:**
- ✅ CLAUDE.md — "AI assistant instructions and project rules"
- ✅ .claude/settings.json — "Permissions and quality checks"
- ✅ docs/development-queue.md — "Your task list with recovery checkpoints"
- ✅ docs/philosophy.md — "Design principles and anti-patterns"
- ✅ docs/feature-inventory.md — "Track what's built"
- ✅ docs/handoff-log.md — "Session continuity notes"
- ✅ .gitignore — "Keeps sensitive files out of version control"

**Quality Checks (Hooks):**
- ✅ Session startup checks — "Detects growth, checks sync, loads context"
- ✅ Test enforcement on commit — "Tests must pass before code is saved"
- ✅ Dangerous command blocker — "Prevents accidental destructive commands"
- (if VPS) ✅ Post-deploy sync — "Keeps server and local code in sync"
- (if VPS+DB) ✅ Post-deploy verify — "Checks server health after deployment"
- (if DB) ✅ Schema rules — "AI reads database schema before making changes"

**AI Tools:**
- ✅ Live Documentation (Context7) — always on
- (if selected) ✅ Web Research (Perplexity)
- (if selected) ✅ Browser Testing (Playwright)
- (if selected) ✅ Database Access (Postgres)
- (if selected) ✅ Server Access (Shell)

**Starter Guides:**
- ✅ Getting Started Guide (PDF) — "How to use your new project"
- ✅ Claude Code Prompt Advisor — "Paste into any AI to get prompt-writing help"
- ✅ Launcher scripts — "Double-click to start coding"

**Logic:** Advanced users toggle items off. Non-engineers click Continue. Everything defaults to ON.

## Screen 10: Done

**Content:**
- "Your project is ready!"
- [Download Project .zip] button (prominent)
- "After downloading:"
  1. "Unzip the folder"
  2. "Open the Getting Started Guide (PDF) inside"
  3. "Double-click 'Start Claude Code' to begin"
  4. "When Claude Code opens, type: **Read CLAUDE.md and start working on the first task in the development queue**"
- "Your first task is already queued: {shows task 1 title from Screen 7}"
- Praton branding: "Built by Praton. For hands-on workshops on AI-assisted development, visit praton.com"
