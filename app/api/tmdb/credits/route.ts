import { getCredits, tmdbErrorResponse } from '@/lib/tmdb'
import { tmdbGuard, cachedJson } from '@/lib/tmdb-guard'

export async function GET(req: Request) {
  const limited = await tmdbGuard(req)
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const id   = Number(searchParams.get('id'))
  const type = (searchParams.get('type') ?? 'movie') as 'movie' | 'tv'

  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  try {
    return cachedJson(await getCredits(id, type))
  } catch (err) {
    return tmdbErrorResponse(err)
  }
}
