import { supabase } from '@/lib/supabase'
import { getWatchProviders, tmdbImg, TmdbError } from '@/lib/tmdb'
import { dbError } from '@/lib/api-error'
import type { WatchProvidersLite } from '@/lib/movies.types'

const TTL_MS      = 12 * 60 * 60 * 1000   // streaming availability barely changes day to day
const CONCURRENCY = 6
const BUDGET_MS   = 9_000                 // return what we have rather than hang if TMDB is slow or unreachable

// Per server instance; the CDN caches the response too (see Cache-Control below)
const cache = new Map<string, { at: number; value: WatchProvidersLite | null }>()

/** Streaming availability for every saved title, keyed `movie:<id>` / `tv:<id>`. A missing key means "unknown". */
export async function GET() {
  const { data, error } = await supabase.from('watchlist').select('tmdb_id, type')
  if (error) return dbError(error)

  const wanted = new Map<string, { id: number; type: 'movie' | 'tv' }>()
  for (const r of data ?? []) {
    if (!r.tmdb_id) continue
    const type = r.type === 'series' ? 'tv' : 'movie'
    wanted.set(`${type}:${r.tmdb_id}`, { id: r.tmdb_id, type })
  }

  const result: Record<string, WatchProvidersLite | null> = {}
  const pending: [string, { id: number; type: 'movie' | 'tv' }][] = []
  const now = Date.now()
  for (const [key, w] of wanted) {
    const hit = cache.get(key)
    if (hit && now - hit.at < TTL_MS) result[key] = hit.value
    else pending.push([key, w])
  }

  let incomplete  = false
  let unreachable = 0
  const deadline  = now + BUDGET_MS
  let next        = 0

  async function worker() {
    while (next < pending.length) {
      if (Date.now() > deadline || unreachable >= 3) { incomplete = true; return }
      const [key, w] = pending[next++]
      try {
        const p = await getWatchProviders(w.id, w.type)
        const value: WatchProvidersLite = {
          streaming: p.flatrate.slice(0, 6).map(f => ({ name: f.provider_name, logo: tmdbImg(f.logo_path, 'w92') })),
          rentBuy:   p.flatrate.length === 0 && p.rent.length + p.buy.length > 0,
        }
        cache.set(key, { at: Date.now(), value })
        result[key] = value
      } catch (err) {
        if (err instanceof TmdbError && err.status === 404) {
          cache.set(key, { at: Date.now(), value: null })   // unknown id: don't ask again for a while
          result[key] = null
        } else {
          incomplete = true
          if (err instanceof TmdbError && err.unreachable) unreachable++
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker))

  return Response.json(result, {
    headers: { 'Cache-Control': incomplete ? 'no-store' : 'public, s-maxage=3600, stale-while-revalidate=43200' },
  })
}
