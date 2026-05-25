import { createClient } from '@supabase/supabase-js'

// All Supabase access is server-side (API routes only) — no NEXT_PUBLIC_ needed.
const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)
