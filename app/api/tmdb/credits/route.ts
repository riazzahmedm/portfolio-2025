import { getCredits, tmdbErrorResponse } from '@/lib/tmdb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id   = Number(searchParams.get('id'))
  const type = (searchParams.get('type') ?? 'movie') as 'movie' | 'tv'

  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  try {
    return Response.json(await getCredits(id, type))
  } catch (err) {
    return tmdbErrorResponse(err)
  }
}
