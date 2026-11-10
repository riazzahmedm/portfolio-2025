import { cookies } from 'next/headers'
import { supabase, createAuthClient } from '@/lib/supabase'

const SESSION_COOKIE = 'shop-session'
const REFRESH_COOKIE = 'shop-refresh'
const THIRTY_DAYS    = 60 * 60 * 24 * 30

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge,
  path:     '/',
})

/**
 * The signed-in customer, or null. The access token only lives an hour, so when it has expired the refresh token
 * is used to get a new pair (and the cookies are updated where the framework allows it).
 */
export async function getCustomer(): Promise<{ id: string; email: string } | null> {
  const jar     = await cookies()
  const token   = jar.get(SESSION_COOKIE)?.value
  const refresh = jar.get(REFRESH_COOKIE)?.value

  if (token) {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) return { id: user.id, email: user.email! }
  }
  if (!refresh) return null

  const { data, error } = await createAuthClient().auth.refreshSession({ refresh_token: refresh })
  if (error || !data.session || !data.user) return null
  try { await setSessionCookie(data.session.access_token, data.session.refresh_token) } catch { /* read-only context: the next route handler will refresh again */ }
  return { id: data.user.id, email: data.user.email! }
}

export async function setSessionCookie(accessToken: string, refreshToken?: string | null) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, accessToken, cookieOptions(THIRTY_DAYS))
  if (refreshToken) jar.set(REFRESH_COOKIE, refreshToken, cookieOptions(THIRTY_DAYS))
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(REFRESH_COOKIE)
}
