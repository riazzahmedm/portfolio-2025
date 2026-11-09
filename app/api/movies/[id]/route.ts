import { supabase } from '@/lib/supabase'
import { enrich }   from '@/lib/tmdb'
import { isAdmin }  from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { LOGS_WITH_PLACE, placesNotReady } from '@/lib/movies-select'
import { visitsNotReady } from '@/lib/places-core'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const one = (cols: string) => supabase.from('logs').select(cols).eq('id', id).single()
  let r = await one(LOGS_WITH_PLACE)
  if (placesNotReady(r.error)) r = await one('*')
  if (r.error) return dbError(r.error, 404)
  return Response.json(r.data)
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
  if (error && 'theatre_vibe' in body && visitsNotReady(error)) return Response.json({ error: 'Run the Been there SQL block in supabase/migrations.sql first' }, { status: 503 })
  if (error) return dbError(error)
  // Hand back the row with its theatre attached, so the card can show it without a reload
  const { data: withPlace } = await supabase.from('logs').select(LOGS_WITH_PLACE).eq('id', id).single()
  return Response.json(withPlace ?? data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('logs').delete().eq('id', id)
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
