import { useFormContext } from 'react-hook-form'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

export function WelcomeStep({ onNext }: StepProps) {
  const { register } = useFormContext<WizardData>()

  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <img
        src="/praton_logo.jpeg"
        alt="Praton"
        className="w-20 h-20 mb-8 rounded-lg"
      />

      {/* Headline */}
      <p className="text-sm font-semibold tracking-wide uppercase text-text-secondary mb-2">
        Praton Launchpad
      </p>
      <h1 className="text-[32px] font-bold text-navy leading-tight mb-4">
        Set up a professional Claude Code project in minutes
      </h1>

      {/* Description */}
      <p className="text-lg text-text-secondary mb-8 max-w-lg">
        This tool creates a complete project folder with AI coding assistant
        configuration, quality checks, and starter documentation — all based on
        your project's needs.
      </p>

      {/* Telemetry checkbox */}
      <label className="flex gap-3 bg-bg-secondary rounded-lg p-5 mb-10 text-sm text-text-secondary leading-relaxed max-w-lg text-left cursor-pointer">
        <input
          type="checkbox"
          {...register('telemetry_consent')}
          className="mt-0.5 shrink-0 w-4 h-4 accent-accent cursor-pointer"
        />
        <div className="flex gap-2">
          <ShieldCheck size={18} className="shrink-0 mt-0.5 text-text-secondary" />
          <span>
            <strong className="text-navy">Help improve Praton Launchpad</strong> — Share
            anonymous setup stats (e.g., OS, selected options). No code,
            credentials, or personal data ever leaves your machine. Most users
            leave this on.
          </span>
        </div>
      </label>

      {/* Continue button */}
      <button
        type="button"
        onClick={onNext}
        className="flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors cursor-pointer"
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </div>
  )
}
