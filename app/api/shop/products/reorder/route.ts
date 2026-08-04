import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

// Body: { ids: string[] } — ordered list of product IDs
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids)) return Response.json({ error: 'ids must be an array' }, { status: 400 })

  const updates = ids.map((id, i) =>
    supabase.from('shop_products').update({ sort_order: i }).eq('id', id)
  )
  await Promise.all(updates)
  return Response.json({ ok: true })
}
