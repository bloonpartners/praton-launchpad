import { useFormContext } from 'react-hook-form'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Globe,
  Monitor,
  Database,
  Server,
} from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

interface Capability {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  alwaysOn?: boolean
  showWhen?: (data: WizardData) => boolean
}

const CAPABILITIES: Capability[] = [
  {
    id: 'context7',
    icon: <BookOpen size={20} />,
    title: 'Live Documentation',
    description:
      'Always uses the latest library and framework docs instead of outdated knowledge.',
    alwaysOn: true,
  },
  {
    id: 'perplexity',
    icon: <Globe size={20} />,
    title: 'Web Research',
    description:
      'Can search the internet while coding to find solutions and check documentation.',
  },
  {
    id: 'playwright',
    icon: <Monitor size={20} />,
    title: 'Browser Testing',
    description:
      'Can open a browser and see what your website actually looks like after making changes.',
    showWhen: (data) => data.has_frontend === 'yes',
  },
  {
    id: 'postgres',
    icon: <Database size={20} />,
    title: 'Database Access',
    description:
      'Can query your database directly to verify code works with real data.',
    showWhen: (data) => data.has_database === 'yes',
  },
  {
    id: 'shell',
    icon: <Server size={20} />,
    title: 'Server Access',
    description:
      'Can check server health, read logs, and deploy code remotely.',
    showWhen: (data) => data.deploy_target === 'server',
  },
]

export function CapabilitiesStep({ onNext, onBack }: StepProps) {
  const { watch, setValue } = useFormContext<WizardData>()
  const capabilities = watch('capabilities')
  const formData = watch()

  const visibleCapabilities = CAPABILITIES.filter(
    (cap) => !cap.showWhen || cap.showWhen(formData)
  )

  const toggle = (id: string) => {
    if (capabilities.includes(id)) {
      setValue('capabilities', capabilities.filter((c) => c !== id))
    } else {
      setValue('capabilities', [...capabilities, id])
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-[28px] font-bold text-navy leading-tight mb-2">
        AI Capabilities
      </h2>
      <p className="text-base text-text-secondary mb-8">
        Connect additional tools to make Claude Code more effective. These are
        configured automatically in your project.
      </p>

      <div className="space-y-3 mb-8">
        {visibleCapabilities.map((cap) => {
          const isOn = cap.alwaysOn || capabilities.includes(cap.id)
          return (
            <div
              key={cap.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                isOn
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div
                className={`shrink-0 ${isOn ? 'text-accent' : 'text-text-secondary'}`}
              >
                {cap.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-navy">
                    {cap.title}
                  </span>
                  {cap.alwaysOn && (
                    <span className="text-[11px] text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-full">
                      Included by default
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {cap.description}
                </p>
              </div>
              <button
                type="button"
                disabled={cap.alwaysOn}
                onClick={() => toggle(cap.id)}
                className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${
                  cap.alwaysOn
                    ? 'bg-accent/50 cursor-not-allowed'
                    : isOn
                      ? 'bg-accent cursor-pointer'
                      : 'bg-gray-300 cursor-pointer'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
