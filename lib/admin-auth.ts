import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

export const ADMIN_COOKIE = 'admin'
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 30

const secret = () => process.env.ADMIN_COOKIE_SECRET

function sign(payload: string, key: string) {
  return createHmac('sha256', key).update(payload).digest('hex')
}

/** Creates a signed, expiring session token: `<expiresAtMs>.<hmac>`. Null if no secret is configured. */
export function createAdminToken(): string | null {
  const key = secret()
  if (!key) return null
  const exp = String(Date.now() + ADMIN_SESSION_SECONDS * 1000)
  return `${exp}.${sign(exp, key)}`
}

function verifyAdminToken(token: string | undefined): boolean {
  const key = secret()
  if (!key || !token) return false

  const [exp, sig] = token.split('.')
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false

  const expected = Buffer.from(sign(exp, key))
  const given    = Buffer.from(sig)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value)
}
