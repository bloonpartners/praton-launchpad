import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import type { WizardData } from '../../types/wizard'
import { WelcomeStep } from './WelcomeStep'

const defaultValues: WizardData = {
  consent: false,
  auth_type: '',
  api_key: '',
  project_name: '',
  project_slug: '',
  project_description: '',
  problem_statement: '',
  design_principles: [],
  anti_patterns: '',
  language: '',
  has_database: '',
  database_types: [],
  has_frontend: '',
  deploy_target: '',
  ssh_address: '',
  team_type: '',
  capabilities: [],
  goal1_title: '',
  goal1_done: '',
  goal2_title: '',
  goal3_title: '',
  goal4_title: '',
  perplexity_key: '',
  postgres_connection: '',
  shell_ssh: '',
}

const TOTAL_STEPS = 10

const steps = [
  WelcomeStep,
  // Screen 2-10 will be added here
]

export function WizardForm() {
  const [stepIndex, setStepIndex] = useState(0)

  const methods = useForm<WizardData>({
    defaultValues,
    mode: 'onChange',
  })

  const StepComponent = steps[stepIndex]

  const goNext = () => {
    if (stepIndex < TOTAL_STEPS - 1) {
      setStepIndex(stepIndex + 1)
    }
  }

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="w-full h-2 bg-navy/10">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-[640px]">
            {StepComponent && (
              <StepComponent onNext={goNext} onBack={goBack} />
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
