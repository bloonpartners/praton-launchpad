import { useFormContext } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProjectIdentityStep({ onNext, onBack }: StepProps) {
  const { register, watch, setValue } = useFormContext<WizardData>()

  const projectName = watch('project_name')
  const projectDescription = watch('project_description')

  const slug = toSlug(projectName || '')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('project_name', name)
    setValue('project_slug', toSlug(name))
  }

  const canContinue =
    projectName.trim().length > 0 &&
    projectDescription.trim().length >= 20

  return (
    <div className="flex flex-col">
      <h2 className="text-[28px] font-bold text-navy leading-tight mb-2">
        Project Identity
      </h2>
      <p className="text-base text-text-secondary mb-8">
        This becomes the project brief Claude Code reads at the start of every session.
      </p>

      <div className="space-y-6 mb-8">
        {/* Project Name */}
        <div>
          <label htmlFor="project_name" className="block text-sm font-medium text-navy mb-1.5">
            What is the name of your project? <span className="text-accent">*</span>
          </label>
          <input
            id="project_name"
            type="text"
            {...register('project_name')}
            onChange={handleNameChange}
            placeholder="My Cool App"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          {slug && (
            <p className="text-xs text-text-secondary mt-1.5">
              Your project folder will be called: <span className="font-mono text-navy">{slug}</span>
            </p>
          )}
        </div>

        {/* Project Description */}
        <div>
          <label htmlFor="project_description" className="block text-sm font-medium text-navy mb-1.5">
            Describe your project <span className="text-accent">*</span>
          </label>
          <p className="text-xs text-text-secondary mb-1.5">Include what it does and who uses it.</p>
          <textarea
            id="project_description"
            {...register('project_description')}
            rows={3}
            placeholder="e.g. A booking platform for freelance yoga teachers. Teachers create class schedules, students book and pay online."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
          />
          {projectDescription.trim().length > 0 && projectDescription.trim().length < 20 && (
            <p className="text-xs text-accent mt-1">
              Minimum 20 characters ({20 - projectDescription.trim().length} more needed)
            </p>
          )}
        </div>

        {/* Problem Statement */}
        <div>
          <label htmlFor="problem_statement" className="block text-sm font-medium text-navy mb-1.5">
            What does it replace or improve? <span className="text-text-secondary font-normal">(optional)</span>
          </label>
          <p className="text-xs text-text-secondary mb-1.5">Include what exists today and what's wrong with it.</p>
          <textarea
            id="problem_statement"
            {...register('problem_statement')}
            rows={3}
            placeholder="e.g. Teachers currently manage bookings via WhatsApp and spreadsheets. There's no way for students to see availability or pay online."
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
