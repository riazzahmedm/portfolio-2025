import { getTVDetails, getTVSeason, tmdbErrorResponse } from '@/lib/tmdb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id     = Number(searchParams.get('id'))
  const season = searchParams.get('season')

  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  try {
    const data = season
      ? await getTVSeason(id, Number(season))
      : await getTVDetails(id)
    return Response.json(data)
  } catch (err) {
    return tmdbErrorResponse(err)
  }
}
