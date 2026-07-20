import { clearSessionCookie } from '@/lib/customer-auth'

export async function POST() {
  await clearSessionCookie()
  return Response.json({ ok: true })
}
