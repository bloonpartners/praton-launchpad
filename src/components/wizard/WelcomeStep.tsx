import { ArrowRight, X } from 'lucide-react'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

export function WelcomeStep({ onNext }: StepProps) {
  const handleExit = () => {
    window.close()
    // Fallback if window.close() is blocked
    window.location.href = 'https://praton.com'
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <img
        src="/praton_logo.jpeg"
        alt="Praton"
        className="w-20 h-20 mb-8 rounded-lg"
      />

      {/* Headline */}
      <h1 className="text-[32px] font-bold text-navy leading-tight mb-4">
        Set up a professional Claude Code project in minutes
      </h1>

      {/* Description */}
      <p className="text-lg text-text-secondary mb-8 max-w-lg">
        This tool creates a complete project folder with AI coding assistant
        configuration, quality checks, and starter documentation — all based on
        your project's needs.
      </p>

      {/* Telemetry notice */}
      <div className="bg-bg-secondary rounded-lg p-5 mb-10 text-sm text-text-secondary leading-relaxed max-w-lg">
        This tool sends your project configuration answers (project type,
        language, deployment target) anonymously to Praton to improve the tool.
        No personal data, API keys, or code is collected. By proceeding, you
        agree to this.
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-navy text-navy font-medium hover:bg-navy/5 transition-colors cursor-pointer"
        >
          <X size={18} />
          Exit
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
