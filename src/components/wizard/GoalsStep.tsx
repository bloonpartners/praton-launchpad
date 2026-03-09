import { useFormContext } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

export function GoalsStep({ onNext, onBack }: StepProps) {
  const { register, watch } = useFormContext<WizardData>()

  const goal1 = watch('goal1_description')
  const goal2 = watch('goal2_description')
  const goal3 = watch('goal3_description')

  return (
    <div className="flex flex-col">
      <h2 className="text-[28px] font-bold text-navy leading-tight mb-2">
        Goals
      </h2>
      <p className="text-base text-text-secondary mb-8">
        If you already know what you want to build, add it here. If not, skip
        this — you can add tasks to your development queue later.
      </p>

      <div className="space-y-6 mb-8">
        {/* Goal 1 */}
        <div>
          <label
            htmlFor="goal1_description"
            className="block text-sm font-medium text-navy mb-1.5"
          >
            What's the first thing you want to build?{' '}
            <span className="text-text-secondary font-normal">(optional)</span>
          </label>
          <textarea
            id="goal1_description"
            {...register('goal1_description')}
            rows={3}
            placeholder="e.g. A landing page with a sign-up form that saves emails to the database"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
          />
        </div>

        {/* Goal 1 acceptance criteria — shows after goal 1 filled */}
        {goal1.trim().length > 0 && (
          <div>
            <label
              htmlFor="goal1_acceptance_criteria"
              className="block text-sm font-medium text-navy mb-1.5"
            >
              What does "done" look like for this?{' '}
              <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="goal1_acceptance_criteria"
              {...register('goal1_acceptance_criteria')}
              rows={3}
              placeholder='e.g. Page loads, form validates email, submission saves to database, confirmation message shows'
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
            />
          </div>
        )}

        {/* Goal 2 — shows after goal 1 filled */}
        {goal1.trim().length > 0 && (
          <div>
            <label
              htmlFor="goal2_description"
              className="block text-sm font-medium text-navy mb-1.5"
            >
              What comes next?{' '}
              <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="goal2_description"
              {...register('goal2_description')}
              rows={2}
              placeholder="e.g. User authentication with email and password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
            />
          </div>
        )}

        {/* Goal 3 — shows after goal 2 filled */}
        {goal2.trim().length > 0 && (
          <div>
            <label
              htmlFor="goal3_description"
              className="block text-sm font-medium text-navy mb-1.5"
            >
              And after that?{' '}
              <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="goal3_description"
              {...register('goal3_description')}
              rows={2}
              placeholder="e.g. Dashboard showing saved data with basic charts"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
            />
          </div>
        )}

        {/* Goal 4 — shows after goal 3 filled */}
        {goal3.trim().length > 0 && (
          <div>
            <label
              htmlFor="goal4_description"
              className="block text-sm font-medium text-navy mb-1.5"
            >
              One more?{' '}
              <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="goal4_description"
              {...register('goal4_description')}
              rows={2}
              placeholder="e.g. Email notifications when a new user signs up"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
            />
          </div>
        )}
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
