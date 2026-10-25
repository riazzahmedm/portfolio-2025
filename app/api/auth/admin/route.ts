import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, createAdminToken, isAdmin } from '@/lib/admin-auth'

const MAX_FAILURES = 5
const WINDOW_MS    = 15 * 60_000

// Best-effort limiter: state is per server instance, so it slows guessing but isn't a hard global cap.
const failures = new Map<string, { count: number; resetAt: number }>()

function clientKey(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

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

  const key   = clientKey(req)
  const now   = Date.now()
  const entry = failures.get(key)
  if (entry && entry.resetAt > now && entry.count >= MAX_FAILURES) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return Response.json(
      { error: `Too many attempts — try again in ${Math.ceil(retryAfter / 60)} min` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  const { password } = await req.json().catch(() => ({ password: undefined }))
  if (!passwordMatches(password, process.env.ADMIN_PASSWORD)) {
    const live = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + WINDOW_MS }
    live.count += 1
    failures.set(key, live)
    return Response.json({ error: 'Wrong password' }, { status: 401 })
  }

  failures.delete(key)
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
