import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import type { WizardData } from '../../types/wizard'
import { WelcomeStep } from './WelcomeStep'
import { AuthStep } from './AuthStep'
import { ProjectIdentityStep } from './ProjectIdentityStep'
import { DesignPrinciplesStep } from './DesignPrinciplesStep'
import { TechnicalSetupStep } from './TechnicalSetupStep'
import { CapabilitiesStep } from './CapabilitiesStep'
import { GoalsStep } from './GoalsStep'
import { ReviewStep } from './ReviewStep'
import { DoneStep } from './DoneStep'

function detectOS(): 'windows' | 'mac' {
  const p = navigator.platform?.toLowerCase() || ''
  if (p.includes('win')) return 'windows'
  return 'mac'
}

const defaultValues: WizardData = {
  consent: false,
  telemetry_consent: true,
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
  team_type: '',
  capabilities: [],
  goal1_description: '',
  goal1_acceptance_criteria: '',
  goal2_description: '',
  goal3_description: '',
  goal4_description: '',
  detected_os: detectOS(),
  review_toggles: {},
}

const TOTAL_STEPS = 9

const steps = [
  WelcomeStep,         // 0
  AuthStep,            // 1
  ProjectIdentityStep, // 2
  DesignPrinciplesStep, // 3
  TechnicalSetupStep,  // 4
  CapabilitiesStep,    // 5
  GoalsStep,           // 6
  ReviewStep,          // 7
  DoneStep,            // 8
]

export function WizardForm() {
  const [stepIndex, setStepIndex] = useState(0)

  const methods = useForm<WizardData>({
    defaultValues,
    mode: 'onChange',
  })

  const StepComponent = steps[stepIndex]

  const goNext = () => {
    if (stepIndex + 1 < TOTAL_STEPS) {
      setStepIndex(stepIndex + 1)
    }
  }

  const goBack = () => {
    if (stepIndex - 1 >= 0) {
      setStepIndex(stepIndex - 1)
    }
  }

  const isLastStep = stepIndex === TOTAL_STEPS - 1

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col">
        {/* Progress bar — hidden on done screen */}
        {!isLastStep && (
          <div className="w-full h-2 bg-navy/10">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-[640px]">
            {StepComponent && (
              <StepComponent onNext={goNext} onBack={goBack} />
            )}

            {/* Exit link — hidden on done screen */}
            {!isLastStep && (
              <div className="text-center mt-8">
                <a
                  href="https://praton.com"
                  className="text-sm text-gray-400 no-underline hover:underline"
                >
                  Exit
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
