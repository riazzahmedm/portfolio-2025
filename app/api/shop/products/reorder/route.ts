import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'

// Body: { ids: string[] } — ordered list of product IDs
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const ids: unknown = body?.ids
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) return Response.json({ error: 'ids must be an array of ids' }, { status: 400 })

  const results = await Promise.all((ids as string[]).map((id, i) => supabase.from('shop_products').update({ sort_order: i }).eq('id', id)))
  const failed = results.find(r => r.error)
  if (failed?.error) return dbError(failed.error)
  return Response.json({ ok: true })
}
