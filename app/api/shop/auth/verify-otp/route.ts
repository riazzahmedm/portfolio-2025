import { supabase } from '@/lib/supabase'
import { setSessionCookie } from '@/lib/customer-auth'

export async function POST(req: Request) {
  const { email, token } = await req.json()
  if (!email || !token) {
    return Response.json({ error: 'Email and token required' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error || !data.session) {
    return Response.json({ error: error?.message ?? 'Invalid or expired code' }, { status: 401 })
  }

  await setSessionCookie(data.session.access_token)
  return Response.json({ ok: true, userId: data.user?.id })
}
