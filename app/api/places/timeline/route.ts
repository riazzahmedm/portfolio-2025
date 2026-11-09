import { dbError } from '@/lib/api-error'
import { getTimeline } from '@/lib/places-feed.server'

/** Public: ?kind=&timing=&cursor=&limit= — visits and theatre movie visits, newest first, grouped by month. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  try {
    return Response.json(await getTimeline({
      kind:   sp.get('kind')?.trim().toLowerCase() || undefined,
      timing: sp.get('timing')?.trim().toLowerCase() || undefined,
      cursor: sp.get('cursor') || null,
      limit:  Number(sp.get('limit')) || undefined,
    }))
  } catch (e) { return dbError(e as { message: string; code?: string }) }
}
