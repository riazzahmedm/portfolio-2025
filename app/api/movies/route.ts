import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { enrich }   from '@/lib/tmdb'

async function isAdmin() {
  const jar = await cookies()
  return jar.get('movies-admin')?.value === 'true'
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  const [main, movies, series] = await Promise.all([
    supabase.from('logs').select('*', { count: 'exact' }).order('watched_on', { ascending: false }).range(from, to),
    supabase.from('logs').select('*', { count: 'exact', head: true }).eq('type', 'movie'),
    supabase.from('logs').select('*', { count: 'exact', head: true }).eq('type', 'series'),
  ])

  if (main.error) return Response.json({ error: main.error.message }, { status: 500 })
  return Response.json({
    data:         main.data,
    total:        main.count   ?? 0,
    movieTotal:   movies.count ?? 0,
    seriesTotal:  series.count ?? 0,
    page,
    limit,
  })
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
