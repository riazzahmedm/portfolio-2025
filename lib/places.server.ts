import { createClient } from '@supabase/supabase-js'

/** Writes to places go through the service role; reads are open (see the policy in supabase/migrations.sql). */
export const placesDb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '')

/** Whitelists and trims the editable place fields. `full` (create) requires a kind and a name. */
export function sanitizePlace(body: unknown, full: boolean): { value: Record<string, unknown> } | { error: string } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}

  if ('kind' in b || full) {
    const kind = clip(b.kind, 24).toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!kind) return { error: 'A kind is required' }
    out.kind = kind
  }
  if ('name' in b || full) {
    const name = clip(b.name, 90)
    if (!name) return { error: 'A name is required' }
    out.name = name
  }
  for (const [key, max] of [['city', 60], ['area', 60], ['address', 200]] as const) {
    if (key in b) out[key] = clip(b[key], max) || null
  }
  if ('maps_url' in b) {
    const url = clip(b.maps_url, 500)
    if (url && !/^https?:\/\//i.test(url)) return { error: 'The map link must start with http' }
    out.maps_url = url || null
  }
  return { value: out }
}
