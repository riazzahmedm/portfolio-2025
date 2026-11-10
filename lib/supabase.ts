import { createClient } from '@supabase/supabase-js'

// All Supabase access is server-side (API routes only) — no NEXT_PUBLIC_ needed.
const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_ANON_KEY!

// The shared client never holds a login: on a warm server instance it would otherwise keep whichever customer verified
// last and send their token with every later query. Anything that signs a customer in uses `createAuthClient()` instead.
const noSession = { auth: { persistSession: false, autoRefreshToken: false } } as const

export const supabase = createClient(url, key, noSession)

/** A throwaway client for one sign-in, verify or refresh call. */
export const createAuthClient = () => createClient(url, key, noSession)
