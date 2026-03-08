# Brand Guidelines — Praton Launchpad

## Colors

| Role | Hex | Usage |
|------|-----|-------|
| Primary Dark (Navy) | `#0A1628` | Headers, navigation, primary text |
| Accent (Orange) | `#FF6B35` | Primary buttons/CTAs, highlights, progress bar active state |
| Background | `#FFFFFF` | Primary background |
| Secondary Background | `#F8FAFC` | Alternating sections, cards |
| Text Primary | `#0F172A` | Body text |
| Text Secondary | `#64748B` | Subtext, descriptions, helper text |

## Typography

- Headlines: Inter or DM Sans, bold weight, large sizes
- Body: Inter or DM Sans, regular/medium weight
- Code blocks: JetBrains Mono or Fira Code

## Logo

File: `docs/praton_logo`

Geometric "P" monogram inside square frame with orange accent square at bottom-right. Wordmark "PRATON" in bold sans-serif below. Use on welcome screen and done screen. Also embed in the generated Getting Started PDF.

## UI Components

- **Buttons:** Rounded rectangles. Primary = orange background, white text. Secondary = navy outline, navy text.
- **Cards:** White background, subtle shadow (`shadow-sm`), rounded corners (`rounded-lg`)
- **Progress bar:** Navy track, orange fill for completed steps
- **Toggles:** Orange when active, gray when inactive
- **Input fields:** Clean border, rounded, focus ring in orange
- **Icons:** Minimal, line-style. Use lucide-react.

## Layout Principles

- Clean, spacious — generous whitespace everywhere
- One question/section visible at a time — no long scrolling forms
- Card-based layout for review screen and capability selection
- Large friendly text — minimum 16px body, 24px+ section headers
- Progress indicator at top showing current step

## Wizard-Specific Design

- **Step container:** Centered, max-width ~640px, generous vertical padding
- **Step title:** Large (28-32px), navy, bold
- **Step description:** Text secondary color, 16-18px, below title
- **Navigation:** Back/Next buttons at bottom. Next = orange primary. Back = text-only or secondary.
- **Form fields:** Full width within container, 12-16px vertical spacing between fields
- **Multi-select chips:** Orange border when selected, gray when not. Rounded pill shape.
- **Capability toggles:** Card per capability with icon, title, one-line description, toggle on right side

## Tone in UI Copy

- Professional but accessible
- No technical jargon — plain language
- Confident and direct
- Never say "MCP server" — say "AI tool" or "capability"
- Never say "hook" — say "quality check" or "safety check"
- Never say "git" — say "version control" or "save points"

## Don't

- No gradients
- No stock tech imagery
- No dark mode (keep it clean white)
- No animations beyond subtle transitions
- No emojis in the UI (use icons instead)
