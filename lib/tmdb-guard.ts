import { isAdmin } from '@/lib/admin-auth'
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit'

/** The TMDB proxy routes are public (the movie preview needs them), so visitors get a generous per-address cap; the admin has none. */
export async function tmdbGuard(req: Request): Promise<Response | null> {
  if (await isAdmin()) return null
  const limit = await rateLimit(`tmdb:${clientIp(req)}`, 120, 60_000)
  return limit.ok ? null : tooMany(limit.retryAfter, 'Too many requests. Slow down a little.')
}

/** JSON that the CDN may keep for a while: the same TMDB lookup is not repeated for every visitor. */
export const cachedJson = (data: unknown, seconds = 3600) =>
  Response.json(data, { headers: { 'Cache-Control': `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 24}` } })
