# Configuration Matrix

Maps every questionnaire answer to every file and content block it generates.

## Question → File Impact Map

### Q: Project Name
| File | What changes |
|------|-------------|
| Directory name | `{projectSlug}/` |
| CLAUDE.md | `# Project: {projectName}` header |
| All launcher scripts | `cd {projectSlug}` path |
| PDF title | "Getting Started with {projectName}" |
| Prompt Advisor | "This project is called {projectName}" |
| .gitignore | No impact |

### Q: Project Description
| File | What changes |
|------|-------------|
| CLAUDE.md | Inserted under header as project description |
| philosophy.md | Intro paragraph |
| Prompt Advisor | Full context block |
| PDF | Project overview section |

### Q: What problem does it solve?
| File | What changes |
|------|-------------|
| philosophy.md | "Problem Statement" section |
| development-queue.md | Context header above task list |

### Q: Design Principles (multi-select)
| Selection | CLAUDE.md impact | philosophy.md impact |
|-----------|-----------------|---------------------|
| Simplicity | "Prefer simple, readable code over clever solutions" | Listed as principle #N |
| Speed | "Optimize for performance. Profile before optimizing." | Listed as principle #N |
| Security | Full security rules section added (validate inputs, parameterize queries, never log sensitive data, never trust client data) | Listed as principle #N |
| Scalability | "Design for horizontal scaling. Avoid shared mutable state." | Listed as principle #N |
| User Experience | "Every user-facing change must be visually verified" | Listed as principle #N |
| Reliability | "Prefer defensive coding. Handle every error path." | Listed as principle #N |
| Low Cost | "Minimize API calls and external service usage" | Listed as principle #N |
| Privacy | "Never collect data you don't need. Encrypt at rest." | Listed as principle #N |

### Q: Anti-patterns (free text)
| File | What changes |
|------|-------------|
| philosophy.md | "Anti-Patterns" section with user's text |
| CLAUDE.md | If specific files/dirs mentioned → added to Protected Files |

### Q: Programming Language
| Selection | CLAUDE.md commands | settings.json permissions.allow | pre-commit-check.sh | session-start.sh | .gitignore |
|-----------|-------------------|-------------------------------|---------------------|------------------|------------|
| Python | pip, pytest, ruff | `Bash(python -m pytest *)`, `Bash(ruff *)`, `Bash(pip *)` | `python -m pytest` | Detects requirements.txt/pyproject.toml | `__pycache__/`, `*.pyc`, `.venv/` |
| JavaScript/TS | npm, jest/vitest, eslint | `Bash(npm run *)`, `Bash(npx *)` | `npm test` | Detects package.json | `node_modules/`, `dist/`, `.next/` |
| Both | All of above | All of above | Both test runners | Both detections | Both patterns |
| Other | Generic placeholders | `Bash(make *)` | `echo "Configure test command"` | Generic | Minimal |
| Not sure | None (guidance only) | Minimal set | Skip test check | Generic | Minimal |

### Q: Database
| Answer | Files generated | Content impact |
|--------|----------------|----------------|
| Yes | `.claude/rules/schema.md` | CLAUDE.md adds DB layer to architecture |
| Yes + DB Access capability | `.mcp.json` adds Postgres entry | Prompt Advisor mentions DB access |
| No | Nothing extra | — |
| Not sure | Nothing extra | CLAUDE.md adds: "When you add a database, create .claude/rules/schema.md" |

### Q: Frontend
| Answer | Files generated | Content impact |
|--------|----------------|----------------|
| Yes | — | CLAUDE.md adds frontend layer to architecture |
| Yes + Browser Testing | `.mcp.json` adds Playwright entry | session-start.sh adds frontend file change detection |
| No | — | — |
| Later | — | CLAUDE.md adds: "When you add a frontend, consider enabling Browser Testing" |

