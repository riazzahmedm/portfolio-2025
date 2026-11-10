import { createAuthClient } from '@/lib/supabase'
import { setSessionCookie } from '@/lib/customer-auth'
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  if (!email || !token || token.length > 12 || email.length > 254) {
    return Response.json({ error: 'Email and token required' }, { status: 400 })
  }

  // The code is only a few digits, so cap guesses per email and per address
  const [byEmail, byIp] = await Promise.all([
    rateLimit(`otp-verify:${email}`, 8, 15 * 60_000),
    rateLimit(`otp-verify-ip:${clientIp(req)}`, 30, 15 * 60_000),
  ])
  if (!byEmail.ok || !byIp.ok) return tooMany(Math.max(byEmail.retryAfter, byIp.retryAfter), 'Too many attempts. Try again in a few minutes.')

  const { data, error } = await createAuthClient().auth.verifyOtp({ email, token, type: 'email' })
  if (error || !data.session) return Response.json({ error: 'Invalid or expired code' }, { status: 401 })

  await setSessionCookie(data.session.access_token, data.session.refresh_token)
  return Response.json({ ok: true, userId: data.user?.id })
}
