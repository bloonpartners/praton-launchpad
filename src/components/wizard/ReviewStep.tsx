import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

interface ReviewItem {
  id: string
  label: string
  description: string
  alwaysOn?: boolean
  showWhen?: (data: WizardData) => boolean
}

interface ReviewSection {
  title: string
  items: ReviewItem[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildSections(_data: WizardData): ReviewSection[] {
  return [
    {
      title: 'Project Files',
      items: [
        { id: 'claude_md', label: 'Project brief (CLAUDE.md)', description: 'Instructions Claude Code reads every session' },
        { id: 'settings_json', label: 'Quality settings (.claude/settings.json)', description: 'Permissions and safety checks' },
        { id: 'dev_queue', label: 'Task list (docs/development-queue.md)', description: 'Your goals and next steps' },
        { id: 'philosophy', label: 'Design principles (docs/philosophy.md)', description: 'What matters and what to avoid' },
        { id: 'feature_inventory', label: 'Feature tracker (docs/feature-inventory.md)', description: "Tracks what's been built" },
        { id: 'handoff_log', label: 'Session notes (docs/handoff-log.md)', description: 'Claude Code remembers what happened between sessions' },
        { id: 'gitignore', label: 'Version control (.gitignore)', description: 'Keeps sensitive files safe' },
      ],
    },
    {
      title: 'Quality Checks',
      items: [
        { id: 'session_start', label: 'Session startup checks', description: 'Loads context and checks project health at the start of each session' },
        { id: 'test_enforce', label: 'Test enforcement on commit', description: 'Tests must pass before code is saved' },
        { id: 'cmd_blocker', label: 'Dangerous command blocker', description: 'Prevents accidental destructive commands' },
        { id: 'deploy_sync', label: 'Deploy sync', description: 'Keeps server and local code in sync after deployment', showWhen: (d) => d.deploy_target === 'server' },
        { id: 'deploy_verify', label: 'Deploy verification', description: 'Checks server health after deployment', showWhen: (d) => d.deploy_target === 'server' && d.has_database === 'yes' },
        { id: 'schema_rules', label: 'Schema rules', description: 'Claude Code reads database structure before making changes', showWhen: (d) => d.has_database === 'yes' },
      ],
    },
    {
      title: 'AI Tools',
      items: [
        { id: 'context7', label: 'Live Documentation (Context7)', description: 'Always uses latest library docs', alwaysOn: true },
        { id: 'perplexity', label: 'Web Research (Perplexity)', description: 'Can search the internet while coding', showWhen: (d) => d.capabilities.includes('perplexity') },
        { id: 'playwright', label: 'Browser Testing (Playwright)', description: 'Can see what your website looks like', showWhen: (d) => d.capabilities.includes('playwright') },
        { id: 'postgres', label: 'Database Access (Postgres)', description: 'Can query your database directly', showWhen: (d) => d.capabilities.includes('postgres') },
        { id: 'shell', label: 'Server Access (Shell)', description: 'Can manage your server remotely', showWhen: (d) => d.capabilities.includes('shell') },
      ],
    },
    {
      title: 'Starter Guides',
      items: [
        { id: 'pdf_guide', label: 'Getting Started Guide (PDF)', description: 'How to use your new project' },
        { id: 'prompt_advisor', label: 'Prompt writing guide', description: 'Paste into any AI to get help writing Claude Code prompts' },
        { id: 'launchers', label: 'Launcher scripts', description: 'Double-click to start Claude Code' },
      ],
    },
  ]
}

export function ReviewStep({ onNext, onBack }: StepProps) {
  const { watch, setValue } = useFormContext<WizardData>()
  const data = watch()
  const toggles = data.review_toggles

  const sections = buildSections(data)

  // Initialize all toggles to ON on first render
  useEffect(() => {
    if (Object.keys(toggles).length > 0) return
    const defaults: Record<string, boolean> = {}
    for (const section of sections) {
      for (const item of section.items) {
        if (!item.showWhen || item.showWhen(data)) {
          defaults[item.id] = true
        }
      }
    }
    setValue('review_toggles', defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (id: string) => {
    setValue('review_toggles', { ...toggles, [id]: !toggles[id] })
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-[28px] font-bold text-navy leading-tight mb-2">
        Review Your Setup
      </h2>
      <p className="text-base text-text-secondary mb-8">
        Here's everything that will be included in your project. Toggle items
        off if you don't need them.
      </p>

      <div className="space-y-6 mb-8">
        {sections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.showWhen || item.showWhen(data)
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-navy mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isOn = item.alwaysOn || toggles[item.id] !== false
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-bg-secondary transition-colors"
                    >
                      <button
                        type="button"
                        disabled={item.alwaysOn}
                        onClick={() => toggle(item.id)}
                        className={`shrink-0 w-9 h-5 rounded-full transition-colors relative ${
                          item.alwaysOn
                            ? 'bg-accent/50 cursor-not-allowed'
                            : isOn
                              ? 'bg-accent cursor-pointer'
                              : 'bg-gray-300 cursor-pointer'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            isOn ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <div className="min-w-0">
                        <span
                          className={`text-sm font-medium ${
                            isOn ? 'text-navy' : 'text-gray-400'
                          }`}
                        >
                          {item.label}
                        </span>
                        <p
                          className={`text-xs ${
                            isOn ? 'text-text-secondary' : 'text-gray-300'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 text-text-secondary hover:text-navy transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
