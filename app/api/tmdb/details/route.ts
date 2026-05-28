import { enrichMovie, enrichTV, getCredits, getWatchProviders } from '@/lib/tmdb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id   = Number(searchParams.get('id'))
  const type = (searchParams.get('type') ?? 'movie') as 'movie' | 'tv'

  if (!id) return Response.json(null, { status: 400 })

  const [meta, people, providers] = await Promise.all([
    type === 'tv' ? enrichTV(id) : enrichMovie(id),
    getCredits(id, type),
    getWatchProviders(id, type),
  ])

  return Response.json({ ...meta, people, providers })
}
