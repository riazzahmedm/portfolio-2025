import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, createAdminToken, isAdmin } from '@/lib/admin-auth'
import { clientIp, rateLimit } from '@/lib/rate-limit'

function passwordMatches(given: unknown, expected: string) {
  if (typeof given !== 'string') return false
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function GET() {
  return Response.json({ authed: await isAdmin() })
}

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_COOKIE_SECRET) {
    return Response.json({ error: 'Server misconfigured — ADMIN_PASSWORD or ADMIN_COOKIE_SECRET not set' }, { status: 500 })
  }

  // 10 attempts per address per 15 minutes, counted across all server instances (see lib/rate-limit.ts)
  const limit = await rateLimit(`admin-login:${clientIp(req)}`, 10, 15 * 60_000)
  if (!limit.ok) {
    return Response.json(
      { error: `Too many attempts — try again in ${Math.ceil(limit.retryAfter / 60)} min` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  const { password } = await req.json().catch(() => ({ password: undefined }))
  if (!passwordMatches(password, process.env.ADMIN_PASSWORD)) {
    return Response.json({ error: 'Wrong password' }, { status: 401 })
  }

  const jar = await cookies()
  jar.set(ADMIN_COOKIE, createAdminToken()!, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   ADMIN_SESSION_SECONDS,
    path:     '/',
  })
  return Response.json({ ok: true })
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  return Response.json({ ok: true })
}
