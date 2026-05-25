import { cookies } from 'next/headers'

const COOKIE = 'movies-admin'

/** GET — returns whether the admin cookie is set */
export async function GET() {
  const jar    = await cookies()
  const authed = jar.get(COOKIE)?.value === 'true'
  return Response.json({ authed })
}

/** POST { password } — sets the admin cookie on success */
export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== process.env.MOVIES_ADMIN_PASSWORD) {
    return Response.json({ error: 'Wrong password' }, { status: 401 })
  }
  const jar = await cookies()
  jar.set(COOKIE, 'true', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 30,  // 30 days
    path:     '/',
  })
  return Response.json({ ok: true })
}

/** DELETE — clears the admin cookie */
export async function DELETE() {
  const jar = await cookies()
  jar.delete(COOKIE)
  return Response.json({ ok: true })
}
