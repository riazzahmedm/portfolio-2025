import { getTVDetails, getTVSeason, tmdbErrorResponse } from '@/lib/tmdb'
import { tmdbGuard, cachedJson } from '@/lib/tmdb-guard'

export async function GET(req: Request) {
  const limited = await tmdbGuard(req)
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const id     = Number(searchParams.get('id'))
  const season = searchParams.get('season')

  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  try {
    const data = season
      ? await getTVSeason(id, Number(season))
      : await getTVDetails(id)
    return cachedJson(data)
  } catch (err) {
    return tmdbErrorResponse(err)
  }
}
