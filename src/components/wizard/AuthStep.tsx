import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Key,
  HelpCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import type { WizardData } from '../../types/wizard'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

type AuthChoice = 'subscription' | 'api_key' | 'neither'

export function AuthStep({ onNext, onBack }: StepProps) {
  const { setValue, watch } = useFormContext<WizardData>()
  const authType = watch('auth_type')

  const [selected, setSelected] = useState<AuthChoice>(
    authType === 'subscription'
      ? 'subscription'
      : authType === 'api_key'
        ? 'api_key'
        : ''  as AuthChoice
  )
  const [apiKeyInput, setApiKeyInput] = useState(watch('api_key') || '')
  const [verifyState, setVerifyState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSelect = (choice: AuthChoice) => {
    setSelected(choice)
    if (choice === 'subscription') {
      setValue('auth_type', 'subscription')
      setValue('api_key', '')
    } else if (choice === 'api_key') {
      setValue('auth_type', 'api_key')
    } else {
      setValue('auth_type', '')
      setValue('api_key', '')
    }
    setVerifyState('idle')
  }

  const handleVerify = async () => {
    if (!apiKeyInput.trim()) return
    setVerifyState('loading')

    // Verify key format (sk-ant-...) — we don't actually call the API from the browser
    const looksValid = apiKeyInput.trim().startsWith('sk-ant-')
    await new Promise((r) => setTimeout(r, 800))

    if (looksValid) {
      setVerifyState('success')
      setValue('api_key', apiKeyInput.trim())
      setValue('auth_type', 'api_key')
    } else {
      setVerifyState('error')
    }
  }

  const canContinue =
    selected === 'subscription' ||
    (selected === 'api_key' && verifyState === 'success')

  return (
    <div className="flex flex-col">
      {/* Header */}
      <h2 className="text-[28px] font-bold text-navy leading-tight mb-2">
        Claude Code Authentication
      </h2>
      <p className="text-base text-text-secondary mb-8">
        To use your AI coding assistant, you need a Claude account.
      </p>

      {/* Three cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Card 1: Subscription */}
        <button
          type="button"
          onClick={() => handleSelect('subscription')}
          className={`flex flex-col items-center gap-3 p-5 rounded-lg border-2 text-left transition-all cursor-pointer ${
            selected === 'subscription'
              ? 'border-accent bg-accent/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <CreditCard
            size={28}
            className={selected === 'subscription' ? 'text-accent' : 'text-text-secondary'}
          />
          <span className="text-sm font-semibold text-navy text-center leading-snug">
            I have a Claude Pro or Max subscription
          </span>
        </button>

        {/* Card 2: API Key */}
        <button
          type="button"
          onClick={() => handleSelect('api_key')}
          className={`flex flex-col items-center gap-3 p-5 rounded-lg border-2 text-left transition-all cursor-pointer ${
            selected === 'api_key'
              ? 'border-accent bg-accent/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <Key
            size={28}
            className={selected === 'api_key' ? 'text-accent' : 'text-text-secondary'}
          />
          <span className="text-sm font-semibold text-navy text-center leading-snug">
            I have an Anthropic API key
          </span>
        </button>

        {/* Card 3: Neither */}
        <button
          type="button"
          onClick={() => handleSelect('neither')}
          className={`flex flex-col items-center gap-3 p-5 rounded-lg border-2 text-left transition-all cursor-pointer ${
            selected === 'neither'
              ? 'border-accent bg-accent/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <HelpCircle
            size={28}
            className={selected === 'neither' ? 'text-accent' : 'text-text-secondary'}
          />
          <span className="text-sm font-semibold text-navy text-center leading-snug">
            I don't have either
          </span>
        </button>
      </div>

      {/* Expanded content based on selection */}
      {selected === 'subscription' && (
        <div className="bg-bg-secondary rounded-lg p-5 mb-8 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-navy font-medium mb-1">You're all set!</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              You'll log in when you first open the project. Nothing to configure
              now. Usage is included in your subscription.
            </p>
          </div>
        </div>
      )}

      {selected === 'api_key' && (
        <div className="bg-bg-secondary rounded-lg p-5 mb-8">
          <label className="block text-sm font-medium text-navy mb-2">
            Anthropic API Key
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value)
                setVerifyState('idle')
              }}
              placeholder="sk-ant-..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={!apiKeyInput.trim() || verifyState === 'loading'}
              className="px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {verifyState === 'loading' && <Loader2 size={14} className="animate-spin" />}
              Verify
            </button>
          </div>
          {verifyState === 'success' && (
            <p className="text-sm text-green-600 flex items-center gap-1.5 mb-3">
              <CheckCircle size={14} /> Key format verified
            </p>
          )}
          {verifyState === 'error' && (
            <p className="text-sm text-red-600 mb-3">
              Key should start with "sk-ant-". Check your key and try again.
            </p>
          )}
          <p className="text-xs text-text-secondary mb-2">
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-0.5"
            >
              console.anthropic.com <ExternalLink size={11} />
            </a>
          </p>
          <p className="text-xs text-text-secondary">
            API usage is pay-per-use. Set a spending limit in your Anthropic
            console to avoid surprises.
          </p>
        </div>
      )}

      {selected === 'neither' && (
        <div className="bg-bg-secondary rounded-lg p-5 mb-8">
          <p className="text-sm font-medium text-navy mb-4">
            Choose the option that works best for you:
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Subscription option */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={16} className="text-accent" />
                <span className="text-sm font-semibold text-navy">Subscription</span>
              </div>
              <p className="text-2xl font-bold text-navy mb-2">17€<span className="text-sm font-normal text-text-secondary">/mo</span></p>
              <ul className="text-xs text-text-secondary space-y-1.5 mb-4">
                <li>Simple setup</li>
                <li>Usage included</li>
                <li>Recommended for beginners</li>
              </ul>
              <a
                href="https://claude.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
              >
                Sign up <ExternalLink size={12} className="inline ml-1" />
              </a>
            </div>

            {/* API option */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key size={16} className="text-accent" />
                <span className="text-sm font-semibold text-navy">API</span>
              </div>
              <p className="text-2xl font-bold text-navy mb-2">Pay per use</p>
              <ul className="text-xs text-text-secondary space-y-1.5 mb-4">
                <li>Flexible pricing</li>
                <li>Pay only for what you use</li>
                <li>Better for heavy use</li>
              </ul>
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-3 py-2 border border-navy text-navy text-sm font-medium rounded-lg hover:bg-navy/5 transition-colors"
              >
                Sign up <ExternalLink size={12} className="inline ml-1" />
              </a>
            </div>
          </div>
          <p className="text-sm text-text-secondary text-center">
            After signing up, select one of the first two options above to continue.
          </p>
        </div>
      )}

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
