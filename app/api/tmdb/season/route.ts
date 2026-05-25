import { getTVDetails, getTVSeason } from '@/lib/tmdb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id     = Number(searchParams.get('id'))
  const season = searchParams.get('season')

  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  if (season) {
    const data = await getTVSeason(id, Number(season))
    return Response.json(data)
  }

  const data = await getTVDetails(id)
  return Response.json(data)
}
