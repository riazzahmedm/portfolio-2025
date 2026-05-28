import { getWatchProviders } from '@/lib/tmdb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id   = Number(searchParams.get('id'))
  const type = (searchParams.get('type') ?? 'movie') as 'movie' | 'tv'

  if (!id) return Response.json(null, { status: 400 })

  const providers = await getWatchProviders(id, type)
  return Response.json(providers)
}
