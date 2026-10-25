import { supabase } from '@/lib/supabase'
import { enrich }   from '@/lib/tmdb'
import { isAdmin }  from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'

// Entries still being watched live in the "Now watching" strip, not in the log, until they are marked watched.
// (A plain neq would also drop rows whose status is null.)
const NOT_IN_PROGRESS = 'status.is.null,status.neq.watching'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  // ?status=watching[&type=movie] — a short, newest-first list for the "now watching" strip
  const status = searchParams.get('status')
  if (status === 'watched' || status === 'watching' || status === 'dropped') {
    let q = supabase
      .from('logs')
      .select('id, tmdb_id, title, poster_url, backdrop_url, year, platform, watched_on, created_at, type, status')
      .eq('status', status)
      .order('watched_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(24)
    const t = searchParams.get('type')
    if (t === 'movie' || t === 'series' || t === 'episode') q = q.eq('type', t)
    const { data, error } = await q
    if (error) return dbError(error)
    return Response.json(data ?? [])
  }

  // ?all=true — returns every record (used by /wrapped stats page)
  if (searchParams.get('all') === 'true') {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .or(NOT_IN_PROGRESS)
      .order('watched_on', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) return dbError(error)
    return Response.json(data ?? [])
  }

  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  const type  = searchParams.get('type')
  const baseQ = supabase.from('logs').select('*', { count: 'exact' })
    .or(NOT_IN_PROGRESS)
    .order('watched_on', { ascending: false })
    .order('created_at', { ascending: false })
  const mainQ = (type === 'movie' || type === 'series') ? baseQ.eq('type', type) : baseQ
  const [main, movies, series] = await Promise.all([
    mainQ.range(from, to),
    supabase.from('logs').select('*', { count: 'exact', head: true }).or(NOT_IN_PROGRESS).eq('type', 'movie'),
    supabase.from('logs').select('*', { count: 'exact', head: true }).or(NOT_IN_PROGRESS).eq('type', 'series'),
  ])

  if (main.error) return dbError(main.error)
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
  if (error) return dbError(error)

  // Remove from Watch Later if it was queued there
  if (body.tmdb_id) {
    await supabase.from('watchlist').delete().eq('tmdb_id', body.tmdb_id)
  }

  return Response.json(data, { status: 201 })
}
