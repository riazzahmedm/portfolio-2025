import { supabase } from '@/lib/supabase'

const cooldowns = new Map<string, number>()
const COOLDOWN_MS = 60_000 // 1 minute per email

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email required' }, { status: 400 })
  }

  const key = email.toLowerCase().trim()
  const now = Date.now()
  const last = cooldowns.get(key)

  if (last && now - last < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - last)) / 1000)
    return Response.json({ error: `Please wait ${wait}s before requesting another code` }, { status: 429 })
  }

  cooldowns.set(key, now)
  // prune stale entries
  for (const [e, t] of cooldowns) {
    if (now - t > COOLDOWN_MS * 2) cooldowns.delete(e)
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: key,
    options: { shouldCreateUser: true },
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
