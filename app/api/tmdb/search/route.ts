import { searchMovies, searchTV, getMovieById, getTVById } from '@/lib/tmdb'

/** Extract a numeric TMDB id from a URL like https://www.themoviedb.org/movie/79660-3 or a plain number */
function parseTmdbId(q: string): number | null {
  // plain number
  if (/^\d+$/.test(q.trim())) return parseInt(q.trim())
  // TMDB URL: /movie/12345 or /tv/12345
  const m = q.match(/themoviedb\.org\/(movie|tv)\/(\d+)/)
  if (m) return parseInt(m[2])
  return null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')   ?? ''
  const type  = searchParams.get('type') as 'movie' | 'tv' | null ?? 'movie'

  if (!query) return Response.json([])

  // If the user pasted a TMDB URL or numeric ID, fetch directly
  const tmdbId = parseTmdbId(query)
  if (tmdbId) {
    const result = type === 'tv' ? await getTVById(tmdbId) : await getMovieById(tmdbId)
    return Response.json(result ? [result] : [])
  }

  const results = type === 'tv' ? await searchTV(query) : await searchMovies(query)
  return Response.json(results)
}
