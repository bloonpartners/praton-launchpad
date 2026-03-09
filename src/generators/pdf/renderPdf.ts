import { pdf } from '@react-pdf/renderer'
import { createElement } from 'react'
import { GettingStartedGuide } from './GettingStartedGuide'
import type { WizardData } from '../../types/wizard'
import type { GeneratedFile } from '../engine'

async function loadLogoBase64(): Promise<string> {
  try {
    const response = await fetch('/praton_logo.jpeg')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

export async function generatePdfBlob(
  data: WizardData,
  files: GeneratedFile[]
): Promise<Blob> {
  const logoBase64 = await loadLogoBase64()
  const doc = createElement(GettingStartedGuide, { data, files, logoBase64 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(doc as any).toBlob()
  return blob
}
