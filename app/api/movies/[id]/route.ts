import { supabase } from '@/lib/supabase'
import { enrich }   from '@/lib/tmdb'
import { isAdmin }  from '@/lib/admin-auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabase.from('logs').select('*').eq('id', id).single()
  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body   = await req.json()

  // If a new tmdb_id is being set, re-enrich with full TMDB metadata
  if (body.tmdb_id) {
    try {
      const meta = await enrich(body.tmdb_id, body.type ?? 'movie')
      Object.assign(body, meta)
    } catch { /* non-fatal */ }
  }

  const { data, error } = await supabase
    .from('logs').update(body).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('logs').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
