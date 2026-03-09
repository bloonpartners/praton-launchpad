import { useFormContext } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

function SingleSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${
            value === opt.value
              ? 'border-accent bg-accent/5 text-accent'
              : 'border-gray-200 text-text-secondary hover:border-gray-300 bg-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MultiChips({
  selected,
  onChange,
  options,
}: {
  selected: string[]
  onChange: (v: string[]) => void
  options: string[]
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
            selected.includes(opt)
              ? 'border-accent bg-accent/5 text-accent'
              : 'border-gray-200 text-text-secondary hover:border-gray-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export function TechnicalSetupStep({ onNext, onBack }: StepProps) {
  const { watch, setValue } = useFormContext<WizardData>()

  const language = watch('language')
  const hasDatabase = watch('has_database')
  const databaseTypes = watch('database_types')
  const hasFrontend = watch('has_frontend')
  const deployTarget = watch('deploy_target')
  const teamType = watch('team_type')

  const canContinue =
    language !== '' &&
    hasDatabase !== '' &&
    hasFrontend !== '' &&
    deployTarget !== '' &&
    teamType !== ''

  return (
    <div className="flex flex-col">
      <h2 className="text-[28px] font-bold text-navy leading-tight mb-2">
        Technical Setup
      </h2>
      <p className="text-base text-text-secondary mb-8">
        These answers determine which tools and quality checks are included in your project.
      </p>

      <div className="space-y-7 mb-8">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            What programming language will you primarily use? <span className="text-accent">*</span>
          </label>
          <SingleSelect
            value={language}
            onChange={(v) => setValue('language', v as WizardData['language'])}
            options={[
              { value: 'python', label: 'Python' },
              { value: 'javascript', label: 'JavaScript / TypeScript' },
              { value: 'go', label: 'Go' },
              { value: 'rust', label: 'Rust' },
              { value: 'both', label: 'Both (Python + JS)' },
              { value: 'other', label: 'Other' },
              { value: 'not_sure', label: 'Not sure' },
            ]}
          />
        </div>

        {/* Database */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Will your project store data? <span className="text-accent">*</span>
          </label>
          <SingleSelect
            value={hasDatabase}
            onChange={(v) => {
              setValue('has_database', v as WizardData['has_database'])
              if (v !== 'yes') setValue('database_types', [])
            }}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'not_sure', label: 'Not sure yet' },
            ]}
          />
          {hasDatabase === 'yes' && (
            <div className="mt-3 ml-1">
              <label className="block text-xs font-medium text-text-secondary mb-2">
                What kind? <span className="font-normal">(optional)</span>
              </label>
              <MultiChips
                selected={databaseTypes}
                onChange={(v) => setValue('database_types', v)}
                options={[
                  'User accounts',
                  'Products / inventory',
                  'Documents / content',
                  'Analytics / logs',
                  'Other',
                ]}
              />
            </div>
          )}
        </div>

        {/* Frontend */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Will your project have a website or app that users interact with? <span className="text-accent">*</span>
          </label>
          <SingleSelect
            value={hasFrontend}
            onChange={(v) => setValue('has_frontend', v as WizardData['has_frontend'])}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'later', label: 'Later' },
            ]}
          />
        </div>

        {/* Deploy target */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Where will your project run when it's live? <span className="text-accent">*</span>
          </label>
          <SingleSelect
            value={deployTarget}
            onChange={(v) => setValue('deploy_target', v as WizardData['deploy_target'])}
            options={[
              { value: 'local', label: 'My computer only' },
              { value: 'server', label: 'A server' },
              { value: 'not_sure', label: 'Not sure yet' },
            ]}
          />
        </div>

        {/* Team */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Will you work alone or with a team? <span className="text-accent">*</span>
          </label>
          <SingleSelect
            value={teamType}
            onChange={(v) => setValue('team_type', v as WizardData['team_type'])}
            options={[
              { value: 'alone', label: 'Alone' },
              { value: 'team', label: 'With a team' },
            ]}
          />
        </div>
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
          disabled={!canContinue}
          className="flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
