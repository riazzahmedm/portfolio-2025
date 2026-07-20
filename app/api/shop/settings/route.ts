import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import type { ShopSettings } from '@/lib/shop.types'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('key, value')
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value])) as ShopSettings
  return Response.json(settings)
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body: Partial<ShopSettings> = await req.json()

  const upserts = Object.entries(body).map(([key, value]) => ({ key, value: value as string }))
  const { error } = await supabase
    .from('shop_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
