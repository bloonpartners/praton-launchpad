# Praton Launchpad

Free web wizard that generates professional Claude Code project scaffolds. Users answer questions, tool generates config files as a downloadable .zip.

## Architecture

- Static React app (Vite + React + TypeScript + Tailwind)
- Client-side only — no backend, no server
- Zip: `client-zip` (2.6KB, zero deps)
- PDF: `@react-pdf/renderer` (Getting Started Guide)
- Hosted on Vercel, deployed from GitHub

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run linter

## Project Map

- `src/components/wizard/` — wizard step components (10 screens)
- `src/generators/engine.ts` — takes questionnaire answers → produces file list
- `src/generators/templates/` — template functions per generated file
- `src/generators/pdf/` — @react-pdf Getting Started Guide
- `src/types/wizard.ts` — WizardData type definitions
- `src/lib/telemetry.ts` — anonymous POST (fire-and-forget)
- `src/lib/zipBuilder.ts` — client-zip wrapper

## Key References

- Configuration matrix (question → file mapping): `docs/configuration-matrix.md`
- File templates with placeholders: `docs/file-templates.md`
- Architecture decisions and rationale: `docs/architecture-decisions.md`
- Wizard flow (10 screens, every field): `docs/wizard-flow.md`
- Brand guidelines (colors, typography, UI): `docs/brand-guidelines.md`
- Telemetry schema (Supabase): `docs/telemetry-schema.md`

## Behavioral Rules

### Debugging
- Read the ENTIRE error before proposing a fix
- After 2 failed attempts, STOP and re-analyze
- Never modify a test to make it pass

### Scope
- Only modify files related to the current task
- Unrelated issues: note but do NOT fix

### Implementation
- Read existing code before modifying
- Smallest change that solves the problem
- Run lint after every change

## Self-Maintenance

- When this file exceeds ~150 lines, extract detail into .claude/CLAUDE.md
- When >10 gotchas accumulate, create .claude/skills/launchpad/SKILL.md
