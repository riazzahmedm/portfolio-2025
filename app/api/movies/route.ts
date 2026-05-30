import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { enrich }   from '@/lib/tmdb'

async function isAdmin() {
  const jar = await cookies()
  return jar.get('movies-admin')?.value === 'true'
}

export async function GET() {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('watched_on', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Enrich with full TMDB metadata before storing
  if (body.tmdb_id) {
    try {
      const meta = await enrich(body.tmdb_id, body.type)
      // Strip TV-only fields that don't exist on the logs table
      const { number_of_seasons, number_of_episodes, seasons, ...rest } = meta
      void number_of_seasons; void number_of_episodes; void seasons
      Object.assign(body, rest)
    } catch {
      // Non-fatal — store whatever we have
    }
  }

  const { data, error } = await supabase.from('logs').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
