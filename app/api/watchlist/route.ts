import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'

export async function GET() {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .order('added_at', { ascending: false })
  if (error) return dbError(error)
  return Response.json(data ?? [])
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { data, error } = await supabase
    .from('watchlist')
    .upsert([body], { onConflict: 'tmdb_id', ignoreDuplicates: false })
    .select()
    .single()
  if (error) return dbError(error)
  return Response.json(data, { status: 201 })
}
