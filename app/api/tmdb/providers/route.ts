import { getWatchProviders, tmdbErrorResponse } from '@/lib/tmdb'
import { tmdbGuard, cachedJson } from '@/lib/tmdb-guard'

export async function GET(req: Request) {
  const limited = await tmdbGuard(req)
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const id   = Number(searchParams.get('id'))
  const type = (searchParams.get('type') ?? 'movie') as 'movie' | 'tv'

  if (!id) return Response.json(null, { status: 400 })

  try {
    return cachedJson(await getWatchProviders(id, type), 1800)
  } catch (err) {
    return tmdbErrorResponse(err)
  }
}