### Q: Deployment Target
| Answer | Files generated | Content impact |
|--------|----------------|----------------|
| My computer only | — | — |
| A server | `.claude/hooks/post-deploy-sync.sh` | CLAUDE.md adds deploy rules |
| | `.claude/hooks/post-deploy-verify.sh` (if also has DB) | session-start.sh adds sync check |
| | `.claude/hooks/pre-compact-handoff.sh` | Launcher adds VPS-specific scripts |
| | session-start.sh adds tunnel startup | Prompt Advisor mentions deploy workflow |
| A server + SSH provided | All above + `.mcp.json` Shell entry configured | SSH address in hook scripts |
| A server + Server Access capability | All above + `.mcp.json` Shell entry | — |
| Not sure | — | CLAUDE.md adds: "When you choose a deployment target, run the setup wizard again or configure manually" |

### Q: Team vs Solo
| Answer | CLAUDE.md impact | settings.json impact |
|--------|-----------------|---------------------|
| Alone | "Commit after every task" | `deny: ["Bash(git push --force *)"]` |
| Team | "Use feature branches. Never push to main." | `allow: ["Bash(git push *)"]`, `deny: ["Bash(git push --force *)"]` |

### Q: AI Capabilities (toggles)
| Capability | .mcp.json entry | Credential needed | Prompt Advisor mention |
|------------|----------------|-------------------|----------------------|
| Context7 (always on) | `context7` server config | None | "Your AI has live documentation access" |
| Perplexity | `perplexity` server config | Perplexity API key | "Your AI can research online while coding" |
| Playwright | `playwright` server config | None | "Your AI can test your website visually" |
| Postgres | `postgres-mcp` server config | Connection string | "Your AI can query your database directly" |
| Shell | `shell-mcp` server config | SSH address | "Your AI can manage your server remotely" |

### Q: First Goal + Acceptance Criteria
| File | What changes |
|------|-------------|
| development-queue.md | Task 1 with full format: title, Status: PENDING, Priority: High, Scope (from description), Acceptance Criteria (from user input), Recovery section (template) |
| PDF | "Your first task" section |
| Done screen | Shows task title |

### Q: Additional Goals (2-4)
| File | What changes |
|------|-------------|
| development-queue.md | Tasks 2-4 with same format, Priority: Medium, Recovery template |

---

## Always-Generated Files (11 files)

| # | File | Consumer |
|---|------|----------|
| 1 | CLAUDE.md | Claude Code reads every session |
| 2 | .claude/settings.json | Claude Code loads permissions + hooks |
| 3 | .claude/hooks/session-start.sh | Fires on SessionStart event |
| 4 | .claude/hooks/pre-commit-check.sh | Fires on PostToolUse when git commit detected |
| 5 | .claude/hooks/pre-bash-firewall.sh | Fires on PreToolUse for Bash commands |
| 6 | .mcp.json | Claude Code loads MCP servers on startup |
| 7 | docs/development-queue.md | Claude Code reads for task list |
| 8 | docs/philosophy.md | Claude Code reads for design principles |
| 9 | docs/feature-inventory.md | Hooks check for updates |
| 10 | docs/handoff-log.md | Claude Code writes session notes |
| 11 | .gitignore | Git uses for exclusions |

Plus non-code outputs:
- Launcher scripts (.bat/.command/.sh per detected OS)
- Getting Started Guide.pdf
- Claude Code Prompt Advisor.txt

## Questionnaire-Driven Files

| File | Trigger |
|------|---------|
| .claude/CLAUDE.md | Complex project (DB + VPS + frontend + backend) |
| .claude/rules/schema.md | Database = Yes |
| .claude/hooks/post-deploy-sync.sh | Deploy = Server |
| .claude/hooks/post-deploy-verify.sh | Deploy = Server AND Database = Yes |
| .claude/hooks/pre-compact-handoff.sh | Deploy = Server OR complex project |
| .claude/hooks/lint-on-save.sh | Language has known linter (Python→ruff, JS→eslint) |
| .claude/hooks/protect-files.sh | Database = Yes OR user specified protected files |
