import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function isAdmin() {
  const jar = await cookies()
  return jar.get('movies-admin')?.value === 'true'
}

export async function GET() {
  const { data, error } = await supabase
    .from('series_progress')
    .select('*')
    .order('last_updated', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { tmdb_id, title, poster_url, current_season = 1, current_episode = 0,
          status = 'watching', total_seasons, total_episodes, notes } = body
  if (!tmdb_id || !title) return Response.json({ error: 'tmdb_id and title required' }, { status: 400 })

  const { data, error } = await supabase
    .from('series_progress')
    .upsert({ tmdb_id, title, poster_url, current_season, current_episode, status, total_seasons, total_episodes, notes, last_updated: new Date().toISOString() }, { onConflict: 'tmdb_id' })
    .select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
