import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

const SESSION_COOKIE = 'shop-session'

export async function getCustomer(): Promise<{ id: string; email: string } | null> {
  const jar   = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { id: user.id, email: user.email! }
}

export async function setSessionCookie(accessToken: string) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}
