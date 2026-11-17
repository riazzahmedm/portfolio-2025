import { dbError } from '@/lib/api-error'
import { getRanking } from '@/lib/places-feed.server'

/** Public: ?kind=&timing=&vibe=&city=&q= — one row per place, most visited first. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  try {
    return Response.json(await getRanking({
      kind:   sp.get('kind')?.trim().toLowerCase() || undefined,
      timing: sp.get('timing')?.trim().toLowerCase() || undefined,
      vibe:   sp.get('vibe')?.trim().toLowerCase() || undefined,
      city:   sp.get('city')?.trim().slice(0, 60) || undefined,
      q:      sp.get('q')?.trim().slice(0, 80) || undefined,
    }))
  } catch (e) { return dbError(e as { message: string; code?: string }) }
}
