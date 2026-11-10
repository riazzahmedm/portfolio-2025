import { createAuthClient } from '@/lib/supabase'
import { dbError } from '@/lib/api-error'
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
  if (!email || email.length > 254) return Response.json({ error: 'Email required' }, { status: 400 })

  // One code a minute per email, and a cap per address so one visitor can't mail-bomb many inboxes
  const [byEmail, byIp] = await Promise.all([
    rateLimit(`otp-send:${email}`, 1, 60_000),
    rateLimit(`otp-send-ip:${clientIp(req)}`, 10, 60 * 60_000),
  ])
  if (!byEmail.ok) return tooMany(byEmail.retryAfter, `Please wait ${Math.max(1, byEmail.retryAfter)}s before requesting another code`)
  if (!byIp.ok) return tooMany(byIp.retryAfter, 'Too many codes requested. Try again later.')

  const { error } = await createAuthClient().auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
