import { dbError } from '@/lib/api-error'
import { getPlaceDetail } from '@/lib/places-feed.server'

/** Public: one place with its visits, stats and must-order list. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const detail = await getPlaceDetail(id)
    return detail ? Response.json(detail) : Response.json({ error: 'Not found' }, { status: 404 })
  } catch (e) { return dbError(e as { message: string; code?: string }) }
}
