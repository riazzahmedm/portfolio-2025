import { enrichMovie, enrichTV, getCredits, getWatchProviders, tmdbErrorResponse } from '@/lib/tmdb'
import { tmdbGuard, cachedJson } from '@/lib/tmdb-guard'

export async function GET(req: Request) {
  const limited = await tmdbGuard(req)
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const id   = Number(searchParams.get('id'))
  const type = (searchParams.get('type') ?? 'movie') as 'movie' | 'tv'

  if (!id) return Response.json(null, { status: 400 })

  try {
    const [meta, people, providers] = await Promise.all([
      type === 'tv' ? enrichTV(id) : enrichMovie(id),
      getCredits(id, type),
      getWatchProviders(id, type),
    ])

    return cachedJson({ ...meta, people, providers })
  } catch (err) {
    return tmdbErrorResponse(err)
  }
}
