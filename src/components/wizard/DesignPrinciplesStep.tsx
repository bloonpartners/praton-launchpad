import { useFormContext } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

const PRINCIPLES = [
  'Simplicity',
  'Speed',
  'Security',
  'Scalability',
  'User Experience',
  'Reliability',
  'Low Cost',
  'Privacy',
]

export function DesignPrinciplesStep({ onNext, onBack }: StepProps) {
  const { watch, setValue, register } = useFormContext<WizardData>()
  const selected = watch('design_principles')

  const togglePrinciple = (principle: string) => {
    if (selected.includes(principle)) {
      setValue('design_principles', selected.filter((p) => p !== principle))
    } else if (selected.length < 3) {
      setValue('design_principles', [...selected, principle])
    }
  }

  const canContinue = selected.length >= 1

  return (
    <div className="flex flex-col">
      <h2 className="text-[28px] font-bold text-navy leading-tight mb-2">
        Design Principles
      </h2>
      <p className="text-base text-text-secondary mb-8">
        Claude Code uses these to make decisions when there are multiple ways to build something.
      </p>

      <div className="space-y-6 mb-8">
        {/* Principle chips */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            What matters most for your project? Pick up to 3. <span className="text-accent">*</span>
          </label>
          <p className="text-xs text-text-secondary mb-3">
            {selected.length}/3 selected
          </p>
          <div className="flex flex-wrap gap-2">
            {PRINCIPLES.map((principle) => {
              const isSelected = selected.includes(principle)
              const isDisabled = !isSelected && selected.length >= 3
              return (
                <button
                  key={principle}
                  type="button"
                  onClick={() => togglePrinciple(principle)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-accent bg-accent/5 text-accent'
                      : isDisabled
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 text-text-secondary hover:border-gray-300'
                  }`}
                >
                  {principle}
                </button>
              )
            })}
          </div>
        </div>

        {/* Anti-patterns */}
        <div>
          <label htmlFor="anti_patterns" className="block text-sm font-medium text-navy mb-1.5">
            Anything you definitely want to avoid? <span className="text-text-secondary font-normal">(optional)</span>
          </label>
          <textarea
            id="anti_patterns"
            {...register('anti_patterns')}
            rows={3}
            placeholder="e.g. No user tracking, no subscriptions, no mobile app for now, don't use WordPress"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
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
