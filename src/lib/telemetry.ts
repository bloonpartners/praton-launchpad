import type { TelemetryPayload } from '../types/wizard'

const SUPABASE_URL = ''
const SUPABASE_ANON_KEY = ''

export async function sendTelemetry(data: TelemetryPayload): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/wizard_completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    })
  } catch {
    // Silently fail — telemetry never blocks the user
  }
}
