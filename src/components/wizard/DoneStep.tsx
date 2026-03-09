import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Download, Loader2 } from 'lucide-react'
import type { WizardData, TelemetryPayload } from '../../types/wizard'
import { generateFiles } from '../../generators/engine'
import { buildAndDownloadZip } from '../../lib/zipBuilder'
import { generatePdfBlob } from '../../generators/pdf/renderPdf'
import { sendTelemetry } from '../../lib/telemetry'

function buildTelemetryPayload(d: WizardData): TelemetryPayload {
  const goalsCount = [d.goal1_description, d.goal2_description, d.goal3_description, d.goal4_description]
    .filter((g) => g.trim().length > 0).length

  return {
    os: navigator.platform || 'unknown',
    auth_type: d.auth_type as 'subscription' | 'api_key',
    language: (d.language || 'not_sure') as TelemetryPayload['language'],
    has_database: d.has_database === 'yes',
    database_types: d.database_types,
    has_frontend: d.has_frontend === 'yes',
    deploy_target: (d.deploy_target || 'not_sure') as TelemetryPayload['deploy_target'],
    team_type: (d.team_type || 'alone') as TelemetryPayload['team_type'],
    design_principles: d.design_principles,
    capabilities: d.capabilities,
    goals_count: goalsCount,
    project_description: d.project_description,
  }
}

export function DoneStep() {
  const { watch } = useFormContext<WizardData>()
  const data = watch()

  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const goal1Title = data.goal1_description
    ? data.goal1_description.split('\n')[0]
    : ''

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const files = generateFiles(data)
      const slug = data.project_slug || 'my-project'

      // Generate PDF Getting Started Guide
      const blobFiles = []
      if (data.review_toggles?.['pdf_guide'] !== false) {
        const pdfBlob = await generatePdfBlob(data, files)
        blobFiles.push({ name: `${slug}/Setup/0 - READ ME FIRST.pdf`, blob: pdfBlob })
      }

      await buildAndDownloadZip(files, blobFiles, slug)
      setDownloaded(true)

      // Fire telemetry (fire-and-forget)
      sendTelemetry(buildTelemetryPayload(data), data.telemetry_consent)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <img
        src="/praton_logo.jpeg"
        alt="Praton"
        className="w-16 h-16 mb-6 rounded-lg"
      />

      {/* Title */}
      <h2 className="text-[32px] font-bold text-navy leading-tight mb-6">
        Your project is ready!
      </h2>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-3 px-10 py-4 rounded-lg bg-accent text-white text-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-70 cursor-pointer mb-8"
      >
        {downloading ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <Download size={22} />
        )}
        {downloading
          ? 'Generating...'
          : downloaded
            ? 'Download Again'
            : 'Download Project .zip'}
      </button>

      {/* Steps */}
      <div className="text-left max-w-md mb-8">
        <p className="text-sm font-semibold text-navy mb-3">After downloading:</p>
        <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
          <li>Unzip the folder</li>
          <li>Open the <span className="font-medium text-navy">Setup</span> folder and start with the PDF</li>
          <li>Double-click <span className="font-medium text-navy">"Start Claude Code"</span> — and start building</li>
        </ol>
      </div>

      {/* First task callout */}
      {goal1Title && (
        <div className="bg-bg-secondary rounded-lg px-5 py-3 mb-8 max-w-md">
          <p className="text-sm text-text-secondary">
            Your first task is already queued:{' '}
            <span className="font-medium text-navy">{goal1Title}</span>
          </p>
        </div>
      )}

      {/* Praton branding */}
      <div className="border-t border-gray-100 pt-6 mt-2">
        <p className="text-xs text-text-secondary">
          Built by{' '}
          <a
            href="https://praton.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-navy hover:underline"
          >
            Praton
          </a>
          . For hands-on workshops on AI-assisted development, visit{' '}
          <a
            href="https://praton.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            praton.com
          </a>
        </p>
      </div>
    </div>
  )
}
