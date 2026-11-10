import { createClient } from '@supabase/supabase-js'

// A small fixed-window rate limiter that survives across serverless instances by keeping its counters in the
// `rate_limits` table (service role only). Until that table exists it falls back to per-instance memory, which is the
// old behaviour, so nothing breaks before the SQL is run.

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
const memory = new Map<string, { hits: number; start: number }>()

export interface RateResult { ok: boolean; retryAfter: number }

export const clientIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

function inMemory(key: string, max: number, windowMs: number, now: number): RateResult {
  const row = memory.get(key)
  if (!row || now - row.start >= windowMs) { memory.set(key, { hits: 1, start: now }); return { ok: true, retryAfter: 0 } }
  if (row.hits >= max) return { ok: false, retryAfter: Math.ceil((row.start + windowMs - now) / 1000) }
  row.hits += 1
  return { ok: true, retryAfter: 0 }
}

/** Counts one attempt for `key`; `ok` is false once more than `max` attempts have landed in the current window. */
export async function rateLimit(key: string, max: number, windowMs: number): Promise<RateResult> {
  const now = Date.now()
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: row, error } = await db.from('rate_limits').select('hits, window_start').eq('key', key).maybeSingle()
    if (error) return inMemory(key, max, windowMs, now)   // table not created yet

    if (!row) {
      const { error: insertError } = await db.from('rate_limits').insert({ key, hits: 1, window_start: new Date(now).toISOString() })
      if (!insertError) return { ok: true, retryAfter: 0 }
      continue   // someone else inserted first: read again
    }

    const start = new Date(row.window_start).getTime()
    if (now - start >= windowMs) {
      const { data: reset } = await db.from('rate_limits').update({ hits: 1, window_start: new Date(now).toISOString() })
        .eq('key', key).eq('hits', row.hits).eq('window_start', row.window_start).select('key')
      if (reset && reset.length > 0) return { ok: true, retryAfter: 0 }
      continue
    }
    if (row.hits >= max) return { ok: false, retryAfter: Math.ceil((start + windowMs - now) / 1000) }

    const { data: bumped } = await db.from('rate_limits').update({ hits: row.hits + 1 }).eq('key', key).eq('hits', row.hits).select('key')
    if (bumped && bumped.length > 0) return { ok: true, retryAfter: 0 }
  }
  return { ok: true, retryAfter: 0 }   // heavy contention: let the request through rather than lock a real person out
}

export const tooMany = (retryAfter: number, message = 'Too many attempts. Try again later.') =>
  Response.json({ error: message }, { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfter)) } })
