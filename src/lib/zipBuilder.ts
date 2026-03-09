import { downloadZip } from 'client-zip'
import type { GeneratedFile } from '../generators/engine'

export interface BlobFile {
  name: string
  blob: Blob
}

export async function buildAndDownloadZip(
  files: GeneratedFile[],
  blobFiles: BlobFile[],
  filename: string
): Promise<void> {
  const textEntries = files.map((f) => ({
    name: f.name,
    input: f.content,
  }))

  const blobEntries = blobFiles.map((f) => ({
    name: f.name,
    input: f.blob,
  }))

  const blob = await downloadZip([...textEntries, ...blobEntries]).blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
